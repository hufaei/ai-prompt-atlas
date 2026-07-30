# AI Prompt Atlas 2026-07-30 Current Snapshot Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an eight-card, source-pinned AI Prompt Atlas snapshot with updated source-shaped notes, eight current learning maps, stable routes, and a verified GitHub Pages deployment.

**Architecture:** Keep the existing dependency-light static reader: `docs/index.html` owns the catalog and rendering, `notes/<slug>/README.md` owns article content, and `docs/assets/mindmaps/<slug>.png` owns each visual summary. The Pages workflow copies these inputs into route directories; one legacy Sonnet route is generated from the same reader and redirected client-side to the stable route.

**Tech Stack:** Static HTML/CSS/JavaScript, Markdown rendered by marked, Python `unittest`, PNG learning maps, GitHub Actions Pages.

## Global Constraints

- Pin every note to `asgeirtj/system_prompts_leaks@1e828287e8290a9ba175349689dc4d5aaa4bbc94` dated 2026-07-30.
- Present current understanding, not a commit-by-commit changelog.
- Maintain exactly eight cards: two OpenAI, four Anthropic, xAI, and Google.
- Preserve source-shaped reusable templates and replace product-specific values with `{{FIELD = ...}}` slots.
- Preserve the existing warm editorial style and map-before-article reading order.
- Every mind map is a valid 1600×900 PNG and is visually checked for legibility.
- Preserve the old `claude-sonnet-5-claude-code-2.1.207` URL via redirect.
- Push `main` and verify the public GitHub Pages deployment.

---

## File Map

- `tests/test_site.py`: executable catalog, content, image, route, and build contract.
- `notes/<slug>/README.md`: one independently readable source-grounded learning note.
- `docs/assets/mindmaps/<slug>.png`: the 16:9 visual retrieval aid for a note.
- `docs/index.html`: site styles, eight-note catalog, grouped homepage, detail reader, and legacy redirect.
- `.github/workflows/pages.yml`: static artifact construction including legacy route creation.
- `README.md`: repository purpose, eight-note catalog, snapshot boundary, and public URL.

---

### Task 1: Define the Eight-Note Snapshot Contract

**Files:**
- Modify: `tests/test_site.py`

**Interfaces:**
- Consumes: the existing `catalog_slugs()`, `png_dimensions()`, and `reusable_prompt()` helpers.
- Produces: `EXPECTED_SLUGS`, `LEGACY_ROUTES`, and snapshot assertions used by all later tasks.

- [ ] **Step 1: Change the catalog and snapshot constants**

```python
SNAPSHOT = "1e828287e8290a9ba175349689dc4d5aaa4bbc94"
EXPECTED_SLUGS = {
    "gpt-5.6-codex-runtime",
    "gpt-5.5-prompt-framework",
    "claude-sonnet-5-claude-code",
    "claude-fable-5-claude-code-prompt-framework",
    "claude-opus-5-claude-code",
    "claude-design-skills",
    "grok-prompt-evolution",
    "gemini-prompt-family",
}
LEGACY_ROUTES = {
    "claude-sonnet-5-claude-code-2.1.207": "claude-sonnet-5-claude-code",
}
```

- [ ] **Step 2: Replace the six-note and partial-image assertions**

Require exactly eight catalog items; one `family`, `group`, `badge`,
`snapshot`, `learningPath`, Markdown payload, and 1600×900 PNG per slug.
Require the homepage strings `Learning Snapshot · 2026-07-30`,
`8 份学习图谱`, and `固定来源快照`. Require the old slug to appear only in
the legacy route map, not in the note catalog.

```python
def test_catalog_contains_exactly_the_eight_learning_notes(self):
    self.assertEqual(catalog_slugs(), EXPECTED_SLUGS)

def test_every_mindmap_is_exactly_1600_by_900(self):
    for slug in EXPECTED_SLUGS:
        self.assertEqual(
            png_dimensions(ROOT / "docs" / "assets" / "mindmaps" / f"{slug}.png"),
            (1600, 900),
        )
```

- [ ] **Step 3: Add source-shaped markers for the two new notes**

