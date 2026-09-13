#!/bin/sh
# Regenerates the screenshot baselines in e2e/visual.spec.js-snapshots/ inside the
# same pinned Playwright image the CI visual job uses, so renders match exactly.
# Run after an intentional design change, look at every PNG, then commit them.
# `sh scripts/update-visual-baselines.sh check` compares without updating.
set -eu
MODE="${1:-update}"
cd "$(dirname "$0")/.."
docker run --rm --ipc=host -e MODE="$MODE" \
  -v "$PWD":/src:ro -v "$PWD/e2e":/out \
  mcr.microsoft.com/playwright@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27 /bin/bash -c '
    set -e
    mkdir -p /work
    cd /src && tar --exclude=./node_modules --exclude=./dist --exclude=./.git --exclude=./resume-src/node_modules -cf - . | tar -xf - -C /work
    cd /work && npm ci --no-audit --no-fund && npm run build
    if [ "$MODE" = check ]; then CI=1 npx playwright test e2e/visual.spec.js; exit; fi
    CI=1 npx playwright test e2e/visual.spec.js --update-snapshots
    rm -rf /out/visual.spec.js-snapshots && cp -r e2e/visual.spec.js-snapshots /out/'
