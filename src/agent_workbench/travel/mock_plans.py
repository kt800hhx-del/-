"""High-quality sample trip plans for offline / mock demos.

Clearly marked 示例数据 — not live quotes. Hotel/ticket prices are 估算.
"""

from __future__ import annotations

from agent_workbench.travel.budget import build_budget
from agent_workbench.travel.schema import (
    Activity,
    DayPlan,
    LodgingOption,
    SourceRef,
    TransportLeg,
    TripPlan,
    TripRequest,
)


def _chengdu_3d(req: TripRequest) -> TripPlan:
    days = [
        DayPlan(
            day=1,
            title="抵达 · 宽窄巷子与锦里夜色",
            theme="市区人文 + 火锅开胃",
            activities=[
                Activity(
                    name="宽窄巷子",
                    kind="sight",
                    start_time="14:00",
                    duration_hours=2.0,
                    area="青羊区",
                    notes="三条平行巷弄，适合缓步进城；小吃多为游客价，适量即可。",
                    estimated_cost_cny=40,
                    source_urls=["https://zh.wikipedia.org/wiki/宽窄巷子"],
                ),
                Activity(
                    name="人民公园 + 鹤鸣茶社（可选）",
                    kind="rest",
                    start_time="16:30",
                    duration_hours=1.5,
                    area="青羊区",
                    notes="体验盖碗茶与掏耳朵氛围；茶位费为估算。",
                    estimated_cost_cny=50,
                ),
                Activity(
                    name="锦里 / 武侯祠外逛",
                    kind="sight",
                    start_time="19:00",
                    duration_hours=2.0,
                    area="武侯区",
                    notes="夜景人多，注意保管随身物品；武侯祠门票另计（估算）。",
                    estimated_cost_cny=60,
                    source_urls=["https://zh.wikipedia.org/wiki/锦里"],
                ),
                Activity(
                    name="火锅晚餐",
                    kind="food",
                    start_time="21:00",
                    duration_hours=1.5,
                    area="市区",
                    notes="人均火锅 估算 ¥80–120；忌空腹猛辣。",
                    estimated_cost_cny=100,
                ),
            ],
            transports=[
                TransportLeg(
                    mode="metro",
                    from_place="酒店",
                    to_place="宽窄巷子",
                    duration_hours=0.4,
                    estimated_cost_cny=4,
                    notes="地铁 2/4 号线换乘常见。",
                ),
            ],
            meals_note="午：抵达后简餐；晚：火锅。",
            estimated_day_cost_cny=260,
            tips=["首日勿排过满，留出入住与寄存行李时间。"],
        ),
        DayPlan(
            day=2,
            title="大熊猫基地 · 春熙路太古里",
            theme="萌宠 + 逛街美食",
            activities=[
                Activity(
                    name="成都大熊猫繁育研究基地",
                    kind="sight",
                    start_time="08:00",
                    duration_hours=3.5,
                    area="成华区",
                    notes="建议一早入园看活跃时段；门票+公交 估算，非实时票价。",
                    estimated_cost_cny=80,
                    source_urls=["https://zh.wikipedia.org/wiki/成都大熊猫繁育研究基地"],
                ),
                Activity(
                    name="园区简餐 / 回城午餐",
                    kind="food",
                    start_time="12:00",
                    duration_hours=1.0,
                    area="基地附近或市区",
                    notes="估算人均 ¥40。",
                    estimated_cost_cny=40,
                ),
                Activity(
                    name="春熙路 · 太古里",
                    kind="shop",
                    start_time="15:00",
                    duration_hours=3.0,
                    area="锦江区",
                    notes="潮牌与拍照点集中；消费弹性大。",
                    estimated_cost_cny=50,
                ),
                Activity(
                    name="串串 / 冒菜晚餐",
                    kind="food",
                    start_time="19:00",
                    duration_hours=1.5,
                    area="春熙路周边",
                    notes="估算人均 ¥60。",
                    estimated_cost_cny=60,
                ),
            ],
            transports=[
                TransportLeg(
                    mode="metro",
                    from_place="市区",
                    to_place="熊猫大道站 → 接驳",
                    duration_hours=1.0,
                    estimated_cost_cny=10,
                    notes="也可打车往返（估算 ¥60–90/车）。",
                ),
            ],
            meals_note="午：简餐；晚：串串。",
            estimated_day_cost_cny=280,
            tips=["雨天熊猫仍可参观，带折叠伞。"],
        ),
        DayPlan(
            day=3,
            title="杜甫草堂 · 青羊宫 · 返程",
            theme="诗词园林收尾",
            activities=[
                Activity(
                    name="杜甫草堂",
                    kind="sight",
                    start_time="09:00",
                    duration_hours=2.0,
                    area="青羊区",
                    notes="门票估算；文学爱好者可多留时间。",
                    estimated_cost_cny=50,
                    source_urls=["https://zh.wikipedia.org/wiki/杜甫草堂"],
                ),
                Activity(
                    name="青羊宫",
                    kind="sight",
                    start_time="11:30",
                    duration_hours=1.5,
                    area="青羊区",
                    notes="道教宫观，着装得体；香火随缘。",
                    estimated_cost_cny=20,
                ),
                Activity(
                    name="市区午餐后返程",
                    kind="food",
                    start_time="13:30",
                    duration_hours=1.0,
                    area="市区",
                    notes="估算 ¥50；预留机场/车站安检时间。",
                    estimated_cost_cny=50,
                ),
            ],
            transports=[
                TransportLeg(
                    mode="metro",
                    from_place="草堂/青羊宫",
                    to_place="机场或车站",
                    duration_hours=1.2,
                    estimated_cost_cny=15,
                    notes="天府机场建议预留 2.5h+；双流略短。",
                ),
            ],
            meals_note="午：川菜小馆；晚：视航班而定。",
            estimated_day_cost_cny=180,
            tips=["若改日游都江堰-青城山，勿与市区重景点同日硬塞（Critic：避免同日超长跨城）。"],
        ),
    ]
    lodging = [
        LodgingOption(
            name="春熙路/太古里附近中档酒店（示例）",
            area="锦江区",
            nights=2,
            estimated_nightly_cny=380,
            style="商务酒店",
            notes="示例数据 · 价格为估算，请以 OTA 实时为准。",
        )
    ]
    long_haul = []
    if req.origin:
        long_haul.append(
            TransportLeg(
                mode="flight",
                from_place=req.origin,
                to_place="成都",
                duration_hours=3.0,
                estimated_cost_cny=900 * req.travelers,
                notes="单程人均约 ¥900 估算；往返另计。示例数据。",
            )
        )
    sources = [
        SourceRef(title="宽窄巷子 - 维基百科", url="https://zh.wikipedia.org/wiki/宽窄巷子", snippet="成都历史文化街区示例引用。"),
        SourceRef(
            title="成都大熊猫繁育研究基地 - 维基百科",
            url="https://zh.wikipedia.org/wiki/成都大熊猫繁育研究基地",
            snippet="参观须知与概况（请核对开放时间）。",
        ),
    ]
    budget = build_budget(req, days, lodging, long_haul)
    return TripPlan(
        request=req,
        summary="成都 3 日经典节奏：宽窄锦里入城 → 熊猫基地与春熙太古里 → 草堂青羊收尾。美食与人文并重，适合首次到访。",
        highlights=["大熊猫基地早场", "宽窄巷子 + 锦里夜景", "春熙路太古里", "杜甫草堂"],
        days=days,
        lodging=lodging,
        long_haul=long_haul,
        budget=budget,
        sources=sources,
        warnings=[
            "【示例数据】本行程为离线演示样本，非实时库存/报价。",
            "酒店与门票价格均为估算，请出发前核实。",
        ],
        is_mock_sample=True,
    )


