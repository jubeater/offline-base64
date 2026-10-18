#!/usr/bin/env bash
# Run locally outside the restricted Codex session. Uses only fictional data.
set -euo pipefail
BASE64_RELEASE_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BASE64_EXTENSION_DIR="$(cd -- "$BASE64_RELEASE_DIR/.." && pwd -P)"
command -v agent-browser >/dev/null || { echo 'agent-browser is required; alternatively capture the loaded extension manually.' >&2; exit 1; }
BASE64_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix offline-base64-store)"
# Chromium derives an unpacked extension ID from its canonical filesystem path.
BASE64_EXTENSION_ID="$(python3 - "$BASE64_EXTENSION_DIR" <<'PY'
import hashlib, sys
digest = hashlib.sha256(sys.argv[1].encode()).hexdigest()[:32]
print(''.join(chr(ord('a') + int(char, 16)) for char in digest))
PY
)"
trap 'agent-browser --session "$BASE64_BROWSER_SESSION" close >/dev/null 2>&1 || true' EXIT
mkdir -p "$BASE64_RELEASE_DIR/assets"
agent-browser --session "$BASE64_BROWSER_SESSION" --extension "$BASE64_EXTENSION_DIR" open "chrome-extension://$BASE64_EXTENSION_ID/popup.html"
agent-browser --session "$BASE64_BROWSER_SESSION" set viewport 1280 800
agent-browser --session "$BASE64_BROWSER_SESSION" set offline on
agent-browser --session "$BASE64_BROWSER_SESSION" fill '#input' 'Hello from Offline Base64!'
agent-browser --session "$BASE64_BROWSER_SESSION" click '#encode'
agent-browser --session "$BASE64_BROWSER_SESSION" eval --stdin <<'JS'
if (document.getElementById('output').value !== 'SGVsbG8gZnJvbSBPZmZsaW5lIEJhc2U2NCE=') throw new Error('Encoding check failed');
'Encoding passed with browser networking disabled.';
JS
agent-browser --session "$BASE64_BROWSER_SESSION" screenshot "$BASE64_RELEASE_DIR/assets/screenshot-01-encode-1280x800.png"
agent-browser --session "$BASE64_BROWSER_SESSION" click '#swap'
agent-browser --session "$BASE64_BROWSER_SESSION" click '#decode'
agent-browser --session "$BASE64_BROWSER_SESSION" click '#reverse'
agent-browser --session "$BASE64_BROWSER_SESSION" eval --stdin <<'JS'
if (document.getElementById('output').value !== '!46esaB enilffO morf olleH') throw new Error('Decode/reverse check failed');
'Decode and reverse passed with browser networking disabled.';
JS
agent-browser --session "$BASE64_BROWSER_SESSION" screenshot "$BASE64_RELEASE_DIR/assets/screenshot-02-reverse-1280x800.png"
printf 'Captured real screenshots in %s/assets/. Review them before uploading.\n' "$BASE64_RELEASE_DIR"
