const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const life=require('../lifestyle.js');
const daily=require('../daily.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
function app(saved){
 const node={focus(){},classList:{add(){},remove(){}},style:{setProperty(){}},setAttribute(){},close(){},isConnected:false};
 const c=vm.createContext({structuredClone,console,setTimeout:()=>1,clearTimeout(){},sessionStorage:{getItem:()=>null,removeItem(){},setItem(){}},window:{KoraLifestyle:life,KoraDaily:daily,KoraComeback:require('../comeback.js'),scrollTo(){}},localStorage:{getItem:()=>saved?JSON.stringify(saved):null,setItem(){}},document:{querySelector:()=>node,activeElement:node}});
 vm.runInContext(source,c);vm.runInContext("render=()=>{};captureForm=()=>{};openModal=(html,view)=>{globalThis.lastModal=html;modalView=view;};",c);return c;
}
const run=(c,s)=>vm.runInContext(s,c);
const answers=(type,activity='walk')=>[type,type,activity,'20',type,'evening'];
test('all four types, deterministic ties, invalid and incomplete answers',()=>{
 for(const id of Object.keys(life.types))assert.equal(life.result(answers(id)).type,id);
 assert.equal(life.result(['busy','feel','stretch','10','lazy','flexible']).type,'busy');
 assert.equal(life.result([]),null);assert.equal(life.result(['lazy','bad','walk','20','lazy','evening']),null);
 assert.equal(life.valid({...life.result(answers('lazy')),type:'feel'}),false);
});
test('preferences change recommendations, body metrics never affect results',()=>{
 const profile={name:'Demo',persona:'fiery',height:'165',weight:'60',activities:['walk'],minutes:'30'};
 for(const id of Object.keys(life.types)){
  const p=life.apply(profile,life.result(answers(id,'stretch')));
  assert.equal(p.persona,'fiery');assert.equal(p.height,'165');assert.equal(p.minutes,'20');assert.deepEqual(p.activities,['stretch']);
  assert.deepEqual(life.recommendation(p),life.recommendation({...p,height:'190',weight:'100'}));
 }
 const p=life.apply(profile,life.result(answers('lazy')));
 assert.equal(life.recommendation(p).plan.minutes,2);
 assert.equal(life.recommendation({...p,activities:['stretch']}).plan.minutes,1);
 assert.equal(life.recommendation(life.apply(profile,life.result(answers('spark')))).plan.minutes,5);
 assert.equal(life.recommendation(life.apply(profile,life.result(answers('busy')))).plan.minutes,10);
 assert.equal(life.recommendation(life.apply(profile,life.result(answers('feel')))).checkIn,true);
});
test('quiz acceptance, retake and reload preserve records, voice and plan',()=>{
 const c=app();run(c,"state.onboarded=true;state.profile={name:'Demo',persona:'gentle',height:'',weight:'',activities:['walk'],minutes:'20',goal:'routine'};state.logs.push({id:'meal',cal:80});");
 const before=run(c,'JSON.stringify([state.days,state.history])');
 for(const id of ['lazy','busy','feel']){
  run(c,`quizSession={phase:'result',index:5,answers:${JSON.stringify(answers(id))}};handleLifeClick({dataset:{life:'accept'}})`);
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
 run(c,"handleLifeClick({dataset:{life:'confirm-plan'}})");assert.equal(run(c,'state.plan.minutes'),5);assert.equal(run(c,'state.plan.reminder'),false);assert.equal(run(c,'state.logs.length'),1);
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
  for(const phase of ['intro','questions','result'])for(let index=0;index<6;index++){
   run(c,`quizSession={phase:'${phase}',index:${index},answers:${JSON.stringify(answers(id))}}`);
   const html=run(c,'quizView()+lifeHome()+lifeProfile()');assert.ok(!html.includes('undefined'));if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html));
  }
 }
});
