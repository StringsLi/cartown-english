import { spawn } from "node:child_process";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourcePath = path.join(root, "src", "pkg-cars", "bestSellingCars.ts");
const outputDirectory = path.join(root, "src", "static", "audio", "car-models");
const sourceText = await readFile(sourcePath, "utf8");
const source = ts.createSourceFile(sourcePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const vehicles = collectVehicles(source);

if (vehicles.length !== 50) {
  throw new Error(`Expected 50 vehicle definitions, found ${vehicles.length}.`);
}

await mkdir(outputDirectory, { recursive: true });
const jobs = vehicles.map(({ id, englishName }) => ({
  text: pronunciationText(englishName),
  output: path.join(outputDirectory, `${id}.mp3`)
}));
const jobsFile = path.join(root, ".audio-car-jobs.json");
await writeFile(jobsFile, JSON.stringify(jobs), "utf8");

const python = process.env.PYTHON || "python";
const child = spawn(python, [path.join(root, "scripts", "synthesize-phrases.py"), jobsFile], {
  cwd: root,
  env: process.env,
  stdio: "inherit"
});

const exitCode = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("exit", resolve);
});
await unlink(jobsFile);

if (exitCode !== 0) {
  process.exit(exitCode ?? 1);
}

console.log(`Car model audio ready: ${jobs.length} files.`);

function collectVehicles(sourceFile) {
  let result = [];

  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText() === "bestSellingCars") {
      const initializer = node.initializer;
      if (
        initializer &&
        ts.isCallExpression(initializer) &&
        ts.isPropertyAccessExpression(initializer.expression) &&
        ts.isArrayLiteralExpression(initializer.expression.expression)
      ) {
        result = initializer.expression.expression.elements
          .filter(ts.isArrayLiteralExpression)
          .map((entry) => ({
            id: stringValue(entry.elements[1]),
            englishName: stringValue(entry.elements[4])
          }))
          .filter(({ id, englishName }) => id && englishName);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return result;
}

function stringValue(node) {
  return node && ts.isStringLiteralLike(node) ? node.text : "";
}

function pronunciationText(text) {
  return text
    .replace(/\bBYD\b/g, "B Y D")
    .replace(/\bBMW\b/g, "B M W")
    .replace(/\bMINIEV\b/g, "Mini E V")
    .replace(/\bSU7\b/g, "S U seven")
    .replace(/\bYU7\b/g, "Y U seven")
    .replace(/\bRAV4\b/g, "RAV four")
    .replace(/\bCS75\b/g, "C S seventy five")
    .replace(/\bM03\b/g, "M zero three")
    .replace(/\bCR-V\b/g, "C R V")
    .replace(/\bA6L\b/g, "A six L")
    .replace(/\bL6\b/g, "L six")
    .replace(/\bH5\b/g, "H five")
    .replace(/\bM8\b/g, "M eight")
    .replace(/\bDM-i\b/g, "D M i")
    .replace(/\bC10\b/g, "C ten");
}
