import { textLooksThin } from "./match";
import type { GapItem, PlanPhase, RoleProfile, UserBackground } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function monthsPair(base: number, extra = 1): [number, number] {
  const low = clamp(Math.round(base), 1, 10);
  const high = clamp(Math.round(base + extra), low + 1, 12);
  return [low, high];
}

export function buildAssumptions(background: UserBackground, role: RoleProfile): string[] {
  const assumptions: string[] = [];
  if (textLooksThin(background)) {
    assumptions.push("背景偏薄：按「可投入业余学习、尚无完整作品集」的保守假设规划。");
  }
  if (!background.techStack.length) {
    assumptions.push("未填写技术栈：技能差距主要依据空集，实际可能已有未录入能力。");
  }
  if (!background.resumeText.trim() && !background.projectNotes.trim()) {
    assumptions.push("未提供简历或项目叙述：默认缺少可验证项目证据。");
  }
  if (background.yearsExperience <= 0) {
    assumptions.push("工作年限为 0：按转行/应届节奏，不按在职晋升节奏压缩时间。");
  }
  if (!background.preferredCity) {
    assumptions.push("未填城市：求职阶段按「一线及新一线岗位密度较高、竞争也更强」的通用假设。");
  }
  if (role.id === "ml" && background.education !== "master" && background.education !== "phd") {
    assumptions.push("目标为算法岗且学历不是硕士/博士：规划假设你走应用算法 + 作品集路径，并避开硬性硕士筛选。");
  }
  if (assumptions.length === 0) {
    assumptions.push("按每周可投入约 8–12 小时的在职学习节奏估算；全职投入可以缩短，但下面仍给保守区间。");
  } else {
    assumptions.push("时间按每周 8–12 小时估算；全职学习可缩短，但不要按「几天速成」理解。");
  }
  return assumptions;
}

