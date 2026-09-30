"""Content, navigation, graph data, and the actual Pages build contract."""

import json
import re
import shutil
import subprocess
import tempfile
import textwrap
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs" / "index.html"
SNAPSHOT = "87bdae7886aca455ad38eb60dfdedf093ef01e2a"
SITE_URL = "https://hufaei.github.io/ai-prompt-atlas/"
REPO_URL = "https://github.com/hufaei/ai-prompt-atlas/"
EXPECTED_SLUGS = {
    "gpt-5.6-codex-runtime",
    "gpt-5.5-prompt-framework",
    "claude-opus-5-claude-code",
    "claude-fable-5-claude-code-prompt-framework",
    "claude-design-skills",
    "grok-prompt-evolution",
    "gemini-prompt-family",
}
EXPECTED_ALIASES = {
    "claude-sonnet-5-claude-code-2.1.207": "claude-opus-5-claude-code",
    "claude-sonnet-5-claude-code": "claude-opus-5-claude-code",
    "qwen-prompt-family": "gpt-5.5-prompt-framework",
    "meta-muse-code": "gpt-5.6-codex-runtime",
}
FLOW_ASSETS = ("flow-atlas.js", "flow-atlas.css", "flows.json")


def reader_data(name: str):
    """Read the JSON catalog/alias data shipped in the reader, not a test copy."""
    html = INDEX.read_text(encoding="utf-8")
    declaration = re.search(rf"\bconst\s+{re.escape(name)}\s*=\s*", html)
    if declaration is None:
        raise AssertionError(f"Reader has no {name} data")
    return json.JSONDecoder().raw_decode(html[declaration.end() :])[0]


def markdown_structure(text: str):
    """Keep headings outside fences and complete blocks, including nested fences."""
    headings, blocks = [], []
    fence = None
    language = ""
    body = []
    for line in text.splitlines():
        marker = re.match(r"^(`{3,}|~{3,})(\w*)\s*$", line)
        if fence is None:
            if marker:
                fence, language = marker.groups()
                body = []
            elif re.match(r"^#{1,6}\s", line):
                headings.append(line)
        elif marker and marker.group(1)[0] == fence[0] and len(marker.group(1)) >= len(fence):
            blocks.append((language, "\n".join(body)))
            fence = None
        else:
            body.append(line)
    if fence is not None:
        raise AssertionError("Unclosed Markdown fence")
    return headings, blocks


class ReaderHead(HTMLParser):
    def __init__(self):
        super().__init__()
        self.language = None
        self.meta = {}
        self.title = ""
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "html":
            self.language = attrs.get("lang")
        elif tag == "meta" and "name" in attrs:
            self.meta[attrs["name"]] = attrs.get("content", "")
        elif tag == "title":
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def pages_build_script() -> str:
    """Extract the workflow's literal build script so this test runs production wiring."""
    workflow = (ROOT / ".github" / "workflows" / "pages.yml").read_text(encoding="utf-8")
    scripts = []
    lines = workflow.splitlines()
    for index, line in enumerate(lines):
        if re.match(r"\s+run:\s*\|\s*$", line):
            indent = len(line) - len(line.lstrip())
            body = []
            for following in lines[index + 1 :]:
                if following.strip() and len(following) - len(following.lstrip()) <= indent:
                    break
                body.append(following)
            script = textwrap.dedent("\n".join(body))
            if "docs/index.html" in script and "_site" in script:
                scripts.append(script)
    if len(scripts) != 1:
        raise AssertionError("Expected one Pages static-site build script")
    return scripts[0]


