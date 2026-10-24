import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

async function filesIn(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(file));
    else if (entry.isFile()) files.push(file);
  }
  return files;
}

/** Publish a validated build without ever removing the simulator's app.json. */
export async function publishMpBuild(staging, output) {
  const config = JSON.parse(await readFile(path.join(staging, "app.json"), "utf8"));
  const routes = [...config.pages, ...(config.subPackages || []).flatMap(pkg => pkg.pages.map(page => `${pkg.root}/${page}`))];
  for (const file of ["app.js", "app.wxss", ...routes.flatMap(route => [".js", ".json", ".wxml", ".wxss"].map(ext => route + ext))]) {
    await readFile(path.join(staging, file));
  }
  const files = await filesIn(staging);
  // Dependencies and page files arrive before the application entry points.
  const priority = file => ["app.wxss", "app.js", "app.json"].indexOf(path.relative(staging, file));
  files.sort((a, b) => priority(a) - priority(b));
  await mkdir(output, { recursive: true });
  const expected = new Set(files.map(file => path.relative(staging, file)));
  let changed = 0;
  for (const file of files) {
    const relative = path.relative(staging, file);
    if (relative === "project.private.config.json") continue;
    const destination = path.join(output, relative);
    const bytes = await readFile(file);
    try {
      if (bytes.equals(await readFile(destination))) continue;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, bytes);
      await rename(temporary, destination);
    } finally {
      await rm(temporary, { force: true });
    }
    changed++;
  }
  for (const file of await filesIn(output)) {
    const relative = path.relative(output, file);
    if (!expected.has(relative) && relative !== "project.private.config.json") await rm(file);
  }
  return changed;
}
