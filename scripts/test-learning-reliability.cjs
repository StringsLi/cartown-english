const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '../src');

function runtime() {
  const modules = new Map(), storage = new Map(), failKeys = new Set(), calls = [], toasts = [], hooks = {}, timers = new Map();
  let timerId = 0, now = new Date(2026, 9, 13, 10).getTime(), volume = 1, pendingAudio = null;
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const audio = {
    playAudio(url, label, onStarted) { pendingAudio = { url, onStarted }; }, stopAudio() { pendingAudio = null; },
    speakEnglish(text) { pendingAudio = { url: text }; },
    getAudioVolume: () => volume, audioPlaybackState: { value: { phase: 'idle' } }
  };
  const uni = {
    getStorageSync: key => storage.get(key),
    setStorageSync(key, value) { if (failKeys.has(key)) throw Error('storage full'); storage.set(key, structuredClone(value)); },
    removeStorageSync: key => storage.delete(key), showToast: value => toasts.push(value),
    showShareMenu() {}, hideShareMenu() {}, showModal: value => calls.push({ modal: value }),
    navigateTo: request => { calls.push(request); request.success?.(); },
    redirectTo: request => { calls.push(request); request.success?.(); }, reLaunch: request => { calls.push(request); request.success?.(); }
  };
  modules.set(path.join(root, 'services/audioService.ts'), { exports: audio });
  modules.set(path.join(root, 'services/mediaCacheService.ts'), { exports: { clearMediaCache() {} } });
  function load(file, exposed = []) {
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} }; modules.set(file, module);
    let source = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.vue')) source = source.split('<script setup lang="ts">')[1].split('</script>')[0];
    if (exposed.length) source += '\nexports.test = {' + exposed.join(',') + '};';
    const local = id => id === 'vue' ? { ...require('vue'), onBeforeUnmount() {}, onDeactivated() {} }
      : id === '@dcloudio/uni-app' ? new Proxy({}, { get: (_, name) => fn => (hooks[name] ||= []).push(fn) })
      : id.endsWith('.vue') ? {} : id.startsWith('@/') ? load(path.join(root, id.slice(2) + '.ts')) : require(id);
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, require: local, uni, Date: ClockDate,
      console: { ...console, warn() {} }, getCurrentPages: () => [{ route: 'pages/index/index' }],
      setTimeout: (fn, ms) => { timers.set(++timerId, { fn, ms }); return timerId; }, clearTimeout: id => timers.delete(id)
    }, { filename: file });
    return module.exports;
  }
  function page(relative, exposed, query = {}) {
    const file = path.join(root, relative), counts = Object.fromEntries(Object.entries(hooks).map(([name, list]) => [name, list.length]));
    modules.delete(file);
    const result = load(file, exposed).test;
    result.life = Object.fromEntries(Object.entries(hooks).map(([name, list]) => [name, list.slice(counts[name] || 0)]));
    result.life.onLoad?.forEach(fn => fn(query)); result.life.onShow?.forEach(fn => fn());
    return result;
  }
  return { load, page, storage, failKeys, calls, toasts, modules,
    play: () => pendingAudio?.onStarted?.(), callback: () => pendingAudio?.onStarted,
    volume: value => volume = value, tomorrow: () => now += 86400000,
    flush: ms => { for (const [id, timer] of [...timers]) if (timer.ms === ms) { timers.delete(id); timer.fn(); } }
  };
}

const saving = runtime(), key = 'little_english_book_progress';
const profile = saving.page('pkg-user/profile/index.vue', ['nickname', 'saveNickname']);
const utils = saving.load(path.join(root, 'utils/storage.ts'));
saving.failKeys.add(key); profile.nickname.value = '小司机'; profile.saveNickname();
assert.equal(utils.unsavedStorageCount.value, 1);
assert.equal(saving.storage.has(key), false);
assert.match(saving.toasts.at(-1).title, /还没保存/);
assert.equal(saving.toasts.at(-1).icon, 'none');
assert.equal(utils.retryStorageWrites(), false, 'failed retry leaves the change pending');
profile.nickname.value = '新司机'; profile.saveNickname();
saving.failKeys.clear();
const feedback = saving.page('components/StorageFeedback.vue', ['retry']); feedback.retry();
assert.equal(saving.storage.get(key).childNickname, '新司机', 'retry saves the latest draft');
assert.equal(utils.unsavedStorageCount.value, 0); assert.equal(saving.toasts.at(-1).title, '记录已保存');
utils.setStorage('volume', 0); assert.equal(utils.getStorage('volume', 1), 0, 'muted volume survives reload');
saving.failKeys.add('first'); saving.failKeys.add('second');
utils.setStorage('first', { count: 1 }); utils.setStorage('second', { count: 2 });
assert.deepEqual(JSON.parse(JSON.stringify(utils.getStorage('first'))), { count: 1 }, 'pending progress is readable without reverting to old data');
saving.failKeys.delete('first'); assert.equal(utils.retryStorageWrites(), false); assert.equal(utils.unsavedStorageCount.value, 1);
utils.removeStorage('second'); assert.equal(utils.unsavedStorageCount.value, 0);
assert.equal(utils.retryStorageWrites(), true); assert.equal(saving.storage.has('second'), false, 'clear cancels a pending write');

