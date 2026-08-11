import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const outputRoot = path.join(process.cwd(), "dist", "build", "mp-weixin");
const appConfig = JSON.parse(await readFile(path.join(outputRoot, "app.json"), "utf8"));
const packageRoots = (appConfig.subPackages || []).map((item) => item.root);
const packageLimit = 2 * 1024 * 1024;
const packageSizes = new Map();

packageSizes.set("main", await directorySize(outputRoot, new Set(packageRoots)));
for (const packageRoot of packageRoots) {
  packageSizes.set(packageRoot, await directorySize(path.join(outputRoot, packageRoot)));
}

let hasOversizedPackage = false;
for (const [name, bytes] of packageSizes) {
  const size = (bytes / 1024 / 1024).toFixed(3);
  console.log(`${name}: ${size} MiB`);
  if (bytes > packageLimit) {
    console.error(`${name} exceeds the 2 MiB WeChat package limit.`);
    hasOversizedPackage = true;
  }
}

if (hasOversizedPackage) process.exit(1);

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
