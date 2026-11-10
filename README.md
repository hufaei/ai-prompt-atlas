# AI Prompt Atlas

Source-pinned learning notes for model prompts, agent runtimes, tool contracts, and reusable skills. The public reader combines an animated SVG workflow with a detailed Markdown note for every topic.

Public site:

```text
https://hufaei.github.io/ai-prompt-atlas/
```

## Current Learning Snapshot

The reader curates seven current learning topics. New source captures replace stale versions; overlapping notes are merged around the method they teach rather than retained as a growing model catalog.

- `notes/gpt-5.6-codex-runtime`: persistent execution and evidence-based completion; separate action risk, user authorization, and policy outcomes from output quality.
- `notes/gpt-5.5-prompt-framework`: authoritative sources, retrieval, tool contracts, and Qwen's minimal schema and call-envelope comparison.
- `notes/claude-opus-5-claude-code`: Claude.ai behavior and memory, with Fable 5.2 as a newer sample; distinguish published behavior text, captured context, and tool contracts.
- `notes/claude-fable-5-claude-code-prompt-framework`: Claude Code Fable 5.2, action classification versus Advisor quality review, durable memory, and context recovery.
- `notes/claude-design-skills`: editable design, verification, exports, and engineering handoff; Motion adds a separate rough-cut-to-final-film workflow.
- `notes/grok-prompt-evolution`: CLI, conversation, Build, and Bot; select the execution surface, consume background results, and deliver artifacts the user can actually access.
- `notes/gemini-prompt-family`: Pro/Flash conversation and visual output alongside Antigravity IDE/CLI; distinguish answer presentation from persistent engineering work.

The November review uses `asgeirtj/system_prompts_leaks@fc0108f594b63bca905f2c4815aaef430d13bd68`, reviewed on 2026-11-10 (Asia/Shanghai). Six topics are refreshed against that boundary. Source Routing retains its 2026-09-30 snapshot at `87bdae7886aca455ad38eb60dfdedf093ef01e2a`; explicitly labeled historical excerpts in other notes may also retain that pin. Dates are shown per topic, and each source link is immutable. Captured environment, user preferences, separate tool policies, and general assistant behavior are not interchangeable evidence. These notes do not claim that every captured capability applies to every product account.

Notes explain the problem a rule addresses, the rule present in the source, and how to reuse it. Interpretation and adapted templates are labeled separately. Reusable templates preserve the source's recognizable wording, order, and structure, with specific products, tools, paths, schemas, and variable policies abstracted as `{{FIELD = ...}}` slots.

The separate Sonnet, Qwen, and Meta notes are retired after useful material is merged into the corresponding topics. Their existing Pages URLs redirect to the surviving notes. Stable directory slugs may retain older model names while page titles and contents represent the current topic.

## Workflow Diagrams

The seven diagrams share `docs/assets/flow-atlas.js` and `flow-atlas.css`, with source-grounded nodes and routes in `flows.json`. Note pages play automatically and rotate through normal paths and meaningful branches; selecting a node pauses playback to show its explanation. Hidden or offscreen diagrams pause, and reduced-motion preferences remove the moving tracer. Home cards use static SVG thumbnails from the same data.

## GitHub Pages

The prompt engineering notes can be published as a static GitHub Pages reader. The workflow in `.github/workflows/pages.yml` builds `docs/index.html` and copies every `notes/*/README.md` into the Pages artifact.

In repository settings, set Pages source to **GitHub Actions**. For private repositories, GitHub Pages availability and private site visibility depend on the GitHub plan and organization/enterprise settings.

## Included Codex Skill

The repository also keeps one installable personal Codex skill:

- `prune-merged-worktrees`: audit and clean local Git branches and linked worktrees while preserving branches not merged into a base branch.

Install it from GitHub:

In Codex, install any skill path from this repository:

```text
https://github.com/hufaei/ai-prompt-atlas/tree/main/skills/prune-merged-worktrees
```

After installation, restart Codex so the new skills are discovered.

## One-Step Local Install

From a checkout of this repository:

```powershell
powershell -ExecutionPolicy Bypass -File .\install-my-skills.ps1
```

```bash
chmod +x ./install-my-skills.sh
./install-my-skills.sh
```

Defaults:

- installs every directory under `skills/`
- installs to the current project's `.codex/skills`
- targets Codex only
