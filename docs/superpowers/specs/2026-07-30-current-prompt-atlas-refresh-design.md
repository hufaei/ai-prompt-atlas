# AI Prompt Atlas 2026-07-30 Current Snapshot Refresh

## Goal

Refresh AI Prompt Atlas as a source-pinned current learning snapshot of
`asgeirtj/system_prompts_leaks`, not as a repository changelog. Preserve the
existing card → learning map → Markdown reading flow, the source-shaped reusable
prompt templates, and the review questions, while updating claims, wording,
visuals, and routes to reflect the upstream state at:

`1e828287e8290a9ba175349689dc4d5aaa4bbc94` (2026-07-30).

The source commit contains 61 commits after the previous snapshot. Its newest
content-bearing commit is from 2026-07-27; the July 30 head is still used as the
immutable boundary so every source link resolves against one reproducible tree.

## Information Architecture

Use eight cards. This is a curated topic boundary rather than one card per
upstream file or commit.

1. **GPT-5.6 / Codex Runtime**
   - Refresh the existing note.
   - Cover the Terra/Luna destructive-action contract, the separate Sol prompt,
     skills, tool routing, and the desktop realtime voice role split.
2. **GPT-5.5 Prompt Framework**
   - Refresh the existing note.
   - Fold in the current Instant prompt's personal-context, source-of-truth,
     response-spec, rich-response, and tool-contract layers without turning the
     note into a tool-schema dump.
3. **Claude Sonnet 5 / Claude Code**
   - Refresh and rename the existing version-pinned route to the stable
     `claude-sonnet-5-claude-code` route.
   - Cover the current Sonnet 5 Claude Code system, auto-memory taxonomy,
     scratchpad/context management, agents, skills, and runtime tools.
   - Keep a redirect from
     `claude-sonnet-5-claude-code-2.1.207`.
4. **Claude Fable 5 / Claude Code**
   - Refresh the existing engineering-baseline note.
   - Cover the July 24 Claude.ai capture and current Claude Code harness,
     memory, scratchpad, cron, DesignSync, Git, and delivery boundaries.
5. **Claude Opus 5 / Claude Code**
   - Add a new note.
   - Explain the Claude.ai behavior/memory layer and Claude Code's harness,
     delivery, correction, agent, skill, and tool layers as a reusable
     two-surface model.
6. **Claude Design Skills**
   - Add a new note.
   - Explain the design-agent workflow, Design Components, starter components,
     reusable skill catalog, verification loop, and Claude Code handoff.
7. **Grok Prompt Evolution**
   - Refresh the existing note through Grok 4.5.
   - Cover X search, connected tools, memory, file/sandbox tools, image
     generate/edit routing, render components, and skills.
8. **Gemini Prompt Family**
   - Refresh the existing note.
   - Retain the Pro/Flash/Nano Banana family comparison while incorporating the
     current Gemini 3.5 Flash saved-information, personalization, image gate,
     and interactive-output contracts.

Do not create separate cards for Codex Sol, realtime voice, Grok Build, or every
Claude Code runtime file: each is best understood as a layer inside one of the
eight learning topics.

## Content Contract

Every note remains a present-tense learning artifact and follows the same
high-level contract:

1. snapshot boundary and one-sentence thesis;
2. a compact mental model of the prompt/runtime;
3. source-grounded explanation of the important layers;
4. comparison tables or boundary checks where they improve recall;
5. a source-shaped reusable prompt template that preserves the original
   ordering and recognizable writing style while replacing product-specific
   values and tool names with `{{FIELD = ...}}` slots;
6. practical review questions;
7. immutable GitHub blob links under the fixed snapshot commit.

Existing high-value explanations and prompt templates are preserved unless the
new source makes them stale. New content is integrated as current understanding,
not narrated commit by commit. Claims must be traceable to the upstream files;
interpretation is labelled as analysis rather than product fact.

## Visual Design

Preserve the current warm, quiet editorial language: off-white background,
white cards, dark type, restrained blue/warm accents, and maps before articles.

### Homepage

- Add a compact snapshot summary band below the hero:
  `2026-07-30`, `8 learning maps`, and `source-pinned`.
- Group cards into three reading lanes without creating separate pages:
  `OpenAI runtimes`, `Anthropic systems`, and `Other model families`.
- Keep a two-column desktop grid and one-column mobile layout.
- Give every card one concise learning promise, a family label, a role badge,
  and the shared source date.
- Avoid commit counts and “what changed” timelines in the primary interface.

### Detail Pages

- Preserve title, summary, metadata, large 16:9 map, then Markdown article.
- Add a small “learning path” line that communicates what to look for in the
  map before reading the article.
- Keep code blocks and tables readable on narrow screens.
- Use stable routes. The old Sonnet version route redirects to the current
  stable route so existing bookmarks continue to work.

## Learning Maps

Create one 1600×900 PNG for each of the eight notes. The maps share one visual
system:

- large Chinese title and one-line thesis;
- a left-to-right or center-out learning flow;
- five to seven major nodes with short, fact-checked labels;
- one “reuse” strip showing the parameterized template idea;
- one final memory hook;
- strong type hierarchy, generous whitespace, and restrained color coding.

The image is a fast retrieval aid; exact schemas, long prompt wording, and
source links remain in Markdown. Generated maps are visually inspected for
legibility and rejected if labels are garbled or content contradicts the note.

## Build, Tests, and Deployment

- Update the site contract to require exactly eight catalog entries, notes,
  maps, stable routes, the new snapshot hash, and 1600×900 images.
- Build the Pages artifact with the repository workflow's exact copy logic.
- Run unit tests and validate internal catalog/file/map consistency.
- Inspect the home page and representative detail pages at desktop and mobile
  widths.
- Commit and push `main` to `hufaei/ai-prompt-atlas`.
- Monitor the `Publish notes to GitHub Pages` workflow to success and verify the
  public home page plus new/stable routes.

## Non-Goals

- Synchronizing the user's learning branch history with upstream.
- Publishing a commit-by-commit upstream changelog.
- Copying entire leaked prompts into the article body.
- Claiming official model behavior beyond what the pinned source contains.
- Splitting every new prompt file into its own card.
