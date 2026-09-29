#!/bin/sh
# Full pipeline. Needs the dev app on :3000 for steps 1-3.  Steps 4-6 are offline.
cd "$(dirname "$0")"
[ "$1" = "--extract" ] && { node extract-vars.mjs && node flatten-source.mjs && node ledger.mjs; }
node build-tokens.mjs >/dev/null && node resolve-tokens.mjs && node build-tokens.mjs && node verify-tokens.mjs
