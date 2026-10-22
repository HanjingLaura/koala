const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const life=require('../lifestyle.js');
const daily=require('../daily.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
function app(saved){
 const node={focus(){},classList:{add(){},remove(){}},style:{setProperty(){}},setAttribute(){},close(){},isConnected:false};
 const c=vm.createContext({structuredClone,console,setTimeout:()=>1,clearTimeout(){},sessionStorage:{getItem:()=>null,removeItem(){},setItem(){}},window:{KoraContent:require('../content-data.js'),KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraLifestyle:life,KoraDaily:daily,KoraComeback:require('../comeback.js'),scrollTo(){}},localStorage:{getItem:()=>saved?JSON.stringify(saved):null,setItem(){}},document:{querySelector:()=>node,activeElement:node}});
 vm.runInContext(source,c);vm.runInContext("render=()=>{};captureForm=()=>{};openModal=(html,view)=>{globalThis.lastModal=html;modalView=view;};",c);return c;
}
const run=(c,s)=>vm.runInContext(s,c);
const answers=(type,activity='walk')=>[...life.questions.slice(0,8).map(q=>q.options.find(o=>o.type===type)?.id||q.options.find(o=>o.id==='steady')?.id||q.options[0].id),activity,'20','evening','gentle'];
test('12 questions classify all six styles and acknowledge stable or mixed habits',()=>{
 assert.equal(life.questions.length,12);
 assert.equal(Object.keys(life.types).length,6);
 for(const id of Object.keys(life.types))assert.equal(life.result(answers(id)).type,id);
 const stable=[...life.questions.slice(0,8).map(q=>q.options.find(o=>o.id==='steady')?.id||q.options[0].id),'walk','30','morning','off'];
 assert.equal(life.result(stable).balanced,true);
 assert.equal(life.result(stable).type,'steady');
 const mixed=life.result(['lazy','spark','busy','feel','busy','feel','spark','steady','walk','10','midday','regular']);
 assert.equal(mixed.mixed,true);assert.ok(mixed.secondary.length);assert.ok(mixed.evidence.length);
 assert.equal(life.result([]),null);assert.equal(life.result([...answers('lazy').slice(0,11),'bad']),null);
 assert.equal(life.valid({...life.result(answers('lazy')),type:'feel'}),false);
 const legacy={version:1,type:'busy',answers:['busy','feel','stretch','10','lazy','flexible']};
 assert.equal(life.normalize(legacy).type,'busy');assert.equal(life.normalize(legacy).minutes,'10');
});
test('legacy results keep their classification and stable display without silently scoring a new quiz',()=>{
 const a=answers('steady');
 const old={version:2,type:'lazy',balanced:true,answers:a};
 const r=life.normalize(old);assert.equal(r.version,2);assert.equal(r.type,'lazy');assert.equal(life.typeOf(r),'steady');
 for(const id of ['lazy','spark','busy','feel']){
  const prior={...life.result(answers(id),true)};
  assert.equal(life.normalize(prior).type,id);assert.equal(life.normalize(prior).version,2);
 }
 assert.equal(life.normalize({version:2,type:'banter',answers:answers('guide')}),null);
 const saved=daily.load(null);saved.profile={name:'Old',persona:'gentle',minutes:'20',activities:['walk'],height:'',weight:'',lifestyle:old};saved.onboarded=true;
 const c=app(saved);
 assert.equal(run(c,'state.onboarded'),true);assert.equal(run(c,'state.profile.persona'),'gentle');
 assert.ok(run(c,'lifeProfile()').includes('稳稳型'));
});
test('coach recommendations follow explicit tone preference and never mutate the selected coach or training',()=>{
 const expected={lazy:'fiery',spark:'calm',busy:'calm',feel:'gentle',steady:'calm',guide:'snark'};
 for(const [id,coach] of Object.entries(expected))assert.equal(life.recommendCoach(life.result(answers(id))).id,coach);
 const sensitive=answers('lazy');sensitive[5]='feel';assert.equal(life.recommendCoach(life.result(sensitive)).id,'gentle');
 const selfDirected=answers('guide');selfDirected[5]='steady';assert.equal(life.recommendCoach(life.result(selfDirected)).id,'calm');
 const playful=answers('busy');playful[5]='witty';assert.equal(life.recommendCoach(life.result(playful)).id,'snark');
 const p={persona:'gentle',lifestyle:life.result(answers('guide')),minutes:'30'},before=JSON.stringify(p);
 assert.equal(life.recommendCoach(p).id,'snark');assert.equal(JSON.stringify(p),before);
 const c=app();run(c,`setupDraft=lifestyle.apply({...state.profile,persona:'gentle'},lifestyle.result(${JSON.stringify(answers('guide'))}));`);
 assert.ok(run(c,"onboarding().includes('data-persona=\"snark\"')"));
 assert.equal(run(c,'setupDraft.persona'),'gentle');assert.ok(run(c,'onboarding()').includes('为你推荐'));
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
test('old banter results are retained for retake and never silently renamed or recommended',()=>{
 const prior={version:3,type:'banter',answers:[...Array(8).fill('banter'),'walk','20','evening','gentle']};
 const r=life.normalize(prior);assert.equal(r.type,'banter');assert.equal(r.needsRetake,true);
 assert.equal(life.recommendCoach(r),null);assert.equal(Object.keys(life.types).includes('banter'),false);
 const c=app();run(c,`state.profile.lifestyle=${JSON.stringify(r)}`);
 assert.ok(run(c,'lifeProfile()').includes('旧版结果待更新'));
 assert.ok(!run(c,'lifeProfile()').includes('data-life="download-saved"'));
});
test('completed earlier quiz drafts survive refresh with their original scoring and no forced save',()=>{
 const draft={version:3,phase:'result',index:11,answers:[...Array(8).fill('banter'),'walk','20','evening','gentle']};
 assert.equal(life.restoreDraft(draft).phase,'result');assert.equal(life.quizResult(draft).type,'banter');
 assert.equal(life.quizResult(draft).needsRetake,true);
 assert.equal(life.restoreDraft({...draft,phase:'questions'}),null);
 assert.equal(life.restoreDraft({...draft,answers:[]}),null);
 const newDraft={version:4,phase:'questions',index:2,answers:['guide',null]};
 assert.deepEqual(life.restoreDraft(newDraft),newDraft);
});
test('tone preference is separate from the habit score; guide answers describe actual planning friction',()=>{
 const a=answers('guide'),b=[...a];b[5]='witty';const first=life.result(a),second=life.result(b);
 assert.equal(first.type,'guide');assert.equal(second.type,'guide');assert.deepEqual(first.scores,second.scores);
 assert.equal(first.version,4);assert.equal(life.recommendCoach(second).id,'snark');
 assert.ok(life.evidenceLabels(first).every(pair=>pair.length===2));
 for(const q of life.questions.slice(0,8))assert.ok(!q.options.some(o=>o.id==='banter'));
});
test('results and Profile stay quiet; stars exist only in the four-coach selector',()=>{
 const c=app();run(c,`state.onboarded=true;state.profile=lifestyle.apply({...state.profile,persona:'gentle'},lifestyle.result(${JSON.stringify(answers('guide'))}));quizSession={phase:'result',index:11,answers:${JSON.stringify(answers('guide'))}};`);
 for(const lang of ['zh','en']){
  run(c,`state.language='${lang}'`);
  const result=run(c,'quizView()'),profile=run(c,'profile()');
  assert.ok(!result.includes('coach-recommendation'));assert.ok(!result.includes('coach-spotlight'));
  assert.ok(result.includes('<details class="life-evidence">'));assert.ok(!result.includes('<details class="life-evidence" open'));
  assert.ok(profile.includes('data-action="change-coach"'));assert.ok(!profile.includes('data-persona='));assert.ok(!profile.includes('coach-spotlight'));
  run(c,"coachPicker={selected:'gentle'}");const picker=run(c,'coachPickerView()');
  assert.equal((picker.match(/data-persona=/g)||[]).length,4);assert.equal((picker.match(/class="coach-spotlight"/g)||[]).length,1);
  assert.ok(picker.includes('data-persona="gentle" aria-pressed="true"'));assert.ok(picker.includes('is-recommended'));
  if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(picker));
 }
});
test('confirmed coach changes preserve records and unsaved form edits; cancelling changes nothing',()=>{
 const c=app();run(c,"state.onboarded=true;state.profile={...state.profile,name:'Saved',persona:'gentle'};profileDraft={...state.profile,name:'Unsaved'};state.logs.push({id:'meal'});coachPicker={selected:'snark'};");
 const before=run(c,'JSON.stringify([state.days,state.history,state.logs,state.wallet])');
 run(c,"coachPicker=null");assert.equal(run(c,'state.profile.persona'),'gentle');
 run(c,"coachPicker={selected:'snark'};applyCoachChoice()");
 assert.equal(run(c,'state.profile.persona'),'snark');assert.equal(run(c,'state.profile.name'),'Saved');
 assert.equal(run(c,'profileDraft.name'),'Unsaved');assert.equal(run(c,'profileDraft.persona'),'snark');
 assert.equal(run(c,'JSON.stringify([state.days,state.history,state.logs,state.wallet])'),before);
 run(c,"coachPicker={selected:'bad'}");assert.equal(run(c,'applyCoachChoice()'),null);
});

test('Profile starts read-only; editing is isolated and cancellation preserves all saved data',()=>{
 const c=app();run(c,"state.onboarded=true;state.profile.name='Original';");
 const before=run(c,'JSON.stringify(state)');
 for(const lang of ['zh','en']){
  run(c,`state.language='${lang}'`);const html=run(c,'profile()');
  assert.ok(html.includes('data-action="edit-profile"'));assert.ok(!html.includes('id="profile-form"'));
  assert.ok(!html.includes('profile-scenery'));assert.ok(!html.includes('soft-banner'));assert.ok(!html.includes('privacy-list'));
  assert.ok(html.includes('<details class="profile-settings">'));
  if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html));
 }
 run(c,"state.language='zh';beginProfileEdit();profileDraft.name='Uncommitted';profileDraft.activities.push('strength');");
 assert.equal(run(c,'state.profile.name'),'Original');assert.equal(run(c,"state.profile.activities.includes('strength')"),false);
 const html=run(c,'profile()');assert.ok(html.includes('id="profile-form"'));assert.ok(html.includes('保存修改'));assert.ok(html.includes('data-action="cancel-profile"'));
 run(c,'cancelProfileEdit()');assert.equal(run(c,'JSON.stringify(state)'),before);assert.equal(run(c,'profileDraft'),null);
});
test('quiz introduction and coach selection have individual live portraits with static fallbacks',()=>{
 const c=app();const gallery=run(c,'lifeGallery()'),coaches=run(c,"personaCards('calm')");
 assert.equal((gallery.match(/data-kora-live="life-/g)||[]).length,6);
 assert.equal((coaches.match(/data-kora-live=/g)||[]).length,4);
 assert.equal((gallery.match(/<canvas aria-hidden="true">/g)||[]).length,6);
 assert.equal((coaches.match(/class="companion-source"/g)||[]).length,4);
 run(c,`state.profile=lifestyle.apply(state.profile,lifestyle.result(${JSON.stringify(answers('lazy'))}));`);
 assert.ok(run(c,'lifeProfile()').includes('data-kora-live="life-lazy"'));
});