```python
self.assert_source_shaped_template(
    "claude-opus-5-claude-code",
    (
        "# Assistant behavior layer",
        "## Memory filesystem",
        "# Coding runtime layer",
        "## Harness and delivery",
        "## Agents and skills",
        "## Tool contract",
    ),
    minimum_slots=14,
)
self.assert_source_shaped_template(
    "claude-design-skills",
    (
        "# Design agent",
        "## Workflow",
        "## Design Components",
        "## Skill routing",
        "## Starter components",
        "## Verification and handoff",
    ),
    minimum_slots=12,
)
```

- [ ] **Step 4: Extend the build simulation with the legacy route**

After copying current note routes, copy `docs/index.html` to
`_site/notes/claude-sonnet-5-claude-code-2.1.207/index.html`. Assert that the
legacy route exists and that its target stable route exists.

- [ ] **Step 5: Run tests to verify the new contract fails**

Run: `python3 -m unittest discover -s tests -v`

Expected: failures identify the two missing notes, the renamed Sonnet route,
the old snapshot hash, missing catalog grouping metadata, and stale maps.

- [ ] **Step 6: Commit the failing contract**

```bash
git add tests/test_site.py
git commit -m "test: define 2026-07-30 atlas snapshot"
```

---

### Task 2: Refresh the OpenAI Learning Notes

**Files:**
- Modify: `notes/gpt-5.6-codex-runtime/README.md`
- Modify: `notes/gpt-5.5-prompt-framework/README.md`

**Interfaces:**
- Consumes: immutable upstream blobs under the global snapshot.
- Produces: current OpenAI articles with the unchanged learning contract and reusable-template markers required by Task 1.

- [ ] **Step 1: Refresh GPT-5.6 / Codex Runtime**

Use these source files:

```text
OpenAI/Codex/gpt-5.6.md
OpenAI/Codex/gpt-5.6-sol.md
OpenAI/Codex/codex-full.md
OpenAI/Codex/codex-desktop-realtime-voice-agent.md
```

Keep the existing framework template and integrate:

```markdown
## 当前运行时的四层结构
1. Model behavior：Personality、写作、commentary/final 与自治边界。
2. Action safety：Terra/Luna 与 Sol 各自明确 destructive actions。
3. Runtime composition：apps、tools、skills、browser/computer 与工作区状态。
4. Voice companion：实时语音代理负责短反馈和动作路由，主代理负责执行。
```

Add fixed blob links for all four files and update every old snapshot reference.

- [ ] **Step 2: Refresh GPT-5.5 Prompt Framework**

Use `OpenAI/gpt-5.5-instant.md` together with the existing Codex/base sources.
Preserve the current source-shaped template and add:

```markdown
## Instant 产品层：框架如何接入真实数据与富响应
- personal_context 是用户上下文的事实入口，不应靠模型猜测。
- file_search 是用户文件的 source of truth。
- Model Response Spec 约束图片组、实体、URL 引用和富响应元素。
- web、python、automations、file_search 与连接器以完整工具契约注入。
```

Distinguish reusable framework structure from product-specific tool inventory.

- [ ] **Step 3: Run the OpenAI template tests**

Run:

```bash
python3 -m unittest \
  tests.test_site.SiteContractTests.test_openai_notes_use_source_shaped_parameterized_prompts \
  tests.test_site.SiteContractTests.test_every_note_preserves_the_learning_contract -v
```

Expected: template-marker assertions pass for the two OpenAI notes; the
all-notes contract may still report missing later-task notes.

- [ ] **Step 4: Commit the OpenAI refresh**

```bash
git add notes/gpt-5.6-codex-runtime/README.md notes/gpt-5.5-prompt-framework/README.md
git commit -m "docs: refresh OpenAI runtime notes"
```

---

### Task 3: Refresh and Expand the Anthropic Learning Notes

**Files:**
- Move: `notes/claude-sonnet-5-claude-code-2.1.207/README.md` → `notes/claude-sonnet-5-claude-code/README.md`
- Modify: `notes/claude-sonnet-5-claude-code/README.md`
- Modify: `notes/claude-fable-5-claude-code-prompt-framework/README.md`
- Create: `notes/claude-opus-5-claude-code/README.md`
- Create: `notes/claude-design-skills/README.md`

**Interfaces:**
- Consumes: the current Claude.ai, Claude Code, Claude Design, skill, and starter-component files at the global snapshot.
- Produces: four Anthropic notes with stable topics and source-shaped reusable templates.

- [ ] **Step 1: Rename and refresh the Sonnet note**