const game = runtime(), fields = ['topic', 'mode', 'wordIndex', 'currentItem', 'choices', 'answered', 'promptHeard', 'questionIndex',
  'dailyJourney', 'dailyCount', 'showDailyMilestone', 'playWord', 'selectWord', 'playPrompt', 'choose', 'next', 'switchMode',
  'nextDailyActivity', 'continueDailyActivity', 'finished', 'earnedStar', 'restart', 'feedback'];
const page = game.page('pkg-learning/playground-game/index.vue', fields, { topic: 'colors', daily: '1' });
const learning = game.load(path.join(root, 'services/playgroundLearningService.ts'));
const cartown = game.load(path.join(root, 'services/cartownProgressService.ts'));
assert.equal(page.dailyJourney.value, true); assert.equal(page.showDailyMilestone.value, false);
page.playWord(); assert.equal(page.dailyCount.value, 0, 'a click without successful playback never completes listening');
game.volume(0); game.play(); assert.equal(page.dailyCount.value, 0, 'muted playback does not complete listening');
game.volume(1); page.playWord();
game.play(); page.playWord(); game.play(); assert.equal(page.dailyCount.value, 1, 'replaying a word counts once');
page.selectWord(1); game.play(); page.selectWord(2); game.play();
assert.equal(page.dailyCount.value, 3); assert.equal(page.showDailyMilestone.value, true);
page.continueDailyActivity(); assert.equal(page.showDailyMilestone.value, false, 'the full topic remains available');
page.nextDailyActivity(); assert.equal(page.mode.value, 'quiz'); assert.equal(page.showDailyMilestone.value, false);
page.choose(page.currentItem.value.id); assert.equal(page.answered.value, false); assert.equal(learning.getTodayPlay().solvedIds.length, 0);
page.playPrompt(); assert.equal(page.promptHeard.value, false, 'loading audio does not unlock choices');
game.volume(0); game.play(); assert.equal(page.promptHeard.value, false); assert.match(page.feedback.value, /静音/);
game.volume(1); page.playPrompt(); game.play();
const oldPrompt = game.callback();
page.choose('not-a-choice'); assert.equal(page.answered.value, false);
page.choose(page.currentItem.value.id); page.choose(page.currentItem.value.id);
assert.equal(learning.getPlaygroundSummary([]).independent, 1); assert.equal(learning.getTodayPlay().solvedIds.length, 1);
page.next(); assert.equal(page.questionIndex.value, 1); assert.equal(page.promptHeard.value, false);
oldPrompt(); assert.equal(page.promptHeard.value, false, 'previous question playback cannot unlock the next question');
page.choose(page.currentItem.value.id); assert.equal(page.answered.value, false);
page.playPrompt(); game.play(); page.choose(page.choices.value.find(item => item.id !== page.currentItem.value.id).id);
game.play(); page.choose(page.currentItem.value.id);
assert.equal(learning.getPlaygroundSummary([]).independent, 1, 'retry success is not an independent answer');
assert.equal(page.showDailyMilestone.value, true); assert.equal(cartown.getCartownProgress().stars, 0, 'two daily answers do not award a full-topic stamp');
page.life.onHide.forEach(fn => fn());
assert.equal(game.storage.get('cartown_playground_learning').session.dailyJourney, true);
const resumed = game.page('pkg-learning/playground-game/index.vue', fields, { topic: 'colors', resume: '1' });
assert.equal(resumed.showDailyMilestone.value, true); assert.equal(resumed.answered.value, true); assert.equal(resumed.questionIndex.value, 1);
resumed.nextDailyActivity(); assert.equal(game.calls.at(-1).url, '/pkg-adventure/index/index');
resumed.continueDailyActivity(); resumed.life.onHide.forEach(fn => fn());
const continuing = game.page('pkg-learning/playground-game/index.vue', fields, { topic: 'colors', resume: '1' });
assert.equal(continuing.showDailyMilestone.value, false, 'choosing to continue the full topic survives leaving and resuming');
continuing.next();
while (!continuing.finished.value) { continuing.playPrompt(); game.play(); continuing.choose(continuing.currentItem.value.id); continuing.next(); }
assert.equal(cartown.getCartownProgress().stars, 1); assert.equal(learning.getPlaygroundLearning().session, null);
continuing.restart();
while (!continuing.finished.value) { continuing.playPrompt(); game.play(); continuing.choose(continuing.currentItem.value.id); continuing.next(); }
assert.equal(cartown.getCartownProgress().stars, 1, 'replaying the full topic never adds another star');
const regular = game.page('pkg-learning/playground-game/index.vue', fields, { topic: 'colors' });
assert.equal(regular.showDailyMilestone.value, false, 'daily goals do not interrupt regular exploration');
const review = game.page('pkg-learning/playground-game/index.vue', fields, { topic: 'colors', review: '1', daily: '1' });
assert.equal(review.dailyJourney.value, false, 'review stays separate from daily task guidance');
const tomorrow = game.page('pkg-learning/playground-game/index.vue', fields, { topic: 'colors', daily: '1' });
assert.equal(tomorrow.showDailyMilestone.value, true); game.tomorrow(); tomorrow.life.onShow.forEach(fn => fn());
assert.equal(tomorrow.dailyCount.value, 0); assert.equal(tomorrow.showDailyMilestone.value, false, 'returning on a new day refreshes daily goals');

