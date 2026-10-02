const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const sourceRoot = path.resolve(__dirname, "../src");
const modules = new Map();
const storage = new Map([["cartown_english_progress", { stars: 7, learnedVehicleIds: ["bus"], playgroundCompletedTopicIds: ["colors"] }]]);
const fakeUni = {
  getStorageSync: key => storage.get(key),
  setStorageSync: (key, value) => storage.set(key, structuredClone(value)),
  removeStorageSync: key => storage.delete(key)
};
function load(file) {
  if (modules.has(file)) return modules.get(file).exports;
  const module = { exports: {} };
  modules.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const localRequire = id => load(path.resolve(id.startsWith("@/") ? sourceRoot : path.dirname(file), id.replace(/^@\//, "") + ".ts"));
  vm.runInNewContext(code, { module, exports: module.exports, require: localRequire, uni: fakeUni, console, setTimeout, clearTimeout }, { filename: file });
  return module.exports;
}
const adventures = load(path.join(sourceRoot, "mock/adventures.ts"));
const progress = load(path.join(sourceRoot, "services/cartownProgressService.ts"));
const plain = value => JSON.parse(JSON.stringify(value));
const legacy = progress.getCartownProgress();
assert.equal(legacy.stars, 7);
assert.deepEqual(plain(legacy.learnedVehicleIds), ["bus"]);
assert.deepEqual(plain(legacy.playgroundCompletedTopicIds), ["colors"]);
assert.deepEqual(plain(legacy.completedDeliveryMissionIds), []);
assert.deepEqual(plain(legacy.completedRoleplaySceneIds), []);
assert.equal(adventures.deliveryMissions.length, 3);
assert.equal(adventures.roleplayScenes.length, 3);
assert.equal(new Set(adventures.deliveryMissions.map(m => m.id)).size, 3);
assert.equal(new Set(adventures.roleplayScenes.map(s => s.id)).size, 3);
for (const mission of adventures.deliveryMissions) {
  const correct = Array(mission.quantity).fill(mission.fruit);
  assert.equal(adventures.checkDeliveryCargo(mission, correct), "correct");
  assert.equal(adventures.checkDeliveryCargo(mission, []), "quantity");
  assert.equal(adventures.checkDeliveryCargo(mission, correct.slice(1)), "quantity");
  assert.equal(adventures.checkDeliveryCargo(mission, [...correct, mission.fruit]), "quantity");
  const otherFruit = adventures.deliveryFruits.find(f => f.id !== mission.fruit).id;
  assert.equal(adventures.checkDeliveryCargo(mission, [otherFruit, ...correct.slice(1)]), "fruit");
  for (const phrase of [mission.carPhrase, mission.orderPhrase, mission.destinationPhrase]) assert.ok(adventures.adventurePhrases[phrase]);
  assert.equal(progress.completeDeliveryMission(mission.id).earned, true);
  assert.equal(progress.completeDeliveryMission(mission.id).earned, false);
}
for (const scene of adventures.roleplayScenes) {
  assert.equal(scene.lines.length, 6);
  scene.lines.forEach((line, index) => {
    assert.equal(line.role, index % 2 ? "second" : "first");
    assert.ok(adventures.adventurePhrases[line.phrase]);
    assert.ok(line.action && line.translation);
  });
  assert.equal(progress.completeRoleplayScene(scene.id).earned, true);
  assert.equal(progress.completeRoleplayScene(scene.id).earned, false);
}
assert.equal(progress.completeDeliveryMission("unknown").earned, false);
assert.equal(progress.completeRoleplayScene("unknown").earned, false);
assert.equal(progress.getCartownProgress().stars, 13);
progress.flushCartownProgress();
assert.equal(storage.get("cartown_english_progress").stars, 13);
modules.delete(path.join(sourceRoot, "services/cartownProgressService.ts"));
const reloaded = load(path.join(sourceRoot, "services/cartownProgressService.ts"));
assert.equal(reloaded.getCartownProgress().stars, 13);
assert.equal(reloaded.getCartownProgress().completedDeliveryMissionIds.length, 3);
assert.equal(reloaded.completeRoleplayScene("taxi-zoo").earned, false);
console.log("Adventure checks passed: all cargo branches, legacy progress migration, six first-time rewards, replay deduplication, and persisted reload.");
