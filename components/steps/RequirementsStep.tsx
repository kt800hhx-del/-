"use client";

import type { CareerAnalysis } from "@/lib/types";

const LEVEL_LABEL = { must: "硬性 / 初筛常见", should: "中级高频", nice: "加分" };
const CATEGORY_LABEL: Record<string, string> = {
  language: "语言",
  framework: "框架",
  infra: "基础设施",
  domain: "领域",
  tool: "工具",
  soft: "协作",
};

export function RequirementsStep({ analysis }: { analysis: CareerAnalysis }) {
  const { role, seniority } = analysis;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.22em] text-celadon">第三步 · 对照市场</p>
        <h2 className="font-serif text-3xl leading-tight">{role.name}的常见要求</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted">{role.summary}</p>
      </header>

      <div className="paper-card rounded-2xl p-5">
        <p className="text-xs text-sage">按你的年限对照的常见职级称呼</p>
        <p className="mt-1 font-serif text-xl">{role.typicalTitles[seniority]}</p>
        <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-3">
          <div>
            <p className="text-xs text-sage">初级区间</p>
            <p>{role.typicalTitles.junior}</p>
          </div>
          <div>
            <p className="text-xs text-sage">中级区间</p>
            <p>{role.typicalTitles.mid}</p>
          </div>
          <div>
            <p className="text-xs text-sage">高级区间</p>
            <p>{role.typicalTitles.senior}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">{role.educationNote}</p>
      </div>

      <section className="space-y-4">
        {(["must", "should", "nice"] as const).map((level) => {
          const skills = role.skills.filter((skill) => skill.level === level);
          if (!skills.length) return null;
          return (
            <div key={level}>
              <h3 className="mb-2 font-serif text-lg">{LEVEL_LABEL[level]}</h3>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <article key={skill.id} className="rounded-2xl border border-line bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-medium">{skill.name}</h4>
                      <span className="text-xs text-sage">{CATEGORY_LABEL[skill.category] ?? skill.category}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{skill.jdPattern}</p>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-dashed border-line p-5">
        <h3 className="font-serif text-lg">这些要求依据什么</h3>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
          {role.sources.map((source) => (
            <li key={source}>· {source}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-sage">
          这里引用的是岗位描述的常见结构与公开工程实践，不是某家公司的实时招聘，也没有虚构统计数字。
        </p>
      </section>
    </div>
  );
}
