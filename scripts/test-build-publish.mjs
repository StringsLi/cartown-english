import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, stat, access, rm } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { publishMpBuild } from "./publish-mp-build.mjs";

const directory = await mkdtemp(path.join(tmpdir(), "cartown-publish-"));
const staging = path.join(directory, "staging"), output = path.join(directory, "output");
try {
  await mkdir(staging); await mkdir(output);
  await writeFile(path.join(output, "app.json"), '{"pages":["old/index"]}');
  await writeFile(path.join(output, "old-module.js"), "old");
  await writeFile(path.join(output, "project.private.config.json"), "local preferences");
  const before = await readFile(path.join(output, "app.json"));
  await assert.rejects(publishMpBuild(staging, output));
  assert.deepEqual(await readFile(path.join(output, "app.json")), before, "An incomplete build leaves the existing entry available");
  await writeFile(path.join(staging, "app.json"), JSON.stringify({ pages: ["pages/home/index"], subPackages: [{ root: "pkg-test", pages: ["quiz/index"] }] }));
  await writeFile(path.join(staging, "app.js"), "new app");
  await writeFile(path.join(staging, "app.wxss"), "new style");
  await assert.rejects(publishMpBuild(staging, output));
  assert.deepEqual(await readFile(path.join(output, "app.json")), before, "Missing page files are rejected before publication");
  for (const route of ["pages/home/index", "pkg-test/quiz/index"]) {
    await mkdir(path.dirname(path.join(staging, route)), { recursive: true });
    for (const extension of [".js", ".json", ".wxml", ".wxss"]) await writeFile(path.join(staging, route + extension), route + extension);
  }
  const missingEntry = [];
  let observations = 0;
  const observer = setInterval(() => {
    observations++;
    try { JSON.parse(readFileSync(path.join(output, "app.json"), "utf8")); }
    catch (error) { missingEntry.push(error); }
  }, 1);
  try {
    assert.equal(await publishMpBuild(staging, output), 11);
    const stamp = (await stat(path.join(output, "app.json"))).mtimeMs;
    assert.equal(await publishMpBuild(staging, output), 0, "Identical rebuilds do not touch live files or trigger reloads");
    assert.equal((await stat(path.join(output, "app.json"))).mtimeMs, stamp);
    assert.equal(await readFile(path.join(output, "project.private.config.json"), "utf8"), "local preferences");
    await assert.rejects(access(path.join(output, "old-module.js")));
    assert.deepEqual(await readFile(path.join(output, "app.json")), await readFile(path.join(staging, "app.json")));
    assert.ok(observations > 0);
    assert.equal(missingEntry.length, 0, "The running simulator can always read a valid app.json during publication");
  } finally { clearInterval(observer); }
  console.log("Build publication checks passed: incomplete builds preserve app.json, all registered pages are required, stale files removed, local settings preserved, atomic entry replacement and unchanged-build no-op.");
} finally {
  await rm(directory, { recursive: true, force: true });
}