Use `Anthropic/Claude Code/claude-code-sonnet-5.md` as the coding-runtime source
and retain the existing Sonnet assistant-layer sources where still current.
Replace version-history emphasis with this current model:

```markdown
## 当前两层模型
| 层 | 重点 |
| --- | --- |
| Claude assistant behavior | 身份、语气、事实检索、安全、用户数据边界 |
| Claude Code runtime | Doing tasks、action care、auto memory、scratchpad、context、agents、skills、tools |
```

Preserve the parameterized template's original ordering while adding slots for
memory taxonomy, scratchpad directory, agent registry, skill registry, and tool
contracts.

- [ ] **Step 2: Refresh the Fable engineering baseline**

Use:

```text
Anthropic/claude-fable-5.md
Anthropic/Claude Code/claude-code-fable-5.md
```

Integrate the July 24 Claude.ai memory filesystem and the current Claude Code
harness, scratchpad, cron, DesignSync, Git, context, and delivery rules. Keep
the note centered on repeatable engineering execution.

- [ ] **Step 3: Add Claude Opus 5 / Claude Code**

Use:

```text
Anthropic/claude-opus-5.md
Anthropic/Claude Code/claude-code-opus-5.md
```

Write the note in this order:

```markdown
# Claude Opus 5 / Claude Code Notes
## 快照边界
## 一句话核心
## 两个表面：Claude.ai 与 Claude Code
## Assistant behavior：默认立场、语气、安全与记忆
## Claude Code：Harness、交付、纠错、上下文与工具
## Agents、Skills 与工具注册表
## 原文式可复用模板：Opus Assistant + Coding Runtime
## 和 Sonnet 5、Fable 5 的学习侧重点
## 复习问题
## 来源索引
```

The reusable template contains at least fourteen named `{{FIELD = ...}}` slots
and the six exact source-shaped marker headings in Task 1.

- [ ] **Step 4: Add Claude Design Skills**

Use:

```text
Anthropic/claude-design.md
Anthropic/Claude Design/Skills/*.md
Anthropic/Claude Design/Starter components/*
```

Write the note in this order:

```markdown
# Claude Design Skills Notes
## 快照边界
## 一句话核心
## 设计代理的工作流
## Design Components：结构、逻辑与反模式
## Skills：按交付物路由能力
## Starter components：把常见画布抽成积木
## Verification：预览、反馈锚点与 Claude Code handoff
## 原文式可复用模板：Design Agent Runtime
## 可直接复用的项目清单
## 复习问题
## 来源索引
```

The template exposes slots for deliverable, canvas, component, data,
interaction, skill, starter component, verification, handoff, and output.

- [ ] **Step 5: Run the Anthropic tests**

Run:

```bash
python3 -m unittest \
  tests.test_site.SiteContractTests.test_anthropic_notes_use_source_shaped_parameterized_prompts \
  tests.test_site.SiteContractTests.test_every_note_preserves_the_learning_contract -v
```

Expected: all Anthropic template and learning-contract assertions pass.

- [ ] **Step 6: Commit the Anthropic refresh**

```bash
git add notes/claude-sonnet-5-claude-code \
  notes/claude-fable-5-claude-code-prompt-framework \
  notes/claude-opus-5-claude-code \
  notes/claude-design-skills
git add -u notes/claude-sonnet-5-claude-code-2.1.207
git commit -m "docs: refresh Anthropic system notes"
```

---

### Task 4: Refresh Grok and Gemini Family Notes

**Files:**
- Modify: `notes/grok-prompt-evolution/README.md`
- Modify: `notes/gemini-prompt-family/README.md`

**Interfaces:**
- Consumes: `xAI/grok-4.5.md`, `xAI/grok-build.md`, and `Google/gemini-3.5-flash.md` at the global snapshot.
- Produces: current xAI and Google family notes without losing their existing reusable templates.

- [ ] **Step 1: Extend Grok Prompt Evolution through 4.5**

Replace the current terminal version with:

```markdown
### Grok 4.5：产品工具、连接器、记忆与沙箱合流
- X keyword/semantic/user/thread/video tools remain first-class routes.
- search_connected_tools and call_connected_tool form a two-step connector gate.
- image generation/editing has a tool-vs-render routing distinction.
- edit_memory and injected user memory make personalization an explicit layer.
- read/edit/write/bash, render components, and skills complete the runtime.
```

Keep the evolution overview, but make the reusable template follow the actual
4.5 section order: base behavior, environment, context, tools, render
components, skills, user info, and memory.

