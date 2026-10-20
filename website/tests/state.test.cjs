const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
function context(saved=null){const c=vm.createContext({structuredClone,console,window:{KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js'),KoraDaily:require('../daily.js')},localStorage:{getItem:()=>saved?JSON.stringify(saved):null,setItem:()=>{}},document:{querySelector:()=>({})}});vm.runInContext(source,c);return c;}
const run=(c,s)=>vm.runInContext(s,c);
const c=context();
assert.equal(run(c,'state.onboarded'),false);
run(c,"state.profile={name:'Demo',height:'165',weight:'60',persona:'gentle',activities:['stretch'],minutes:'20',goal:'routine',noJump:true}");
assert.equal(run(c,'validProfile(state.profile)'),true);
for(const field of ["name:''","height:'0'","weight:'NaN'","weight:'401'","activities:[]","persona:'other'"]){assert.equal(run(c,`validProfile({...state.profile,${field}})`),false,field);assert.notEqual(run(c,`profileError({...state.profile,${field}})`),'',field);}
for(const lang of ['zh','en']){
 run(c,`state.language='${lang}'`);
 const lines=run(c,"PERSONA_IDS.map(id=>say('time',id))");assert.equal(new Set(lines).size,4);
 for(const page of ['today','food','move','chat','profile']){
  const html=run(c,`${page}()`);assert.ok(!html.includes('undefined'),page+' '+lang);
  if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html),page+' has untranslated copy');
 }
}
run(c,"draft={choice:'short'}");assert.equal(run(c,'draftPlan().minutes'),10);
run(c,"draft={choice:'rest'}");assert.equal(run(c,'draftPlan().reminder'),false);
run(c,"state.plan={type:'rest',minutes:0,day:2,done:false,reminder:false};draft={choice:'reschedule'}");assert.equal(run(c,'draftPlan().minutes'),20);assert.equal(run(c,'draftPlan().type'),'reschedule');
run(c,"draft={workout:'strength'}");assert.equal(run(c,'draftPlan().workout'),'strength');
run(c,"state.language='en';state.logs=[{id:'legacy',name:'熟米饭',grams:150,cal:195}]");assert.ok(run(c,'food()').includes('Cooked rice'));assert.ok(!/[\u4e00-\u9fff]/.test(run(c,'food()')));
const old={schema:1,profile:{name:'Legacy',minutes:'30',goal:'养成舒服的生活节奏',noJump:true},plan:{type:'original',minutes:30,day:2,done:false,reminder:true},logs:[{id:'1',name:'熟米饭',grams:100,cal:130}],history:[]};
const migrated=context(old);assert.equal(run(migrated,'state.profile.name'),'Legacy');assert.equal(run(migrated,'state.logs.length'),0);assert.equal(run(migrated,'state.legacy.logs.length'),1);assert.equal(run(migrated,'state.onboarded'),false);assert.equal(run(migrated,'state.profile.goal'),'routine');
assert.equal(run(c,"escapeHTML('<img onerror=alert(1)>')"),'&lt;img onerror=alert(1)&gt;');
console.log('PASS: setup validation, bilingual page coverage, four persona voices, plan choices, legacy migration and escaping.');
// New home and all check-in dialogs stay bilingual after a real saved choice.
run(c,"openModal=(html)=>{globalThis.lastModal=html;};state=calendar.load(null);state.profile={name:'Demo',persona:'gentle'};");
for(const lang of ['zh','en'])for(const energy of ['ready','low','rest']){
 run(c,`state.language='${lang}';comebackDraft=comeback.begin(state,'${energy}');showComebackReason()`);
 for(const view of ['lastModal','(showComebackReview(),lastModal)']){const html=run(c,view);assert.ok(!html.includes('undefined'));if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html.replace('>中文<','><')));}
}
run(c,"state.language='en';comeback.confirm(state,comeback.begin(state,'low'))");assert.ok(!/[\u4e00-\u9fff]/.test(run(c,'today()')));
run(c,'comeback.complete(state)');assert.ok(run(c,'today()').includes('Today’s plan. Done.'));assert.ok(!run(c,'today()').includes('data-energy="low"'));
console.log('PASS: energy dialogs, saved path and completion home in both languages.');
