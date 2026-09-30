# AI Prompt Atlas

Source-pinned learning notes for model prompts, agent runtimes, tool contracts, and reusable skills. The public reader combines an animated SVG workflow with a detailed Markdown note for every topic.

Public site:

```text
https://hufaei.github.io/ai-prompt-atlas/
```

## Current Learning Snapshot

The reader curates seven current learning topics. New source captures replace stale versions; overlapping notes are merged around the method they teach rather than retained as a growing model catalog.

- `notes/gpt-5.6-codex-runtime`: GPT-6 Astra, Sol, Luna and GPT-6.1 Sol; permission, persistence, workspace tools, and evidence-based completion.
- `notes/gpt-5.5-prompt-framework`: authoritative sources, retrieval, tool contracts, and Qwen's minimal schema and call-envelope comparison.
- `notes/claude-opus-5-claude-code`: Claude.ai Opus and Sonnet 5.5; assistant behavior, durable memory, privacy, and useful personalization.
- `notes/claude-fable-5-claude-code-prompt-framework`: Claude Code Fable 5.1; execution and Advisor review, memory and context, and CLI, desktop, headless, and Projects boundaries.
- `notes/claude-design-skills`: design components, skills, starter components, visible verification, exports, and engineering handoff.
- `notes/grok-prompt-evolution`: Grok 4.7 CLI, 4.6 conversation tools, Build, and Bot; memory scope, background work, monitoring, and public-surface verification.
- `notes/gemini-prompt-family`: Gemini 3.8 Flash alongside Pro and image layers; evidence, visual selection, component contracts, and image-tool inputs.

The current source boundary is `asgeirtj/system_prompts_leaks@87bdae7886aca455ad38eb60dfdedf093ef01e2a`, reviewed on 2026-09-30 (Asia/Shanghai). Each note links to immutable source files. This is a source-backed learning snapshot, not a claim that every captured instruction or tool applies to every product account.

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
