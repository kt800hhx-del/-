import type { ResourceRef } from "./types";

function r(
  name: string,
  kind: ResourceRef["kind"],
  url: string,
  closesGap: string,
  finishCriteria: string,
): ResourceRef {
  if (!url.startsWith("https://")) {
    throw new Error(`资源必须是 https：${url}`);
  }
  return { name, kind, url, closesGap, finishCriteria, note: finishCriteria };
}

/** 按技能 id 映射 2–3 条深链（章节/教程，不是站点首页）。 */
export const SKILL_RESOURCES: Record<string, ResourceRef[]> = {
  "be-lang": [
    r("Java 并发基础（Oracle 教程）", "官方文档", "https://docs.oracle.com/javase/tutorial/essential/concurrency/index.html", "后端语言：并发与错误处理", "读完后用纯 JDK 写一个带线程池/中断的命令行工具，禁止先上 Spring。"),
    r("Python 控制流（官方中文教程）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "后端语言：Python 控制流", "完成函数、异常与推导式后，用标准库写一个带参数校验的小工具。"),
    r("Effective Go · Concurrency", "官方文档", "https://go.dev/doc/effective_go#concurrency", "后端语言：Go 并发惯例", "按官方惯例手写 goroutine + channel，写清退出条件。"),
  ],
  "be-fw": [
    r("Spring Boot Web（Servlet）", "官方文档", "https://docs.spring.io/spring-boot/reference/web/servlet.html", "Web 框架：分层 REST", "按此章搭 Controller/校验/错误处理，交付可调用的 REST，而不是只打开生成器。"),
    r("Spring Boot Validation", "官方文档", "https://docs.spring.io/spring-boot/reference/io/validation.html", "Web 框架：参数校验", "给创建/更新接口加上 Bean Validation，用错误响应证明校验生效。"),
    r("FastAPI 依赖注入", "官方文档", "https://fastapi.tiangolo.com/tutorial/dependencies/", "Web 框架：Python 依赖与校验", "用 Depends + Pydantic 完成鉴权依赖和请求体校验。"),
  ],
  "be-sql": [
    r("MySQL 8.0：索引优化", "官方文档", "https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html", "索引与 EXPLAIN", "对照索引类型改写 3 条业务查询，说明为什么选这列而不是全表扫。"),
    r("MySQL 8.0：EXPLAIN 输出", "官方文档", "https://dev.mysql.com/doc/refman/8.0/en/explain.html", "索引与 EXPLAIN", "对慢 SQL 跑 EXPLAIN，把 type/key/rows 变化写成前后对比。"),
    r("PostgreSQL：使用 EXPLAIN", "官方文档", "https://www.postgresql.org/docs/current/using-explain.html", "索引与 EXPLAIN", "若 JD 写 Postgres，用 EXPLAIN ANALYZE 证明索引被用到。"),
  ],
  "be-redis": [
    r("Redis 数据类型", "官方文档", "https://redis.io/docs/latest/develop/data-types/", "缓存：结构选择", "为读多写少接口选对 String/Hash/ZSet，写清为什么不是「全用 GET/SET」。"),
    r("EXPIRE 命令", "官方文档", "https://redis.io/docs/latest/commands/expire/", "缓存：过期与失效", "实现带 TTL 的热点缓存，并写穿透/击穿时你怎么处理。"),
    r("Spring Data Redis Cache", "官方文档", "https://docs.spring.io/spring-data/redis/reference/redis/redis-cache.html", "缓存：接到应用", "Java 栈用 Cache 抽象接到查询接口；其他语言栈改用官方客户端示例。"),
  ],
  "be-http": [
    r("MDN HTTP 状态码（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status", "HTTP / REST：错误码", "给自己的 API 写错误码表，禁止一律 200 + message。"),
    r("MDN HTTP 缓存（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Caching", "HTTP / REST：缓存头", "为读接口标明 Cache-Control / ETag 取舍。"),
    r("OpenAPI 3 规范", "官方文档", "https://swagger.io/specification/", "HTTP / REST：契约", "把 3 个核心接口写成可检查的 OpenAPI，含幂等说明。"),
  ],
  "be-linux": [
    r("Git 分支基础（Pro Git）", "书籍/手册", "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging", "Linux 与 Git：分支协作", "用功能分支 + 可审阅提交写出你本人的历史，而不是一次性上传压缩包。"),
    r("Debian Reference · 第 4 章 操作", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/ch04.en.html", "Linux：进程与日志", "演练 ps/journal/端口查看，写一份自己的排障笔记。"),
    r("Learning the shell", "书籍/手册", "https://linuxcommand.org/lc3_learning_the_shell.php", "Linux：命令行", "完成重定向、管道与权限练习，能独立看日志。"),
  ],
  "be-mq": [
    r("Kafka：生产者概念", "官方文档", "https://kafka.apache.org/documentation/#intro_producers", "消息队列：投递语义", "讲清 at-least-once 与重试，画出一条异步通知链路。"),
    r("Kafka Quickstart", "官方文档", "https://kafka.apache.org/quickstart", "消息队列：本机收发", "本机单节点真正发过/收过一条消息，再谈集群。"),
    r("RabbitMQ 入门教程", "官方文档", "https://www.rabbitmq.com/tutorials/tutorial-one-python", "消息队列：应答与重试", "若 JD 写 RabbitMQ，按官方教程跑通发布/消费与 ack。"),
  ],
  "be-docker": [
    r("Docker 多阶段构建", "官方文档", "https://docs.docker.com/build/building/multi-stage/", "容器化：镜像体积", "用多阶段构建出一个可运行镜像，写清为什么不用「整本 JDK」。"),
    r("Compose 入门", "官方文档", "https://docs.docker.com/compose/gettingstarted/", "容器化：一键启动", "把应用 + MySQL/Redis 写进 compose，他人一条命令能起。"),
    r("运行第一个容器化应用", "官方文档", "https://docs.docker.com/get-started/tutorials/run-an-app/", "容器化：最小可运行", "按教程跑通后换成你自己的服务，而不是只截图 Hello World。"),
  ],
  "be-obs": [
    r("Prometheus 埋点实践", "官方文档", "https://prometheus.io/docs/practices/instrumentation/", "可观测性：黄金指标", "给核心接口加 QPS/延迟/错误率，先有数字再谈大盘。"),
    r("Prometheus 告警概览", "官方文档", "https://prometheus.io/docs/alerting/latest/overview/", "可观测性：可行动告警", "写一条「错误率上升」告警，说明谁该做什么。"),
    r("OpenTelemetry Traces", "官方文档", "https://opentelemetry.io/docs/concepts/signals/traces/", "可观测性：链路", "给一次请求画 span；没有完整 OTel 也要用结构化日志对齐字段。"),
  ],
  "fe-htmlcss": [
    r("MDN CSS 布局（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout", "HTML/CSS：响应式布局", "手写两个宽度下的页面，不用 UI 库撑布局。"),
    r("web.dev Flexbox", "官方文档", "https://web.dev/learn/css/flexbox", "HTML/CSS：Flex 布局", "用 Flex 完成表单行与导航，标出断点。"),
    r("MDN 表单（中文学习路径）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Extensions/Forms", "HTML/CSS：表单可访问性", "做一个带校验提示的表单，键盘可走完。"),
  ],
  "fe-js": [
    r("MDN Promises（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises", "JavaScript：异步", "不用框架重写 3 个异步小题，讲清错误如何冒泡。"),
    r("javascript.info async/await", "公开课", "https://javascript.info/async-await", "JavaScript：async/await", "把 Promise 链改成 async，并处理并发与失败。"),
    r("MDN 模块（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules", "JavaScript：模块", "把练习拆成 ES module，禁止一个文件堆全部逻辑。"),
  ],
  "fe-ts": [
    r("TypeScript：类型收窄", "官方文档", "https://www.typescriptlang.org/docs/handbook/2/narrowing.html", "TypeScript：收窄与联合类型", "用联合类型重写一个表单状态，禁止 any 贯穿。"),
    r("TypeScript：泛型", "官方文档", "https://www.typescriptlang.org/docs/handbook/2/generics.html", "TypeScript：泛型", "给 API 客户端加泛型，调用处能看出返回类型。"),
    r("TS 中文：常见类型", "官方文档", "https://www.typescriptlang.org/zh/docs/handbook/2/everyday-types.html", "TypeScript：基础类型", "中文读完「常见类型」后对照英文收窄章节修订。"),
  ],
  "fe-fw": [
    r("React：管理 state", "官方文档", "https://react.dev/learn/managing-state", "React 表单与状态", "按此页拆表单状态，交付带校验的受控输入，而不是只会 useState 计数。"),
    r("React：在组件间共享 state", "官方文档", "https://react.dev/learn/sharing-state-between-components", "React 表单与状态", "把列表筛选/弹层状态提升到合适层级，画一张状态树。"),
    r("Vue：表单输入绑定", "官方文档", "https://cn.vuejs.org/guide/essentials/forms", "Vue 表单与状态", "若目标是 Vue，按此页完成带校验的表单，不要两套框架各会一点。"),
  ],
  "fe-eng": [
    r("Vite：环境变量与模式", "官方文档", "https://vite.dev/guide/env-and-mode", "前端工程化：环境配置", "自己配 .env 与构建模式，README 写清如何切换。"),
    r("ESLint 起步", "官方文档", "https://eslint.org/docs/latest/use/getting-started", "前端工程化：Lint", "加上可复用规则，CI 或本地脚本能红。"),
    r("npm scripts", "官方文档", "https://docs.npmjs.com/cli/v10/using-npm/scripts", "前端工程化：脚本", "用 scripts 固化 lint/test/build，而不是口头约定。"),
  ],
  "fe-perf": [
    r("web.dev：LCP", "官方文档", "https://web.dev/articles/lcp", "性能：LCP", "对主列表做一次 LCP 前后对比，写清设备和节流条件。"),
    r("Lighthouse 性能评分", "官方文档", "https://developer.chrome.com/docs/lighthouse/performance/performance-scoring", "性能：可量化对照", "用 Lighthouse 出分数，禁止只说「感觉快了」。"),
    r("MDN 关键渲染路径（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/Performance/Guides/Critical_rendering_path", "性能：渲染路径", "用 CRP 词汇解释你改动了哪一段。"),
  ],
  "fe-test": [
    r("Playwright：编写测试", "官方文档", "https://playwright.dev/docs/writing-tests", "E2E：主路径", "只覆盖登录后的一条关键旅程，含失败断言。"),
    r("Testing Library 查询", "官方文档", "https://testing-library.com/docs/queries/about/", "组件测试：用户可见行为", "按角色/文本查询，不测实现细节。"),
    r("Vitest 特性", "官方文档", "https://vitest.dev/guide/", "单测：核心断言", "给状态函数写 3 个断言即可，先绿再谈覆盖率。"),
  ],
  "fs-fe": [
    r("React：管理 state", "官方文档", "https://react.dev/learn/managing-state", "全栈前端：主路径状态", "完成登录后核心动作、空态、错误态，而不是只做首页。"),
    r("Next.js：布局与页面", "官方文档", "https://nextjs.org/docs/app/getting-started/layouts-and-pages", "全栈前端：App Router", "用 App Router 搭 2 个页面和共享布局。"),
    r("Vue 表单绑定", "官方文档", "https://cn.vuejs.org/guide/essentials/forms", "全栈前端：Vue 表单", "Vue 岗按此页完成主表单，不要同时开三套框架。"),
  ],
  "fs-be": [
    r("FastAPI 安全第一步", "官方文档", "https://fastapi.tiangolo.com/tutorial/security/first-steps/", "全栈后端：鉴权入口", "自己实现登录依赖，不要完全依赖第三方后台。"),
    r("Spring Boot Web（Servlet）", "官方文档", "https://docs.spring.io/spring-boot/reference/web/servlet.html", "全栈后端：Java API", "交付可调用 CRUD + 校验。"),
    r("Next.js 鉴权指南", "官方文档", "https://nextjs.org/docs/app/guides/authentication", "全栈后端：Node 会话", "讲清 Session/Cookie 边界，而不是只贴 JWT 口号。"),
  ],
  "fs-db": [
    r("PostgreSQL 教程：窗口与查询", "官方文档", "https://www.postgresql.org/docs/current/tutorial-window.html", "数据库：查询与聚合", "为主实体写 3 条带约束的查询。"),
    r("MySQL 索引优化", "官方文档", "https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html", "数据库：索引", "JD 写 MySQL 时，给主查询加上可解释的索引。"),
    r("PostgreSQL：使用 EXPLAIN", "官方文档", "https://www.postgresql.org/docs/current/using-explain.html", "数据库：EXPLAIN", "对最慢的一条查询给出 ANALYZE 前后。"),
  ],
  "fs-auth": [
    r("OWASP 会话管理备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html", "JWT/Session 鉴权", "按清单自检 cookie 标志、过期与注销，不要自己发明会话。"),
    r("OWASP 认证备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", "JWT/Session 鉴权", "对照密码存储、锁定与多因素条目，写一页权限矩阵。"),
    r("Spring Security 会话管理", "官方文档", "https://docs.spring.io/spring-security/reference/servlet/authentication/session-management.html", "框架侧会话", "Java 栈按此章配置会话；Python 栈改用 FastAPI Security 第一步。"),
  ],
  "fs-deploy": [
    r("Docker 多阶段构建", "官方文档", "https://docs.docker.com/build/building/multi-stage/", "部署：镜像", "先容器化，再谈平台托管。"),
    r("Compose 入门", "官方文档", "https://docs.docker.com/compose/gettingstarted/", "部署：本地复现", "演示环境一条命令可起。"),
    r("Next.js 鉴权/部署相关指南", "官方文档", "https://nextjs.org/docs/app/guides/authentication", "部署：登录态在托管环境", "发布一个可访问地址，并写清环境变量。"),
  ],
  "fs-ts": [
    r("TypeScript：类型收窄", "官方文档", "https://www.typescriptlang.org/docs/handbook/2/narrowing.html", "全栈 TS：收窄", "给 API 响应加联合类型，禁止 any。"),
    r("TypeScript：泛型", "官方文档", "https://www.typescriptlang.org/docs/handbook/2/generics.html", "全栈 TS：共享类型", "前后端或客户端共享一处类型定义。"),
  ],
  "de-sql": [
    r("PostgreSQL 窗口函数教程", "官方文档", "https://www.postgresql.org/docs/current/tutorial-window.html", "进阶 SQL：窗口", "用窗口函数完成一次去重/累计，不要只会 GROUP BY。"),
    r("Spark SQL 性能调优", "官方文档", "https://spark.apache.org/docs/latest/sql-performance-tuning.html", "进阶 SQL：引擎侧", "JD 写 Spark 时，按官方调优项改一条作业并写清分区。"),
    r("Hive LanguageManual", "官方文档", "https://cwiki.apache.org/confluence/display/Hive/LanguageManual", "进阶 SQL：Hive", "国内数仓 JD 常用此手册对照语法，完成一次汇总。"),
  ],
  "de-model": [
    r("dbt：构建模型", "官方文档", "https://docs.getdbt.com/docs/build/models", "数仓建模：分层落地", "把 staging/mart 做成可重跑模型，而不是只画图。"),
    r("dbt Kimball 维度建模", "官方文档", "https://docs.getdbt.com/blog/kimball-dimensional-model", "数仓建模：事实/维度", "按官方指南拆一张事实表 + 两张维度，写一口径。"),
    r("dbt sources", "官方文档", "https://docs.getdbt.com/docs/build/sources", "数仓建模：源表声明", "声明源表与新鲜度，避免「口头知道表在哪」。"),
  ],
  "de-engine": [
    r("Spark SQL Getting Started", "官方文档", "https://spark.apache.org/docs/latest/sql-getting-started.html", "计算引擎：批作业", "完成一个可重跑清洗/汇总，写清分区列。"),
    r("Spark SQL 性能调优", "官方文档", "https://spark.apache.org/docs/latest/sql-performance-tuning.html", "计算引擎：调优", "改一次 shuffle/分区设置，记录耗时变化（小样本即可）。"),
    r("Flink DataStream 概览", "官方文档", "https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/overview/", "计算引擎：流", "JD 写实时时，用官方 DataStream 跑通一条。"),
  ],
  "de-py": [
    r("Python 控制流（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "数据作业入口", "作业参数、日志与失败退出码用标准库先写对。"),
    r("NumPy 绝对入门", "官方文档", "https://numpy.org/doc/stable/user/absolute_beginners.html", "数组运算", "小数据探查用向量化，不要全程 Python 循环。"),
  ],
  "de-orch": [
    r("Airflow DAG 概念", "官方文档", "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html", "调度：依赖与重试", "编排一个有依赖、重试和补数说明的 DAG。"),
    r("Airflow 官方教程", "官方文档", "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html", "调度：最小 DAG", "按教程跑通后再换成你的作业。"),
    r("Spark 提交作业", "官方文档", "https://spark.apache.org/docs/latest/submitting-applications.html", "调度：真正跑起来", "调度里提交的是作业，先能本地/单机提交。"),
  ],
  "de-dq": [
    r("dbt 数据测试", "官方文档", "https://docs.getdbt.com/docs/build/data-tests", "数据质量：规则", "为关键表写 3 条唯一性/非空测试。"),
    r("Great Expectations 文档", "官方文档", "https://docs.greatexpectations.io/", "数据质量：期望", "用公开 DQ 工具加一条期望；不是唯一选择。"),
    r("Airflow DAG 失败重跑", "官方文档", "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html", "数据质量：失败后怎么补", "质量告警后如何重跑，要能演示。"),
  ],
  "de-kafka": [
    r("Kafka 生产者概念", "官方文档", "https://kafka.apache.org/documentation/#intro_producers", "日志接入：投递", "画清从日志到表的一条链路，标明延迟。"),
    r("Kafka Quickstart", "官方文档", "https://kafka.apache.org/quickstart", "日志接入：本机验证", "先本机生产/消费，再谈 Flink CDC。"),
    r("Flink DataStream 概览", "官方文档", "https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/overview/", "日志接入：实时作业", "实时接入作业的官方入口。"),
  ],
  "ml-py": [
    r("NumPy 绝对入门", "官方文档", "https://numpy.org/doc/stable/user/absolute_beginners.html", "科学计算：数组", "特征计算用向量化，训练脚本可重复。"),
    r("Python 控制流（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "训练脚本：模块化", "训练/评测必须是脚本，不要只会点 Notebook。"),
    r("Pandas 入门", "官方文档", "https://pandas.pydata.org/docs/getting_started/index.html", "表格特征", "拆分与泄漏检查在脚本里完成。"),
  ],
  "ml-basic": [
    r("sklearn 交叉验证", "官方文档", "https://scikit-learn.org/stable/modules/cross_validation.html", "ML 基础：验证", "先做带交叉验证的传统基线，再上深度学习。"),
    r("sklearn 常见陷阱", "官方文档", "https://scikit-learn.org/stable/common_pitfalls.html", "ML 基础：泄漏", "按官方陷阱页自检数据泄漏，写出基线指标。"),
    r("sklearn 监督学习总览", "官方文档", "https://scikit-learn.org/stable/supervised_learning.html", "ML 基础：模型选择", "用官方流水线跑通一个分类/回归。"),
  ],
  "ml-dl": [
    r("PyTorch：优化循环", "官方文档", "https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html", "深度学习：训练循环", "独立完成 train/val 循环，固定随机种子。"),
    r("PyTorch Tutorials 入口", "官方文档", "https://docs.pytorch.org/tutorials/", "深度学习：可复现脚本", "把 Notebook 收成脚本，写清如何复现。"),
    r("HF Evaluate 快速游览", "官方文档", "https://huggingface.co/docs/evaluate/a_quick_tour", "深度学习：指标", "评测集必须你自己固定，课程进度条不算作品。"),
  ],
  "ml-math": [
    r("ISL 教材主页（免费 PDF）", "书籍/手册", "https://www.statlearning.com/", "统计学习：监督与正则", "只读与你项目相关的章节，能讲清损失。"),
    r("CS229 课程页", "公开课", "https://cs229.stanford.edu/", "优化与损失", "补你真正用过的优化器，不要空背全书。"),
    r("sklearn 监督学习总览", "官方文档", "https://scikit-learn.org/stable/supervised_learning.html", "用实现反推公式", "对照实现讲清正则项，比只看讲义更接近面试。"),
  ],
  "ml-algo": [
    r("OI Wiki", "公开课", "https://oi-wiki.org/", "编程面试：数据结构", "按数组/树/图补题，记录自己的题解。"),
    r("LeetCode", "平台练习", "https://leetcode.cn/", "编程面试：刷题", "只作为面试练习，不是算法岗作品集。"),
    r("freeCodeCamp JS 算法", "公开课", "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "入门刷题", "基础很薄时用此练习，再转到分类题库。"),
  ],
  "ml-mlops": [
    r("MLflow 快速入门", "官方文档", "https://mlflow.org/docs/latest/getting-started/intro-quickstart/index.html", "实验管理", "固定实验记录与模型版本，避免只有准确率截图。"),
    r("HF Evaluate：选择指标", "官方文档", "https://huggingface.co/docs/evaluate/choosing_a_metric", "评测指标", "为任务选对指标，并写清业务「正确」如何判定。"),
    r("PyTorch 优化循环", "官方文档", "https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html", "推理脚本", "把模型封成可调用脚本，固定种子。"),
  ],
  "llm-py": [
    r("FastAPI 依赖注入", "官方文档", "https://fastapi.tiangolo.com/tutorial/dependencies/", "LLM 服务化", "把模型调用做成带超时和依赖的服务，而不是 Notebook。"),
    r("FastAPI 安全第一步", "官方文档", "https://fastapi.tiangolo.com/tutorial/security/first-steps/", "服务鉴权", "演示接口至少有一种鉴权/限流入口。"),
    r("Python 控制流（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "异常与模块", "服务才能稳定失败，而不是堆栈裸奔。"),
  ],
  "llm-api": [
    r("OpenAI 函数调用 / 工具", "官方文档", "https://platform.openai.com/docs/guides/function-calling", "模型 API：工具与参数", "按你实际厂商文档记录模型名、参数和日期；本页是常见英文示例。"),
    r("OpenAI 文本生成指南", "官方文档", "https://platform.openai.com/docs/guides/text-generation", "模型 API：上下文", "做提示词版本表，同一评测集对比，不要只靠感觉。"),
    r("阿里云百炼文档", "官方文档", "https://help.aliyun.com/zh/model-studio/", "国内模型 API", "通义等国内 API 入口；写清模型与日期。"),
  ],
  "llm-rag": [
    r("LangChain RAG 教程", "官方文档", "https://docs.langchain.com/oss/python/langchain/rag", "RAG：切片与引用", "按官方教程做出切片与出处；失败问答至少记录 5 条。"),
    r("LlamaIndex：理解 RAG", "官方文档", "https://developers.llamaindex.ai/python/framework/understanding/rag/", "RAG：检索-生成", "讲清检索与拼接边界，可与 LangChain 二选一深入。"),
    r("LlamaIndex 评测", "官方文档", "https://developers.llamaindex.ai/python/framework/optimizing/evaluation/evaluation/", "RAG：检索是否有用", "对检索命中做一次小样本对照，不要只 Demo 一次问答。"),
  ],
  "llm-eval": [
    r("LangSmith：评测 LLM 应用", "官方文档", "https://docs.langchain.com/langsmith/evaluate-llm-application", "RAG/应用评测", "固定数据集，对比改动前后；小样本也要标明规模。"),
    r("LangSmith Evaluation 总览", "官方文档", "https://docs.langchain.com/langsmith/evaluation", "评测：数据集与实验", "把一次提示词改动做成可回归记录。"),
    r("HF Evaluate：如何选指标", "官方文档", "https://huggingface.co/docs/evaluate/choosing_a_metric", "评测：具体指标", "为正确性/相似度选一个公开指标，业务对错仍用你的黄金集判定。"),
  ],
  "llm-fw": [
    r("LangChain RAG 教程", "官方文档", "https://docs.langchain.com/oss/python/langchain/rag", "编排：检索链", "能讲清检索与工具调用即可，不要堆组件。"),
    r("LangGraph 低层概念", "官方文档", "https://langchain-ai.github.io/langgraph/concepts/low_level/", "编排：图与状态", "需要状态循环时再学；先有轨迹日志。"),
    r("LlamaIndex：理解 RAG", "官方文档", "https://developers.llamaindex.ai/python/framework/understanding/rag/", "编排：查询引擎", "团队用 LlamaIndex 时以官方查询页为准。"),
  ],
  "llm-prod": [
    r("FastAPI 依赖注入", "官方文档", "https://fastapi.tiangolo.com/tutorial/dependencies/", "限流与依赖", "按官方模式加超时/依赖，再谈模型。"),
    r("OWASP 认证备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", "护栏：身份", "提示注入与数据泄露按 Web 安全共同语言写护栏。"),
    r("Docker 多阶段构建", "官方文档", "https://docs.docker.com/build/building/multi-stage/", "可部署单元", "把服务与依赖变成可部署镜像。"),
  ],
  "ag-eng": [
    r("FastAPI 依赖注入", "官方文档", "https://fastapi.tiangolo.com/tutorial/dependencies/", "Agent 之前的服务", "先能独立交付一个带超时的服务。"),
    r("Python 控制流（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "异常与停止", "循环能停下来的前提是异常处理写对。"),
    r("Docker Compose 入门", "官方文档", "https://docs.docker.com/compose/gettingstarted/", "演示可复现", "他人能按 README 起环境。"),
  ],
  "ag-tool": [
    r("OpenAI 函数调用指南", "官方文档", "https://platform.openai.com/docs/guides/function-calling", "工具调用：JSON Schema", "设计 3–5 个工具，处理失败与拒答；按实际厂商文档对照。"),
    r("LangGraph 低层概念", "官方文档", "https://langchain-ai.github.io/langgraph/concepts/low_level/", "工具调用：落在状态机", "每次调用要有输入/输出日志，不是无限聊天。"),
    r("LangChain RAG/工具相关教程", "官方文档", "https://docs.langchain.com/oss/python/langchain/rag", "工具与检索边界", "重点是校验与权限，不是调库。"),
  ],
  "ag-state": [
    r("LangGraph Persistence", "官方文档", "https://langchain-ai.github.io/langgraph/how-tos/persistence/", "状态与可回放", "实现步数限制与可回放轨迹。"),
    r("LangGraph 低层概念", "官方文档", "https://langchain-ai.github.io/langgraph/concepts/low_level/", "循环控制", "写清停止条件，避免无限循环冒充 Agent。"),
    r("HF Agents 课程 Unit 0", "公开课", "https://huggingface.co/learn/agents-course/unit0/introduction", "工具与循环概念", "课程只补概念；作品必须有你的任务集。"),
  ],
  "ag-eval": [
    r("LangSmith：评测 LLM 应用", "官方文档", "https://docs.langchain.com/langsmith/evaluate-llm-application", "任务评测", "固化 15–30 个任务：成功 / 应拒绝 / 应澄清。"),
    r("LangSmith Evaluation", "官方文档", "https://docs.langchain.com/langsmith/evaluation", "回归集", "每次改工具后跑同一批任务。"),
    r("HF Evaluate：选择指标", "官方文档", "https://huggingface.co/docs/evaluate/choosing_a_metric", "能量化的部分", "任务成败仍按你的脚本判定。"),
  ],
  "ag-obs": [
    r("OpenTelemetry Traces", "官方文档", "https://opentelemetry.io/docs/concepts/signals/traces/", "每步可追溯", "工具调用写成 span 或结构化日志。"),
    r("LangSmith Evaluation", "官方文档", "https://docs.langchain.com/langsmith/evaluation", "追踪字段", "没有商业账号时，用本地日志实现同样字段。"),
    r("OWASP 认证备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", "工具权限", "写清工具能碰什么数据。"),
  ],
  "ag-rag": [
    r("LangChain RAG 教程", "官方文档", "https://docs.langchain.com/oss/python/langchain/rag", "Agent 先检索再行动", "轨迹里要能看到检索步骤。"),
    r("LlamaIndex：理解 RAG", "官方文档", "https://developers.llamaindex.ai/python/framework/understanding/rag/", "知识库查询", "查询引擎的官方说明。"),
    r("LlamaIndex 评测", "官方文档", "https://developers.llamaindex.ai/python/framework/optimizing/evaluation/evaluation/", "检索是否帮上忙", "评测仍用你的黄金集。"),
  ],
  "do-linux": [
    r("Debian Reference · 操作", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/ch04.en.html", "Linux：进程与网络排障", "写一份自己的排障笔记。"),
    r("Learning the shell", "书籍/手册", "https://linuxcommand.org/lc3_learning_the_shell.php", "命令行", "重定向、管道、权限练熟。"),
    r("MDN HTTP 状态码（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status", "反向代理与状态码", "必须能讲清 502/504 从哪来。"),
  ],
  "do-script": [
    r("Bash 参数展开", "官方文档", "https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html", "幂等脚本", "把一项重复操作写成带参数校验的脚本。"),
    r("Python 控制流（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "复杂自动化", "复杂逻辑用 Python，带失败码。"),
    r("Debian Reference · 操作", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/ch04.en.html", "脚本是否安全", "对照权限与用户检查脚本。"),
  ],
  "do-docker": [
    r("Docker 多阶段构建", "官方文档", "https://docs.docker.com/build/building/multi-stage/", "镜像：非 root / 体积", "多阶段、非 root、健康检查。"),
    r("Compose 入门", "官方文档", "https://docs.docker.com/compose/gettingstarted/", "本地依赖一次拉起", "不要只抄网上 Dockerfile。"),
    r("运行容器化应用", "官方文档", "https://docs.docker.com/get-started/tutorials/run-an-app/", "最小可运行", "先本地会构建。"),
  ],
  "do-ci": [
    r("GitHub Actions Quickstart", "官方文档", "https://docs.github.com/en/actions/get-started/quickstart", "CI：最小流水线", "按你实际产品选择；本页是常见免费选项。"),
    r("GitLab CI 快速开始", "官方文档", "https://docs.gitlab.com/ci/quick_start/", "CI：GitLab yaml", "团队用 GitLab 时以官方 quick start 写门禁。"),
    r("Docker 多阶段构建", "官方文档", "https://docs.docker.com/build/building/multi-stage/", "流水线里构建镜像", "先本地构建再进 CI。"),
  ],
  "do-k8s": [
    r("Kubernetes Basics 教程", "官方文档", "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "K8s：无状态部署", "部署一个无状态服务。"),
    r("配置 Probe", "官方文档", "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/", "K8s：探针与发布", "理解 liveness/readiness，演练一次滚动。"),
    r("K8s 基础教程（中文）", "官方文档", "https://kubernetes.io/zh-cn/docs/tutorials/kubernetes-basics/", "K8s：中文对照", "概念以官网为准，中文走完基础教程。"),
  ],
  "do-obs": [
    r("Prometheus 埋点实践", "官方文档", "https://prometheus.io/docs/practices/instrumentation/", "监控：黄金指标", "定义 QPS/延迟/错误率。"),
    r("Grafana Alerting", "官方文档", "https://grafana.com/docs/grafana/latest/alerting/", "监控：可行动告警", "仪表盘必须对应一条告警。"),
    r("SRE Book：SLO", "书籍/手册", "https://sre.google/sre-book/service-level-objectives/", "SLO 词汇", "错误预算的通行说法，不是某家雇主承诺。"),
  ],
  "do-iac": [
    r("Terraform AWS 入门教程", "官方文档", "https://developer.hashicorp.com/terraform/tutorials/aws-get-started", "IaC：可销毁重建", "管一小块环境，能销毁再建。云厂商按你实际替换。"),
    r("Terraform 文档", "官方文档", "https://developer.hashicorp.com/terraform/docs", "IaC：状态与模块", "状态文件怎么管，以官方为准。"),
    r("K8s Probe 配置", "官方文档", "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/", "IaC 落到可运行负载", "声明最终仍要变成活着的 Pod。"),
  ],
  "qa-theory": [
    r("Playwright：编写测试", "官方文档", "https://playwright.dev/docs/writing-tests", "测试设计落地", "把 P0 路径落成可跑脚本，避免只交 Excel。"),
    r("MDN 表单学习路径（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Extensions/Forms", "被测对象", "先能说清 Web 表单行为，再写等价类。"),
    r("ISTQB 官网", "书籍/手册", "https://www.istqb.org/", "测试术语", "不必考证；用大纲里的等价类/边界写用例。"),
  ],
  "qa-lang": [
    r("pytest fixtures", "官方文档", "https://docs.pytest.org/en/stable/how-to/fixtures.html", "测试开发语言", "用夹具处理数据与断言。"),
    r("Python 控制流（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "脚本底线", "测试开发的语言底线。"),
    r("MDN Promises（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises", "前端测试岗 JS", "用 JS/TS 写异步脚本。"),
  ],
  "qa-api": [
    r("Playwright API 测试", "官方文档", "https://playwright.dev/docs/api-testing", "接口自动化", "保持数据隔离，断言状态码与关键字段。"),
    r("pytest fixtures", "官方文档", "https://docs.pytest.org/en/stable/how-to/fixtures.html", "接口夹具", "准备/清理测试数据。"),
    r("MDN HTTP 状态码（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status", "状态码必须能讲清", "不要只会点绿色。"),
  ],
  "qa-auto": [
    r("Playwright：编写测试", "官方文档", "https://playwright.dev/docs/writing-tests", "UI/E2E 主路径", "只覆盖主路径，并写维护说明。"),
    r("Testing Library 查询", "官方文档", "https://testing-library.com/docs/queries/about/", "组件层", "按用户可见行为写。"),
    r("Cypress 文档", "官方文档", "https://docs.cypress.io/", "团队若用 Cypress", "以官方为准，不要两套都浅尝。"),
  ],
  "qa-ci": [
    r("GitHub Actions Quickstart", "官方文档", "https://docs.github.com/en/actions/get-started/quickstart", "门禁", "失败能定位到提交。"),
    r("GitLab CI 快速开始", "官方文档", "https://docs.gitlab.com/ci/quick_start/", "GitLab 门禁", "用官方 yaml 写红绿。"),
    r("pytest fixtures", "官方文档", "https://docs.pytest.org/en/stable/how-to/fixtures.html", "先本地绿", "本地不稳定不要进流水线。"),
  ],
  "qa-perf": [
    r("JMeter：构建 Web 测试计划", "官方文档", "https://jmeter.apache.org/usermanual/build-web-test-plan.html", "小规模压测", "写清指标与瓶颈，禁止空报「高并发」。"),
    r("JMeter 入门", "官方文档", "https://jmeter.apache.org/usermanual/get-started.html", "压测术语", "对照官方术语写方案。"),
    r("web.dev LCP", "官方文档", "https://web.dev/articles/lcp", "前端性能专项", "可与 Lighthouse 一起做。"),
  ],
  "pm-req": [
    r("GOV.UK：写用户故事", "书籍/手册", "https://www.gov.uk/service-manual/agile-delivery/writing-user-stories", "需求：验收与非目标", "按此结构写 1 份可估时 PRD。"),
    r("NN/g 用户需求陈述", "书籍/手册", "https://www.nngroup.com/articles/user-need-statements/", "需求：不是功能清单", "把清单改写成用户需求。"),
    r("MDN 表单路径（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Extensions/Forms", "技术对象", "PM 要能读懂页面/表单基本对象。"),
  ],
  "pm-tech": [
    r("MDN HTTP 状态码（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status", "能和研发讨论接口", "缓存与错误码不是甩锅。"),
    r("Martin Fowler：Microservices", "书籍/手册", "https://martinfowler.com/articles/microservices.html", "架构取舍", "用来画一页系统理解图。"),
    r("Next.js 布局与页面", "官方文档", "https://nextjs.org/docs/app/getting-started/layouts-and-pages", "读懂一份真实约束", "Web 产品用此页练「能读文档」。"),
  ],
  "pm-data": [
    r("PostgreSQL 窗口函数", "官方文档", "https://www.postgresql.org/docs/current/tutorial-window.html", "自己拉基线", "会写基础/窗口 SQL，不依赖「要个数」。"),
    r("Mode/ThoughtSpot SQL 窗口教程", "公开课", "https://mode.com/sql-tutorial/sql-window-functions/", "SQL 入门练习", "官方 Postgres 页为主；此课作练习（可能跳转到合作站点）。"),
    r("NN/g 用户需求陈述", "书籍/手册", "https://www.nngroup.com/articles/user-need-statements/", "先写可观察的成功", "再谈漏斗。"),
  ],
  "pm-proj": [
    r("GOV.UK Agile 交付", "书籍/手册", "https://www.gov.uk/service-manual/agile-delivery", "排期减法", "公开部门交付手册，用来练砍范围。"),
    r("Atlassian Agile 指南", "书籍/手册", "https://www.atlassian.com/agile", "迭代与风险", "写一份风险表。"),
    r("GitHub Issues 文档", "官方文档", "https://docs.github.com/en/issues", "公开工具练路线图", "不必买 Jira。"),
  ],
  "pm-ux": [
    r("NN/g 用户需求陈述", "书籍/手册", "https://www.nngroup.com/articles/user-need-statements/", "先写任务再画界面", "主路径 + 异常态。"),
    r("MDN 无障碍（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Accessibility", "验收含无障碍", "至少包含键盘或对比度一项。"),
    r("Figma 帮助中心", "官方文档", "https://help.figma.com/hc/en-us", "原型", "平台 PM 也可用纯流程图。"),
  ],
  "pm-industry": [
    r("GOV.UK Service Manual", "书籍/手册", "https://www.gov.uk/service-manual", "领域对象与约束", "没有全球统一行业课；用公开手册练写法。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "账号/金融约束类型", "至少能说出安全约束类型。"),
    r("MDN HTTP 状态码（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status", "产品技术对象", "先读懂请求/错误，再补行业名词。"),
  ],
  "mo-native": [
    r("Android Activity 生命周期", "官方文档", "https://developer.android.com/guide/components/activities/activity-lifecycle", "原生：页面生命周期", "完成列表、详情前先搞清生命周期。"),
    r("Flutter 导航 Cookbook", "官方文档", "https://docs.flutter.dev/cookbook/navigation/navigation-basics", "跨端：导航", "可安装 Demo 能进出详情。"),
    r("Android 文档入口（按主题）", "官方文档", "https://developer.android.com/docs", "原生文档检索", "没有单一「官方入门课」时，从主题页进生命周期/网络。"),
  ],
  "mo-life": [
    r("Android Activity 生命周期", "官方文档", "https://developer.android.com/guide/components/activities/activity-lifecycle", "后台杀死与恢复", "写出复现步骤。"),
    r("保存 UI 状态", "官方文档", "https://developer.android.com/topic/libraries/architecture/saving-states", "状态恢复", "旋转/被杀后数据还在。"),
    r("Flutter 状态管理入门", "官方文档", "https://docs.flutter.dev/data-and-backend/state-mgmt/intro", "跨端恢复", "不要只做热重载 Demo。"),
  ],
  "mo-net": [
    r("Android 网络操作", "官方文档", "https://developer.android.com/develop/connectivity/network-ops", "弱网与重试", "按官方指南做缓存与重试。"),
    r("Flutter 拉取数据", "官方文档", "https://docs.flutter.dev/cookbook/networking/fetch-data", "跨端网络层", "最小网络层 + 错误态。"),
    r("MDN HTTP 状态码（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status", "客户端错误码", "仍是 HTTP 语义。"),
  ],
  "mo-quality": [
    r("Android 性能", "官方文档", "https://developer.android.com/topic/performance", "启动/卡顿对照", "一次前后对比，写清环境。"),
    r("Android Vitals", "官方文档", "https://developer.android.com/topic/performance/vitals", "崩溃率指标", "通行指标的官方说明。"),
    r("Flutter 性能", "官方文档", "https://docs.flutter.dev/perf", "跨端性能", "不要只看帧率口号。"),
  ],
  "mo-ci": [
    r("Android 构建文档", "官方文档", "https://developer.android.com/build", "签名与变体", "先在官方文档跑通构建变体。"),
    r("GitHub Actions Quickstart", "官方文档", "https://docs.github.com/en/actions/get-started/quickstart", "构建进 CI", "写发版清单。"),
    r("Fastlane 文档", "官方文档", "https://docs.fastlane.tools/", "商店发版自动化", "常用开源工具文档。"),
  ],
  "sec-web": [
    r("PortSwigger：SQL 注入实验室", "平台练习", "https://portswigger.net/web-security/sql-injection", "Web 安全：注入", "只在合法靶场复现，写修复建议。禁止扫未授权系统。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "Web 漏洞共同语言", "对照 A 类问题写修复，而不是只交扫描器截图。"),
    r("OWASP 认证备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", "会话与认证缺陷", "认证类问题按此清单验证。"),
  ],
  "sec-lang": [
    r("OWASP 安全编码速查", "官方文档", "https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/", "读代码标信任边界", "读开源项目时按此标注。"),
    r("Python 控制流（中文）", "官方文档", "https://docs.python.org/zh-cn/3/tutorial/controlflow.html", "先能读业务代码", "安全分析的底盘。"),
    r("MDN HTTP 状态码（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status", "Web 对象查官方", "避免只靠扫描器。"),
  ],
  "sec-linux": [
    r("Debian Reference · 操作", "官方文档", "https://www.debian.org/doc/manuals/debian-reference/ch04.en.html", "日志与权限", "安全分析的底盘。"),
    r("Learning the shell", "书籍/手册", "https://linuxcommand.org/lc3_learning_the_shell.php", "抓包/日志前的命令", "先会基本命令。"),
    r("MDN HTTP 缓存（中文）", "官方文档", "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Caching", "从请求链看边界", "缓存与 Cookie 边界。"),
  ],
  "sec-sdl": [
    r("Microsoft SDL", "官方文档", "https://www.microsoft.com/en-us/securityengineering/sdl", "威胁建模与闭环", "写迷你工单模板。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "评级与再验证", "对照此类问题写修复验证。"),
    r("OWASP 测试指南项目", "官方文档", "https://owasp.org/www-project-web-security-testing-guide/", "再验证步骤", "按公开大纲写，不编造内部流程。"),
  ],
  "sec-tool": [
    r("PortSwigger：SQL 注入", "平台练习", "https://portswigger.net/web-security/sql-injection", "合法练习", "不要把未授权扫描当作品。"),
    r("Burp 文档", "官方文档", "https://portswigger.net/burp/documentation", "工具是手段", "写清误报如何处理；只在授权环境使用。"),
    r("OWASP Top 10", "官方文档", "https://owasp.org/www-project-top-ten/", "输出映射到问题类型", "工具输出必须对应修复。"),
  ],
  "sec-cloud": [
    r("OWASP Kubernetes 安全备忘单", "官方文档", "https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html", "身份、密钥、RBAC", "没有单一 Cloud Security 官网页；用此备忘单。"),
    r("K8s Probe 配置", "官方文档", "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/", "工作负载健康", "容器安全认知落到具体配置。"),
    r("Docker 多阶段构建", "官方文档", "https://docs.docker.com/build/building/multi-stage/", "镜像与非 root", "官方基线。"),
  ],
};

export const ROLE_RESOURCES: Record<string, ResourceRef[]> = {
  backend: SKILL_RESOURCES["be-sql"],
  frontend: SKILL_RESOURCES["fe-fw"],
  fullstack: SKILL_RESOURCES["fs-auth"],
  "data-eng": SKILL_RESOURCES["de-sql"],
  ml: SKILL_RESOURCES["ml-basic"],
  "llm-app": SKILL_RESOURCES["llm-eval"],
  agent: SKILL_RESOURCES["ag-eval"],
  devops: SKILL_RESOURCES["do-k8s"],
  qa: SKILL_RESOURCES["qa-api"],
  "tech-pm": SKILL_RESOURCES["pm-req"],
  mobile: SKILL_RESOURCES["mo-life"],
  security: SKILL_RESOURCES["sec-web"],
};

export const ALIGN_RESOURCES: ResourceRef[] = [
  r(
    "GitHub：关于 README",
    "官方文档",
    "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
    "简历/仓库表达",
    "按官方 README 要素写成他人能复现的仓库说明。",
  ),
  r(
    "BOSS 直聘（真实 JD）",
    "平台练习",
    "https://www.zhipin.com/",
    "JD 词频对照",
    "打开 8–10 份在招 JD，统计技能词；不要编造公司案例。",
  ),
];

export const SEARCH_RESOURCES: ResourceRef[] = [
  r("BOSS 直聘", "平台练习", "https://www.zhipin.com/", "求职验证：国内样本", "按匹配度分层投递，记录未进面的共同词。"),
  r("猎聘", "平台练习", "https://www.liepin.com/", "求职验证：社招样本", "失败反馈回到作品补一条证据。"),
  r(
    "GitHub README",
    "官方文档",
    "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
    "面试前仓库可打开",
    "投递前再检查他人能否按 README 启动。",
  ),
];

const KEYWORD_SKILLS: [RegExp, string][] = [
  [/explain|索引|index|慢查询|sql 优化/i, "be-sql"],
  [/jwt|session|鉴权|会话|认证/i, "fs-auth"],
  [/rag.?评测|应用评测|黄金集|evaluate|评测/i, "llm-eval"],
  [/rag|检索增强|切片|引用/i, "llm-rag"],
  [/react|表单|状态管理|hooks/i, "fe-fw"],
  [/缓存|redis|过期/i, "be-redis"],
];

export function getSkillResources(skillId?: string): ResourceRef[] {
  if (!skillId) return [];
  return (SKILL_RESOURCES[skillId] ?? []).slice(0, 3);
}

export function resourcesForGap(gapTitle: string, skillId?: string): ResourceRef[] {
  const byId = getSkillResources(skillId);
  if (byId.length >= 2) {
    return byId.map((item) => ({ ...item, closesGap: item.closesGap || gapTitle }));
  }
  for (const [pattern, id] of KEYWORD_SKILLS) {
    if (pattern.test(gapTitle)) {
      return getSkillResources(id).map((item) => ({ ...item, closesGap: item.closesGap || gapTitle }));
    }
  }
  return byId.map((item) => ({ ...item, closesGap: item.closesGap || gapTitle }));
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
