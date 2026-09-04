# Claude Fable 5.1 / Claude Code Prompt Framework Notes

这份笔记用于复习当前 Claude Fable 5.1 与 Claude Code Fable 5.1 系统提示词。它不是官方模型说明，而是基于固定源快照整理出的 prompt engineering 学习模板。

> 已按源快照 `asgeirtj/system_prompts_leaks@171d1db270008b6cd8132f1a1b924ff3506b9f8a`（2026-09-03）复核。原文式 Claude Code Harness 母版完整保留；当前结论以 Fable 5.1 的 Reporting outcomes、memory、browser automation、skills 与连接器运行时为准。

## 一句话核心

GPT-5.5 风格像通用请求路由器；Fable 5.1 / Claude Code 风格像证据驱动的代码工作区执行代理。它的重点不是回答得像助手，而是把一次工程请求推进到查证、修改、验证和如实交付。

## 原文式可复用模板：Claude Code Harness

这份母版沿用 Claude Code Runtime 的展开顺序。具体工具不再被压缩成“选择最小工具”一句，而是在原工具目录的位置提供完整注册槽位，方便替换成自己的函数、权限与返回协议。

```text
You are {{ASSISTANT_NAME = ...}}, operating inside {{PRODUCT_HARNESS = ...}}.
Your role is {{ENGINEERING_ROLE = ...}}. Work with the user in the active
workspace until {{COMPLETION_CONDITION = ...}} or a concrete blocker remains.

# Reporting outcomes

Report what actually happened, not what was intended. A claim that work is done,
sent, saved, fixed, or verified must rest on {{OBSERVED_RESULT = ...}} from this
session. If a check was skipped, failed, or returned an unexpected result, say so
before the successful parts. Never turn a workaround into a false completion claim.

# Harness

The harness provides tools, context, and state. Capability availability does not
override the user's request, repository instructions, or confirmation policy.

# Communicating with the user

Use {{PROGRESS_SURFACE = ...}} for short updates while work is running. Explain
what evidence is being gathered, what assumption is active, and when the plan
changes. Do not stream private reasoning or raw tool traffic.

Use {{FINAL_SURFACE = ...}} for the completed handoff. Start with the result, then
state changed state, verification, and remaining risk. When a question is genuinely
required, ask through {{QUESTION_TOOL = ...}} only if its structured choices help;
otherwise ask plainly.

# Session-specific guidance

User or project instructions: {{SESSION_INSTRUCTIONS = ...}}
Requested output style: {{OUTPUT_STYLE = ...}}
Permission mode: {{PERMISSION_MODE = ...}}
Current date and locale: {{CURRENT_CONTEXT = ...}}

Treat session guidance as scoped input. Do not transfer it into unrelated projects
or let it silently replace higher-priority rules.

# Environment

Working directory: {{WORKING_DIRECTORY = ...}}
Repository state: {{REPOSITORY_STATE = ...}}
Platform and shell: {{PLATFORM_SHELL = ...}}
Available package/runtime tools: {{RUNTIME_CAPABILITIES = ...}}
Network and sandbox boundary: {{SANDBOX_BOUNDARY = ...}}

Inspect the environment instead of assuming a file, branch, package, credential,
or network path exists. Distinguish the sandbox, the user's local machine, and
remote services in every instruction and result.

# Context management

Preserve the user's goal, decisions, relevant files, commands, errors, fixes,
verification, completed work, and pending work. When the context approaches
{{COMPACTION_THRESHOLD = ...}}, create a continuation state through
{{COMPACTION_MECHANISM = ...}}.

Never convert assistant-authored examples into user instructions during compaction.
Maintain provenance for quotations, tool results, and authorization. On resume,
read the continuation state first and do not repeat work already proven complete.

User identifier or account context: {{USER_CONTEXT = ...}}
Current date: {{CURRENT_DATE = ...}}

# Tools

Every tool registration must be read as an execution contract. Register concrete
tools by repeating the following complete block in this location.

## {{TOOL_NAME = ...}}

Purpose: {{TOOL_PURPOSE = ...}}

Use when:
{{TOOL_USE_WHEN = ...}}

Do not use when:
{{TOOL_DO_NOT_USE_WHEN = ...}}

Parameters and required inputs:
{{TOOL_PARAMETERS = ...}}

Read/write or external side effects:
{{TOOL_SIDE_EFFECTS = ...}}

Permission and confirmation gate:
{{TOOL_CONFIRMATION = ...}}

Success result and evidence:
{{TOOL_SUCCESS_RESULT = ...}}

Failure modes, retries, and post-call handling:
{{TOOL_FAILURE_HANDLING = ...}}

Do not call a tool merely because it exists. Do not emulate a missing capability
through a broader side-effectful tool without checking the same authority boundary.

## Git

Use {{GIT_STATUS_COMMAND = ...}} and {{GIT_DIFF_COMMAND = ...}} to understand local
state before staging or publishing. Preserve unrelated modifications. Stage only
the paths that belong to this task. Create commits, rewrite history, switch branches,
or push only under {{GIT_AUTHORIZATION = ...}}.

Never use {{DESTRUCTIVE_GIT_COMMANDS = ...}} without exact authorization. When a
hook or check fails, fix the cause and create a new commit unless the user explicitly
authorized history rewriting.

# Planning and worktrees

Enter a planning workflow through {{PLAN_MODE = ...}} when the implementation has
meaningful alternatives, broad file impact, or architectural risk. Do not use it as
ceremony for a narrow edit whose path is already determined.

Create an isolated worktree through {{WORKTREE_MECHANISM = ...}} when isolation is
required. Record its branch, path, base, and ownership. Do not remove a worktree
owned by the host or user.

# Task tracking

Use {{TASK_SYSTEM = ...}} for multi-step work that benefits from visible state.
Create tasks with an observable completion condition, keep only one active owner per
task, and update status when evidence changes.

Task title: {{TASK_TITLE = ...}}
Task description and acceptance evidence: {{TASK_ACCEPTANCE = ...}}
Dependencies: {{TASK_DEPENDENCIES = ...}}
Owner or delegated agent: {{TASK_OWNER = ...}}

Delegate only independent, well-bounded work. Give each agent enough source context,
avoid duplicate investigation, and verify returned work before integration.

# Web and remote operations

Use {{WEB_SEARCH_TOOL = ...}} for current discovery and {{WEB_FETCH_TOOL = ...}}
for a known page. Follow {{SOURCE_AND_CITATION_RULES = ...}}. Remote triggers,
scheduled wakeups, monitors, messages, and publication are external effects governed
by {{REMOTE_ACTION_POLICY = ...}}.

# Editing and writing

Read a target before editing it. Use {{PRECISE_EDIT_TOOL = ...}} for scoped changes,
{{FILE_WRITE_TOOL = ...}} for authorized new files, and {{NOTEBOOK_TOOL = ...}} for
notebook cells. Match local conventions and verify the actual saved content.

# Resume and delivery

When resuming, load {{RESUME_STATE = ...}}, restate only the active objective, and
continue from the first unverified step. Before delivery, run
{{VERIFICATION_COMMANDS = ...}}, inspect Git/workspace state, and confirm generated
artifacts at {{ARTIFACT_LOCATIONS = ...}}.

The final response must distinguish completed results, evidence, and unresolved
limits. Do not claim success from a plan, an agent report, or an uninspected diff.
```

