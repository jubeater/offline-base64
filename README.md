# Offline Base64 for Chrome

A small Manifest V3 extension for encoding/decoding Base64 in the browser.
No build tools or dependencies are required.

## Install locally

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and choose this `offline-base64-extension` folder.
4. Pin **Offline Base64** in Chrome's Extensions menu.

Click its toolbar icon to paste text and encode/decode. For a larger workspace,
click **Open in a tab** before entering data. A popup's contents are discarded
when it closes; a tab keeps them until you close or reload that tab.

## Features

- UTF-8 text, Chinese, and emoji support.
- Standard Base64 and URL-safe Base64 decoding, with or without padding.
- Optional URL-safe encoding without padding.
- **Reverse result** beside **Copy result**: decode first, then reverse the text
  before copying or saving. Chinese, emoji, and combining marks stay intact.
- Input and results are limited to 32,000 characters per box to keep the popup
  responsive. Oversized pastes and files are rejected without truncation.
  Encoding is rejected if its expanded Base64 result would exceed the limit.
  Supplementary Unicode characters such as many emoji count as two characters.
- Local UTF-8 text-file input (at most 32,000 characters, up to 96 KB), copying,
  and downloading results.
- Binary Base64 can be decoded and downloaded as `decoded.bin`.

## Network and permissions

The manifest requests **no permissions** and **no host permissions**. There are
no content scripts, background workers, remote libraries, analytics, or network
calls. A Content Security Policy explicitly sets `connect-src 'none'`, blocks
frames/workers, and permits scripts/styles only from the local package. No
history or input is stored by the extension. Text you explicitly paste is
handled locally, including checking the size limit. The extension writes to
the clipboard only when you click **Copy result**; if Chrome denies it, the
result is selected for manual copying. Downloads happen only when you click
**Download result**.

Chrome itself and other installed extensions have their own independent network
behavior. This extension does not control those.

Source files are `manifest.json`, `popup.html`, `popup.css`, and `popup.js`.
You can inspect all of them before loading. There is no updater in this package.

Chrome's official unpacked-extension instructions:
https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

## Development and releases

Run the conversion, input-limit, privacy, and icon checks with Node.js:

```sh
node release/test.cjs
```

Build the Chrome Web Store upload ZIP with Python and Pillow. The artwork
generator also requires Noto Sans and Noto Sans Mono fonts in
`/usr/share/fonts/noto/`:

```sh
python3 -m pip install Pillow
python3 release/build.py
```

The builder reads the version from `manifest.json` and includes only the eight
runtime files in `release/offline-base64-VERSION.zip`. Documentation, tests,
screenshots and repository files are excluded. Published ZIPs and checksums are
available from [GitHub Releases](https://github.com/jubeater/offline-base64/releases).

The `release/` directory contains store listing text, screenshots, the privacy
policy, browser validation notes, and a screenshot helper. See
[publication materials](release/README.md) and the
[privacy policy](https://jubeater.github.io/offline-base64/privacy-policy.html).

The policy is hosted on GitHub Pages from `main` → `/docs`. Edit
`release/privacy-policy.html`, run `python3 release/build.py` to refresh the
published copy in `docs/`, and commit and push both files to update it.