// Every listen-and-find activity uses the same audible prompt and lifecycle guards.
for (const [name, target, answerKey, choose, counter] of [
  ['car-colors', 'target', 'id', 'choose', 'colorQuestionsDone'],
  ['car-traffic', 'prompt', 'action', 'choose', 'trafficTurnsDone'],
  ['car-logos', 'targetLogo', 'id', 'chooseLogo', 'logoQuizDone']
]) {
  const rt = runtime();
  const fields = [target, choose, 'answered', 'askAgain', 'nextRound', 'promptHeard', 'promptHint',
    ...(name === 'car-logos' ? ['startQuiz', 'learnMode'] : [])];
  const quiz = rt.page(`pkg-cars/${name}/index.vue`, fields);
  const progress = rt.load(path.join(root, 'services/cartownProgressService.ts'));
  if (quiz.startQuiz) quiz.startQuiz();
  const answer = () => quiz[target].value[answerKey];
  quiz[choose](answer());
  assert.equal(quiz.answered.value, false, `${name}: guessing without hearing is blocked`);
  const playback = rt.modules.get(path.join(root, 'services/audioService.ts')).exports;
  quiz.askAgain(); playback.audioPlaybackState.value.phase = 'error';
  assert.match(quiz.promptHint.value, /没有播出来/);
  quiz[choose](answer()); assert.equal(quiz.answered.value, false, `${name}: failed audio cannot open answers`);
  playback.audioPlaybackState.value.phase = 'idle';
  quiz.askAgain(); const beforeHide = rt.callback();
  assert.equal(quiz.promptHeard.value, false, `${name}: loading does not open answers`);
  quiz.life.onHide.forEach(fn => fn()); beforeHide();
  assert.equal(quiz.promptHeard.value, false, `${name}: a late callback after leaving is ignored`);
  rt.volume(0); quiz.askAgain(); rt.play();
  assert.equal(quiz.promptHeard.value, false); assert.match(quiz.promptHint.value, /静音/);
  quiz[choose](answer()); assert.equal(progress.getCartownProgress()[counter], 0);
  rt.volume(1); quiz.askAgain(); const oldPrompt = rt.callback(); rt.play();
  assert.equal(quiz.promptHeard.value, true);
  quiz[choose]('invalid'); assert.equal(quiz.answered.value, false, `${name}: invalid options are ignored`);
  quiz[choose](answer()); quiz[choose](answer());
  assert.equal(progress.getCartownProgress()[counter], 1); assert.equal(progress.getCartownProgress().stars, 1);
  quiz.nextRound(); oldPrompt(); assert.equal(quiz.promptHeard.value, false, `${name}: previous prompt cannot open the next round`);
  quiz[choose](answer()); assert.equal(quiz.answered.value, false);
  rt.play(); assert.equal(quiz.promptHeard.value, true);
  if (quiz.learnMode) {
    quiz.askAgain(); const oldMode = rt.callback(); quiz.learnMode(); oldMode();
    assert.equal(quiz.promptHeard.value, false, 'Switching to logo learning invalidates pending game audio');
    quiz[choose](answer()); assert.equal(progress.getCartownProgress().logoQuizDone, 1);
  }
}
const spaceRuntime = runtime();
const space = spaceRuntime.page('pkg-space/quiz/index.vue', ['question', 'questions', 'questionIndex', 'solved',
  'wrongId', 'finished', 'earnedStar', 'promptHeard', 'promptHint', 'playPrompt', 'choose', 'next', 'restart'], { series: 'home' });
