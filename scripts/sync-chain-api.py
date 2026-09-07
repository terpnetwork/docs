#!/usr/bin/env python3
"""Rebuild the Terp-module sections of the docs REST spec from chain protos.

Pipeline (all inside this script + group-openapi.py):
  1. buf generate (terp-core's own proto/ + buf.yaml) scoped to each
     Terp-served module's query.proto, using the repo's swagger template
     options (protoc-gen-swagger, swagger 2.0 fragments).
  2. Convert fragments to the OpenAPI 3 shape used by static/api/openapi.yaml
     (namespaced operationIds, module-own schemas inlined).
  3. Splice refreshed paths into static/api/openapi.yaml, replacing stale
     sections (e.g. the removed clock module) and merging shared schemas.
  4. Re-run group-openapi.py so rest.grouped.yaml gets per-module tags
     (HashMerchant, Token Factory, ...) instead of one "Terp" bucket.

Usage:
  TERP_CORE=/path/to/terp-core python3 scripts/sync-chain-api.py
  # default TERP_CORE is the repo root two levels up from this site

This is intentionally on-demand (buf + go toolchain, minutes) — not wired
into dev/build. Re-run after proto changes, then review the diff.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
TERP_CORE = Path(os.environ.get("TERP_CORE", ROOT.parent.parent)).resolve()
SRC = ROOT / "static" / "api" / "openapi.yaml"

# (root, query.proto relative to root, REST prefix served by the LCD, short id)
# Roots: "chain" = TERP_CORE/proto, "zkwasmd" = the wasmd fork in-tree,
# "ibcgo" = the pinned ibc-go module in the Go module cache.
MODULES = [
    ("chain", "terp/hashmerchant/v1/query.proto", "/terp/hashmerchant/", "hashmerchant"),
    ("chain", "terp/drip/v1/query.proto", "/terp/drip/", "drip"),
    ("chain", "terp/feeshare/v1/query.proto", "/terp/feeshare/", "feeshare"),
    ("chain", "terp/smartaccount/v1beta1/query.proto", "/terp/smartaccount/", "smartaccount"),
    ("chain", "osmosis/tokenfactory/v1beta1/query.proto", "/osmosis/tokenfactory/", "tokenfactory"),
    ("chain", "gaia/globalfee/v1beta1/query.proto", "/gaia/globalfee/", "globalfee"),
    ("zkwasmd", "cosmwasm/wasm/v1/query.proto", "/cosmwasm/", "wasm"),
    ("ibcgo", "ibc/core/client/v1/query.proto", "/ibc/", "ibc-client"),
    ("ibcgo", "ibc/core/client/v2/query.proto", "/ibc/", "ibc-client-v2"),
    ("ibcgo", "ibc/core/connection/v1/query.proto", "/ibc/", "ibc-connection"),
    ("ibcgo", "ibc/core/channel/v1/query.proto", "/ibc/", "ibc-channel"),
    ("ibcgo", "ibc/core/channel/v2/query.proto", "/ibc/", "ibc-channel-v2"),
    ("ibcgo", "ibc/applications/transfer/v1/query.proto", "/ibc/", "ibc-transfer"),
    ("ibcgo", "ibc/applications/interchain_accounts/host/v1/query.proto", "/ibc/", "ibc-ica-host"),
    ("ibcgo", "ibc/applications/interchain_accounts/controller/v1/query.proto", "/ibc/", "ibc-ica-controller"),
    ("ibcgo", "ibc/lightclients/wasm/v1/query.proto", "/ibc/", "ibc-wasm-client"),
]

# Prefixes this script owns. Anything here without a fresh proto source
# (e.g. the removed clock module) is dropped and reported.
STALE_PREFIXES = ("/terp/clock/",)

MANAGED_SCHEMA_PREFIXES = ("terp.", "osmosis.tokenfactory.", "gaia.globalfee.",
                           "ibc.", "cosmwasm.")

SWAGGER_TEMPLATE = """\
version: v1
plugins:
  - name: swagger
    out: {outdir}
    opt: logtostderr=true,fqn_for_swagger_name=true,simple_operation_ids=true
