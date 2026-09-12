import type { ResourceRef } from "./types";

function r(
  name: string,
  kind: ResourceRef["kind"],
  url: string,
  note: string,
): ResourceRef {
  if (!url.startsWith("https://")) {
    throw new Error(`资源必须是 https：${url}`);
  }
  return { name, kind, url, note };
}

/** 按技能 id 映射 2–4 条可打开的学习资源（不含虚构链接）。 */
export const SKILL_RESOURCES: Record<string, ResourceRef[]> = {
  "be-lang": [
    r("Python 官方教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "补 Python 语法与标准库。学完「控制流 / 模块 / 输入输出」后，用纯标准库写一个命令行小工具。"),
    r("Effective Go", "官方文档", "https://go.dev/doc/effective_go", "补 Go 错误处理与并发惯例。读完后手写带 goroutine 的小工具，不要先上框架。"),
    r("Oracle Java 教程", "官方文档", "https://docs.oracle.com/javase/tutorial/", "补 Java 语言基础。完成 Classes/Objects 与 Exceptions 后，再进入 Spring。"),
    r("freeCodeCamp 学习中心", "公开课", "https://www.freecodecamp.org/learn", "若语言基础很薄，用其中的 JavaScript/Python 练习补语法，再回到目标语言官方教程。"),
  ],
  "be-fw": [
    r("Spring Boot 参考文档", "官方文档", "https://docs.spring.io/spring-boot/reference/", "补 Java Web 框架。做完 Web + Validation 章节后，交付带校验与分层的 REST 服务。"),
    r("Spring Framework 参考", "官方文档", "https://docs.spring.io/spring-framework/reference/index.html", "弄清 IoC / MVC 边界，避免只会「生成器点下一步」。"),
    r("FastAPI 官方教程", "官方文档", "https://fastapi.tiangolo.com/tutorial/", "Python 栈用此文档完成依赖注入、Pydantic 校验与路径操作。"),
    r("Gin 快速入门", "官方文档", "https://gin-gonic.com/en/docs/quickstart/", "Go 栈最小 Web 框架。跑通路由与 JSON 绑定后再谈中间件。"),
  ],
  "be-sql": [
    r("MySQL 8.0 参考手册", "官方文档", "https://dev.mysql.com/doc/refman/8.0/en/", "补索引、事务与 EXPLAIN。对照 Optimization / InnoDB 章节改写 3 条慢查询。"),
    r("PostgreSQL 官方教程", "官方文档", "https://www.postgresql.org/docs/current/tutorial.html", "若 JD 写 Postgres，用官方教程建库、约束与事务，再谈高级 SQL。"),
    r("MDN HTTP 与表单（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", "接口层与数据库之间的错误码/幂等要能讲清，不要只背 SQL 口诀。"),
  ],
  "be-redis": [
    r("Redis 官方文档", "官方文档", "https://redis.io/docs/", "补数据结构与过期策略。读完后实现一个读多写少接口的缓存层，写清失效。"),
    r("Redis Commands 参考", "官方文档", "https://redis.io/docs/latest/commands/", "按命令核对手写的 GET/SET/EXPIRE，避免只用封装库却说不清语义。"),
    r("Spring Data Redis 参考（Java 栈）", "官方文档", "https://docs.spring.io/spring-data/redis/reference/", "Java 项目把缓存接到 Spring；其他语言栈可跳过，改用 Redis 官方示例。"),
  ],
  "be-http": [
    r("MDN HTTP 指南（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", "补方法、状态码、缓存头。写完错误码表后再实现接口。"),
    r("OpenAPI 规范", "官方文档", "https://swagger.io/specification/", "把接口写成可检查的契约，而不是口头约定。"),
    r("MDN 学习中心（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development", "网络基础偏弱时，先完成「Web 工作原理」模块。"),
  ],
  "be-linux": [
    r("Git 官方文档", "官方文档", "https://git-scm.com/doc", "补分支、暂存与提交说明。仓库必须能看出你本人的历史。"),
    r("Debian Reference", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/", "补进程、权限、软件包与日志查看，够用即可。"),
    r("The Linux Command Line 在线书（免费）", "书籍/手册", "https://linuxcommand.org/tlcl.php", "没有单一「官方 Linux 教程」时，用这本广泛使用的免费手册练命令行。"),
  ],
  "be-mq": [
    r("Apache Kafka 入门", "官方文档", "https://kafka.apache.org/documentation/#gettingStarted", "补主题、生产者与消费者。做一条带重试说明的异步链路。"),
    r("RabbitMQ 文档", "官方文档", "https://www.rabbitmq.com/docs", "若 JD 写 RabbitMQ，用官方 Getting started 跑通队列与应答。"),
    r("Kafka 快速开始", "官方文档", "https://kafka.apache.org/quickstart", "本机起一个单节点，验证你真的发过/收过消息。"),
  ],
  "be-docker": [
    r("Docker Get Started", "官方文档", "https://docs.docker.com/get-started/", "补镜像、容器与 Compose。交付一条命令可启动的服务。"),
    r("Docker 官方文档首页", "官方文档", "https://docs.docker.com/", "查 Dockerfile 最佳实践与多阶段构建。"),
    r("Compose 规范说明", "官方文档", "https://docs.docker.com/compose/", "把 MySQL/Redis 与应用写进同一份 compose。"),
  ],
  "be-obs": [
    r("Prometheus 概览", "官方文档", "https://prometheus.io/docs/introduction/overview/", "给服务加黄金指标。先有计数/延迟，再谈大盘好看。"),
    r("Grafana 入门", "官方文档", "https://grafana.com/docs/grafana/latest/getting-started/", "把 Prometheus 指标画出来，并写一条可行动告警。"),
    r("OpenTelemetry 文档", "官方文档", "https://opentelemetry.io/docs/", "需要链路追踪时用官方概念页，不要只贴截图。"),
  ],
  "fe-htmlcss": [
    r("MDN 中文首页", "官方文档", "https://developer.mozilla.org/zh-CN/", "HTML/CSS 缺口从这里检索，不要只看过时博客。"),
    r("MDN 学习路径（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development", "完成 CSS 布局模块后，手写 2 个响应式页面（含表单）。"),
    r("web.dev Learn CSS", "官方文档", "https://web.dev/learn/css/", "补现代布局与响应式，对照你页面的移动宽度。"),
  ],
  "fe-js": [
    r("MDN JavaScript 指南（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide", "补异步、作用域与模块。写完自己的小题笔记再进框架。"),
    r("javascript.info", "公开课", "https://javascript.info/", "官方文档之外最常用的系统教程。读完异步章节后做 3 道自己的小题。"),
    r("freeCodeCamp JavaScript", "公开课", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "基础很薄时用来练手，不能替代 MDN。"),
  ],
  "fe-ts": [
    r("TypeScript Handbook", "官方文档", "https://www.typescriptlang.org/docs/handbook/intro.html", "补联合类型、泛型与类型收窄。用 TS 重写一个表单模块，禁止 any 贯穿。"),
    r("TypeScript 中文文档入口", "官方文档", "https://www.typescriptlang.org/zh/docs/", "官网中文文档枢纽。先读「基础 / 常见类型」，完成后再对照英文 Handbook 修订。"),
    r("React + TS 官方说明", "官方文档", "https://react.dev/learn/typescript", "若目标是 React，按此页给组件和事件加上类型。"),
  ],
  "fe-fw": [
    r("React Learn", "官方文档", "https://react.dev/learn", "完成 Learn 中的 Hooks 与状态管理章节后，交付带路由和表单校验的 SPA。"),
    r("Vue 官方指南（中文）", "官方文档", "https://cn.vuejs.org/guide/introduction.html", "若 JD 是 Vue，择一深入本指南，不要两个框架各会一点。"),
    r("React 思维模型", "官方文档", "https://react.dev/learn/thinking-in-react", "用来讲清你如何拆组件，面试常问。"),
  ],
  "fe-eng": [
    r("Vite 指南", "官方文档", "https://vite.dev/guide/", "自己配开发服务器与环境变量，不要只会 create 脚手架默认项。"),
    r("ESLint 文档", "官方文档", "https://eslint.org/docs/latest/", "加上可复用的 lint 约定，并写进 README。"),
    r("npm 文档（包管理）", "官方文档", "https://docs.npmjs.com/", "讲清依赖与脚本；若用 pnpm，再对照其官网。"),
  ],
  "fe-perf": [
    r("web.dev Learn", "官方文档", "https://web.dev/learn/", "做一次可量化的性能对照。标明环境和工具版本。"),
    r("Lighthouse 概览", "官方文档", "https://developer.chrome.com/docs/lighthouse/overview", "用 Lighthouse 出前后对比，不要只说「感觉快了」。"),
    r("MDN 性能（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/Performance", "补关键渲染路径词汇，好和面试对齐。"),
  ],
  "fe-test": [
    r("Playwright 入门", "官方文档", "https://playwright.dev/docs/intro", "给主路径加 E2E。只覆盖关键用户旅程。"),
    r("Testing Library 介绍", "官方文档", "https://testing-library.com/docs/react-testing-library/intro/", "React 组件测试按用户可见行为写，而不是测实现细节。"),
    r("Vitest 指南", "官方文档", "https://vitest.dev/guide/", "与 Vite 项目配套的单测；完成 3 个核心断言即可。"),
  ],
  "fs-fe": [
    r("React Learn", "官方文档", "https://react.dev/learn", "全栈的前端侧：完成主路径页面（登录后核心动作、空态、错误态）。"),
    r("Next.js 文档", "官方文档", "https://nextjs.org/docs", "若走 TS 全栈，用 App Router 完成页面与路由。"),
    r("Vue 官方指南（中文）", "官方文档", "https://cn.vuejs.org/guide/introduction.html", "Vue 全栈岗用此指南，不要同时开三套框架。"),
  ],
  "fs-be": [
    r("FastAPI 教程", "官方文档", "https://fastapi.tiangolo.com/tutorial/", "自己实现鉴权与 CRUD，不要完全依赖第三方后台。"),
    r("Next.js 文档（路由与服务端）", "官方文档", "https://nextjs.org/docs", "Node/TS 全栈用 Route Handler 或 Server Action 讲清契约。"),
    r("Spring Boot 参考", "官方文档", "https://docs.spring.io/spring-boot/reference/", "Java 全栈按 Web 章节交付可调用 API。"),
  ],
  "fs-db": [
    r("PostgreSQL 教程", "官方文档", "https://www.postgresql.org/docs/current/tutorial.html", "为主实体建表、约束与索引，写进仓库 schema。"),
    r("SQLite 文档", "官方文档", "https://www.sqlite.org/docs.html", "个人项目可用 SQLite，但要写清迁移到 Postgres 的差异。"),
    r("MySQL 8.0 手册", "官方文档", "https://dev.mysql.com/doc/refman/8.0/en/", "JD 写 MySQL 时改用此手册完成同样的建模练习。"),
  ],
  "fs-auth": [
    r("OWASP 认证备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", "登录态、会话与密码存储按此清单自检，不要自己发明加密。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "对照 A01/A07 写权限矩阵与一条安全检查清单。"),
    r("MDN Cookie / 存储（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Cookies", "讲清 Cookie 与存储边界，避免「只知道 JWT」口嗨。"),
  ],
  "fs-deploy": [
    r("Docker Get Started", "官方文档", "https://docs.docker.com/get-started/", "先容器化，再谈平台托管。"),
    r("Next.js 部署文档", "官方文档", "https://nextjs.org/docs/app/getting-started/deploying", "Next 项目按官方部署页发布一个可访问地址。"),
    r("Vite 构建指南", "官方文档", "https://vite.dev/guide/build", "静态前端的生产构建与预览。"),
  ],
  "fs-ts": [
    r("TypeScript Handbook", "官方文档", "https://www.typescriptlang.org/docs/handbook/intro.html", "前后端共享类型或至少给 API 客户端加上类型。"),
    r("TypeScript 中文文档入口", "官方文档", "https://www.typescriptlang.org/zh/docs/", "中文阅读枢纽；完成后对照英文 Handbook 修订页。"),
  ],
  "de-sql": [
    r("PostgreSQL 教程（含高级 SQL）", "官方文档", "https://www.postgresql.org/docs/current/tutorial.html", "窗口函数与多表从这里练，再进数仓引擎。"),
    r("Spark SQL 指南", "官方文档", "https://spark.apache.org/docs/latest/sql-getting-started.html", "JD 写 Spark 时用官方 SQL 入门完成一次汇总作业。"),
    r("Hive 语言手册", "官方文档", "https://cwiki.apache.org/confluence/display/Hive/LanguageManual", "国内数仓 JD 常写 Hive。没有更好的「单一官网教程」时用此语言手册。"),
  ],
  "de-model": [
    r("dbt 维度建模指南", "官方文档", "https://docs.getdbt.com/blog/kimball-dimensional-model", "用官方博客把事实/维度落到可重跑模型，并写一口径说明。"),
    r("dbt 构建模型", "官方文档", "https://docs.getdbt.com/docs/build/models", "把分层（staging/mart）落到可重跑模型，而不是只画图。"),
    r("Spark SQL 入门", "官方文档", "https://spark.apache.org/docs/latest/sql-getting-started.html", "用作业实现你画的分层，而不是停在 PPT。"),
  ],
  "de-engine": [
    r("Spark 文档", "官方文档", "https://spark.apache.org/docs/latest/", "完成一个可重跑的清洗/汇总作业，写清分区。"),
    r("Flink 稳定版文档", "官方文档", "https://nightlies.apache.org/flink/flink-docs-stable/", "JD 写实时时用官方教程跑通 DataStream 或 SQL。"),
    r("Spark SQL Getting Started", "官方文档", "https://spark.apache.org/docs/latest/sql-getting-started.html", "先批后流，避免一上来就上集群。"),
  ],
  "de-py": [
    r("Python 官方教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "作业入口、参数与日志用标准库先写对。"),
    r("Pandas 入门", "官方文档", "https://pandas.pydata.org/docs/getting_started/index.html", "小数据探查可以用，但不要用它替代 Spark/SQL 作业。"),
  ],
  "de-orch": [
    r("Airflow 官方教程", "官方文档", "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html", "编排一个有依赖与重试的 DAG。"),
    r("Airflow 核心概念", "官方文档", "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/overview.html", "讲清 Task/DAG/重试，对照你的补数说明。"),
    r("Spark 作业提交", "官方文档", "https://spark.apache.org/docs/latest/submitting-applications.html", "调度里真正跑起来的是作业，先能本地/单机提交。"),
  ],
  "de-dq": [
    r("Great Expectations 文档", "官方文档", "https://docs.greatexpectations.io/", "为关键表加唯一性/空值检查。这是公开的数据质量工具文档，不是唯一选择。"),
    r("dbt 测试文档", "官方文档", "https://docs.getdbt.com/docs/build/data-tests", "若用 dbt，用官方测试页写 3 条质量规则。"),
    r("Airflow 教程（失败重跑）", "官方文档", "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html", "质量告警后如何重跑，要能演示。"),
  ],
  "de-kafka": [
    r("Kafka 入门", "官方文档", "https://kafka.apache.org/documentation/#gettingStarted", "画清从日志到表的一条链路，标明延迟与一致性。"),
    r("Kafka Quickstart", "官方文档", "https://kafka.apache.org/quickstart", "本机验证生产/消费后再谈 Flink CDC。"),
    r("Flink 文档", "官方文档", "https://nightlies.apache.org/flink/flink-docs-stable/", "实时接入作业的官方入口。"),
  ],
  "ml-py": [
    r("Python 教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "训练/评测必须是可重复脚本，不要只会点 Notebook。"),
    r("NumPy 快速入门", "官方文档", "https://numpy.org/doc/stable/user/quickstart.html", "补数组运算，避免全程手写循环。"),
    r("Pandas 入门", "官方文档", "https://pandas.pydata.org/docs/getting_started/index.html", "表格特征与拆分在脚本里完成。"),
  ],
  "ml-basic": [
    r("scikit-learn 用户指南", "官方文档", "https://scikit-learn.org/stable/user_guide.html", "先做强传统基线（泄漏、交叉验证），再上深度学习。"),
    r("scikit-learn 入门", "官方文档", "https://scikit-learn.org/stable/getting_started.html", "用官方流水线跑通一个分类/回归，写出基线指标。"),
    r("Hugging Face Learn", "公开课", "https://huggingface.co/learn", "建立可复现实验习惯；课程完成不等于有作品。"),
  ],
  "ml-dl": [
    r("PyTorch Tutorials", "官方文档", "https://docs.pytorch.org/tutorials/", "独立完成训练-验证-推理脚本，固定随机种子。"),
    r("PyTorch 官方教程（旧域名仍跳转）", "官方文档", "https://pytorch.org/tutorials/", "若 docs.pytorch.org 打不开，用此入口。目标仍是可复现脚本。"),
    r("Hugging Face 课程", "公开课", "https://huggingface.co/learn", "Transformer 入门用官方课，评测集必须你自己固定。"),
  ],
  "ml-math": [
    r("Stanford CS229 课程页", "公开课", "https://cs229.stanford.edu/", "补你真正用过的损失与优化器，不要空背全书。"),
    r("ISL 教材主页（免费 PDF）", "书籍/手册", "https://www.statlearning.com/", "统计学习入门的通行免费教材。读与你项目相关的章节即可。"),
    r("scikit-learn 用户指南", "官方文档", "https://scikit-learn.org/stable/user_guide.html", "用实现反推公式，比只看讲义更接近面试。"),
  ],
  "ml-algo": [
    r("OI Wiki", "公开课", "https://oi-wiki.org/", "中文算法讲解的常用开源站点。按数组/树/图补题，记录自己的题解。"),
    r("LeetCode", "平台练习", "https://leetcode.cn/", "国内常用刷题站。只作为编程面试练习，不是算法岗作品集。"),
    r("freeCodeCamp 算法练习", "公开课", "https://www.freecodecamp.org/learn", "入门刷题的免费替代，完成后再转到题库分类练习。"),
  ],
  "ml-mlops": [
    r("MLflow 文档", "官方文档", "https://mlflow.org/docs/latest/index.html", "固定实验记录与模型版本，避免只有准确率截图。"),
    r("PyTorch 推理/保存教程入口", "官方文档", "https://docs.pytorch.org/tutorials/", "把模型封成可调用脚本或小服务。"),
    r("Hugging Face Learn", "公开课", "https://huggingface.co/learn", "看评测与分享章节，但仓库必须能复现。"),
  ],
  "llm-py": [
    r("FastAPI 教程", "官方文档", "https://fastapi.tiangolo.com/tutorial/", "把模型调用做成带超时、日志的服务，而不是 Notebook。"),
    r("Python 教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "补异常与模块，服务才能稳定跑。"),
    r("Docker Get Started", "官方文档", "https://docs.docker.com/get-started/", "演示环境可复现，避免「只有我电脑能跑」。"),
  ],
  "llm-api": [
    r("OpenAI 文本生成指南", "官方文档", "https://platform.openai.com/docs/guides/text-generation", "按你实际调用的厂商文档记录模型名与参数；本页是常见英文 API 示例。"),
    r("阿里云百炼 / 模型服务文档", "官方文档", "https://help.aliyun.com/zh/model-studio/", "国内常用的通义等 API 入口。做提示词版本表时写清模型与日期。"),
    r("Anthropic 文档简介", "官方文档", "https://docs.anthropic.com/en/docs/intro", "若用 Claude，以官方文档为准，不要混用过时第三方封装说明。"),
  ],
  "llm-rag": [
    r("LangChain 文档", "官方文档", "https://docs.langchain.com/", "先理解检索-拼接-生成，再选框架。完成一个带引用的问答。"),
    r("LangChain RAG 教程", "官方文档", "https://docs.langchain.com/oss/python/langchain/rag", "按官方 RAG 教程做出切片与出处；失败问答至少记录 5 条。"),
    r("LlamaIndex 文档", "官方文档", "https://docs.llamaindex.ai/", "偏索引与查询引擎。可与 LangChain 二选一深入。"),
    r("Hugging Face 课程", "公开课", "https://huggingface.co/learn", "补检索/生成概念；黄金集必须你自己建，课程不能代替评测。"),
  ],
  "llm-eval": [
    r("LangSmith 评测文档", "官方文档", "https://docs.langchain.com/langsmith/evaluation", "缺少 RAG/应用评测时用此页：固定数据集、对比改动前后，小样本也要标明。"),
    r("Hugging Face Evaluate", "官方文档", "https://huggingface.co/docs/evaluate/index", "用公开库算指标，但业务「正确性」仍要你的黄金集。"),
    r("Hugging Face 课程", "公开课", "https://huggingface.co/learn", "建立评测意识；交作业时附 30–50 条黄金集对比表。"),
    r("LangChain 文档（评测相关导航）", "官方文档", "https://docs.langchain.com/", "从文档站检索 evaluation / tracing，把一次改动做成可回归记录。"),
  ],
  "llm-fw": [
    r("LangChain 文档", "官方文档", "https://docs.langchain.com/", "能讲清检索与工具调用即可，不要堆组件。"),
    r("LlamaIndex 文档", "官方文档", "https://docs.llamaindex.ai/", "若团队用 LlamaIndex，以官方查询引擎页为准。"),
    r("LangGraph 文档", "官方文档", "https://langchain-ai.github.io/langgraph/", "需要状态循环时再学；先有轨迹日志。"),
  ],
  "llm-prod": [
    r("FastAPI 教程（中间件/依赖）", "官方文档", "https://fastapi.tiangolo.com/tutorial/", "限流、依赖和错误处理按官方模式加，再谈模型。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "提示注入与数据泄露按 Web 安全共同语言写护栏。"),
    r("Docker Get Started", "官方文档", "https://docs.docker.com/get-started/", "把服务与依赖变成可部署单元。"),
  ],
  "ag-eng": [
    r("FastAPI 教程", "官方文档", "https://fastapi.tiangolo.com/tutorial/", "Agent 之前先能独立交付一个服务。"),
    r("Python 教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "超时、异常与模块是循环能停下来的前提。"),
    r("Docker Get Started", "官方文档", "https://docs.docker.com/get-started/", "演示可复现。"),
  ],
  "ag-tool": [
    r("OpenAI 函数调用指南", "官方文档", "https://platform.openai.com/docs/guides/function-calling", "设计 3–5 个工具的 JSON Schema，处理失败与拒答。按你实际厂商文档对照。"),
    r("LangChain 文档", "官方文档", "https://docs.langchain.com/", "看工具绑定章节；重点是校验与权限，不是调库。"),
    r("LangGraph 文档", "官方文档", "https://langchain-ai.github.io/langgraph/", "工具调用要落在有限状态机里。"),
  ],
  "ag-state": [
    r("LangGraph 文档", "官方文档", "https://langchain-ai.github.io/langgraph/", "实现步数限制与可回放轨迹，避免无限聊天冒充 Agent。"),
    r("LangChain 文档", "官方文档", "https://docs.langchain.com/", "对照官方对 agent / graph 的说明，写清停止条件。"),
    r("Hugging Face Agents 课程", "公开课", "https://huggingface.co/learn/agents-course/unit0/introduction", "补工具与循环概念；作品必须有你的任务集。"),
  ],
  "ag-eval": [
    r("LangSmith 评测", "官方文档", "https://docs.langchain.com/langsmith/evaluation", "固化 15–30 个任务：成功 / 应拒绝 / 应澄清。"),
    r("Hugging Face Agents 课程", "公开课", "https://huggingface.co/learn/agents-course/unit0/introduction", "课程讲评测思路；回归集必须你自己维护。"),
    r("Hugging Face Evaluate", "官方文档", "https://huggingface.co/docs/evaluate/index", "能量化的部分用公开库，任务成败仍按你的脚本判定。"),
  ],
  "ag-obs": [
    r("OpenTelemetry 文档", "官方文档", "https://opentelemetry.io/docs/", "每步工具调用要能追溯。可用结构化日志代替完整 OTel。"),
    r("LangSmith 评测与追踪", "官方文档", "https://docs.langchain.com/langsmith/evaluation", "没有商业账号时，至少用本地日志实现同样字段。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "写工具的权限与注入面。"),
  ],
  "ag-rag": [
    r("LangChain RAG 教程", "官方文档", "https://docs.langchain.com/oss/python/langchain/rag", "Agent 先检索再行动，轨迹里要能看到检索步骤。"),
    r("LlamaIndex 文档", "官方文档", "https://docs.llamaindex.ai/", "知识库查询引擎的官方入口。"),
    r("Hugging Face 课程", "公开课", "https://huggingface.co/learn", "补检索概念，评测仍用你的黄金集。"),
  ],
  "do-linux": [
    r("Debian Reference", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/", "进程、网络与日志排障的免费手册。"),
    r("Linux Command Line 在线书", "书籍/手册", "https://linuxcommand.org/tlcl.php", "系统命令行入门；写一份自己的排障笔记。"),
    r("MDN HTTP（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", "反向代理与状态码必须能讲清。"),
  ],
  "do-script": [
    r("Bash 手册", "官方文档", "https://www.gnu.org/software/bash/manual/", "把一项重复操作写成幂等脚本。"),
    r("Python 教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "复杂自动化用 Python，带参数校验。"),
    r("Debian Reference", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/", "对照系统管理章节检查脚本是否安全。"),
  ],
  "do-docker": [
    r("Docker Get Started", "官方文档", "https://docs.docker.com/get-started/", "多阶段构建、非 root、健康检查。"),
    r("Docker 文档", "官方文档", "https://docs.docker.com/", "查官方最佳实践，不要只抄网上 Dockerfile。"),
    r("Compose", "官方文档", "https://docs.docker.com/compose/", "本地把依赖一次性拉起。"),
  ],
  "do-ci": [
    r("GitHub Actions 文档", "官方文档", "https://docs.github.com/en/actions", "按你实际使用的 CI 产品选择；本页是常见免费选项。"),
    r("GitLab CI/CD 文档", "官方文档", "https://docs.gitlab.com/ee/ci/", "团队用 GitLab 时以官方 yaml 参考为准。"),
    r("Docker Get Started", "官方文档", "https://docs.docker.com/get-started/", "流水线里构建的是镜像，先本地会构建。"),
  ],
  "do-k8s": [
    r("Kubernetes 教程", "官方文档", "https://kubernetes.io/docs/tutorials/", "部署无状态服务，理解 Probe 与滚动发布。"),
    r("Kubernetes 文档", "官方文档", "https://kubernetes.io/zh-cn/docs/home/", "中文文档入口，概念以官网为准。"),
    r("kubectl 速查", "官方文档", "https://kubernetes.io/docs/reference/kubectl/quick-reference/", "演练一次故障查看事件与日志。"),
  ],
  "do-obs": [
    r("Prometheus 概览", "官方文档", "https://prometheus.io/docs/introduction/overview/", "定义黄金指标与一条可行动告警。"),
    r("Grafana 入门", "官方文档", "https://grafana.com/docs/grafana/latest/getting-started/", "仪表盘必须对应告警，避免只有好看图。"),
    r("Google SRE Book（公开）", "书籍/手册", "https://sre.google/sre-book/table-of-contents/", "SLO/错误预算的通行词汇，不是某家雇主承诺。"),
  ],
  "do-iac": [
    r("Terraform 教程", "官方文档", "https://developer.hashicorp.com/terraform/tutorials", "管一小块可销毁重建的环境。"),
    r("Terraform 文档", "官方文档", "https://developer.hashicorp.com/terraform/docs", "状态与模块以官方为准。"),
    r("Kubernetes 教程", "官方文档", "https://kubernetes.io/docs/tutorials/", "IaC 最终仍要落到可运行工作负载。"),
  ],
  "qa-theory": [
    r("ISTQB 官网", "书籍/手册", "https://www.istqb.org/", "测试设计共同语言（等价类/边界）。不必考证，用大纲里的术语写用例。"),
    r("MDN 学习中心（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development", "先能说清被测 Web 行为，再写用例。"),
    r("Playwright 入门", "官方文档", "https://playwright.dev/docs/intro", "把 P0 路径落成可跑脚本，避免只交 Excel。"),
  ],
  "qa-lang": [
    r("pytest 文档", "官方文档", "https://docs.pytest.org/en/stable/", "用脚本处理数据与断言，形成可回归套件。"),
    r("Python 教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "测试开发的语言底线。"),
    r("JavaScript 指南（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide", "前端测试岗用 JS/TS 写脚本。"),
  ],
  "qa-api": [
    r("pytest 文档", "官方文档", "https://docs.pytest.org/en/stable/", "接口自动化的常用载体：夹具、断言、报告。"),
    r("Playwright API 测试", "官方文档", "https://playwright.dev/docs/api-testing", "也可用 Playwright 做接口层；保持数据隔离。"),
    r("MDN HTTP（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", "状态码与方法必须能讲清。"),
  ],
  "qa-auto": [
    r("Playwright 入门", "官方文档", "https://playwright.dev/docs/intro", "只覆盖主路径，并写维护说明。"),
    r("Cypress 文档", "官方文档", "https://docs.cypress.io/", "团队若用 Cypress，以官方为准，不要混两套都浅尝。"),
    r("Testing Library", "官方文档", "https://testing-library.com/docs/react-testing-library/intro/", "组件层测试按用户可见行为写。"),
  ],
  "qa-ci": [
    r("GitHub Actions 文档", "官方文档", "https://docs.github.com/en/actions", "把套件接到 CI，失败能定位到提交。"),
    r("GitLab CI 文档", "官方文档", "https://docs.gitlab.com/ee/ci/", "GitLab 团队用此页写门禁。"),
    r("pytest 文档", "官方文档", "https://docs.pytest.org/en/stable/", "先本地稳定绿，再进流水线。"),
  ],
  "qa-perf": [
    r("JMeter 入门", "官方文档", "https://jmeter.apache.org/usermanual/get-started.html", "做一次小规模压测，写清指标与瓶颈，禁止空报「高并发」。"),
    r("JMeter 用户手册", "官方文档", "https://jmeter.apache.org/usermanual/index.html", "对照官方术语写方案。"),
    r("web.dev 性能", "官方文档", "https://web.dev/learn/", "前端性能专项可与 Lighthouse 一起做。"),
  ],
  "pm-req": [
    r("GOV.UK 用户故事指南", "书籍/手册", "https://www.gov.uk/service-manual/agile-delivery/writing-user-stories", "问题、验收、非目标的公开写法。按此结构写 1 份可估时 PRD。"),
    r("NN/g 用户需求陈述", "书籍/手册", "https://www.nngroup.com/articles/user-need-statements/", "把「功能清单」改写成用户需求。"),
    r("MDN 学习中心（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development", "技术 PM 要能读懂页面/接口基本对象。"),
  ],
  "pm-tech": [
    r("MDN HTTP（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", "能和研发讨论接口与缓存，而不是甩锅。"),
    r("Martin Fowler：Microservices", "书籍/手册", "https://martinfowler.com/articles/microservices.html", "架构取舍的通行公开文章，用来画一页系统理解图。"),
    r("Next.js 文档", "官方文档", "https://nextjs.org/docs", "若产品是 Web，用一份真实技术文档练「能读懂约束」。"),
  ],
  "pm-data": [
    r("PostgreSQL 教程", "官方文档", "https://www.postgresql.org/docs/current/tutorial.html", "会写基础 SQL 才能自己拉基线，不依赖「要个数」。"),
    r("Mode SQL Tutorial", "公开课", "https://mode.com/sql-tutorial/introduction-to-sql/", "免费 SQL 入门；完成后用真实公开数据集练 3 条查询。"),
    r("NN/g 指标相关文章索引", "书籍/手册", "https://www.nngroup.com/articles/user-need-statements/", "先把「成功」写成可观察语句，再谈漏斗。"),
  ],
  "pm-proj": [
    r("Atlassian Agile 指南", "书籍/手册", "https://www.atlassian.com/agile", "迭代、风险与看板的通行公开材料。写一份风险表。"),
    r("GOV.UK Agile 交付", "书籍/手册", "https://www.gov.uk/service-manual/agile-delivery", "公开部门的交付手册，用来练排期减法。"),
    r("GitHub 项目/Issue 文档", "官方文档", "https://docs.github.com/en/issues", "用公开工具练路线图，不必买 Jira。"),
  ],
  "pm-ux": [
    r("Figma 帮助中心", "官方文档", "https://help.figma.com/hc/en-us", "主路径原型 + 异常态。平台 PM 也可用纯流程图。"),
    r("NN/g 文章", "书籍/手册", "https://www.nngroup.com/articles/user-need-statements/", "先写清任务，再画界面。"),
    r("MDN 无障碍入门（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility", "验收里至少包含键盘/对比度中的一项。"),
  ],
  "pm-industry": [
    r("GOV.UK Service Manual", "书籍/手册", "https://www.gov.uk/service-manual", "领域知识没有全球统一官方课。用公开监管/服务手册练「对象与约束」写法。"),
    r("MDN（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/", "先能读懂产品技术对象，再补行业名词表。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "金融/账号类产品至少能说出合规与安全约束类型。"),
  ],
  "mo-native": [
    r("Android 开发者文档", "官方文档", "https://developer.android.com/docs", "Kotlin/Java 栈：完成列表、详情、网络与本地存储。"),
    r("Apple 开发者文档", "官方文档", "https://developer.apple.com/documentation/", "Swift/iOS 栈以官方文档为准。"),
    r("Flutter 文档", "官方文档", "https://docs.flutter.dev/", "跨端岗用官方 Cookbook 做可安装 Demo。"),
  ],
  "mo-life": [
    r("Android Activity 生命周期", "官方文档", "https://developer.android.com/guide/components/activities/activity-lifecycle", "专门处理后台杀死与恢复，写出复现步骤。"),
    r("Apple 文档", "官方文档", "https://developer.apple.com/documentation/", "iOS 对照 Scene/App 生命周期官方页。"),
    r("Flutter 状态管理", "官方文档", "https://docs.flutter.dev/data-and-backend/state-mgmt/intro", "跨端同样要处理恢复，不要只做热重载 Demo。"),
  ],
  "mo-net": [
    r("Android 网络指南", "官方文档", "https://developer.android.com/develop/connectivity/network-ops", "弱网、重试与本地缓存按官方指南实现。"),
    r("Flutter 网络", "官方文档", "https://docs.flutter.dev/cookbook/networking/fetch-data", "跨端的最小网络层。"),
    r("MDN HTTP（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", "客户端错误码与缓存语义仍是 HTTP。"),
  ],
  "mo-quality": [
    r("Android 性能文档", "官方文档", "https://developer.android.com/topic/performance", "启动/卡顿一次前后对比，写清环境。"),
    r("Android Vitals", "官方文档", "https://developer.android.com/topic/performance/vitals", "崩溃率等通行指标的官方说明。"),
    r("Flutter 性能", "官方文档", "https://docs.flutter.dev/perf", "跨端用官方性能页，不要只看帧率口号。"),
  ],
  "mo-ci": [
    r("Android Studio / 构建文档", "官方文档", "https://developer.android.com/build", "签名与构建变体先在官方文档跑通。"),
    r("GitHub Actions", "官方文档", "https://docs.github.com/en/actions", "把构建放到 CI，写发版清单。"),
    r("Fastlane 文档", "官方文档", "https://docs.fastlane.tools/", "商店发版自动化的常用开源工具文档。"),
  ],
  "sec-web": [
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "Web 漏洞共同语言。在合法靶场复现后写修复建议。"),
    r("PortSwigger Web Security Academy", "平台练习", "https://portswigger.net/web-security", "合法靶场。禁止扫描未授权系统。"),
    r("OWASP Testing Guide 项目页", "官方文档", "https://owasp.org/www-project-web-security-testing-guide/", "测试范围与方法的公开大纲。"),
  ],
  "sec-lang": [
    r("OWASP 安全编码速查", "官方文档", "https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/", "读开源项目时按此标信任边界。"),
    r("Python 教程（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/", "先能读业务代码。"),
    r("MDN（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/", "Web 技术对象查官方，避免只靠扫描器。"),
  ],
  "sec-linux": [
    r("Debian Reference", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/", "日志与权限是安全分析的底盘。"),
    r("MDN HTTP（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP", "从请求链理解信任边界。"),
    r("Linux Command Line 书", "书籍/手册", "https://linuxcommand.org/tlcl.php", "抓包/日志前先会基本命令。"),
  ],
  "sec-sdl": [
    r("Microsoft SDL", "官方文档", "https://www.microsoft.com/en-us/securityengineering/sdl", "威胁建模与漏洞闭环的公开方法论。写迷你工单模板。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "评级与修复验证对照此类问题写。"),
    r("OWASP 测试指南项目", "官方文档", "https://owasp.org/www-project-web-security-testing-guide/", "再验证步骤按公开大纲写，不编造内部流程。"),
  ],
  "sec-tool": [
    r("Burp 文档", "官方文档", "https://portswigger.net/burp/documentation", "工具是手段。写清误报如何处理。只在授权环境使用。"),
    r("PortSwigger Academy", "平台练习", "https://portswigger.net/web-security", "合法练习，不要把未授权扫描当作品。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "工具输出必须映射到问题类型与修复。"),
  ],
  "sec-cloud": [
    r("OWASP Kubernetes 安全备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html", "没有单一「OWASP Cloud Security」官网页；用此备忘单查身份、密钥、隔离与 RBAC。"),
    r("Kubernetes 文档（中文）", "官方文档", "https://kubernetes.io/zh-cn/docs/home/", "容器安全认知从官方概念开始。"),
    r("Docker 文档", "官方文档", "https://docs.docker.com/", "镜像与非 root 的官方基线。"),
  ],
};

export const ROLE_RESOURCES: Record<string, ResourceRef[]> = {
  backend: [SKILL_RESOURCES["be-fw"][0], SKILL_RESOURCES["be-sql"][0], SKILL_RESOURCES["be-redis"][0], SKILL_RESOURCES["be-docker"][0]],
  frontend: [SKILL_RESOURCES["fe-fw"][0], SKILL_RESOURCES["fe-ts"][0], SKILL_RESOURCES["fe-htmlcss"][0], SKILL_RESOURCES["fe-eng"][0]],
  fullstack: [SKILL_RESOURCES["fs-fe"][1], SKILL_RESOURCES["fs-be"][0], SKILL_RESOURCES["fs-db"][0], SKILL_RESOURCES["fs-auth"][0]],
  "data-eng": [SKILL_RESOURCES["de-engine"][0], SKILL_RESOURCES["de-sql"][0], SKILL_RESOURCES["de-orch"][0], SKILL_RESOURCES["de-model"][0]],
  ml: [SKILL_RESOURCES["ml-dl"][0], SKILL_RESOURCES["ml-basic"][0], SKILL_RESOURCES["ml-py"][0], SKILL_RESOURCES["ml-mlops"][0]],
  "llm-app": [SKILL_RESOURCES["llm-rag"][0], SKILL_RESOURCES["llm-eval"][0], SKILL_RESOURCES["llm-api"][0], SKILL_RESOURCES["llm-py"][0]],
  agent: [SKILL_RESOURCES["ag-state"][0], SKILL_RESOURCES["ag-tool"][0], SKILL_RESOURCES["ag-eval"][0], SKILL_RESOURCES["ag-rag"][0]],
  devops: [SKILL_RESOURCES["do-k8s"][0], SKILL_RESOURCES["do-docker"][0], SKILL_RESOURCES["do-ci"][0], SKILL_RESOURCES["do-obs"][0]],
  qa: [SKILL_RESOURCES["qa-auto"][0], SKILL_RESOURCES["qa-api"][0], SKILL_RESOURCES["qa-ci"][0], SKILL_RESOURCES["qa-lang"][0]],
  "tech-pm": [SKILL_RESOURCES["pm-req"][0], SKILL_RESOURCES["pm-tech"][0], SKILL_RESOURCES["pm-data"][0], SKILL_RESOURCES["pm-proj"][0]],
  mobile: [SKILL_RESOURCES["mo-native"][0], SKILL_RESOURCES["mo-life"][0], SKILL_RESOURCES["mo-net"][0], SKILL_RESOURCES["mo-quality"][0]],
  security: [SKILL_RESOURCES["sec-web"][0], SKILL_RESOURCES["sec-web"][1], SKILL_RESOURCES["sec-sdl"][0], SKILL_RESOURCES["sec-lang"][0]],
};

export const ALIGN_RESOURCES: ResourceRef[] = [
  r("GitHub README 说明", "官方文档", "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", "把项目写成他人能复现的 README，这是简历之外的第一证据。"),
  r("BOSS 直聘", "平台练习", "https://www.zhipin.com/", "打开真实在招 JD，统计技能词。不要编造公司案例。"),
  r("拉勾网", "平台练习", "https://www.lagou.com/", "对照国内互联网岗描述结构，回写缺口表。"),
  r("LinkedIn Jobs", "平台练习", "https://www.linkedin.com/jobs/", "跨境/英文岗用公开职位描述做同样的词频对照。"),
];

export const SEARCH_RESOURCES: ResourceRef[] = [
  r("猎聘", "平台练习", "https://www.liepin.com/", "社招样本来源之一。记录未进面的共同词，回到作品补证据。"),
  r("BOSS 直聘", "平台练习", "https://www.zhipin.com/", "按匹配度分层投递，先匹配岗再迁移岗。"),
  r("LinkedIn Jobs", "平台练习", "https://www.linkedin.com/jobs/", "远程/英文岗位的公开样本。"),
  r("GitHub README 文档", "官方文档", "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes", "面试前再检查仓库是否能独立打开。"),
];

export function getSkillResources(skillId?: string): ResourceRef[] {
  if (!skillId) return [];
  return (SKILL_RESOURCES[skillId] ?? []).slice(0, 4);
}

export function getRoleResources(roleId: string): ResourceRef[] {
  return ROLE_RESOURCES[roleId] ?? [];
}

export function collectResourceUrls(): string[] {
  const urls = new Set<string>();
  for (const list of Object.values(SKILL_RESOURCES)) {
    for (const item of list) urls.add(item.url);
  }
  for (const item of [...ALIGN_RESOURCES, ...SEARCH_RESOURCES]) urls.add(item.url);
  return [...urls].sort();
}
