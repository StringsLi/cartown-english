const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '../src');
const storage = new Map(), modules = new Map(), timers = new Map(), calls = [], toasts = [], hooks = {};
let timerId = 0, pageStack = [{ route: 'pages/index/index' }];
const timer = (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; };
const flush = ms => { for (const [id, value] of [...timers]) if (value.ms === ms) { timers.delete(id); value.fn(); } };
const uni = {
  getStorageSync: key => storage.get(key), setStorageSync: (key, value) => storage.set(key, structuredClone(value)), removeStorageSync: key => storage.delete(key),
  showToast: value => toasts.push(value),
  navigateTo: options => calls.push({ mode: 'navigateTo', ...options }), redirectTo: options => calls.push({ mode: 'redirectTo', ...options }), reLaunch: options => calls.push({ mode: 'reLaunch', ...options }), navigateBack: options => calls.push({ mode: 'navigateBack', ...options })
};
const audio = { playAudio() {}, speakEnglish() {}, stopAudio() {} };
modules.set(path.join(root, 'services/audioService.ts'), { exports: audio });
function load(file, exposed = []) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} }; modules.set(file, module);
  const requireLocal = id => {
    if (id === 'vue') return { ...require('vue'), onBeforeUnmount: fn => (hooks.onBeforeUnmount ||= []).push(fn), onDeactivated: fn => (hooks.onDeactivated ||= []).push(fn) };
    if (id.endsWith('.vue')) return {};
    if (id === '@dcloudio/uni-app') return new Proxy({}, { get: (_, name) => fn => { (hooks[name] ||= []).push(fn); } });
    if (id.startsWith('@/') || id.startsWith('.')) return load(path.resolve(id.startsWith('@/') ? root : path.dirname(file), id.replace(/^@\//, '') + '.ts'));
    return require(id);
  };
  let source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.vue')) source = source.split('<script setup lang="ts">')[1].split('</script>')[0];
  if (exposed.length) source += '\nexports.test = { ' + exposed.join(', ') + ' };';
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: requireLocal, uni, getCurrentPages: () => pageStack, console, setTimeout: timer, clearTimeout: id => timers.delete(id) }, { filename: file });
  return module.exports;
}
const plain = value => JSON.parse(JSON.stringify(value));
const nav = load(path.join(root, 'services/navigationService.ts'));
nav.navigate({ url: '/pages/books/index' }); nav.navigate({ url: '/pages/books/index' });
assert.equal(calls.length, 1, 'rapid taps start only one transition');
calls[0].fail({ errMsg: 'navigateTo:fail page stack limit' });
assert.equal(calls[1].mode, 'redirectTo', 'full stack recovers by replacing the current page');
calls[1].fail({}); assert.equal(toasts.at(-1).title, '页面没能打开，请再试一次');
flush(350); nav.backTo('/pages/books/index'); assert.equal(calls.at(-1).mode, 'reLaunch');
calls.at(-1).success(); flush(350);
pageStack.push({ route: 'pkg-reading/reader/index' }); nav.backTo('/pages/books/index'); assert.equal(calls.at(-1).mode, 'navigateBack');
calls.at(-1).fail(); assert.equal(calls.at(-1).mode, 'reLaunch'); calls.at(-1).success(); flush(350);
nav.navigate({ url: '/pages/books/index' }); flush(3000); nav.navigate({ url: '/pages/books/index' });
assert.equal(calls.at(-1).mode, 'navigateTo', 'missing platform callback never locks navigation forever'); calls.at(-1).success(); flush(350);
const books = load(path.join(root, 'services/bookService.ts'));
assert.equal(books.normalizeBookPage('9999', 5), 4); assert.equal(books.normalizeBookPage('2.9', 5), 1);
assert.equal(books.normalizeBookPage('-2', 5), 0); assert.equal(books.normalizeBookPage('NaN', 5), 0);
assert.equal(books.resolveBookId('does-not-exist'), books.getTodayBook().id);
assert.equal(books.decodeRouteText('bad%escape'), 'bad%escape'); assert.equal(books.decodeRouteText('I%20see%20a%20cat.'), 'I see a cat.');
const practice = load(path.join(root, 'utils/practice.ts'));
const source = ['answer', 'b', 'c']; const positions = new Set();
for (const random of [() => 0, () => .4, () => .99]) positions.add(practice.shuffleChoices(source, random).indexOf('answer'));
assert.equal(positions.size, 3); assert.deepEqual(source, ['answer', 'b', 'c']);
const world = load(path.join(root, 'services/worldProgressService.ts')); const valid = ['china', 'japan'];
storage.set('cartown_explored_countries', { corrupt: true }); assert.deepEqual(plain(world.getCountryProgress(valid, '2026-10-03').explored), []);
world.recordCountryListening('china', valid, '2026-10-03'); world.recordCountryListening('china', valid, '2026-10-03'); world.recordCountryListening('bad', valid, '2026-10-03');
assert.deepEqual(plain(world.getCountryProgress(valid, '2026-10-03').today), ['china']);
assert.deepEqual(plain(world.getCountryProgress(valid, '2026-10-04').today), []);
assert.deepEqual(plain(world.getCountryProgress(valid, '2026-10-04').explored), ['china']);
storage.set('cartown_english_progress', { stars: -10, logoIndex: 'broken', colorQuestionsDone: -3, learnedVehicleIds: 'broken' });
const cartown = load(path.join(root, 'services/cartownProgressService.ts'));
assert.equal(cartown.getCartownProgress().stars, 0); assert.equal(cartown.getCartownProgress().logoIndex, 0); assert.deepEqual(plain(cartown.getCartownProgress().learnedVehicleIds), []);
function page(name, expose) { return load(path.join(root, name, 'index.vue'), expose).test; }
for (const [name, target, choose, argument, counter] of [
  ['car-colors', 'target', 'choose', 'id', 'colorQuestionsDone'], ['car-traffic', 'prompt', 'choose', 'action', 'trafficTurnsDone'], ['car-logos', 'targetLogo', 'chooseLogo', 'id', 'logoQuizDone']
]) {
  const p = page('pkg-learning/' + name, [target, choose, 'answered', 'nextRound']);
  const stars = cartown.getCartownProgress().stars, count = cartown.getCartownProgress()[counter];
  p[choose]('wrong'); assert.equal(p.answered.value, false); p.nextRound(); assert.equal(cartown.getCartownProgress().stars, stars);
  const answer = p[target].value[argument]; p[choose](answer); p[choose](answer);
  assert.equal(cartown.getCartownProgress().stars, stars + 1); assert.equal(cartown.getCartownProgress()[counter], count + 1);
  assert.equal(p.answered.value, true); p.nextRound(); assert.equal(p.answered.value, false);
}
const logos = page('pkg-learning/car-logos', ['targetLogo', 'chooseLogo', 'answered', 'nextRound']);
const seenLogos = new Set();
for (let n = 0; n < 50; n++) { seenLogos.add(logos.targetLogo.value.id); logos.chooseLogo(logos.targetLogo.value.id); logos.nextRound(); }
assert.equal(seenLogos.size, 50, 'all fifty logos must be eligible quiz targets');
const count = page('pkg-learning/car-count', ['challenge', 'slots', 'tapped', 'tapCar', 'nextChallenge']);
assert.equal(count.slots.value.length, count.challenge.value.count);
const stars = cartown.getCartownProgress().stars, before = count.challenge.value.id;
count.nextChallenge(); assert.equal(count.challenge.value.id, before);
count.tapCar(-1); count.tapCar(count.slots.value.length); assert.equal(count.tapped.value.length, 0);
for (const slot of count.slots.value) { count.tapCar(slot); count.tapCar(slot); }
assert.equal(cartown.getCartownProgress().stars, stars + 1); count.nextChallenge(); assert.equal(count.tapped.value.length, 0);
const game = page('pkg-reading/game', ['words', 'questionIndex', 'currentWord', 'chooseWord', 'nextQuestion', 'showResult', 'score']);
for (let i = 0; i < game.words.value.length; i++) { game.chooseWord(game.currentWord.value.word); game.chooseWord(game.currentWord.value.word); game.nextQuestion(); }
assert.equal(game.showResult.value, true); assert.equal(game.score.value, game.words.value.length);
const progress = load(path.join(root, 'services/progressService.ts')); const records = progress.getLearningState().gameRecords.length;
game.nextQuestion(); assert.equal(progress.getLearningState().gameRecords.length, records);
for (const book of books.getBooks()) for (const word of books.getBookWords(book.id)) assert.ok(fs.existsSync(path.join(root, word.image.replace(/^\//, ''))), 'Offline word picture: ' + word.word);
assert.equal(fs.readdirSync(path.join(root, 'pkg-learning/static/vehicle-icons')).filter(f => f.endsWith('.jpg')).length, 30);
for (const folder of ['cat', 'apple', 'bear', 'mom', 'jump']) {
  assert.ok(fs.existsSync(path.join(root, 'static/first-books', folder, 'cover.jpg')));
  for (let n = 1; n <= 5; n++) assert.ok(fs.existsSync(path.join(root, 'pkg-reading/static/first-books', folder, `page0${n}.jpg`)));
}
// Verify the actual encoded format, not just the extension: iPhone packages must not contain renamed WebP files.
const bundledImageDirs = ['static/first-books', 'pkg-reading/static/first-books', 'pkg-reading/static/word-pictures', 'pkg-learning/static/vehicle-icons'];
let jpegCount = 0;
function verifyBundledImages(folder) {
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    if (entry.isDirectory()) verifyBundledImages(file);
    else {
      assert.ok(!entry.name.endsWith('.webp'), 'Unsupported bundled WebP: ' + file);
      if (entry.name.endsWith('.jpg')) {
        const data = fs.readFileSync(file);
        assert.equal(data.readUInt16BE(0), 0xffd8, 'Actual JPEG header: ' + file);
        assert.equal(data.readUInt16BE(data.length - 2), 0xffd9, 'Complete JPEG: ' + file);
        jpegCount++;
      }
    }
  }
}
bundledImageDirs.forEach(folder => verifyBundledImages(path.join(root, folder)));
assert.equal(jpegCount, 79);
// Homepage routes and resume precedence must work with the real catalog and saved session.
const catalog = load(path.join(root, 'mock/homeDiscovery.ts'));
const registered = JSON.parse(fs.readFileSync(path.join(root, 'pages.json'), 'utf8'));
const routes = new Set([...registered.pages.map(p => '/' + p.path), ...registered.subPackages.flatMap(pkg => pkg.pages.map(p => '/' + pkg.root + '/' + p.path))]);
for (const item of [...catalog.homeWorlds, ...catalog.homePractices]) assert.ok(routes.has(item.url), 'Registered home destination: ' + item.url);
const home = page('pages/index', ['session', 'primaryAction', 'primaryLabel', 'primaryTitle', 'daily', 'finishedSteps', 'openChants', 'openFamilyPlay', 'openRecordings']);
home.session.value = null;
home.daily.value = { heardIds: [], solvedIds: [], adventureIds: [] };
home.primaryAction(); assert.match(calls.at(-1).url, /playground-game\/index\?topic=/);
calls.at(-1).success(); flush(350);
home.session.value = { topicId: 'colors', mode: 'learn', wordIndex: 2, questionIds: ['red'], questionIndex: 0, reviewOnly: false };
home.primaryAction(); assert.equal(calls.at(-1).url, '/pkg-learning/playground-game/index?topic=colors&resume=1');
assert.equal(home.primaryLabel.value, '继续上次的小旅程');
calls.at(-1).success(); flush(350);
home.session.value = { ...home.session.value, topicId: 'unknown-topic' };
home.primaryAction(); assert.ok(!calls.at(-1).url.includes('unknown-topic'), 'Invalid resume falls back to today');
calls.at(-1).success(); flush(350);
home.session.value = null;
home.daily.value = { heardIds: ['a','b','c'], solvedIds: ['a','b'], adventureIds: ['delivery'] };
assert.equal(home.finishedSteps.value, 3); assert.equal(home.primaryLabel.value, '再玩一个车车故事');
home.primaryAction(); assert.equal(calls.at(-1).url, '/pkg-adventure/index/index');
calls.at(-1).success(); flush(350);
for (const [fn, destination] of [['openChants','/pkg-learning/playground/index?tab=chants'],['openFamilyPlay','/pkg-learning/playground/index?tab=parent'],['openRecordings','/pkg-reading/recordings/index']]) {
  home[fn](); assert.equal(calls.at(-1).url, destination); calls.at(-1).success(); flush(350);
}
const playground = page('pkg-learning/playground', ['activeTab']);
const applyEntryTab = hooks.onLoad.at(-1);
for (const requested of ['chants', 'parent', 'topics', 'invalid', undefined, ['chants']]) {
  applyEntryTab({ tab: requested });
  assert.equal(playground.activeTab.value, ['chants','parent','topics'].includes(requested) ? requested : 'topics');
}
console.log('Page checks passed: navigation deduplication/recovery, malformed links, page bounds, answer positions, all fifty logo targets, one reward per round, exact car counts, daily country listening/rollover, book game deduplication and all 79 offline images.');
console.log('Homepage checks passed: every destination registered, saved-session priority and fallback, completed-day action, direct chants/family/recording entry and invalid-tab fallback.');
