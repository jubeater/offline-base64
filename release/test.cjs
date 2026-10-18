"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const extension = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(extension, "popup.js"), "utf8");
const html = fs.readFileSync(path.join(extension, "popup.html"), "utf8");

function ui({ denyClipboard = false } = {}) {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  const elements = Object.fromEntries(ids.map(id => [id, {
    value: "", checked: false, disabled: ["copy", "reverse", "swap", "download"].includes(id),
    textContent: "", placeholder: "", handlers: {}, selected: false,
    classList: { toggle() {} },
    addEventListener(event, callback) { this.handlers[event] = callback; },
    focus(options) { this.focusOptions = options; },
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
    select() { this.selected = true; },
    click() { if (!this.disabled) return this.handlers.click?.(); }
  }]));
  const state = { copied: null, blob: null, downloadName: null, networkCalls: 0 };
  const denyNetwork = () => { state.networkCalls++; throw new Error("Network access attempted"); };
  const context = vm.createContext({
    TextEncoder, TextDecoder, Uint8Array, Blob, btoa, atob, Intl, Error, TypeError,
    setTimeout: callback => { callback(); return 0; },
    fetch: denyNetwork, WebSocket: denyNetwork, XMLHttpRequest: denyNetwork,
    navigator: { clipboard: { async writeText(value) {
      if (denyClipboard) throw new Error("Clipboard unavailable");
      state.copied = value;
    } } },
    document: {
      getElementById(id) { assert.ok(elements[id], `Missing real HTML control ${id}`); return elements[id]; },
      body: { append() {} },
      createElement() { return { click() { state.downloadName = this.download; }, remove() {} }; }
    },
    URL: { createObjectURL(blob) { state.blob = blob; return "blob:local-test"; }, revokeObjectURL() {} }
  });
  vm.runInContext(source, context);
  return {
    elements, state, click: id => elements[id].click(),
    input(value) { elements.input.value = value; elements.input.handlers.input(); }
  };
}

test("RFC 4648 encoding vectors and decoding round trips", () => {
  const app = ui();
  for (const [text, base64] of [["", ""], ["f", "Zg=="], ["fo", "Zm8="], ["foo", "Zm9v"], ["foobar", "Zm9vYmFy"]]) {
    app.input(text); app.click("encode"); assert.equal(app.elements.output.value, base64);
    app.input(base64); app.click("decode"); assert.equal(app.elements.output.value, text);
  }
  assert.equal(app.state.networkCalls, 0);
});

test("Chinese, flags, emoji, combining marks and BOM survive conversion", () => {
  const app = ui();
  for (const text of ["中文 🚀", "🇯🇵 e\u0301 👩‍💻", "\uFEFFhello\nworld"]) {
    app.input(text); app.click("encode");
    assert.equal(app.elements.output.value, Buffer.from(text).toString("base64"));
    app.click("swap"); app.click("decode"); assert.equal(app.elements.output.value, text);
  }
});

test("a permitted Unicode input round-trips", () => {
  const app = ui(), text = "中文-test-🚀".repeat(1000);
  app.input(text); app.click("encode");
  assert.equal(app.elements.output.value, Buffer.from(text).toString("base64"));
  app.click("swap"); app.click("decode");
  assert.equal(app.elements.output.value, text);
});

test("URL-safe, unpadded and whitespace-wrapped Base64", () => {
  const app = ui();
  app.elements["url-safe"].checked = true;
  app.input("\uFFFF"); app.click("encode");
  assert.equal(app.elements.output.value, Buffer.from("\uFFFF").toString("base64url"));
  app.click("swap"); app.click("decode"); assert.equal(app.elements.output.value, "\uFFFF");
  app.input("5Lit 5paH\n8J+agA"); app.click("decode"); assert.equal(app.elements.output.value, "中文🚀");
});

test("reverse updates displayed, copied and downloaded UTF-8 bytes", async () => {
  const app = ui();
  for (const [text, reversed] of [["hello", "olleh"], ["A中🇯🇵👩‍💻e\u0301", "e\u0301👩‍💻🇯🇵中A"]]) {
    app.input(Buffer.from(text).toString("base64")); app.click("decode"); app.click("reverse");
    assert.equal(app.elements.output.value, reversed);
    await app.click("copy"); assert.equal(app.state.copied, reversed);
    app.click("download"); assert.equal(await app.state.blob.text(), reversed);
    assert.equal(app.state.downloadName, "decoded.txt");
    app.click("reverse"); assert.equal(app.elements.output.value, text);
  }
});

test("binary decoding preserves original bytes and disables text actions", async () => {
  const app = ui(); app.input("-_8"); app.click("decode");
  assert.equal(app.elements.copy.disabled, true); assert.equal(app.elements.reverse.disabled, true);
  app.click("download");
  assert.deepEqual(Buffer.from(await app.state.blob.arrayBuffer()), Buffer.from([251, 255]));
  assert.equal(app.state.downloadName, "decoded.bin");
});