## 关键点

1. 控制对象变了：Fable 5 / Claude Code 面向代码工作区，不是泛聊天场景。
2. 自治更强：有足够信息就继续做，可逆动作直接推进，真正阻塞或高风险才问用户。
3. 证据更工程化：优先看 repo 文件、git diff/status、测试、构建、日志和浏览器结果。
4. 工具是运行协议：Read、Grep、Edit、Bash、Agent、Plan、Skill 都有明确适用边界。
5. 修改要闭环：读文件、改文件、验证、检查 diff、再汇报，而不是停在建议。
6. Git 是独立边界：commit 和 push 只在用户明确要求时执行。
7. 多 agent 是扩展能力：适合广泛搜索、并行审查和大规模迁移，但不应代替主 agent 的最终判断。

## 当前 Fable 5.1 Runtime：从工程闭环到可观察交付

Fable 5.1 的 Claude Code 文件在身份声明前先给出 reasoning effort 映射，然后立刻进入 `Reporting outcomes`。这不是普通写作偏好，而是完成状态协议：只有本轮实际观察到的工具结果、文件内容或页面状态，才能支撑 done、saved、fixed 或 verified；失败、跳过与偏差必须放在交付第一句。

源文件随后保持原有 Harness 顺序，并扩展成更完整的产品运行时：

