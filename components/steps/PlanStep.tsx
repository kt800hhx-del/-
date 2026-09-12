"use client";

import { downloadMarkdown, filenameFor, planToMarkdown } from "@/lib/export";
import type { CareerAnalysis, UserBackground } from "@/lib/types";
import { Button } from "../ui";
import { useState } from "react";

export function PlanStep({
  background,
  analysis,
  onChangeRole,
  onReset,
}: {
  background: UserBackground;
  analysis: CareerAnalysis;
  onChangeRole: () => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const markdown = planToMarkdown(background, analysis);

  const exportPlan = () => {
    downloadMarkdown(filenameFor(analysis.role.name), markdown);
  };

  const copyPlan = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.22em] text-celadon">第五步 · 路径</p>
        <h2 className="font-serif text-3xl leading-tight">通向{analysis.role.name}的保守路径</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted">
          总周期约 <strong className="text-ink">{analysis.totalMonths[0]}–{analysis.totalMonths[1]} 个月</strong>
          （按每周 8–12 小时）。这是可执行计划，不是录用承诺。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={exportPlan}>
            下载 Markdown 计划
          </Button>
          <Button type="button" variant="outline" onClick={copyPlan}>
            {copied ? "已复制" : "复制全文"}
          </Button>
          <Button type="button" variant="outline" onClick={onChangeRole}>
            换一个目标岗位
          </Button>
          <Button type="button" variant="ghost" onClick={onReset}>
            重新填写背景
          </Button>
        </div>
      </header>

      <ol className="relative space-y-5 border-l border-line pl-5 md:pl-7">
        {analysis.phases.map((phase, index) => (
          <li key={phase.id} className="relative">
            <span className="absolute -left-[27px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-celadon text-[11px] text-white md:-left-[35px]">
              {index + 1}
            </span>
            <article className="paper-card rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-serif text-xl">{phase.name}</h3>
                <span className="text-xs text-sage">
                  约 {phase.durationMonths[0]}–{phase.durationMonths[1]} 个月
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{phase.goal}</p>
              <div className="mt-4 space-y-3">
                {phase.actions.map((action) => (
                  <div key={action.title} className="rounded-xl bg-paper/80 p-3">
                    <p className="text-sm font-medium">
                      {action.title}
                      <span className="ml-2 text-xs font-normal text-sage">约 {action.weeks} 周</span>
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted">{action.detail}</p>
                    <p className="mt-1 text-xs leading-5 text-celadon-deep">交付：{action.deliverable}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-6 text-sage">为何这一步说得通：{phase.verification}</p>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
