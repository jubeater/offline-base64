# Changelog

## 1.0.1

- Show a 32,000-character limit beneath the input field.
- Reject oversized pastes and files without truncating text or replacing the
  existing result.
- Reject encoding when its expanded Base64 result would exceed the same limit.
- Prevent automatic page scrolling when moving a result back to input.
- Keep focus and selection unchanged after a successful copy.

Checked with 13 automated tests and 60 browser conversion loops. See
`qa-notes.md` for the test scope and remaining uncertainty about intermittent
short-input freezes.

## 1.0.0

- Local UTF-8 Base64 encoding and standard/URL-safe decoding.
- Grapheme-aware result reversal.
- Local text-file input, copying, text/binary downloads, and a larger tab view.
- No requested extension permissions, network requests, analytics or saved
  conversion history.
