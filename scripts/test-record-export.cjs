const assert = require("node:assert/strict"), fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript");
const root = path.resolve(__dirname, "../src/pkg-reading/services");
function fixture(platform) {
 const files = new Map([["/saved/voice.mp3", Buffer.from("ID3-original-audio")], ["/saved/voice.wav", Buffer.from("RIFF-original-audio")]]), shares = [], modules = new Map(), links = [];
 let writeFails = false, shareError, requireGesture = false, inGesture = false;
 const manager = { readFile(o) { const data=files.get(o.filePath); data ? o.success({data:o.encoding === "base64" ? data.toString("base64") : data.toString()}) : o.fail({errMsg:"missing"}); }, writeFile(o) { if (writeFails) return o.fail({errMsg:"disk full"}); files.set(o.filePath, Buffer.from(o.data,o.encoding));o.success(); }, unlink(o) { files.delete(o.filePath); } };
 const wx = { env:{USER_DATA_PATH:"/exports"},getFileSystemManager:()=>manager,shareFileMessage(o) { shares.push(o); if (requireGesture && !inGesture) return o.fail({errMsg:"shareFileMessage:fail can only be invoked by user TAP gesture."}); shareError ? o.fail(shareError) : o.success(); } };
 function load(name) {
  const file=path.join(root,name+".ts");if(modules.has(file))return modules.get(file).exports;
  const module={exports:{}};modules.set(file,module);
  const source=fs.readFileSync(file,"utf8").replace(/(?:\/\/|<!--) #ifdef (H5|MP-WEIXIN)[\s\S]*?(?:\/\/|<!--) #endif/g,block => block.includes("#ifdef "+platform) ? block.replace(/\/\/ #(?:ifdef [^\n]+|endif)/g,"") : "");
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInNewContext(code,{module,exports:module.exports,require:id=>load(path.basename(id)),uni:{getFileSystemManager:()=>manager},wx,Date,Error,Uint8Array,Blob,URL,atob,document:{body:{appendChild(){}},createElement:()=>{const a={click(){links.push({name:this.download,url:this.href});},remove(){}};return a;}}});return module.exports;
 }
 return {load,files,shares,links,setWriteFailure:v=>writeFails=v,setShareError:v=>shareError=v,setGestureRequired:v=>requireGesture=v,withGesture:fn=>{inGesture=true;try{return fn();}finally{inGesture=false;}}};
}
const record=(audioUrl="/saved/voice.mp3")=>({userId:"local_child",bookId:"mom",sentence:"Hello, Mom!",createdAt:"2026-10-03 10:00:00",durationSeconds:2,audioUrl});
(async()=>{
 const env=fixture("MP-WEIXIN"),archive=env.load("recordArchiveService"),output=env.load("recordExportService");
 const file=await archive.prepareRepeatRecordAudio(record());assert.ok(file.fileName.endsWith(".mp3"));assert.equal(env.files.get(file.filePath).toString(),"ID3-original-audio");assert.equal(env.shares.length,0);
 await output.savePreparedRecord(file);assert.equal(env.shares.length,1);assert.equal(env.shares[0].filePath,file.filePath);
 assert.match(output.recordExportError({errMsg:"shareFileMessage:fail can only be invoked by user TAP gesture."}),/再次点击/);
 assert.equal(output.recordExportDetails({errMsg:"shareFileMessage:fail can only be invoked by user TAP gesture."}),"shareFileMessage:fail can only be invoked by user TAP gesture.");
 assert.match(output.recordExportError({errMsg:"writeFile:fail no space"}),/空间不足/);
 assert.match(output.recordExportError({errMsg:"shareFileMessage:fail no such file"}),/重新点/);
 assert.match(output.recordExportError({errMsg:"shareFileMessage:fail not supported"}),/不支持/);
 assert.match(output.recordExportError({errMsg:"shareFileMessage:fail 开发者工具暂时不支持此 API 调试，请使用真机进行开发"}),/手机微信扫码/);
 env.setShareError({errMsg:"shareFileMessage:fail cancel"});await assert.rejects(output.savePreparedRecord(file));assert.match(output.recordExportError({errMsg:"fail cancel"}),/取消/);env.setShareError(undefined);
 await assert.rejects(archive.prepareRepeatRecordArchive([]),/暂无/);await assert.rejects(archive.prepareRepeatRecordAudio(record("/missing.mp3")),/失效/);
 // Exercise the installed uni-app event dispatcher, which defers ordinary tap handlers.
 const runtime=fs.readFileSync(require.resolve("@dcloudio/uni-mp-vue/dist/vue.runtime.esm.js"),"utf8");
 const dispatcher=runtime.slice(runtime.indexOf("function createInvoker("),runtime.indexOf("function patchMPEvent(")).replace(/\/\/[^\n]*/g,"");
 const pending=[];
 const createInvoker=vm.runInNewContext(dispatcher+"\ncreateInvoker",{patchMPEvent(){},patchStopImmediatePropagation:(_event,fn)=>fn,callWithAsyncErrorHandling:(fn,_instance,_code,args)=>fn(...args),setTimeout:fn=>pending.push(fn),isArray:Array.isArray,isPromise:value=>!!value?.then,String});
 env.setGestureRequired(true);
 const handler=createInvoker(()=>output.savePreparedRecord(file),null);
 env.withGesture(()=>handler({type:"tap",target:{dataset:{}}}));assert.equal(pending.length,1);
 await assert.rejects(pending.shift()(),error=>{assert.match(error.errMsg,/user TAP gesture/);return true;});
 const page=fs.readFileSync(path.resolve(root,"../recordings/index.vue"),"utf8");
 const sendButton=page.match(/<button[^>]*class="send-file-button"[^>]*>/)[0];
 const eventsync=sendButton.match(/data-eventsync="([^"]+)"/)?.[1];
 await env.withGesture(()=>handler({type:"tap",target:{dataset:{eventsync}}}));assert.equal(pending.length,0);
 env.setGestureRequired(false);
 const backup=await archive.prepareRepeatRecordArchive([record(),record("/missing.mp3"),{...record("/saved/voice.wav"),sentence:"Hello, Dad!"}]);assert.equal(backup.count,2);assert.equal(backup.skipped,1);
 const secondFile=await archive.prepareRepeatRecordAudio(record());assert.notEqual(secondFile.filePath,file.filePath);
 const json=env.files.get(backup.filePath).toString(),parsed=JSON.parse(json);assert.equal(parsed.records[0].audio.value,Buffer.from("ID3-original-audio").toString("base64"));
 const restored=await archive.restoreArchive(json);assert.equal(restored.records.length,2);assert.notEqual(restored.records[0].audioUrl,restored.records[1].audioUrl);assert.ok(restored.records[1].audioUrl.endsWith(".wav"));assert.equal(env.files.get(restored.records[0].audioUrl).toString(),"ID3-original-audio");
 const fileCount=env.files.size;const duplicate=await archive.restoreArchive(json,restored.records);assert.equal(duplicate.duplicates,2);assert.equal(duplicate.records.length,0);assert.equal(env.files.size,fileCount);
 env.files.delete(restored.records[0].audioUrl);const repair=await archive.restoreArchive(json,restored.records);assert.equal(repair.duplicates,1);assert.equal(repair.records.length,1);assert.equal(env.files.get(repair.records[0].audioUrl).toString(),"ID3-original-audio");
 const repeated=JSON.parse(json);repeated.records=[...repeated.records,...repeated.records];const unique=await archive.restoreArchive(JSON.stringify(repeated));assert.equal(unique.duplicates,2);assert.equal(unique.records.length,2);
 parsed.records.push(null,{audio:{encoding:"base64",value:"%%%"}});const partial=await archive.restoreArchive(JSON.stringify(parsed));assert.equal(partial.skipped,2);assert.equal(partial.records.length,2);
 await assert.rejects(archive.restoreArchive("bad"),/格式/);await assert.rejects(archive.restoreArchive('{}'),/备份/);
 env.setWriteFailure(true);await assert.rejects(archive.prepareRepeatRecordAudio(record()));env.setWriteFailure(false);
 output.releasePreparedRecord(file);assert.ok(!env.files.has(file.filePath));assert.ok(env.files.has("/saved/voice.mp3"));
 const h5=fixture("H5"),browserArchive=h5.load("recordArchiveService"),browserOutput=h5.load("recordExportService");
 const browserRestore=await browserArchive.restoreArchive(json);assert.equal(browserRestore.records.length,2);
 const downloaded=await browserArchive.prepareRepeatRecordAudio(browserRestore.records[0]);assert.equal(Buffer.from(await (await fetch(downloaded.filePath)).arrayBuffer()).toString(),"ID3-original-audio");
 await browserOutput.savePreparedRecord(downloaded);assert.equal(h5.links[0].name,downloaded.fileName);browserOutput.releasePreparedRecord(downloaded);
 console.log("Recording export checks passed: exact audio bytes, MP3/WAV formats, two-step sharing, synchronous user gesture through the installed uni-app dispatcher, cancellation/failure, missing-file counts, JSON round trip, unique restore paths, safe cleanup and H5 download.");
})().catch(e=>{console.error(e);process.exitCode=1;});