const spaceLearning = spaceRuntime.load(path.join(root, 'services/spaceLearningService.ts'));
space.choose(space.question.value.target.id); assert.equal(space.solved.value, false);
spaceRuntime.volume(0); spaceRuntime.play();
assert.equal(space.promptHeard.value, false); assert.equal(spaceLearning.getSpaceProgress().heardIds.length, 0);
spaceRuntime.volume(1); space.playPrompt(); const lateSpacePrompt = spaceRuntime.callback();
space.life.onHide.forEach(fn => fn()); lateSpacePrompt();
assert.equal(space.promptHeard.value, false); assert.equal(spaceLearning.getSpaceProgress().heardIds.length, 0);
space.playPrompt(); spaceRuntime.play();
const incorrect = space.question.value.choices.find(item => item.id !== space.question.value.target.id);
space.choose(incorrect.id); assert.equal(space.solved.value, false); assert.equal(space.wrongId.value, incorrect.id);
for (let round = 0; round < 2; round++) {
  while (!space.finished.value) {
    space.playPrompt(); spaceRuntime.play();
    const targetId = space.question.value.target.id;
    space.choose(targetId); space.choose(targetId); assert.equal(space.solved.value, true);
    space.next();
  }
  assert.equal(space.earnedStar.value, round === 0);
  assert.equal(spaceRuntime.load(path.join(root, 'services/cartownProgressService.ts')).getCartownProgress().stars, 1);
  space.restart(); assert.equal(space.promptHeard.value, false);
}
console.log('Listening game checks passed: four activities block unheard/muted/loading/invalid answers, late callbacks after leaving and changing rounds/modes, wrong-answer retry and duplicate rewards.');

(async () => {
  const importing = runtime();
  importing.modules.set(path.join(root, 'services/recordService.ts'), { exports: {
    recordPlaybackState: { value: { phase: 'idle', path: '' } }, stopRecordPlayback() {}, playRecord() {}
  } });
  importing.modules.set(path.join(root, 'pkg-reading/services/recordExportService.ts'), { exports: { releasePreparedRecord() {} } });
  const record = { userId: 'local_child', bookId: 'book_red_car_001', sentence: 'Hello!', audioUrl: '/saved/imported.mp3', createdAt: '2026-10-13 10:00:00' };
  importing.modules.set(path.join(root, 'pkg-reading/services/recordArchiveService.ts'), { exports: {
    importRepeatRecordArchive: async () => ({ records: [record], duplicates: 0, skipped: 0, limited: 0 })
  } });
  const recordings = importing.page('pkg-reading/recordings/index.vue', ['importBackup', 'records']);
  importing.failKeys.add(key); await recordings.importBackup();
  assert.equal(recordings.records.value.length, 1);
  assert.match(importing.toasts.at(-1).title, /记录未保存/);
  assert.equal(importing.calls.some(call => call.modal?.title === '备份恢复完成'), false, 'failed imported index never claims full recovery');
  importing.failKeys.clear();
  const importStorage = importing.load(path.join(root, 'utils/storage.ts'));
  assert.equal(importStorage.retryStorageWrites(), true);
  assert.equal(importing.storage.get(key).repeatRecords.length, 1, 'retrying the index does not re-import files');
  console.log('Reliability checks passed: failed saves/latest retry, partial recovery/clear, import-index retry, muted storage, heard-prompt answer gating, invalid/stale answers, daily 3-word/2-picture milestones, continuation/resume, full-topic rewards and date rollover.');
})().catch(error => { console.error(error); process.exitCode = 1; });
