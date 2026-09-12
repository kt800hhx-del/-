"""Tests for Travel Planning Agent."""

from __future__ import annotations

from agent_workbench.travel.budget import (
    build_budget,
    defaults_for,
    detect_tier,
    estimate_long_haul,
    scale_to_budget,
)
from agent_workbench.travel.mock_plans import MockTravelPlanner
from agent_workbench.travel.pipeline import TravelPipeline
from agent_workbench.travel.render import render_trip_markdown
from agent_workbench.travel.schema import (
    Activity,
    DayPlan,
    LodgingOption,
    TripPlan,
    TripRequest,
)


def test_schema_trip_request_roundtrip():
    req = TripRequest(destination="成都", days=3, budget_cny=4000, travelers=2, origin="上海", preferences=["美食"])
    data = req.model_dump()
    req2 = TripRequest.model_validate(data)
    assert req2.destination == "成都"
    assert req2.days == 3


def test_schema_trip_plan_has_days():
    req = TripRequest(destination="成都", days=1)
    plan = TripPlan(
        request=req,
        days=[
            DayPlan(
                day=1,
                title="测试日",
                activities=[Activity(name="景点A", estimated_cost_cny=10)],
            )
        ],
        lodging=[LodgingOption(name="酒店", nights=1, estimated_nightly_cny=200)],
    )
    assert len(plan.days) == 1
    assert plan.days[0].activities[0].name == "景点A"


def test_budget_tier_and_defaults():
    assert detect_tier("成都") == "B"
    assert detect_tier("东京") == "A"
    d = defaults_for("成都")
    assert d["lodging_night"] > 0
    assert d["food_day"] > 0


def test_budget_build_and_scale():
    req = TripRequest(destination="成都", days=3, travelers=2, origin="上海", budget_cny=500)
    days = [
        DayPlan(
            day=1,
            activities=[Activity(name="a", kind="sight", estimated_cost_cny=100), Activity(name="f", kind="food", estimated_cost_cny=80)],
        )
    ]
    lodging = [LodgingOption(name="h", nights=2, estimated_nightly_cny=300)]
    b = build_budget(req, days, lodging, None)
    assert b.is_estimate is True
    assert b.total > 0
    assert b.currency == "CNY"
    scaled = scale_to_budget(b, 500)
    assert scaled.total <= b.total
    haul, note = estimate_long_haul("上海", "成都", 2)
    assert haul > 0
    assert "估算" in note or "估算" in note or len(note) > 0


def test_mock_pipeline_e2e_chengdu(tmp_path, monkeypatch):
    monkeypatch.setenv("AGENT_WB_TRACE_DIR", str(tmp_path / "traces"))
    req = TripRequest(destination="成都", days=3, budget_cny=4000, travelers=2, origin="上海", preferences=["美食", "人文"])
    pipe = TravelPipeline(mock=True, use_web=False)
    result = pipe.run(req)
    assert result.plan.days, "expected DayPlans"
    assert len(result.plan.days) >= 1
    assert all(isinstance(d, DayPlan) for d in result.plan.days)
    assert result.plan.is_mock_sample is True
    assert result.markdown
    assert "成都" in result.markdown
    assert len(result.stages) >= 5
    stage_names = [s.stage for s in result.stages]
    assert "intake" in stage_names
    assert "critic" in stage_names
    assert result.plan.budget.total > 0


def test_mock_planner_tokyo_and_yunnan():
    p = MockTravelPlanner()
    tokyo = p.plan(TripRequest(destination="东京", days=5, travelers=2))
    assert len(tokyo.days) == 5
    yunnan = p.plan(TripRequest(destination="云南大理丽江", days=5, travelers=2))
    assert len(yunnan.days) >= 3
    generic = p.plan(TripRequest(destination="冰岛雷克雅未克", days=2))
    assert len(generic.days) == 2


def test_render_non_empty():
    req = TripRequest(destination="成都", days=3, travelers=2)
    plan = MockTravelPlanner().plan(req)
    md = render_trip_markdown(plan)
    assert md.strip()
    assert "第1日" in md or "行程" in md
    assert "估算" in md