test("invalid input clears stale results", () => {
  const app = ui(); app.input("hello"); app.click("encode");
  for (const value of ["%%%", "A", "a===", "\"aGVsbG8=\""]) {
    app.input(value); app.click("decode");
    assert.match(app.elements.status.textContent, /Invalid Base64/);
    assert.equal(app.elements.output.value, ""); assert.equal(app.elements.download.disabled, true);
  }
});

test("copy fallback selects text without reading clipboard", async () => {
  const app = ui({ denyClipboard: true }); app.input("aGVsbG8="); app.click("decode");
  await app.click("copy"); assert.equal(app.elements.output.selected, true);
  assert.match(app.elements.status.textContent, /Press Ctrl\+C/);
});

test("local file handling, file-size limit, clearing and reset", async () => {
  const app = ui();
  await app.elements.file.handlers.change({ target: { value: "file", files: [{
    size: 5, arrayBuffer: async () => new TextEncoder().encode("hello").buffer
  }] } });
  assert.equal(app.elements.input.value, "hello");
  await app.elements.file.handlers.change({ target: { value: "large", files: [{ size: 21 * 1024 * 1024 }] } });
  assert.match(app.elements.status.textContent, /32,000 characters/);
  app.click("encode"); app.click("clear");
  assert.equal(app.elements.input.value, ""); assert.equal(app.elements.output.value, "");
  assert.equal(app.elements.reverse.disabled, true); assert.equal(app.elements.download.disabled, true);
});

test("size boundaries preserve a reversible result and reject expansion beyond the limit", () => {
  const app = ui();
  const text = "a".repeat(24000);
  app.input(text); app.click("encode");
  assert.equal(app.elements.output.value.length, 32000);
  app.click("swap"); app.click("decode");
  assert.equal(app.elements.output.value, text);
  assert.equal(app.elements.input.focusOptions.preventScroll, true);
  app.input(text + "a"); app.click("encode");
  assert.equal(app.elements.output.value, "");
  assert.match(app.elements.status.textContent, /Encoded result would exceed/);
  app.input("a".repeat(32001));
  assert.equal(app.elements.encode.disabled, true);
  assert.equal(app.elements.decode.disabled, true);
  assert.match(app.elements.status.textContent, /Limit: 32,000/);
  app.input("hello"); app.click("encode");
  assert.equal(app.elements.output.value, "aGVsbG8=");
});

test("oversized pastes and files keep the existing input and result intact", async () => {
  const app = ui(); app.input("hello"); app.click("encode");
  app.elements.input.setSelectionRange(0, 5);
  let prevented = false;
  app.elements.input.handlers.paste({
    clipboardData: { getData: () => "x".repeat(32001) },
    preventDefault() { prevented = true; }
  });
  assert.equal(prevented, true);
  assert.equal(app.elements.input.value, "hello");
  assert.equal(app.elements.output.value, "aGVsbG8=");
  await app.elements.file.handlers.change({ target: { value: "file", files: [{
    size: 32001, arrayBuffer: async () => new TextEncoder().encode("x".repeat(32001)).buffer
  }] } });
  assert.equal(app.elements.input.value, "hello");
  assert.equal(app.elements.output.value, "aGVsbG8=");
  assert.match(app.elements.status.textContent, /32,000/);
  // Selecting the old input allows a full-size replacement, without counting it twice.
  prevented = false;
  app.elements.input.handlers.paste({
    clipboardData: { getData: () => "x".repeat(32000) },
    preventDefault() { prevented = true; }
  });
  assert.equal(prevented, false);
});

test("successful copy leaves focus and selection alone", async () => {
  const app = ui(); app.input("hello"); app.click("encode");
  await app.click("copy");
  assert.equal(app.elements.output.selected, false);
  assert.equal(app.elements.output.focusOptions, undefined);
});

test("manifest is MV3, permission-free, local-only, and refers to valid PNG icons", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(extension, "manifest.json"), "utf8"));
  assert.equal(manifest.manifest_version, 3);
  for (const key of ["permissions", "host_permissions", "optional_permissions", "optional_host_permissions", "background", "content_scripts", "update_url"]) assert.equal(manifest[key], undefined);
  assert.ok(manifest.description.length <= 132);
  const csp = manifest.content_security_policy.extension_pages;
  for (const directive of ["connect-src 'none'", "script-src 'self'", "frame-src 'none'", "worker-src 'none'"]) assert.ok(csp.includes(directive));
  assert.ok(!csp.includes("unsafe-eval"));
  for (const [size, filename] of Object.entries(manifest.icons)) {
    const png = fs.readFileSync(path.join(extension, filename));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), Number(size)); assert.equal(png.readUInt32BE(20), Number(size));
  }
  assert.ok(!/https?:\/\//.test(source));
  assert.ok(!/localStorage|sessionStorage|chrome\.storage/.test(source));
  assert.ok(!/https?:\/\//.test(html));
});
