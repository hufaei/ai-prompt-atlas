# Claude Opus 5 / Claude Code Notes

这份笔记把 Claude Opus 5 的 Claude.ai 行为提示词与 Claude Code Opus 5 的工程运行时放在一起学习。它不是官方模型说明，也不评价模型强弱；重点是从固定源快照中提炼可迁移的 prompt/runtime 结构。

> 源快照：`asgeirtj/system_prompts_leaks@171d1db270008b6cd8132f1a1b924ff3506b9f8a`（2026-09-03）。Claude.ai、官方版本材料与 Claude Code 是不同表面，本页不把它们误写成一份单体 prompt。

## 一句话核心

Opus 5 的 Claude.ai 表面用行为、安全、语气和 memory filesystem 管理长期助手关系；Claude Code 表面则用 Harness、工作区、交付与纠错协议，把模型收敛成可验证的工程执行代理。

```text
Assistant behavior decides how to relate and remember.
Coding runtime decides how to inspect, act, correct, and deliver.
The shared model does not erase the boundary between the two products.
```

## 两个表面：Claude.ai 与 Claude Code

| 表面 | 核心结构 | 主要 source of truth |
| --- | --- | --- |
| Claude.ai | `claude_behavior`、安全路由、默认立场、语气、memory filesystem、连接器与 artifacts | 对话上下文、记忆文件、连接器、附件和网页 |
| Claude Code | Harness、session guidance、memory、environment、scratchpad、context、delivery、corrections、agents、skills、tools | 仓库、Git、文件、命令、测试、任务状态和工具结果 |

学习时要避免一个常见误区：看到两个文件都写“memory”就认为机制相同。Claude.ai memory 更接近长期用户/项目知识库；Claude Code memory 更强调项目反馈和可应用的工程事实。两者的存储位置、敏感信息边界和使用场景并不相同。

## Assistant behavior：默认立场、语气、安全与记忆

`claude-opus-5.md` 的前半部分先建立行为层，而不是先列工具：

1. `product_information`：说明产品能力与表面。
2. `fable_safeguards_routing`：把特定安全路由放在高优先级位置。
3. `default_stance` 与 `refusal_handling`：定义正常协作、拒绝和替代帮助。
4. `legal_and_financial_advice`：对高风险领域增加不确定性和行动边界。
5. `tone_and_formatting`：约束自然语言、列表密度与用户语气匹配。
6. `user_wellbeing`、`evenhandedness`、`responding_to_mistakes_and_criticism`：处理关系性和争议性场景。
7. `knowledge_cutoff`：提醒当前事实需要外部检索。

这些章节的复用价值不是逐字照搬，而是**先定义正常协作姿态，再为高风险分支增加路由**。如果所有请求一开始都经过同一套长安全清单，普通任务会变得迟钝；如果完全不单列高风险分支，又容易在关键场景里只靠语气规则。

## Memory filesystem：长期知识有写入协议

Opus 5 的 memory filesystem 是一个完整子系统，包含：

- 已有哪些记忆文件；
- 文件格式与目录；
- 什么信息写到哪里；
- 什么时候写入；
- 写入前先读什么；
- 隐私分类和 omission guidance；
- 如何在回答里应用记忆；
- 哪些表达方式会暴露内部记忆机制；
- 正确和错误的使用示例。

它提供了一个比“记住用户偏好”更严格的模型：

```text
Candidate fact
-> durability and usefulness test
-> privacy and sensitivity check
-> choose scope and file
-> read existing memory
-> merge without duplication
-> apply only when materially relevant
-> never reveal private storage mechanics
```

最重要的边界是：记忆不是文档、邮箱或第三方应用的替代品。记忆可以告诉 agent “这个项目可能相关”，但用户问具体文件内容时仍要回到文件或连接器。

## Claude Code：Harness、交付、纠错与上下文

`claude-code-opus-5.md` 仍以 `Harness` 开始，但比单纯的工具清单多了三个值得单独学习的层：

### 1. Scratchpad Directory

所有临时文件进入会话专用 scratchpad。它把一次性解析、下载、截图和中间产物与用户仓库分离，避免把执行垃圾误当成项目交付物。

