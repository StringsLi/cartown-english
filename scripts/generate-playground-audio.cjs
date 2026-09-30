"use strict";

// Generate the playground's spoken prompts, stories, and original nursery chants.
// meSpeak 2.0.2 (GPL) is a development-only tool; generated WAVs are committed.
// Set MESPEAK_ROOT to an unpacked meSpeak 2.0.2 directory when regenerating.

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const mespeakRoot = process.env.MESPEAK_ROOT || path.join(root, "node_modules", "mespeak");
const meSpeak = require(path.join(mespeakRoot, "src", "index.js"));
meSpeak.loadConfig(require(path.join(mespeakRoot, "src", "mespeak_config.json")));
meSpeak.loadVoice(require(path.join(mespeakRoot, "voices", "en", "en-us.json")));

const source = fs.readFileSync(path.join(root, "src", "mock", "playground.ts"), "utf8");
const output = path.join(root, "src", "pkg-learning", "static", "playground-audio");
fs.mkdirSync(output, { recursive: true });

function utterance(text, rate = 155) {
  const wav = meSpeak.speak(text, { rawdata: "buffer", speed: rate, pitch: 58 });
  if (!wav || wav.toString("ascii", 0, 4) !== "RIFF") throw new Error(`Unable to synthesize: ${text}`);
  const sampleRate = wav.readUInt32LE(24);
  const dataSize = wav.readUInt32LE(40);
  const input = [];
  for (let i = 44; i < 44 + dataSize; i += 2) input.push(wav.readInt16LE(i) / 32768);
  return { input, sampleRate };
}

function resample({ input, sampleRate }, rate) {
  const length = Math.floor(input.length * rate / sampleRate);
  const output = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const at = i * sampleRate / rate;
    const left = Math.floor(at);
    output[i] = input[left] * (1 - (at - left)) + (input[Math.min(left + 1, input.length - 1)] || 0) * (at - left);
  }
  return output;
}

function saveWav(fileName, samples, rate, eightBit = false) {
  const bytesPerSample = eightBit ? 1 : 2;
  const wav = Buffer.alloc(44 + samples.length * bytesPerSample);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * bytesPerSample, 28);
  wav.writeUInt16LE(bytesPerSample, 32);
  wav.writeUInt16LE(bytesPerSample * 8, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples.length * bytesPerSample, 40);
  for (let i = 0; i < samples.length; i++) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    if (eightBit) wav.writeUInt8(Math.max(0, Math.min(255, Math.round(128 + value * 110))), 44 + i);
    else wav.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(value * 30000))), 44 + i * 2);
  }
  fs.writeFileSync(path.join(output, fileName), wav);
  console.log(fileName, wav.length);
}

const prompts = [...source.matchAll(/prompt: "([^"]+)", audio: `\$\{audioRoot\}\/([a-z-]+)\.wav`/g)];
const stories = [...source.matchAll(/story: "([^"]+)",\s+storyAudio: `\$\{audioRoot\}\/([a-z-]+)\.wav`/g)];
const chants = [...source.matchAll(/chantLyrics: \["([^"]+)", "([^"]+)"\],\s+chantAudio: `\$\{audioRoot\}\/([a-z-]+)\.wav`/g)];
if (prompts.length !== 16 || stories.length !== 4 || chants.length !== 4) {
  throw new Error("Expected 16 prompts, four stories, and four chants in playground.ts");
}

for (const [, speech, name] of [...prompts, ...stories]) {
  saveWav(`${name}.wav`, resample(utterance(speech), 16000), 16000);
}

const melody = [392, 440, 523, 440, 392, 330, 349, 392, 440, 523, 587, 523, 440, 392, 349, 330];
const songRate = 12000;
for (const [, first, second, name] of chants) {
  const samples = new Float32Array(Math.round(songRate * 9.8));
  melody.forEach((frequency, index) => {
    const start = Math.round((0.25 + index * 0.57) * songRate);
    for (let i = 0; i < Math.round(0.43 * songRate) && start + i < samples.length; i++) {
      const time = i / songRate;
      samples[start + i] += 0.11 * Math.exp(-5 * time) *
        (Math.sin(2 * Math.PI * frequency * time) + 0.27 * Math.sin(4 * Math.PI * frequency * time));
    }
  });
  for (let beat = 0; beat < 10; beat++) {
    const start = Math.round((0.25 + beat * 0.91) * songRate);
    for (let i = 0; i < Math.round(0.18 * songRate) && start + i < samples.length; i++) {
      const time = i / songRate;
      samples[start + i] += 0.055 * Math.exp(-18 * time) * Math.sin(2 * Math.PI * 196 * time);
    }
  }
  [first, second].forEach((line, lineIndex) => {
    const voice = resample(utterance(line, 190), songRate);
    const start = Math.round((0.65 + lineIndex * 4.55) * songRate);
    if (start + voice.length > samples.length) throw new Error(`Chant line too long: ${line}`);
    for (let i = 0; i < voice.length; i++) samples[start + i] += 0.78 * voice[i];
  });
  saveWav(`${name}.wav`, samples, songRate, true);
}
