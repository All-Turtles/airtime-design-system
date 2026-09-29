#!/bin/sh
# Full pipeline. Needs the dev app on :3000 for --extract only; the rest is offline.
cd "$(dirname "$0")"
[ "$1" = "--extract" ] && { node extract-vars.mjs && node flatten-source.mjs && node ledger.mjs; }
node sync-org.mjs && node build-tokens.mjs >/dev/null && node resolve-tokens.mjs && node build-tokens.mjs >/dev/null && node verify-tokens.mjs && node check-vars.mjs && node audit-join.mjs >/dev/null && node build-org-layer.mjs >/dev/null && echo "pipeline ok"
