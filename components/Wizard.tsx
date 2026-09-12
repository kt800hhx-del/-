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

  const reset = () => {
    clearState();
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 md:pt-10">
      <div className="step-rail mb-8 flex gap-2 overflow-x-auto">
        {STEP_LABELS.map((label, index) => {
          const active = index === step;
          const done = index < step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (index > 1 && !selectedRoleId) return;
                update({ step: index });
              }}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                active
                  ? "border-celadon bg-celadon text-white"
                  : done
                    ? "border-celadon/30 bg-celadon/10 text-celadon-deep"
                    : "border-line bg-card text-sage"
              }`}
            >
              <span>{index + 1}</span>
              {label}
            </button>
          );
        })}
      </div>

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
      {step === 3 && analysis ? <GapStep analysis={analysis} /> : null}
      {step === 4 && analysis ? (
        <PlanStep
          background={background}
          analysis={analysis}
          onChangeRole={() => update({ step: 1 })}
          onReset={reset}
        />
      ) : null}

      {step < 4 ? (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line/80 bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0}
              onClick={() => update({ step: step - 1 })}
            >
              上一步
            </Button>
            <p className="hidden text-xs text-sage sm:block">进度会保存在本机浏览器，刷新不会丢失。</p>
            <Button type="button" onClick={goNext} disabled={!canNext}>
              {step === 1 && !selectedRoleId ? "请先选择岗位" : "下一步"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