```text
Reasoning effort
→ identity
→ Reporting outcomes
→ Harness
→ session guidance
→ Memory / Environment / Scratchpad
→ Context management / Delivering work / Writing for the user
→ Claude in Chrome
→ session context / Agents / Skills
→ concrete tool and connector registry
```

### Reporting outcomes：完成是一条证据约束

它明确区分“计划会发生什么”和“已经观察到什么”。如果验证没做，就要说没做；如果某一步失败，不能静默绕过后再把摘要写成成功。可复用时，这一段应该保持在行为层前部，因为它会约束后面的每个工具结果与最终交付。

### Writing for the user：压缩靠删减，不靠堆叠

当前文件把终端写作约束写得很具体：先给答案；一句承载一个观点；代码放代码块；短消息不滥用标题；数字只有在改变决策时才出现。它还要求自主推进可逆动作，不用“要不要我……”把无人值守任务卡住。

### Claude in Chrome：浏览器是独立证据表面

浏览器段落区分启动 tab context、console 调试、alert/dialog、GIF recording 与循环退出条件。这里的重点不是“会点页面”，而是把浏览器看成一个需要选择正确会话、读取可见状态、限制失败重试并把结果交回主任务的运行时。

当前 `claude-code-fable-5.1.md` 仍然以 `Harness` 与会话协作规则为主轴，但运行时已经比旧版工程骨架更完整：

| 层 | 当前结构 | 学习重点 |
| --- | --- | --- |
| 证据 | Reporting outcomes、Delivering work | 完成声明必须落在本轮可观察结果上 |
| 会话 | Session guidance、Environment、gitStatus、claudeMd、currentDate | 当前项目事实必须来自注入状态，而不是模型臆测 |
| 记忆 | Memory | 保存跨会话稳定事实，同时保留来源、原因与应用方式 |
| 临时态 | Scratchpad Directory | 临时文件进入会话专用目录，不污染仓库 |
| 上下文 | Context management | 长任务保存目标、决策、验证与未完成工作 |
| 协作 | Agent、Task、SendMessage、ReportFindings | 拆分任务但保留主代理的整合责任 |
| 时间 | Cron、Monitor、ScheduleWakeup、RemoteTrigger | 定时、持续观察和远程触发是不同契约 |
| 设计 | Artifact、DesignSync、NotebookEdit | 代码之外的产物也有创建、同步和验证路径 |
| 工程工具 | Bash、Read、Edit、Write、WebFetch、WebSearch、Workflow | 每类事实和副作用绑定到专用工具 |
| 外部服务 | Gmail、Google Calendar、Google Drive、Claude in Chrome | 连接器 schema 定义数据与副作用，不能从可用性推导授权 |

### Memory：记录的不只是事实

当前 Claude Code Fable 5.1 的 memory 格式要求：反馈和项目记忆不仅写“是什么”，还要写 `Why` 与 `How to apply`，相关记忆可以互相链接。它把记忆从便签变成**带适用条件的工程知识**。

### Scratchpad：临时态必须有生命周期

源提示词明确给出会话 scratchpad，并要求临时文件进入该目录。可复用含义是：不要把下载文件、解析中间产物、截图或一次性脚本混进用户项目；任务完成后，哪些是交付物、哪些可丢弃，应当一眼可分。

### Cron、Monitor 与 ScheduleWakeup 不是一回事

- Cron：在明确时间点运行一次或周期任务。
- Monitor：持续观察某个外部状态。
- ScheduleWakeup：让当前会话在未来继续。
- RemoteTrigger：与外部触发源建立约定。

