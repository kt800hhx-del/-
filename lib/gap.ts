import { educationLabel } from "./constants";
import { collectUserTokens, hasProjectEvidence, skillMatched, textLooksThin } from "./match";
import { getRoleMeta, hiringWhyForLevel } from "./role-meta";
import type { GapItem, RoleProfile, SkillRequirement, UserBackground } from "./types";
import { BASIS_LABEL } from "./types";

export function inferSeniority(years: number, role: RoleProfile): "junior" | "mid" | "senior" {
  if (years >= role.yearBands.senior[0]) return "senior";
  if (years >= role.yearBands.mid[0]) return "mid";
  return "junior";
}

function skillEvidence(skill: SkillRequirement): string[] {
  return [
    skill.deliverable,
    "面试时能在 10 分钟内讲清：适用边界、失败怎么处理、你验证过什么（小样本也要标明）。",
  ];
}

export function analyzeGaps(background: UserBackground, role: RoleProfile): GapItem[] {
  const tokens = collectUserTokens(background);
  const thin = textLooksThin(background);
  const gaps: GapItem[] = [];
  const meta = getRoleMeta(role.id);

  for (const skill of role.skills) {
    const matched = skillMatched(skill, tokens, background);
    const severity = matched
      ? "met"
      : skill.level === "must"
        ? "critical"
        : skill.level === "should"
          ? "moderate"
          : "minor";

    gaps.push({
      id: `skill-${skill.id}`,
      type: "skill",
      title: skill.name,
      current: matched
        ? "输入中出现了可对齐的技能标签或简历关键词（仍需项目证明深度）"
        : "未在技能标签或简历文本中识别到对应关键词",
      required: `${skill.level === "must" ? "必须具备" : skill.level === "should" ? "中级高频" : "加分"} · ${BASIS_LABEL[skill.basisType]}`,
      severity,
      certainty: thin && !matched ? "assumed" : "observed",
      hiringWhy: `${skill.jdPattern} ${hiringWhyForLevel(skill.level)}`,
      evidenceNeeded: skillEvidence(skill),
      advice: matched ? "标签已对齐。下一步是可演示深度，避免只有名词。" : skill.learnHint,
    });
  }

  const seniority = inferSeniority(background.yearsExperience, role);
  const midMin = role.yearBands.mid[0];
  let expSeverity: GapItem["severity"] = "met";
  let expAdvice = "年限只用于对照常见职级称呼，不是录用承诺。";
  if (background.yearsExperience < 1) {
    expSeverity = "moderate";
    expAdvice = "按应届/转行初级准备：用项目复杂度补偿职场年限，不要直接对标中级 JD 的「3 年相关」。";
  } else if (background.yearsExperience < midMin) {
    expSeverity = "moderate";
    expAdvice = `中级${role.name} JD 常写约 ${midMin} 年相关经验。年限不足时，用职责范围与可验证结果补，而不是改简历数字。`;
  }

  gaps.push({
    id: "experience-years",
    type: "experience",
    title: "相关经验年限",
    current: `${background.yearsExperience} 年（自评）`,
    required: `${role.typicalTitles[seniority]}；中级讨论常见 ${midMin}+ 年相关经验`,
    severity: expSeverity,
    certainty: "observed",
    hiringWhy: "国内社招 JD 普遍用年限做初筛分桶。年限不够不一定被拒，但会进入「用项目证明等价复杂度」的更严审查。",
    evidenceNeeded: [
      "简历每条经验写清你独立负责的边界（接口/模块/指标），避免只写「参与」。",
      "若年限短：准备 1 个能讲 20 分钟的项目深挖，覆盖设计、失败与验证。",
    ],
    advice: expAdvice,
  });

  const projectOk = hasProjectEvidence(background, role.skills.flatMap((skill) => skill.aliases.slice(0, 2)));
  gaps.push({
    id: "project-evidence",
    type: "project",
    title: "可验证项目证据",
    current: projectOk ? "简历/备注里出现了项目或职责描述（深度仍待面试验证）" : "缺少可验证的项目叙述",
    required: role.projectTemplates[0]?.evidence ?? "可演示仓库或线上结果 + 你的职责",
    severity: projectOk ? "met" : background.yearsExperience >= 2 ? "critical" : "moderate",
    certainty: thin ? "assumed" : "observed",
    hiringWhy: "项目深挖是社招第二道漏斗。只有技能词、没有可打开证据时，面试官无法核实「你做过」。",
    evidenceNeeded: meta.evidenceChecklist.slice(0, 3),
    advice: projectOk
      ? "把结果写具体：约束、决策、验证方式。没有大规模数据就写小样本。"
      : "按目标岗补 1 个可演示项目。没有公司项目就用个人项目，并标明。",
  });

  const eduSeverity =
    role.id === "ml" && (background.education === "college" || background.education === "high-school")
      ? "moderate"
      : background.education === "high-school"
        ? "moderate"
        : "met";

  gaps.push({
    id: "education",
    type: "education",
    title: "学历与专业背景",
    current: `${educationLabel(background.education)}${background.major ? ` · ${background.major}` : ""}`,
    required: role.educationNote,
    severity: eduSeverity,
    certainty: "observed",
    hiringWhy: "部分岗位（尤其算法）把学历写进硬筛选；多数工程岗更看作品，但仍会用学历做批量过滤。",
    evidenceNeeded:
      eduSeverity === "met"
        ? ["在项目叙述里体现专业训练如何用到工作，而不是只写学校名字。"]
        : ["用可复现作品集对冲学历筛选，并避开写明「硕士及以上硬性」的 JD。"],
    advice:
      eduSeverity === "met"
        ? "学历不是唯一信号；用项目与职责证明你能做这个岗位的工作。"
        : "学历与常见筛选有差距时，作品集需要明显更强。",
  });

  const softText = `${background.resumeText} ${background.projectNotes} ${background.currentRole}`;
  const softHit = /协作|沟通|复盘|负责|推进|跨部门|文档/.test(softText);
  gaps.push({
    id: "soft-skills",
    type: "soft",
    title: "协作与表达（文本可感知）",
    current: softHit ? "文本中出现过协作/负责/复盘等线索" : "文本几乎只有技术名词",
    required: role.softSkills.join("；"),
    severity: softHit ? "met" : "minor",
    certainty: thin ? "assumed" : "observed",
    hiringWhy: "社招会问跨端联调、复盘与推进。简历完全没有协作痕迹时，面试要额外证明。",
    evidenceNeeded: ["项目里写清协作对象、你推进的决策，以及一次分歧如何收口。"],
    advice: "用职责动词写协作，而不是单独列「沟通能力强」。",
  });

  if (thin) {
    gaps.push({
      id: "input-thin",
      type: "experience",
      title: "输入完整度",
      current: "技能、年限或项目描述偏空",
      required: "技术栈 + 年限 + 一段可检索的项目/学习叙述",
      severity: "moderate",
      certainty: "assumed",
      hiringWhy: "输入不足时，下面所有「缺口」都可能是漏填而不是真实短板；若按缺口去学，会浪费时间。",
      evidenceNeeded: ["先补全简历文本再生成一次，把「待核实」项逐条确认。"],
      advice: "当前报告必须带着假设阅读。补全输入后重新生成。",
    });
  }

  return gaps;
}

export function matchScore(gaps: GapItem[]): number {
  const skillGaps = gaps.filter((gap) => gap.type === "skill");
  if (skillGaps.length === 0) return 0;
  const weight = { met: 1, minor: 0.75, moderate: 0.4, critical: 0 };
  const sum = skillGaps.reduce((acc, gap) => acc + weight[gap.severity], 0);
  return Math.round((sum / skillGaps.length) * 100);
}
