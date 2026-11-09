const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '../src');
function runtime() {
  const modules = new Map(), storage = new Map(), contexts = [], timers = new Map(), intervals = new Map();
  let now = new Date(2026, 9, 25, 12).getTime(), sequence = 0, failWrites = false, resolveMedia = async url => url;
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } }
  const uni = {
    getStorageSync: key => storage.get(key), setStorageSync: (key, value) => { if (failWrites) throw Error('full'); storage.set(key, structuredClone(value)); }, removeStorageSync: key => storage.delete(key),
    createInnerAudioContext() {
      const events = {};
      const audio = { currentTime: 0, duration: 12, volume: 1, stop() {}, destroy() { this.destroyed = true; }, play() { this.playRequested = true; }, seek(value) { this.currentTime = value; }, fire(name) { events[name]?.(); } };
      for (const event of ['Play', 'Pause', 'Ended', 'Error', 'Canplay', 'TimeUpdate']) audio['on' + event] = fn => events[event] = fn;
      contexts.push(audio); return audio;
    }
  };
  modules.set(path.join(root, 'services/audioService.ts'), { exports: { stopAudio() {}, configureAudioPlayback() {}, getAudioVolume: () => 0.7 } });
  modules.set(path.join(root, 'services/mediaCacheService.ts'), { exports: { resolveCachedMedia: url => resolveMedia(url), invalidateCachedMedia() {} } });
  function load(file) {
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} }; modules.set(file, module);
    const requireLocal = id => id.startsWith('@/') || id.startsWith('.') ? load(path.resolve(id.startsWith('@/') ? root : path.dirname(file), id.replace(/^@\//, '') + '.ts')) : require(id);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(code, { module, exports: module.exports, require: requireLocal, uni, Date: Clock, console: { warn() {} },
      setTimeout: fn => { timers.set(++sequence, fn); return sequence; }, clearTimeout: id => timers.delete(id),
      setInterval: fn => { intervals.set(++sequence, fn); return sequence; }, clearInterval: id => intervals.delete(id)
    }, { filename: file });
    return module.exports;
  }
  return { load: name => load(path.join(root, name + '.ts')), storage, contexts, timers, intervals,
    advance(ms) { now += ms; for (const callback of [...intervals.values()]) callback(); },
    failWrites(value) { failWrites = value; }, resolveWith(fn) { resolveMedia = fn; } };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