把它们都抽象成“稍后再做”会丢失触发条件、生命周期和所有权，这是设计 agent runtime 时容易忽略的差别。

### DesignSync：设计状态也是工作区证据

DesignSync 说明当前运行时不仅处理代码和文本，还可能把设计工具状态同步进任务上下文。它应该和 Git、文件、浏览器一样被当作一种 source of truth：要读取真实状态、精确修改、再验证用户看到的结果。

## 和 GPT-5.5 框架的差异

| 维度 | GPT-5.5 风格 | Fable 5 / Claude Code 风格 |
| --- | --- | --- |
| 默认任务 | 任意用户请求 | 软件工程请求 |
| 第一判断 | 事实来源是什么 | 仓库里该查哪里、改哪里、怎么验证 |
| 证据源 | 文件、网页、图片、计算、记忆、浏览器 | repo、git、测试、日志、构建、浏览器、GitHub |
| 工具策略 | 最小必要工具 | 专用工程工具链和子 agent |
| 成功标准 | 给出有证据的回答 | 完成代码改动并验证 |
| 副作用边界 | 发送、删除、发布、付款、权限等 | 额外强调编辑、删除、commit、push、外部发布 |
| 输出形态 | 结果、证据、限制、下一步 | 改了什么、验证了什么、还有什么风险 |

压缩成一句话：

```text
GPT-5.5: route the request to the right source of truth.
Fable 5 / Claude Code: drive the engineering task through workspace evidence, edits, verification, and Git boundaries.
```

## Claude Code 系列提示词演进

### Opus 4.6：代码代理骨架成型

重点已经包括 Claude Code 身份、软件工程任务、任务列表、提问工具、搜索/读取/编辑工具、Git 提交规则和授权安全测试边界。这个阶段的核心是让模型不只是聊天，而是能在代码仓库里做事。

### Opus 4.8：运行时协议更清晰

提示词更像一份 CLI/agent runtime 手册：环境信息、上下文续作、工具说明、Agent 路由和计划模式被组织得更紧凑。这个阶段强调长上下文下继续推进，不要因为会话变长就提前收尾。

### Fable 5.1：可观察结果和无人值守执行加强

Fable 5.1 在 Claude Code 场景里的重点是：能做就做，少问阻塞式问题；对可逆动作保持推进；对破坏性、外部发布、权限、Git 操作保持边界；最终只报告本轮真正观察到的结果。它把“工程执行代理”进一步收紧为“可审计的工程执行代理”。

## 和当前 Sonnet 5 / Claude Code 快照的关系

本页最适合学习“工程任务怎样闭环”：工作区取证、保守编辑、验证、Git 边界和交付。[Claude Sonnet 5 / Claude Code](../claude-sonnet-5-claude-code/) 笔记则把视角扩大到通用助手底座、auto memory、bundled skills、配置诊断、评审 effort 和 compact 上下文续作。

```text
Fable 5 baseline = drive the engineering task to completion.
Sonnet 5 + current Claude Code = compose assistant behavior,
specialized skills, and context continuity around that completion loop.
```

## 复习问题

1. 这个请求是不是工程任务？如果是，仓库里的 source of truth 是什么？
2. 需要解释、定位、修改、验证，还是 Git/GitHub 操作？
3. 这一步是否可逆？是否涉及删除、覆盖、提交、推送或外部发布？
4. 是否需要 task list、plan mode、subagent，还是直接查文件即可？
5. 改动前读过相关文件了吗？
6. 完成后用什么最小验证证明它真的好了？
7. 最终回答是否说清楚了改动、验证和剩余风险？

## 来源索引

以下链接固定到本笔记复核时使用的源快照 `171d1db270008b6cd8132f1a1b924ff3506b9f8a`：

- [Claude Fable 5.1](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-fable-5.1.md)
- [Claude Fable 5.1 官方版本材料](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/official/2026-09-01-claude-fable-5.1.md)
- [Claude Code Fable 5.1](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-code/claude-code-fable-5.1.md)
- [Claude Code workflow-authoring skill](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-code/skills/workflow-authoring/SKILL.md)
