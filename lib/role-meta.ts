import { getRoleResources } from "./resources";
import type { ResourceRef } from "./types";

export interface RoleMeta {
  transferPattern: string;
  evidenceChecklist: string[];
  antiPatterns: string[];
  resources: ResourceRef[];
}

export const ROLE_META: Record<string, Omit<RoleMeta, "resources">> = {
  backend: {
    transferPattern:
      "业务后端转更资深后端，或转 LLM 应用时，行业里常见的顺序是：先把「能独立交付一个带存储/缓存的服务」做扎实，再补消息、观测或 RAG。反过来先堆框架名词、没有可运行服务，社招初筛通常过不去。",
    evidenceChecklist: [
      "GitHub/Gitee 仓库：可本地启动（README 含环境、端口、示例请求）",
      "表结构 / 接口契约（OpenAPI 或等价文档）与幂等说明",
      "至少一次可复核的优化或排障记录（EXPLAIN、缓存策略或压测边界，小样本即可）",
      "一页架构图：请求路径、数据存储、失败重试",
      "提交历史能看出你本人的改动，而不是一次性上传压缩包",
    ],
    antiPatterns: [
      "只刷课或只背八股，没有可打开的仓库——社招面试会立刻问项目细节。",
      "证书堆砌（语言认证、云厂商入门证）对纯业务后端社招帮助有限，不如一次线上/可演示故障复盘。",
      "把教程 CRUD 原样交作业，却声称「高并发微服务」——审阅者通常会追问量级与取舍。",
    ],
  },
  frontend: {
    transferPattern:
      "切图/活动页背景转到工程化前端，常见路径是：先用 TypeScript 独立完成一个带路由与表单的 SPA，再补性能与工程基建。只交静态页面或只会 UI 库组件，很难对上中级前端 JD。",
    evidenceChecklist: [
      "可访问的 Demo（或录像）+ 源码仓库",
      "TypeScript 覆盖核心模块，而不是 any 贯穿",
      "README 说明状态管理与目录约定",
      "一次可量化的性能或包体积对比（Lighthouse / bundle 前后，标明环境）",
      "空态、错误态、移动宽度截图",
    ],
    antiPatterns: [
      "只刷框架 API 清单，说不清浏览器网络与渲染——面试仍会回到基础。",
      "堆砌 UI 模板却没有自己的状态设计，作品集说服力弱。",
      "前端证书对社招通常弱于可维护的仓库与性能案例。",
    ],
  },
  fullstack: {
    transferPattern:
      "单端转全栈的常见模式是：保留已有前端或后端深度，先补「鉴权 + 数据持久化 + 一次真实部署」。没有公网/可访问 Demo 的全栈简历，在创业团队与工具产品岗里说服力有限。",
    evidenceChecklist: [
      "可注册并走完主路径的线上或内网 Demo",
      "前后端契约（类型或 OpenAPI）",
      "鉴权与权限矩阵",
      "部署文档（环境变量、回滚）",
      "README 写清「刻意没做的范围」",
    ],
    antiPatterns: [
      "前端套 BaaS 后自称全栈，却讲不清数据模型与权限——JD 常按「能写后端」筛选。",
      "同时学三套语言栈，半年没有一个能打开的产品。",
    ],
  },
  "data-eng": {
    transferPattern:
      "分析师或后端转数据工程，常见顺序是：进阶 SQL 与口径 → 分层建模 → 可重跑作业与调度。只交 Notebook 可视化，对不上「数据开发 / 数仓」Title。",
    evidenceChecklist: [
      "主题域分层说明（ODS/DWD/DWS 或等价）与指标口径",
      "可重跑的 Spark/Flink/SQL 作业与配置",
      "调度 DAG 或等价依赖说明",
      "1–2 条数据质量规则与一次失败/补数记录",
      "样例表与「如何验证结果」",
    ],
    antiPatterns: [
      "用「会 Pandas」对标数仓开发 JD——筛选词通常是 SQL + 计算引擎 + 调度。",
      "没有口径文档的宽表，面试无法讨论一致性。",
    ],
  },
  ml: {
    transferPattern:
      "软件工程师转应用算法，常见可核对路径是：机器学习基础 + 可复现实验（强基线 → 模型 → 错误分析），而不是先追最新论文。国内一线算法 JD 大量写硕士优先，本科路径通常要靠作品集与编程面试补。",
    evidenceChecklist: [
      "可复现脚本（固定种子、依赖版本）",
      "实验表：基线 / 你的方法 / 指标 / 失败案例",
      "数据泄漏检查说明",
      "推理或评测入口，而不是只有 Notebook 截图",
      "数学假设一页纸（损失、优化器、你真正用过的）",
    ],
    antiPatterns: [
      "只报准确率、没有基线与错误分析——审阅者会默认不可信。",
      "编造大规模线上提升；小样本必须标明。",
      "证书（如入门 MOOC 完成证）通常替代不了可复现仓库。",
    ],
  },
  "llm-app": {
    transferPattern:
      "业务后端 → LLM 应用的常见、可观察顺序是：先补「模型 API + 后端工程（超时/日志/限流）」→ 再做带引用的 RAG → 再固定黄金集评测，最后才谈 Agent。只做聊天 UI 或只调 Prompt，对不上「大模型应用工程师」社招 JD 里的工程项。",
    evidenceChecklist: [
      "可运行的服务：模型调用有超时、重试、结构化日志",
      "RAG：切片策略、引用出处、失败问答各若干条",
      "黄金集 30–50 条及改动前后对比表（小样本，不虚报）",
      "成本/延迟的粗算与护栏策略",
      "README 写清用了哪家 API、知识截止日期、已知幻觉模式",
    ],
    antiPatterns: [
      "把「会用 ChatGPT」写成岗位经验。",
      "只展示一次惊艳 Demo，没有评测与失败案例。",
      "堆砌 LangChain 组件却讲不清检索错还是生成错。",
    ],
  },
  agent: {
    transferPattern:
      "LLM 应用或后端转 Agent，常见先补：工具调用（JSON Schema、失败）→ 步数限制的状态循环 → 轨迹回放与任务集，再谈多 Agent。没有工具权限与停止条件的「自动规划」演示，在认真的招聘对话里通常会被当成玩具。",
    evidenceChecklist: [
      "工具清单 + 参数 Schema + 拒绝/确认策略",
      "可回放轨迹（每步 Thought/Action/Observation 或等价）",
      "15–30 个任务脚本：成功 / 应拒绝 / 应澄清",
      "最大步数与超时",
      "危险工具的最小权限说明",
    ],
    antiPatterns: [
      "无限聊天包装成 Agent，没有工具与停止条件。",
      "在未授权系统上演示「自动操作」。",
    ],
  },
  devops: {
    transferPattern:
      "开发转 DevOps/SRE 的常见顺序：Linux/网络排障 → 容器与流水线 → 监控告警，再谈 K8s 与 IaC。只有云控制台截图、没有回滚与告警说明，对不上 SRE 向 JD。",
    evidenceChecklist: [
      "一条可演示的构建-测试-部署流水线配置",
      "回滚步骤（文档或脚本）",
      "黄金指标仪表盘与一条可行动告警",
      "一次故障或演练时间线（实验环境即可）",
      "镜像与权限的基本加固说明",
    ],
    antiPatterns: [
      "只考取云厂商认证、没有自己维护过的流水线——证书是加分，通常不是社招主证据。",
      "把「会点控制台」写成自动化经验。",
    ],
  },
  qa: {
    transferPattern:
      "功能测试转测试开发，常见顺序：用例设计 → 接口自动化接入 CI → 再补少量主路径 UI。只交手工用例 Excel、没有可跑脚本，对一线测试开发 JD 偏弱。",
    evidenceChecklist: [
      "分层用例（P0/P1）与风险列表",
      "CI 中可跑的接口套件与报告",
      "主路径 E2E 的维护说明（为何不覆盖全部 UI）",
      "一份可复现的缺陷报告样例",
      "失败定位到提交的约定",
    ],
    antiPatterns: [
      "追求 UI 自动化条数、忽略维护成本。",
      "用「会点 Postman」代替可回归的脚本。",
    ],
  },
  "tech-pm": {
    transferPattern:
      "研发转技术 PM 的常见作品集路径：完整写一份可估时的 PRD + 系统理解图 + 指标与复盘，而不是只交原型图。运营转技术 PM 则需先补 API/数据约束的阅读力。",
    evidenceChecklist: [
      "PRD：问题、非目标、验收、风险",
      "一页系统理解图与技术风险",
      "指标字典（北向 + 护栏）",
      "原型或主路径流程图（含异常态）",
      "假设与未验证项单独标注",
    ],
    antiPatterns: [
      "只有愿景页和「赋能」词汇，没有验收标准。",
      "把别人的内部文档改头换面——审阅者会问你如何验证。",
    ],
  },
  mobile: {
    transferPattern:
      "前端转移动端，常见要补：生命周期、弱网与本地存储、可安装包。只做 WebView 套壳，很难对上 Android/iOS 社招。",
    evidenceChecklist: [
      "可安装包或稳定模拟器录像",
      "生命周期/进程杀死恢复说明",
      "弱网或离线策略",
      "一次启动或列表性能对比",
      "构建与签名/发版清单（不上架也可）",
    ],
    antiPatterns: [
      "只交课设计算器，却对标中级客户端 JD。",
      "跨端框架用了但讲不清原生生命周期。",
    ],
  },
  security: {
    transferPattern:
      "开发转应用安全，常见可核对路径：在合法靶场理解 OWASP 类问题 → 能读业务代码标信任边界 → 写出可修复的漏洞报告闭环。禁止把未授权扫描当作品集。",
    evidenceChecklist: [
      "合法靶场笔记：原理、复现、修复建议、再验证",
      "对公开项目的威胁建模（范围写清）",
      "漏洞工单模板（评级、影响、修复验证）",
      "误报处理例子",
      "明确的法律与授权边界声明",
    ],
    antiPatterns: [
      "扫描未授权目标并写进简历——既不可展示，也不被行业接受。",
      "只交扫描器截图，没有修复建议。",
      "证书（入门 CTF 排名、部分认证）是加分，通常替代不了报告质量。",
    ],
  },
};

export function getRoleMeta(roleId: string): RoleMeta {
  const base = ROLE_META[roleId] ?? {
    transferPattern: "先补该方向 JD 高频硬技能，再做 1 个可演示项目，再对齐简历与面试表达。这是国内社招最常见的补齐顺序，而不是捷径承诺。",
    evidenceChecklist: ["可运行仓库", "README 与范围说明", "一次可复核的结果或复盘"],
    antiPatterns: ["只学习不交付可检查的证据。"],
  };
  return { ...base, resources: getRoleResources(roleId) };
}

export function hiringWhyForLevel(level: "must" | "should" | "nice"): string {
  if (level === "must") {
    return "初筛与面试开场通常先核对这类能力是否存在；缺了很难进入项目深挖。";
  }
  if (level === "should") {
    return "中级 JD 与「独立负责一个模块」的面试叙事里反复出现；缺了不一定被拒，但会显得经验偏浅。";
  }
  return "高级岗位或特定业务线的加分项，不应用它替代 must 的证据。";
}
