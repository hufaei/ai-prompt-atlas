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
- `notes/claude-fable-5-claude-code-prompt-framework`: engineering harness, memory, scratchpad, time-based tools, workspace evidence, Git, and verified delivery.
- `notes/claude-opus-5-claude-code`: Claude.ai behavior and memory filesystem alongside Claude Code delivery, correction, agent, skill, and tool layers.
- `notes/claude-design-skills`: Design Components, the current skill catalog, starter components, visible verification, exports, and Claude Code handoff.
- `notes/grok-prompt-evolution`: Grok 3 through Grok 4.5, X/web tools, connectors, memory, sandbox files, image routing, render components, and skills.
- `notes/gemini-prompt-family`: Gemini Pro gates, Gemini Flash fact tools and Web UI rendering, plus Nano Banana image execution contracts.

All eight notes are maintained as a current learning snapshot rather than a repository changelog. The current source boundary is `asgeirtj/system_prompts_leaks@1e828287e8290a9ba175349689dc4d5aaa4bbc94` (2026-07-30); each note links to immutable source files at that commit.

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
