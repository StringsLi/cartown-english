import { spawn } from "node:child_process";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const outputDirectory = path.join(root, "docs", "source-assets", "audio-original", "phrases");
const sourceFiles = [
  path.join(root, "src", "mock", "topics.ts"),
  path.join(root, "src", "mock", "countries.ts"),
  path.join(root, "src", "mock", "books.ts"),
  path.join(root, "src", "mock", "cartown.ts")
];
const fixedPhrases = [
  "You are so brave!",
  "I see a car.",
  "Hello, world!",
  "Let's explore!",
  "Try again!",
  "Great job!",
  "1",
  "2",
  "3",
  "4",
  "5"
];

const phrases = new Set(fixedPhrases.map(normalizePhrase));

for (const filePath of sourceFiles) {
  collectPhrases(await readFile(filePath, "utf8"), filePath, phrases);
}

await mkdir(outputDirectory, { recursive: true });

const jobs = [...phrases]
  .sort((first, second) => first.localeCompare(second))
  .map((text) => ({ text, output: path.join(outputDirectory, `${phraseHash(text)}.mp3`) }));
const jobsFile = path.join(root, ".audio-phrase-jobs.json");
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

console.log(`Phrase audio ready: ${jobs.length} files.`);

function collectPhrases(sourceText, filePath, target) {
  const source = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const word = stringProperty(node, "word");
      const sentence = stringProperty(node, "sentence");
      const name = stringProperty(node, "name");
      const task = stringProperty(node, "task");
      const sentences = stringArrayProperty(node, "sentences");

      if (word && sentence) target.add(normalizePhrase(`${word}. ${sentence}`));
      if (name) {
        target.add(normalizePhrase(name));
        target.add(normalizePhrase(`Tap ${name}.`));
      }
      if (task) target.add(normalizePhrase(task));
      for (const sentence of sentences) target.add(normalizePhrase(sentence));
    }

    ts.forEachChild(node, visit);
  }

  visit(source);
}

function stringProperty(object, propertyName) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = property.name.getText().replace(/["']/g, "");
    if (name !== propertyName || !ts.isStringLiteralLike(property.initializer)) continue;
    return property.initializer.text;
  }

  return "";
}

function stringArrayProperty(object, propertyName) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = property.name.getText().replace(/["']/g, "");
    if (name !== propertyName || !ts.isArrayLiteralExpression(property.initializer)) continue;
    return property.initializer.elements
      .filter(ts.isStringLiteralLike)
      .map((element) => element.text);
  }

  return [];
}
function normalizePhrase(text) {
  return text.trim().replace(/\s+/g, " ");
}

function phraseHash(text) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}
