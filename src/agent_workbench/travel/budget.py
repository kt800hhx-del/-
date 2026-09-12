"""Deterministic budget math helpers + CNY defaults by city tier.

Reliability: all figures are 估算 (estimates). Never present them as live quotes.
"""

from __future__ import annotations

from agent_workbench.travel.schema import (
    BudgetBreakdown,
    DayPlan,
    LodgingOption,
    TransportLeg,
    TripRequest,
)

# City tier → rough per-person daily costs (CNY). 估算 defaults.
CITY_TIER: dict[str, str] = {
    # Tier A — expensive metros / international
    "东京": "A",
    "tokyo": "A",
    "大阪": "A",
    "osaka": "A",
    "京都": "A",
    "kyoto": "A",
    "上海": "A",
    "北京": "A",
    "香港": "A",
    "singapore": "A",
    "新加坡": "A",
    "首尔": "A",
    "seoul": "A",
    # Tier B — popular domestic / mid
    "成都": "B",
    "杭州": "B",
    "西安": "B",
    "厦门": "B",
    "重庆": "B",
    "南京": "B",
    "苏州": "B",
    "广州": "B",
    "深圳": "B",
    "大理": "B",
    "丽江": "B",
    "云南": "B",
    # Tier C — smaller / budget-friendly
    "桂林": "C",
    "青岛": "C",
    "长沙": "C",
    "武汉": "C",
}

# lodging nightly / food daily / local transport daily / attractions daily (per person CNY)
TIER_DEFAULTS: dict[str, dict[str, float]] = {
    "A": {"lodging_night": 550, "food_day": 220, "local_transport_day": 80, "attractions_day": 150, "misc_day": 60},
    "B": {"lodging_night": 320, "food_day": 140, "local_transport_day": 50, "attractions_day": 90, "misc_day": 40},
    "C": {"lodging_night": 200, "food_day": 100, "local_transport_day": 35, "attractions_day": 60, "misc_day": 30},
}

# Rough long-haul one-way per person (CNY) when origin given — 估算
LONG_HAUL_DEFAULTS: dict[str, float] = {
    "国内高铁": 450,
    "国内机票": 900,
    "国际短途": 1800,
    "国际中长途": 3500,
}


def detect_tier(destination: str) -> str:
    d = destination.strip().lower()
    for key, tier in CITY_TIER.items():
        if key.lower() in d or d in key.lower():
            return tier
    # Heuristic: Japanese/Korean/English metro names → A; else B
    if any(x in destination for x in ("东京", "大阪", "京都", "首尔", "香港", "新加坡")):
        return "A"
    return "B"


def defaults_for(destination: str) -> dict[str, float]:
    return dict(TIER_DEFAULTS[detect_tier(destination)])


def estimate_long_haul(origin: str, destination: str, travelers: int) -> tuple[float, str]:
    """Return (total_cny_roundtrip_estimate, note)."""
    if not origin or not origin.strip():
        return 0.0, "未提供出发地，长途交通费未计入。"
    o, d = origin.lower(), destination.lower()
    intl_markers = ("东京", "大阪", "京都", "首尔", "香港", "新加坡", "tokyo", "osaka", "seoul", "bangkok", "曼谷")
    if any(m in destination for m in intl_markers) or any(m in d for m in ("tokyo", "osaka", "seoul")):
        per = LONG_HAUL_DEFAULTS["国际短途"]
        note = "国际短途往返机票估算（非实时报价）"
    elif any(x in o for x in ("北京", "上海", "广州", "深圳")) and any(
        x in destination for x in ("成都", "重庆", "昆明", "西安", "大理", "丽江")
    ):
        per = LONG_HAUL_DEFAULTS["国内机票"]
        note = "国内往返机票估算（非实时报价）"
    else:
        per = LONG_HAUL_DEFAULTS["国内高铁"]
        note = "国内往返高铁估算（非实时报价）"
    return per * 2 * travelers, note


