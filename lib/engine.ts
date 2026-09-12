import { analyzeGaps, inferSeniority, matchScore } from "./gap";
import { buildAssumptions, buildCredibility, buildPhases, totalMonths } from "./plan";
import { textLooksThin } from "./match";
import { getRoleMeta } from "./role-meta";
import { getRole } from "./roles";
import { suggestRoles } from "./suggest";
import type { CareerAnalysis, UserBackground } from "./types";

export function buildAnalysis(background: UserBackground, roleId: string): CareerAnalysis {
  const role = getRole(roleId);
  if (!role) {
    throw new Error(`未知岗位：${roleId}`);
  }
  const thin = textLooksThin(background);
  const gaps = analyzeGaps(background, role);
  const phases = buildPhases(background, role, gaps);
  const assumptions = buildAssumptions(background, role);
  const meta = getRoleMeta(role.id);
  return {
    role,
    suggestions: suggestRoles(background),
    gaps,
    matchScore: matchScore(gaps),
    seniority: inferSeniority(background.yearsExperience, role),
    assumptions,
    thinBackground: thin,
    phases,
    totalMonths: totalMonths(phases),
    credibility: buildCredibility(background, role, assumptions, thin),
    evidenceChecklist: meta.evidenceChecklist,
    antiPatterns: meta.antiPatterns,
    transferPattern: meta.transferPattern,
  };
}
