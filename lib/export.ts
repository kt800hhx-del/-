import { educationLabel } from "./constants";
import type { CareerAnalysis, UserBackground } from "./types";
import { BASIS_LABEL, LEVEL_LABEL, SEVERITY_LABEL } from "./types";

export const FIT: Record<string, string> = {
  strong: "较匹配",
  transferable: "可迁移",
  stretch: "跨度较大",
  unknown: "信息不足",
};

export const SEVERITY = SEVERITY_LABEL;

export function planToMarkdown(background: UserBackground, analysis: CareerAnalysis): string {
  const { role, gaps, phases, matchScore, seniority, totalMonths, credibility, evidenceChecklist, antiPatterns, transferPattern, thinBackground } = analysis;
  const today = new Date().toISOString().slice(0, 10);
  const tone = thinBackground ? "（输入偏薄，下列判断请先核实）" : "";

  const skillLines = gaps
    .filter((gap) => gap.type === "skill")
    .map((gap) => {
      const ev = gap.evidenceNeeded.map((item) => `    - ${item}`).join("\n");
      return `- **${gap.title}**（${SEVERITY_LABEL[gap.severity]} / ${gap.certainty === "assumed" ? "待核实" : "基于已填信息"}）
  - 当前：${gap.current}
  - 岗位侧：${gap.required}
  - 为何影响招聘：${gap.hiringWhy}
  - 需要的证据：
${ev}`;
    })
    .join("\n");

  const otherGaps = gaps
    .filter((gap) => gap.type !== "skill")
    .map((gap) => {
      const ev = gap.evidenceNeeded.map((item) => `    - ${item}`).join("\n");
      return `- **${gap.title}**（${SEVERITY_LABEL[gap.severity]}）
  - 当前：${gap.current}
  - 目标侧：${gap.required}
  - 为何影响招聘：${gap.hiringWhy}
  - 需要的证据：
${ev}`;
    })
    .join("\n");

  const reqBlock = (["must", "should", "nice"] as const)
    .map((level) => {
      const skills = role.skills.filter((s) => s.level === level);
      if (!skills.length) return "";
      return `### ${LEVEL_LABEL[level]}

${skills
  .map(
    (s) => `- **${s.name}**
  - 依据类型：${BASIS_LABEL[s.basisType]}
  - 说明：${s.jdPattern}
  - 示例交付：${s.deliverable}`,
  )
  .join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const phaseMd = phases
    .map((phase, index) => {
      const actions = phase.actions
        .map((action, i) => {
          const tasks = action.weeklyTasks.map((t) => `       - ${t}`).join("\n");
          const res = action.resources
            .map((r) => `       - [${r.name}](${r.url})（${r.kind}）：${r.note}`)
            .join("\n");
          return `  ${i + 1}. **${action.title}**（约 ${action.weeks} 周）
     - ${action.detail}
     - 周级任务：
${tasks}
     - 交付物：${action.deliverable}
     - 验收：${action.acceptance}${res ? `\n     - 资源：\n${res}` : ""}`;
        })
        .join("\n");
      const acc = phase.acceptance.map((item) => `- ${item}`).join("\n");
      const res = phase.resources
        .map((r) => `- [${r.name}](${r.url})（${r.kind}）：${r.note}`)
        .join("\n");
      return `### 阶段 ${index + 1}：${phase.name}（约 ${phase.durationMonths[0]}–${phase.durationMonths[1]} 个月）

**目标能力：** ${phase.targetAbility}

${phase.goal}

${actions}

**阶段验收：**
${acc}

**时长为何偏保守：** ${phase.whyConservative}

**行业先例 / 验证说明：** ${phase.industryPrecedent}

**可打开的学习资源（完整 https 链接）：**
${res || "（本阶段以你自己的 JD 对照与口述练习为主）"}`;
    })
    .join("\n\n");

  return `# IT 职业规划报告：${role.name}${tone}

> 生成日期：${today}  
> 工具：职业规划报告（方法论固定，背景只作输入）  
> 技能清单重合（关键词识别，**不是录用概率**）：${matchScore}%  
> 年限对照职级：${role.typicalTitles[seniority]}  
> 保守总周期：约 **${totalMonths[0]}–${totalMonths[1]} 个月**（每周 8–12 小时）

## 可信度说明

### 从 JD 模式与公开实践归纳

${credibility.jdDerived.map((item) => `- ${item}`).join("\n")}

### 来自当前输入的假设

${credibility.assumptions.map((item) => `- ${item}`).join("\n")}

### 方法边界

${credibility.methodLimits.map((item) => `- ${item}`).join("\n")}

- 不编造公司名、薪资或通过率。

## 1. 背景摘要

- 称呼：${background.name || "（未填）"}
- 学历：${educationLabel(background.education)}${background.major ? ` · ${background.major}` : ""}
- 工作年限：${background.yearsExperience} 年
- 当前岗位：${background.currentRole || "（未填）"}
- 意向城市：${background.preferredCity || "（未填）"}
- 技术栈：${background.techStack.length ? background.techStack.join("、") : "（未填）"}
- 兴趣：${background.interests.length ? background.interests.join("、") : "（未填）"}

### 项目备注

${background.projectNotes.trim() || "（未填）"}

### 简历原文（输入）

${background.resumeText.trim() || "（未粘贴）"}

## 2. 目标岗位与要求

**${role.name}**（${role.nameEn}）— ${role.tagline}

${role.summary}

典型转岗/补齐顺序：${transferPattern}

### 职级称呼对照

- 初级：${role.typicalTitles.junior}
- 中级：${role.typicalTitles.mid}
- 高级：${role.typicalTitles.senior}

${role.educationNote}

${reqBlock}

## 3. 差距分析

### 技能

${skillLines}

### 年限、项目、学历与协作

${otherGaps}

## 4. 分阶段路径

${phaseMd}

## 5. 证据清单

${evidenceChecklist.map((item) => `- [ ] ${item}`).join("\n")}

## 6. 风险与反模式

${antiPatterns.map((item) => `- ${item}`).join("\n")}

## 7. 下一步

更换目标岗位可重新生成，不必重填背景。每完成一阶段请回填项目备注，让下一次差距更准。
`;
}

export function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function filenameFor(roleName: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const safe = roleName.replace(/[\\/:*?"<>|]/g, "");
  return `职业规划报告-${safe}-${date}.md`;
}
