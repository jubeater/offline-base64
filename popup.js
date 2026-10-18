"use strict";

const byId = (id) => document.getElementById(id);
const input = byId("input");
const output = byId("output");
const encoder = new TextEncoder();
const MAX_CHARACTERS = 32000;
const LIMIT_MESSAGE = "Limit: 32,000 characters per box. Use a smaller input.";
let resultBytes = null;
let resultName = "result.txt";

function status(message, error = false) {
  byId("status").textContent = message;
  byId("status").classList.toggle("error", error);
}

function resetResult() {
  output.value = "";
  output.placeholder = "Your result appears here…";
  resultBytes = null;
  byId("output-count").textContent = "0 bytes";
  for (const id of ["copy", "reverse", "swap", "download"]) byId(id).disabled = true;
  const tooLong = input.value.length > MAX_CHARACTERS;
  byId("encode").disabled = byId("decode").disabled = tooLong;
  byId("input-count").textContent = tooLong
    ? `${input.value.length.toLocaleString()} characters (too long)`
    : `${encoder.encode(input.value).length.toLocaleString()} bytes`;
}

function setResult(text, bytes, filename) {
  output.value = text;
  output.setSelectionRange(0, 0);
  output.scrollTop = output.scrollLeft = 0;
  resultBytes = bytes;
  resultName = filename;
  byId("output-count").textContent = `${bytes.length.toLocaleString()} bytes`;
  byId("copy").disabled = byId("reverse").disabled = byId("swap").disabled = text.length === 0;
  byId("download").disabled = false;
}

byId("encode").addEventListener("click", () => {
  resetResult();
  if (input.value.length > MAX_CHARACTERS) { status(LIMIT_MESSAGE, true); return; }
  const bytes = encoder.encode(input.value);
  let encodedLength = 4 * Math.ceil(bytes.length / 3);
  if (byId("url-safe").checked) encodedLength -= (3 - bytes.length % 3) % 3;
  if (encodedLength > MAX_CHARACTERS) {
    status("Encoded result would exceed 32,000 characters. Use a smaller input.", true);
    return;
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  }
  let base64 = btoa(binary);
  if (byId("url-safe").checked) base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  setResult(base64, encoder.encode(base64), "encoded.txt");
  status(`Encoded ${bytes.length.toLocaleString()} bytes.`);
});

byId("decode").addEventListener("click", () => {
  resetResult();
  if (input.value.length > MAX_CHARACTERS) { status(LIMIT_MESSAGE, true); return; }
  try {
    const base64 = input.value.replace(/\s/g, "").replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    try {
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
      setResult(text, bytes, "decoded.txt");
      status(`Decoded ${bytes.length.toLocaleString()} bytes of UTF-8 text.`);
    } catch {
      setResult("", bytes, "decoded.bin");
      output.placeholder = "Decoded binary data. Use Download result to save it.";
      status(`Decoded ${bytes.length.toLocaleString()} binary bytes. Use Download result to save them.`);
    }
  } catch {
    status("Invalid Base64. Paste the encoded text without surrounding quotes or a URI prefix.", true);
  }
});

byId("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    status("Copied result.");
  } catch {
    output.focus({ preventScroll: true });
    output.select();
    status("Result selected. Press Ctrl+C (or ⌘C) to copy.");
  }
});

byId("reverse").addEventListener("click", () => {
  if (!output.value) return;
  // Reverse visible characters while keeping emoji and combining marks intact.
  const segments = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(output.value);
  const reversed = Array.from(segments, (part) => part.segment).reverse().join("");
  setResult(reversed, encoder.encode(reversed), resultName);
  status("Result reversed.");
});

byId("swap").addEventListener("click", () => {
  input.value = output.value;
  input.setSelectionRange(0, 0);
  input.scrollTop = input.scrollLeft = 0;
  resetResult();
  input.focus({ preventScroll: true });
  status("Result moved to input.");
});

byId("clear").addEventListener("click", () => {
  input.value = "";
  byId("file").value = "";
  resetResult();
  input.focus({ preventScroll: true });
  status("Cleared.");
});

function inputChanged() {
  resetResult();
  status(input.value.length > MAX_CHARACTERS ? LIMIT_MESSAGE : "Ready.", input.value.length > MAX_CHARACTERS);
}
input.addEventListener("input", inputChanged);
input.addEventListener("paste", (event) => {
  const pasted = event.clipboardData?.getData("text/plain");
  if (pasted === undefined) return;
  const selectedLength = input.selectionEnd - input.selectionStart;
  if (input.value.length - selectedLength + pasted.length > MAX_CHARACTERS) {
    event.preventDefault();
    status("Paste exceeds 32,000 characters. Existing text kept; nothing was truncated.", true);
  }
});
byId("url-safe").addEventListener("change", inputChanged);
byId("open-file").addEventListener("click", () => byId("file").click());
byId("file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    // A UTF-8 character uses at most three bytes per UTF-16 code unit.
    // Reject oversized files before reading them, then check the decoded length.
    if (file.size > MAX_CHARACTERS * 3) throw new Error("Choose a UTF-8 text file with at most 32,000 characters (up to 96 KB).");
    const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(await file.arrayBuffer());
    if (text.length > MAX_CHARACTERS) throw new Error(LIMIT_MESSAGE);
    input.value = text;
    resetResult();
    status("Text file opened locally.");
  } catch (error) {
    status(error instanceof TypeError ? "This file is not UTF-8 text." : error.message, true);
  }
  event.target.value = "";
});

byId("download").addEventListener("click", () => {
  if (resultBytes === null) return;
  const url = URL.createObjectURL(new Blob([resultBytes], { type: "application/octet-stream" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = resultName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
