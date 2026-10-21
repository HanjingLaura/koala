/* Local, opt-in in-page nudges. No system permission, push service or network. */
(function(root){
 'use strict';
 const cal=typeof module!=='undefined'&&module.exports?require('./daily.js'):root.KoraDaily;
 const levels={gentle:{limit:1,gap:45},regular:{limit:2,gap:45},strong:{limit:3,gap:20}};
 function settings(state){const s=state.profile?.nudges||{},level=s.level||state.profile?.reminderPreference;return {enabled:s.enabled===true,time:/^(?:0[6-9]|1\d|2[01]):[0-5]\d$/.test(s.time||'')?s.time:'19:30',level:levels[level]?level:'gentle'};}
 function day(state){return state.days?.[state.date]?.nudge||{};}
 function eligible(state){const p=state.plan;return Boolean(state.onboarded&&p&&!p.done&&!['rest','reschedule'].includes(p.type)&&!p.session&&!state.days?.[state.date]?.comeback?.done);}
 function due(state,now=Date.now()){
  const s=settings(state),d=day(state),date=new Date(now),minute=date.getHours()*60+date.getMinutes();
  if(!s.enabled||!eligible(state)||state.date!==cal.dateKey(date)||minute<360||minute>=1320||d.quiet)return null;
  const count=Number(d.count)||0;
  if(d.snoozeUntil){if(now<d.snoozeUntil)return null;return {kind:'snooze',stage:Math.min(2,Math.max(0,count-1))};}
  const [h,m]=s.time.split(':').map(Number),rule=levels[s.level];
  if(minute<h*60+m||count>=rule.limit||(count>0&&now-(Number(d.lastAt)||0)<rule.gap*60000))return null;
  return {kind:'scheduled',stage:Math.min(2,count)};
 }
 function shown(state,event,now=Date.now()){const d=state.days[state.date].nudge||={};if(event.kind!=='snooze')d.count=(Number(d.count)||0)+1;d.lastAt=now;d.snoozeUntil=0;}
 function respond(state,action,now=Date.now()){const d=state.days[state.date].nudge||={};if(action==='later'){d.snoozeUntil=now+10*60000;d.quiet=false;}else{d.quiet=true;d.snoozeUntil=0;}return d;}
 function armGuide(state){if(!state.profile.nudgeGuide)state.profile.nudgeGuide=settings(state).enabled?'seen':'pending';}
 function guidePending(state){return Boolean(state.onboarded&&state.profile?.nudgeGuide==='pending'&&!settings(state).enabled);}
 function finishGuide(state){if(state.profile?.nudgeGuide!=='pending')return false;state.profile.nudgeGuide='seen';return true;}
 const copy={
  calm:[
   [['嗯，到点了。动一动？','Hey, it’s time. Shall we move?'],['鞋穿上。今天的安排，慢慢开始。','Shoes on. Start today’s plan at your pace.'],['陪你开个头','A quiet start']],
   [['我还在等你。现在出发？','Still waiting. Ready to go?'],['没开始也没事。照常练，还是调整一下？','Not started yet? Keep the plan, or change it?'],['再问一句','Just checking']],
   [['最后问一句，准备好了吗？','Last check-in. Ready to move?'],['想动就动。今天不合适，我就不催了。','Move if you feel up to it. If not, I’ll leave it here.'],['问完就收工','Then I’ll stop']]
  ],
  snark:[
   [['先和沙发告个别，一起动动？','Say bye to the sofa. Shall we move?'],['先别研究下一套。今天这套，开练？','No more research. Ready to try today’s session?'],['沙发谈判员','Sofa negotiator']],
   [['沙发还没放人？该出发了。','Still held hostage by the sofa? Time to go.'],['要不先把鞋穿上？有事的话，我们改安排。','Shoes first? If something came up, let’s change the plan.'],['来捞你一下','Here to rescue you']],
   [['最后敲一次，别光和计划谈恋爱。','Last knock. Let’s do more than admire the plan.'],['练不练你说了算。我嘴欠，但不死缠烂打。','Your call. Sharp tongue, decent boundaries.'],['嘴欠，有分寸','Wit with limits']]
  ],
  fiery:[
   [['到点啦，带上我一起热身！','It’s time! Let’s warm up together!'],['今天这场，我陪你！先从热身开始！','I’m with you! Let’s start with the warm-up!'],['热身小队长','Warm-up captain']],
   [['集合！鞋穿好了吗？','TEAM! Shoes on yet?'],['没空就改，累了就歇！别一个人在那儿纠结！','Busy? Adjust it! Tired? Rest! No wrestling with it alone!'],['来给你打气','Your hype squad']],
   [['最后一声集合！','LAST CALL, TEAM!'],['今天不练也得好好休息！我不追着你跑了！','Not training? Rest properly! I’m done chasing for today!'],['吼完就下班','Then I clock off']]
  ],
  gentle:[
   [['到点啦，一起动一动？','It’s time. Shall we move together?'],['先换上舒服的衣服吧。我陪你慢慢开始。','Get comfortable. I’ll be here while you ease in.'],['轻轻敲敲门','A gentle little knock']],
   [['探个头，你准备好了吗？','Peeking in. Feeling ready?'],['还没开始也没关系。是照常练，还是换个安排？','It’s okay if not. Keep today’s plan, or find a better fit?'],['再陪你一下','Still by your side']],
   [['最后叫你一次，准备好就开始。','Last little nudge. Start when you’re ready.'],['想练的话，我在。不想练，也记得好好照顾自己。','I’m here if you want to move. Either way, take care of yourself.'],['温柔，也留空间','Care, with space']]
  ]
 };
 function coachOf(state){const id=state.profile?.persona;return Object.hasOwn(copy,id)?id:'calm';}
 function message(persona,stage=0){return (copy[persona]||copy.calm)[Math.max(0,Math.min(2,Number(stage)||0))];}
 const api={levels,settings,day,eligible,due,shown,respond,message,coachOf,armGuide,guidePending,finishGuide};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraNudges=api;
})(typeof window==='undefined'?globalThis:window);