export function buildPhases(
  background: UserBackground,
  role: RoleProfile,
  gaps: GapItem[],
): PlanPhase[] {
  const thin = textLooksThin(background);
  const missingMust = gaps.filter((gap) => gap.type === "skill" && gap.severity === "critical");
  const missingShould = gaps.filter((gap) => gap.type === "skill" && gap.severity === "moderate");
  const projectGap = gaps.find((gap) => gap.id === "project-evidence" && gap.severity !== "met");
  const overlapLow = missingMust.length >= Math.ceil(role.skills.filter((s) => s.level === "must").length * 0.6);

  const phase1Months = monthsPair(
    2 + missingMust.length * 0.7 + missingShould.length * 0.25 + (overlapLow ? 1.5 : 0) + (thin ? 1 : 0),
    2,
  );

  const skillByName = new Map(role.skills.map((skill) => [skill.name, skill]));
  const foundationActions = [...missingMust, ...missingShould].slice(0, 5).map((gap) => {
    const skill = skillByName.get(gap.title);
    return {
      title: `补齐：${gap.title}`,
      detail: skill?.learnHint ?? gap.advice,
      deliverable: skill?.deliverable ?? "可演示的最小作业 + 学习笔记",
      weeks: gap.severity === "critical" ? 4 : 3,
    };
  });

  if (foundationActions.length === 0) {
    foundationActions.push({
      title: "把已有技能变成可讲的深度",
      detail: "硬技能标签已能对上常见 JD。下一层是原理、边界和一次可量化的优化/排障，而不是再堆名词。",
      deliverable: "一份「我在生产/项目里做过的取舍」笔记，覆盖该岗位面试高频点。",
      weeks: 4,
    });
  }

  const project = role.projectTemplates[0] ?? {
    title: "可演示的岗位向项目",
    detail: "做一个能讲清职责、约束与验证方式的项目。",
    evidence: "仓库或文档 + 你的决策说明。",
    months: [2, 3] as [number, number],
  };
  const extraProject = role.projectTemplates[1];
  const phase2Months = monthsPair(
    (project?.months[0] ?? 2) + (projectGap ? 1 : 0) + (thin ? 1 : 0),
    (project?.months[1] ?? 3) - (project?.months[0] ?? 2) + 1,
  );

  const phase3Months = monthsPair(background.yearsExperience >= 3 ? 1 : 1.4, 1);
  const phase4Months = monthsPair(
    background.preferredCity === "北京" ||
      background.preferredCity === "上海" ||
      background.preferredCity === "深圳" ||
      background.preferredCity === "杭州"
      ? 2.5
      : 2,
    2,
  );

  const cityNote = background.preferredCity
    ? `意向城市为「${background.preferredCity}」。一线及新一线岗位更多，但筛选更看相关项目与年限匹配；远程岗位更看可验证作品与书面沟通。`
    : "未填城市时，先按可远程演示的作品集准备，再决定是否专攻某城市市场。";

  return [
    {
      id: "foundation",
      name: "补齐硬门槛基础",
      durationMonths: phase1Months,
      goal: "先补常见 JD 会卡初筛的硬技能，避免一上来做花哨项目却过不了关键词与基础面试。",
      actions: foundationActions,
      verification:
        "社招筛选普遍先看技能栈是否对得上 JD 关键词，再看项目。先补 must-have 再做作品，是国内招聘平台岗位描述里最常见的隐含顺序。",
    },
    {
      id: "projects",
      name: "做出可验证项目证据",
      durationMonths: phase2Months,
      goal: "用 1 个（必要时 2 个）项目证明你能承担该岗位的典型工作，而不是只会列出技术名词。",
      actions: [
        {
          title: project.title,
          detail: project.detail,
          deliverable: project.evidence,
          weeks: project.months[1] * 4,
        },
        ...(extraProject && (projectGap || thin)
          ? [
              {
                title: extraProject.title,
                detail: extraProject.detail,
                deliverable: extraProject.evidence,
                weeks: extraProject.months[0] * 4,
              },
            ]
          : [
              {
                title: "把项目写成面试叙事",
                detail: "用「背景—约束—你的决策—结果—局限」写一页。结果尽量可核对；没有大规模数据就写小样本，不要编造统计。",
                deliverable: "项目一页纸 + README 里的架构与取舍。",
                weeks: 2,
              },
            ]),
      ],
      verification:
        "中高级 JD 和面试都在找「你独立负责过什么」。开源仓库、线上 Demo、复盘笔记是行业里最常见的可携带证据，不依赖某家公司背书。",
    },
    {
      id: "align",
      name: "对齐岗位表达",
      durationMonths: phase3Months,
      goal: "让简历、作品介绍和面试答案指向同一目标 Title，而不是一份通投简历打所有方向。",
      actions: [
        {
          title: "按目标岗重写简历要点",
          detail: `只保留能服务「${role.name}」的证据。用职责动词（设计/落地/排查/度量），每条尽量带约束与结果。`,
          deliverable: "1 页中文简历 + 对应英文要点（若投外企/跨境团队）。",
          weeks: 2,
        },
        {
          title: "按该岗高频问题做口语化准备",
          detail: `优先覆盖：${role.interviewFocus.join("；")}。每题准备 90 秒版本和 4 分钟版本。`,
          deliverable: "8–12 道题的口述提纲（不要背稿）。",
          weeks: 3,
        },
        {
          title: "用公开 JD 做对照，而不是虚构公司",
          detail: "在 BOSS / 拉勾 / 猎聘 / LinkedIn 上找 8–10 份真实在招 JD，统计反复出现的技能与年限，回写你的缺口清单。",
          deliverable: "一张「JD 词频 vs 我的证据」对照表。",
          weeks: 2,
        },
      ],
      verification:
        "招聘流程的普遍结构是：关键词初筛 → 简历项目深挖 → 基础/系统设计或案例分析。把表达对齐目标 Title，是跟这个漏斗匹配，而不是包装。",
    },
    {
      id: "search",
      name: background.yearsExperience >= 3 && !overlapLow ? "求职或内部晋升" : "求职落地",
      durationMonths: phase4Months,
      goal: "用足够样本的投递/内部述职去验证市场，而不是只完善材料。",
      actions: [
        {
          title: "按匹配度分层投递或内部对齐",
          detail: `${cityNote} 先投技能重叠高的岗位，再投迁移岗。若在职且方向一致，可并行准备内部晋升材料。`,
          deliverable: "岗位分级表（匹配 / 可迁移 / 跨度大）与每周复盘。",
          weeks: 6,
        },
        {
          title: "把每次面试当成数据，而不是情绪事件",
          detail: "记录被问到但答不稳的点，回到阶段一或阶段二补一个最小证据，再继续。",
          deliverable: "面试日志（问题、卡点、补齐动作）。",
          weeks: 4,
        },
      ],
      verification:
        "国内社招从投递到拿下合适 Offer 常见是以周和月计；一线城市竞争更高。把求职阶段单独留出时间，是为了避免「学完就立刻成功」的不现实预期。",
    },
  ];
}

export function totalMonths(phases: PlanPhase[]): [number, number] {
  return phases.reduce<[number, number]>(
    (acc, phase) => [acc[0] + phase.durationMonths[0], acc[1] + phase.durationMonths[1]],
    [0, 0],
  );
}
