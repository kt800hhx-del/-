"use client";

import { BackgroundStep } from "@/components/steps/BackgroundStep";
import { GapStep } from "@/components/steps/GapStep";
import { PlanStep } from "@/components/steps/PlanStep";
import { RequirementsStep } from "@/components/steps/RequirementsStep";
import { TargetRoleStep } from "@/components/steps/TargetRoleStep";
import { buildAnalysis } from "@/lib/engine";
import { suggestRoles } from "@/lib/suggest";
import { clearState, getServerSnapshot, getSnapshot, saveState, subscribeState } from "@/lib/storage";
import { STEP_LABELS, type UserBackground } from "@/lib/types";
import { useMemo, useSyncExternalStore } from "react";
import { Button } from "./ui";

export function Wizard() {
  const persisted = useSyncExternalStore(subscribeState, getSnapshot, getServerSnapshot);
  const step = persisted.step;
  const background = persisted.background;
  const selectedRoleId = persisted.selectedRoleId;

  const update = (partial: {
    step?: number;
    background?: UserBackground;
    selectedRoleId?: string | null;
  }) => {
    saveState({
      step: partial.step ?? step,
      background: partial.background ?? background,
      selectedRoleId: partial.selectedRoleId === undefined ? selectedRoleId : partial.selectedRoleId,
    });
  };

  const suggestions = useMemo(() => suggestRoles(background), [background]);
  const analysis = useMemo(
    () => (selectedRoleId ? buildAnalysis(background, selectedRoleId) : null),
    [background, selectedRoleId],
  );

  const canNext = step === 0 ? true : step === 1 ? Boolean(selectedRoleId) : Boolean(analysis);

  const goNext = () => {
    const nextRole = selectedRoleId ?? suggestions[0]?.roleId ?? null;
    update({
      step: Math.min(step + 1, 4),
      selectedRoleId: nextRole,
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 md:pt-8">
      <ol className="step-rail mb-8 flex items-stretch gap-0 overflow-x-auto border border-line bg-card">
        {STEP_LABELS.map((label, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <li key={label} className="flex min-w-[7.5rem] flex-1">
              <button
                type="button"
                onClick={() => {
                  if (index > 1 && !selectedRoleId) return;
                  update({ step: index });
                }}
                className={`flex w-full items-center gap-2 border-r border-line px-3 py-2.5 text-left last:border-r-0 ${
                  active ? "bg-accent text-white" : done ? "bg-accent-soft text-accent" : "bg-card text-muted"
                }`}
              >
                <span className={`font-mono text-[11px] ${active ? "text-white/70" : ""}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[12px] font-medium">{label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      {step === 0 ? (
        <BackgroundStep background={background} onChange={(next) => update({ background: next })} />
      ) : null}
      {step === 1 ? (
        <TargetRoleStep
          suggestions={suggestions}
          selectedRoleId={selectedRoleId}
          onSelect={(roleId) => update({ selectedRoleId: roleId })}
        />
      ) : null}
      {step === 2 && analysis ? <RequirementsStep analysis={analysis} /> : null}
      {step === 2 && !analysis ? (
        <EmptyState text="请先选择目标岗位，才能对照行业常见要求。" />
      ) : null}
      {step === 3 && analysis ? <GapStep analysis={analysis} /> : null}
      {step === 3 && !analysis ? <EmptyState text="缺少岗位选择，无法做差距分析。" /> : null}
      {step === 4 && analysis ? (
        <PlanStep
          background={background}
          analysis={analysis}
          onChangeRole={() => update({ step: 1 })}
          onReset={() => clearState()}
        />
      ) : null}
      {step === 4 && !analysis ? <EmptyState text="尚未生成报告。" /> : null}

      {step < 4 ? (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => update({ step: step - 1 })}>
              上一步
            </Button>
            <p className="hidden text-[11px] text-muted md:block">进度保存在本机浏览器。刷新不会丢失。</p>
            <Button type="button" onClick={goNext} disabled={!canNext}>
              {step === 1 && !selectedRoleId ? "请先选择岗位" : "继续"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="report-shell px-6 py-16 text-center">
      <p className="label">尚未就绪</p>
      <p className="mt-3 text-sm text-muted">{text}</p>
    </div>
  );
}
