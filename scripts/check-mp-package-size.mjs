import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.join(process.cwd(), "dist", "build", "mp-weixin");
const appConfig = JSON.parse(await readFile(path.join(outputRoot, "app.json"), "utf8"));
const packageRoots = (appConfig.subPackages || []).map((item) => item.root);
const packageLimit = 2 * 1024 * 1024;
const mainPackageLimit = 1.5 * 1024 * 1024;
const mediaLimit = 200 * 1024;
const mediaExtensions = new Set([".png", ".bmp", ".jpg", ".jpeg", ".gif", ".webp", ".mp3", ".wav", ".m4a", ".aac"]);
const forbiddenMainFiles = [
  "mock/bestSellingCars.js",
  "services/recordArchiveService.js",
  "services/recordService.js"
];
const packageSizes = new Map();
const outputFiles = await listFiles(outputRoot);

packageSizes.set("main", await directorySize(outputRoot, new Set(packageRoots)));
for (const packageRoot of packageRoots) {
  packageSizes.set(packageRoot, await directorySize(path.join(outputRoot, packageRoot)));
}

let hasQualityFailure = false;
for (const [name, bytes] of packageSizes) {
  const size = (bytes / 1024 / 1024).toFixed(3);
  console.log(`${name}: ${size} MiB`);
  const limit = name === "main" ? mainPackageLimit : packageLimit;
  if (bytes >= limit) {
    console.error(`${name} must be smaller than ${name === "main" ? "1.5" : "2"} MiB.`);
    hasQualityFailure = true;
  }
}

for (const relativePath of forbiddenMainFiles) {
  try {
    await stat(path.join(outputRoot, ...relativePath.split("/")));
    console.error(`Unused main-package module detected: ${relativePath}`);
    hasQualityFailure = true;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

for (const filePath of outputFiles) {
  if (!mediaExtensions.has(path.extname(filePath).toLowerCase())) continue;
  const bytes = (await stat(filePath)).size;
  if (bytes > mediaLimit) {
    console.error(`Media exceeds 200 KiB: ${path.relative(outputRoot, filePath)} (${(bytes / 1024).toFixed(1)} KiB)`);
    hasQualityFailure = true;
  }
}

for (const filePath of outputFiles.filter((item) => path.extname(item) === ".js" && isMainPackageFile(item))) {
  const content = await readFile(filePath, "utf8");
  const requirePattern = /require\(["']([^"']+)["']\)/g;
  let match;
  while ((match = requirePattern.exec(content))) {
    const request = match[1];
    const prefix = content.slice(Math.max(0, match.index - 40), match.index);
    if (!request.startsWith(".") || /Promise\.resolve\(\)\.then\(\(\)=>\s*$/.test(prefix)) continue;

    const resolved = path.resolve(path.dirname(filePath), request);
    const relative = path.relative(outputRoot, resolved).split(path.sep).join("/");
    const targetPackage = packageRoots.find((root) => relative === root || relative.startsWith(`${root}/`));
    if (targetPackage) {
      console.error(`Main-package JS synchronously requires ${targetPackage}: ${path.relative(outputRoot, filePath)} -> ${request}`);
      hasQualityFailure = true;
    }
  }
}

if (hasQualityFailure) process.exit(1);

function isMainPackageFile(filePath) {
  const relative = path.relative(outputRoot, filePath).split(path.sep).join("/");
  return !packageRoots.some((root) => relative === root || relative.startsWith(`${root}/`));
}

async function directorySize(directory, excludedTopLevelDirectories = new Set()) {
  const entries = await readdir(directory, { withFileTypes: true });
  let total = 0;

  for (const entry of entries) {
    if (entry.isDirectory() && excludedTopLevelDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    total += entry.isDirectory() ? await directorySize(entryPath) : (await stat(entryPath)).size;
  }

  return total;
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(entryPath));
    else files.push(entryPath);
  }
  return files;
}
