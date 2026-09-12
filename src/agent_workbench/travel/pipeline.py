"""Multi-agent travel pipeline:

Intake → Researcher → ItineraryPlanner → Logistics → Budget → Critic (one revision)

Reliability rules (also embedded in prompts):
- Never invent specific live hotel prices as facts; label 估算
- Prefer citing source URLs from research
- Critic must flag unrealistic same-day long-distance hops
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any

from agent_workbench.llm import ChatMessage, LLMClient, MockLLM, build_llm
from agent_workbench.trace import TraceLogger
from agent_workbench.travel.budget import build_budget, scale_to_budget
from agent_workbench.travel.mock_plans import MockTravelPlanner
from agent_workbench.travel.render import render_trip_markdown
from agent_workbench.travel.research import research_destination, sources_as_context
from agent_workbench.travel.schema import (
    Activity,
    DayPlan,
    LodgingOption,
    SourceRef,
    TransportLeg,
    TripPlan,
    TripRequest,
)

STAGE_ORDER = ("intake", "researcher", "itinerary", "logistics", "budget", "critic")


@dataclass
class StageTrace:
    stage: str
    message: str
    data: dict[str, Any] = field(default_factory=dict)


@dataclass
class TravelPipelineResult:
    plan: TripPlan
    markdown: str
    stages: list[StageTrace]
    run_id: str
    trace_path: str


def _extract_json_object(text: str) -> dict[str, Any] | None:
    """Best-effort extract of a JSON object from LLM output."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        obj = json.loads(text)
        return obj if isinstance(obj, dict) else None
    except json.JSONDecodeError:
        pass
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None
    try:
        obj = json.loads(m.group(0))
        return obj if isinstance(obj, dict) else None
    except json.JSONDecodeError:
        return None


