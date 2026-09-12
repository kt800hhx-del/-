import type { EducationLevel, UserBackground } from "./types";

export const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "high-school", label: "高中及以下" },
  { value: "college", label: "大专" },
  { value: "bachelor", label: "本科" },
  { value: "master", label: "硕士" },
  { value: "phd", label: "博士" },
  { value: "other", label: "其他 / 非全日制等" },
];

export const CITIES = [
  "北京",
  "上海",
  "深圳",
  "杭州",
  "广州",
  "成都",
  "南京",
  "武汉",
  "西安",
  "苏州",
  "重庆",
  "远程 / 不限",
  "其他",
];

export const INTERESTS = [
  "后端开发",
  "前端开发",
  "全栈",
  "数据工程",
  "机器学习",
  "大模型应用",
  "Agent 系统",
  "云原生 / 运维",
  "质量保障",
  "产品与技术管理",
  "移动端",
  "安全",
];

export const INTEREST_TO_ROLE: Record<string, string> = {
  后端开发: "backend",
  前端开发: "frontend",
  全栈: "fullstack",
  数据工程: "data-eng",
  机器学习: "ml",
  大模型应用: "llm-app",
  "Agent 系统": "agent",
  "云原生 / 运维": "devops",
  质量保障: "qa",
  产品与技术管理: "tech-pm",
  移动端: "mobile",
  安全: "security",
};

export const COMMON_STACK = [
  "Java",
  "Spring Boot",
  "Go",
  "Python",
  "FastAPI",
  "JavaScript",
  "TypeScript",
  "React",
  "Vue",
  "Next.js",
  "Node.js",
  "MySQL",
  "PostgreSQL",
  "Redis",
  "Kafka",
  "Docker",
  "Kubernetes",
  "Linux",
  "Git",
  "SQL",
  "Spark",
  "Flink",
  "PyTorch",
  "TensorFlow",
  "LLM",
  "RAG",
  "LangChain",
  "Android",
  "Kotlin",
  "Swift",
  "Flutter",
  "CI/CD",
  "AWS",
  "阿里云",
];

export const EMPTY_BACKGROUND: UserBackground = {
  name: "",
  education: "bachelor",
  major: "",
  yearsExperience: 0,
  currentRole: "",
  techStack: [],
  preferredCity: "",
  interests: [],
  resumeText: "",
  projectNotes: "",
};

export const SAMPLE_BACKGROUND: UserBackground = {
  name: "示例：林同学",
  education: "bachelor",
  major: "软件工程",
  yearsExperience: 2,
  currentRole: "Java 后端开发",
  techStack: ["Java", "Spring Boot", "MySQL", "Redis", "Git", "Linux"],
  preferredCity: "杭州",
  interests: ["后端开发", "大模型应用"],
  resumeText:
    "本科软件工程。2014 级课程含数据结构、操作系统、数据库。2024 年起在 ToB SaaS 团队做 Java 后端，负责订单查询与权限模块，日常使用 Spring Boot、MySQL、Redis。参与过一次大促读多写少的接口优化，用缓存降低了热点查询压力。了解 Docker 基础镜像构建，未独立负责过消息队列与微服务拆分。希望在杭州继续做后端，同时了解大模型应用方向是否可迁移。",
  projectNotes:
    "公司项目：订单查询服务（Spring Boot + MySQL + Redis）。个人尚无完整开源作品。曾用官方文档跑通过一个本地聊天 Demo，未上线。",
};

export function educationLabel(level: EducationLevel): string {
  return EDUCATION_OPTIONS.find((item) => item.value === level)?.label ?? level;
}
