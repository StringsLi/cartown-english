const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src');
const plain=value=>JSON.parse(JSON.stringify(value));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function runtime(){
  const modules=new Map(),storage=new Map(),contexts=[],records=[],timers=new Map(),intervals=new Map();let now=new Date(2026,10,7,12).getTime(),next=0,volume=1,failWrites=false,media=async url=>url,session,starts=0,stops=0,failSave=false,deny=false;
  class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
  class RecordSaveError extends Error{constructor(tempFilePath){super('save failed');this.tempFilePath=tempFilePath;this.durationSeconds=61;}}
  class RecordPermissionError extends Error{}
  const record={RecordSaveError,RecordPermissionError,stopRecordPlayback(){},cancelPendingRecord(){},playRecord(){},saveRecordFile:async()=>{if(failSave)throw new RecordSaveError('/temp/speech.mp3');return '/saved/retry.mp3';},startRecord:async limit=>{
    starts++;if(deny)throw new RecordPermissionError('microphone denied');
    session={limit,started:new Promise(resolve=>sessionStart=resolve),finished:new Promise((resolve,reject)=>{sessionFinish=resolve;sessionFail=reject;})};
    session.start=sessionStart;session.finish=sessionFinish;session.fail=sessionFail;return session;
  },stopRecord:()=>{stops++;return session?.finished||Promise.reject(Error('no session'));}};
  let sessionStart,sessionFinish,sessionFail;
  const uni={getStorageSync:key=>storage.get(key),setStorageSync(key,value){if(failWrites)throw Error('full');storage.set(key,structuredClone(value));},removeStorageSync:key=>storage.delete(key),createInnerAudioContext(){
    const events={};const audio={volume:1,duration:60,currentTime:0,stop(){},destroy(){this.destroyed=true;},play(){events.Play?.();},pause(){events.Pause?.();},fire(event){events[event]?.();}};
    for(const event of ['Play','Pause','Ended','TimeUpdate','Error'])audio['on'+event]=fn=>events[event]=fn;contexts.push(audio);return audio;
  }};
  modules.set(path.join(root,'services/audioService.ts'),{exports:{getAudioVolume:()=>volume,stopAudio(){},configureAudioPlayback(){}}});
  modules.set(path.join(root,'services/mediaCacheService.ts'),{exports:{resolveCachedMedia:url=>media(url),invalidateCachedMedia(){}}});
  modules.set(path.join(root,'services/recordService.ts'),{exports:record});
  modules.set(path.join(root,'services/progressService.ts'),{exports:{getRepeatRecords:()=>records,saveRepeatRecord:record=>records.unshift(record),flushLearningState:()=>!failWrites}});
  function load(file){
    if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file));if(modules.has(file))return modules.get(file).exports;
    const module={exports:{}};modules.set(file,module);
    const requireLocal=id=>id.startsWith('@/')||id.startsWith('.')?load(path.resolve(id.startsWith('@/')?root:path.dirname(file),id.replace(/^@\//,'')+(id.endsWith('.json')?'':'.ts'))):require(id);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText,{module,exports:module.exports,require:requireLocal,uni,Date:Clock,console:{warn(){}},setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id),setInterval:fn=>{intervals.set(++next,fn);return next;},clearInterval:id=>intervals.delete(id)},{filename:file});return module.exports;
  }
  return{load:name=>load(path.join(root,name+'.ts')),storage,contexts,records,timers,intervals,record,session:()=>session,starts:()=>starts,stops:()=>stops,volume:value=>volume=value,failWrites:value=>failWrites=value,failSave:value=>failSave=value,deny:value=>deny=value,resolveWith:fn=>media=fn,advance(ms){now+=ms;for(const fn of [...intervals.values()])fn();}};
}
function mp3Seconds(file){
  let offset=0,seconds=0,frames=0;
  if(file.toString('ascii',0,3)==='ID3')offset=10+((file[6]&127)<<21)+((file[7]&127)<<14)+((file[8]&127)<<7)+(file[9]&127);
  while(offset+4<=file.length){
    if(file[offset]!==255||(file[offset+1]&224)!==224){offset++;continue;}
    const version=(file[offset+1]>>3)&3,layer=(file[offset+1]>>1)&3,rateIndex=(file[offset+2]>>2)&3,bitrateIndex=file[offset+2]>>4;
    if(version===1||layer!==1||rateIndex===3||bitrateIndex===0||bitrateIndex===15){offset++;continue;}
    const rate=[44100,48000,32000][rateIndex]/(version===3?1:version===2?2:4);
    const bitrate=(version===3?[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[bitrateIndex]*1000;
    const size=Math.floor((version===3?144:72)*bitrate/rate)+((file[offset+2]>>1)&1);
    if(offset+size>file.length)break;seconds+=(version===3?1152:576)/rate;frames++;offset+=size;
  }
  assert.ok(frames>1000,'MP3 must contain a full spoken passage');return seconds;
}
(async()=>{
  const r=runtime(),catalog=r.load('pkg-speech/catalog'),progress=r.load('pkg-speech/services/speechProgress');
  assert.equal(catalog.speechLessons.length,20);const manifest=JSON.parse(fs.readFileSync(path.join(root,'pkg-speech/audio-manifest.json'))),hashes=new Set();assert.equal(manifest.length,20);
  for(const language of ['zh','en']){const lessons=catalog.speechLessons.filter(l=>l.language===language);assert.equal(lessons.length,10);assert.equal(new Set(lessons.map(l=>l.title)).size,10);for(const lesson of lessons){
    assert.equal(lesson.paragraphs.length,4);assert.equal(lesson.cues.length,3);assert.ok(lesson.question.length>15);
    const length=language==='en'?lesson.paragraphs.join(' ').split(/\s+/).length:lesson.paragraphs.join('').replace(/[^\u4e00-\u9fff]/g,'').length;
    assert.ok(length>=(language==='en'?85:170)&&length<=(language==='en'?130:300),lesson.id+' age-appropriate length '+length);
    const audio=fs.readFileSync(path.join(root,lesson.audio));assert.ok(audio.length<=200*1024);const measured=mp3Seconds(audio),meta=manifest.find(m=>m.id===lesson.id);
    assert.ok(measured>=50&&measured<=66.5,lesson.id+' actual duration '+measured);assert.ok(Math.abs(measured-meta.seconds)<.3,lesson.id+' real duration matches manifest');
    assert.equal(meta.voice,language==='zh'?'zh-CN-XiaoyiNeural':'en-US-AnaNeural');assert.equal(meta.tempo,1,'natural prosody must not be time-stretched');assert.equal(meta.pitch,'+0Hz');assert.match(meta.rate,/^[+-]\d+%$/);
    const hash=crypto.createHash('sha256').update(audio).digest('hex');assert.equal(meta.audioHash,hash);assert.equal(meta.sourceHash,crypto.createHash('sha256').update(lesson.paragraphs.join('\n\n')).digest('hex'));hashes.add(hash);
  }}assert.equal(hashes.size,20,'all speeches have distinct audio');
  assert.equal(progress.dailySpeech('zh').id,'zh-hello');progress.setSpeechLanguage('en');assert.equal(progress.dailySpeech('en').id,'en-hello');
  assert.equal(progress.markSpeech('zh-hello','recorded'),false);progress.markSpeech('zh-hello','heard');progress.markSpeech('zh-hello','heard');progress.markSpeech('zh-hello','recorded');assert.equal(progress.speechDay().heard.length,1);
  r.advance(86400000);assert.equal(progress.dailySpeech('zh').id,'zh-toy');assert.equal(progress.speechDay().heard.length,0);r.advance(9*86400000);assert.equal(progress.dailySpeech('zh').id,'zh-hello');
  r.storage.set(progress.SPEECH_KEY,{started:'bad',language:'bad',days:{'2025-01-01':{heard:['zh-hello']},'2026-11-31':{heard:['zh-hello']}}});assert.equal(progress.getSpeechProgress().language,'zh');assert.equal(Object.keys(progress.getSpeechProgress().days).length,0);
  const p=runtime(),svc=p.load('pkg-speech/services/speechPractice'),store=p.load('pkg-speech/services/speechProgress'),practice=svc.createSpeechPractice();
  await practice.record();assert.equal(p.starts(),0,'cannot record before listening');
  p.volume(0);await practice.listen();p.contexts.at(-1).fire('Ended');assert.equal(practice.state.value.ready,false,'muted demonstration cannot unlock recording');
  p.volume(1);await practice.listen();const old=p.contexts.at(-1);practice.choose('en-toy');old.fire('Ended');assert.equal(practice.state.value.ready,false,'old ended event cannot unlock another speech');
  let finishMedia;p.resolveWith(()=>new Promise(resolve=>finishMedia=resolve));const pending=practice.listen();practice.choose('zh-hello');finishMedia('/late.mp3');await pending;assert.equal(p.contexts.length,2,'canceled loading cannot create audio');p.resolveWith(async url=>url);
  await practice.listen();const sample=p.contexts.at(-1);await practice.listen();assert.equal(practice.state.value.sample,'paused');await practice.listen();assert.equal(practice.state.value.sample,'playing');sample.fire('Ended');assert.equal(practice.state.value.ready,true);
  const starting=practice.record();await tick();assert.equal(p.session().limit,90);practice.choose('en-toy');assert.equal(practice.current().id,'zh-hello','cannot switch the source of an active capture');p.session().start();await starting;assert.equal(practice.state.value.recording,'recording');
  p.advance(61000);assert.equal(practice.state.value.seconds,61);const stop=practice.record();p.session().finish({filePath:'/saved/speech.mp3',durationSeconds:61});await stop;await tick();assert.equal(p.records.length,1);assert.equal(p.records[0].bookId,'speech:zh-hello');assert.equal(p.records[0].durationSeconds,61);assert.equal(store.speechDay().recorded.length,1);
  const failedStart=practice.record();await tick();p.session().start();await failedStart;p.session().fail(new p.record.RecordSaveError('/temp/speech.mp3'));await tick();assert.ok(practice.state.value.unsaved);assert.ok(p.storage.has(svc.SPEECH_DRAFT_KEY));practice.choose('en-toy');assert.equal(practice.current().id,'zh-hello');
  const recovered=svc.createSpeechPractice();assert.ok(recovered.state.value.unsaved,'failed file save can recover on reopening');await recovered.retrySave();assert.equal(p.records.length,2);assert.equal(recovered.state.value.unsaved,null);assert.equal(p.storage.has(svc.SPEECH_DRAFT_KEY),false);
  p.failWrites(true);await recovered.listen();p.contexts.at(-1).fire('Ended');assert.equal(recovered.state.value.ready,true,'pending storage stays visible');p.failWrites(false);p.load('utils/storage').retryStorageWrites();
  const hiddenStart=recovered.record();await tick();recovered.hide();p.session().start();p.session().finish({filePath:'/saved/background.mp3',durationSeconds:2});await hiddenStart;await tick();assert.equal(p.records.at(0).audioUrl,'/saved/background.mp3');assert.equal(p.intervals.size,0,'hidden page leaves no capture timer');
  recovered.show();p.advance(86400000);recovered.refresh();assert.equal(recovered.state.value.ready,false,'a new day requires listening again');p.deny(true);store.markSpeech(recovered.current().id,'heard');await recovered.record();assert.equal(recovered.state.value.permissionDenied,true);
  recovered.dispose();practice.dispose();assert.equal(p.timers.size,0);assert.equal(p.intervals.size,0);
  const failure=runtime(),failureModule=failure.load('pkg-speech/services/speechPractice'),failureProgress=failure.load('pkg-speech/services/speechProgress'),failurePlayer=failureModule.createSpeechPractice();
  failure.resolveWith(()=>new Promise(()=>{}));void failurePlayer.listen();for(const fn of [...failure.timers.values()])fn();assert.equal(failurePlayer.state.value.sample,'error','media load timeout offers retry');
  failure.resolveWith(async url=>url);await failurePlayer.listen();failure.contexts.at(-1).fire('Error');assert.equal(failurePlayer.state.value.ready,false,'failed playback does not count as heard');
  await failurePlayer.listen();failure.failWrites(true);failure.contexts.at(-1).fire('Ended');assert.equal(failurePlayer.state.value.ready,true,'a failed heard-progress write remains in pending memory');failure.failWrites(false);failure.load('utils/storage').retryStorageWrites();assert.equal(failure.storage.get(failureProgress.SPEECH_KEY).days['2026-11-07'].heard[0],'zh-hello');
  const autoStart=failurePlayer.record();await tick();failure.session().start();await autoStart;failure.advance(90000);assert.equal(failurePlayer.state.value.recording,'saving');failure.session().finish({filePath:'/saved/automatic.mp3',durationSeconds:90});await tick();assert.equal(failure.records.length,1,'90-second auto-stop saves exactly once');failurePlayer.dispose();
  const config=JSON.parse(fs.readFileSync(path.join(root,'pages.json')));for(const pack of ['pkg-speech','pkg-voice'])assert.ok(config.subPackages.some(p=>p.root===pack));
  console.log('Speech checks passed: 20 original scripts/unique natural MP3s around one minute, verified neural voices/no time stretching/source hashes, daily cycle/languages/rollover/sanitation, listen-before-record/mute/stale/cancellation, pause/resume, 90s capture/source identity, saved progress, file-save recovery, background cleanup and permission failure.');
})().catch(error=>{console.error(error);process.exitCode=1;});
