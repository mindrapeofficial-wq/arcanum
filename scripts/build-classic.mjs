// Builds the static ARCANUM Classic site into dist-classic/.
//
// Classic is the same client, the same Supabase project, accounts and world as ARCANUM; the only difference is the
// edition flag, which hides the role-playing layer (see assets/js/edition.js). Render runs this as the build command
// of the "arcanumclassic" static site and publishes dist-classic:
//
//   Build command:  node scripts/build-classic.mjs
//   Publish path:   dist-classic
//
// The same file works locally:  node scripts/build-classic.mjs && npx http-server dist-classic

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist-classic");

export function classicIndexHtml(html) {
  let result = html;
  if (!/<script defer src="assets\/js\/edition\.js/.test(result)) throw new Error("index.html does not load edition.js");
  // El producto se llama ARCANUM y conserva su identidad propia: no se renombra el título
  // ni la descripción. La única diferencia de esta build es la bandera de edición.
  // The flag must exist before edition.js runs.
  result = result.replace(
    /(\s*)<script defer src="assets\/js\/edition\.js/,
    '$1<script>window.ARCANUM_EDITION="classic";</script>$1<script defer src="assets/js/edition.js',
  );
  if (!result.includes('window.ARCANUM_EDITION="classic"')) throw new Error("could not inject the edition flag");
  return result;
}

export function classicManifest(manifestText) {
  // El manifest mantiene la identidad ARCANUM (igual que la edición estándar).
  return manifestText;
}

function build() {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  fs.writeFileSync(path.join(out, "index.html"), classicIndexHtml(fs.readFileSync(path.join(root, "index.html"), "utf8")));
  fs.writeFileSync(path.join(out, "manifest.webmanifest"), classicManifest(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8")));
  for (const file of ["version.json", "logo.png"]) fs.copyFileSync(path.join(root, file), path.join(out, file));
  fs.cpSync(path.join(root, "assets"), path.join(out, "assets"), { recursive: true });

  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      entry.isDirectory() ? walk(full) : files.push(full);
    }
  })(out);
  console.log(`ARCANUM Classic built: ${files.length} files in dist-classic (edition flag injected).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
