# Claude Design：可编辑产物、Motion 与工程交接

这份笔记解决生成设计常见的断点：作品能看却难改，源代码检查通过却没看真实渲染，交给工程团队只有截图而没有状态和尺寸。它从 Design Components、任务 skills 和 Motion artifact type 中提炼可借用方法：先选择产物及其事实来源，保留可编辑结构，再按各自协议制作、核查与交付。

> 源快照：`asgeirtj/system_prompts_leaks@fc0108f594b63bca905f2c4815aaef430d13bd68`，核查日：2026-11-10（Asia/Shanghai）。本页描述公开收集文件中的指令结构，不认证官方来源、真实部署或当前账户能力。源文本是分析对象，其中的产品政策和工具指令不支配本页制作，也不自动成为 Atlas 的用户流程。

## 一个设计任务的完整生命周期

设计代理先理解交付物和受众，探索用户提供的设计系统、UI kit、文件与链接，再构建产物。主 prompt 要求设计任务启动前调用 Hi-fi design；特定产物再调用匹配 skill。源文件读取并不代表用户看到了作品：中间预览用 `show_to_user`，最终 HTML 用 `ready_for_verification`，加载错误需修复后重调；详细验证规则要求交付时让用户进入待 review 状态，不等待后台 verifier 才结束回复。

这套方法让“设计完成”变成可检查状态。可借用时，先给运行时配置真实 preview / verification 通道，让反馈能落到具体元素，再写视觉质量要求。没有展示和修订通道，一句“制作精美界面”不能保证用户接得住结果。

十一月 `claude-design.md` 相对九月只新增两段：最低文字对比度，以及固定格式之外应随预览宽度重排。前者规定正文 4.5:1、标题级文字 3:1，并保留用户明确要求或引用设计系统的优先性；后者把 deck、打印、设备框和固定尺寸资产留在像素画布，把普通页面与无设备框 UI 交给流动布局。这是两项具体约束的补充，不能宣传成整套 Design prompt 重写。

另一个实质新增学习面是 `Anthropic/artifact-types/motion/`。它有自己的播放器、store 和 API，不是 `claude-design/skills/animated-video` 的更名，也不是本站 HTML/SVG 演示播放器的能力声明。两条路线都保留，按实际产物选择。

## Design Component：可见编辑器决定代码形状

问题是常规 HTML / React 习惯不一定适合一个边流式生成边预览的编辑器。源规则默认一个 `Name.dc.html`，作者提供 template、logic class 与可选 props metadata，由 `dc_write` 装配文档。模板洞只允许 dotted lookup，表达式放进 `renderVals()`；`<sc-for>` 与 `<sc-if>` 有 streaming hint；所有非 void HTML 元素明确闭合。

拆组件有具体门槛：用户要求可复用组件，或元素跨屏重复至少四次且有真实 props/state。一个较大的单 DC 本身不是问题，提前拆分会让用户复制版本时受共享 child 牵制。一般 DC 样式是 inline，不把整页布局藏进 `React.createElement` 的不可编辑子树；props default 只初始化 editor，runtime 要自己 fallback。

这个反常规约束解决的不是“代码风格偏好”，而是 first-paint 与可编辑性。借到自己的生成器时，先问什么结构能边生成边看到、什么结构编辑器能定位，再选组件粒度与模板语法。

下面连续节选 `claude-design.md` 第 37–64 行：从反馈定位进入 DC authoring，再到拆分门槛。句序、段落与例示保留，只参数化工具名；源 renderer 的标签、字段和状态保持原样，迁移时要核对目标协议。