### 2. Delivering work

交付不是“发一段总结”。要先确认实际改变、检查结果、文件位置和可见产物，再压缩成用户可以接手的信息。没有证据的“完成”不属于交付。

### 3. Corrections

当用户指出错误时，运行时要求先理解具体失败，不进行防御性辩解；如果修复会改变范围或产生新副作用，再说明并确认。纠错被设计成正常状态转移，而不是人格受挫后的例外流程。

## Agents、Skills 与工具注册表

当前 Claude Code Opus 5 把 `Agents`、`Skills` 和 `Tools` 分成三层：

| 层 | 职责 | 风险 |
| --- | --- | --- |
| Agents | 把独立、清楚边界的工作交给其他执行单元 | 重复调查、上下文不足、无人整合 |
| Skills | 加载特定领域的完整工作流、模板与完成标准 | 只摘方便的几行、忽略 gate |
| Tools | 读取或改变具体系统状态 | 工具可用被误解为用户授权 |

工具目录覆盖 Agent、Artifact、提问、Shell、Cron、DesignSync、编辑、计划/工作树、监控、Notebook、推送通知、远程触发、任务、搜索和工作流等能力。学习重点不在背诵工具名，而在辨认每个工具的四个契约：**何时用、输入是什么、副作用是什么、什么结果才算成功**。

## 原文式可复用模板：Opus Assistant + Coding Runtime

下面的母版保留两个源文件的主要展开顺序。产品名、记忆路径、策略内容和工具目录被参数化；行为层与 coding runtime 仍保持分层，而不是改写成通用编号摘要。

```text
# Assistant behavior layer

You are {{ASSISTANT_NAME = ...}}, the assistant inside
{{ASSISTANT_PRODUCT = ...}}.

## Product information

Product surfaces and capabilities: {{PRODUCT_INFORMATION = ...}}
Current date, locale, and knowledge boundary: {{CURRENT_CONTEXT = ...}}

## Default stance

Be {{DEFAULT_STANCE = ...}}. Answer the user's actual request directly.
Use external sources when {{FRESHNESS_GATE = ...}}. Do not let stylistic
agreement override factual correction, user agency, or higher-priority rules.

## Refusal and high-risk routing

Safety routes: {{SAFETY_ROUTES = ...}}
High-risk domains: {{HIGH_RISK_DOMAINS = ...}}
When a request crosses a boundary, explain the limit briefly and provide
{{SAFE_ALTERNATIVE_BEHAVIOR = ...}} when useful.

## Tone and formatting

Tone matching rule: {{TONE_RULE = ...}}
List and heading policy: {{FORMAT_POLICY = ...}}
Correction behavior: {{CORRECTION_BEHAVIOR = ...}}

## Memory filesystem

Memory root and scopes: {{MEMORY_SCOPES = ...}}
Allowed durable facts: {{MEMORY_WRITE_CRITERIA = ...}}
Sensitive or forbidden content: {{MEMORY_PRIVACY_RULES = ...}}
Read-before-write protocol: {{MEMORY_MERGE_PROTOCOL = ...}}
Application gate: {{MEMORY_APPLICATION_GATE = ...}}

Do not use memory as the source of truth for a requested file, message,
document, or connected application. Route those requests through
{{SOURCE_SPECIFIC_RETRIEVAL = ...}}.

# Coding runtime layer

## Harness and delivery

You are operating inside {{CODING_HARNESS = ...}} with the role
{{ENGINEERING_ROLE = ...}}. Continue until {{COMPLETION_CONDITION = ...}}
or a concrete blocker remains.

Progress surface: {{PROGRESS_SURFACE = ...}}
Final delivery contract: {{DELIVERY_CONTRACT = ...}}
Correction protocol: {{CORRECTION_PROTOCOL = ...}}

## Session-specific guidance

Project instructions: {{PROJECT_INSTRUCTIONS = ...}}
Permission mode: {{PERMISSION_MODE = ...}}
Repository state: {{REPOSITORY_STATE = ...}}

## Runtime memory

Project memory format: {{PROJECT_MEMORY_FORMAT = ...}}
Feedback memory format: {{FEEDBACK_MEMORY_FORMAT = ...}}
Memory provenance and links: {{MEMORY_PROVENANCE = ...}}

## Environment and scratchpad

Working directory: {{WORKING_DIRECTORY = ...}}
Platform and shell: {{PLATFORM_SHELL = ...}}
Session scratchpad: {{SCRATCHPAD_DIRECTORY = ...}}
Temporary-file lifecycle: {{TEMPORARY_FILE_POLICY = ...}}

## Context management

Compaction trigger: {{CONTEXT_THRESHOLD = ...}}
Continuation state: {{CONTINUATION_STATE = ...}}
Preserve the goal, user decisions, relevant files, commands, failures,
verification, completed work, and the next executable step.

## Agents and skills

Agent registry and delegation gate: {{AGENT_REGISTRY = ...}}
Skill catalog and trigger rules: {{SKILL_CATALOG = ...}}
Subtask result verification: {{DELEGATE_VERIFICATION = ...}}

## Tool contract

### {{TOOL_NAME = ...}}

Purpose: {{TOOL_PURPOSE = ...}}
Use when: {{TOOL_USE_WHEN = ...}}
Required input: {{TOOL_INPUT = ...}}
Side effects and authority: {{TOOL_AUTHORITY = ...}}
Success evidence: {{TOOL_RESULT = ...}}
Failure and retry behavior: {{TOOL_FAILURE = ...}}

Repeat the complete tool block in this location for every available tool.
Tool availability never grants broader authority than the user's request.
```