- [ ] **Step 2: Refresh Gemini 3.5 Flash in the family note**

Integrate the current saved-information and personalization hierarchy, sensitive
data restriction, image-agent relevance gate, image execution rules, and
interactive components. Preserve the Pro/Flash/Nano Banana comparison and the
existing parameterized family template.

- [ ] **Step 3: Run the Grok/Gemini tests**

Run:

```bash
python3 -m unittest \
  tests.test_site.SiteContractTests.test_grok_and_gemini_notes_use_source_shaped_parameterized_prompts \
  tests.test_site.SiteContractTests.test_every_note_preserves_the_learning_contract -v
```

Expected: both source-shaped templates and all six shared note sections pass.

- [ ] **Step 4: Commit the family refresh**

```bash
git add notes/grok-prompt-evolution/README.md notes/gemini-prompt-family/README.md
git commit -m "docs: refresh Grok and Gemini notes"
```

---

### Task 5: Create Eight Current Learning Maps

**Files:**
- Modify: `docs/assets/mindmaps/gpt-5.6-codex-runtime.png`
- Modify: `docs/assets/mindmaps/gpt-5.5-prompt-framework.png`
- Move: `docs/assets/mindmaps/claude-sonnet-5-claude-code-2.1.207.png` → `docs/assets/mindmaps/claude-sonnet-5-claude-code.png`
- Modify: `docs/assets/mindmaps/claude-fable-5-claude-code-prompt-framework.png`
- Create: `docs/assets/mindmaps/claude-opus-5-claude-code.png`
- Create: `docs/assets/mindmaps/claude-design-skills.png`
- Modify: `docs/assets/mindmaps/grok-prompt-evolution.png`
- Modify: `docs/assets/mindmaps/gemini-prompt-family.png`

**Interfaces:**
- Consumes: the final section headings and key claims from Tasks 2–4.
- Produces: eight visually consistent, valid 1600×900 PNG files used by the site catalog.

- [ ] **Step 1: Prepare one exact visual brief per note**

Each brief names the title, thesis, five-to-seven nodes, reuse strip, and memory
hook from the corresponding Markdown. Use this common art direction:

```text
1600×900 Chinese editorial learning map; warm off-white paper; dark navy text;
thin charcoal connectors; restrained blue, teal, amber, coral and violet
section accents; large legible title; generous whitespace; flat vector-like
cards; no logos, gradients, photorealism, decorative filler, or tiny text.
```

- [ ] **Step 2: Generate the eight raster maps**

Use the image generation workflow once per note so each result can be inspected
and retried independently. Save the accepted results to the exact paths above.

- [ ] **Step 3: Inspect all maps**

Check title spelling, Chinese label legibility, node order, source-grounded
claims, whitespace, and absence of invented model capabilities. Regenerate any
map with corrupted labels or contradictory wording.

- [ ] **Step 4: Verify the PNG contract**

Run:

```bash
python3 -m unittest \
  tests.test_site.SiteContractTests.test_every_mindmap_is_exactly_1600_by_900 -v
```

Expected: PASS for all eight images.

- [ ] **Step 5: Commit the maps**

```bash
git add docs/assets/mindmaps
git commit -m "feat: refresh atlas learning maps"
```

---

### Task 6: Update the Reader, Routes, Workflow, and Repository Guide

**Files:**
- Modify: `docs/index.html`
- Modify: `.github/workflows/pages.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: the eight slugs and image/note paths produced by Tasks 2–5.
- Produces: grouped homepage, current detail metadata, stable URLs, legacy redirect, and deployable Pages artifact.

- [ ] **Step 1: Replace the note catalog**

Each note object contains:

```javascript
{
  slug: "gpt-5.6-codex-runtime",
  title: "GPT-5.6 / Codex Runtime",
  heading: "GPT-5.6 / Codex Runtime",
  group: "OpenAI runtimes",
  family: "OpenAI · Codex",
  badge: "Agent Runtime",
  snapshot: "源快照 · 2026-07-30",
  meta: "从模型行为、破坏性动作到 Skills、工具与实时语音协作",
  learningPath: "先看行为与授权边界，再沿工具路由走到验证交付。",
  file: "content/gpt-5.6-codex-runtime.md",
  image: "assets/mindmaps/gpt-5.6-codex-runtime.png"
}
```

Create equivalent complete objects for all eight slugs and group them under
`OpenAI runtimes`, `Anthropic systems`, and `Other model families`.

- [ ] **Step 2: Add the homepage snapshot band and grouped card sections**

Render:

```html
<div class="snapshot-band" aria-label="快照信息">
  <span><strong>2026-07-30</strong> 当前快照</span>
  <span><strong>8</strong> 份学习图谱</span>
  <span><strong>Source-pinned</strong> 固定来源快照</span>
