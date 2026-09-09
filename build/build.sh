#!/bin/sh
# Rebuild the deployable site from the authored sources.
#   ./build/build.sh [https://your-site.example]
# Requires: node (npx tailwindcss) and python3 (stdlib only).
set -e
cd "$(dirname "$0")/.."

python3 build/transform.py            # index.orig.html  -> src/_generated/body.html.part
python3 build/assemble.py "$@"        # + src/head.html  -> index.html
cp src/no-js.css assets/css/no-js.css
npx tailwindcss -c tailwind.config.js -i src/tailwind.input.css \
                -o assets/css/styles.css --minify
echo "Built: index.html, assets/css/{styles,no-js}.css, js/main.js"
