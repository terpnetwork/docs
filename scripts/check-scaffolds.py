#!/usr/bin/env python3
"""Inventory + label doc scaffolds.

Canonical line:
  > **Scaffold:** `TYPE` · id:`STABLE_ID` · P1|P2|P3 · purpose…

Usage:
  python3 scripts/check-scaffolds.py
  python3 scripts/check-scaffolds.py --label --write
  python3 scripts/check-scaffolds.py --allow-unlabeled
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "src" / "pages"
INVENTORY_MD = DOCS / "resources" / "contribution" / "scaffolds.md"
INVENTORY_JSON = ROOT / "scripts" / "scaffold-inventory.json"

# A scaffold marker is a blockquote whose bold lead-in mentions scaffold
SCAFFOLD_LINE = re.compile(
    r"^\s*>\s*(\*\*[^*]*[Ss]caffold[^*]*\*\*|\*\*Scaffold:\*\*)",
    re.MULTILINE,
)
# Also: > **Something scaffold** —
SCAFFOLD_LOOSE = re.compile(
    r"^\s*>\s*.*\bscaffold\b",
    re.IGNORECASE | re.MULTILINE,
)
ID_RE = re.compile(r"id:`([^`]+)`|id=([A-Za-z0-9_-]+)|\[scaffold:([A-Za-z0-9_-]+)\]")
SKIP_LINE = re.compile(
    r"Generate contract scaffolding|scaffolding from|^\s*-\s+\*\*Scaffolding\*\*",
    re.IGNORECASE,
)

TYPE_RULES = [
    (re.compile(r"visualizer", re.I), "visualizer"),
    (re.compile(r"sequence|flow scaffold|lifecycle|callback|pipeline flow", re.I), "flow"),
    (re.compile(r"chart|pie|gantt|timeline", re.I), "chart"),
    (re.compile(r"\bdemo\b", re.I), "demo"),
    (re.compile(r"diagram|architecture|topology", re.I), "diagram"),
]


def guess_type(line: str) -> str:
    for rx, t in TYPE_RULES:
        if rx.search(line):
            return t
    return "other"


def extract_id(line: str) -> str | None:
    m = ID_RE.search(line)
    if not m:
        return None
    return next(g for g in m.groups() if g)


def slugify(s: str, n: int = 40) -> str:
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    s = re.sub(r"-+", "-", s)
    return s[:n].rstrip("-")


def make_id(rel: str, line: str, used: set[str]) -> str:
    base = rel.replace(".mdx", "").replace(".md", "").replace("/", "-")
    purpose = re.sub(r".*[Ss]caffold\*?\*?[\s—:\-]*", "", line)
    purpose = re.sub(r"\*+", "", purpose)
    sid = f"scf-{slugify(base + '-' + purpose, 56)}"
    if not sid or sid == "scf-":
        sid = f"scf-{slugify(base, 40)}-{len(used)}"
    orig = sid
    i = 2
    while sid in used:
        sid = f"{orig}-{i}"
        i += 1
    used.add(sid)
    return sid


def is_scaffold(line: str) -> bool:
    if SKIP_LINE.search(line):
        return False
    if not line.lstrip().startswith(">"):
        return False
    if not re.search(r"scaffold", line, re.I):
        return False
    # require bold marker or explicit "scaffold —"
    if re.search(r"\*\*[^*]*scaffold[^*]*\*\*", line, re.I):
        return True
    if re.search(r"scaffold\s*[—\-]", line, re.I):
        return True
    if re.search(r"\*\*Scaffold:\*\*", line):
        return True
    return False


def purpose_from(line: str) -> str:
    p = re.sub(r"^\s*>\s*", "", line)
    p = re.sub(r"\*\*[^*]*[Ss]caffold[^*]*\*\*[\s—:\-·]*", "", p)
    p = re.sub(r"`[^`]+`\s*·\s*", "", p)  # drop type/id/priority chips if re-labeling
    p = re.sub(r"id:`[^`]+`\s*·\s*", "", p)
    p = re.sub(r"P[123]\s*·\s*", "", p)
    p = p.strip(" ·-—")
    return p or "(see surrounding section)"


def normalize_line(typ: str, sid: str, purpose: str, priority: str = "P2") -> str:
    return f"> **Scaffold:** `{typ}` · id:`{sid}` · {priority} · {purpose}"


def scan(label: bool) -> list[dict]:
    items: list[dict] = []
    used_ids: set[str] = set()
    # first pass collect existing ids
    for path in sorted(DOCS.rglob("*")):
        if not path.is_file() or path.suffix not in {".md", ".mdx"}:
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for line in text.splitlines():
            if is_scaffold(line):
                sid = extract_id(line)
                if sid:
                    used_ids.add(sid)

    for path in sorted(DOCS.rglob("*")):
        if not path.is_file() or path.suffix not in {".md", ".mdx"}:
            continue
        rel = str(path.relative_to(DOCS))
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines(keepends=True)
        changed = False
        for i, raw in enumerate(lines):
            line = raw.rstrip("\n")
            if not is_scaffold(line):
                continue
            typ = guess_type(line)
            sid = extract_id(line)
            status = "labeled" if sid else "unlabeled"
            if not sid:
                sid = make_id(rel, line, used_ids)
                if label:
                    purpose = purpose_from(line)
                    # If already partially canonical, keep purpose clean
                    new = normalize_line(typ, sid, purpose)
                    nl = "\n" if raw.endswith("\n") else ""
                    lines[i] = new + nl
                    changed = True
                    status = "labeled"
                    print(f"  LABELED  {rel}:{i+1}  id:`{sid}`")
                else:
                    print(f"  UNLABELED  {rel}:{i+1}  → id:`{sid}`")
            items.append(
                {
                    "path": rel,
                    "line": i + 1,
                    "type": typ,
                    "id": sid,
                    "status": status,
                    "text": line.strip(),
                }
            )
        if changed:
            path.write_text("".join(lines), encoding="utf-8")
    return items


def write_inventory(items: list[dict]) -> None:
    INVENTORY_JSON.write_text(
        json.dumps({"count": len(items), "scaffolds": items}, indent=2) + "\n",
        encoding="utf-8",
    )
    by_type: dict[str, list] = defaultdict(list)
    for it in items:
        by_type[it["type"]].append(it)

    out: list[str] = [
        "---",
        "title: Scaffold inventory",
        "description: Auto-generated list of diagram, visualizer, and demo scaffolds remaining in the docs",
        "status: complete",
        "---",
        "",
        "# Scaffold inventory",
        "",
        "Generated by `pnpm check-scaffolds --write`. Do not hand-edit long-term — re-run the script.",
        "",
        "## Canonical marker",
        "",
        "```markdown",
        "> **Scaffold:** `diagram` · id:`stable-id` · P2 · one-line purpose",
        "```",
        "",
        "| Field | Values |",
        "|-------|--------|",
        "| type | `diagram`, `flow`, `visualizer`, `demo`, `chart`, `other` |",
        "| id | stable kebab-case, unique in repo |",
        "| priority | `P1` (front-door), `P2` (core concepts), `P3` (nice-to-have) |",
        "",
        f"**Total:** {len(items)}  ·  "
        f"labeled: {sum(1 for i in items if i['status']=='labeled')}  ·  "
        f"unlabeled: {sum(1 for i in items if i['status']=='unlabeled')}",
        "",
    ]
    for typ in sorted(by_type):
        rows = sorted(by_type[typ], key=lambda x: x["id"])
        out.append(f"## `{typ}` ({len(rows)})")
        out.append("")
        out.append("| id | path | line | status |")
        out.append("|----|------|------|--------|")
        for it in rows:
            href = "/" + it["path"].rsplit(".", 1)[0]
            if href.endswith("/index"):
                href = href[: -len("/index")]
            out.append(
                f"| `{it['id']}` | [`{it['path']}`]({href}) | {it['line']} | {it['status']} |"
            )
        out.append("")

    out += [
        "## Refresh",
        "",
        "```bash",
        "python3 scripts/check-scaffolds.py --write",
        "```",
        "",
    ]
    INVENTORY_MD.write_text("\n".join(out), encoding="utf-8")
    print(f"wrote {INVENTORY_JSON}")
    print(f"wrote {INVENTORY_MD}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--label", action="store_true")
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--allow-unlabeled", action="store_true")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    items = scan(label=args.label)
    labeled = sum(1 for i in items if i["status"] == "labeled")
    unlabeled = sum(1 for i in items if i["status"] == "unlabeled")

    if args.write or args.json:
        write_inventory(items)
    if args.json:
        print(json.dumps({"count": len(items), "scaffolds": items}, indent=2))

    print()
    print(f"  Total scaffolds     {len(items)}")
    print(f"  Labeled (have id)   {labeled}")
    print(f"  Unlabeled           {unlabeled}")

    if unlabeled and not args.allow_unlabeled and not args.label:
        print("\nUnlabeled scaffolds found. Run:\n  pnpm check-scaffolds --label --write")
        return 1
    if args.label and unlabeled:
        # After label pass, re-scan mentally: labeled flag set on newly labeled
        print(f"\nLabeled {unlabeled} scaffold(s) this run.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
