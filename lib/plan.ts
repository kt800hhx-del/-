import { textLooksThin } from "./match";
import { getRoleMeta } from "./role-meta";
import type {
  CredibilityNote,
  GapItem,
  PlanAction,
  PlanPhase,
  ResourceRef,
  RoleProfile,
  UserBackground,
} from "./types";

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
    assumptions.push("背景偏薄：按「业余学习、尚无完整作品集」的保守假设。下列缺口优先视为待核实。");
  }
  if (!background.techStack.length) {
    assumptions.push("未填写技术栈：技能重合按空集计算，你可能已有未录入能力。");
  }
  if (!background.resumeText.trim() && !background.projectNotes.trim()) {
    assumptions.push("未提供简历或项目叙述：默认缺少可打开的项目证据。");
  }
  if (background.yearsExperience <= 0) {
    assumptions.push("工作年限为 0：按转行/应届节奏，不按在职晋升压缩工期。");
  }
  if (!background.preferredCity) {
    assumptions.push("未填城市：求职阶段按一线及新一线「岗位更多、筛选也更紧」的通用假设。");
  }
  if (role.id === "ml" && background.education !== "master" && background.education !== "phd") {
    assumptions.push("算法岗且学历不是硕博：假设走应用算法 + 作品集，并避开硬性硕士筛选。");
  }
  assumptions.push("工时按每周 8–12 小时估算；全职可以缩短，但不按「几天速成」理解。");
  return assumptions;
}

export function buildCredibility(
  background: UserBackground,
  role: RoleProfile,
  assumptions: string[],
  thin: boolean,
): CredibilityNote {
  return {
    jdDerived: [
      ...role.sources,
      "必须 / 加分的划分来自同类岗位描述里「硬性要求 / 优先 / 加分」的常见写法，不是某次爬取的统计。",
      "阶段顺序（硬技能 → 可验证项目 → 简历面试对齐 → 求职样本）对应国内社招漏斗的通行结构：关键词初筛 → 项目深挖 → 基础或设计面 → 多轮业务面。",
    ],
    assumptions,
    methodLimits: [
      "本工具不读取实时招聘接口，也不预测薪资或通过率。",
      thin
        ? "输入不足时，报告用「倾向于 / 待核实」，请不要把缺口当成已证实短板。"
        : "技能重合来自你填写的标签与简历关键词，不是面试评分。",
      "列出的文档与课程是公开存在的示例起点，需按你的具体语言栈选择，不构成赞助或保证。",
    ],
  };
}

function pickResources(all: ResourceRef[], count = 3): ResourceRef[] {
  return all.slice(0, count);
}

function foundationAction(
  title: string,
  learnHint: string,
  deliverable: string,
  weeks: number,
  resources: ResourceRef[],
  thin: boolean,
): PlanAction {
  return {
    title,
    detail: learnHint,
    weeklyTasks: [
      `第 1 周：按官方文档（见参考资源）过完核心章节，用自己的话写下「适用边界」与「我还不会什么」。${thin ? "若你其实已会，先做一次自测再决定是否跳过。" : ""}`,
      "第 2 周：完成一个最小可运行练习，不复制完整教程仓库；提交要能看出是你写的。",
      `第 3${weeks > 3 ? "–4" : ""} 周：做出交付物，并写 10 行以内的验收说明（如何启动、如何证明它做对了）。`,
    ].filter(Boolean),
    deliverable,
    acceptance: "他人按 README 能启动；你能在 10 分钟内讲清取舍与失败路径。没有数据就标明小样本。",
    weeks,
    resources,
  };
}