def _tokyo_5d(req: TripRequest) -> TripPlan:
    days = [
        DayPlan(
            day=1,
            title="抵达成田/羽田 · 浅草寺与晴空塔远景",
            theme="下町风情",
            activities=[
                Activity(name="浅草寺·仲见世通", kind="sight", start_time="14:00", duration_hours=2.5, area="台东区", notes="雷门打卡；小吃另计。", estimated_cost_cny=30, source_urls=["https://zh.wikipedia.org/wiki/浅草寺"]),
                Activity(name="隅田川散步 / 晴空塔外观", kind="sight", start_time="17:00", duration_hours=1.5, area="墨田区", notes="登塔票价为估算，可按预算取舍。", estimated_cost_cny=100),
                Activity(name="晚餐：拉面/天妇罗", kind="food", start_time="19:00", duration_hours=1.5, area="浅草", notes="人均估算 ¥120。", estimated_cost_cny=120),
            ],
            transports=[TransportLeg(mode="train", from_place="机场", to_place="浅草/酒店", duration_hours=1.5, estimated_cost_cny=80, notes="Skyliner/京成或单轨+JR，估算。")],
            meals_note="晚：日式简餐。",
            estimated_day_cost_cny=350,
            tips=["Suica/Pasmo 或交通卡可减少购票时间。"],
        ),
        DayPlan(
            day=2,
            title="明治神宫 · 涩谷 · 原宿",
            theme="表参道潮流",
            activities=[
                Activity(name="明治神宫", kind="sight", start_time="09:00", duration_hours=1.5, area="涩谷区", notes="森林参道；礼仪安静。", estimated_cost_cny=0, source_urls=["https://zh.wikipedia.org/wiki/明治神宫"]),
                Activity(name="原宿竹下通 + 表参道", kind="shop", start_time="11:00", duration_hours=2.5, area="涩谷区", notes="购物弹性大。", estimated_cost_cny=80),
                Activity(name="涩谷十字路口 / 渋谷天空（可选）", kind="sight", start_time="15:00", duration_hours=2.0, area="涩谷", notes="观景票估算。", estimated_cost_cny=120),
                Activity(name="晚饭：烧鸟或定食", kind="food", start_time="19:00", duration_hours=1.5, area="涩谷", notes="估算 ¥150。", estimated_cost_cny=150),
            ],
            transports=[TransportLeg(mode="metro", from_place="酒店", to_place="原宿/涩谷", duration_hours=0.5, estimated_cost_cny=20)],
            meals_note="午：快餐；晚：烧鸟。",
            estimated_day_cost_cny=400,
            tips=[],
        ),
        DayPlan(
            day=3,
            title="团队实验室 or 台场 · 丰洲市场周边",
            theme="现代东京",
            activities=[
                Activity(name="teamLab Planets（或类似数字艺术展）", kind="sight", start_time="10:00", duration_hours=2.5, area="丰洲/台场", notes="需预约；票价估算非实时。", estimated_cost_cny=280),
                Activity(name="台场海滨公园", kind="sight", start_time="14:00", duration_hours=2.0, area="台场", notes="自由女神像复制品、彩虹桥远景。", estimated_cost_cny=0),
                Activity(name="晚餐", kind="food", start_time="18:30", duration_hours=1.5, area="台场/丰洲", notes="估算 ¥160。", estimated_cost_cny=160),
            ],
            transports=[TransportLeg(mode="metro", from_place="市区", to_place="丰洲/台场", duration_hours=0.8, estimated_cost_cny=30)],
            meals_note="午：便利店/食堂；晚：餐厅。",
            estimated_day_cost_cny=500,
            tips=["热门展务必提前官网预约。"],
        ),
        DayPlan(
            day=4,
            title="一日京都？不 — 留在东京：皇居外苑 + 银座/日本桥",
            theme="都心经典",
            activities=[
                Activity(name="皇居外苑散步", kind="sight", start_time="09:30", duration_hours=2.0, area="千代田区", notes="不安排同日往返京都（不合理长途）。", estimated_cost_cny=0),
                Activity(name="银座漫步与窗橱", kind="shop", start_time="13:00", duration_hours=3.0, area="中央区", notes="可只逛不买。", estimated_cost_cny=50),
                Activity(name="寿司/海鲜晚餐", kind="food", start_time="18:30", duration_hours=1.5, area="银座或筑地外市场周边", notes="人均估算 ¥250（档次弹性极大）。", estimated_cost_cny=250),
            ],
            transports=[TransportLeg(mode="metro", from_place="酒店", to_place="东京站/银座", duration_hours=0.5, estimated_cost_cny=20)],
            meals_note="午：轻食；晚：海鲜。",
            estimated_day_cost_cny=400,
            tips=["Critic 规则：禁止东京↔京都同日往返硬塞。"],
        ),
        DayPlan(
            day=5,
            title="秋叶原或上野博物馆 · 返程",
            theme="兴趣向收尾",
            activities=[
                Activity(name="上野公园 / 博物馆（择一）", kind="sight", start_time="09:30", duration_hours=2.5, area="台东区", notes="门票估算。", estimated_cost_cny=80),
                Activity(name="秋叶原电器街（可选）", kind="shop", start_time="13:00", duration_hours=2.0, area="千代田区", notes="退税注意时间。", estimated_cost_cny=0),
                Activity(name="机场方向移动", kind="other", start_time="16:00", duration_hours=2.0, area="—", notes="预留足量安检与交通时间。", estimated_cost_cny=80),
            ],
            transports=[TransportLeg(mode="train", from_place="市区", to_place="成田/羽田", duration_hours=1.5, estimated_cost_cny=80)],
            meals_note="午：简餐。",
            estimated_day_cost_cny=280,
            tips=[],
        ),
    ]
    lodging = [
        LodgingOption(
            name="上野/浅草商务酒店（示例）",
            area="台东区",
            nights=4,
            estimated_nightly_cny=650,
            style="商务酒店",
            notes="示例数据 · 估算日元已粗换算 CNY，非实时报价。",
        )
    ]
    long_haul = []
    if req.origin:
        long_haul.append(
            TransportLeg(
                mode="flight",
                from_place=req.origin,
                to_place="东京",
                duration_hours=4.0,
                estimated_cost_cny=1800 * req.travelers,
                notes="国际短途单程人均估算；往返另计。示例数据。",
            )
        )
    budget = build_budget(req, days, lodging, long_haul)
    return TripPlan(
        request=req,
        summary="东京 5 日：下町浅草 → 涩谷原宿 → 丰洲/台场现代艺术 → 都心银座 → 上野/秋叶原返程。节奏偏 balanced，避免同日跨城。",
        highlights=["浅草寺", "明治神宫与涩谷", "teamLab（需预约）", "皇居外苑与银座"],
        days=days,
        lodging=lodging,
        long_haul=long_haul,
        budget=budget,
        sources=[
            SourceRef(title="浅草寺 - 维基百科", url="https://zh.wikipedia.org/wiki/浅草寺", snippet="示例引用。"),
            SourceRef(title="明治神宫 - 维基百科", url="https://zh.wikipedia.org/wiki/明治神宫", snippet="示例引用。"),
        ],
        warnings=["【示例数据】离线演示样本。", "汇率与票价波动大，金额均为估算。"],
        is_mock_sample=True,
    )


