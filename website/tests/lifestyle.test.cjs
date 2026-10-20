const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const life=require('../lifestyle.js');
const daily=require('../daily.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
function app(saved){
 const node={focus(){},classList:{add(){},remove(){}},style:{setProperty(){}},setAttribute(){},close(){},isConnected:false};
 const c=vm.createContext({structuredClone,console,setTimeout:()=>1,clearTimeout(){},sessionStorage:{getItem:()=>null,removeItem(){},setItem(){}},window:{KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraLifestyle:life,KoraDaily:daily,KoraComeback:require('../comeback.js'),scrollTo(){}},localStorage:{getItem:()=>saved?JSON.stringify(saved):null,setItem(){}},document:{querySelector:()=>node,activeElement:node}});
 vm.runInContext(source,c);vm.runInContext("render=()=>{};captureForm=()=>{};openModal=(html,view)=>{globalThis.lastModal=html;modalView=view;};",c);return c;
}
const run=(c,s)=>vm.runInContext(s,c);
const answers=(type,activity='walk')=>[...life.questions.slice(0,8).map(q=>q.options.find(o=>o.type===type)?.id||q.options.find(o=>o.id==='steady')?.id||q.options[0].id),activity,'20','evening','gentle'];
test('12 questions classify all four styles and acknowledge stable or mixed habits',()=>{
 assert.equal(life.questions.length,12);
 for(const id of Object.keys(life.types))assert.equal(life.result(answers(id)).type,id);
 const stable=[...life.questions.slice(0,8).map(q=>q.options.find(o=>o.id==='steady')?.id||q.options[0].id),'walk','30','morning','off'];
 assert.equal(life.result(stable).balanced,true);
 const mixed=life.result(['lazy','spark','busy','feel','busy','feel','spark','steady','walk','10','midday','regular']);
 assert.equal(mixed.mixed,true);assert.ok(mixed.secondary.length);assert.ok(mixed.evidence.length);
 assert.equal(life.result([]),null);assert.equal(life.result([...answers('lazy').slice(0,11),'bad']),null);
 assert.equal(life.valid({...life.result(answers('lazy')),type:'feel'}),false);
 const legacy={version:1,type:'busy',answers:['busy','feel','stretch','10','lazy','flexible']};
 assert.equal(life.normalize(legacy).type,'busy');assert.equal(life.normalize(legacy).minutes,'10');
});
test('personality never caps session length; timing and reminder preferences stay explicit',()=>{
 const profile={name:'Demo',persona:'fiery',height:'165',weight:'60',activities:['walk'],minutes:'30'};
 for(const id of Object.keys(life.types)){
  const p=life.apply(profile,life.result(answers(id,'stretch')));
  assert.equal(p.persona,'fiery');assert.equal(p.height,'165');assert.equal(p.minutes,'20');assert.deepEqual(p.activities,['stretch']);
  assert.equal(p.preferredTime,'evening');assert.equal(p.reminderPreference,'gentle');
  assert.equal(life.recommendation(p).plan.minutes,20);assert.equal(life.recommendation(p).plan.action,'stretch');
  assert.deepEqual(life.recommendation(p),life.recommendation({...p,height:'190',weight:'100'}));
  assert.equal(life.recommendation({...p,minutes:'30'}).plan.minutes,30);
 }
});
test('quiz acceptance, retake and reload preserve records, voice and plan',()=>{
 const c=app();run(c,"state.onboarded=true;state.profile={name:'Demo',persona:'gentle',height:'',weight:'',activities:['walk'],minutes:'20',goal:'routine'};state.logs.push({id:'meal',cal:80});");
 const before=run(c,'JSON.stringify([state.days,state.history])');
 for(const id of ['lazy','busy','feel']){
  run(c,`quizSession={phase:'result',index:11,answers:${JSON.stringify(answers(id))}};handleLifeClick({dataset:{life:'accept'}})`);
  assert.equal(run(c,'state.profile.lifestyle.type'),id);assert.equal(run(c,'state.profile.persona'),'gentle');
  assert.equal(run(c,'JSON.stringify([state.days,state.history])'),before);
 }
 const loaded=app(JSON.parse(run(c,'JSON.stringify(state)')));
 assert.equal(run(loaded,'state.onboarded'),true);assert.equal(run(loaded,'state.profile.lifestyle.type'),'feel');assert.equal(run(loaded,'state.logs[0].id'),'meal');
});
test('suggested plan review is inert; confirm, completion and undo use existing dated records',()=>{
 const c=app();run(c,`state.onboarded=true;state.profile=lifestyle.apply({...state.profile,persona:'calm'},lifestyle.result(${JSON.stringify(answers('spark'))}));state.logs.push({id:'meal'});`);
 const before=run(c,'JSON.stringify(state.plan)');
 run(c,"handleLifeClick({dataset:{life:'plan'}})");assert.equal(run(c,'JSON.stringify(state.plan)'),before);
 run(c,"handleLifeClick({dataset:{life:'confirm-plan'}})");assert.equal(run(c,'state.plan.minutes'),20);assert.equal(run(c,'state.plan.reminder'),false);assert.equal(run(c,'state.logs.length'),1);
 run(c,'calendar.undo(state)');assert.equal(run(c,'JSON.stringify(state.plan)'),before);assert.equal(run(c,'Boolean(todayCare())'),false);
 run(c,"handleLifeClick({dataset:{life:'plan'}});handleLifeClick({dataset:{life:'confirm-plan'}});comeback.complete(state)");assert.equal(run(c,'state.plan.done'),true);assert.equal(run(c,"lifeHome().includes('data-life=\"plan\"')"),false);
});
test('stale recommendation cannot overwrite changed plans; rest blocks suggested training',()=>{
 const c=app();run(c,`state.onboarded=true;state.profile=lifestyle.apply(state.profile,lifestyle.result(${JSON.stringify(answers('busy'))}));handleLifeClick({dataset:{life:'plan'}});calendar.adjust(state,{type:'rest',minutes:0,reminder:false,done:false},'test');handleLifeClick({dataset:{life:'confirm-plan'}});`);
 assert.equal(run(c,'state.plan.type'),'rest');assert.equal(run(c,"lifeHome().includes('data-life=\"plan\"')"),false);
});
test('every quiz question, result and integration is bilingual; optional metrics remain validated',()=>{
 const c=app();
 run(c,"state.profile={name:'Demo',height:'',weight:'',persona:'gentle',activities:['walk'],minutes:'20'}");
 assert.equal(run(c,'validProfile(state.profile)'),true);assert.equal(run(c,'profileError(state.profile)'),'');
 assert.equal(run(c,"validProfile({...state.profile,height:'NaN'})"),false);
 for(const lang of ['zh','en'])for(const id of Object.keys(life.types)){
  run(c,`state.language='${lang}';state.profile=lifestyle.apply(state.profile,lifestyle.result(${JSON.stringify(answers(id))}));`);
  for(const phase of ['intro','questions','result'])for(let index=0;index<12;index++){
   run(c,`quizSession={phase:'${phase}',index:${index},answers:${JSON.stringify(answers(id))}}`);
   const html=run(c,'quizView()+lifeHome()+lifeProfile()');assert.ok(!html.includes('undefined'));if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html));
  }
 }
});
