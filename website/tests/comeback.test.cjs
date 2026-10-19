const test=require('node:test'),assert=require('node:assert/strict');
const daily=require('../daily.js'),back=require('../comeback.js');
const fresh=()=>daily.load(null,'2026-10-19');
test('choosing and previewing never mutates saved records; confirmation and reload retain one small action',()=>{
 const s=fresh(),before=JSON.stringify(s),d=back.begin(s,'low');d.reason='time';d.action='stretch';
 assert.equal(back.plan(s,d).minutes,1);assert.equal(JSON.stringify(s),before);assert.deepEqual(back.records(s),[]);
 assert.equal(back.confirm(s,d),true);assert.equal(s.plan.type,'tiny');assert.equal(s.plan.minutes,1);assert.equal(s.plan.reminder,false);
 const loaded=daily.load(JSON.parse(JSON.stringify(s)),s.date);assert.equal(loaded.days[s.date].comeback.energy,'low');assert.equal(back.records(loaded)[0].done,false);
 assert.equal(back.complete(loaded),true);assert.equal(back.complete(loaded),false);assert.equal(back.records(loaded)[0].done,true);
});
test('rest is explicit care, not a fake workout; undo restores the previous mood and plan',()=>{
 const s=fresh();assert.equal(back.confirm(s,back.begin(s,'low')),true);const previous=JSON.stringify(s.plan),c=JSON.stringify(s.days[s.date].comeback);
 assert.equal(back.confirm(s,back.begin(s,'rest')),true);assert.equal(s.plan.type,'rest');assert.equal(s.plan.done,false);assert.equal(back.records(s)[0].kind,'rest');
 assert.equal(daily.undo(s),true);assert.equal(JSON.stringify(s.plan),previous);assert.equal(JSON.stringify(s.days[s.date].comeback),c);
 assert.equal(back.confirm(s,back.begin(s,'rest')),true);back.complete(s);assert.equal(s.plan.done,false);assert.equal(back.records(s)[0].kind,'care');assert.equal(back.confirm(s,back.begin(s,'low')),false);assert.equal(daily.adjust(s,{type:'short',minutes:10},'time'),false);
});
test('stale, next-day, invalid and completed drafts cannot overwrite existing actions',()=>{
 const s=fresh(),d=back.begin(s,'low');s.plan.minutes=20;assert.equal(back.confirm(s,d),false);
 const midnight=back.begin(s,'rest');daily.activate(s,'2026-10-20');assert.equal(back.confirm(s,midnight),false);
 const bad=back.begin(s,'low');bad.action='anything';assert.equal(back.confirm(s,bad),false);
 s.plan.done=true;const complete=JSON.stringify(s);assert.equal(back.confirm(s,back.begin(s,'rest')),false);assert.equal(JSON.stringify(s),complete);
});
test('keep preserves reservations; later target check-in blocks undo that would erase it',()=>{
 const s=fresh(),next='2026-10-20';daily.adjust(s,{type:'reschedule',minutes:20,done:false},'time');
 const reserved=JSON.stringify(s.days[next]);assert.equal(back.confirm(s,back.begin(s,'ready')),true);assert.equal(JSON.stringify(s.days[next]),reserved);assert.equal(back.complete(s),false);
 assert.equal(daily.undo(s),true);assert.equal(JSON.stringify(s.days[next]),reserved);
 const s2=fresh();daily.adjust(s2,{type:'reschedule',minutes:20,done:false},'time');s2.days[next].comeback={energy:'ready',done:false};assert.equal(daily.undo(s2),false);
});
test('rest after rescheduling and undo restore both dates without losing meals',()=>{
 const s=fresh();s.logs.push({id:'meal',cal:130});daily.adjust(s,{type:'reschedule',minutes:20,done:false},'time');const target=JSON.stringify(s.days['2026-10-20']);
 back.confirm(s,back.begin(s,'rest'));assert.equal(s.days['2026-10-20'].plan,null);assert.equal(s.logs[0].cal,130);
 daily.undo(s);assert.equal(JSON.stringify(s.days['2026-10-20']),target);assert.equal(s.plan.type,'reschedule');assert.equal(s.logs[0].cal,130);
});
test('path ignores automatic day creation, future reservations and undated data; gaps require actual recorded actions',()=>{
 const s=fresh();daily.activate(s,'2026-10-20');daily.activate(s,'2026-10-19');s.legacy={plan:{done:true}};assert.deepEqual(back.records(s),[]);assert.equal(back.returnInsight(s),null);
 for(const date of ['2026-09-30','2026-10-15','2026-10-19']){daily.activate(s,date);back.confirm(s,back.begin(s,'low'));back.complete(s);}
 assert.deepEqual(back.returnInsight(s),{days:3,previous:14});assert.equal(back.records(s).length,3);
 daily.activate(s,'2026-10-20');assert.equal(back.returnInsight(s),null);assert.equal(back.records(s).length,3);
 assert.equal(back.gap('2026-12-31','2027-01-02'),1);
});
