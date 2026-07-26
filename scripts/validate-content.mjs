import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const errors = [];
const warnings = [];

const sourceFiles = (await walk(sourceRoot)).filter((filePath) => /\.(?:ts|vue|scss|json)$/.test(filePath));
const literalAssets = new Set();

for (const filePath of sourceFiles) {
  const source = await readFile(filePath, "utf8");
  for (const match of source.matchAll(/["'](\/static\/[^"'`$]+\.(?:jpe?g|png|svg|wav|mp3))["']/gi)) {
    literalAssets.add(match[1]);
  }
}

for (const asset of literalAssets) {
  await requireFile(path.join(sourceRoot, asset.slice(1)), `Missing referenced asset: ${asset}`);
}

const storyAudioFolders = ["apple", "bear", "cat", "city-bus", "digger", "fire-truck", "jump", "mom", "red-car"];
for (const folder of storyAudioFolders) {
  for (let page = 1; page <= 5; page += 1) {
    await requireFile(
      path.join(sourceRoot, "static", "audio", folder, `page${String(page).padStart(2, "0")}.wav`),
      `Missing story audio: ${folder} page ${page}`
    );
  }
}

const countries = [
  "australia", "brazil", "canada", "china", "egypt", "france", "germany",
  "india", "italy", "japan", "mexico", "spain", "united-kingdom", "united-states"
];
for (const country of countries) {
  await requireFile(path.join(sourceRoot, "static", "topic-icons", "flags", `${country}.svg`), `Missing flag: ${country}`);
}

const phraseDirectory = path.join(sourceRoot, "static", "audio", "phrases");
const phraseFiles = (await readdir(phraseDirectory)).filter((fileName) => fileName.endsWith(".mp3"));
if (phraseFiles.length < 171) errors.push(`Expected at least 171 phrase audio files, found ${phraseFiles.length}.`);
for (const fileName of phraseFiles) {
  const details = await stat(path.join(phraseDirectory, fileName));
  if (details.size < 1024) errors.push(`Phrase audio is empty or invalid: ${fileName}`);
}

const manifest = JSON.parse(await readFile(path.join(sourceRoot, "manifest.json"), "utf8"));
if (!manifest["mp-weixin"]?.appid) {
  const message = "WeChat AppID is empty in src/manifest.json.";
  if (process.argv.includes("--release")) errors.push(message);
  else warnings.push(message);
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);

if (errors.length) process.exit(1);
console.log(`Content validation passed: ${literalAssets.size} referenced assets, ${phraseFiles.length} phrase audios.`);

async function requireFile(filePath, message) {
  try {
    const details = await stat(filePath);
    if (!details.isFile() || details.size === 0) errors.push(message);
  } catch {
    errors.push(message);
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(entryPath));
    else files.push(entryPath);
  }

  return files;
}
