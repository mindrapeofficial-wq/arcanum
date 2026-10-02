import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile(new URL("../parity/original-parity.json", import.meta.url), "utf8"));

function gitBlobSha(content) {
  const body = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return createHash("sha1").update(Buffer.from(`blob ${body.length}\0`)).update(body).digest("hex");
}

function fnv1a64(str) {
  let h = 0xcbf29ce484222325n;
  const p = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < str.length; i++) {
    h ^= BigInt(str.charCodeAt(i));
    h = (h * p) & mask;
  }
  return h.toString(16).padStart(16, "0");
}

function mechanicsOnly(records) {
  return records.map(record => {
    const copy = structuredClone(record);
    for (const field of manifest.displayOnlyFields) delete copy[field];
    return copy;
  });
}

test("core engine files remain byte-identical to pinned original", async () => {
  for (const [path, expected] of Object.entries(manifest.exactOriginalFiles)) {
    const content = await readFile(new URL("../" + path, import.meta.url));
    assert.equal(gitBlobSha(content), expected, path + " diverged from original");
  }
});

test("rebranded data preserves all original mechanics", async () => {
  for (const [path, expected] of Object.entries(manifest.mechanicalDataHashes)) {
    const records = JSON.parse(await readFile(new URL("../" + path, import.meta.url), "utf8"));
    const actual = fnv1a64(JSON.stringify(mechanicsOnly(records)));
    assert.equal(actual, expected, path + " changed a non-display mechanic");
  }
});
