const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '../src'), storage = new Map(), files = new Set();
let downloads = 0, saved = 0, slow, cloudAvailable = true;
const uni = { getStorageSync: key => storage.get(key), setStorageSync: (key, value) => storage.set(key, structuredClone(value)) };
const wx = {
  cloud: { async getTempFileURL({fileList}) { if (!cloudAvailable) throw Error('offline'); return {fileList:fileList.map(fileID => ({fileID, status:0, tempFileURL:'https://media.test/cloud'}))}; } },
  downloadFile(options) { downloads++; if (options.url.includes('/slow')) { slow = options; return; } options.success({statusCode:200,tempFilePath:'tmp-audio'}); },
  getFileSystemManager() { return {
    accessSync: file => { if (!files.has(file)) throw Error('missing'); }, unlinkSync: file => files.delete(file),
    saveFile: options => { const savedFilePath = 'saved-' + ++saved; files.add(savedFilePath); options.success({savedFilePath}); },
    getFileInfo: options => options.success({size:1000})
  }; }
};
function loader(withWx = true) {
  const modules = new Map();
  function load(file) {
    if (modules.has(file)) return modules.get(file).exports;
    const module = {exports:{}}; modules.set(file,module);
    const code = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    const context = {module,exports:module.exports,require:id=>id.startsWith('@/')?load(path.join(root,id.slice(2)+'.ts')):require(id),uni,console:{warn(){}},Date};
    if(withWx) context.wx = wx;
    vm.runInNewContext(code,context,{filename:file}); return module.exports;
  }
  return load(path.join(root,'services/mediaCacheService.ts'));
}
(async()=>{
  const cache = loader();
  const first = await cache.resolveCachedMedia('https://media.test/image','image');
  assert.equal(await cache.resolveCachedMedia('https://media.test/image','image'),first); assert.equal(downloads,1);
  cache.invalidateCachedMedia('https://media.test/image'); assert.equal(files.has(first),false);
  const second = await cache.resolveCachedMedia('https://media.test/image','image'); assert.notEqual(second,first); assert.equal(downloads,2);
  const pending = cache.resolveCachedMedia('https://media.test/slow','audio'); await Promise.resolve();
  assert.ok(slow); cache.clearMediaCache(); slow.success({statusCode:200,tempFilePath:'slow-temp'});
  assert.equal(await pending,'https://media.test/slow'); assert.equal(files.size,0);
  assert.deepEqual(storage.get('cartown_media_cache_index').entries,{},'in-flight download must not repopulate a cleared cache');
  cloudAvailable = false;
  const cloudFile = 'cloud://cloud1-d5gbtry8n16a02de8.636c-cloud1-d5gbtry8n16a02de8-1459600856/apps/cartown-english/test.png';
  await assert.rejects(cache.resolveCachedMedia(cloudFile,'image'),/offline/);
  cloudAvailable = true; assert.match(await cache.resolveCachedMedia(cloudFile,'image'),/^saved-/,'failed requests release the in-flight lock');
  const h5 = loader(false); assert.equal(await h5.resolveCachedMedia('https://media.test/audio','audio'),'https://media.test/audio');
  await assert.rejects(h5.resolveCachedMedia(cloudFile,'image'),/CloudBase is unavailable/);
  console.log('Media checks passed: cache reuse, invalid-file retry, clearing during download, CloudBase failure/recovery, direct H5 URLs and unavailable-cloud rejection.');
})().catch(error=>{console.error(error);process.exitCode=1;});
