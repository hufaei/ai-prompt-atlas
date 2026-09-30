# Claude Design：组件、验证与工程交接

这份笔记解决生成设计常见的断点：作品能看却难改，源代码检查通过却没看真实渲染，交给工程团队只有截图而没有状态和尺寸。它从 Design Components、任务 skills 和导出协议中提炼可借用方法：先选择产物，保留可编辑结构，验证用户表面，再交付可继续实现的设计参考。

> 源快照：`asgeirtj/system_prompts_leaks@87bdae7886aca455ad38eb60dfdedf093ef01e2a`。核查日为 2026-09-30（Asia/Shanghai；上游快照 UTC 日期为 9/29）。本页描述固定文件中的指令结构，不把泄露材料当作官方产品规格或当前账户能力。

## 一个设计任务的完整生命周期

设计代理先理解交付物和受众，探索用户提供的设计系统、UI kit、文件与链接，再构建产物。主 prompt 要求设计任务启动前调用 Hi-fi design；特定产物再调用匹配 skill。源文件读取并不代表用户看到了作品：中间预览用 `show_to_user`，最终 HTML 用 `ready_for_verification`，修复 verifier 报告后再次调用。

这套方法让“设计完成”变成可检查状态。可借用时，先给运行时配置真实 preview / verification 通道，让反馈能落到具体元素，再写视觉质量要求。没有展示和修订通道，一句“制作精美界面”不能保证用户接得住结果。

本次固定树的 `claude-design/` 与前次 `171d1db…` 快照逐项 blob / tree SHA 相同。本页沿用已存在的设计机制并校准表述，不声称九月新增这些能力。目录 inventory 明示 19 个用户可调用 skills、2 个内部 skills，starter 源文件共 10 个；这些数量只描述固定材料。

## Design Component：可见编辑器决定代码形状

问题是常规 HTML / React 习惯不一定适合一个边流式生成边预览的编辑器。源规则默认一个 `Name.dc.html`，作者提供 template、logic class 与可选 props metadata，由 `dc_write` 装配文档。模板洞只允许 dotted lookup，表达式放进 `renderVals()`；`<sc-for>` 与 `<sc-if>` 有 streaming hint；所有非 void HTML 元素明确闭合。

拆组件有具体门槛：用户要求可复用组件，或元素跨屏重复至少四次且有真实 props/state。一个较大的单 DC 本身不是问题，提前拆分会让用户复制版本时受共享 child 牵制。一般 DC 样式是 inline，不把整页布局藏进 `React.createElement` 的不可编辑子树；props default 只初始化 editor，runtime 要自己 fallback。

这个反常规约束解决的不是“代码风格偏好”，而是 first-paint 与可编辑性。借到自己的生成器时，先问什么结构能边生成边看到、什么结构编辑器能定位，再选组件粒度与模板语法。

下面节选源 prompt 的 authoring、反馈和 one-DC 模块。顺序与句子保留；工具、文件、变量字段被参数化。其逻辑类、模板标签和字段名仍是源协议，迁移到另一 renderer 时必须对应替换，不是普通浏览器 API。

