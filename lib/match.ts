import { INTEREST_TO_ROLE } from "./constants";
import { ROLES } from "./roles";
import type { SkillRequirement, UserBackground } from "./types";

export function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（）()]/g, "")
    .replace(/[\s_\-./+]+/g, "");
}

export function uniqueNormalized(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = normalizeToken(trimmed);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function aliasHit(alias: string, stackNorm: Set<string>, haystack: string): boolean {
  const normalized = normalizeToken(alias);
  if (!normalized) return false;
  if (stackNorm.has(normalized)) return true;

  if (normalized.length <= 2) {
    const boundary = new RegExp(`(^|[^a-z0-9\u4e00-\u9fff])${escapeRegExp(alias)}([^a-z0-9\u4e00-\u9fff]|$)`, "i");
    return boundary.test(haystack);
  }

  return haystack.toLowerCase().includes(alias.toLowerCase()) || haystack.includes(normalized);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function collectUserTokens(background: UserBackground): Set<string> {
  const stackNorm = new Set(background.techStack.map(normalizeToken).filter(Boolean));
  const haystack = [
    background.resumeText,
    background.projectNotes,
    background.currentRole,
    background.major,
    background.techStack.join(" "),
  ].join("\n");

  const tokens = new Set(stackNorm);

  for (const role of ROLES) {
    for (const skill of role.skills) {
      for (const alias of [skill.name, ...skill.aliases]) {
        if (aliasHit(alias, stackNorm, haystack)) {
          tokens.add(normalizeToken(skill.id));
          tokens.add(normalizeToken(skill.name));
          for (const item of skill.aliases) {
            tokens.add(normalizeToken(item));
          }
        }
      }
    }
  }

  return tokens;
}

export function skillMatched(skill: SkillRequirement, tokens: Set<string>, background: UserBackground): boolean {
  const stackNorm = new Set(background.techStack.map(normalizeToken));
  const haystack = [
    background.resumeText,
    background.projectNotes,
    background.currentRole,
    background.techStack.join(" "),
  ].join("\n");

  if (tokens.has(normalizeToken(skill.id))) return true;
  return [skill.name, ...skill.aliases].some((alias) => aliasHit(alias, stackNorm, haystack));
}

export function extractSkillsFromText(text: string): string[] {
  if (!text.trim()) return [];
  const found: string[] = [];
  const stackNorm = new Set<string>();
  const preferred = [
    "Spring Boot",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Kubernetes",
    "PostgreSQL",
    "LangChain",
    "PyTorch",
    "TensorFlow",
    "FastAPI",
    "React",
    "Vue",
    "Redis",
    "MySQL",
    "Kafka",
    "Docker",
    "Python",
    "Java",
    "Linux",
    "Git",
    "Go",
    "SQL",
    "RAG",
    "LLM",
    "Android",
    "Kotlin",
    "Swift",
    "Flutter",
    "Spark",
    "Flink",
  ];

  for (const label of preferred) {
    if (aliasHit(label, stackNorm, text)) found.push(label);
  }

  return uniqueNormalized(found);
}

export function interestRoleIds(interests: string[]): string[] {
  return interests.map((item) => INTEREST_TO_ROLE[item]).filter(Boolean);
}

export function textLooksThin(background: UserBackground): boolean {
  const written = `${background.resumeText} ${background.projectNotes} ${background.currentRole}`.trim();
  return (
    background.yearsExperience <= 0 &&
    background.techStack.length <= 1 &&
    written.length < 40
  );
}

export function hasProjectEvidence(background: UserBackground, extraKeywords: string[] = []): boolean {
  const text = `${background.resumeText}\n${background.projectNotes}`.toLowerCase();
  if (text.trim().length < 20) return false;
  const markers = [
    "项目",
    "负责",
    "上线",
    "系统",
    "仓库",
    "github",
    "gitlab",
    "demo",
    "重构",
    "优化",
    "设计",
    "实现",
    "开发",
    ...extraKeywords.map((item) => item.toLowerCase()),
  ];
  return markers.some((marker) => text.includes(marker));
}
