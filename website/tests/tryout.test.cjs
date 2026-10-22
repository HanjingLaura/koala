const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const daily=require('../daily.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
const run=(c,s)=>vm.runInContext(s,c);
function memory(initial={}){const data=new Map(Object.entries(initial));return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
function app(search,local,session){const c=vm.createContext({URLSearchParams,structuredClone,console,localStorage:local,sessionStorage:session,window:{KoraContent:require('../content-data.js'),location:{search},KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js'),KoraDaily:daily},document:{querySelector:()=>({})}});vm.runInContext(source,c);return c;}
function archive(){const s=daily.load(null);s.onboarded=true;s.profile={name:'Existing',height:'165',weight:'60',persona:'gentle',activities:['walk'],minutes:'20'};return JSON.stringify(s);}
test('normal entry keeps the existing profile; tryout starts at quiz without reading or overwriting it',()=>{
 const saved=archive(),local=memory({'kora.preview.v1':saved}),session=memory();
 const regular=app('',local,session);assert.equal(run(regular,'state.onboarded'),true);assert.equal(run(regular,'state.profile.name'),'Existing');
 const demo=app('?demo=welcome',local,session);assert.equal(run(demo,'state.onboarded'),false);assert.equal(run(demo,'state.profile.name'),'');assert.ok(run(demo,'onboarding()').includes('测测我的考拉人格'));
 run(demo,"state.profile.name='Trial';save()");assert.equal(local.getItem('kora.preview.v1'),saved);assert.equal(local.data.size,1);assert.ok(session.getItem('kora.tryout.welcome'));
});
test('refresh resumes this tryout; another tryout and the regular quiz draft remain independent',()=>{
 const local=memory({'kora.preview.v1':archive()}),oldDraft='{"version":4,"phase":"intro","index":0,"answers":[]}',session=memory({'kora.quiz.draft':oldDraft});
 const demo=app('?demo=welcome',local,session);assert.equal(run(demo,'quizSession'),null);
 run(demo,"state.profile.name='Trial';save();quizSession={version:4,phase:'questions',index:1,answers:['lazy']};saveQuizDraft()");
 const reload=app('?demo=welcome',local,session);assert.equal(run(reload,'state.profile.name'),'Trial');assert.equal(run(reload,'quizSession.index'),1);
 const another=app('?demo=another',local,session);assert.equal(run(another,'state.profile.name'),'');assert.equal(run(another,'quizSession'),null);
 assert.equal(session.getItem('kora.quiz.draft'),oldDraft);
});
test('closing the tryout session starts clean, while regular data and language stay intact',()=>{
 const saved=archive(),local=memory({'kora.preview.v1':saved});
 const a=app('?demo=welcome',local,memory());run(a,"state.language='en';state.profile.name='Trial';save()");
 const b=app('?demo=welcome',local,memory());assert.equal(run(b,'state.profile.name'),'');assert.equal(run(b,'state.language'),'zh');assert.equal(local.getItem('kora.preview.v1'),saved);
});
