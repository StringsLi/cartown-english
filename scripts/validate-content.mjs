import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const assetRoot = path.join(root, "docs", "source-assets");
const errors = [];
const warnings = [];

const requiredGroups = {
  "books-original": 69,
  "topic-icons-original": 92,
  "cartown-logos-original": 50,
  "audio-original": 377
};

for (const [group, expected] of Object.entries(requiredGroups)) {
  const files = await walk(path.join(assetRoot, group));
  if (files.length !== expected) {
    errors.push("Expected " + expected + " high-resolution files in " + group + ", found " + files.length + ".");
  }
}

const storyAudioFolders = ["apple", "bear", "cat", "city-bus", "digger", "fire-truck", "jump", "mom", "red-car"];
for (const folder of storyAudioFolders) {
  for (let page = 1; page <= 5; page += 1) {
    const pageName = "page" + String(page).padStart(2, "0") + ".wav";
    await requireFile(
      path.join(assetRoot, "audio-original", folder, pageName),
      "Missing original story audio: " + folder + " page " + page
    );
  }
}

const vehicleStories = ["red-car", "digger", "fire-truck", "city-bus"];
for (const story of vehicleStories) {
  await requireFile(
    path.join(assetRoot, "books-original", story, "cover.jpg"),
    "Missing premium vehicle story cover: " + story
  );
  for (let page = 1; page <= 5; page += 1) {
    const pageName = "page" + String(page).padStart(2, "0") + ".jpg";
    await requireFile(
      path.join(assetRoot, "books-original", story, pageName),
      "Missing premium vehicle story art: " + story + " page " + page
    );
  }
}

const localVehicleStories = ["red-car", "police-car", "van"];
for (const story of localVehicleStories) {
  await requireFile(
    path.join(sourceRoot, "static", "generated-books", story, "cover.jpg"),
    "Missing local vehicle story cover: " + story
  );
  for (let page = 1; page <= 5; page += 1) {
    const pageName = "page" + String(page).padStart(2, "0") + ".jpg";
    await requireFile(
      path.join(sourceRoot, "pkg-reading", "static", "generated-books", story, pageName),
      "Missing local vehicle story art: " + story + " page " + page
    );
  }
}

const premiumVehicles = [
  "car", "bus", "truck", "taxi", "train", "motorcycle",
  "excavator", "bulldozer", "crane", "dump-truck", "cement-mixer", "road-roller",
  "fire-truck", "ambulance", "police-car", "school-bus", "garbage-truck", "tow-truck",
  "tractor", "forklift", "bicycle", "scooter", "van", "race-car",
  "color-car-red", "color-car-blue", "color-car-yellow",
  "color-car-green", "color-car-orange", "color-car-purple"
];
for (const vehicle of premiumVehicles) {
  await requireFile(
    path.join(assetRoot, "topic-icons-original", "vehicles", vehicle + ".png"),
    "Missing premium vehicle image: " + vehicle
  );
}

