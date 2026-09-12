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

export type BasisType = "jd-high-freq" | "campus-social" | "portfolio" | "eng-practice";

export type GapType = "skill" | "experience" | "project" | "education" | "soft";

export type GapSeverity = "critical" | "moderate" | "minor" | "met";

export type GapCertainty = "observed" | "assumed";

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
  basisType: BasisType;
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
  certainty: GapCertainty;
  hiringWhy: string;
  evidenceNeeded: string[];
  advice: string;
}

export interface ResourceRef {
  name: string;
  kind: "官方文档" | "公开课" | "经典开源" | "书籍/手册" | "平台练习";
  url: string;
  note: string;
}

export interface PlanAction {
  title: string;
  detail: string;
  weeklyTasks: string[];
  deliverable: string;
  acceptance: string;
  weeks: number;
  resources: ResourceRef[];
}

export interface PlanPhase {
  id: string;
  name: string;
  durationMonths: [number, number];
  targetAbility: string;
  goal: string;
  actions: PlanAction[];
  acceptance: string[];
  whyConservative: string;
  industryPrecedent: string;
  resources: ResourceRef[];
}

export interface CredibilityNote {
  jdDerived: string[];
  assumptions: string[];
  methodLimits: string[];
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
  credibility: CredibilityNote;
  evidenceChecklist: string[];
  antiPatterns: string[];
  transferPattern: string;
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
  "背景采集",
  "目标岗位",
  "岗位要求",
  "差距分析",
  "路径报告",
] as const;

export const BASIS_LABEL: Record<BasisType, string> = {
  "jd-high-freq": "国内招聘平台 JD 高频项",
  "campus-social": "一线厂校招 / 社招常见门槛",
  "portfolio": "开源社区 / 作品集惯例",
  "eng-practice": "公开工程实践与官方文档基线",
};

export const LEVEL_LABEL: Record<SkillLevel, string> = {
  must: "必须具备",
  should: "中级高频 / 加分接近必须",
  nice: "加分项",
};

export const CATEGORY_LABEL: Record<SkillCategory, string> = {
  language: "语言",
  framework: "框架",
  infra: "基础设施",
  domain: "领域",
  tool: "工具",
  soft: "协作",
};

export const SEVERITY_LABEL: Record<GapSeverity, string> = {
  critical: "关键缺口",
  moderate: "需要补齐",
  minor: "加分缺口",
  met: "已对齐",
};
