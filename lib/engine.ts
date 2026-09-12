import { analyzeGaps, inferSeniority, matchScore } from "./gap";
import { buildAssumptions, buildPhases, totalMonths } from "./plan";
import { getRole } from "./roles";
import { suggestRoles } from "./suggest";
import { textLooksThin } from "./match";
import type { CareerAnalysis, UserBackground } from "./types";

export function buildAnalysis(background: UserBackground, roleId: string): CareerAnalysis {
  const role = getRole(roleId);
  if (!role) {
    throw new Error(`未知岗位：${roleId}`);
  }
  const gaps = analyzeGaps(background, role);
  const phases = buildPhases(background, role, gaps);
  return {
    role,
    suggestions: suggestRoles(background),
    gaps,
    matchScore: matchScore(gaps),
    seniority: inferSeniority(background.yearsExperience, role),
    assumptions: buildAssumptions(background, role),
    thinBackground: textLooksThin(background),
    phases,
    totalMonths: totalMonths(phases),
  };
}
