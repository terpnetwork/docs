#!/usr/bin/env python3
"""Sync product docs from their code-adjacent source of truth into Vocs pages.

Single-SoT rule: product documentation lives next to the code it describes
(e.g. crates/terp-rs/tools/hash-market/docs/). This script copies those files
into src/pages so Vocs can render them, prepending a "Generated — do not edit"
banner after the frontmatter. Never edit the generated copies by hand.

Usage: python3 scripts/sync-product-docs.py
"""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent

PAGES = [
    (
        "crates/terp-rs/tools/hash-market/docs/frost-privval.md",
        "src/pages/guides/validators/frost-privval.mdx",
    ),
]

BANNER = (
    "> **Generated — do not edit.** Source of truth: `{src}`. "
    "Edit there, then run `pnpm sync:product-docs`.\n"
)


def splice_banner(text: str, banner: str) -> str:
    if text.startswith("---"):
        end = text.index("---", 3)
        head, body = text[: end + 3], text[end + 3 :]
        return head.rstrip() + "\n\n" + banner + "\n" + body.lstrip()
    return banner + "\n" + text


def main() -> None:
    for src_rel, dst_rel in PAGES:
        src = REPO / src_rel
        dst = ROOT / dst_rel
        if not src.exists():
            raise SystemExit(f"missing source of truth: {src}")
        out = splice_banner(src.read_text(), BANNER.format(src=src_rel))
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(out)
        print(f"synced: {dst_rel} <- {src_rel}")


if __name__ == "__main__":
    main()