"""


def run(cmd: list[str], cwd: Path, env: dict | None = None) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=cwd, env=env, check=True)


def def_name(ref: str) -> str:
    return ref.removeprefix("#/definitions/")


def proto_package(path: Path) -> str:
    """Read the proto package from a query.proto (owns its schemas)."""
    import re

    text = path.read_text()
    m = re.search(r"^package\s+([\w.]+)\s*;", text, re.M)
    if not m:
        raise SystemExit(f"no package in {path}")
    return m.group(1) + "."


def resolve_roots() -> dict[str, Path]:
    gopath = subprocess.run(
        ["go", "env", "GOPATH"], capture_output=True, text=True, check=True,
        cwd=TERP_CORE,
    ).stdout.strip()
    gomodcache = subprocess.run(
        ["go", "env", "GOMODCACHE"], capture_output=True, text=True, check=True,
        cwd=TERP_CORE,
    ).stdout.strip()
    ibcgo = subprocess.run(
        ["go", "list", "-f", "{{.Dir}}", "-m", "github.com/cosmos/ibc-go/v11"],
        capture_output=True, text=True, check=True, cwd=TERP_CORE,
    ).stdout.strip()
    return {
        "chain": TERP_CORE / "proto",
        "zkwasmd": TERP_CORE / "crates" / "zk-wasmd" / "proto",
        "ibcgo": Path(ibcgo) / "proto",
        "_gobin": Path(gopath) / "bin",
        "_modcache": Path(gomodcache),
    }


def inline_schema(node, defs: dict, own_prefix: str, stack: tuple = ()) -> object:
    """Recursively inline $refs owned by this module; keep shared ones."""
    if isinstance(node, dict):
        if set(node.keys()) == {"$ref"}:
            name = def_name(node["$ref"])
            if name.startswith(own_prefix):
                if name in stack:  # cycle: keep a components ref instead
                    return {"$ref": f"#/components/schemas/{name}"}
                target = defs.get(name)
                if target is None:
                    return {"$ref": f"#/components/schemas/{name}"}
                return inline_schema(target, defs, own_prefix, stack + (name,))
            return {"$ref": f"#/components/schemas/{name}"}
        return {k: inline_schema(v, defs, own_prefix, stack) for k, v in node.items()}
    if isinstance(node, list):
        return [inline_schema(v, defs, own_prefix, stack) for v in node]
    return node


def convert_param(p: dict) -> dict:
    # Query/path params are flat primitives; lift type info into schema.
    schema: dict = {}
    for key in ("type", "format", "items", "enum", "default"):
        if key in p:
            schema[key] = p[key]
    out = {"name": p["name"], "in": p["in"]}
    if p.get("description"):
        out["description"] = p["description"]
    if "required" in p:
        out["required"] = p["required"]
    if schema:
        out["schema"] = schema
    return out


def convert_fragment(path: str, fragment: dict, own_prefix: str, short: str,
                     externals: dict) -> dict:
    """Convert one swagger-2.0 module fragment to this repo's OpenAPI 3 shape."""
    defs = fragment.get("definitions", {})
    fresh_paths: dict = {}
    for route, item in fragment.get("paths", {}).items():
        if not isinstance(item, dict):
            continue
        fresh_item: dict = {}
        for method, op in item.items():
            if method.startswith("x-") or not isinstance(op, dict):
                continue
            new_op: dict = {"summary": op.get("summary", "")}
            rpc = str(op.get("operationId") or "RPC").split("_")[0]
            new_op["operationId"] = f"{rpc}_{short}"
            if op.get("parameters"):
                new_op["parameters"] = [convert_param(p) for p in op["parameters"]]
            responses: dict = {}
            for status, resp in (op.get("responses") or {}).items():
                if not isinstance(resp, dict):
                    continue
                new_resp: dict = {"description": resp.get("description", "")}
                if isinstance(resp.get("schema"), dict):
                    new_resp["content"] = {
                        "application/json": {
                            "schema": inline_schema(resp["schema"], defs, own_prefix)
                        }
                    }
                responses[str(status)] = new_resp
            new_op["responses"] = responses
            fresh_item[method] = new_op
        fresh_paths[route] = fresh_item
    # Collect externally-owned definitions referenced anywhere in this module.
    wanted: set[str] = set()

    def collect(node) -> None:
        if isinstance(node, dict):
            ref = node.get("$ref")
            if isinstance(ref, str) and ref.startswith("#/components/schemas/"):
                wanted.add(ref.removeprefix("#/components/schemas/"))
            for v in node.values():
                collect(v)
        elif isinstance(node, list):
            for v in node:
                collect(v)

    collect(fresh_paths)
    for name in wanted:
        if name in defs and name not in externals:
            externals[name] = defs[name]
    return fresh_paths


def reachable_schemas(spec: dict) -> set[str]:
    found: set[str] = set()

    def walk(node) -> None:
        if isinstance(node, dict):
            ref = node.get("$ref")
            if isinstance(ref, str) and ref.startswith("#/components/schemas/"):
                found.add(ref.removeprefix("#/components/schemas/"))
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)

    walk(spec.get("paths", {}))
    # Schemas referencing schemas: close over the fixpoint.
    schemas = spec.get("components", {}).get("schemas", {})
    changed = True
    while changed:
        changed = False
        for name in list(found):
            before = len(found)
            walk(schemas.get(name, {}))
            changed = changed or len(found) > before
    return found