def sum_day_costs(days: list[DayPlan]) -> dict[str, float]:
    food = attractions = local_t = 0.0
    for day in days:
        for a in day.activities:
            if a.kind == "food":
                food += a.estimated_cost_cny
            else:
                attractions += a.estimated_cost_cny
        for t in day.transports:
            local_t += t.estimated_cost_cny
    return {"food": food, "attractions": attractions, "local_transport": local_t}


def lodging_total(lodging: list[LodgingOption], travelers: int) -> float:
    """Assume one room covers up to 2 people; scale rooms."""
    rooms = max(1, (travelers + 1) // 2)
    total = 0.0
    for L in lodging:
        total += L.estimated_nightly_cny * L.nights * rooms
    return total


def build_budget(
    request: TripRequest,
    days: list[DayPlan],
    lodging: list[LodgingOption],
    long_haul: list[TransportLeg] | None = None,
) -> BudgetBreakdown:
    """Deterministic rollup. All amounts are 估算."""
    defs = defaults_for(request.destination)
    travelers = request.travelers
    n_days = request.days
    n_nights = max(1, n_days - 1) if n_days > 1 else 1

    rolled = sum_day_costs(days)
    # If activities didn't fill costs, fall back to tier defaults (per person × travelers × days)
    food = rolled["food"] or defs["food_day"] * n_days * travelers
    attractions = rolled["attractions"] or defs["attractions_day"] * n_days * travelers
    local_t = rolled["local_transport"] or defs["local_transport_day"] * n_days * travelers

    if lodging:
        lodge = lodging_total(lodging, travelers)
    else:
        rooms = max(1, (travelers + 1) // 2)
        lodge = defs["lodging_night"] * n_nights * rooms

    haul = 0.0
    notes = [
        "所有金额均为估算（估算），非实时酒店/机票报价；出行前请向官网或 OTA 核实。",
        f"目的地档位：{detect_tier(request.destination)}（用于默认单价）",
    ]
    if long_haul:
        haul = sum(leg.estimated_cost_cny for leg in long_haul)
    else:
        haul, haul_note = estimate_long_haul(request.origin, request.destination, travelers)
        notes.append(haul_note)

    misc = defs["misc_day"] * n_days * travelers
    total = haul + lodge + food + attractions + local_t + misc
    per = total / travelers if travelers else total

    if request.budget_cny is not None:
        if total > request.budget_cny * 1.05:
            notes.append(
                f"当前估算合计 ¥{total:.0f} 超出预算 ¥{request.budget_cny:.0f}，"
                "建议下调住宿档次、减少付费景点或缩短长途交通。"
            )
        else:
            notes.append(f"当前估算合计 ¥{total:.0f}，在预算 ¥{request.budget_cny:.0f} 内（含余量判断）。")

    return BudgetBreakdown(
        currency="CNY",
        transport=round(haul + local_t, 2),
        lodging=round(lodge, 2),
        food=round(food, 2),
        attractions=round(attractions, 2),
        misc=round(misc, 2),
        total=round(total, 2),
        per_person=round(per, 2),
        notes=notes,
        is_estimate=True,
    )


def scale_to_budget(breakdown: BudgetBreakdown, budget_cny: float) -> BudgetBreakdown:
    """Proportionally scale categories if over budget (keeps transport less elastic)."""
    if budget_cny <= 0 or breakdown.total <= budget_cny:
        return breakdown
    # Protect ~40% of transport; scale the rest
    protected = breakdown.transport * 0.4
    flexible = breakdown.total - protected
    target_flexible = max(0.0, budget_cny - protected)
    factor = target_flexible / flexible if flexible > 0 else 1.0
    out = breakdown.model_copy(deep=True)
    out.lodging = round(out.lodging * factor, 2)
    out.food = round(out.food * factor, 2)
    out.attractions = round(out.attractions * factor, 2)
    out.misc = round(out.misc * factor, 2)
    out.transport = round(protected + (out.transport - protected) * factor, 2)
    out.total = round(out.transport + out.lodging + out.food + out.attractions + out.misc, 2)
    out.per_person = out.total  # caller may recompute
    out.notes = list(out.notes) + [f"已按预算 ¥{budget_cny:.0f} 做比例下调（估算）。"]
    return out
