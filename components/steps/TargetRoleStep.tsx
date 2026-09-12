"use client";

import { ROLES } from "@/lib/roles";
import type { SuggestedRole } from "@/lib/types";
import { FitBadge, SectionTitle } from "../ui";

export function TargetRoleStep({
  suggestions,
  selectedRoleId,
  onSelect,
}: {
  suggestions: SuggestedRole[];
  selectedRoleId: string | null;
  onSelect: (roleId: string) => void;
}) {
  const ranked = suggestions;
  const topIds = new Set(ranked.slice(0, 3).map((item) => item.roleId));

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker="02 / 定位"
        title="选择目标岗位"
        desc="推荐依据是技能重叠、兴趣与当前岗位族，不是「最热岗位」排行。跨度更大的方向可以选，路径会按转行节奏拉长。"
      />

      <section>
        <p className="label mb-3">根据已填信息较合理的方向</p>
        <div className="grid gap-3">
          {ranked.slice(0, 3).map((item, index) => {
            const role = ROLES.find((r) => r.id === item.roleId);
            if (!role) return null;
            const selected = selectedRoleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelect(role.id)}
                className={`report-shell p-5 text-left transition ${selected ? "ring-1 ring-ink" : "hover:border-ink/30"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="label">建议 {String(index + 1).padStart(2, "0")}</p>
                    <h4 className="mt-1 font-serif text-xl">{role.name}</h4>
                    <p className="mt-1 text-[13px] text-muted">{role.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FitBadge fit={item.fit} />
                    <span className="font-mono text-[11px] text-muted">{Math.round(item.score * 100)}</span>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-[13px] leading-6 text-muted">
                  {item.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>· {reason}</li>
                  ))}
                </ul>
                {item.caution ? (
                  <p className="mt-3 border border-warn/20 bg-warn-soft px-3 py-2 text-xs leading-5 text-warn">{item.caution}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="label mb-3">全部轨道（12）</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {ROLES.map((role) => {
            const suggestion = ranked.find((item) => item.roleId === role.id);
            const selected = selectedRoleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelect(role.id)}
                className={`border px-4 py-3.5 text-left ${
                  selected ? "border-ink bg-accent-soft" : "border-line bg-card hover:border-ink/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{role.name}</span>
                  {suggestion ? <FitBadge fit={suggestion.fit} /> : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">{role.tagline}</p>
                {topIds.has(role.id) ? <p className="mt-2 text-[11px] text-accent">当前输入下的优先建议</p> : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
