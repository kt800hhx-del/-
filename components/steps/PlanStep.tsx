"use client";

import { downloadMarkdown, filenameFor, planToMarkdown } from "@/lib/export";
import { educationLabel } from "@/lib/constants";
import type { CareerAnalysis, UserBackground } from "@/lib/types";
import { useState } from "react";
import { Button, ReportField, ResourceList, SectionTitle } from "../ui";

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
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const markdown = planToMarkdown(background, analysis);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="05 / 报告"
        title={`${analysis.role.name}路径报告`}
        desc={
          analysis.thinBackground
            ? "输入偏薄：下文用「倾向于 / 待核实」。这是可执行草案，不是录用承诺。"
            : "下文按每周 8–12 小时给出保守工期。这是可执行计划，不是录用承诺。"
        }
      />

      <section className="report-shell">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hair px-5 py-5 md:px-6">
          <div>
            <p className="label">报告封面</p>
            <h3 className="mt-2 font-serif text-2xl">{analysis.role.name}</h3>
            <p className="mt-1 text-[13px] text-muted">{analysis.role.nameEn} · {analysis.role.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => downloadMarkdown(filenameFor(analysis.role.name), markdown)}>
              导出 Markdown
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(markdown);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "已复制" : "复制全文"}
            </Button>
            <Button type="button" variant="outline" onClick={onChangeRole}>
              更换目标岗位
            </Button>
            <Button type="button" variant="ghost" onClick={onReset}>
              重置档案
            </Button>
          </div>
        </div>
        <dl className="grid gap-px bg-hair sm:grid-cols-2 lg:grid-cols-4">
          <Meta label="生成日期" value={today} />
          <Meta label="对照职级" value={analysis.role.typicalTitles[analysis.seniority]} />
          <Meta
            label="技能清单重合"
            value={`${analysis.matchScore}%`}
            hint="关键词识别，非录用概率"
          />
          <Meta
            label="保守总周期"
            value={`${analysis.totalMonths[0]}–${analysis.totalMonths[1]} 个月`}
            hint="每周 8–12 小时"
          />
        </dl>
        <div className="grid gap-4 px-5 py-4 text-[13px] leading-6 text-muted md:grid-cols-3 md:px-6">
          <p>档案：{background.name || "未具名"} · {educationLabel(background.education)}
            {background.major ? ` · ${background.major}` : ""} · {background.yearsExperience} 年
          </p>
          <p>现状：{background.currentRole || "未填岗位"} · {background.preferredCity || "未填城市"}</p>
          <p>栈：{background.techStack.length ? background.techStack.slice(0, 6).join(" / ") : "未填"}</p>
        </div>
      </section>

      <section className="report-shell p-5 md:p-6">
        <p className="label">可信度说明</p>
        <p className="mt-2 font-serif text-lg">哪些是 JD 模式归纳，哪些是假设</p>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-[12px] font-medium">从公开 JD / 工程实践归纳</p>
            <ul className="mt-2 space-y-2 text-[13px] leading-6 text-muted">
              {analysis.credibility.jdDerived.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium">{analysis.thinBackground ? "假设（请先核实）" : "来自当前输入的假设"}</p>
            <ul className="mt-2 space-y-2 text-[13px] leading-6 text-muted">
              {analysis.credibility.assumptions.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium">方法边界</p>
            <ul className="mt-2 space-y-2 text-[13px] leading-6 text-muted">
              {analysis.credibility.methodLimits.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="report-shell p-5 md:p-6">
        <p className="label">转岗顺序为何这样排</p>
        <p className="mt-2 text-[13px] leading-6">{analysis.transferPattern}</p>
      </section>

      <ol className="space-y-4">
        {analysis.phases.map((phase, index) => (
          <li key={phase.id} className="report-shell overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-hair bg-canvas/60 px-5 py-4 md:px-6">
              <div>
                <p className="label">阶段 {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-serif text-xl">{phase.name}</h3>
              </div>
              <p className="font-mono text-[12px] text-muted">
                {phase.durationMonths[0]}–{phase.durationMonths[1]} 个月
              </p>
            </div>
            <div className="space-y-1 px-5 py-4 md:px-6">
              <ReportField label="目标能力">{phase.targetAbility}</ReportField>
              <ReportField label="本阶段意图">{phase.goal}</ReportField>
              <ReportField label="具体行动（周级）">
                <div className="space-y-4">
                  {phase.actions.map((action) => (
                    <div key={action.title} className="border border-hair p-3">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium">{action.title}</p>
                        <span className="font-mono text-[11px] text-muted">约 {action.weeks} 周</span>
                      </div>
                      <p className="mt-1 text-muted">{action.detail}</p>
                      <ul className="mt-2 space-y-1 text-muted">
                        {action.weeklyTasks.map((task) => (
                          <li key={task}>· {task}</li>
                        ))}
                      </ul>
                      <p className="mt-2">
                        <span className="text-muted">交付 / 验收：</span>
                        {action.deliverable} {action.acceptance ? `—— ${action.acceptance}` : ""}
                      </p>
                      {action.resources.length ? (
                        <div className="mt-3">
                          <p className="label">针对本条缺口的深链（2–3 条）</p>
                          <ResourceList resources={action.resources} targetGap={action.targetGap} />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </ReportField>
              <ReportField label="阶段验收标准">
                <ul>
                  {phase.acceptance.map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </ReportField>
              <ReportField label="时长区间 · 为何偏保守">{phase.whyConservative}</ReportField>
              <ReportField label="行业先例 / 验证说明">{phase.industryPrecedent}</ReportField>
              {phase.resources.length ? (
                <ReportField label="本阶段汇总资源（均可点击打开）">
                  <ResourceList resources={phase.resources} />
                </ReportField>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <section className="report-shell p-5 md:p-6">
        <p className="label">证据清单</p>
        <p className="mt-2 text-[13px] text-muted">面试官或导师通常能打开或追问的东西。勾选仅存在本页，方便自检。</p>
        <ul className="mt-4 space-y-2">
          {analysis.evidenceChecklist.map((item) => (
            <li key={item}>
              <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6">
                <input
                  type="checkbox"
                  className="mt-1 accent-accent"
                  checked={Boolean(checked[item])}
                  onChange={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))}
                />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="report-shell p-5 md:p-6">
        <p className="label">风险与反模式</p>
        <ul className="mt-3 space-y-2 text-[13px] leading-6">
          {analysis.antiPatterns.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Meta({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-card px-5 py-4">
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-[13px] font-medium leading-6">{value}</dd>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}