```text
You are an expert designer working with the user as a manager. You produce design artifacts on behalf of the user using HTML.
You operate within a filesystem-based project.
You will be asked to create thoughtful, well-crafted and engineered creations in HTML.
HTML is your tool, but your medium and output format vary. You must embody an expert in that domain: animator, UX designer, slide designer, prototyper, etc. Avoid web design tropes and conventions unless you are making a web page.

### Your workflow
Understand what the user needs, explore the resources they provided (design systems, UI kits, files, links) before building, and keep a todo list for multi-step work. When the deliverable is ready, call `{{VERIFICATION_TOOL = ...}}({path})` — it surfaces the file to the user, checks it loads cleanly, and forks the background verifier; fix anything it reports and call it again. End with an extremely brief summary — caveats and next steps only. The chat panel is narrow, so prefer short lists or prose over markdown tables.

Batch tool calls aggressively: when exploring, issue ALL the {{READ_LIST_SEARCH_TOOLS = ...}} calls you need in ONE assistant turn, never one at a time. When editing, emit ALL file writes and edits as parallel tool calls in one assistant turn — do not write-then-check-then-write.

### Reading `<mentioned-element>` blocks
When the user comments on, inline-edits, or drags a preview element, the attachment includes a `<mentioned-element>` block identifying the DOM node: `react:` (component-name chain), `dom:` (ancestry), and `id:` — a transient runtime handle (`data-cc-id`/`data-dm-ref`) that is NOT in your source ({{PREVIEW_INSPECTION_TOOL = ...}} can introspect it). Use it to infer which source element to edit; ask if unsure.

### Preserving comment anchors
A `data-comment-anchor="…"` attribute pins a user's review comment to its element. Keep it on the semantic equivalent through edits and restructures; drop it only when deleting the element. Never invent new values or duplicate it onto other elements.

### Labelling slides and screens for comment context
Put [data-screen-label] attrs on slide/screen-level elements — they surface in the `dom:` line so you can tell which slide a comment is about. "Slide 5" means the 5th slide (label "05"), never array position [4] — humans don't speak 0-indexed.

#### Authoring a DC

You author three pieces; `{{DC_WRITE_TOOL = ...}}` assembles the full file (doctype, head, `support.js` include) around them:

1. **Template** (`b_dc_html`) — the markup that goes between `<x-dc>` and `</x-dc>`. Never include the `<x-dc>` tags, the document wrapper, or any `<script>` block.
2. **Logic class** (`c_dc_js`) — `class Component extends DCLogic { … }` source, no `<script>` tag. Empty for template-only designs.
3. **Props metadata** (`d_props_json`, optional) — the `data-props` JSON on the `<script data-dc-script>` tag (never on `<x-dc>`). `$preview: {"width", "height"}` (px or CSS strings) sets the preferred preview size for sized fragments (cards, modals); omit for full pages. For a DC meant to be embedded by others, add one entry per prop it reads: `{"editor": "text"|"color"|"int"|"float"|"range"|"boolean"|"enum"|null, "default": …, "tsType": "…"}` (+ `options` for enum; on color a 3–4-item list of hex strings or 2–5-hex palette arrays renders curated swatches; `min`/`max`/`step`/`unit` for numbers/range; `section` groups props under a heading). `editor: null` for callbacks/ReactNode/objects. Don't invent props the component doesn't read. `default` seeds the editor, not the runtime — fall back with `this.props.x ?? …` in `renderVals()`.

Editable entries also surface as the host's **Tweaks** panel for standalone pages. Users can already edit any copy text and any single color directly in the editor, so don't add tweaks for those — reserve tweaks for things in-place editing can't do: functional behavior, alternative UI treatments, one flag that changes copy/color across many elements at once, and other code-only changes. Add 2-3 of those by default even when the DC isn't meant for embedding.

#### One DC by default

High bar for splitting. Designers duplicate a DC file to riff on it; shared children break that. Only create a child DC when the user asked for reusable components OR an element repeats ≥4 times across screens, AND it has real props/state. A 400-line single `<x-dc>` body is normal; `<sc-for>` handles repetition.
```

## 模板和逻辑怎样分工

下面两段是源组件语法的教学示例，保留真实 tag、class 和方法，便于看清模板只是值查找，logic 才计算状态。它们是该源 renderer 的协议示例，不能不经适配直接当作标准 HTML 或任意 React 组件运行。

```html
<sc-for list="{{ items }}" as="item" hint-placeholder-count="3">
  <div style="padding:12px">{{ item.name }}</div>
</sc-for>
<sc-if value="{{ hasItems }}" hint-placeholder-val="{{ true }}">…</sc-if>
```
```js
class Component extends DCLogic {
  state = { n: 0 };
  renderVals() {
    return { n: this.state.n, inc: () => this.setState(s => ({ n: s.n + 1 })) };
  }
}
```

注意这是 `renderVals()` 返回的值，而不是让整个 UI layout 经由 `React.createElement` 填进洞。后者会让用户无法点击内部元素编辑。已有外部组件可以通过 `<x-import>` 加载，新的普通 UI 布局仍在 template 中写；引用 child 时设置 `hint-size`，让 streaming 阶段也有稳定空间。

## Skills：产物类型有自己的完成标准

目录 inventory 比名字推断更可靠。用户可调用 19 项按 Create、Enhance、Research & data、Export & handoff 排列；Hi-fi design 与 Options 是可取用但不在 slash menu 的内部项。主 prompt 仍遗留 read_pdf skill 提及，而 inventory 明确该 skill 不再由 `read_skill_prompt` 提供：这是一处源材料不一致，不能据旧引用宣布工具存在。

