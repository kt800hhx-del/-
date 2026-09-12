"""TripPlan → polished Chinese Markdown (旅行社风格)."""

from __future__ import annotations

from agent_workbench.travel.schema import DayPlan, TripPlan


def _md_escape(text: str) -> str:
    return text.replace("|", "\\|")


def _render_day(day: DayPlan) -> str:
    lines: list[str] = []
    title = day.title or f"第{day.day}日"
    lines.append(f"## 第{day.day}日 · {_md_escape(title)}")
    if day.theme:
        lines.append(f"**主题：** {day.theme}")
    lines.append("")
    if day.activities:
        lines.append("### 行程安排")
        for a in day.activities:
            time_bit = f"`{a.start_time}` " if a.start_time else ""
            cost = f" · 估算 ¥{a.estimated_cost_cny:.0f}" if a.estimated_cost_cny else ""
            area = f" _{a.area}_" if a.area else ""
            lines.append(f"- {time_bit}**{a.name}**（{a.kind}{cost}）{area}")
            if a.notes:
                lines.append(f"  - {a.notes}")
            if a.source_urls:
                lines.append(f"  - 参考：{' · '.join(a.source_urls)}")
        lines.append("")
    if day.transports:
        lines.append("### 当日交通")
        for t in day.transports:
            cost = f" · 估算 ¥{t.estimated_cost_cny:.0f}" if t.estimated_cost_cny else ""
            lines.append(
                f"- **{t.mode}** {t.from_place} → {t.to_place}"
                f"（约 {t.duration_hours:g}h{cost}）"
            )
            if t.notes:
                lines.append(f"  - {t.notes}")
        lines.append("")
    if day.meals_note:
        lines.append(f"**餐饮提示：** {day.meals_note}")
        lines.append("")
    if day.tips:
        lines.append("**小贴士：**")
        for tip in day.tips:
            lines.append(f"- {tip}")
        lines.append("")
    if day.estimated_day_cost_cny:
        lines.append(f"> 当日人均活动估算合计约 **¥{day.estimated_day_cost_cny:.0f}**（不含酒店全额分摊）")
        lines.append("")
    return "\n".join(lines)


def render_trip_markdown(plan: TripPlan) -> str:
    """旅行社风格中文 Markdown。"""
    req = plan.request
    lines: list[str] = []

    badge = "【示例数据 · Mock】" if plan.is_mock_sample else "【智能规划】"
    lines.append(f"# {badge} {req.destination} {req.days} 日行程方案")
    lines.append("")
    lines.append(
        f"**出行人数：** {req.travelers} 人"
        + (f" · **出发地：** {req.origin}" if req.origin else "")
        + f" · **节奏：** {req.pace}"
    )
    if req.preferences:
        lines.append(f"**偏好：** {'、'.join(req.preferences)}")
    if req.budget_cny is not None:
        lines.append(f"**预算目标：** ¥{req.budget_cny:.0f}（总）")
    lines.append("")
    lines.append("> ⚠️ **可靠性声明：** 酒店/机票/门票价格均为 **估算**，非实时报价；"
                 "请出发前向官网或 OTA 核实。优先采信文末参考链接。")
    lines.append("")

    if plan.summary:
        lines.append("## 行程综述")
        lines.append(plan.summary)
        lines.append("")

    if plan.highlights:
        lines.append("## 亮点")
        for h in plan.highlights:
            lines.append(f"- {h}")
        lines.append("")

    if plan.warnings:
        lines.append("## 重要提示")
        for w in plan.warnings:
            lines.append(f"- {w}")
        lines.append("")

    if plan.long_haul:
        lines.append("## 长途交通（估算）")
        for t in plan.long_haul:
            lines.append(
                f"- **{t.mode}** {t.from_place} → {t.to_place}："
                f"约 {t.duration_hours:g}h · 估算 ¥{t.estimated_cost_cny:.0f}"
            )
            if t.notes:
                lines.append(f"  - {t.notes}")
        lines.append("")

    if plan.lodging:
        lines.append("## 住宿建议（估算）")
        lines.append("| 名称 | 区域 | 晚数 | 每晚估算 | 风格 |")
        lines.append("| --- | --- | ---: | ---: | --- |")
        for L in plan.lodging:
            lines.append(
                f"| {_md_escape(L.name)} | {_md_escape(L.area)} | {L.nights} "
                f"| ¥{L.estimated_nightly_cny:.0f} | {_md_escape(L.style)} |"
            )
        lines.append("")
        for L in plan.lodging:
            if L.notes:
                lines.append(f"- {L.name}：{L.notes}")
        lines.append("")

    lines.append("## 逐日行程")
    lines.append("")
    for day in plan.days:
        lines.append(_render_day(day))

    b = plan.budget
    lines.append("## 预算拆解（CNY · 估算）")
    lines.append("")
    lines.append("| 类别 | 金额 |")
    lines.append("| --- | ---: |")
    lines.append(f"| 交通（含长途+市内） | ¥{b.transport:.0f} |")
    lines.append(f"| 住宿 | ¥{b.lodging:.0f} |")
    lines.append(f"| 餐饮 | ¥{b.food:.0f} |")
    lines.append(f"| 门票/体验 | ¥{b.attractions:.0f} |")
    lines.append(f"| 杂费 | ¥{b.misc:.0f} |")
    lines.append(f"| **合计** | **¥{b.total:.0f}** |")
    lines.append(f"| 人均 | ¥{b.per_person:.0f} |")
    lines.append("")
    for n in b.notes:
        lines.append(f"- {n}")
    lines.append("")

    if plan.sources:
        lines.append("## 参考来源")
        for i, s in enumerate(plan.sources, 1):
            title = s.title or s.url or f"来源{i}"
            if s.url:
                lines.append(f"{i}. [{title}]({s.url})")
            else:
                lines.append(f"{i}. {title}")
            if s.snippet:
                lines.append(f"   > {s.snippet[:200]}")
        lines.append("")

    if plan.revision_notes:
        lines.append("## 修订说明（Critic）")
        lines.append(plan.revision_notes)
        lines.append("")

    lines.append("---")
    lines.append("*由 Agent Workbench 旅行规划管道生成 · Travel Planning Agent*")
    lines.append("")
    return "\n".join(lines)