class TravelPipeline:
    """Orchestrates travel planning stages with TraceLogger."""

    def __init__(
        self,
        *,
        mock: bool | None = None,
        llm: LLMClient | None = None,
        tracer: TraceLogger | None = None,
        use_web: bool = True,
    ) -> None:
        self.mock = mock
        self.llm = llm or build_llm(mock=mock)
        self.tracer = tracer or TraceLogger()
        self.use_web = use_web
        self._mock_planner = MockTravelPlanner()
        self.stages: list[StageTrace] = []

    def _log_stage(self, stage: str, message: str, **data: Any) -> None:
        self.stages.append(StageTrace(stage=stage, message=message, data=data))
        self.tracer.log("travel_stage", stage=stage, message=message, **data)

    # ----- stages -----

    def stage_intake(self, req: TripRequest) -> TripRequest:
        self._log_stage(
            "intake",
            f"受理需求：{req.destination} {req.days}日 / {req.travelers}人 / 预算={req.budget_cny}",
            request=req.model_dump(),
        )
        # Normalize pace & prefs lightly
        prefs = [p.strip() for p in req.preferences if p and p.strip()]
        return req.model_copy(update={"preferences": prefs, "destination": req.destination.strip()})

    def stage_researcher(self, req: TripRequest) -> list[SourceRef]:
        if isinstance(self.llm, MockLLM) or self.mock:
            # Offline: skip live web; curated plans already carry SourceRefs
            self._log_stage("researcher", "Mock 模式：跳过实时网页检索，使用样本内置来源。", count=0)
            return []
        sources = research_destination(req.destination, preferences=req.preferences, use_web=self.use_web)
        self._log_stage("researcher", f"检索到 {len(sources)} 条来源。", count=len(sources), urls=[s.url for s in sources[:8]])
        return sources

    def stage_itinerary(self, req: TripRequest, sources: list[SourceRef]) -> TripPlan:
        if isinstance(self.llm, MockLLM) or self.mock:
            plan = self._mock_planner.plan(req)
            self._log_stage("itinerary", "MockTravelPlanner 生成示例行程。", days=len(plan.days), mock=True)
            return plan

        ctx = sources_as_context(sources)
        system = (
            "你是资深旅行社行程策划。根据用户需求与资料，输出严格 JSON（不要 Markdown 围栏外的文字）。\n"
            "规则：\n"
            "1) 酒店与门票价格必须标注为估算，禁止把虚构数字写成「实时报价」。\n"
            "2) 尽量引用资料中的 URL。\n"
            "3) 同一天不要安排不合理的超长跨城（如东京↔京都往返、大理与丽江来回跑）。\n"
            "JSON 模式：{\n"
            '  "summary": str, "highlights": [str],\n'
            '  "days": [{"day":1,"title":str,"theme":str,"activities":[{"name":str,"kind":"sight|food|shop|rest|other",'
            '"start_time":str,"duration_hours":number,"area":str,"notes":str,"estimated_cost_cny":number,"source_urls":[str]}],'
            '"transports":[{"mode":str,"from_place":str,"to_place":str,"duration_hours":number,"estimated_cost_cny":number,"notes":str}],'
            '"meals_note":str,"estimated_day_cost_cny":number,"tips":[str]}],\n'
            '  "lodging":[{"name":str,"area":str,"nights":number,"estimated_nightly_cny":number,"style":str,"notes":str}],\n'
            '  "warnings":[str]\n'
            "}"
        )
        user = (
            f"需求：{req.model_dump_json()}\n\n资料：\n{ctx}\n\n"
            f"请规划 {req.days} 天行程，人数 {req.travelers}，节奏 {req.pace}。"
        )
        raw = self.llm.chat([ChatMessage(role="system", content=system), ChatMessage(role="user", content=user)])
        data = _extract_json_object(raw)
        if not data:
            self._log_stage("itinerary", "LLM JSON 解析失败，回退 MockTravelPlanner。", error="parse")
            plan = self._mock_planner.plan(req)
            plan.warnings.append("LLM 输出无法解析，已回退示例/通用模板。")
            return plan
        plan = self._plan_from_partial(req, data, sources)
        self._log_stage("itinerary", "LLM 行程草稿完成。", days=len(plan.days))
        return plan

    def stage_logistics(self, plan: TripPlan) -> TripPlan:
        """Fill long-haul stubs / ensure lodging nights."""
        req = plan.request
        plan = plan.model_copy(deep=True)
        if not plan.long_haul and req.origin:
            mode = "flight"
            cost = 1800.0 * req.travelers if any(x in req.destination for x in ("东京", "大阪", "首尔", "香港")) else 900.0 * req.travelers
            plan.long_haul.append(
                TransportLeg(
                    mode=mode,  # type: ignore[arg-type]
                    from_place=req.origin,
                    to_place=req.destination,
                    duration_hours=3.0,
                    estimated_cost_cny=cost,
                    notes="长途交通为估算，非实时票价。",
                )
            )
        nights = max(1, req.days - 1) if req.days > 1 else 1
        if not plan.lodging:
            plan.lodging.append(
                LodgingOption(
                    name=f"{req.destination} 中档住宿（估算）",
                    area="交通便利区",
                    nights=nights,
                    estimated_nightly_cny=320,
                    style="酒店/民宿",
                    notes="估算 · 请以 OTA 为准",
                )
            )
        self._log_stage(
            "logistics",
            f"后勤补全：长途 {len(plan.long_haul)} 段，住宿方案 {len(plan.lodging)} 个。",
        )
        return plan

    def stage_budget(self, plan: TripPlan) -> TripPlan:
        plan = plan.model_copy(deep=True)
        budget = build_budget(plan.request, plan.days, plan.lodging, plan.long_haul)
        if plan.request.budget_cny is not None and budget.total > plan.request.budget_cny:
            budget = scale_to_budget(budget, plan.request.budget_cny)
            budget.per_person = round(budget.total / max(1, plan.request.travelers), 2)
            plan.warnings.append("预算阶段：估算超支，已做比例下调建议（仍为估算）。")
        plan.budget = budget
        self._log_stage("budget", f"预算估算合计 ¥{budget.total:.0f}（人均 ¥{budget.per_person:.0f}）", total=budget.total)
        return plan

    def stage_critic(self, plan: TripPlan) -> TripPlan:
        plan = plan.model_copy(deep=True)
        flags: list[str] = []

        # Deterministic hop checks
        for day in plan.days:
            places = []
            for t in day.transports:
                places.append((t.from_place, t.to_place, t.duration_hours))
                if t.duration_hours >= 5:
                    flags.append(f"第{day.day}日交通过长（约{t.duration_hours:g}h）：{t.from_place}→{t.to_place}")
            # keyword hop pairs
            blob = " ".join([day.title, day.theme] + [a.name for a in day.activities] + [t.from_place + t.to_place for t in day.transports])
            hop_pairs = [
                ("东京", "京都"),
                ("东京", "大阪"),
                ("大理", "丽江"),
                ("成都", "重庆"),
                ("上海", "北京"),
            ]
            for a, b in hop_pairs:
                if a in blob and b in blob and any(x in day.title + day.theme for x in ("往返", "一日", "来回")):
                    flags.append(f"第{day.day}日疑似同日长距跳跃（{a}↔{b}），建议拆日。")
                # same-day both cities as activity areas
                areas = " ".join(a.area for a in day.activities)
                if a in areas and b in areas:
                    flags.append(f"第{day.day}日活动区域同时出现 {a} 与 {b}，可能不现实。")

        if isinstance(self.llm, MockLLM) or self.mock:
            if flags:
                plan.warnings.extend(flags)
                plan.revision_notes = "Critic（规则）：发现潜在行程风险，已写入 warnings；Mock 下不做二次 LLM 重写。\n" + "\n".join(flags)
                # one light revision: strip same-day dual-city by annotating tips
                for day in plan.days:
                    for a, b in (("东京", "京都"), ("大理", "丽江")):
                        areas = " ".join(x.area for x in day.activities)
                        if a in areas and b in areas:
                            day.tips.append(f"修订：请勿同日安排 {a} 与 {b}；已建议拆分。")
            else:
                plan.revision_notes = "Critic（规则）：未发现明显同日超长跨城；价格均已保持估算口径。"
            self._log_stage("critic", "完成一轮规则评审。", flags=flags)
            return plan

        # Real LLM critic — one revision
        system = (
            "你是旅行行程审稿人（Critic）。检查：\n"
            "1) 同日超长跨城/来回跳点\n"
            "2) 是否把估算价格写成了「实时成交价」\n"
            "3) 是否缺少来源\n"
            "输出 JSON：{\"flags\":[str],\"revision_notes\":str,\"day_fixes\":[{\"day\":int,\"tips_append\":[str]}]}\n"
            "不要编造实时酒店成交价。"
        )
        user = plan.model_dump_json()
        raw = self.llm.chat([ChatMessage(role="system", content=system), ChatMessage(role="user", content=user)])
        data = _extract_json_object(raw) or {}
        llm_flags = list(data.get("flags") or [])
        all_flags = flags + llm_flags
        plan.warnings.extend(all_flags)
        plan.revision_notes = str(data.get("revision_notes") or "") or ("；".join(all_flags) if all_flags else "通过评审。")
        for fix in data.get("day_fixes") or []:
            try:
                dnum = int(fix.get("day"))
            except (TypeError, ValueError):
                continue
            for day in plan.days:
                if day.day == dnum:
                    day.tips.extend(list(fix.get("tips_append") or []))
        self._log_stage("critic", "完成一轮 LLM 评审。", flags=all_flags)
        return plan

    def run(self, req: TripRequest) -> TravelPipelineResult:
        self.tracer.log("travel_start", destination=req.destination, days=req.days, mock=bool(self.mock))
        self.stages = []

        req = self.stage_intake(req)
        sources = self.stage_researcher(req)
        plan = self.stage_itinerary(req, sources)
        if sources and not plan.sources:
            plan.sources = sources
        elif sources:
            # merge unique
            seen = {s.url for s in plan.sources if s.url}
            for s in sources:
                if s.url and s.url not in seen:
                    plan.sources.append(s)
                    seen.add(s.url)
        plan = self.stage_logistics(plan)
        plan = self.stage_budget(plan)
        plan = self.stage_critic(plan)

        md = render_trip_markdown(plan)
        self.tracer.final_answer(md[:500])
        return TravelPipelineResult(
            plan=plan,
            markdown=md,
            stages=list(self.stages),
            run_id=self.tracer.run_id,
            trace_path=str(self.tracer.path),
        )

    # ----- helpers -----

    def _plan_from_partial(self, req: TripRequest, data: dict[str, Any], sources: list[SourceRef]) -> TripPlan:
        days: list[DayPlan] = []
        for d in data.get("days") or []:
            acts = [Activity(**{k: v for k, v in a.items() if k in Activity.model_fields}) for a in d.get("activities") or []]
            trans = [
                TransportLeg(**{k: v for k, v in t.items() if k in TransportLeg.model_fields})
                for t in d.get("transports") or []
            ]
            days.append(
                DayPlan(
                    day=int(d.get("day") or len(days) + 1),
                    title=str(d.get("title") or ""),
                    theme=str(d.get("theme") or ""),
                    activities=acts,
                    transports=trans,
                    meals_note=str(d.get("meals_note") or ""),
                    estimated_day_cost_cny=float(d.get("estimated_day_cost_cny") or 0),
                    tips=list(d.get("tips") or []),
                )
            )
        lodging = [
            LodgingOption(**{k: v for k, v in L.items() if k in LodgingOption.model_fields})
            for L in data.get("lodging") or []
        ]
        return TripPlan(
            request=req,
            summary=str(data.get("summary") or ""),
            highlights=list(data.get("highlights") or []),
            days=days,
            lodging=lodging,
            sources=list(sources),
            warnings=list(data.get("warnings") or []) + ["价格均为估算，非实时报价。"],
            is_mock_sample=False,
        )