const countriesSource = await readFile(path.join(sourceRoot, "mock", "countries.ts"), "utf8");
const countries = [...countriesSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
if (countries.length !== 50 || new Set(countries).size !== 50) {
  errors.push("Expected 50 unique country definitions, found " + new Set(countries).size + ".");
}
for (const country of countries) {
  await requireFile(
    path.join(assetRoot, "topic-icons-original", "flags", country + ".png"),
    "Missing original flag: " + country
  );
  await requireFile(
    path.join(sourceRoot, "pkg-world", "static", "country-flags", country + ".png"),
    "Missing local rectangular flag: " + country
  );
  await requireFile(
    path.join(sourceRoot, "pkg-world", "static", "country-maps", country + ".png"),
    "Missing local country map: " + country
  );
}

const phraseDirectory = path.join(assetRoot, "audio-original", "phrases");
const phraseFiles = (await readdir(phraseDirectory)).filter((fileName) => fileName.endsWith(".mp3"));
if (phraseFiles.length !== 263) {
  errors.push("Expected 263 original phrase audio files, found " + phraseFiles.length + ".");
}
for (const fileName of phraseFiles) {
  const details = await stat(path.join(phraseDirectory, fileName));
  if (details.size < 1024) errors.push("Original phrase audio is empty or invalid: " + fileName);
}

const packagedBookPhraseFiles = [
  "01842735.mp3", "3cb635ae.mp3", "7142b4f4.mp3", "7e297770.mp3", "96f3858c.mp3",
  "9dd6ec65.mp3", "a0619613.mp3", "a3530ee2.mp3", "b559cddd.mp3", "ebb03227.mp3"
];
for (const fileName of packagedBookPhraseFiles) {
  await requireFile(
    path.join(sourceRoot, "pkg-reading", "static", "audio", "phrases", fileName),
    "Missing packaged picture-book phrase audio: " + fileName
  );
}

const carAudioDirectory = path.join(sourceRoot, "static", "audio", "car-models");
const carAudioFiles = (await readdir(carAudioDirectory)).filter((fileName) => fileName.endsWith(".mp3"));
if (carAudioFiles.length !== 50) {
  errors.push("Expected 50 car model pronunciation files, found " + carAudioFiles.length + ".");
}
for (const fileName of carAudioFiles) {
  const details = await stat(path.join(carAudioDirectory, fileName));
  if (details.size < 1024) errors.push("Car model pronunciation is empty or invalid: " + fileName);
}

const playgroundAudioDirectory = path.join(sourceRoot, "pkg-learning", "static", "playground-audio");
const playgroundAudioFiles = (await readdir(playgroundAudioDirectory)).filter((fileName) => fileName.endsWith(".mp3"));
const playgroundSource = await readFile(path.join(sourceRoot, "mock", "playground.ts"), "utf8");
const referencedAudio = [...playgroundSource.matchAll(/\$\{audioRoot\}\/([a-z-]+\.mp3)/g)].map(match => match[1]);
const wordArt = [...playgroundSource.matchAll(/\$\{artRoot\}\/([a-z-]+\.png)/g)].map(match => match[1]);
const themeIds = [...playgroundSource.matchAll(/^    id: "([a-z]+)",/gm)].map(match => match[1]);
if (themeIds.length !== 8 || new Set(themeIds).size !== 8 || wordArt.length !== 40 || new Set(wordArt).size !== 40) {
  errors.push("Expected eight unique playground themes and forty unique illustrated words.");
}
if (referencedAudio.length !== 96 || new Set(referencedAudio).size !== 96) {
  errors.push("Expected 40 word sounds, 40 prompts, eight stories, and eight chants.");
}
if (playgroundAudioFiles.length !== referencedAudio.length) {
  errors.push("Playground audio count does not match the content catalog.");
}
for (const fileName of referencedAudio) {
  await requireFile(path.join(playgroundAudioDirectory, fileName), "Missing playground audio: " + fileName);
}
for (const fileName of [...wordArt, ...themeIds.map(id => `scene-${id}.png`)]) {
  const artPath = path.join(sourceRoot, "pkg-learning", "static", "playground", "art", fileName);
  await requireFile(artPath, "Missing playground artwork: " + fileName);
}
for (const fileName of playgroundAudioFiles) {
  const audioFile = await readFile(path.join(playgroundAudioDirectory, fileName));
  if (audioFile.length < 1024 || audioFile.toString("ascii", 0, 3) !== "ID3") {
    errors.push("Playground audio is empty or invalid: " + fileName);
  }
}
await requireFile(
  path.join(sourceRoot, "pkg-learning", "static", "playground", "friends.jpg"),
  "Missing playground illustration."
);

const cloudConfig = await readFile(path.join(sourceRoot, "config", "cloud.ts"), "utf8");
if (!cloudConfig.includes("cloud1-d5gbtry8n16a02de8")) {
  errors.push("CloudBase environment ID is not configured for the selected environment.");
}
if (!cloudConfig.includes("636c-cloud1-d5gbtry8n16a02de8-1459600856")) {
  errors.push("CloudBase storage bucket is not configured.");
}

const assetService = await readFile(path.join(sourceRoot, "services", "assetService.ts"), "utf8");
for (const group of Object.keys(requiredGroups)) {
  if (!assetService.includes(group)) errors.push("Cloud asset resolver does not map " + group + ".");
}

const mediaCacheService = await readFile(path.join(sourceRoot, "services", "mediaCacheService.ts"), "utf8");
if (!mediaCacheService.includes("saveFile") || !mediaCacheService.includes("MAX_CACHE_BYTES")) {
  errors.push("Persistent media cache is not configured.");
}

const audioService = await readFile(path.join(sourceRoot, "services", "audioService.ts"), "utf8");
if (!audioService.includes("obeyMuteSwitch: false")) {
  errors.push("iOS speaker audio option is not configured.");
}

const manifest = JSON.parse(await readFile(path.join(sourceRoot, "manifest.json"), "utf8"));
if (!manifest["mp-weixin"]?.appid) {
  const message = "WeChat AppID is empty in src/manifest.json.";
  if (process.argv.includes("--release")) errors.push(message);
  else warnings.push(message);
}

for (const warning of warnings) console.warn("WARN " + warning);
for (const error of errors) console.error("ERROR " + error);

if (errors.length) process.exit(1);
const totalHighResolutionFiles = (await walk(assetRoot)).length;
console.log(
  "Content validation passed: " + totalHighResolutionFiles +
  " high-resolution source assets, " + phraseFiles.length +
  " phrase audios, " + carAudioFiles.length +
  " car model audios, " + playgroundAudioFiles.length +
  " playground audios, " + countries.length + " countries."
);

async function requireFile(filePath, message) {
  try {
    const details = await stat(filePath);
    if (!details.isFile() || details.size === 0) errors.push(message);
  } catch {
    errors.push(message);
  }
}

async function walk(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walk(entryPath));
      else files.push(entryPath);
    }

    return files;
  } catch {
    errors.push("Missing high-resolution asset directory: " + path.relative(root, directory));
    return [];
  }
}
