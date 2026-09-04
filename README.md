# AI Prompt Atlas

Source-pinned learning notes for model prompts, agent runtimes, tool contracts, and reusable skills. The public reader combines one 16:9 learning map with a detailed Markdown note for every topic.

Public site:

```text
https://hufaei.github.io/ai-prompt-atlas/
```

## Current Learning Snapshot

- `notes/gpt-5.6-codex-runtime`: model behavior, destructive actions, Sol, skills, full runtime, browser/computer control, and realtime voice cooperation.
- `notes/gpt-5.5-prompt-framework`: source-of-truth routing, user context, file/connector authority, rich responses, and tool contracts.
- `notes/claude-sonnet-5-claude-code`: assistant base, auto memory, scratchpad, context management, agents, skills, and current Claude Code tools.
- `notes/claude-fable-5-claude-code-prompt-framework`: Claude Fable 5.1 reporting outcomes, harness, memory, browser, connectors, workspace evidence, Git, and verified delivery.
- `notes/claude-opus-5-claude-code`: Claude.ai behavior and memory filesystem alongside Claude Code delivery, correction, agent, skill, and tool layers.
- `notes/claude-design-skills`: Design Components, the current skill catalog, starter components, visible verification, exports, and Claude Code handoff.
- `notes/grok-prompt-evolution`: Grok through 4.6, X/web/browser tools, connectors, Grok Build's app loop, and Grok Bot's stateful desktop runtime.
- `notes/gemini-prompt-family`: Gemini Pro gates, Gemini 3.7 Flash visual routing and Basekit components, Flash fact tools, and Nano Banana image contracts.
- `notes/qwen-prompt-family`: Qwen 3.8 Max's tools-first prompt, JSON schemas, XML function-call envelope, and thin-runtime boundary.
- `notes/meta-muse-code`: Meta Muse Code's evidence-first coding behavior, public-surface verification, repository protection, and delivery contract.

All ten notes are maintained as a current learning snapshot rather than a repository changelog. The current source boundary is `asgeirtj/system_prompts_leaks@171d1db270008b6cd8132f1a1b924ff3506b9f8a` (2026-09-03); each note links to immutable source files at that commit.

The reusable prompt examples preserve the recognizable source order and writing style. Product-specific model names, tools, paths, schemas, and policies are replaced with `{{FIELD = ...}}` slots so the template can be adapted without reducing the original prompt to a generic numbered checklist.

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