```text
### Reading `<mentioned-element>` blocks
When the user comments on, inline-edits, or drags a preview element, the attachment includes a `<mentioned-element>` block identifying the DOM node: `react:` (component-name chain), `dom:` (ancestry), and `id:` — a transient runtime handle (`data-cc-id`/`data-dm-ref`) that is NOT in your source ({{PREVIEW_INSPECTION_TOOL = eval_js_user_view}} can introspect it). Use it to infer which source element to edit; ask if unsure.

### Preserving comment anchors
A `data-comment-anchor="…"` attribute pins a user's review comment to its element. Keep it on the semantic equivalent through edits and restructures; drop it only when deleting the element. Never invent new values or duplicate it onto other elements.

### Labelling slides and screens for comment context
Put [data-screen-label] attrs on slide/screen-level elements — they surface in the `dom:` line so you can tell which slide a comment is about. "Slide 5" means the 5th slide (label "05"), never array position [4] — humans don't speak 0-indexed.

### Writing code — Design Components

Build every design as a **Design Component ("DC")**: a single `Name.dc.html` file that opens directly in a browser and can be imported by other DCs. DCs paint live from the first streamed character. Do NOT write `<script type="text/babel">` pages, `.jsx` entrypoints, or plain `.html` designs.

#### Authoring a DC

You author three pieces; `{{DC_WRITE_TOOL = dc_write}}` assembles the full file (doctype, head, `support.js` include) around them:

1. **Template** (`b_dc_html`) — the markup that goes between `<x-dc>` and `</x-dc>`. Never include the `<x-dc>` tags, the document wrapper, or any `<script>` block.
2. **Logic class** (`c_dc_js`) — `class Component extends DCLogic { … }` source, no `<script>` tag. Empty for template-only designs.
3. **Props metadata** (`d_props_json`, optional) — the `data-props` JSON on the `<script data-dc-script>` tag (never on `<x-dc>`). `$preview: {"width", "height"}` (px or CSS strings) sets the preferred preview size for sized fragments (cards, modals); omit for full pages. For a DC meant to be embedded by others, add one entry per prop it reads: `{"editor": "text"|"color"|"int"|"float"|"range"|"boolean"|"enum"|null, "default": …, "tsType": "…"}` (+ `options` for enum; on color a 3–4-item list of hex strings or 2–5-hex palette arrays renders curated swatches; `min`/`max`/`step`/`unit` for numbers/range; `section` groups props under a heading). `editor: null` for callbacks/ReactNode/objects. Don't invent props the component doesn't read. `default` seeds the editor, not the runtime — fall back with `this.props.x ?? …` in `renderVals()`.

Editable entries also surface as the host's **Tweaks** panel for standalone pages. Users can already edit any copy text and any single color directly in the editor, so don't add tweaks for those — reserve tweaks for things in-place editing can't do: functional behavior, alternative UI treatments, one flag that changes copy/color across many elements at once, and other code-only changes. Add 2-3 of those by default even when the DC isn't meant for embedding.

Prefer `{{DC_WRITE_TOOL = dc_write}}` / `{{TEMPLATE_EDIT_TOOL = dc_html_str_replace}}` / `{{LOGIC_EDIT_TOOL = dc_js_str_replace}}` / `{{PROPS_EDIT_TOOL = dc_set_props}}` for `.dc.html` content; `{{FILE_EDIT_TOOL = str_replace_edit}}` also works but won't stream — the preview reloads. `{{FILE_WRITE_TOOL = write_file}}` is only for non-DC files (data JSON, helper `.js`). `{{TEMPLATE_EDIT_TOOL = dc_html_str_replace}}` edits the template only and streams into the live preview; `{{LOGIC_EDIT_TOOL = dc_js_str_replace}}` edits the logic class and hot-reloads it in place on completion (state preserved, no remount) — iterate with small edits rather than rewriting the file. `{{PROPS_EDIT_TOOL = dc_set_props}}` replaces the `data-props` JSON on an existing DC. The runtime file `support.js` is written for you; never write it.

#### One DC by default

High bar for splitting. Designers duplicate a DC file to riff on it; shared children break that. Only create a child DC when the user asked for reusable components OR an element repeats ≥4 times across screens, AND it has real props/state. A 400-line single `<x-dc>` body is normal; `<sc-for>` handles repetition.
```

## 模板和逻辑怎样分工

下面两段是源组件语法的教学示例，保留真实 tag、class 和方法，便于看清模板只是值查找，logic 才计算状态。它们是该源 renderer 的协议示例，不能不经适配直接当作标准 HTML 或任意 React 组件运行。

