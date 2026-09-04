# Claude Design Skills Notes

这份笔记学习 Claude Design 当前系统提示词、19 个用户可调用 skills、2 个内部 skills 与 10 个 starter components 怎样组成一个可执行的设计运行时。它不是 Claude Design 的官方教程；重点是把可复用的流程、组件契约和验证方法从产品专用细节中抽出来。

> 源快照：`asgeirtj/system_prompts_leaks@171d1db270008b6cd8132f1a1b924ff3506b9f8a`（2026-09-03）。Skills 与 starter components 均来自该固定树；数量按目录 README 区分用户可调用与内部能力，不根据文件名推测运行时暴露状态。

## 一句话核心

Claude Design 的关键不是“让模型更有审美”，而是把设计任务变成：选择交付物 → 读取输入 → 用 Design Components 构建 → 调用专用 skill → 预览验证 → 接收锚点反馈 → 导出或交给 Claude Code。

```text
Design quality = structured artifact + reusable components
               + task-specific skill + visible verification
               + a clear handoff.
```

## 设计代理的工作流

当前 `claude-design.md` 把设计工作写成一条明确执行链：

1. 理解用户要做的是页面、原型、文档、deck、邮件、海报还是其他交付物。
2. 读取已有文档、提及元素、评论锚点和项目说明。
3. 默认创建一个 Design Component，而不是把多个无关组件散落成难以管理的文件。
4. 使用模板语法表达循环、条件和可调参数。
5. 使用逻辑层处理数据与交互，不把复杂逻辑塞进静态标记。
6. 选择匹配任务的 skill，读取其完整说明。
7. 通过预览或验证表面实际查看结果。
8. 根据画布/幻灯片/屏幕锚点接收精确反馈。
9. 导出为用户需要的格式，或生成可继续开发的 Claude Code handoff。

它与普通“生成一段 HTML”最大的差别是：**设计产物始终处在可预览、可评论、可调整、可移交的生命周期里**。

## Design Components：结构、逻辑与反模式

Design Component（DC）是这套运行时的核心交付单元。源提示词强调：

- 默认一个 DC，除非交付物天然需要多个独立页面或画布。
- 模板使用明确的循环、条件和变量语法。
- 逻辑层与视觉模板分开，避免把状态变化散落在标记里。
- 组件必须适配预期画布尺寸。
- 不绕过 DC 直接写不可管理的临时 HTML。
- 不把大量内容硬编码成无法调整的一次性像素稿。

这套结构可以迁移到任何生成式设计系统：

| 层 | 负责什么 | 不应该做什么 |
| --- | --- | --- |
| Content model | 文案、数据、层级和语义 | 把内容埋进坐标和样式 |
| Design Component | 画布、布局、视觉结构 | 每次从零复制整页 |
| Logic | 交互、循环、条件和派生数据 | 把业务逻辑写进静态模板 |
| Skill | 特定交付物的方法与完成标准 | 只凭通用审美猜格式要求 |
| Verification | 真实预览、错误和锚点反馈 | 只检查源代码不看渲染结果 |

## Skills：按交付物路由能力

当前目录包含 21 个 skills：19 个出现在 slash menu，`hi-fi-design` 与 `options` 是可由系统取用但不由用户直接选择的内部 skills。可以按意图分成五组：

### 1. 探索与定义

- `options`：在方向不确定时提供真正不同的方案。
- `wireframe`：先解决信息架构和交互路径。
- `create-design-system`：建立 tokens、组件和一致性规则。
- `make-tweakable`：把关键参数暴露为可调控制。

### 2. 高保真与交互

- `hi-fi-design`、`frontend-design`：从结构走向可交付界面。
- `interactive-prototype`：加入可验证的状态和交互。
- `3d-object`、`animated-video`、`maps-geography`：处理特殊表现和空间内容。

### 3. 文档与传播物

- `make-a-deck`、`make-a-doc`、`flier`、`html-email`。
- `export-as-pptx-editable` 与 `export-as-pptx-screenshots` 明确区分“可编辑结构”和“像素保真”两种导出目标。

### 4. 输入、研究与输出

