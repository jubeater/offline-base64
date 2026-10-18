# Version 1.0.1 validation

Checked on 2026-10-18 with local Chrome and agent-browser 0.39.0, using fictional
sample text only. No external websites or user credentials were used.

## Findings before the change

Twenty native pointer-driven encode → use as input → decode → use as input loops
with short Unicode text and varying clicks in both textareas passed. The user's
intermittent short-input freeze was not reproduced.

A 720,000-code-unit Unicode input (1.08 MB UTF-8, producing 1.44 million Base64
characters) caused visible pauses. Browser event-to-timer measurements were
approximately 199 ms for encode, 2,531 ms for decode and 1,382 ms for one transfer
to input. Long-task entries independently showed main-thread stalls. Temporarily
disabling textarea wrapping reduced these delays, indicating textarea work
contributed significantly. Conversion code alone was not established as the cause.

## Change

Following the user's preference for a small-input tool, cap both input and text
results at 32,000 UTF-16 code units, shown as characters in the interface. Reject
oversized pastes before insertion, and oversized UTF-8 files before replacing the
existing text. Check encoded length before constructing Base64. Do not truncate
data. Keep byte counters and wrapped textareas.

Reset the caret to the start and use `focus({preventScroll:true})` when moving a
result to input. Successful copying no longer forces focus/selection changes.
No worker, dependencies, permissions or network access were added.

## Checks after the change

- All 13 local code/package checks passed.
- Thirty native pointer-driven loops passed in the extension page at 615×600,
  with varying clicks in both textareas and output assertions after every
  encode/decode. Browser networking was disabled.
- Thirty additional loops passed in the actual Chrome action popup (615×600),
  using DOM button activation and varying field focus, yielding for a frame
  between loops. These exercised the real popup but did not simulate mouse
  coordinates inside the popup.
- The ASCII boundary of 24,000 input characters → 32,000 Base64 characters
  round-tripped through native clicks. Measured event-to-timer delays were
  6–57 ms in that sample, with no long-task entries. These are observations,
  not latency guarantees.
- Browser checks confirmed oversized paste rejection, disabled conversion for
  oversized programmatic input, and recovery after Clear.
- Browser error and console logs were empty during conversion checks.
- The 615×600 page screenshot was visually reviewed. Store screenshots show
  the actual extension page, not a mockup.

The change removes the reproduced oversized-input path and prevents forced
page-scroll jumps. It does not establish the cause of every possible
intermittent freeze with short text.
