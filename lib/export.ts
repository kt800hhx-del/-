import { educationLabel } from "./constants";
import type { CareerAnalysis, UserBackground } from "./types";

const SEVERITY: Record<string, string> = {
  critical: "关键缺口",
  moderate: "需要补齐",
  minor: "加分缺口",
  met: "已具备",
};

const FIT: Record<string, string> = {
  strong: "较匹配",
  transferable: "可迁移",
  stretch: "跨度较大",
  unknown: "信息不足",
};

export function planToMarkdown(background: UserBackground, analysis: CareerAnalysis): string {
  const { role, gaps, phases, assumptions, matchScore, seniority, totalMonths } = analysis;
  const today = new Date().toISOString().slice(0, 10);

  const skillLines = gaps
    .filter((gap) => gap.type === "skill")
    .map((gap) => `- **${gap.title}**（${SEVERITY[gap.severity]}）：${gap.current}。建议：${gap.advice}`)
    .join("\n");

  const otherGaps = gaps
    .filter((gap) => gap.type !== "skill")
    .map((gap) => `- **${gap.title}**（${SEVERITY[gap.severity]}）\n  - 当前：${gap.current}\n  - 目标侧：${gap.required}\n  - 建议：${gap.advice}`)
    .join("\n");

  const reqMust = role.skills
    .filter((s) => s.level === "must")
    .map((s) => `- **${s.name}**：${s.jdPattern}`)
    .join("\n");
  const reqShould = role.skills
    .filter((s) => s.level === "should")
    .map((s) => `- **${s.name}**：${s.jdPattern}`)
    .join("\n");

  const phaseMd = phases
    .map((phase, index) => {
      const actions = phase.actions
        .map(
          (action) =>
            `  ${phase.actions.indexOf(action) + 1}. **${action.title}**（约 ${action.weeks} 周）\n     - ${action.detail}\n     - 交付物：${action.deliverable}`,
        )
        .join("\n");
      return `### 阶段 ${index + 1}：${phase.name}（约 ${phase.durationMonths[0]}–${phase.durationMonths[1]} 个月）

目标：${phase.goal}

${actions}

**为何这一步说得通：** ${phase.verification}`;
    })
    .join("\n\n");

  return `# IT 职业规划：${role.name}

> 生成日期：${today}  
> 工具：职业规划砚台（方法论固定，简历/背景只作为输入）  
> 技能匹配度（基于已识别技能）：${matchScore}%  
> 按年限对照的常见 Title：${role.typicalTitles[seniority]}  
> 保守总周期：约 **${totalMonths[0]}–${totalMonths[1]} 个月**

## 使用边界

- 岗位要求来自国内招聘平台（BOSS 直聘、拉勾、猎聘）与 LinkedIn / Indeed 同类 JD 的**常见结构**，以及公开工程实践，**不是**某家公司的实时招聘数据。
- 本文件不包含虚构公司名、虚构薪资统计或虚构「通过率」。
- 时间按每周约 8–12 小时的保守节奏；全职投入可以缩短，但不建议按天计算。

## 规划假设

${assumptions.map((item) => `- ${item}`).join("\n")}

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

## 2. 目标岗位与常见要求

**${role.name}**（${role.nameEn}）— ${role.tagline}

${role.summary}

### 常见 Title 对照

- 初级：${role.typicalTitles.junior}
- 中级：${role.typicalTitles.mid}
- 高级：${role.typicalTitles.senior}

### 学历侧常见写法

${role.educationNote}

### 硬性技能（must）

${reqMust}

### 高频加分 / 中级项（should）

${reqShould || "（该方向 should 项已并入上文）"}

### 信息来源类型

${role.sources.map((s) => `- ${s}`).join("\n")}

## 3. 差距分析

### 技能

${skillLines}

### 年限、项目、学历与协作

${otherGaps}

## 4. 分阶段路径

${phaseMd}

## 5. 下一步

你可以在工具中更换目标岗位并重新生成路径，无需重填背景。建议每完成一个阶段就回填项目备注，让下一次差距分析更准。
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
  return `职业规划-${safe}-${date}.md`;
}

export { FIT, SEVERITY };