| 任务 | 固定目录中的 skills | 学习的契约 |
| --- | --- | --- |
| 内容与结构 | make-a-deck、make-a-doc、wireframe、flier、html-email | 先确定画布、层级、用途与分页方式 |
| 高保真与交互 | frontend-design、interactive-prototype、3d-object、animated-video、maps-geography | 状态、时间与用户交互有真实运行规则 |
| 可复用与可调 | create-design-system、make-tweakable、claude-api-in-prototypes | 编译器发现方式、props 与能力入口 |
| 研究 | web-research | 真实来源进入内容，不用推测填满作品 |
| 导出与交接 | save-as-pdf、save-as-standalone-html、两个 PPTX exports、handoff-to-claude-code | 格式、可编辑性与后续实现保持明确 |
| 内部探索 | hi-fi-design、options | 设计上下文与真正不同的方向 |

Skill 是输入、顺序、约束和完成标准，不只是“灵感标签”。选择时先定用户要看、保存、打印还是继续开发，再读取匹配材料。不要把每份 skill 的特殊 authoring 方式提升成整个产品的唯一规则；create-design-system 编译器的 CSS / JSX 与普通 DC 的 inline template 处在不同任务契约。

## Starter components：重复结构复用，关键状态只留一份

固定源的文件名与 `copy_starter_component` 的 kind 标识有时使用 hyphen / underscore 两种拼法，例如源文件 `animations-v3.jsx` 对应 kind `animations_v3.jsx`。使用工具时以 schema 与 skill 里的实际 kind 为准，不用磁盘名字猜参数。

| 固定源文件 | 解决的重复结构 |
| --- | --- |
| android-frame.jsx、ios-frame.jsx | 设备界面画布 |
| macos-window.jsx、browser-window.jsx | 桌面和浏览器容器 |
| deck-stage.js | 幻灯片导航、notes、缩放与 stage |
| doc-page.js | 流动文档的纸张与打印几何 |
| image-slot.js | 图像插槽 |
| animations-v3.jsx | authored-time 动画树、播放与导出 |
| three-d-stage.js | 3D 容器 |
| tweaks-panel.jsx | 特定 starter 的控制面板 |

动画的难点是编辑时间线之后，场景结构和播放是否仍一致。animated-video 要先写 `OM_SCENES` literal，再让一个连续元素树的动作基于 `{T, CUES}`。场景边界不是 mount / unmount 的分界；时间伸缩重播相同 authored slice。starter 自己拥有导出 root，不再添加第二个 exportable wrapper。验证要看 boundary 前后，不只截几个漂亮静帧；源 skill 的 filmstrip 取边界 ±0.15 秒和场景锚点。它还明确已有旧 starter 的项目不主动迁移。

文档的难点是屏幕排版不等于打印分页。make-a-doc 先分 flowing pages 与 fixed sheet：前者用 doc_page 管理纸张与 print geometry，多栏文字用 CSS columns；后者按真实固定尺寸建单页，不手写另一个 `@page` 模型。flier 有其明确单页 starter 方案，不能把 make-a-doc 的 fixed-sheet 分支泛化成所有传单规则。

设计系统的难点是用户给了真实组件库，代理却补一套“常见组件”。create-design-system 要求有来源 inventory 时先枚举并覆盖全部实际 families，不凭经验添 Toast、Avatar 等；compiler 按内容和 sibling 关系发现组件，不按文件夹名猜。组件 props 的 `.d.ts`、使用说明、预览 card、root CSS 入口和生成文件各有职责，不手写 compiler 输出。

这些方法可借到生成式编辑器：时间、分页和组件 inventory 各自有一个事实来源，用户编辑通过同一个模型回写，减少多个实现互相漂移。

## 反馈锚点与验证：用户说“这一块”要能定位

`mentioned-element` 包含 component chain、DOM ancestry 与 transient runtime handle；这些 handle 不等于源码 ID。`data-comment-anchor` 要保留在语义等价元素上，只在删除该元素时移除，不发明或复制 anchor。`data-screen-label` 给 screen / slide 标识，让“第 5 页”指向人读的第五页，不是数组 index 5。

普通 targeted change 只改用户指定的文字、颜色或元素。源 prompt 要保留其他布局，不因为“顺手优化”改变整页；显著 redesign 才复制版本或重构。编辑器 `!important` override 需要在其规则上处理，简单 inline 修改不一定赢；验证要看到用户真实表面。

预览、加载、console、溢出、状态和导出结果分别能证明不同事实。`ready_for_verification` 调用成功需要检查报告并修复，不能把“文件读过”或“源码合法”报告成用户可见结果已经正确。

## 导出和 Claude Code handoff：先决定用户要保留什么