const plain = value => JSON.parse(JSON.stringify(value));
(async () => {
  const r = runtime(), catalog = r.load('pkg-family/catalog');
  assert.equal(catalog.listeningTracks.length, 16); assert.equal(catalog.lifeRoutines.length, 6);
  const steps = catalog.lifeRoutines.flatMap(item => item.steps);
  assert.equal(new Set(steps.map(step => step.id)).size, 18);
  for (const track of catalog.listeningTracks) assert.ok(fs.existsSync(path.join(root, track.audio)), track.audio);
  for (const step of steps) {
    const file = fs.readFileSync(path.join(root, catalog.routineAudio(step.id)));
    assert.equal(file.toString('ascii', 0, 4), 'RIFF'); assert.equal(file.toString('ascii', 8, 12), 'WAVE'); assert.ok(file.length <= 200 * 1024);
    let pcm, format;
    for (let offset = 12; offset + 8 <= file.length;) {
      const size = file.readUInt32LE(offset + 4), type = file.toString('ascii', offset, offset + 4);
      if (type === 'data') pcm = file.subarray(offset + 8, offset + 8 + size);
      if (type === 'fmt ') format = file.subarray(offset + 8, offset + 8 + size);
      offset += 8 + size + size % 2;
    }
    assert.equal(format.readUInt16LE(0), 1); assert.equal(format.readUInt16LE(2), 1); assert.equal(format.readUInt32LE(4), 16000); assert.equal(format.readUInt16LE(14), 16);
    assert.ok(pcm.length > 16000, 'Speech cannot be an empty WAV header');
    let peak = 0; for (let i = 0; i < pcm.length; i += 2) peak = Math.max(peak, Math.abs(pcm.readInt16LE(i)));
    assert.ok(peak > 300, 'Speech cannot be silent');
  }
  const routines = r.load('pkg-family/services/routineService');
  assert.equal(routines.setRoutineStep('bad', true), false);
  const date = '2026-10-25';
  for (const step of catalog.lifeRoutines[0].steps) { routines.setRoutineStep(step.id, true, date); routines.setRoutineStep(step.id, true, date); }
  assert.equal(routines.getRoutineProgress().days[date].length, 3); assert.equal(routines.getRoutineWeek().at(-1).count, 1);
  routines.setRoutineStep('brush-ready', false, date); assert.equal(routines.getRoutineWeek().at(-1).count, 0);
  assert.equal(routines.getRoutineWeek(new Date(2026, 9, 26)).at(-1).count, 0);
  routines.selectRoutine('bed'); assert.equal(routines.getRoutineProgress().selected, 'bed');
  r.failWrites(true); assert.equal(routines.setRoutineStep('brush-ready', true, date), false);
  assert.equal(routines.getRoutineWeek().at(-1).count, 1, 'pending edits remain visible');
  r.failWrites(false); assert.equal(r.load('utils/storage').retryStorageWrites(), true); assert.equal(r.storage.get(routines.ROUTINE_KEY).days[date].length, 3);
  for (let day = 0; day < 110; day++) {
    const key = r.load('utils/date').todayKey(new Date(2026, 9, 25 - day));
    assert.equal(routines.setRoutineStep('brush-ready', true, key), day < 90, 'only the last 90 calendar days can be recorded');
  }
  assert.equal(Object.keys(routines.getRoutineProgress().days).length, 90);
  const retained = runtime(), retainedRoutines = retained.load('pkg-family/services/routineService');
  const firstDay = retained.load('utils/date').todayKey(new Date(2026, 9, 25 - 89));
  const expiredDay = retained.load('utils/date').todayKey(new Date(2026, 9, 25 - 90));
  retained.storage.set(retainedRoutines.ROUTINE_KEY, { selected: 'bed', days: {
    [expiredDay]: ['brush-ready'], [firstDay]: ['brush-ready', 'brush-ready', 'bad'],
    '2026-01-01': ['brush-ready'], '2026-09-31': ['brush-ready'], [date]: ['brush-teeth'], '2026-12-01': ['brush-ready']
  } });
  assert.deepEqual(plain(retainedRoutines.getRoutineProgress().days), { [firstDay]: ['brush-ready'], [date]: ['brush-teeth'] });
  assert.deepEqual(retained.storage.get(retainedRoutines.ROUTINE_KEY).days, { [firstDay]: ['brush-ready'], [date]: ['brush-teeth'] }, 'expired sparse history is removed from disk on read');
  for (const invalidDate of ['2026-09-31', '2026-10-26', expiredDay, 'bad']) assert.equal(retainedRoutines.setRoutineStep('brush-ready', true, invalidDate), false);
  retained.advance(86400000);
  assert.deepEqual(plain(retainedRoutines.getRoutineProgress().days), { [date]: ['brush-teeth'] }, 'the retention boundary rolls over at the next local day');
  const engine = r.load('pkg-family/services/listeningService');
  assert.equal(engine.normalizeQueue({ ids: [] }).ids.length, 0, 'an empty playlist remains empty');
  const clean = engine.normalizeQueue({ ids: ['bad', 'story-colors', 'story-colors'], index: 99, position: -1, timerMinutes: 999 });
  assert.deepEqual(plain(clean.ids), ['story-colors']); assert.equal(clean.index, 0); assert.equal(clean.position, 0); assert.equal(clean.timerMinutes, 10);
  let player = engine.createListeningPlayer(); assert.equal(r.contexts.length, 0, 'opening never autoplays');
  await player.play(); const first = r.contexts.at(-1); assert.equal(first.volume, 0.7);
  first.fire('Play'); first.currentTime = 3.5; first.fire('TimeUpdate'); r.advance(2000); const remaining = player.state.value.remainingMs;
  player.pause(); assert.equal(player.state.value.position, 3.5); assert.equal(r.intervals.size, 0);
  r.advance(10000); assert.equal(player.state.value.remainingMs, remaining, 'paused time excluded');
  await player.play(); const second = r.contexts.at(-1); assert.equal(second.startTime, 3.5);
  first.fire('Error'); first.fire('Ended'); assert.equal(player.state.value.phase, 'loading', 'stale callbacks ignored');
  second.fire('Play'); second.fire('Canplay'); player.seek(5); assert.equal(second.currentTime, 5);
  const playingId = player.current().id; player.move(0, 1); assert.equal(player.current().id, playingId);
  second.currentTime = second.duration; second.fire('Pause'); assert.equal(player.state.value.phase, 'playing', 'natural-end pause must not cancel ended');
  second.fire('Ended'); await tick(); assert.equal(player.state.value.position, 0); assert.equal(player.state.value.index, 2);
  r.contexts.at(-1).fire('Play'); player.setTimer(5); r.advance(300001);
  assert.equal(player.state.value.phase, 'paused'); assert.equal(player.state.value.remainingMs, 0); assert.equal(r.intervals.size, 0);
  await player.play(); assert.equal(player.state.value.remainingMs, 300000);
  r.contexts.at(-1).fire('Error'); assert.equal(player.state.value.phase, 'error'); await player.play(); assert.equal(player.state.value.phase, 'loading'); player.pause();
  let resolve; r.resolveWith(() => new Promise(done => resolve = done));
  const count = r.contexts.length, pending = player.play(); player.pause(); resolve('late.mp3'); await pending;
  assert.equal(r.contexts.length, count, 'canceled loading cannot create late audio'); r.resolveWith(async url => url);
  for (const id of [...player.state.value.ids]) player.toggle(id);
  assert.equal(player.state.value.ids.length, 0); await player.play(); assert.equal(r.contexts.length, count);
  player.toggle('chant-colors'); player.setTimer(0); await player.play(); r.contexts.at(-1).fire('Play'); r.contexts.at(-1).fire('Ended');
  assert.equal(player.state.value.phase, 'ended'); player.toggleRepeat(); await player.play(); r.contexts.at(-1).fire('Play'); r.contexts.at(-1).fire('Ended'); await tick();
  assert.equal(player.state.value.phase, 'loading'); player.dispose(); assert.equal(r.intervals.size, 0); assert.equal(r.timers.size, 0);
  const oldCount = r.contexts.length; await player.play(); assert.equal(r.contexts.length, oldCount);
  player = engine.createListeningPlayer(); assert.equal(player.current().id, 'chant-colors'); assert.equal(player.state.value.phase, 'idle');
  r.storage.delete(engine.LISTENING_KEY); player.restore(); assert.equal(player.state.value.ids.length, 8); player.dispose();
  const slow = runtime(), slowPlayer = slow.load('pkg-family/services/listeningService').createListeningPlayer();
  slow.resolveWith(() => new Promise(() => {})); void slowPlayer.play(); [...slow.timers.values()].forEach(fn => fn()); assert.equal(slowPlayer.state.value.phase, 'error'); slowPlayer.dispose();
  const edits = runtime(), editEngine = edits.load('pkg-family/services/listeningService'), editPlayer = editEngine.createListeningPlayer();
  let finishLoad;
  edits.resolveWith(() => new Promise(resolve => finishLoad = resolve));
  const loading = editPlayer.play();
  editPlayer.toggle('chant-colors'); editPlayer.toggle('story-animals'); editPlayer.move(0, 1);
  assert.equal(editPlayer.state.value.phase, 'loading', 'editing other entries must not cancel a pending track');
  finishLoad('loaded.mp3'); await loading;
  const ongoing = edits.contexts.at(-1); ongoing.fire('Play'); ongoing.currentTime = 4.25; ongoing.fire('TimeUpdate');
  const activeId = editPlayer.current().id, beforeEdits = editPlayer.state.value.remainingMs;
  editPlayer.toggle('chant-fruits'); editPlayer.toggle('story-fruits'); editPlayer.move(editPlayer.state.value.index, -1);
  assert.equal(editPlayer.state.value.phase, 'playing'); assert.equal(editPlayer.current().id, activeId);
  assert.equal(editPlayer.state.value.position, 4.25); assert.equal(ongoing.destroyed, undefined); assert.equal(edits.contexts.length, 1);
  edits.advance(1000); assert.equal(editPlayer.state.value.remainingMs, beforeEdits - 1000, 'playlist edits preserve the active timer');
  ongoing.currentTime = 5.75; ongoing.fire('Error');
  assert.equal(editPlayer.state.value.position, 5.75, 'retry keeps the latest position even between time updates');
  edits.resolveWith(async url => url); await editPlayer.play(); const retry = edits.contexts.at(-1);
  assert.equal(retry.startTime, 5.75); retry.fire('Play');
  editPlayer.toggle(activeId); assert.equal(editPlayer.state.value.phase, 'paused'); assert.equal(retry.destroyed, true);
  assert.equal(editPlayer.state.value.position, 0, 'removing the playing track prepares the next one without autoplay');
  editPlayer.toggleRepeat(); editPlayer.choose(0); editPlayer.skip(-1);
  assert.equal(editPlayer.state.value.index, editPlayer.state.value.ids.length - 1, 'repeat allows previous to wrap at the first track');
  editPlayer.skip(1); assert.equal(editPlayer.state.value.index, 0, 'repeat allows next to wrap at the last track');
  await editPlayer.play(); edits.contexts.at(-1).fire('Play'); editPlayer.choose(editPlayer.state.value.ids.length - 1, true); await tick();
  edits.contexts.at(-1).fire('Play'); editPlayer.skip(1); await tick();
  assert.equal(editPlayer.state.value.index, 0); assert.equal(editPlayer.state.value.phase, 'loading', 'manual wrap continues playback');
  editPlayer.dispose();
  const clear = runtime(); clear.storage.set(routines.ROUTINE_KEY, { selected: 'bed' }); clear.storage.set(engine.LISTENING_KEY, { ids: ['chant-colors'] });
  clear.load('services/cartownProgressService').clearCartownProgress(); assert.equal(clear.storage.has(routines.ROUTINE_KEY), false); assert.equal(clear.storage.has(engine.LISTENING_KEY), false);
  const routes = JSON.parse(fs.readFileSync(path.join(root, 'pages.json'))).subPackages.find(item => item.root === 'pkg-family');
  assert.deepEqual(routes.pages.map(page => page.path), ['listen/index', 'routines/index']);
  console.log('Family checks passed: 16 tracks, 18 non-silent WAVs, daily deduplication/undo/rollover, 90-calendar-day cleanup/save retry, uninterrupted queue editing/loading, queue order/empty/resume, stale events/cancellation, timer/pause/repeat/wrap/end, retry position/timeout, disposal and reset.');
})().catch(error => { console.error(error); process.exitCode = 1; });
