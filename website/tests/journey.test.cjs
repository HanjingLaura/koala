const test=require('node:test'),assert=require('node:assert/strict');
const daily=require('../daily.js'),j=require('../journey.js');
const day=(plan,logs=[])=>({plan,logs,mealDone:false,undo:null});
const plan=(extra={})=>({type:'original',action:'walk',minutes:30,done:false,...extra});
test('reports distinguish completion, timer records, rest and food; no automatic or future activity',()=>{
 const s=daily.fresh('2026-10-20');s.days={
  '2026-10-18':day(plan({done:true})),
  '2026-10-19':day(plan({type:'short',done:true,session:{elapsedMs:90000,running:false}}),[{id:'1'},{id:'2'}]),
  '2026-10-20':day(plan({done:true})),
  '2026-10-21':day(plan({done:true})),
  '2026-10-01':day(plan()),
  '2026-10-02':day(plan({type:'rest',done:true})),
  '2026-10-03':day(plan({type:'reschedule',done:true})),
  'bad':day(plan({done:true}))};s.legacy={plan:plan({done:true})};
 const before=JSON.stringify(s),r=j.report(s);assert.equal(r.completed,2);assert.equal(r.mealDays,1);assert.equal(r.timedMs,90000);assert.equal(r.untimedCount,1);assert.equal(r.recordedDays,2);assert.equal(j.completed(s).length,3);assert.equal(JSON.stringify(s),before);
 const month=j.report(s,'month');assert.equal(month.completed,3);assert.equal(month.rest,1);assert.equal(month.recordedDays,4);
 s.days['2026-10-20'].mealDone=true;assert.equal(j.report(s).mealDays,2);
 daily.activate(s,'2026-11-15');assert.equal(j.completed(s).length,4);assert.equal(j.report(s).recordedDays,0);
});
test('week and month ranges cover leap days and year boundaries without UTC shifts',()=>{
 assert.deepEqual(j.range('2027-01-01','week'),{start:'2026-12-28',end:'2027-01-03'});
 assert.deepEqual(j.range('2024-03-10','month',-1),{start:'2024-02-01',end:'2024-02-29'});
 assert.deepEqual(j.range('2026-12-31','month',1),{start:'2027-01-01',end:'2027-01-31'});
});
test('weekly proposals are inert until confirmed, preserve occupied dates and food; survive reload',()=>{
 const s=daily.fresh('2026-12-31');const dates=['2027-01-04','2027-01-07'];s.days[dates[0]]=day(plan({minutes:20}));s.days[dates[1]]=day(null,[{id:'keep'}]);
 const before=JSON.stringify(s);const draft=j.scheduleDraft(s,dates,10,'strength');assert.equal(JSON.stringify(s),before);
 assert.deepEqual(j.applySchedule(s,draft),{ok:true,added:[dates[1]],kept:[dates[0]]});assert.equal(s.days[dates[0]].plan.minutes,20);assert.equal(s.days[dates[1]].logs[0].id,'keep');
 const reload=daily.load(JSON.parse(JSON.stringify(s)),s.date);assert.equal(reload.days[dates[1]].plan.action,'strength');assert.equal(j.completed(reload).length,0);
 assert.equal(j.cancelScheduled(reload,dates[0]),false);assert.equal(j.cancelScheduled(reload,dates[1]),true);assert.equal(reload.days[dates[1]].logs[0].id,'keep');
});
test('stale or invalid proposals cannot overwrite plans; current and completed reservations cannot be cancelled',()=>{
 const s=daily.fresh('2026-10-20'),date='2026-10-26';let d=j.scheduleDraft(s,[date],20,'walk');s.days[date]=day(plan());assert.equal(j.applySchedule(s,d).ok,false);
 assert.equal(j.scheduleDraft(s,['2026-10-20'],20,'walk'),null);assert.equal(j.scheduleDraft(s,[date],0,'walk'),null);assert.equal(j.scheduleDraft(s,[date],20,'bad'),null);
 d=j.scheduleDraft(s,['2026-10-29'],20,'walk');daily.activate(s,'2026-10-21');assert.equal(j.applySchedule(s,d).ok,false);
 s.days[date]=day(plan({source:'report',done:true}));assert.equal(j.cancelScheduled(s,date),false);
 s.days[s.date].plan=plan({source:'report'});assert.equal(j.cancelScheduled(s,s.date),false);
});
test('recommendations require at least two completed records before suggesting shorter sessions',()=>{
 const s=daily.fresh('2026-10-20');s.profile.minutes=30;
 assert.equal(j.suggestedMinutes(s,{completed:1,shortDone:1}),30);
 assert.equal(j.suggestedMinutes(s,{completed:2,shortDone:1}),10);
 assert.equal(j.suggestedMinutes(s,{completed:3,shortDone:1}),30);
});
test('trail, report, rewards and scheduling views are bilingual and do not write plans on preview',()=>{
 const fs=require('node:fs'),vm=require('node:vm');const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0];
 const c=vm.createContext({structuredClone,console,window:{KoraContent:require('../content-data.js'),KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:j,KoraDaily:daily,KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js')},localStorage:{getItem:()=>null},document:{querySelector:()=>({})}});
 vm.runInContext(source,c);vm.runInContext("openModal=(html)=>{globalThis.view=html;};state.profile.persona='gentle';",c);
 for(const lang of ['zh','en'])for(const kind of ['week','month']){
  vm.runInContext(`state.language='${lang}';reportKind='${kind}';`,c);
  const before=vm.runInContext('JSON.stringify(state.days)',c);
  for(const expression of ['journeySection()','(showReport(),view)','(showRewards(),view)','(showSchedule(),view)']){
   const html=vm.runInContext(expression,c);assert.ok(!html.includes('undefined'));if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html.replace('>中文<','><')),expression);
  }
  assert.equal(vm.runInContext('JSON.stringify(state.days)',c),before);
 }
});
test('seven dated nodes distinguish rest, rescheduling and missing records across year boundaries without creating days',()=>{
 const s=daily.fresh('2026-12-31');s.days['2026-12-28']=day(plan({done:true}));s.days['2026-12-29']=day(plan({type:'rest',done:true}));s.days['2026-12-30']=day(plan({type:'reschedule',targetDate:'2027-01-01'}));s.days['2027-01-01']=day(plan());s.days['2027-01-02']=day(plan({done:true}));const before=JSON.stringify(s),rows=j.weekNodes(s);
 assert.equal(rows.length,7);assert.equal(rows[0].date,'2026-12-28');assert.equal(rows[6].date,'2027-01-03');assert.equal(rows.filter(r=>r.today).length,1);assert.deepEqual(rows.map(r=>r.kind),['done','rest','moved','empty','planned','planned','future']);
 assert.equal(j.weekNodes(s,1)[0].date,'2027-01-04');assert.equal(j.weekNodes(s,1).some(r=>r.today),false);assert.equal(JSON.stringify(s),before);
 daily.activate(s,'2027-01-04');assert.equal(j.weekNodes(s)[0].today,true);assert.equal(j.weekNodes(s)[0].date,'2027-01-04');assert.equal(s.days['2026-12-28'].plan.done,true);
});
