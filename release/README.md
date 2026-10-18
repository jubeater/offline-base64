# Offline Base64 — publication materials

Publisher: **jubeater**

Public support email: **zhangtianlin15@gmail.com**

## Prepared

- Runtime source and icon PNGs: the repository root (`../`).
- Upload package: `offline-base64-1.0.1.zip` (manifest at ZIP root).
- Detailed listing, privacy fields, and reviewer instructions: `store-listing.md`.
- Standalone privacy policy ready to host publicly: `privacy-policy.html`.
- Small promotional image: `assets/promo-440x280.png`.
- Asset-generation source: `build.py`.
- Automated conversion/package checks: `test.cjs`.
- Local Chrome validation and screenshot helper: `capture-screenshots.sh`.
- Browser validation notes: `qa-notes.md`.
- Release history: `CHANGELOG.md`.

## Remaining before submission

1. The user has paid Google's developer registration fee. Complete any remaining
   account/email/security checks in the developer dashboard.
   Use **jubeater** as the public display name. Supply accurate legal/payment
   details separately wherever Google requests them, and determine your own
   trader/non-trader declaration.
2. Host `privacy-policy.html` at a publicly readable URL. A public GitHub Pages
   page, your existing site, or a public GitHub gist of the policy can work. Do
   not submit a local file path as the store's privacy-policy URL. Publishing
   this policy discloses the chosen public support email.
3. Review the actual 1280x800 Chrome screenshots in `assets/`. To refresh them,
   run `bash capture-screenshots.sh` outside a restricted shell, or load the
   extension manually, open it in a tab, and capture 1280x800 or 640x400 images.
   Do not use the promotional image as a substitute for a screenshot.
4. In the developer dashboard, create an item, upload the ZIP, paste the listing,
   supply the public policy URL and images, and complete the privacy fields.
5. Submit for review. The package has not been uploaded, submitted, or published
   by this session. Google determines approval.

Version 1.0.1 was tested in Chrome; see `qa-notes.md`. The current source and
upload ZIP contain the fixes. Generated ZIPs are excluded from Git; published
packages and checksums belong in GitHub Releases. Nothing has been uploaded
to or submitted through the Chrome Web Store by these repository scripts.

## Rebuild and test

Run from the repository root:

```sh
python3 release/build.py
node release/test.cjs
bash release/capture-screenshots.sh
```

`build.py` uses Pillow for icon and promotional-image generation, but the
extension itself has no runtime dependencies. Rebuilding writes only the
extension's generated icons and files in this release directory.

## Official references

- Registration: https://developer.chrome.com/docs/webstore/register
- Account details: https://developer.chrome.com/docs/webstore/set-up-account
- Trader declaration: https://developer.chrome.com/docs/webstore/program-policies/trader-verification-faq
- Privacy fields: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- Image requirements: https://developer.chrome.com/docs/webstore/images
- Upload/review: https://developer.chrome.com/docs/webstore/publish
