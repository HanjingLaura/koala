const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
test('answer changes update selection without a render, focus reset or unrelated data mutation',()=>{
 const life=require('../lifestyle.js'),choices=life.questions[0].options.map(o=>({dataset:{lifeAnswer:o.id},firstElementChild:{textContent:''},setAttribute(n,v){this[n]=v;}})),next={disabled:true},writes=[];
 const node={};const document={querySelector:s=>s==='[data-life="next"]'?next:node,querySelectorAll:s=>s==='.life-option'?choices:[]};
 const c=vm.createContext({structuredClone,console,window:{KoraContent:require('../content-data.js'),KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraDaily:require('../daily.js'),KoraLifestyle:life,KoraComeback:require('../comeback.js')},document,localStorage:{getItem:()=>null},sessionStorage:{getItem:()=>null,setItem:(k,v)=>writes.push([k,v])}});vm.runInContext(source,c);
 vm.runInContext("quizSession={version:4,phase:'questions',index:0,answers:[]};render=()=>{throw Error('Answer must not remount the live companion');};",c);
 const before=vm.runInContext('JSON.stringify(state)',c);
 for(const answer of [choices[0].dataset.lifeAnswer,choices[1].dataset.lifeAnswer]){
  vm.runInContext(`handleLifeClick({dataset:{lifeAnswer:'${answer}'}})`,c);
  assert.equal(choices.filter(b=>b['aria-pressed']==='true').length,1);assert.equal(choices.find(b=>b['aria-pressed']==='true').dataset.lifeAnswer,answer);assert.equal(next.disabled,false);
 }
 assert.equal(vm.runInContext('JSON.stringify(state)',c),before);assert.equal(writes.length,2);
 assert.equal(choices[0].firstElementChild.textContent,'A');assert.equal(choices[1].firstElementChild.textContent,'✓');
});
