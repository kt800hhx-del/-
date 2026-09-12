"use client";

import type { CareerAnalysis } from "@/lib/types";
import { BASIS_LABEL, CATEGORY_LABEL, LEVEL_LABEL } from "@/lib/types";
import { SectionTitle } from "../ui";

export function RequirementsStep({ analysis }: { analysis: CareerAnalysis }) {
  const { role, seniority } = analysis;

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="03 / 市场对照"
        title={`${role.name}的常见要求`}
        desc={role.summary}
      />

      <section className="report-shell divide-y divide-hair">
        <div className="grid gap-4 p-5 md:grid-cols-4 md:p-6">
          <div className="md:col-span-2">
            <p className="label">按你的年限对照</p>
            <p className="mt-2 font-serif text-xl">{role.typicalTitles[seniority]}</p>
          </div>
          <div>
            <p className="label">初级</p>
            <p className="mt-2 text-[13px] leading-5">{role.typicalTitles.junior}</p>
          </div>
          <div>
            <p className="label">中级 / 高级</p>
            <p className="mt-2 text-[13px] leading-5">{role.typicalTitles.mid}</p>
            <p className="mt-1 text-[13px] leading-5 text-muted">{role.typicalTitles.senior}</p>
          </div>
        </div>
        <p className="px-5 py-4 text-[13px] leading-6 text-muted md:px-6">{role.educationNote}</p>
      </section>

      {(["must", "should", "nice"] as const).map((level) => {
        const skills = role.skills.filter((skill) => skill.level === level);
        if (!skills.length) return null;
        return (
          <section key={level} className="report-shell overflow-hidden">
            <div className="flex items-center justify-between border-b border-hair px-5 py-3 md:px-6">
              <h3 className="text-[13px] font-medium">{LEVEL_LABEL[level]}</h3>
              <span className="text-[11px] text-muted">{skills.length} 项</span>
            </div>
            <div className="divide-y divide-hair">
              {skills.map((skill) => (
                <article key={skill.id} className="grid gap-3 px-5 py-4 md:grid-cols-12 md:px-6">
                  <div className="md:col-span-4">
                    <h4 className="text-[13px] font-medium leading-6">{skill.name}</h4>
                    <p className="mt-1 text-[11px] text-muted">
                      {CATEGORY_LABEL[skill.category]}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="label">依据类型</p>
                    <p className="mt-1 text-[13px] leading-6">{BASIS_LABEL[skill.basisType]}</p>
                  </div>
                  <div className="md:col-span-5">
                    <p className="label">为何常见于 JD</p>
                    <p className="mt-1 text-[13px] leading-6 text-muted">{skill.jdPattern}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="report-shell p-5 md:p-6">
        <p className="label">信息来源类型</p>
        <ul className="mt-3 space-y-2 text-[13px] leading-6 text-muted">
          {role.sources.map((source) => (
            <li key={source}>· {source}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-muted">
          以上是岗位描述的常见结构与公开工程实践，不是某家公司的实时招聘，也没有虚构统计。
        </p>
      </section>
    </div>
  );
}
