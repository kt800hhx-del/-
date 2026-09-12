"use client";

import { ROLES } from "@/lib/roles";
import type { SuggestedRole } from "@/lib/types";
import { FitBadge } from "../ui";

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
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.22em] text-celadon">第二步 · 选择</p>
        <h2 className="font-serif text-3xl leading-tight">选择一个目标岗位</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted">
          推荐依据是技能重叠、兴趣和当前岗位族，不是「现在最热」的岗位排行。你可以选推荐，也可以选跨度更大的方向——路径会按转行节奏拉长。
        </p>
      </header>

      <section>
        <h3 className="mb-3 font-serif text-lg">根据背景较合理的方向</h3>
        <div className="grid gap-4">
          {ranked.slice(0, 3).map((item, index) => {
            const role = ROLES.find((r) => r.id === item.roleId);
            if (!role) return null;
            const selected = selectedRoleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelect(role.id)}
                className={`paper-card rounded-2xl p-5 text-left transition ${
                  selected ? "ring-2 ring-celadon" : "hover:border-celadon/40"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-sage">推荐 {index + 1}</p>
                    <h4 className="mt-1 font-serif text-xl">{role.name}</h4>
                    <p className="text-sm text-muted">{role.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FitBadge fit={item.fit} />
                    <span className="text-xs text-sage">参考分 {Math.round(item.score * 100)}</span>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm leading-6 text-muted">
                  {item.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>· {reason}</li>
                  ))}
                </ul>
                {item.caution ? (
                  <p className="mt-3 rounded-xl bg-warn/10 px-3 py-2 text-xs leading-5 text-warn">{item.caution}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-serif text-lg">全部 IT 方向目录</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => {
            const suggestion = ranked.find((item) => item.roleId === role.id);
            const selected = selectedRoleId === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelect(role.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  selected ? "border-celadon bg-celadon/5" : "border-line bg-card hover:border-celadon/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{role.name}</span>
                  {suggestion ? <FitBadge fit={suggestion.fit} /> : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-muted">{role.tagline}</p>
                {topIds.has(role.id) ? (
                  <p className="mt-2 text-[11px] tracking-wide text-celadon">当前背景下的优先建议</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