</div>
```

Use one `.note-group` section per group with a short Chinese reading cue and
the existing two-column card grid.

- [ ] **Step 3: Add detail learning paths and the legacy redirect**

```javascript
const legacyRoutes = {
  "claude-sonnet-5-claude-code-2.1.207":
    "claude-sonnet-5-claude-code"
};

function redirectLegacyRoute(slug) {
  const target = legacyRoutes[slug];
  if (!target) return false;
  location.replace(`${routeBase()}notes/${target}/`);
  return true;
}
```

Call this before note lookup and render `note.learningPath` beneath the map
caption or detail metadata.

- [ ] **Step 4: Generate the legacy Pages route**

Add this after the current-note copy loop:

```bash
legacy="claude-sonnet-5-claude-code-2.1.207"
mkdir -p "_site/notes/${legacy}"
cp docs/index.html "_site/notes/${legacy}/index.html"
```

- [ ] **Step 5: Refresh README**

Change the repository heading and description to AI Prompt Atlas, list all
eight topics, describe the current-snapshot convention, set the source boundary
to the global snapshot, and preserve the public URL:

`https://hufaei.github.io/ai-prompt-atlas/`.

- [ ] **Step 6: Run the full contract suite**

Run: `python3 -m unittest discover -s tests -v`

Expected: all tests pass.

- [ ] **Step 7: Commit the reader and build changes**

```bash
git add docs/index.html .github/workflows/pages.yml README.md
git commit -m "feat: publish eight-card atlas snapshot"
```

---

### Task 7: Build, Inspect, Push, and Verify GitHub Pages

**Files:**
- Verify: all files changed in Tasks 1–6

**Interfaces:**
- Consumes: a clean local `main` with passing tests.
- Produces: pushed commits and a successful public Pages deployment.

- [ ] **Step 1: Run whitespace, test, and repository checks**

```bash
git diff --check
python3 -m unittest discover -s tests -v
git status --short
```

Expected: no whitespace errors, all tests pass, and only intended tracked
changes remain.

- [ ] **Step 2: Reproduce the Pages build locally**

Run the exact build shell from `.github/workflows/pages.yml` into `_site`.
Verify:

```text
_site/index.html
_site/content/<eight current slugs>.md
_site/notes/<eight current slugs>/index.html
_site/notes/claude-sonnet-5-claude-code-2.1.207/index.html
_site/assets/mindmaps/<eight current slugs>.png
```

- [ ] **Step 3: Inspect desktop and mobile views**

Serve `_site` locally and inspect:

```text
/ai-prompt-atlas/
/ai-prompt-atlas/notes/gpt-5.6-codex-runtime/
/ai-prompt-atlas/notes/claude-opus-5-claude-code/
/ai-prompt-atlas/notes/claude-design-skills/
/ai-prompt-atlas/notes/claude-sonnet-5-claude-code-2.1.207/
```

At 1440×900 and 390×844, confirm grouped cards, snapshot band, readable maps,
Markdown tables/code overflow, home navigation, and legacy redirect.

- [ ] **Step 4: Push the reviewed commit range**

```bash
git status --short
git log --oneline origin/main..HEAD
git push origin main
```

Expected: `main` advances on `hufaei/ai-prompt-atlas`.

- [ ] **Step 5: Monitor deployment**

Use GitHub Actions to monitor `Publish notes to GitHub Pages` for the pushed
head until both build and deploy succeed.

- [ ] **Step 6: Verify public routes**

Open and verify HTTP success plus current visible content at:

```text
https://hufaei.github.io/ai-prompt-atlas/
https://hufaei.github.io/ai-prompt-atlas/notes/claude-opus-5-claude-code/
https://hufaei.github.io/ai-prompt-atlas/notes/claude-design-skills/
https://hufaei.github.io/ai-prompt-atlas/notes/claude-sonnet-5-claude-code/
```

Confirm the old Sonnet URL redirects to the stable route.
