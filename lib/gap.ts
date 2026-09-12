import { educationLabel } from "./constants";
import { collectUserTokens, hasProjectEvidence, skillMatched, textLooksThin } from "./match";
import type { GapItem, RoleProfile, UserBackground } from "./types";

export function inferSeniority(years: number, role: RoleProfile): "junior" | "mid" | "senior" {
  if (years >= role.yearBands.senior[0]) return "senior";
  if (years >= role.yearBands.mid[0]) return "mid";
  return "junior";
}

export function analyzeGaps(background: UserBackground, role: RoleProfile): GapItem[] {
  const tokens = collectUserTokens(background);
  const gaps: GapItem[] = [];

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
      current: matched ? "背景/简历中能对上相关关键词或技能标签" : "未在技能标签或简历文本中识别到",
      required: skill.level === "must" ? "常见 JD 硬性项" : skill.level === "should" ? "中级 JD 高频项" : "加分项",
      severity,
      advice: matched ? "保持可演示，避免只有名词没有项目。" : skill.learnHint,
    });
  }

  const seniority = inferSeniority(background.yearsExperience, role);
  const midMin = role.yearBands.mid[0];
  const seniorMin = role.yearBands.senior[0];
  let expSeverity: GapItem["severity"] = "met";
  let expAdvice = "年限本身不是录用承诺，但仍能对上该职级称呼的常见讨论区间。";
  if (background.yearsExperience < 1 && seniority === "junior") {
    expSeverity = "moderate";
    expAdvice = "按应届/转行初级路径准备：用项目年限补偿职场年限，避免直接对标中级 JD。";
  } else if (background.yearsExperience < midMin) {
    expSeverity = "moderate";
    expAdvice = `多数中级${role.name} JD 会写 ${midMin} 年左右相关经验；不足时需用项目复杂度与职责范围补证据。`;
  }
  if (seniority === "senior" && background.yearsExperience < seniorMin + 1) {
    expAdvice = "已接近高级讨论区间，面试会更看架构与带事能力，而不是技能名词数量。";
  }

  gaps.push({
    id: "experience-years",
    type: "experience",
    title: "相关经验年限",
    current: `${background.yearsExperience} 年（自评）`,
    required: `${role.typicalTitles[seniority]}；中级常见 ${midMin}+ 年相关经验`,
    severity: expSeverity,
    advice: expAdvice,
  });

  const projectOk = hasProjectEvidence(background, role.skills.flatMap((skill) => skill.aliases.slice(0, 2)));
  gaps.push({
    id: "project-evidence",
    type: "project",
    title: "可验证项目证据",
    current: projectOk ? "简历/备注里出现了项目或职责描述" : "缺少可验证的项目叙述",
    required: role.projectTemplates[0]?.evidence ?? "可演示仓库或线上结果 + 你的职责",
    severity: projectOk ? "met" : background.yearsExperience >= 2 ? "critical" : "moderate",
    advice: projectOk
      ? "把结果写具体：你做了什么、约束是什么、怎么验证。避免只写参与。"
      : "按目标岗补 1 个可演示项目。没有公司项目就用个人项目，但必须能讲清取舍。",
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
    advice:
      eduSeverity === "met"
        ? "学历不是唯一信号；用项目与职责证明你能做这个岗位的工作。"
        : "学历与常见筛选有差距时，作品集、开源与可验证结果需要明显更强，并避开硬性硕士筛选的岗位。",
  });

  const softText = `${background.resumeText} ${background.projectNotes} ${background.currentRole}`;
  const softHit = /协作|沟通|复盘|负责|推进|跨部门|文档/.test(softText);
  gaps.push({
    id: "soft-skills",
    type: "soft",
    title: "协作与表达（简历可感知部分）",
    current: softHit ? "文本中出现过协作/负责/复盘等线索" : "文本几乎只有技术名词，缺少协作证据",
    required: role.softSkills.join("；"),
    severity: softHit ? "met" : "minor",
    advice: "在项目叙述里写清协作对象与你如何推进，面试会问到。",
  });

  if (textLooksThin(background)) {
    gaps.push({
      id: "input-thin",
      type: "experience",
      title: "输入完整度",
      current: "技能、年限或项目描述偏空",
      required: "至少给出技术栈、年限和一段可检索的项目/学习叙述",
      severity: "moderate",
      advice: "当前规划带有较多假设。补全简历文本后重新生成，差距会更准。",
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