def _yunnan_dali_lijiang(req: TripRequest) -> TripPlan:
    """大理+丽江多日；默认 5 天，可按 req.days 截断/提示。"""
    days_all = [
        DayPlan(
            day=1,
            title="抵达大理 · 古城与洱海傍晚",
            theme="风花雪月开场",
            activities=[
                Activity(name="大理古城南门→洋人街", kind="sight", start_time="15:00", duration_hours=2.0, area="大理古城", notes="漫步即可，忌电瓶车拉客纠纷。", estimated_cost_cny=0),
                Activity(name="才村/码头看洱海晚霞（视季节）", kind="sight", start_time="17:30", duration_hours=1.5, area="洱海", notes="生态管控期请遵守禁令。", estimated_cost_cny=20),
                Activity(name="白族风味晚餐", kind="food", start_time="19:30", duration_hours=1.5, area="古城", notes="估算 ¥70。", estimated_cost_cny=70),
            ],
            transports=[TransportLeg(mode="taxi", from_place="大理机场/站", to_place="古城", duration_hours=0.8, estimated_cost_cny=80, notes="估算。")],
            meals_note="晚：白族菜。",
            estimated_day_cost_cny=200,
            tips=["高原日照强，注意防晒。"],
        ),
        DayPlan(
            day=2,
            title="洱海骑行或游船 · 喜洲",
            theme="海东/海西择一，勿环海硬撑一天超长",
            activities=[
                Activity(name="喜洲古镇 + 粑粑", kind="sight", start_time="09:30", duration_hours=2.5, area="喜洲", notes="小吃估算。", estimated_cost_cny=40, source_urls=["https://zh.wikipedia.org/wiki/喜洲镇"]),
                Activity(name="洱海生态廊道骑行（片段）", kind="sight", start_time="13:00", duration_hours=3.0, area="海西", notes="租车估算；量力而行。", estimated_cost_cny=60),
                Activity(name="晚餐回古城", kind="food", start_time="18:30", duration_hours=1.5, area="大理", notes="估算 ¥70。", estimated_cost_cny=70),
            ],
            transports=[TransportLeg(mode="bus", from_place="古城", to_place="喜洲", duration_hours=1.0, estimated_cost_cny=20)],
            meals_note="午：喜洲粑粑；晚：回古城。",
            estimated_day_cost_cny=250,
            tips=["不建议同日大理→丽江→再返回（Critic：同日长距跳点）。"],
        ),
        DayPlan(
            day=3,
            title="大理 → 丽江（交通日）",
            theme="换城过渡",
            activities=[
                Activity(name="退房与行李整理", kind="other", start_time="09:00", duration_hours=1.0, area="大理", notes="—", estimated_cost_cny=0),
                Activity(name="大丽铁路/大巴前往丽江", kind="other", start_time="11:00", duration_hours=2.5, area="途中", notes="票价估算。", estimated_cost_cny=80),
                Activity(name="丽江古城夜景（适度）", kind="sight", start_time="18:00", duration_hours=2.0, area="丽江古城", notes="海拔约 2400m，避免剧烈运动与酗酒。", estimated_cost_cny=30, source_urls=["https://zh.wikipedia.org/wiki/丽江古城"]),
                Activity(name="晚餐", kind="food", start_time="20:00", duration_hours=1.5, area="丽江", notes="估算 ¥80。", estimated_cost_cny=80),
            ],
            transports=[
                TransportLeg(mode="train", from_place="大理", to_place="丽江", duration_hours=2.0, estimated_cost_cny=80, notes="高铁/火车优先于疲劳自驾。"),
            ],
            meals_note="途中简餐 + 晚餐饮。",
            estimated_day_cost_cny=280,
            tips=["预留缓适应高原时间。"],
        ),
        DayPlan(
            day=4,
            title="丽江：丽江古城 + 狮子山俯瞰 或 束河",
            theme="古城深度",
            activities=[
                Activity(name="丽江古城维护费入城 + 四方街", kind="sight", start_time="09:30", duration_hours=3.0, area="古城区", notes="维护费估算，以当地公示为准。", estimated_cost_cny=50),
                Activity(name="束河古镇半日（可选）", kind="sight", start_time="14:00", duration_hours=3.0, area="束河", notes="比大研略安静。", estimated_cost_cny=20),
                Activity(name="晚餐", kind="food", start_time="18:30", duration_hours=1.5, area="丽江", notes="估算 ¥80。", estimated_cost_cny=80),
            ],
            transports=[TransportLeg(mode="taxi", from_place="大研", to_place="束河", duration_hours=0.4, estimated_cost_cny=30)],
            meals_note="午晚当地菜。",
            estimated_day_cost_cny=260,
            tips=["玉龙雪山另日专排，不与古城高强度购物同日。"],
        ),
        DayPlan(
            day=5,
            title="玉龙雪山（可选）或返程",
            theme="高山体验 / 离开",
            activities=[
                Activity(name="玉龙雪山蓝月谷（可选大索道）", kind="sight", start_time="08:00", duration_hours=5.0, area="玉龙雪山", notes="门票+交通+氧气瓶均为估算；心脏病等禁忌人群勿强行。", estimated_cost_cny=350, source_urls=["https://zh.wikipedia.org/wiki/玉龙雪山"]),
                Activity(name="返回市区午餐后赴机场/车站", kind="food", start_time="15:00", duration_hours=1.0, area="丽江", notes="估算 ¥50。", estimated_cost_cny=50),
            ],
            transports=[TransportLeg(mode="bus", from_place="丽江市区", to_place="雪山景区", duration_hours=1.2, estimated_cost_cny=40, notes="旅游专线估算。")],
            meals_note="午：简餐。",
            estimated_day_cost_cny=450,
            tips=["雪山日务必早出；天气窗口变化快。"],
        ),
    ]
    n = max(1, min(req.days, len(days_all)))
    days = days_all[:n]
    # renumber
    for i, d in enumerate(days, 1):
        d.day = i
    nights = max(1, n - 1)
    lodging = [
        LodgingOption(name="大理古城民宿（示例）", area="大理古城", nights=min(2, nights), estimated_nightly_cny=280, style="精品民宿", notes="示例数据 · 估算"),
        LodgingOption(name="丽江古城/束河客栈（示例）", area="丽江", nights=max(0, nights - 2), estimated_nightly_cny=300, style="客栈", notes="示例数据 · 估算")
        if nights > 2
        else LodgingOption(name="丽江客栈（示例）", area="丽江", nights=max(1, nights - min(2, nights)), estimated_nightly_cny=300, style="客栈", notes="示例数据 · 估算"),
    ]
    lodging = [L for L in lodging if L.nights > 0]
    if not lodging:
        lodging = [LodgingOption(name="滇西民宿（示例）", area=req.destination, nights=nights, estimated_nightly_cny=280, style="民宿", notes="示例数据")]
    long_haul = []
    if req.origin:
        long_haul.append(
            TransportLeg(
                mode="flight",
                from_place=req.origin,
                to_place="大理/丽江",
                duration_hours=3.5,
                estimated_cost_cny=1000 * req.travelers,
                notes="进滇机票单程估算；出滇可从另一城飞出。示例数据。",
            )
        )
    budget = build_budget(req, days, lodging, long_haul)
    return TripPlan(
        request=req,
        summary="云南大理→丽江串联：古城洱海开场，专日换城，丽江缓适应后再冲雪山。强调避免同日超长跨城跳跃。",
        highlights=["大理古城与洱海", "喜洲", "丽江古城/束河", "玉龙雪山（可选）"],
        days=days,
        lodging=lodging,
        long_haul=long_haul,
        budget=budget,
        sources=[
            SourceRef(title="丽江古城 - 维基百科", url="https://zh.wikipedia.org/wiki/丽江古城", snippet="示例引用。"),
            SourceRef(title="玉龙雪山 - 维基百科", url="https://zh.wikipedia.org/wiki/玉龙雪山", snippet="示例引用。"),
        ],
        warnings=["【示例数据】离线演示样本。", "高原与生态管控政策请以当地最新公告为准。"],
        is_mock_sample=True,
    )


