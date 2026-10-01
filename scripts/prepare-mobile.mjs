import { cp, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const www = new URL("../www/", import.meta.url);

await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });

const entries = [
  ["index.html", "index.html"],
  ["manifest.webmanifest", "manifest.webmanifest"],
  ["logo.png", "logo.png"],
  ["version.json", "version.json"],
  ["assets", "assets"],
  ["native/offline.html", "offline.html"]
];

for (const [source, target] of entries) {
  await cp(new URL(source, root), new URL(target, www), {
    recursive: true,
    force: true
  });
}

console.log("Arcanum web assets prepared in www/");