## 和 Sonnet 5、Fable 5 的学习侧重点

| 主题 | Sonnet 5 | Fable 5 | Opus 5 |
| --- | --- | --- | --- |
| Claude.ai | 通用助手、检索与视觉路由 | 当前助手行为与 memory filesystem | 行为、安全、语气与 memory filesystem |
| Claude Code | Doing tasks、action care、auto memory | 沟通、工程闭环、runtime 工具 | delivery、corrections、runtime 工具 |
| 最适合学习 | 能力模块怎样组合 | 如何持续推进工程任务 | 两个产品表面怎样共享模型但保持契约分离 |

这张表是学习视角，不是模型能力排名。

## 复习问题

1. 当前规则属于 Claude.ai 行为层，还是 Claude Code 工程层？
2. 这条记忆应该长期保存，还是只是当前任务临时态？
3. 文档或连接器内容是否回到了专用 source of truth？
4. 临时文件是否进入 scratchpad，而不是污染工作区？
5. 交付是否有实际文件、命令、渲染或状态证据？
6. 用户纠错后，是先验证失败还是先解释自己？
7. Agents、Skills 与 Tools 是否各自承担正确职责？
8. 工具存在是否被误解成了授权？

## 新增官方版本材料：产品事实也有边界

固定树新增的 `official/2026-07-24-claude-opus-5.md` 是一份较短的官方版本行为材料。它不等于完整 Claude.ai prompt，但能校准几个当前产品事实：

- 当前身份是 Claude Opus 5，定位为处理复杂挑战的模型。
- 产品信息只覆盖文件列出的 Claude chat、API/Platform、Claude Code、Cowork、Chrome、Excel、PowerPoint、Tag 与 Design 等入口。
- 文件明确说产品知识到此为止；未列出的账户、价格、使用方式不能凭印象补齐，应分别指向 support 或 docs。
- 知识截止与当前时间分开。对截止之后的事件，有搜索时核验，没有搜索时说明限制。
- Fable safeguards routing 是独立的产品路由说明，不能把“用户选择的模型”和“实际响应模型”永远假设为同一个。

这说明 product information 不是广告段落，而是一张受限事实表：**列出的可以答，未列出的要路由到当前文档或搜索。**

## 来源索引

以下链接固定到本笔记使用的源快照 `171d1db270008b6cd8132f1a1b924ff3506b9f8a`：

- [Claude Opus 5](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-opus-5.md)
- [Claude Opus 5 官方版本材料](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/official/2026-07-24-claude-opus-5.md)
- [Claude Code Opus 5](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-code/claude-code-opus-5.md)
