const test=require('node:test'),assert=require('node:assert/strict');
const calendar=require('../daily.js'),n=require('../nudges.js');
const at=(hour,minute=0,date=21)=>new Date(2026,9,date,hour,minute).getTime();
function state(level='regular'){const s=calendar.load(null,'2026-10-21');s.onboarded=true;s.profile.nudges={enabled:true,time:'19:30',level};return s;}
test('nudges need explicit opt-in, respect chosen time, and never change the plan',()=>{
 const s=state();delete s.profile.nudges;const before=JSON.stringify(s.plan);assert.equal(n.due(s,at(20)),null);
 s.profile.nudges={enabled:true,time:'19:30',level:'regular'};assert.equal(n.due(s,at(19,29)),null);assert.deepEqual(n.due(s,at(19,30)),{kind:'scheduled',stage:0});assert.equal(JSON.stringify(s.plan),before);
});
test('one / two / three nudges have enforced daily caps and minimum spacing',()=>{
 for(const [level,count,gap] of [['gentle',1,45],['regular',2,45],['strong',3,20]]){
  const s=state(level);for(let i=0;i<count;i++){const time=at(19,30)+i*gap*60000;const event=n.due(s,time);assert.equal(event.stage,i);n.shown(s,event,time);assert.equal(n.due(s,time+1000),null);}
  assert.equal(n.due(s,at(21,59)),null);
 }
});
test('an explicit snooze survives refresh and is distinct from unsolicited follow-ups',()=>{
 const s=state('gentle');n.shown(s,n.due(s,at(19,30)),at(19,30));n.respond(s,'later',at(19,31));
 const reloaded=calendar.load(JSON.parse(JSON.stringify(s)),'2026-10-21');assert.equal(n.due(reloaded,at(19,40)),null);const event=n.due(reloaded,at(19,41));assert.equal(event.kind,'snooze');n.shown(reloaded,event,at(19,41));assert.equal(n.day(reloaded).count,1);assert.equal(n.due(reloaded,at(20,30)),null);
});
test('dismiss, open-plan and adjustment responses quiet the remainder of the day',()=>{
 for(const action of ['quiet','start','adjust']){const s=state('strong');n.respond(s,action,at(19,30));assert.equal(n.due(s,at(21)),null);assert.equal(n.day(s).snoozeUntil,0);}
});
test('completed, resting, moved, running and paused sessions suppress even a snoozed reminder',()=>{
 for(const modify of [s=>s.plan.done=true,s=>s.plan.type='rest',s=>s.plan.type='reschedule',s=>s.plan.session={running:true},s=>s.plan.session={running:false},s=>s.days[s.date].comeback={done:true}]){const s=state();n.respond(s,'later',at(19,30));modify(s);assert.equal(n.due(s,at(20)),null);}
});
test('quiet hours and next-day boundaries prevent late or stale reminders',()=>{
 const s=state('strong');assert.equal(n.due(s,at(22)),null);assert.equal(n.due(s,at(5)),null);assert.equal(n.due(s,at(20,0,22)),null);n.respond(s,'quiet',at(20));calendar.activate(s,'2026-10-22');assert.deepEqual(n.due(s,at(19,30,22)),{kind:'scheduled',stage:0});
});
test('settings normalize malformed time and frequency, preserving explicit off',()=>{
 const s=state();s.profile.nudges={enabled:false,time:'25:70',level:'forever'};assert.deepEqual(n.settings(s),{enabled:false,time:'19:30',level:'gentle'});assert.equal(n.due(s,at(20)),null);
});
test('preview messages have three bilingual, distinct rounds without writing user data',()=>{
 const s=state(),before=JSON.stringify(s);for(const coach of ['calm','snark','fiery','gentle']){const messages=[0,1,2].map(stage=>n.message(coach,stage));assert.equal(new Set(messages.map(m=>m[0][0])).size,3);messages.forEach(m=>{assert.equal(m.length,3);m.forEach(pair=>assert.ok(pair[0]&&pair[1]));});}assert.equal(JSON.stringify(s),before);
});
test('the reminder coach always comes from the selected profile, not an independent reminder choice',()=>{
 const s=state();s.profile.nudges.coach='fiery';
 for(const id of ['calm','snark','fiery','gentle']){s.profile.persona=id;assert.equal(n.coachOf(s),id);assert.ok(n.message(n.coachOf(s),1)[0][0]);}
 s.profile.persona='retired';assert.equal(n.coachOf(s),'calm');
});
test('the guide is armed only for new setup and does not enable reminders or alter a plan',()=>{
 const s=state();s.profile.nudges.enabled=false;const plan=JSON.stringify(s.plan);
 assert.equal(n.guidePending(s),false);n.armGuide(s);assert.equal(n.guidePending(s),true);
 assert.equal(n.settings(s).enabled,false);assert.equal(JSON.stringify(s.plan),plan);
 s.onboarded=false;assert.equal(n.guidePending(s),false);
});
test('a shown or dismissed guide stays consumed after reload and cannot be rearmed by a retest',()=>{
 const s=state();s.profile.nudges.enabled=false;n.armGuide(s);assert.equal(n.finishGuide(s),true);assert.equal(n.finishGuide(s),false);
 const reload=calendar.load(JSON.parse(JSON.stringify(s)),'2026-10-21');n.armGuide(reload);
 assert.equal(n.guidePending(reload),false);assert.equal(reload.profile.nudgeGuide,'seen');assert.equal(n.settings(reload).enabled,false);
});
test('existing profiles and users with reminders already enabled are not prompted',()=>{
 const s=state();assert.equal(n.guidePending(s),false);n.armGuide(s);assert.equal(n.guidePending(s),false);assert.equal(s.profile.nudgeGuide,'seen');
});