def main() -> int:
    try:
        roots = resolve_roots()
    except subprocess.CalledProcessError as e:
        print(f"go toolchain lookup failed: {e}", file=sys.stderr)
        return 1
    for key in ("chain", "zkwasmd", "ibcgo"):
        if not (roots[key] / "buf.yaml").exists():
            print(f"buf workspace not found at {roots[key]} (root {key!r})", file=sys.stderr)
            return 1
    missing = [(r, q) for r, q, _, _ in MODULES if not (roots[r] / q).exists()]
    if missing:
        print(f"query.protos not found: {missing}", file=sys.stderr)
        return 1

    if not shutil.which("buf"):
        print("buf not found on PATH", file=sys.stderr)
        return 1
    if not shutil.which(str(roots["_gobin"] / "protoc-gen-swagger")):
        print("protoc-gen-swagger not found; run:\n"
              "  go install github.com/grpc-ecosystem/grpc-gateway/protoc-gen-swagger@v1.16.0",
              file=sys.stderr)
        return 1

    # Report query.protos that exist but are not in the module table.
    known = {(r, q) for r, q, _, _ in MODULES}
    extra = sorted(
        str(p.relative_to(roots["chain"]))
        for p in roots["chain"].glob("terp/*/v*/query.proto")
    )
    extra = [q for q in extra if ("chain", q) not in known]
    if extra:
        print(f"note: query.protos not covered by MODULES table: {extra}")

    env = dict(os.environ, PATH=os.environ.get("PATH", "") + os.pathsep + str(roots["_gobin"]))
    fragments = {}
    with tempfile.TemporaryDirectory(prefix="terp-chain-api-") as tmp:
        outdir = Path(tmp) / "gen"
        outdir.mkdir()
        (Path(tmp) / "template.yaml").write_text(SWAGGER_TEMPLATE.format(outdir=outdir))
        by_root: dict[str, list[str]] = {}
        for r, q, _, _ in MODULES:
            by_root.setdefault(r, []).append(q)
        for r, files in by_root.items():
            path_args = [a for q in files for a in ("--path", q)]
            run(["buf", "generate", "--template", str(Path(tmp) / "template.yaml"), *path_args],
                cwd=roots[r], env=env)
        for r, q, prefix, short in MODULES:
            frag = outdir / Path(q).parent / "query.swagger.json"
            data = json.loads(frag.read_text())
            own = proto_package(roots[r] / q)
            # Sanity: generated routes should match the proto's http rules.
            http_rules = len(re.findall(r"option\s+\(google\.api\.http\)",
                                        (roots[r] / q).read_text()))
            if len(data.get("paths", {})) != http_rules:
                print(f"warn: {q}: {http_rules} http rules but "
                      f"{len(data.get('paths', {}))} generated paths")
            fragments[(prefix, short)] = (data, own)

    managed = tuple(dict.fromkeys([prefix for _, _, prefix, _ in MODULES] + list(STALE_PREFIXES)))

    spec = yaml.safe_load(SRC.read_text())
    old_paths = spec.get("paths", {}) or {}
    dropped = sorted(p for p in old_paths if p.startswith(managed))
    for p in dropped:
        del old_paths[p]

    externals: dict = {}
    fresh: dict = {}
    for (prefix, short), (data, own) in fragments.items():
        fresh.update(convert_fragment(prefix, data, own, short, externals))

    added = sorted(fresh)
    for route in added:
        old_paths[route] = fresh[route]
    spec["paths"] = old_paths

    schemas = spec.setdefault("components", {}).setdefault("schemas", {})
    added_schemas = sorted(n for n in externals if n not in schemas)
    for name in added_schemas:
        schemas[name] = externals[name]

    # Drop orphaned schemas owned by managed modules (stale clock types etc.).
    keep = reachable_schemas(spec)
    pruned = sorted(
        n for n in schemas
        if n.startswith(MANAGED_SCHEMA_PREFIXES) and n not in keep
    )
    for n in pruned:
        del schemas[n]

    SRC.write_text(yaml.safe_dump(spec, sort_keys=False, allow_unicode=True), encoding="utf-8")
    print(f"wrote {SRC} ({SRC.stat().st_size} bytes)")
    print(f"paths: +{len(added)} refreshed, -{len(dropped)} removed")
    for route in added:
        print(f"  + {route}")
    for route in dropped:
        if route not in fresh:
            print(f"  - {route} (stale, no proto source)")
    print(f"schemas: +{len(added_schemas)} shared, -{len(pruned)} orphaned")
    for name in added_schemas:
        print(f"  + schema {name}")
    for name in pruned:
        print(f"  - schema {name}")

    run([sys.executable, str(ROOT / "scripts" / "group-openapi.py")], cwd=ROOT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
