import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { publishMpBuild } from "./publish-mp-build.mjs";

const root = process.cwd();
const output = path.join(root, "dist/build/mp-weixin");
const parent = path.join(root, "dist/staging");
await mkdir(parent, { recursive: true });
const staging = await mkdtemp(path.join(parent, "mp-weixin-"));

function run(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Build command failed (${signal || code}).`)));
  });
}

try {
  await run(["node_modules/@dcloudio/vite-plugin-uni/bin/uni.js", "build", "-p", "mp-weixin", "--outDir", staging], { ...process.env, UNI_OUTPUT_DIR: staging });
  await run(["scripts/check-mp-package-size.mjs", staging]);
  const changed = await publishMpBuild(staging, output);
  console.log(`Published validated mini-program build (${changed} changed files); simulator entry files stayed available.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await rm(staging, { recursive: true, force: true });
}
