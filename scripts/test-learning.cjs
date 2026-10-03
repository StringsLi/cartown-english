const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript");
const root = path.resolve(__dirname, "../src"), modules = new Map(), storage = new Map(), contexts = [], toasts = [];
let slowResolve;
const uni = {
  getStorageSync: key => storage.get(key), setStorageSync: (key, value) => storage.set(key, structuredClone(value)), removeStorageSync: key => storage.delete(key),
  showToast: value => toasts.push(value),
  createInnerAudioContext() {
    const events = {};
    const audio = { volume: 1, onPlay: fn => events.play = fn, onEnded: fn => events.ended = fn, onError: fn => events.error = fn, stop() {}, destroy() { this.destroyed = true; }, fire: event => events[event]?.() };
    contexts.push(audio); return audio;
  }
};
modules.set(path.join(root, "services/mediaCacheService.ts"), { exports: { invalidateCachedMedia() {}, resolveCachedMedia: url => url === "slow" ? new Promise(resolve => slowResolve = resolve) : Promise.resolve(url) } });
modules.set(path.join(root, "services/audioCatalog.ts"), { exports: { phraseAudioPath: text => text + ".mp3" } });
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} }; modules.set(file, module);
  const requireLocal = id => id.startsWith("@/") || id.startsWith(".") ? load(path.resolve(id.startsWith("@/") ? root : path.dirname(file), id.replace(/^@\//, "") + ".ts")) : require(id);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: requireLocal, uni, console, setTimeout, clearTimeout }, { filename: file });
  return module.exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const learningFile = path.join(root, "services/playgroundLearningService.ts");
let learning = load(learningFile);
const day = new Date(2026, 9, 3, 10).getTime(), tomorrow = new Date(2026, 9, 4, 10).getTime();
const { playgroundTopics } = load(path.join(root, "mock/playground.ts"));
// Old storage never implies an independently understood word or today's activity.
storage.set("cartown_english_progress", { stars: 8, playgroundHeardWordIds: ["colors:red"], playgroundCompletedTopicIds: ["colors"] });
const old = load(path.join(root, "services/cartownProgressService.ts"));
assert.equal(old.getCartownProgress().stars, 8);
assert.deepEqual(plain(learning.getPlaygroundSummary(old.getCartownProgress().playgroundHeardWordIds, day)), { heard: 1, independent: 0, review: 0 });
learning.recordPlaygroundListening("colors", "red", day);
learning.recordPlaygroundListening("colors", "red", day);
learning.recordPlaygroundListening("bad", "word", day);
assert.deepEqual(plain(learning.getTodayPlay(day).heardIds), ["colors:red"]);
assert.equal(learning.getTodayPlay(tomorrow).heardIds.length, 0);
// A retry solves the activity without counting as an independent first answer.
learning.recordPlaygroundAnswer("colors", "blue", false, false, day);
learning.recordPlaygroundAnswer("colors", "blue", true, true, day + 10);
assert.equal(learning.getPlaygroundLearning().words["colors:blue"].wrong, 1);
assert.equal(learning.getPlaygroundLearning().words["colors:blue"].correct, 0);
assert.deepEqual(plain(learning.getReviewWordIds(day + 20)), ["colors:blue"]);
assert.deepEqual(plain(learning.getTodayPlay(day).solvedIds), ["colors:blue"]);
learning.recordPlaygroundAnswer("colors", "red", true, false, day);
assert.equal(learning.getPlaygroundSummary([], day).independent, 1);
assert.deepEqual(plain(learning.getReviewWordIds(day)), ["colors:blue"]);
assert.equal(learning.getReviewWordIds(tomorrow).length, 2);
assert.equal(learning.getReviewTopic(tomorrow).id, "colors");
learning.recordPlaygroundAnswer("colors", "blue", true, false, tomorrow);
learning.recordPlaygroundAnswer("colors", "blue", true, false, tomorrow + 1);
assert.equal(learning.getPlaygroundLearning().words["colors:blue"].streak, 1);
assert.ok(!learning.getReviewWordIds(tomorrow + 2).includes("colors:blue"));
learning.recordPlaygroundAnswer("colors", "blue", true, false, tomorrow + 86400000);
assert.equal(learning.getPlaygroundLearning().words["colors:blue"].streak, 2);
assert.equal(learning.getPlaygroundLearning().words["colors:blue"].nextReviewAt, tomorrow + 4 * 86400000);
learning.recordPlaygroundAnswer("colors", "red", false, false, tomorrow);
assert.equal(learning.getReviewWordIds(tomorrow)[0], "colors:red");
learning.recordAdventureToday("delivery:picnic", day); learning.recordAdventureToday("delivery:picnic", day);
assert.equal(learning.getTodayPlay(day).adventureIds.length, 1);
assert.equal(learning.getTodayPlay(tomorrow).adventureIds.length, 0);
// Resume keeps order and answered/wrong flags so a reload cannot award again.
const session = { topicId: "colors", mode: "quiz", wordIndex: 2, questionIds: playgroundTopics[0].items.map(i => i.id).reverse(), questionIndex: 1, answered: true, hadWrong: true, reviewOnly: false };
learning.savePlaygroundSession(session); learning.flushPlaygroundLearning();
old.flushCartownProgress();
modules.delete(learningFile); learning = load(learningFile);
assert.deepEqual(plain(learning.getPlaygroundLearning().session), plain(session));
assert.equal(storage.get("cartown_english_progress").stars, 8);
learning.savePlaygroundSession({ ...session, questionIds: ["red", "no-such-word"] });
assert.equal(learning.getPlaygroundLearning().session, null);
learning.savePlaygroundSession({ ...session, reviewOnly: true, questionIds: ["red"], questionIndex: 99 });
assert.equal(learning.getPlaygroundLearning().session.questionIndex, 0);
learning.clearPlaygroundLearning();
assert.equal(storage.has("cartown_playground_learning"), false);
assert.equal(learning.getPlaygroundLearning().session, null);

async function checkAudio() {
  const audio = load(path.join(root, "services/audioService.ts"));
  const tick = () => new Promise(resolve => setImmediate(resolve));
  let started = 0;
  audio.playAudio("red.mp3", "red", () => started++);
  assert.equal(audio.audioPlaybackState.value.phase, "loading");
  await tick(); const first = contexts.at(-1);
  first.fire("play"); first.fire("play");
  assert.equal(started, 1); assert.equal(audio.audioPlaybackState.value.phase, "playing");
  audio.setAudioVolume(0.4); assert.equal(first.volume, 0.4); assert.equal(storage.get("cartown_audio_volume"), 0.4);
  audio.playAudio("blue.mp3", "blue"); await tick(); const second = contexts.at(-1);
  first.fire("error"); first.fire("ended");
  assert.equal(toasts.length, 0); assert.equal(audio.audioPlaybackState.value.phase, "loading");
  assert.equal(second.volume, 0.4);
  second.fire("error"); assert.equal(audio.audioPlaybackState.value.phase, "error");
  assert.equal(toasts.at(-1).title, "声音加载失败，请再试一次");
  audio.replayAudio(); await tick(); const retry = contexts.at(-1);
  retry.fire("play"); retry.fire("ended"); assert.equal(audio.audioPlaybackState.value.phase, "ended");
  audio.stopAudio(); assert.equal(audio.audioPlaybackState.value.phase, "idle");
  const total = contexts.length;
  audio.playAudio("slow", "delayed"); audio.stopAudio(); slowResolve("resolved.mp3"); await tick();
  assert.equal(contexts.length, total); assert.equal(audio.audioPlaybackState.value.phase, "idle");
  audio.playAudio(); assert.equal(audio.audioPlaybackState.value.canReplay, false);
  audio.setAudioVolume(9); assert.equal(audio.getAudioVolume(), 1);
  audio.setAudioVolume(-1); assert.equal(audio.getAudioVolume(), 0);
  audio.stopAudio();
}
checkAudio().then(() => console.log("Learning checks passed: legacy migration, real daily counts and date rollover, assisted versus independent answers, review scheduling, session persistence, no extra rewards, volume, replay, and stale audio callbacks.")).catch(error => { console.error(error); process.exitCode = 1; });
