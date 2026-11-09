// Generate short English demonstrations using the installed macOS Samantha voice.
// WAV PCM is kept in its actual format: mono, 16 kHz, signed 16-bit.
import { readFile, mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
const root = process.cwd();
const source = await readFile(path.join(root, "src/pkg-family/catalog.ts"), "utf8");
const steps = [...source.matchAll(/\{ id: "([^"]+)", english: "([^"]+)", chinese:/g)];
if (steps.length !== 18) throw new Error("Expected all 18 routine phrases.");
const output = path.join(root, "src/pkg-family/static/audio");
await mkdir(output, { recursive: true });
const temporary = await mkdtemp(path.join(tmpdir(), "cartown-routines-"));
const run = (command, args) => { const result = spawnSync(command, args, { stdio: "inherit" }); if (result.error || result.status !== 0) throw result.error || new Error(command + " failed"); };
try {
  for (const [, id, text] of steps) {
    const target = path.join(output, id + ".wav");
    const intermediate = path.join(temporary, id + ".aiff");
    run("/usr/bin/say", ["-v", "Samantha", "-r", "145", "-o", intermediate, text]);
    run("/usr/bin/afconvert", ["-f", "WAVE", "-d", "LEI16@16000", "-c", "1", intermediate, target]);
    const bytes = (await stat(target)).size;
    const wav = await readFile(target);
    let samples = 0;
    for (let offset = 12; offset + 8 <= wav.length;) {
      const size = wav.readUInt32LE(offset + 4);
      if (wav.toString("ascii", offset, offset + 4) === "data") samples = size / 2;
      offset += 8 + size + size % 2;
    }
    if (samples < 8000 || bytes > 200 * 1024) throw new Error("Empty or oversized speech: " + id);
    console.log(`${id}: ${bytes} bytes`);
  }
} finally { await rm(temporary, { recursive: true, force: true }); }
