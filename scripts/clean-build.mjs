import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const supportedTargets = new Set(["h5", "mp-weixin"]);
const target = process.argv[2];

if (!supportedTargets.has(target)) {
  throw new Error("Build target must be h5 or mp-weixin.");
}

const outputDirectory = path.join(process.cwd(), "dist", "build", target);
try {
  await rm(outputDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch (error) {
  if (error?.code !== "EBUSY") throw error;
  const entries = await readdir(outputDirectory);
  await Promise.all(entries.map((entry) => (
    rm(path.join(outputDirectory, entry), { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  )));
}
console.log(`Cleaned previous ${target} build output.`);
