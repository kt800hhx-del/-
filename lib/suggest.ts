import { interestRoleIds, skillMatched, textLooksThin } from "./match";
import { ROLES } from "./roles";
import type { FitLabel, SuggestedRole, UserBackground } from "./types";

function fitFromScore(score: number, thin: boolean): FitLabel {
  if (thin && score < 0.35) return "unknown";
  if (score >= 0.55) return "strong";
  if (score >= 0.35) return "transferable";
  return "stretch";
}

function currentRoleHints(text: string): string[] {
  const value = text.toLowerCase();
  const hits: string[] = [];
  const mapping: [string, string[]][] = [
    ["backend", ["后端", "服务端", "java", "golang", "go 开发", "server"]],
    ["frontend", ["前端", "react", "vue", "h5", "web 前端"]],
    ["fullstack", ["全栈", "独立开发", "全端"]],
    ["data-eng", ["数仓", "数据开发", "数据工程", "etl", "大数据"]],
    ["ml", ["算法", "机器学习", "推荐", "cv", "nlp"]],
    ["llm-app", ["大模型", "llm", "aigc", "rag"]],
    ["agent", ["agent", "智能体"]],
    ["devops", ["运维", "devops", "sre", "平台工程"]],
    ["qa", ["测试", "qa", "质量"]],
    ["tech-pm", ["产品经理", "pm", "产品"]],
    ["mobile", ["android", "ios", "客户端", "flutter", "移动端"]],
    ["security", ["安全", "渗透", "安全工程"]],
  ];
  for (const [roleId, keywords] of mapping) {
    if (keywords.some((keyword) => value.includes(keyword))) hits.push(roleId);
  }
  return hits;
}

export function suggestRoles(background: UserBackground): SuggestedRole[] {
  const thin = textLooksThin(background);
  const interestIds = new Set(interestRoleIds(background.interests));
  const currentIds = new Set(currentRoleHints(`${background.currentRole} ${background.resumeText}`));

  const suggestions = ROLES.map((role) => {
    const must = role.skills.filter((skill) => skill.level === "must");
    const should = role.skills.filter((skill) => skill.level === "should");
    const mustHits = must.filter((skill) => skillMatched(skill, new Set(), background)).length;
    const shouldHits = should.filter((skill) => skillMatched(skill, new Set(), background)).length;
    const mustRatio = must.length ? mustHits / must.length : 0;
    const shouldRatio = should.length ? shouldHits / should.length : 0;

    let score = mustRatio * 0.5 + shouldRatio * 0.15;
    const reasons: string[] = [];

    if (mustHits > 0) {
      reasons.push(`硬技能已有 ${mustHits}/${must.length} 项能对上常见 JD 清单`);
    }
    if (interestIds.has(role.id)) {
      score += 0.18;
      reasons.push("与你勾选的兴趣方向一致");
    }
    if (currentIds.has(role.id)) {
      score += 0.16;
      reasons.push("与当前岗位/简历描述同族，迁移成本相对更低");
    }
    if (background.yearsExperience >= role.yearBands.mid[0] && mustRatio >= 0.4) {
      score += 0.06;
      reasons.push("年限已进入该方向常见的中级讨论区间");
    }
    if (role.id === "ml" && (background.education === "master" || background.education === "phd")) {
      score += 0.05;
      reasons.push("学历背景更接近国内算法岗 JD 的常见筛选");
    }

    score = Math.max(0, Math.min(0.96, score));

    let caution: string | undefined;
    if (thin) {
      caution = "背景信息偏少，匹配度主要来自兴趣与少量技能，请把它当成假设而非结论。";
    } else if (mustRatio < 0.25 && !interestIds.has(role.id)) {
      caution = "与该方向硬技能重叠较低，属于跨度较大的转换，路径会按转行节奏拉长。";
    }

    if (reasons.length === 0) {
      reasons.push(thin ? "信息不足，仅作为目录中的可选方向列出" : "当前重叠有限，适合作为对照而不是默认目标");
    }

    return {
      roleId: role.id,
      score,
      fit: fitFromScore(score, thin),
      reasons,
      caution,
    } satisfies SuggestedRole;
  });

  return suggestions.sort((a, b) => b.score - a.score);
}