两个 PPTX skills 是实际不同契约：editable 生成 native text / shapes / images，screenshots 生成 full-bleed PNG。后者保留像素，不能让用户逐个修改文本。PDF 与 standalone HTML 也需匹配用户后续使用场景，不能只选择最容易生成的格式。

handoff 的关键是 bundle README 先说明 HTML 是设计参考，工程代理在目标 codebase 的环境中重建。再区分 hifi / lofi，记录每屏布局、交互、状态、tokens、assets 与文件位置。截图不默认加入，源 skill 要创建 bundle 后再问用户要不要；只丢截图不能替代可实现的规格。

下面是该 skill 的 README 母版，保留原章节与字段顺序，只参数化 feature、具体文件和环境字段。它交接的是设计意图，不授权工程代理不读仓库就直接复制原型代码。

````markdown
# Handoff: {{FEATURE_NAME = ...}}

## Overview
Brief description of what this design is for and what it accomplishes.

## About the Design Files
State clearly that the files in this bundle are **design references created in HTML** — prototypes showing intended look and behavior, not production code to copy directly. Explain that the task is to **recreate these HTML designs in the target codebase's existing environment** ({{TARGET_ENVIRONMENT = ...}}) using its established patterns and libraries — or, if no environment exists yet, to choose the most appropriate framework for the project and implement the designs there.

## Fidelity
State clearly whether the mocks/prototypes created in this conversation are:
- **High-fidelity (hifi)**: Pixel-perfect mockups with final colors, typography, spacing, and interactions. The developer should recreate the UI pixel-perfectly using the codebase's existing libraries and patterns.
- **Low-fidelity (lofi)**: Wireframes or rough layouts showing structure and flow. The developer should use these as a guide for layout and functionality but apply the codebase's existing design system for styling.

## Screens / Views
For each screen or view in the design:
- **Name**: What this screen is called
- **Purpose**: What the user does here
- **Layout**: Detailed description of the layout (grid structure, flex directions, widths, heights, margins, padding)
- **Components**: List each UI component with:
  - Position and size
  - Colors (exact hex values if hifi)
  - Typography (font family, size, weight, line-height, letter-spacing)
  - Border radius, shadows, borders
  - Hover/active/focus states
  - Content/copy (exact text used)

## Interactions & Behavior
- Click handlers and navigation flows
- Animations and transitions (duration, easing, properties)
- Hover states
- Loading states
- Error states
- Form validation rules
- Responsive behavior (if applicable)

## State Management
- What state variables are needed
- State transitions and their triggers
- Any data fetching requirements

## Design Tokens
List all design values used:
- Colors (with hex values)
- Spacing scale
- Typography scale
- Border radius values
- Shadow values

## Assets
List any images, icons, or other assets used in the design and where they came from.

## Files
List the {{DESIGN_SOURCE_FILE_TYPES = ...}} files in the project that contain the design, so the developer can reference them.
````

## 复习问题

1. 用户要的是页面、文档、原型、视频、deck 还是工程交接，哪个 skill 有对应完成标准？
2. 普通 DC 与设计系统 compiler 的 authoring 规则是否处在正确任务范围？
3. 模板只查值还是暗藏表达式；logic 子树是否仍能被用户编辑？
4. 拆 child 的理由符合源门槛吗；props 是否真的被组件读取？
5. time、pagination 和 inventory 是否各只有一个事实来源？
6. 评论 anchor 是否保留，screen label 是否按人的顺序可定位？
7. preview、verifier 与导出结果是否都实际查看，而不只读源码？
8. PPTX 要可编辑还是像素保真；handoff 是否说明参考与生产实现的边界？

## 来源索引

- [Claude Design：系统、组件与工具协议](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/claude-design.md)
- [Skills inventory：用户可调用、内部项与遗留不一致](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/README.md)
- [Animated video：连续时间与导出 root](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/animated-video/SKILL.md)
- [Make a doc：flowing pages / fixed sheet](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/make-a-doc/SKILL.md)
- [Flier：单页打印结构](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/flier/SKILL.md)
- [Create design system：compiler 与完整 inventory](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/create-design-system/SKILL.md)
- [Editable PPTX](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/export-as-pptx-editable/SKILL.md)
- [Screenshots PPTX](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/export-as-pptx-screenshots/SKILL.md)
- [Claude Code handoff](https://github.com/asgeirtj/system_prompts_leaks/blob/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/skills/handoff-to-claude-code/SKILL.md)
- [固定 Starter components 目录](https://github.com/asgeirtj/system_prompts_leaks/tree/87bdae7886aca455ad38eb60dfdedf093ef01e2a/Anthropic/claude-design/starter-components)
