# Chrome Web Store listing draft

Publisher display name: **jubeater**

Public support email: **zhangtianlin15@gmail.com**

Extension name: **Offline Base64**

Version: **1.0.1**

Language: **English**

Suggested category: **Developer Tools** (choose the closest available Tools category)

Price: **Free**

## Short description

Encode and decode Base64 locally. No permissions, network requests, or saved history.

## Detailed description

Convert Base64 without pasting your text into a website. Offline Base64 processes
your input directly in Chrome, using only code packaged with the extension.

Features:
- Encode UTF-8 text to Base64 and decode Base64 back to text.
- Work with Chinese, emoji, and other Unicode text.
- Decode standard or URL-safe Base64, including unpadded and multiline input.
- Generate URL-safe Base64 without padding.
- Reverse the result after decoding, then copy or download it.
- Convert up to 32,000 characters per box, with a visible size limit.
- Open local UTF-8 text files within that limit (up to 96 KB).
- Decode binary Base64 and download the original bytes.
- Open the converter in a tab when you want a larger workspace.

Privacy:
- No extension permissions or website-access permissions requested.
- No network requests, analytics, advertising, accounts, or remote scripts.
- Network connections are blocked by the extension's Content Security Policy.
- No conversion history or input is saved by the extension.
- Copying and downloading happen only when you click the corresponding button.

The toolbar popup clears its contents when it closes. Use Open in a tab if you
want to keep working until you close or reload that tab.

Base64 is an encoding format, not encryption. This extension does not encrypt
your information or change the behavior of Chrome, your clipboard, or other
extensions.

Support: zhangtianlin15@gmail.com

## Single purpose

Encode, decode, and reverse Base64 conversion results locally in Chrome, with
user-triggered file, copy, and download controls.

## Privacy practices fields

- Remote code: **No, I am not using remote code.**
- Permissions justification: **Not applicable; the manifest requests no permissions.**
- Host permissions: **None.**
- Data collection: **No data is collected by or transmitted to the publisher or
  third parties.** Pasted text and selected file contents are processed only in
  memory to perform the requested conversion. The privacy policy describes this
  local handling. Complete the dashboard fields consistently with these facts;
  do not describe the extension as never processing data.
- Limited-use certifications: Review and complete Google's required declarations
  truthfully. The extension does not sell data, use it for unrelated purposes,
  or use it to determine creditworthiness or lending eligibility.
- Privacy policy URL: **Pending public hosting of privacy-policy.html.**

## Review/test instructions

No login or paid account is needed to use the extension.

1. Open the toolbar popup. Its content width should be 600 pixels, plus any native scrollbar.
2. Enter `hello` and click Encode. Result: `aGVsbG8=`.
3. Click Use as input, then Decode. Result: `hello`.
4. Click Reverse result. Result: `olleh`. Click Copy result or Download result.
5. Try Unicode text such as `中文 🚀` and verify encode/decode preserves it.
6. Try URL-safe output and unpadded Base64 input.
7. Open a local text file and perform a conversion.
8. Decode `/w==`; the extension offers a binary download instead of corrupting it
   into text.
9. Disconnect networking and repeat conversion; it works offline.
10. Use Open in a tab to view the same converter in a larger workspace.
11. Oversized pastes/files are rejected without truncation. Encoding is rejected
    if its Base64 result would exceed 32,000 characters. Use as input then Decode
    remains available for any permitted encoding result.

## Required assets

- Upload package: `offline-base64-1.0.1.zip`.
- Store icon: `../icons/icon128.png`.
- Small promotional image: `assets/promo-440x280.png`.
- Actual screenshots: `assets/screenshot-01-encode-1280x800.png` and
  `assets/screenshot-02-reverse-1280x800.png`.

The ZIP does not include these store documents, the support email, test fixtures,
or any proxy credentials.