- `web-research`：先取得真实网络内容。当前目录 README 明确记录 `read-pdf` 已移除，即使主提示词的旧工作流仍有遗留提及，也不能把它算作可用 skill。
- `save-as-pdf`、`save-as-standalone-html`：输出到可分发格式。

### 5. 工程衔接

- `claude-api-in-prototypes`：在原型里加入 Claude API 能力。
- `handoff-to-claude-code`：把设计状态、结构和下一步交给工程代理。

Skill 的意义不是给模型增加“灵感关键词”，而是为不同交付物提供各自的输入、流程、限制与 definition of done。

## Starter components：把常见画布抽成积木

当前 starter components 包括：

| 组件 | 用途 |
| --- | --- |
| `android-frame.jsx`、`ios-frame.jsx` | 移动设备界面画布 |
| `macos-window.jsx`、`browser-window.jsx` | 桌面窗口与浏览器容器 |
| `deck-stage.js`、`doc-page.js` | 幻灯片和文档页面 |
| `image-slot.js` | 稳定管理图像占位与替换 |
| `animations-v3.jsx` | 连续时间轴、场景剪辑、播放与视频导出 |
| `three-d-stage.js` | 3D 场景容器 |
| `tweaks-panel.jsx` | 暴露可调参数 |

Starter component 解决的是**重复结构的可靠性**。设备边框、文档纸张、deck 舞台和调参面板不应该每次重新发明；复用它们可以把注意力留给内容层级、交互和视觉判断。

### 当前重组里最值得学习的契约

- `animated-video` 必须以 `animations_v3.jsx` 的单一 authored-time clock 为事实来源；场景列表、播放长度和画面插值不能各自维护一套时间。
- `make-a-doc` 与 `flier` 统一建立在 `doc-page.js` 的分页模型上，先决定 flowing pages 还是 fixed sheet。
- `create-design-system` 把全局 CSS 入口、tokens、font-face、可发现组件和 UI kits 写成编译器契约，不靠目录名猜内容。
- `handoff-to-claude-code` 要交付设计引用、保真级别、屏幕布局、交互、状态、tokens、资产和未决约束，而不是只丢一张截图。
- `export-as-pptx-editable` 与 screenshots 版本继续明确区分结构可编辑和像素保真。

## Verification：预览、反馈锚点与 Claude Code handoff

Claude Design 把“读到文件”和“用户看到文件”分得很清楚。中途预览和最终 HTML 交付使用不同表面；最终验证还要关注控制台错误。对于多屏、多 slide 产物，标签和评论锚点让用户可以指出具体位置，而不是说“右边那个看起来不对”。

一个完整闭环应当回答：

```text
用户最终看到的是什么？
哪个画布、屏幕或 slide 可以被精确引用？
真实渲染有没有错误、溢出和失效交互？
导出文件保留的是可编辑结构还是视觉截图？
如果交给 Claude Code，工程约束和未决问题是否一并传递？
```

## 原文式可复用模板：Design Agent Runtime

下面的母版保留源提示词“系统边界 → 工作流 → 输入 → Design Components → 展示 → 验证 → skills → handoff”的顺序，只抽象产品专用工具、组件语法和文件位置。

