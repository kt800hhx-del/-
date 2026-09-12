export type EducationLevel =
  | "high-school"
  | "college"
  | "bachelor"
  | "master"
  | "phd"
  | "other";

export type SkillLevel = "must" | "should" | "nice";

export type SkillCategory =
  | "language"
  | "framework"
  | "infra"
  | "domain"
  | "tool"
  | "soft";

export type GapType = "skill" | "experience" | "project" | "education" | "soft";

export type GapSeverity = "critical" | "moderate" | "minor" | "met";

export type FitLabel = "strong" | "transferable" | "stretch" | "unknown";

export interface UserBackground {
  name: string;
  education: EducationLevel;
  major: string;
  yearsExperience: number;
  currentRole: string;
  techStack: string[];
  preferredCity: string;
  interests: string[];
  resumeText: string;
  projectNotes: string;
}

export interface SkillRequirement {
  id: string;
  name: string;
  aliases: string[];
  level: SkillLevel;
  category: SkillCategory;
  jdPattern: string;
  learnHint: string;
  deliverable: string;
}

export interface ProjectTemplate {
  title: string;
  detail: string;
  evidence: string;
  months: [number, number];
}

export interface RoleProfile {
  id: string;
  name: string;
  nameEn: string;
  tagline: string;
  summary: string;
  typicalTitles: {
    junior: string;
    mid: string;
    senior: string;
  };
  yearBands: {
    junior: [number, number];
    mid: [number, number];
    senior: [number, number];
  };
  skills: SkillRequirement[];
  softSkills: string[];
  projectTemplates: ProjectTemplate[];
  interviewFocus: string[];
  sources: string[];
  educationNote: string;
}

export interface SuggestedRole {
  roleId: string;
  score: number;
  fit: FitLabel;
  reasons: string[];
  caution?: string;
}

export interface GapItem {
  id: string;
  type: GapType;
  title: string;
  current: string;
  required: string;
  severity: GapSeverity;
  advice: string;
}

export interface PlanAction {
  title: string;
  detail: string;
  deliverable: string;
  weeks: number;
}

export interface PlanPhase {
  id: string;
  name: string;
  durationMonths: [number, number];
  goal: string;
  actions: PlanAction[];
  verification: string;
}

export interface CareerAnalysis {
  role: RoleProfile;
  suggestions: SuggestedRole[];
  gaps: GapItem[];
  matchScore: number;
  seniority: "junior" | "mid" | "senior";
  assumptions: string[];
  thinBackground: boolean;
  phases: PlanPhase[];
  totalMonths: [number, number];
}

export interface PersistedState {
  version: 1;
  step: number;
  background: UserBackground;
  selectedRoleId: string | null;
  updatedAt: string;
}

export const STORAGE_KEY = "it-career-planner-v1";

export const STEP_LABELS = [
  "背景",
  "目标岗位",
  "岗位要求",
  "差距",
  "路径规划",
] as const;