export function buildPhases(
  background: UserBackground,
  role: RoleProfile,
  gaps: GapItem[],
): PlanPhase[] {
  const thin = textLooksThin(background);
  const meta = getRoleMeta(role.id);
  const missingMust = gaps.filter((gap) => gap.type === "skill" && gap.severity === "critical");
  const missingShould = gaps.filter((gap) => gap.type === "skill" && gap.severity === "moderate");
  const projectGap = gaps.find((gap) => gap.id === "project-evidence" && gap.severity !== "met");
  const overlapLow = missingMust.length >= Math.ceil(role.skills.filter((s) => s.level === "must").length * 0.6);
  const skillByName = new Map(role.skills.map((skill) => [skill.name, skill]));

  const phase1Months = monthsPair(
    2 + missingMust.length * 0.7 + missingShould.length * 0.25 + (overlapLow ? 1.5 : 0) + (thin ? 1 : 0),
    2,
  );

  const foundationActions: PlanAction[] = [...missingMust, ...missingShould].slice(0, 5).map((gap) => {
    const skill = skillByName.get(gap.title);
    return foundationAction(
      `补齐：${gap.title}`,
      skill?.learnHint ?? gap.advice,
      skill?.deliverable ?? "最小可运行作业 + 边界笔记",
      gap.severity === "critical" ? 4 : 3,
      pickResources(meta.resources, 2),
      thin,
    );
  });

  if (foundationActions.length === 0) {
    foundationActions.push(
      foundationAction(
        "把已对齐技能做成可深挖叙事",
        "关键词已能对上常见 JD。本阶段不再堆名词，而是补一次可量化的优化/排障，以及该岗位面试高频原理。",
        "一份「生产或项目中的取舍」笔记，覆盖该岗位 3 个高频面试点，并指向仓库里的具体提交。",
        4,
        pickResources(meta.resources, 3),
        thin,
      ),
    );
  }

  const project = role.projectTemplates[0] ?? {
    title: "岗位向可演示项目",
    detail: "做一个能讲清职责、约束与验证方式的项目。",
    evidence: "仓库或文档 + 决策说明。",
    months: [2, 3] as [number, number],
  };
  const extraProject = role.projectTemplates[1];
  const phase2Months = monthsPair((project.months[0] ?? 2) + (projectGap ? 1 : 0) + (thin ? 1 : 0), 2);

  const projectActions: PlanAction[] = [
    {
      title: project.title,
      detail: project.detail,
      weeklyTasks: [
        "第 1 周：写一页范围（要做 / 不做 / 验收）。对照目标岗 JD 高频词，只保留能证明该岗位工作的切片。",
        "第 2–3 周：实现主路径，保证他人能按 README 启动。先正确，再谈扩展。",
        "第 4 周起：补失败路径、一次可复核验证（测试、评测、压测或复盘，按岗位选择），并画系统图。",
      ],
      deliverable: project.evidence,
      acceptance: meta.evidenceChecklist.slice(0, 3).join("；"),
      weeks: project.months[1] * 4,
      resources: pickResources(meta.resources, 3),
    },
  ];

  if (extraProject && (projectGap || thin)) {
    projectActions.push({
      title: extraProject.title,
      detail: extraProject.detail,
      weeklyTasks: [
        "用更小范围做第二证据，专门补第一份项目没覆盖的 JD 词。",
        "同样要求可启动与失败说明，避免再做一个半成品。",
      ],
      deliverable: extraProject.evidence,
      acceptance: extraProject.evidence,
      weeks: extraProject.months[0] * 4,
      resources: pickResources(meta.resources, 2),
    });
  } else {
    projectActions.push({
      title: "写成面试官能核对的叙事",
      detail: "用「背景—约束—决策—结果—局限」。结果可核对；没有大规模数据就写小样本，不编造统计。",
      weeklyTasks: [
        "用仓库 README 写清架构、如何运行、你做了哪一层。",
        "准备 4 分钟口述与 20 分钟深挖提纲，指向具体文件或提交。",
      ],
      deliverable: "项目一页纸 + README 中的架构与取舍。",
      acceptance: "不看你演示、只看 README 也能复现启动；口述不依赖「当时环境在我电脑上」。",
      weeks: 2,
      resources: [],
    });
  }

  const phase3Months = monthsPair(background.yearsExperience >= 3 ? 1 : 1.4, 1);
  const phase4Months = monthsPair(
    ["北京", "上海", "深圳", "杭州"].includes(background.preferredCity) ? 2.5 : 2,
    2,
  );
  const cityNote = background.preferredCity
    ? `意向城市为「${background.preferredCity}」。一线及新一线岗位密度高，筛选更看相关项目与年限是否同桶；远程更看书面沟通与可访问 Demo。`
    : "未填城市：先准备可远程演示的作品，再决定是否专攻某城市。";

  const soften = thin ? "在核实背景之前，把下列动作当作假设性安排：" : "";

  return [
    {
      id: "foundation",
      name: "补齐硬门槛",
      durationMonths: phase1Months,
      targetAbility: "能通过该岗位 JD 的关键词初筛，并回答该方向最基础的原理/边界问题。",
      goal: `${soften}先补常见 JD 会卡初筛的硬技能，避免一上来做花哨项目却过不了基础面。`,
      actions: foundationActions,
      acceptance: [
        "缺失的 must 项都有对应小交付物，而不是只有课程进度条。",
        "能用自己的话解释每项技能「什么时候不该用」。",
      ],
      whyConservative: `按每周 8–12 小时，一项从相邻栈迁移的硬技能通常要 3–6 周才能做出可演示作业；从零或跨度大再加缓冲。区间 ${phase1Months[0]}–${phase1Months[1]} 个月包含返工，不按连续脱产计算。`,
      industryPrecedent: meta.transferPattern,
      resources: meta.resources,
    },
    {
      id: "projects",
      name: "可验证项目证据",
      durationMonths: phase2Months,
      targetAbility: "拿出 1 个（必要时 2 个）能代表该岗位日常工作的项目，经得起 20 分钟深挖。",
      goal: `${soften}用作品证明你能承担典型工作，而不是只会列出技术名词。`,
      actions: projectActions,
      acceptance: meta.evidenceChecklist,
      whyConservative: `可演示项目从范围冻结到 README/复盘，在职通常跨 2 个以上迭代。区间已计入「做完主路径后还要补失败案例」的时间，这是面试最常暴露的缺口。`,
      industryPrecedent:
        "中高级 JD 与面试普遍在找「你独立负责过什么」。开源仓库、可访问 Demo、复盘笔记是不依赖某一雇主背书的可携带证据；作品集惯例来自开源社区与工程招聘的通行做法，而非某家公司内部模板。",
      resources: pickResources(meta.resources, 4),
    },
    {
      id: "align",
      name: "对齐岗位表达",
      durationMonths: phase3Months,
      targetAbility: "简历、仓库介绍与口述指向同一个 Title，并能用真实在招 JD 回写缺口。",
      goal: `${soften}让材料对准目标岗位，而不是一份通投简历。`,
      actions: [
        {
          title: "按目标岗重写简历要点",
          detail: `只保留服务「${role.name}」的证据。职责动词 + 约束 + 结果。`,
          weeklyTasks: [
            "第 1 周：列出证据库存，删除与目标岗无关的条目。",
            "第 2 周：每条改成「做了什么 / 限制条件 / 如何验证」，避免形容词。",
          ],
          deliverable: "1 页中文简历；如投跨境团队再补英文要点。",
          acceptance: "未参与过你项目的人能指出你独立负责的边界。",
          weeks: 2,
          resources: [],
        },
        {
          title: "按该岗高频问题做口语化准备",
          detail: `优先：${role.interviewFocus.join("；")}。`,
          weeklyTasks: [
            "每题准备 90 秒与 4 分钟两个版本，指向仓库里的文件或复盘。",
            "找一次模拟（同事或录音自听），记录卡点并回到阶段一/二补最小证据。",
          ],
          deliverable: "8–12 题口述提纲（不背稿）。",
          acceptance: "被追问「为什么不选另一方案」时，能说出约束而不是背定义。",
          weeks: 3,
          resources: [],
        },
        {
          title: "用公开在招 JD 做对照",
          detail: "在 BOSS / 拉勾 / 猎聘 / LinkedIn 打开 8–10 份真实 JD，统计反复出现的技能与年限。不要编造公司案例。",
          weeklyTasks: [
            "建一张表：技能词 / 出现次数量级（高/中/低，不要伪精确百分比）/ 你是否有证据。",
            "把「高频且你无证据」的词排进下一迭代，而不是改简历造假。",
          ],
          deliverable: "「JD 词频（粗）vs 我的证据」对照表。",
          acceptance: "表中每一行能链到仓库、文档或「明确缺失」。",
          weeks: 2,
          resources: [],
        },
      ],
      acceptance: ["简历与仓库 Title 一致", "有一份基于真实公开 JD 的对照表", "高频面试题能落到证据"],
      whyConservative: "对齐材料看似「写简历」，但对照真实 JD 与模拟面试通常要 4–8 周才会稳定，尤其在职。",
      industryPrecedent:
        "招聘漏斗的通行结构是关键词初筛 → 简历项目深挖 → 基础/设计或案例。把表达对准目标 Title，是匹配这个漏斗，不是包装履历。",
      resources: [],
    },
    {
      id: "search",
      name: background.yearsExperience >= 3 && !overlapLow ? "求职或内部晋升" : "求职落地",
      durationMonths: phase4Months,
      targetAbility: "用足够样本的投递或内部述职去验证市场，并把失败反馈变成补证据的输入。",
      goal: `${soften}验证材料是否被市场接受，而不是无限完善作品。`,
      actions: [
        {
          title: "按匹配度分层行动",
          detail: cityNote,
          weeklyTasks: [
            "每周固定时段投递或内部对齐：先匹配岗，再迁移岗，跨度大的控制比例。",
            "记录未进入面试的 JD 共同词，回到阶段二补最小证据，而不是同时改五个方向。",
          ],
          deliverable: "岗位分级表（匹配 / 可迁移 / 跨度大）+ 每周复盘。",
          acceptance: "能说出本周为什么投这些、下一周补哪一条证据。",
          weeks: 6,
          resources: [],
        },
        {
          title: "把面试当数据",
          detail: "记录答不稳的点，回到前两阶段补一个最小证据再继续。",
          weeklyTasks: [
            "每次后面 30 分钟：问题、卡点、要补的证据、是否与目标岗仍一致。",
            "连续同类失败时，只改一条假设（例如评测缺失），避免全盘推翻。",
          ],
          deliverable: "面试日志。",
          acceptance: "日志能映射到仓库或文档的一次实际补充。",
          weeks: 4,
          resources: [],
        },
      ],
      acceptance: ["有分层样本而不是只投一家", "失败有回写到证据清单"],
      whyConservative:
        "国内社招从投递到合适结果常见以周和月计；一线城市竞争更高。单独留出求职阶段，是为了避免「学完立刻成功」的不现实预期。这里不引用任何编造的通过率。",
      industryPrecedent:
        "把求职当作验证环，是职业咨询里常见的「先小样本验证定位再放量」，不是某家猎头的内部数字。",
      resources: [],
    },
  ];
}

export function totalMonths(phases: PlanPhase[]): [number, number] {
  return phases.reduce<[number, number]>(
    (acc, phase) => [acc[0] + phase.durationMonths[0], acc[1] + phase.durationMonths[1]],
    [0, 0],
  );
}
