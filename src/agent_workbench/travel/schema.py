"""Pydantic models for travel planning."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class SourceRef(BaseModel):
    """Citation for researched facts."""

    title: str = ""
    url: str = ""
    snippet: str = ""


class Activity(BaseModel):
    name: str
    kind: Literal["sight", "food", "shop", "rest", "other"] = "sight"
    start_time: str = ""  # e.g. "09:30"
    duration_hours: float = 2.0
    area: str = ""
    notes: str = ""
    estimated_cost_cny: float = 0.0  # 估算 — never claim live ticket prices as facts
    source_urls: list[str] = Field(default_factory=list)


class TransportLeg(BaseModel):
    mode: Literal["flight", "train", "metro", "bus", "taxi", "walk", "ferry", "car", "other"] = "other"
    from_place: str
    to_place: str
    depart_time: str = ""
    duration_hours: float = 1.0
    estimated_cost_cny: float = 0.0  # 估算
    notes: str = ""
    source_urls: list[str] = Field(default_factory=list)


class LodgingOption(BaseModel):
    name: str
    area: str = ""
    nights: int = 1
    estimated_nightly_cny: float = 0.0  # 估算 — label clearly; never invent live hotel quotes as facts
    style: str = ""  # e.g. 精品民宿 / 商务酒店
    notes: str = ""
    source_urls: list[str] = Field(default_factory=list)


class DayPlan(BaseModel):
    day: int
    title: str = ""
    theme: str = ""
    activities: list[Activity] = Field(default_factory=list)
    transports: list[TransportLeg] = Field(default_factory=list)
    meals_note: str = ""
    estimated_day_cost_cny: float = 0.0
    tips: list[str] = Field(default_factory=list)


class BudgetBreakdown(BaseModel):
    currency: str = "CNY"
    transport: float = 0.0
    lodging: float = 0.0
    food: float = 0.0
    attractions: float = 0.0
    misc: float = 0.0
    total: float = 0.0
    per_person: float = 0.0
    notes: list[str] = Field(default_factory=list)
    is_estimate: bool = True  # always true unless user-supplied real quotes


class TripRequest(BaseModel):
    destination: str
    days: int = Field(ge=1, le=30, default=3)
    budget_cny: float | None = None
    travelers: int = Field(ge=1, default=2)
    origin: str = ""
    preferences: list[str] = Field(default_factory=list)  # 美食/人文/自然…
    pace: Literal["relaxed", "balanced", "packed"] = "balanced"
    start_date: str = ""  # optional YYYY-MM-DD
    language: str = "zh-Hans"


class TripPlan(BaseModel):
    request: TripRequest
    summary: str = ""
    highlights: list[str] = Field(default_factory=list)
    days: list[DayPlan] = Field(default_factory=list)
    lodging: list[LodgingOption] = Field(default_factory=list)
    long_haul: list[TransportLeg] = Field(default_factory=list)  # origin↔dest
    budget: BudgetBreakdown = Field(default_factory=BudgetBreakdown)
    sources: list[SourceRef] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    is_mock_sample: bool = False
    revision_notes: str = ""
