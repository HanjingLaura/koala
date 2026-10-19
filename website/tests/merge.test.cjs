const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const daily=require('../daily.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
const profile={name:'Demo',height:'165',weight:'60',persona:'gentle',activities:['walk'],minutes:'20',goal:'routine',noJump:true};
function app(saved){const c=vm.createContext({structuredClone,console,window:{KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js'),KoraDaily:daily},localStorage:{getItem:()=>JSON.stringify(saved)},document:{querySelector:()=>({})}});vm.runInContext(source,c);return c;}
const run=(c,s)=>vm.runInContext(s,c);
const key=daily.dateKey();
// Preserve the teammate's dated schema 2, including its legacy archive.
const remote={schema:2,date:key,profile:{name:'Team',minutes:'30'},days:{[key]:{plan:{type:'short',minutes:10,done:false},logs:[{id:'r',name:'熟米饭',grams:150,cal:195}],mealDone:true,undo:null}},history:[],legacy:{plan:{minutes:30},logs:[]}};
const a=app(remote);assert.equal(run(a,'state.logs[0].cal'),195);assert.equal(run(a,'state.mealDone'),true);assert.equal(run(a,'state.profile.name'),'Team');assert.equal(run(a,'state.onboarded'),false);
// Preserve the approved preview's profile/personality; do not invent a date for its logs.
const local={schema:2,onboarded:true,language:'en',profile,plan:{type:'short',minutes:10,done:false},logs:[{id:'u',foodId:'rice',grams:150,cal:195}],history:[]};
const b=app(local);assert.equal(run(b,'state.onboarded'),true);assert.equal(run(b,'state.profile.persona'),'gentle');assert.equal(run(b,'state.language'),'en');assert.equal(run(b,'state.logs.length'),0);assert.equal(run(b,'state.legacy.logs[0].cal'),195);
run(b,"state.logs.push({id:'n',foodId:'rice',grams:100,cal:130})");
const saved=JSON.parse(run(b,'JSON.stringify(state)'));assert.equal(saved.schema,3);
const c=app(saved);assert.equal(run(c,'state.onboarded'),true);assert.equal(run(c,'state.logs[0].cal'),130);assert.equal(run(c,'state.legacy.logs[0].cal'),195);
run(c,'weekOffset=1');assert.ok(run(c,'weekStrip()').includes(daily.weekDates(daily.addDays(key,7))[0]));
assert.ok(!/[\u4e00-\u9fff]/.test(run(c,'today()+profile()+historySummary()+historyMeals(state.legacy.logs)')));
console.log('PASS: remote dated schema, local bilingual schema, undated archive, schema 3 reload, week navigation and English history.');
