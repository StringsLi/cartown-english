const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript");
const root = path.resolve(__dirname, "..");
function assets(platform) {
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} }; modules.set(file, module);
    let source = fs.readFileSync(file, "utf8");
    source = source.replace(/^[ \t]*\/\/ #ifdef H5\n([\s\S]*?)^[ \t]*\/\/ #endif/gm, (_, block) => platform === "h5" ? block : "");
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const context = { module, exports: module.exports, require: id => id.startsWith("@/") ? load(path.join(root, "src", id.slice(2) + ".ts")) : require(id) };
    // Native preprocessing must work even if another library defines window.
    context.window = {};
    vm.runInNewContext(code, context, { filename: file });
    return module.exports;
  }
  return load(path.join(root, "src/services/assetService.ts"));
}
const web = assets("h5"), native = assets("mp-weixin");
let checked = 0;
for (const group of ["books", "topic-icons", "cartown-logos"]) {
  const originalRoot = path.join(root, "docs/source-assets", group + "-original");
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!/\.(png|jpg)$/i.test(entry.name)) continue;
      const relative = path.relative(originalRoot, file).split(path.sep).join("/");
      const request = `/static/${group}/${relative.replace(/\.png$/, ".webp")}`;
      const url = `/static/${group}/${relative}`;
      assert.equal(web.highResolutionAsset(request), url);
      assert.equal(web.highResolutionAsset(url), url, "Repeated resolution keeps the web image URL");
      assert.match(native.highResolutionAsset(request), /^cloud:\/\//, "Native images retain CloudBase resolution");
      checked++;
    }
  }
  walk(originalRoot);
}
for (const source of ["/pkg-reading/static/word-pictures/excavator.jpg", "/static/first-books/cat/cover.webp", "https://example.test/image.jpg"]) {
  assert.equal(web.highResolutionAsset(source), source);
  assert.equal(native.highResolutionAsset(source), source);
}
let audioChecked = 0;
const audioRoot = path.join(root, "docs/source-assets/audio-original");
function checkAudio(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { checkAudio(file); continue; }
    if (!/\.(mp3|wav)$/i.test(entry.name)) continue;
    const relative = path.relative(audioRoot, file).split(path.sep).join("/");
    const url = `/static/audio/${relative}`;
    const request = url.replace(/\.wav$/i, ".mp3");
    assert.equal(web.highResolutionAsset(request), url, "Browser audio uses its served original");
    assert.equal(web.highResolutionAsset(url), url, "Audio resolution is idempotent");
    assert.match(native.highResolutionAsset(request), /^cloud:\/\//, "Mini-program audio retains CloudBase originals");
    audioChecked++;
  }
}
checkAudio(audioRoot);
assert.ok(audioChecked > 300, "All original phrase, word and book recordings are covered");
for (const source of ["/pkg-cars/static/audio/car-models/tesla.mp3", "/pkg-space/static/audio/earth.mp3", "/pkg-music/static/audio/colors.mp3"]) {
  assert.equal(web.highResolutionAsset(source), source);
  assert.equal(native.highResolutionAsset(source), source);
}
console.log(`Audio routing checks passed: ${audioChecked} served originals, native CloudBase and bundled audio preservation.`);
console.log(`Image routing checks passed: ${checked} web originals, idempotent URLs, bundled images and native CloudBase preservation.`);
