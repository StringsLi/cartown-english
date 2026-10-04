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
assert.match(web.highResolutionAsset("/static/audio/words/cat.mp3"), /^cloud:\/\//, "The image fix preserves audio routing");
console.log(`Image routing checks passed: ${checked} web originals, idempotent URLs, bundled images and native CloudBase preservation.`);