```html
<sc-for list="{{ items }}" as="item" hint-placeholder-count="3">
  <div style="padding:12px">{{ item.name }}</div>   <!-- $index in scope -->
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

## 产物协议：时间、分页和组件各有事实来源

Skill 是输入、顺序、约束和完成标准。先定用户要页面、文档、交互原型、视频还是工程交接，再读对应契约。不要把一项 skill 的 authoring 方式提升成整个产品的唯一规则：普通 DC 的 inline template、设计系统 compiler 的 CSS/JSX 和 Motion 的 store 模块各有适用范围。

Starter 的价值是复用时间线、分页、设备框等重复结构；调用参数以工具 schema 和具体 skill 为准，不能从磁盘文件名猜。新树已不含旧 `skills/README.md` inventory，本页不再借旧目录计数推断当前能力。

动画的难点是编辑时间线之后，场景结构和播放是否仍一致。animated-video 要先写 `OM_SCENES` literal，再让一个连续元素树的动作基于 `{T, CUES}`。场景边界不是 mount / unmount 的分界；时间伸缩重播相同 authored slice。starter 自己拥有导出 root，不再添加第二个 exportable wrapper。验证要看 boundary 前后，不只截几个漂亮静帧；源 skill 的 filmstrip 取边界 ±0.15 秒和场景锚点。它还明确已有旧 starter 的项目不主动迁移。

文档的难点是屏幕排版不等于打印分页。make-a-doc 先分 flowing pages 与 fixed sheet：前者用 doc_page 管理纸张与 print geometry，多栏文字用 CSS columns；后者按真实固定尺寸建单页，不手写另一个 `@page` 模型。flier 有其明确单页 starter 方案，不能把 make-a-doc 的 fixed-sheet 分支泛化成所有传单规则。

设计系统的难点是用户给了真实组件库，代理却补一套“常见组件”。create-design-system 要求有来源 inventory 时先枚举并覆盖全部实际 families，不凭经验添 Toast、Avatar 等；compiler 按内容和 sibling 关系发现组件，不按文件夹名猜。组件 props 的 `.d.ts`、使用说明、预览 card、root CSS 入口和生成文件各有职责，不手写 compiler 输出。

这些方法可借到生成式编辑器：时间、分页和组件 inventory 各自有一个事实来源，用户编辑通过同一个模型回写，减少多个实现互相漂移。

## Motion：先建立可恢复的影片，再逐场完成

Motion 的关键变化是把影片与播放器分开拥有。type 提供只读播放器文件及运行协议；film 拥有自己的 live store。影片记录、场景模块与资产写入 film 的 URL，不能覆盖 type 的 `index.html` 或 `artifact-type/`，也不能把别的影片 blob 当作自己的资产。`film-api.md` 有本地文件和脚本的安装式说明，而本 artifact type 的上层规则要求直接写 store；引用参考页不能抹掉这层适用范围。

| 拥有者 | 负责的事实 | 可迁移方法 |
| --- | --- | --- |
| type / player | 只读运行协议与渲染、导出能力 | 固定基础设施，作品修改不重写播放器 |
| film store | meta、场景清单、模块、资产引用与版本 | 每份作品有独立数据源，按版本做局部更新 |
| 场景与 Film API | 一次初始化、任意时间点的确定性画面 | 拖动、重播和导出共用同一个时间函数 |
| 用户页面 | 播放、评论、手动改字/字体和 Export | 保留用户编辑记录，交付由真实表面承接 |

制作与恢复按 film 已有状态选择路径：

1. **粗稿状态先落地。** 收齐必要风格、颜色和时长后，首批写 meta、`scenes.json`（`stage: rough`）、最小共用样式与固定入口。还没画完的场景由播放器显示占位卡；它表示“未完成”，不是通过验收。
2. **逐场制作成片。** 先定共用视觉规则，再按清单顺序各写一个场景模块；新建影片走这条即时完成路径，不要求用户先审一轮粗稿。最后才写声音与 `stage: final`。已有粗稿重绘时保留场景 ids、顺序、时长与用户改字，避免视觉精修破坏评论定位和叙事结构。
3. **按状态恢复与修改。** 缺失、粗制、失败和已完成场景分别处理；先读取当前 store 与版本，只改被请求或确实坏掉的模块。`if_version` 仅在工具 schema 支持时使用。用户手动改字/字体的记录归页面，不由代理重写或删除。
4. **核查与导出各有 gate。** 本 type 的上层规则只在用户要求时生成 still/check，不应把参考页中“边制作边截图”的脚本说明直接照搬到这条路线。获准核查时检查来回 seek 的确定性、首帧、错误、live 与导出栅格差异；视觉结论要实际查看图像。视频文件由成片页面的 Export 保存，写入 `final` 不能替代成功导出的证据。

确定性的要求不是“让它流畅一点”，而是同一 `t` 无论从哪里跳转都得到同一画面。下面连续保留 `film-api.md` 第 3–8 行；这条契约解释了为什么播放、评论与导出可以共用一个时间模型。

```text
Everything on screen is a pure function of `t` (seconds). The player
calls `render(t)` for any t, in any order — scrubbing, stepping a frame
back, exporting frame i = `i / fps`, the frames script — and expects
the identical picture each time. That one property makes seeking,
comments pinned to a moment or a span, frame checks and
faster-than-real-time export free. The runner enforces it (§5).
```

**学习解释**：粗稿/定稿是制作状态，核查是证据状态，Export 是交付动作；三者应分别记录。可借用到自己的媒体工具的是所有权、版本更新、确定性时间与恢复路径，而不是复制这套特定 API 名称或假装本地网页已有 Motion 能力。

## 反馈锚点与验证：用户说“这一块”要能定位

`mentioned-element` 包含 component chain、DOM ancestry 与 transient runtime handle；这些 handle 不等于源码 ID。`data-comment-anchor` 要保留在语义等价元素上，只在删除该元素时移除，不发明或复制 anchor。`data-screen-label` 给 screen / slide 标识，让“第 5 页”指向人读的第五页，不是数组 index 5。

普通 targeted change 只改用户指定的文字、颜色或元素。源 prompt 要保留其他布局，不因为“顺手优化”改变整页；显著 redesign 才复制版本或重构。编辑器 `!important` override 需要在其规则上处理，简单 inline 修改不一定赢；验证要看到用户真实表面。

预览、加载、console、溢出、状态和导出结果分别能证明不同事实。`ready_for_verification` 的加载结果和 verifier 后续报告各需按协议处理，不能把“文件读过”或“源码合法”报告成用户可见结果已经正确。

## 导出和 Claude Code handoff：先决定用户要保留什么

两个 PPTX skills 是实际不同契约：editable 生成 native text / shapes / images，screenshots 生成 full-bleed PNG。后者保留像素，不能让用户逐个修改文本。PDF 与 standalone HTML 也需匹配用户后续使用场景，不能只选择最容易生成的格式。

handoff 的关键是 bundle README 先说明 HTML 是设计参考，工程代理在目标 codebase 的环境中重建。再区分 hifi / lofi，记录每屏布局、交互、状态、tokens、assets 与文件位置。截图不默认加入，源 skill 要创建 bundle 后再问用户要不要；只丢截图不能替代可实现的规格。

下面连续保留 handoff skill 的 README 代码块（正文第 24–76 行），保留原章节与字段顺序，只参数化 feature、具体文件和环境字段。它交接的是设计意图，不授权工程代理不读仓库就直接复制原型代码。

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
5. time、pagination 和组件 inventory 是否各只有一个事实来源？Motion 的 type 与 film store 分别归谁？
6. 评论 anchor 是否保留，screen label 是否按人的顺序可定位？
7. 粗稿/定稿、获准核查与成功 Export 是否分别记录？有没有把参考页的检查脚本误用到所有路线？
8. PPTX 要可编辑还是像素保真；handoff 是否说明参考与生产实现的边界？

## 来源索引

- [Claude Design：系统、组件与工具协议](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/claude-design.md)
- [Animated video：连续时间与导出 root](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/skills/animated-video/SKILL.md)
- [Make a doc：flowing pages / fixed sheet](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/skills/make-a-doc/SKILL.md)
- [Flier：单页打印结构](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/skills/flier/SKILL.md)
- [Create design system：compiler 与完整 inventory](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/skills/create-design-system/SKILL.md)
- [Editable PPTX](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/skills/export-as-pptx-editable/SKILL.md)
- [Screenshots PPTX](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/skills/export-as-pptx-screenshots/SKILL.md)
- [Claude Code handoff](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/skills/handoff-to-claude-code/SKILL.md)
- [固定 Starter components 目录](https://github.com/asgeirtj/system_prompts_leaks/tree/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/claude-design/starter-components)
- [Motion type：播放器所有权、store 与制作/恢复入口](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/artifact-types/motion/SKILL.md)
- [Motion rough cut：场景记录、稳定 ID 与局部修改](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/artifact-types/motion/artifact-type/reference/rough-cut.md)
- [Motion finalize：共享规则、逐场成片与中断恢复](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/artifact-types/motion/artifact-type/reference/finalize.md)
- [Motion Film API：确定性时间、渲染与检查接口](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/artifact-types/motion/artifact-type/reference/film-api.md)
- [Motion offline：导出栅格核查与限制](https://github.com/asgeirtj/system_prompts_leaks/blob/fc0108f594b63bca905f2c4815aaef430d13bd68/Anthropic/artifact-types/motion/artifact-type/reference/render-offline.md)