def match_mock_plan(req: TripRequest) -> TripPlan | None:
    """Return a canned plan when destination matches known demos."""
    d = req.destination.strip()
    dl = d.lower()
    if "成都" in d or "chengdu" in dl:
        r = req.model_copy(update={"days": req.days or 3, "destination": "成都"})
        if r.days != 3:
            # still return 3-day sample but warn
            plan = _chengdu_3d(r.model_copy(update={"days": 3}))
            plan.warnings.append(f"示例行程固定 3 日；已忽略请求天数 {req.days}（可改用真实 LLM 管道自定义）。")
            return plan
        return _chengdu_3d(r)
    if "东京" in d or "tokyo" in dl:
        r = req.model_copy(update={"destination": "东京"})
        plan = _tokyo_5d(r.model_copy(update={"days": 5}))
        if req.days != 5:
            plan.warnings.append(f"示例行程固定 5 日；请求天数为 {req.days}。")
        return plan
    if any(k in d for k in ("大理", "丽江", "云南")) or "dali" in dl or "lijiang" in dl:
        r = req.model_copy(update={"destination": d if d else "云南大理丽江"})
        return _yunnan_dali_lijiang(r)
    return None


def generic_mock_plan(req: TripRequest) -> TripPlan:
    """Fallback mock when destination is unknown — still produces valid DayPlans."""
    from agent_workbench.travel.budget import defaults_for

    defs = defaults_for(req.destination)
    days: list[DayPlan] = []
    for i in range(1, req.days + 1):
        days.append(
            DayPlan(
                day=i,
                title=f"第{i}日 · {req.destination} 探索",
                theme="示例日程",
                activities=[
                    Activity(
                        name=f"{req.destination} 主要景点 {i}",
                        kind="sight",
                        start_time="09:30",
                        duration_hours=3.0,
                        area=req.destination,
                        notes="示例数据：请用真实研究管道替换具体景点。",
                        estimated_cost_cny=defs["attractions_day"],
                    ),
                    Activity(
                        name="本地特色餐",
                        kind="food",
                        start_time="12:30",
                        duration_hours=1.5,
                        estimated_cost_cny=defs["food_day"] * 0.5,
                        notes="估算",
                    ),
                    Activity(
                        name="街区漫步 / 博物馆（择一）",
                        kind="sight",
                        start_time="15:00",
                        duration_hours=2.5,
                        estimated_cost_cny=defs["attractions_day"] * 0.5,
                        notes="估算",
                    ),
                ],
                transports=[
                    TransportLeg(
                        mode="metro",
                        from_place="酒店",
                        to_place="市区景点",
                        duration_hours=0.5,
                        estimated_cost_cny=defs["local_transport_day"],
                    )
                ],
                meals_note="午晚当地餐（估算）。",
                estimated_day_cost_cny=defs["food_day"] + defs["attractions_day"] + defs["local_transport_day"],
                tips=["【示例数据】通用模板，非实地核验行程。"],
            )
        )
    nights = max(1, req.days - 1)
    lodging = [
        LodgingOption(
            name=f"{req.destination} 中档酒店（示例）",
            area="市中心",
            nights=nights,
            estimated_nightly_cny=defs["lodging_night"],
            style="商务酒店",
            notes="示例数据 · 估算",
        )
    ]
    budget = build_budget(req, days, lodging, None)
    return TripPlan(
        request=req,
        summary=f"{req.destination} {req.days} 日示例行程（通用模板）。",
        highlights=[f"{req.destination} 经典街区", "本地餐饮", "弹性半天活动"],
        days=days,
        lodging=lodging,
        long_haul=[],
        budget=budget,
        sources=[],
        warnings=["【示例数据】未匹配精选样本，使用通用模板。", "金额均为估算。"],
        is_mock_sample=True,
    )


class MockTravelPlanner:
    """Offline planner: returns curated samples or generic DayPlans."""

    def plan(self, req: TripRequest) -> TripPlan:
        matched = match_mock_plan(req)
        if matched is not None:
            return matched
        return generic_mock_plan(req)
