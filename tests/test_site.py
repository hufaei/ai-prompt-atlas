import re
import shutil
import struct
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs" / "index.html"
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


def catalog_slugs() -> set[str]:
    html = INDEX.read_text(encoding="utf-8")
    return set(re.findall(r'\bslug:\s*"([^"]+)"', html))


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as image:
        header = image.read(24)
    if len(header) != 24 or header[:8] != b"\x89PNG\r\n\x1a\n":
        raise AssertionError(f"Not a valid PNG: {path}")
    return struct.unpack(">II", header[16:24])


def reusable_prompt(slug: str) -> str:
    text = (ROOT / "notes" / slug / "README.md").read_text(encoding="utf-8")
    heading = re.search(
        r"^## .*?(?:FrameworkNote|精华版|可复用模板).*?$", text, re.MULTILINE
    )
    if heading is None:
        raise AssertionError(f"missing reusable prompt heading for {slug}")
    block = re.search(r"```text\n(.*?)\n```", text[heading.end() :], re.DOTALL)
    if block is None:
        raise AssertionError(f"missing reusable prompt block for {slug}")
    return block.group(1)


class SiteContractTests(unittest.TestCase):
    def assert_source_shaped_template(
        self, slug: str, markers: tuple[str, ...], minimum_slots: int = 8
    ):
        path = ROOT / "notes" / slug / "README.md"
        self.assertTrue(path.is_file(), f"missing Markdown note for {slug}")
        note = path.read_text(encoding="utf-8")
        prompt = reusable_prompt(slug)
        slots = re.findall(r"\{\{[A-Z0-9_]+\s*=\s*\.\.\.\}\}", prompt)
        self.assertGreaterEqual(len(prompt), 2200, slug)
        self.assertGreaterEqual(len(slots), minimum_slots, slug)
        for marker in markers:
            self.assertIn(marker, prompt, f"{slug}: missing {marker}")
        for disclaimer in (
            "不是源提示词的逐字内容",
            "不是源提示词逐字内容",
            "不是原 prompt 的逐字结构",
            "不是 Grok 原提示词的逐字模板",
        ):
            self.assertNotIn(disclaimer, note, f"{slug}: stale disclaimer")

    def test_openai_notes_use_source_shaped_parameterized_prompts(self):
        self.assert_source_shaped_template(
            "gpt-5.5-prompt-framework",
            (
                "# General",
                "## Engineering judgment",
                "## Frontend guidance",
                "## Editing constraints",
                "# Working with the user",
                "## Intermediate updates",
                "# Runtime extension slots",
            ),
            minimum_slots=10,
        )
        self.assert_source_shaped_template(
            "gpt-5.6-codex-runtime",
            (
                "# Personality",
                "# Working with the user",
                "## Intermediate commentary",
                "## Final answer",
                "# Rules for getting work done",
                "# Using skills",
                "# Runtime extension slots",
            ),
            minimum_slots=10,
        )

    def test_anthropic_notes_use_source_shaped_parameterized_prompts(self):
        self.assert_source_shaped_template(
            "claude-fable-5-claude-code-prompt-framework",
            (
                "# Harness",
                "# Communicating with the user",
                "# Context management",
                "# Tools",
                "## {{TOOL_NAME = ...}}",
                "## Git",
                "# Task tracking",
                "# Resume and delivery",
            ),
            minimum_slots=12,
        )
        self.assert_source_shaped_template(
            "claude-sonnet-5-claude-code",
            (
                "# Assistant base layer",
                "<tone_and_formatting>",
                "<proactivity>",
                "## Artifact routing",
                "## Connector and tool discovery",
                "# Coding runtime layer",
                "## Context management and compaction",
                "## Bundled skill template",
                "# Delivery",
            ),
            minimum_slots=14,
        )
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

    def test_grok_and_gemini_notes_use_source_shaped_parameterized_prompts(self):
        self.assert_source_shaped_template(
            "grok-prompt-evolution",
            (
                "## Environment Info",
                "## Context Info",
                "## Available Tools",
                "## {{TOOL_NAME = ...}}",
                "## Available Render Components",
                "## {{RENDER_COMPONENT = ...}}",
                "## Skills",
            ),
            minimum_slots=12,
        )
        self.assert_source_shaped_template(
            "gemini-prompt-family",
            (
                "# Assistant identity",
                "# Capability-only information",
                "# Response guiding principles",
                "# Follow-up rules",
                "# Personalization gate",
                "# Visual support gate",
                "# Interactive output gate",
                "# Image execution contract",
                "# Output component contracts",
            ),
            minimum_slots=14,
        )

    def test_readme_uses_the_canonical_repository_and_pages_route(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn("https://hufaei.github.io/ai-prompt-atlas/", readme)
        self.assertIn("https://github.com/hufaei/ai-prompt-atlas/", readme)
        self.assertNotIn("https://hufaei.github.io/my-skills/", readme)
        self.assertNotIn("https://github.com/hufaei/my-skills/", readme)

    def test_site_brand_is_consistent_across_reader_surfaces(self):
        html = INDEX.read_text(encoding="utf-8")
        self.assertGreaterEqual(html.count("AI Prompt Atlas"), 5)
        self.assertIn("模型提示词、Agent Runtime 与 Skills 学习图谱", html)
        self.assertNotIn("Prompt Engineering Notes", html)

    def test_catalog_contains_exactly_the_eight_learning_notes(self):
        self.assertEqual(catalog_slugs(), EXPECTED_SLUGS)

    def test_catalog_has_scanability_metadata_for_every_note(self):
        html = INDEX.read_text(encoding="utf-8")
        self.assertEqual(html.count("family:"), len(EXPECTED_SLUGS))
        self.assertEqual(html.count("group:"), len(EXPECTED_SLUGS))
        self.assertEqual(html.count("badge:"), len(EXPECTED_SLUGS))
        self.assertEqual(html.count("snapshot:"), len(EXPECTED_SLUGS))
        self.assertEqual(html.count("learningPath:"), len(EXPECTED_SLUGS))

    def test_homepage_identifies_the_current_snapshot(self):
        html = INDEX.read_text(encoding="utf-8")
        self.assertIn("Learning Snapshot · 2026-07-30", html)
        self.assertIn("8 份学习图谱", html)
        self.assertIn("固定来源快照", html)

    def test_legacy_sonnet_route_targets_the_stable_slug(self):
        html = INDEX.read_text(encoding="utf-8")
        for legacy, current in LEGACY_ROUTES.items():
            with self.subTest(legacy=legacy):
                self.assertEqual(html.count(f'slug: "{legacy}"'), 0)
                self.assertIn(f'"{legacy}": "{current}"', html)

    def test_detail_grid_children_can_shrink_to_a_mobile_viewport(self):
        html = INDEX.read_text(encoding="utf-8")
        self.assertRegex(
            html,
            re.compile(r"\.note-page\s*>\s*\*\s*\{[^}]*min-width:\s*0", re.DOTALL),
        )

    def test_every_note_has_a_markdown_payload_and_mindmap(self):
        for slug in EXPECTED_SLUGS:
            with self.subTest(slug=slug):
                self.assertTrue(
                    (ROOT / "notes" / slug / "README.md").is_file(),
                    f"missing Markdown note for {slug}",
                )
                self.assertTrue(
                    (ROOT / "docs" / "assets" / "mindmaps" / f"{slug}.png").is_file(),
                    f"missing mind map for {slug}",
                )

    def test_every_note_preserves_the_learning_contract(self):
        reusable_heading = re.compile(
            r"^## .*?(?:FrameworkNote|精华版|可复用模板)", re.MULTILINE
        )
        for slug in EXPECTED_SLUGS:
            path = ROOT / "notes" / slug / "README.md"
            if not path.is_file():
                continue
            text = path.read_text(encoding="utf-8")
            with self.subTest(slug=slug):
                self.assertIn("## 一句话核心", text)
                self.assertRegex(text, reusable_heading)
                self.assertIn("## 复习问题", text)
                self.assertIn("## 来源索引", text)
                self.assertIn(SNAPSHOT, text)
                self.assertNotIn("C:\\Users\\", text)

    def test_every_mindmap_is_exactly_1600_by_900(self):
        for slug in EXPECTED_SLUGS:
            path = ROOT / "docs" / "assets" / "mindmaps" / f"{slug}.png"
            if not path.is_file():
                self.fail(f"missing mind map for {slug}")
            with self.subTest(slug=slug):
                self.assertEqual(png_dimensions(path), (1600, 900))

    def test_pages_build_contains_every_route_and_payload(self):
        with tempfile.TemporaryDirectory() as directory:
            site = Path(directory)
            (site / "content").mkdir()
            (site / "assets").mkdir()
            shutil.copy2(INDEX, site / "index.html")
            shutil.copytree(
                ROOT / "docs" / "assets",
                site / "assets",
                dirs_exist_ok=True,
            )
            for note in (ROOT / "notes").glob("*/README.md"):
                slug = note.parent.name
                shutil.copy2(note, site / "content" / f"{slug}.md")
                route = site / "notes" / slug
                route.mkdir(parents=True)
                shutil.copy2(INDEX, route / "index.html")

            for slug in EXPECTED_SLUGS:
                with self.subTest(slug=slug):
                    self.assertTrue((site / "content" / f"{slug}.md").is_file())
                    self.assertTrue((site / "notes" / slug / "index.html").is_file())
                    self.assertTrue(
                        (site / "assets" / "mindmaps" / f"{slug}.png").is_file()
                    )

            for legacy, current in LEGACY_ROUTES.items():
                route = site / "notes" / legacy
                route.mkdir(parents=True, exist_ok=True)
                shutil.copy2(INDEX, route / "index.html")
                with self.subTest(legacy=legacy):
                    self.assertTrue((route / "index.html").is_file())
                    self.assertTrue((site / "notes" / current / "index.html").is_file())


if __name__ == "__main__":
    unittest.main()