class SiteContractTests(unittest.TestCase):
    def test_catalog_and_legacy_routes_match_the_seven_topics(self):
        notes = reader_data("notes")
        slugs = [note["slug"] for note in notes]
        self.assertEqual(set(slugs), EXPECTED_SLUGS)
        self.assertEqual(len(slugs), len(set(slugs)), "Duplicate catalog topic")
        self.assertEqual(reader_data("legacyRoutes"), EXPECTED_ALIASES)
        for note in notes:
            with self.subTest(slug=note["slug"]):
                for field in ("title", "heading", "family", "badge", "meta", "learningPath", "snapshot"):
                    self.assertIsInstance(note.get(field), str, field)
                    self.assertTrue(note[field].strip(), field)
                self.assertEqual(note["file"], f'content/{note["slug"]}.md')

    def test_canonical_links_and_reader_metadata(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertIn(SITE_URL, readme)
        self.assertIn(REPO_URL, readme)
        head = ReaderHead()
        head.feed(INDEX.read_text(encoding="utf-8").split("</head>", 1)[0])
        self.assertEqual(head.title.strip(), "AI Prompt Atlas")
        self.assertEqual(head.language, "zh-CN")
        self.assertIn("width=device-width", head.meta.get("viewport", ""))

    def test_notes_have_learning_sections_and_parameterized_source_excerpts(self):
        for slug in EXPECTED_SLUGS:
            with self.subTest(slug=slug):
                text = (ROOT / "notes" / slug / "README.md").read_text(encoding="utf-8")
                headings, blocks = markdown_structure(text)
                self.assertEqual(sum(h.startswith("# ") for h in headings), 1)
                sections = [h for h in headings if h.startswith("## ")]
                self.assertTrue(any("复习" in h for h in sections), "Missing review section")
                self.assertTrue(any("来源" in h for h in sections), "Missing source section")
                self.assertTrue(any("复习" not in h and "来源" not in h for h in sections), "Missing learning section")
                self.assertTrue(
                    any(language in ("text", "markdown") and re.search(r"\{\{[A-Z][A-Z0-9_]*\s*=", body)
                        for language, body in blocks),
                    "Missing copyable, parameterized source excerpt",
                )
                self.assertIn(SNAPSHOT, text)

    def test_note_source_and_navigation_links_are_usable(self):
        source_link = re.compile(
            r"https://github\.com/asgeirtj/system_prompts_leaks/(?:blob|tree)/([a-f0-9]{40})/"
        )
        for slug in EXPECTED_SLUGS:
            with self.subTest(slug=slug):
                note = ROOT / "notes" / slug / "README.md"
                text = note.read_text(encoding="utf-8")
                pins = source_link.findall(text)
                self.assertTrue(pins, "Missing immutable source links")
                self.assertEqual(set(pins), {SNAPSHOT})
                for target in re.findall(r"\]\((\.\./[^)]+)\)", text):
                    path = target.split("#", 1)[0]
                    self.assertTrue(path.endswith("/"), f"Pages note link must use a route: {target}")
                    self.assertIn(path.removeprefix("../").rstrip("/"), EXPECTED_SLUGS)
                    self.assertTrue((note.parent / path / "README.md").is_file(), target)

    def test_flow_assets_and_routes_are_complete(self):
        html = INDEX.read_text(encoding="utf-8")
        for filename in FLOW_ASSETS:
            self.assertIn(f"assets/{filename}", html)
            self.assertTrue((ROOT / "docs" / "assets" / filename).is_file(), filename)
        graphs = json.loads((ROOT / "docs" / "assets" / "flows.json").read_text(encoding="utf-8"))
        self.assertEqual(set(graphs), EXPECTED_SLUGS)
        for slug, graph in graphs.items():
            with self.subTest(slug=slug):
                node_ids = [node["id"] for node in graph["nodes"]]
                self.assertTrue(node_ids, "Empty graph")
                self.assertEqual(len(node_ids), len(set(node_ids)), "Duplicate node id")
                nodes = set(node_ids)
                edges = {(edge["from"], edge["to"]) for edge in graph["edges"]}
                for start, end in edges:
                    self.assertIn(start, nodes)
                    self.assertIn(end, nodes)
                self.assertTrue(graph["routes"], "No playable route")
                for route in graph["routes"]:
                    with self.subTest(route=route["name"]):
                        self.assertTrue(route["nodes"], "Empty playable route")
                        for node in route["nodes"]:
                            self.assertIn(node, nodes, "Route references a missing node")
                        for pair in zip(route["nodes"], route["nodes"][1:]):
                            self.assertIn(pair, edges, "Adjacent route nodes have no directed edge")

    def test_actual_pages_build_publishes_payloads_routes_and_flow_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            shutil.copytree(ROOT / "docs", workspace / "docs")
            shutil.copytree(ROOT / "notes", workspace / "notes")
            result = subprocess.run(
                ["bash", "-c", pages_build_script()], cwd=workspace,
                capture_output=True, text=True, timeout=30,
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            site = workspace / "_site"
            self.assertTrue((site / ".nojekyll").is_file())
            self.assertEqual((site / "index.html").read_bytes(), INDEX.read_bytes())
            self.assertEqual({path.stem for path in (site / "content").glob("*.md")}, EXPECTED_SLUGS)
            self.assertEqual(
                {path.parent.name for path in (site / "notes").glob("*/index.html")},
                EXPECTED_SLUGS | set(EXPECTED_ALIASES),
            )
            for slug in EXPECTED_SLUGS:
                self.assertEqual(
                    (site / "content" / f"{slug}.md").read_bytes(),
                    (ROOT / "notes" / slug / "README.md").read_bytes(),
                )
            for slug in EXPECTED_SLUGS | set(EXPECTED_ALIASES):
                self.assertEqual((site / "notes" / slug / "index.html").read_bytes(), INDEX.read_bytes())
            for filename in FLOW_ASSETS:
                self.assertEqual(
                    (site / "assets" / filename).read_bytes(),
                    (ROOT / "docs" / "assets" / filename).read_bytes(),
                )


if __name__ == "__main__":
    unittest.main()
