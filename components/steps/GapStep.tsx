"use client";

import type { CareerAnalysis } from "@/lib/types";
import { SeverityBadge } from "../ui";

export function GapStep({ analysis }: { analysis: CareerAnalysis }) {
  const skills = analysis.gaps.filter((gap) => gap.type === "skill");
  const others = analysis.gaps.filter((gap) => gap.type !== "skill");
  const met = skills.filter((gap) => gap.severity === "met").length;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.22em] text-celadon">第四步 · 对照自己</p>
        <h2 className="font-serif text-3xl leading-tight">当前状态和目标差在哪</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted">
          匹配度只统计技能标签/简历文本能否对上常见 JD 清单，不是录用概率。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="paper-card rounded-2xl p-5">
          <p className="text-xs text-sage">技能匹配度</p>
          <p className="mt-2 font-serif text-4xl">{analysis.matchScore}%</p>
          <p className="mt-2 text-xs text-muted">
            {met}/{skills.length} 项技能被识别为已具备
          </p>
        </div>
        <div className="paper-card rounded-2xl p-5 sm:col-span-2">
          <p className="text-xs text-sage">规划假设</p>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-muted">
            {analysis.assumptions.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {analysis.thinBackground ? (
        <p className="rounded-2xl bg-warn/10 px-4 py-3 text-sm leading-6 text-warn">
          背景偏薄：工具仍会给出完整路径，但请把下面的缺口当成「待核实」而不是已证实短板。补全简历后再跑一次会更准。
        </p>
      ) : null}

      <section>
        <h3 className="mb-3 font-serif text-lg">技能差距</h3>
        <div className="space-y-3">
          {skills.map((gap) => (
            <article key={gap.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-medium">{gap.title}</h4>
                <SeverityBadge severity={gap.severity} />
              </div>
              <p className="mt-2 text-sm text-muted">当前：{gap.current}</p>
              <p className="text-sm text-muted">岗位侧：{gap.required}</p>
              <p className="mt-2 text-sm leading-6">{gap.advice}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-lg">年限、项目与学历</h3>
        <div className="space-y-3">
          {others.map((gap) => (
            <article key={gap.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-medium">{gap.title}</h4>
                <SeverityBadge severity={gap.severity} />
              </div>
              <p className="mt-2 text-sm text-muted">当前：{gap.current}</p>
              <p className="text-sm leading-6 text-muted">目标侧：{gap.required}</p>
              <p className="mt-2 text-sm leading-6">{gap.advice}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
