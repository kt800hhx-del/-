"use client";

import type { CareerAnalysis } from "@/lib/types";
import { SectionTitle, SeverityBadge } from "../ui";

export function GapStep({ analysis }: { analysis: CareerAnalysis }) {
  const skills = analysis.gaps.filter((gap) => gap.type === "skill");
  const others = analysis.gaps.filter((gap) => gap.type !== "skill");
  const met = skills.filter((gap) => gap.severity === "met").length;
  const missing = skills.filter((gap) => gap.severity !== "met").length;

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="04 / 差距"
        title="当前状态对照目标"
        desc="重合度只统计技能标签/简历关键词能否对上常见 JD 清单，不是录用概率。"
      />

      {analysis.thinBackground ? (
        <p className="border border-warn/25 bg-warn-soft px-4 py-3 text-[13px] leading-6 text-warn">
          输入偏薄。下列缺口优先视为「待核实」，不要当成已证实短板。补全简历后再生成一次会更准。
        </p>
      ) : null}

      <section className="grid gap-3 md:grid-cols-12">
        <div className="report-shell p-5 md:col-span-4">
          <p className="label">技能清单重合</p>
          <p className="mt-2 font-serif text-4xl tracking-tight">{analysis.matchScore}%</p>
          <p className="mt-2 text-xs leading-5 text-muted">
            已对齐 {met} · 未对齐 {missing} · 关键词识别
          </p>
        </div>
        <div className="report-shell p-5 md:col-span-8">
          <p className="label">当前使用的假设</p>
          <ul className="mt-2 space-y-1.5 text-[13px] leading-6 text-muted">
            {analysis.assumptions.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <GapTable title="技能" items={skills} />
      <GapTable title="年限、项目、学历与协作" items={others} />
    </div>
  );
}

function GapTable({
  title,
  items,
}: {
  title: string;
  items: CareerAnalysis["gaps"];
}) {
  return (
    <section className="report-shell overflow-hidden">
      <div className="border-b border-hair px-5 py-3 md:px-6">
        <h3 className="text-[13px] font-medium">{title}</h3>
      </div>
      <div className="divide-y divide-hair">
        {items.map((gap) => (
          <article key={gap.id} className="px-5 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-[13px] font-medium">{gap.title}</h4>
              <div className="flex flex-wrap items-center gap-1.5">
                {gap.certainty === "assumed" ? (
                  <span className="bg-warn-soft px-2 py-0.5 text-[11px] font-medium text-warn">待核实</span>
                ) : (
                  <span className="bg-hair px-2 py-0.5 text-[11px] text-muted">基于已填信息</span>
                )}
                <SeverityBadge severity={gap.severity} />
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <p className="text-[13px] leading-6 text-muted">
                <span className="label block">当前判断</span>
                {gap.current}
              </p>
              <p className="text-[13px] leading-6 text-muted">
                <span className="label block">岗位侧</span>
                {gap.required}
              </p>
            </div>
            <p className="mt-3 text-[13px] leading-6">
              <span className="label block">为何影响招聘</span>
              {gap.hiringWhy}
            </p>
            <div className="mt-3">
              <p className="label">需要产出的证据</p>
              <ul className="mt-1 space-y-1 text-[13px] leading-6">
                {gap.evidenceNeeded.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
