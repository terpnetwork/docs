# terp-docs — development & operations
# usage: just <recipe>    or    just --list

set dotenv-load := false
set shell := ["bash", "-euo", "pipefail", "-c"]

docs_dir := justfile_directory()

# ─── Development ────────────────────────────────────────────────

# install dependencies
install:
    pnpm install

# start the dev server
dev:
    pnpm dev

# ─── Build & Validate ──────────────────────────────────────────

# production build — Vocs full-static + curate out/ for S3
build:
    pnpm build

# mirror out/ to MinIO (same mc workflow as terp.network)
deploy-static:
    bash scripts/deploy-static.sh

# print nginx install hint (Vocs origin — not the old Next app)
nginx-hint:
    echo "sudo cp {{docs_dir}}/nginx/docs.terp.network.conf /etc/nginx/sites-available/docs.terp.network.conf"
    echo "sudo ln -sf /etc/nginx/sites-available/docs.terp.network.conf /etc/nginx/sites-enabled/"
    echo "sudo nginx -t && sudo systemctl reload nginx"
    echo "Point CF origin for docs.terp.network at this host. Live /_next means origin is still Fumadocs."

# typecheck
typecheck:
    pnpm types:check

# lint
lint:
    pnpm lint

# check for broken internal markdown / MDX links (Vocs src/pages)
check-links:
    ./scripts/check-links.sh

# heading-only pages must set status: stub
check-stubs:
    ./scripts/check-stubs.sh

# diagram/visualizer scaffold inventory (use --label --write to normalize)
check-scaffolds *args:
    python3 scripts/check-scaffolds.py {{args}}

# frontmatter-only empty docs
check-empty:
    ./scripts/check-empty.sh

# run all content checks against src/pages
check: check-links check-stubs check-empty check-scaffolds

# ─── Utilities ──────────────────────────────────────────────────

# start production server (after build)
start:
    pnpm preview

# clean build artifacts
clean:
    rm -rf {{docs_dir}}/.next {{docs_dir}}/.source {{docs_dir}}/.vocs {{docs_dir}}/dist

# show git status
status:
    git status -sb
