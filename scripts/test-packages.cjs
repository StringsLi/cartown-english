const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '../src');
function runtime(native = true) {
  const modules = new Map(), requests = [], contexts = [], timers = new Map(), storage = new Map();
  const page = { route: "pages/index/index" };
  let id = 0;
  const uni = {
    getStorageSync: key => storage.get(key), setStorageSync: (key, value) => storage.set(key, value), showToast() {},
    createInnerAudioContext() {
      const events = {};
      const audio = { onPlay: fn => events.play = fn, onEnded: fn => events.end = fn, onError: fn => events.error = fn, stop() {}, destroy() {}, fire: name => events[name]?.() };
      contexts.push(audio); return audio;
    }
  };
  const wx = {}; // Real mini-program wx has no mini-game loadSubpackage API.
  function load(file) {
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} }; modules.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const nativeRequire = id => id.startsWith('@/') ? load(path.join(root, id.slice(2) + '.ts')) : require(id);
    nativeRequire.async = file => new Promise((resolve, reject) => requests.push({name: /\/([^/]+)\/static\//.exec(file)[1], file, success: resolve, fail: reject}));
    const context = { module, exports: module.exports, require: nativeRequire, uni, console: { warn() {} }, setTimeout: fn => { timers.set(++id, fn); return id; }, clearTimeout: id => timers.delete(id) };
    if (native) { context.wx = wx; context.getCurrentPages = () => [page]; }
    vm.runInNewContext(code, context, { filename: file }); return module.exports;
  }
  return { service: name => load(path.join(root, 'services', name + '.ts')), requests, contexts, timers, page };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
(async () => {
  const r = runtime(), cache = r.service('mediaCacheService');
  const chant = '/pkg-music/static/audio/colors-chant.mp3';
  let ready = false;
  const first = cache.resolveCachedMedia(chant, 'audio').then(url => { ready = true; return url; });
  const second = cache.resolveCachedMedia('/pkg-music/static/audio/animals-chant.mp3', 'audio');
  assert.equal(r.requests.length, 1, 'concurrent resources share one package load');
  await tick(); assert.equal(ready, false, 'no resource exposed before package success');
  assert.equal(r.requests[0].name, 'pkg-music'); r.requests[0].success();
  assert.equal(await first, chant); await second;
  await cache.resolveCachedMedia(chant, 'audio'); assert.equal(r.requests.length, 1, 'loaded package reused');
  await cache.resolveCachedMedia('/static/audio/hello.mp3', 'audio'); assert.equal(r.requests.length, 1, 'main media never requests a subpackage');

  const failed = cache.resolveCachedMedia('/pkg-cars/static/vehicle-icons/car.jpg', 'image');
  const settled = Promise.allSettled([failed]); r.requests.at(-1).fail(new Error('offline'));
  assert.equal((await settled)[0].status, 'rejected');
  const retry = cache.resolveCachedMedia('/pkg-cars/static/vehicle-icons/car.jpg', 'image');
  assert.equal(r.requests.length, 3); r.requests.at(-1).success(); await retry;

  const timeout = cache.resolveCachedMedia('/pkg-reading/static/audio/phrases/test.mp3', 'audio');
  const timeoutCheck = assert.rejects(timeout, /timed out/); const late = r.requests.at(-1);
  [...r.timers.values()].forEach(fn => fn()); await timeoutCheck; late.success();
  const afterTimeout = cache.resolveCachedMedia('/pkg-reading/static/audio/phrases/test.mp3', 'audio');
  assert.equal(r.requests.length, 5, 'late success after timeout cannot mark a package loaded');
  r.requests.at(-1).success(); await afterTimeout;

  const own = runtime(); own.page.route = 'pkg-space/index/index';
  assert.equal(await own.service('mediaCacheService').resolveCachedMedia('/pkg-space/static/textures/earth.jpg', 'image'), '/pkg-space/static/textures/earth.jpg');
  assert.equal(own.requests.length, 0, 'own-package media must not call any loader');
  assert.equal(own.timers.size, 0);
  await assert.rejects(runtime().service('mediaCacheService').resolveCachedMedia('/pkg-space/static/textures/earth.jpg', 'image'), /Open this world/);

  const stopped = runtime(), audio = stopped.service('audioService');
  audio.playAudio(chant, 'colors'); audio.stopAudio(); stopped.requests[0].success(); await tick();
  assert.equal(stopped.contexts.length, 0, 'leaving during package loading prevents late playback');
  assert.equal(audio.audioPlaybackState.value.phase, 'idle');

  const a = runtime(), player = a.service('audioService');
  player.playAudio(chant, 'colors'); player.playAudio('/pkg-music/static/audio/animals-chant.mp3', 'animals');
  assert.equal(a.requests.length, 1); assert.equal(a.contexts.length, 0);
  a.requests[0].fail(new Error('network')); await tick();
  assert.equal(player.audioPlaybackState.value.phase, 'error'); assert.equal(player.audioPlaybackState.value.canReplay, true);
  player.replayAudio(); assert.equal(a.requests.length, 2); a.requests.at(-1).success(); await tick();
  assert.equal(a.contexts.length, 1); assert.equal(a.contexts[0].src, '/pkg-music/static/audio/animals-chant.mp3');
  a.contexts[0].fire('play'); assert.equal(player.audioPlaybackState.value.phase, 'playing');
  player.stopAudio(); assert.equal(a.timers.size, 0);

  const h5 = runtime(false); assert.equal(await h5.service('mediaCacheService').resolveCachedMedia(chant, 'audio'), chant);
  assert.equal(h5.requests.length, 0);
  console.log('Package checks passed: load deduplication, readiness, cached success, failed image retry, timeout/late callbacks, canceled playback, latest-request playback, replay recovery and H5 paths and actual mini-program API availability.');
})().catch(error => { console.error(error); process.exitCode = 1; });
