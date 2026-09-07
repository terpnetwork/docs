#!/usr/bin/env python3
"""Find broken internal links in Vocs MD/MDX pages.

Source pages must link to files that exist under src/pages.
Old fumadocs URLs belong in vocs.config.ts redirects, not in page copy.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "src" / "pages"

VIRTUAL_PREFIXES = (
    "/api/rest",
    "/api/cometbft",
    "/api/ibc",
)

MD_LINK = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
MDX_ATTR = re.compile(r"""\b(?:to|href)=["']([^"']+)["']""")
SKIP_TARGET = re.compile(
    r"^(https?://|mailto:|tel:|#|data:)",
    re.I,
)
SKIP_ASSET = re.compile(r"\.(png|jpe?g|gif|svg|webp|ico|pdf)(?:\?|$)", re.I)


def is_virtual(target: str) -> bool:
    return any(target == pref or target.startswith(pref + "/") for pref in VIRTUAL_PREFIXES)


def candidates(docs: Path, source: Path, target: str) -> list[Path]:
    target = target.split("?", 1)[0]
    if target.startswith("/"):
        base = docs / target.lstrip("/")
    else:
        base = (source.parent / target).resolve()
    bases = [base]
    if base.suffix in {".md", ".mdx"}:
        bases.append(base.with_suffix(""))
    out: list[Path] = []
    for b in bases:
        out.extend(
            [
                b,
                Path(str(b) + ".md"),
                Path(str(b) + ".mdx"),
                b / "index.md",
                b / "index.mdx",
                b / "README.md",
                b / "README.mdx",
            ]
        )
    return out


def extract(text: str) -> list[str]:
    links: list[str] = []
    for rx in (MD_LINK, MDX_ATTR):
        for raw in rx.findall(text):
            href = raw.strip()
            if not href or SKIP_TARGET.search(href) or SKIP_ASSET.search(href):
                continue
            href = href.split("#", 1)[0]
            if href:
                links.append(href)
    return links


def main() -> int:
    if not DOCS.is_dir():
        print(f"docs dir not found: {DOCS}", file=sys.stderr)
        return 2

    ok = 0
    broken: list[str] = []
    pages = sorted(
        path
        for path in DOCS.rglob("*")
        if path.is_file()
        and path.suffix in {".md", ".mdx"}
        and not path.name.startswith("_")
    )

    print(f"Scanning docs in {DOCS}\n")

    for path in pages:
        text = path.read_text(encoding="utf-8", errors="replace")
        rel = path.relative_to(DOCS)
        for href in extract(text):
            if is_virtual(href):
                ok += 1
                continue
            if any(c.exists() for c in candidates(DOCS, path, href)):
                ok += 1
                continue
            broken.append(f"  BROKEN  {rel}  →  {href}")

    for line in broken:
        print(line)

    print(f"\n  OK      {ok}")
    print(f"  BROKEN  {len(broken)}")
    if broken:
        print(f"\nFound {len(broken)} broken internal link(s)")
        return 1
    print("\nNo broken internal links")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
