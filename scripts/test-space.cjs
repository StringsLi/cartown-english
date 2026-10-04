const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'../src'), modules=new Map(),storage=new Map();let stars=0;
function load(file) {
 if(modules.has(file))return modules.get(file).exports;
 const module={exports:{}};modules.set(file,module);
 const source=fs.readFileSync(file,'utf8'),code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{module,exports:module.exports,require:id=>id==='@/utils/storage'?{getStorage:key=>storage.get(key),setStorage:(key,value)=>storage.set(key,structuredClone(value))}:id==='@/services/cartownProgressService'?{addCartownStar(){stars++}}:load(path.resolve(id.startsWith('@/')?root:path.dirname(file),id.replace(/^@\//,'')+'.ts')),Set,Math,Array});return module.exports;
}
const catalog=load(path.join(root,'mock/solarSystem.ts')), learning=load(path.join(root,'services/spaceLearningService.ts'));
assert.equal(catalog.spaceBodies.length,10);assert.equal(catalog.planets.length,8);
assert.deepEqual(Array.from(catalog.planets,b=>b.id),['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']);
assert.equal(catalog.getSpaceBody('sun').kind,'star');assert.equal(catalog.getSpaceBody('moon').kind,'moon');
for(const body of catalog.spaceBodies) {
 const image=fs.readFileSync(path.join(root,body.image));assert.equal(image.readUInt16BE(0),0xffd8);assert.equal(image.readUInt16BE(image.length-2),0xffd9);assert.ok(image.length<200*1024);
 for(const field of ['audio','sentenceAudio','promptAudio']) {const audio=fs.readFileSync(path.join(root,body[field]));assert.ok(audio.length>1024);assert.ok(audio.length<200*1024);}
}
for(const name of ['try-again','great-job']) assert.ok(fs.statSync(path.join(root,'pkg-space/static/audio',name+'.mp3')).size>1024);
learning.markSpaceHeard('earth');learning.markSpaceHeard('earth');learning.markSpaceHeard('not-a-body');assert.deepEqual(Array.from(learning.getSpaceProgress().heardIds),['earth']);
storage.set('cartown_space_learning_v1',{heardIds:['sun','sun',null,'bad'],completedSeriesIds:['bad','home','home']});assert.deepEqual(JSON.parse(JSON.stringify(learning.getSpaceProgress())),{heardIds:['sun'],completedSeriesIds:['home']});storage.clear();
assert.equal(learning.completeSpaceSeries('bad',['sun']),false);assert.equal(learning.completeSpaceSeries('home',['sun','earth']),false);assert.equal(stars,0);
assert.equal(learning.completeSpaceSeries('home',['sun','earth','moon']),true);assert.equal(stars,1);assert.equal(learning.completeSpaceSeries('home',['sun','earth','moon']),false);assert.equal(stars,1);
for(const series of catalog.spaceSeries) for(const random of [()=>0,()=>.5,()=>.999999]) {
 const round=learning.createSpaceRound(series.id,random);assert.equal(round.length,series.bodyIds.length);
 assert.equal(new Set(round.map(q=>q.target.id)).size,series.bodyIds.length);
 for(const q of round) {assert.ok(q.choices.some(b=>b.id===q.target.id));assert.equal(new Set(q.choices.map(b=>b.id)).size,q.choices.length);assert.ok(q.choices.every(b=>series.bodyIds.includes(b.id)));}
}
assert.equal(learning.createSpaceRound('malformed').length,3);
console.log('Space checks passed: ten bodies/eight ordered planets, all offline JPEG and audio assets, sanitized listening progress, complete-series-only one-time rewards, and unique randomized quiz choices.');
