const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function app(){const c=vm.createContext({structuredClone,console,window:{KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraDaily:require('../daily.js'),KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js')},localStorage:{getItem:()=>null},document:{querySelector:()=>({})}});vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0],c);vm.runInContext("openModal=(html)=>{globalThis.view=html;};state.profile.persona='gentle';",c);return c;}
const run=(c,s)=>vm.runInContext(s,c);
test('path is the sole home surface; plan and adjustment open without changing records in both languages',()=>{
 const c=app();for(const lang of ['zh','en'])for(const type of ['original','rest','reschedule','completed','running','paused']){
 run(c,`state.language='${lang}';state.plan={type:'${['completed','running','paused'].includes(type)?'original':type}',action:'walk',minutes:20,done:${type==='completed'},targetDate:calendar.addDays(state.date,1)};`);
 if(['running','paused'].includes(type))run(c,`calendar.start(state);${type==='paused'?'calendar.pause(state);':''}`);
 const before=run(c,'JSON.stringify(state)'),home=run(c,'today()');
 assert.equal((home.match(/data-kora-live=/g)||[]).length,1);assert.ok(home.includes('data-action="today-plan"'));assert.ok(!home.includes('data-action="start-session"'));assert.ok(!/routine-hero|report-teaser|life-home|trail-aside/.test(home));
 for(const expr of ['(showTodayPlan(),view)','(showAdjustReason(),view)','(showRecordHub(),view)']){const html=run(c,expr);assert.ok(!html.includes('undefined'));if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html.replace('>中文<','><')));}
 assert.equal(run(c,'JSON.stringify(state)'),before);
 if(type==='rest')assert.ok(!home.includes('today-node is-past'));if(type==='running')assert.ok(!home.includes('data-session-clock'));
 }
});
test('background preference survives reload and cannot show an unearned scene',()=>{const c=app();run(c,'state.profile.scene=2');assert.equal(run(c,'currentScene()'),0);run(c,"for(let i=0;i<6;i++){const d=calendar.addDays(state.date,-i);state.days[d]={plan:{type:'original',done:true},logs:[]};}state=calendar.load(JSON.parse(JSON.stringify(state)),state.date)");assert.equal(run(c,'currentScene()'),2);run(c,'state.profile.scene=0');assert.equal(run(c,'currentScene()'),0);run(c,'rewards.init(state)');const html=run(c,'(showRewards(),view)');assert.ok(html.includes('data-scene="2"'));});
test('weekly home has seven date buttons and next-week previews preserve existing plans without early completion',()=>{
 const c=app();run(c,"state=calendar.fresh('2026-10-20');state.profile.persona='gentle';state.plan=calendar.defaultPlan(state);state.days['2026-10-26']={plan:{type:'custom',action:'walk',minutes:20,done:false},logs:[]}");
 for(const lang of ['zh','en'])for(const offset of [0,1]){
  run(c,`state.language='${lang}';pathWeekOffset=${offset}`);const before=run(c,'JSON.stringify(state)'),html=run(c,'journeySection()');assert.equal((html.match(/data-week-node=/g)||[]).length,7);assert.equal((html.match(/data-kora-live=/g)||[]).length,offset?0:1);
  if(offset){assert.ok(!html.includes('data-action="today-plan"'));assert.ok(!html.includes('data-action="next-path-week"'));run(c,"showWeekDay('2026-10-26')");assert.ok(run(c,'view').includes('20'));assert.ok(!run(c,'view').includes('data-action="complete-session"'));}
  if(lang==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html));assert.equal(run(c,'JSON.stringify(state)'),before);
 }
});
test('only today shows a date label; other nodes show their day number and task detail stays in the panel',()=>{
 const c=app();for(const language of ['zh','en']){
  run(c,`state.language='${language}';pathWeekOffset=0;state.plan={type:'original',minutes:20,action:'walk',done:true}`);const before=run(c,'JSON.stringify(state)'),html=run(c,'today()');
  assert.equal((html.match(/class="week-node-label"/g)||[]).length,1);assert.ok(!/week-node-caption|week-clock|companion-controls|<strong>今天，完成/.test(html));assert.ok(html.includes('data-action="coach-interact"'));assert.ok(!html.includes('<span>20 分钟散步</span>'));
  run(c,'showTodayPlan()');assert.ok(run(c,'view').includes('20'));assert.equal(run(c,'JSON.stringify(state)'),before);
 }
});
