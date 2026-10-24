const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '../src'), storage = new Map(), modules = new Map(), hooks = {}, calls = [], timers = new Map();
let volume = 1, audioCallback, timerId = 0;
const audio = { playAudio(url, label, callback) { audioCallback = callback; }, stopAudio() { audioCallback = null; }, getAudioVolume: () => volume };
const failKeys = new Set();
const uni = { getStorageSync: key => storage.get(key), setStorageSync(key, value) { if (failKeys.has(key)) throw Error('full'); storage.set(key, structuredClone(value)); },
  removeStorageSync: key => storage.delete(key), showToast() {}, showShareMenu() {},
  navigateTo: value => { calls.push(value); value.success?.(); } };
modules.set(path.join(root, 'services/audioService.ts'), { exports: audio });
function load(file, exposed = []) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} }; modules.set(file, module);
  let source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.vue')) source = source.split('<script setup lang="ts">')[1].split('</script>')[0];
  if (exposed.length) source += '\nexports.test = {' + exposed.join(',') + '};';
  const local = id => id === 'vue' ? { ...require('vue'), onBeforeUnmount() {}, onDeactivated() {} }
    : id === '@dcloudio/uni-app' ? new Proxy({}, { get: (_, key) => fn => (hooks[key] ||= []).push(fn) })
    : id.endsWith('.vue') ? {} : id.startsWith('@/') ? load(path.join(root, id.slice(2) + '.ts')) : require(id);
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: local, uni, Date, console: { ...console, warn() {} }, getCurrentPages: () => [{ route: 'pkg-user/wordbook/index' }],
    setTimeout: (fn, ms) => { timers.set(++timerId, { fn, ms }); return timerId; }, clearTimeout: id => timers.delete(id) }, { filename: file });
  return module.exports;
}
function flush() { for (const [id, value] of [...timers]) { timers.delete(id); value.fn(); } }
const service = load(path.join(root, 'pkg-user/services/wordbookService.ts'));
storage.set('cartown_favorite_words_v1', ['colors:red', 'colors:red', 'missing', null]);
assert.deepEqual(Array.from(service.getFavoriteWords()), ['colors:red']);
service.toggleFavoriteWord('missing'); assert.equal(service.getFavoriteWords().length, 1);
service.clearFavoriteWords();
const learning = load(path.join(root, 'services/playgroundLearningService.ts'));
const cartown = load(path.join(root, 'services/cartownProgressService.ts'));
learning.recordPlaygroundAnswer('colors', 'red', false);
const fields = ['entries', 'counts', 'independentCount', 'filteredEntries', 'query', 'status', 'topicId', 'refresh', 'hasFilters', 'listen', 'favorite', 'practice', 'selectStatus', 'selectTopic', 'resetFilters'];
const page = load(path.join(root, 'pkg-user/wordbook/index.vue'), fields).test;
hooks.onShow.forEach(fn => fn());
assert.equal(page.entries.value.length, 40); assert.equal(new Set(page.entries.value.map(item => item.key)).size, 40);
assert.equal(page.counts.value.review, 1); assert.equal(page.counts.value.heard, 0);
page.query.value = ' ELEPHANT '; assert.equal(page.filteredEntries.value.length, 1);
assert.equal(page.filteredEntries.value[0].label, '大象');
page.query.value = '红色'; assert.equal(page.filteredEntries.value[0].key, 'colors:red');
page.selectTopic('animals'); assert.equal(page.filteredEntries.value.length, 0, 'Search combines with topic filters');
page.resetFilters(); assert.equal(page.hasFilters.value, false);
page.selectStatus('favorite'); assert.equal(page.filteredEntries.value.length, 0);
page.favorite('colors:red'); assert.equal(page.filteredEntries.value.length, 1);
assert.equal(page.counts.value.heard, 0, 'Favoriting is never a listening event');
assert.equal(page.independentCount.value, 0, 'Favorites never imply independent success');
page.resetFilters(); page.listen('colors:red'); const muted = audioCallback;
assert.equal(page.counts.value.heard, 0, 'Loading is never counted'); volume = 0; muted();
assert.equal(page.counts.value.heard, 0, 'Muted playback is never counted');
volume = 1; page.listen('colors:red'); const departed = audioCallback;
hooks.onHide.forEach(fn => fn()); departed(); assert.equal(page.counts.value.heard, 0);
hooks.onShow.forEach(fn => fn()); page.listen('colors:red'); const earlier = audioCallback;
page.listen('animals:lion'); earlier(); assert.equal(page.counts.value.heard, 0, 'An old playback cannot mark a different card heard');
audioCallback(); audioCallback(); assert.equal(page.counts.value.heard, 1);
assert.equal(learning.getTodayPlay().heardIds.length, 1); assert.equal(cartown.getCartownProgress().playgroundHeardWordIds[0], 'animals:lion');
page.listen('colors:red'); const filtered = audioCallback; page.selectTopic('animals'); filtered(); assert.equal(page.counts.value.heard, 1);
page.practice('colors:red'); assert.equal(calls.at(-1).url, '/pkg-learning/playground-game/index?topic=colors&mode=quiz&review=1'); flush();
page.practice('animals:lion'); assert.equal(calls.at(-1).url, '/pkg-learning/playground-game/index?topic=animals&mode=quiz'); flush();
learning.recordPlaygroundAnswer('colors', 'red', true); page.refresh();
assert.equal(page.counts.value.review, 0); assert.equal(page.independentCount.value, 1, 'Review is refreshed after successful practice');
failKeys.add('cartown_favorite_words_v1'); page.favorite('food:apple');
const utils = load(path.join(root, 'utils/storage.ts'));
assert.equal(utils.unsavedStorageCount.value, 1); assert.ok(service.getFavoriteWords().includes('food:apple'));
failKeys.clear(); assert.equal(utils.retryStorageWrites(), true);
assert.ok(storage.get('cartown_favorite_words_v1').includes('food:apple'));
failKeys.add('cartown_favorite_words_v1'); page.favorite('colors:blue');
assert.equal(utils.unsavedStorageCount.value, 1);
service.clearFavoriteWords(); failKeys.clear(); assert.equal(utils.retryStorageWrites(), true);
assert.equal(storage.has('cartown_favorite_words_v1'), false, 'Clearing also cancels an unsaved favorite update');
page.refresh(); assert.equal(page.counts.value.favorite, 0);
assert.equal(cartown.getCartownProgress().stars, 0, 'Browsing, listening and favorites never award stars');
const routes = JSON.parse(fs.readFileSync(path.join(root, 'pages.json'))).subPackages;
assert.ok(routes.some(pkg => pkg.root === 'pkg-user' && pkg.pages.some(page => page.path === 'wordbook/index')));
console.log('Wordbook checks passed: all 40 real words, legacy progress, favorites sanitation/persistence/save retry/clear, combined search/theme/status filters, audible-only daily listening, stale callbacks, correct review links, updated practice states and no extra rewards.');
