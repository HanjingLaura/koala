const {test}=require('node:test');
const assert=require('node:assert/strict');
const daily=require('./daily.js');
const open=date=>daily.load(null,date);
const plan=(type='short')=>({type,title:'10 分钟轻活动',minutes:10,done:false,reminder:true});
test('local calendar: Sunday, month/year rollover and leap day',()=>{
  assert.deepEqual(daily.weekDates('2026-10-18'),['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-18']);
  assert.equal(daily.addDays('2026-12-31',1),'2027-01-01');
  assert.equal(daily.addDays('2028-02-28',1),'2028-02-29');
  assert.equal(daily.addDays('2026-03-08',1),'2026-03-09');
});
test('refresh and next day isolate meals/completion and retain profile/history',()=>{
  let s=open('2026-10-18');s.profile.name='Laura';s.logs.push({id:'a',name:'米饭',grams:150,cal:195});s.mealDone=true;s.plan.done=true;
  s=daily.load(JSON.parse(JSON.stringify(s)),'2026-10-18');assert.equal(s.logs[0].cal,195);
  daily.activate(s,'2026-10-19');assert.equal(s.logs.length,0);assert.equal(s.mealDone,false);assert.equal(s.plan.done,false);assert.equal(s.profile.name,'Laura');
  assert.equal(s.days['2026-10-18'].logs.length,1);assert.equal(s.days['2026-10-18'].plan.done,true);
});
test('rescheduling Sunday reserves Monday across week/year and reload',()=>{
  let s=open('2026-12-31');assert.equal(daily.adjust(s,plan('reschedule'),'今天没时间'),true);
  assert.equal(s.plan.targetDate,'2027-01-01');s=daily.load(JSON.parse(JSON.stringify(s)),'2027-01-01');
  assert.equal(s.plan.type,'custom');assert.equal(s.plan.minutes,10);assert.equal(s.plan.reminder,true);assert.equal(s.days['2026-12-31'].plan.type,'reschedule');
});
test('rescheduling never overwrites an existing tomorrow plan',()=>{
  const s=open('2026-10-18');daily.activate(s,'2026-10-19');s.plan.done=true;daily.activate(s,'2026-10-18');
  const before=JSON.stringify(s);assert.equal(daily.adjust(s,plan('reschedule'),'今天没时间'),false);assert.equal(JSON.stringify(s),before);
});
test('undo restores today and removes only its owned future reservation',()=>{
  let s=open('2026-10-18');const original=JSON.stringify(s.plan);daily.adjust(s,plan('reschedule'),'今天没时间');
  s=daily.load(JSON.parse(JSON.stringify(s)),'2026-10-18');assert.equal(daily.undo(s),true);
  assert.equal(JSON.stringify(s.plan),original);assert.equal(s.days['2026-10-19'],undefined);assert.equal(s.history.length,0);
});
test('undo does not discard later target-day data',()=>{
  const s=open('2026-10-18');daily.adjust(s,plan('reschedule'),'今天没时间');s.days['2026-10-19'].logs.push({id:'later'});
  const before=JSON.stringify(s);assert.equal(daily.undo(s),false);assert.equal(JSON.stringify(s),before);
});
test('changing a reschedule to rest removes reservation; undo restores it',()=>{
  const s=open('2026-10-18');daily.adjust(s,plan('reschedule'),'今天没时间');daily.adjust(s,{...plan('rest'),minutes:0},'今天不想练');
  assert.equal(s.days['2026-10-19'].plan,null);assert.equal(daily.undo(s),true);assert.equal(s.plan.type,'reschedule');assert.equal(s.days['2026-10-19'].plan.minutes,10);
});
test('completed plans cannot be rewritten',()=>{const s=open('2026-10-18');s.plan.done=true;assert.equal(daily.adjust(s,plan(),'今天没时间'),false);});
test('undo after cancelling a reschedule preserves later changes on its target',()=>{
  const s=open('2026-10-18');daily.adjust(s,plan('reschedule'),'今天没时间');daily.adjust(s,plan('rest'),'今天不想练');
  s.days['2026-10-19'].logs.push({id:'new'});assert.equal(daily.undo(s),false);assert.equal(s.days['2026-10-19'].logs[0].id,'new');
});
test('legacy undated data is retained without claiming it happened today',()=>{
  const legacy={schema:1,profile:{name:'旧昵称'},plan:{title:'旧安排',done:true},logs:[{name:'旧餐食'}],history:[],nextWednesdayRest:true};
  const s=daily.load(legacy,'2026-10-18');assert.deepEqual(s.legacy,legacy);assert.equal(s.profile.name,'旧昵称');assert.equal(s.logs.length,0);assert.equal(s.plan.done,false);assert.equal(s.nextWednesdayRest,undefined);
  const reloaded=daily.load(JSON.parse(JSON.stringify(s)),'2026-10-19');assert.deepEqual(reloaded.legacy,legacy);
});