```text
# Design agent

You are {{DESIGN_AGENT_NAME = ...}} inside {{DESIGN_PRODUCT = ...}}.
Create {{DELIVERABLE_TYPE = ...}} for {{AUDIENCE_AND_USE = ...}}.

Do not expose {{PRIVATE_ENVIRONMENT_DETAILS = ...}}. Describe capabilities
in user-facing terms and show the actual deliverable through
{{PREVIEW_AND_DELIVERY_SURFACES = ...}}.

## Workflow

1. Resolve the requested deliverable, audience, content, and success condition.
2. Read {{INPUT_DOCUMENTS = ...}}, {{MENTIONED_ELEMENTS = ...}}, and
   {{PROJECT_INSTRUCTIONS = ...}} before changing the design.
3. Choose the matching skill from {{SKILL_CATALOG = ...}}.
4. Build the artifact through the Design Component contract below.
5. Preview at {{TARGET_VIEWPORTS = ...}} and correct visible failures.
6. Deliver through {{OUTPUT_FORMAT_AND_SURFACE = ...}}.

## Reading and feedback anchors

Document readers: {{DOCUMENT_READERS = ...}}
Comment anchor format: {{COMMENT_ANCHORS = ...}}
Screen, slide, or page labels: {{CANVAS_LABELS = ...}}

Preserve existing anchors when revising. Make every major surface addressable
so feedback can point to an exact screen, slide, page, or component.

## Design Components

Create {{COMPONENT_COUNT_RULE = ...}} primary Design Component by default.

Canvas size: {{CANVAS_SIZE = ...}}
Content model: {{CONTENT_MODEL = ...}}
Design tokens: {{DESIGN_TOKENS = ...}}
Layout system: {{LAYOUT_SYSTEM = ...}}
Responsive behavior: {{RESPONSIVE_RULES = ...}}

Template iteration and condition syntax: {{TEMPLATE_SYNTAX = ...}}
Logic and interaction layer: {{LOGIC_LAYER = ...}}
External component import contract: {{COMPONENT_IMPORTS = ...}}

Do not bypass the component model with one-off markup that cannot be
previewed, commented on, tuned, or handed off.

## Skill routing

### {{SKILL_NAME = ...}}

Use when: {{SKILL_TRIGGER = ...}}
Required inputs: {{SKILL_INPUTS = ...}}
Process: {{SKILL_PROCESS = ...}}
Completion evidence: {{SKILL_DONE = ...}}

Read the selected skill completely. Load only the references and templates
needed for the current deliverable.

## Starter components

Available starters: {{STARTER_COMPONENTS = ...}}
Selection rule: {{STARTER_SELECTION = ...}}
Allowed customization: {{STARTER_CUSTOMIZATION = ...}}

Reuse a starter for repeated device frames, browser windows, document pages,
deck stages, image slots, animation systems, 3D stages, or tweak controls
instead of recreating the same infrastructure.

## Verification and handoff

Preview surface: {{PREVIEW_SURFACE = ...}}
Console and runtime checks: {{RUNTIME_CHECKS = ...}}
Visual checks: {{VISUAL_CHECKS = ...}}
Editable vs screenshot export rule: {{EXPORT_FIDELITY = ...}}
Claude Code handoff package: {{ENGINEERING_HANDOFF = ...}}

The handoff must include the content model, component structure, assets,
interaction states, dimensions, known constraints, and unresolved decisions.
```

## 可直接复用的项目清单

1. 先写清交付物、受众、用途和画布。
2. 列出真实内容来源，不用虚构文案填满布局。
3. 选择一个匹配交付物的 skill。
4. 优先复用 starter component。
5. 把内容、视觉组件和逻辑分层。
6. 让关键参数可以调整。
7. 为每个屏幕、slide 或 page 建立可引用标签。
8. 实际预览并检查溢出、交互和控制台。
9. 明确导出目标是可编辑还是像素保真。
10. handoff 时同时传递结构、状态、资产和未决问题。

## 复习问题

1. 用户真正要保存、分享或继续编辑的交付物是什么？
2. 哪个 skill 与这个交付物最匹配？
3. 是否已有 starter component 可以复用？
4. 内容、视觉结构和交互逻辑是否分层？
5. 重要尺寸和样式是否可以调整？
6. 用户能否对具体屏幕、slide 或组件给出精确反馈？
7. 是否查看了真实预览，而不只是源代码？
8. 导出选择保留了用户真正需要的可编辑性或视觉保真？
9. 交给 Claude Code 时是否携带足够工程上下文？

## 来源索引

以下链接固定到本笔记使用的源快照 `171d1db270008b6cd8132f1a1b924ff3506b9f8a`：

- [Claude Design system prompt](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-design/claude-design.md)
- [Claude Design Skills directory](https://github.com/asgeirtj/system_prompts_leaks/tree/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-design/skills)
- [Claude Design Skills inventory](https://github.com/asgeirtj/system_prompts_leaks/blob/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-design/skills/README.md)
- [Claude Design Starter components](https://github.com/asgeirtj/system_prompts_leaks/tree/171d1db270008b6cd8132f1a1b924ff3506b9f8a/Anthropic/claude-design/starter-components)
