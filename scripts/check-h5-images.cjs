const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path");
const root = path.resolve(__dirname, "..");
let checked = 0;
for (const group of ["books", "topic-icons", "cartown-logos", "audio"]) {
  const originals = path.join(root, "docs/source-assets", group + "-original");
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!(group === "audio" ? /\.(mp3|wav)$/i : /\.(png|jpe?g)$/i).test(entry.name)) continue;
      const output = path.join(root, "dist/build/h5/static", group, path.relative(originals, file));
      assert.ok(fs.existsSync(output), `Missing web asset: ${output}`);
      assert.ok(fs.readFileSync(file).equals(fs.readFileSync(output)), `Incomplete web asset: ${output}`);
      checked++;
    }
  }
  walk(originals);
}
console.log(`H5 image build checks passed: all ${checked} original images and audio files included with matching bytes.`);
