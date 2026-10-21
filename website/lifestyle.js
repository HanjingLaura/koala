'use strict';
// Entertainment preferences, not a psychological or health assessment.
(function(root){
 const types={
  lazy:{name:['省电型','Energy saver'],code:'LAZY',color:'#657657',soft:'#f0f2e9',quote:['不是没有梦想，是沙发暂时扣留了我。','I have dreams. The sofa just has custody.'],care:['把第一步说清楚，会更容易开始。状态不错时，就按原计划来。','A clear first step helps you get going. On a good day, follow your full plan.'],tag:['小步启动','Start small']},
  spark:{name:['热启动型','Quick starter'],code:'SPARK',color:'#a75b3f',soft:'#fbefe7',quote:['周一立志，周二买装备，周三再议。','Monday: big plans. Tuesday: new gear. Wednesday: we’ll see.'],care:['你不缺开始的热情。把安排定得现实一点，更容易一直做下去。','You bring the enthusiasm. A realistic plan helps you keep it going.'],tag:['热情慢慢用','Pace the spark']},
  busy:{name:['忙碌型','Busy bee'],code:'BUSY',color:'#526c83',soft:'#edf1f5',quote:['我不是不想练，我的日程没同意。','I’m willing. My calendar has other ideas.'],care:['给生活留余地。把运动放进一小段空档，变动了也能改。','Leave room for life. Find a small opening; plans can move.'],tag:['见缝动一动','Make a little room']},
  feel:{name:['心情型','Feeling first'],code:'FEEL',color:'#956176',soft:'#fbecf0',quote:['今天能走多远，先问问心情。','How far today? Let me check in with my feelings.'],care:['先问清楚今天的状态，再决定照常练、调整，还是休息。','Check how you feel, then choose your usual session, an adjustment or rest.'],tag:['状态优先','Feelings first']}
 };
 // Lifestyle colors belong to the user; coach colors belong to a separate voice.
 Object.assign(types,{
  steady:{name:['稳稳型','Steady'],code:'STEADY',quote:['按自己的节奏，慢慢也能走很远。','At my own pace, a little goes a long way.'],care:['你已经有自己的节奏。按计划来，偶尔调整也没关系。','You have a rhythm that works. Follow it, with room to adjust.'],tag:['细水长流','Keep a steady rhythm']},
  guide:{name:['攻略型','Overplanner'],code:'PLANNER',quote:['攻略存了十八套，今天还在选第一套。','Eighteen saved routines. Still choosing the first one.'],care:['今天不用找最完美的方案。挑一个合适的，先做五分钟。','No perfect routine needed today. Pick one that fits and try five minutes.'],tag:['攻略够了，先开始','Less research, one first step']}
 });
 const visual={lazy:['#80631c','#faf5e6','moon'],spark:['#a05b2c','#fcf1e7','sun'],busy:['#686095','#f1eff9','clock'],feel:['#865b8e','#f6eef8','heart'],steady:['#397b75','#eaf5f2','leaf'],guide:['#815e49','#f6efe9','move']};
 for(const [id,[color,soft,icon]] of Object.entries(visual))Object.assign(types[id],{color,soft,icon});
 Object.defineProperty(types,'banter',{value:{...types.guide,name:['旧版结果待更新','Earlier result'],code:'RETAKE',icon:'refresh',quote:['这份结果来自旧版测试，重测后再看看你的运动习惯。','This result used an earlier quiz. Retake it to explore your exercise habits.'],care:['旧版聊天偏好不再作为健身人格，请重新测试。','Conversation style is no longer an exercise type. Please retake the quiz.'],tag:['重新了解你的习惯','Time for a fresh result']}});
 const option=(id,zh,en,type)=>({id,label:[zh,en],...(type?{type}: {})});
 const q=(zh,en,options)=>({title:[zh,en],hint:['按最近一两个月的真实情况选就好。','Think about your usual experience over the past month or two.'],options});
 const questions=[
 q('原本打算今晚运动。到家以后，你通常会？','You planned to work out tonight. Once home, you usually…',[
 option('steady','换好衣服，按计划开始','Get changed and start as planned.'),option('lazy','先坐会儿，一坐就不太想起来了','Sit down for a minute… and find it hard to get up.','lazy'),option('busy','先处理别的事，运动往后排','Deal with other things; exercise has to wait.','busy'),option('feel','看今天的心情，再决定练不练','See how I feel before deciding.','feel')]),
 q('刚开始一个新计划，你更像哪一种？','When you start a new routine, what sounds like you?',[
 option('spark','特别有劲，恨不得第一天全做完','I’m excited and want to do everything at once.','spark'),option('steady','安排好每周几次，慢慢照着做','I set a weekly schedule and follow it.'),option('lazy','计划先存着，开始的日子再说','I save the plan. Starting can wait.','lazy'),option('busy','先看看这周能挤出哪些空档','I look for gaps in this week’s schedule.','busy')]),
 q('运动做到一半，什么最容易让你停下来？','Halfway through a session, what most often makes you stop?',[
 option('steady','通常会按自己的节奏做完','I usually finish at my own pace.'),option('spark','开头太猛，后面跟不上了','I start too fast and run out of steam.','spark'),option('busy','突然有事，需要去处理','Something comes up that needs my attention.','busy'),option('feel','心里有事，实在没法专心','Something is on my mind and I can’t focus.','feel')]),
 q('有几天没按计划运动，你通常会怎么想？','After a few days away from your plan, what do you tend to think?',[
 option('steady','没关系，下次接着练','That’s okay. I’ll pick it up next time.'),option('lazy','明天再说吧，然后又拖了一天','Tomorrow… and then tomorrow again.','lazy'),option('spark','重新列个计划，这次一定做到','I’ll make a new plan and really stick to it.','spark'),option('feel','有点自责，连计划都不想看了','I feel guilty and avoid looking at the plan.','feel')]),
 q('如果明天突然忙起来，你更可能？','If tomorrow suddenly gets busy, you’re more likely to…',[
 option('busy','换个时间，或找个短一点的安排','Move the session or choose a shorter one.','busy'),option('steady','用事先留好的备用时间','Use a backup time I already set aside.'),option('spark','还是想把原计划硬塞进去','Try to squeeze in the full plan anyway.','spark'),option('lazy','正好有理由，先不练了','Take it as a reason to skip this one.','lazy')]),
 q('运动前有人来催你，你最常见的反应是？','When someone nudges you to exercise, how do you usually react?',[
 option('lazy','有人叫我一声，确实比较容易开始','A nudge does help me get started.','lazy'),option('feel','要看怎么说，语气不对会更不想动','It depends on the tone; pressure puts me off.','feel'),option('busy','先告诉他我什么时候有空','I tell them when I’ll have time.','busy'),option('steady','我记着呢，到点会自己开始','I’ve got it. I’ll start at my usual time.')]),
 q('什么最容易让你愿意继续运动？','What makes you want to keep going?',[
 option('spark','换个新内容，有点新鲜感','Trying something new keeps it interesting.','spark'),option('lazy','不用想太多，第一步很简单','An easy first step with less to think about.','lazy'),option('feel','有人懂我今天的状态，不催着比较','Someone who understands my day without comparisons.','feel'),option('steady','看到自己慢慢进步','Seeing steady progress over time.')]),
 q('回想最近一个月，哪句话最像你？','Looking back over the past month, which fits best?',[
 option('busy','不是不想动，是真的常常没空','I want to exercise, but my schedule gets in the way.','busy'),option('spark','开始过好几次，很有劲但不太持久','I’ve started with enthusiasm several times, then faded.','spark'),option('feel','状态好的时候能练，心情会影响我','I can do it on good days; my mood makes a difference.','feel'),option('steady','大多数时候能完成，偶尔调整一下','I usually follow through, with occasional adjustments.')]),
 q('如果现在选一个，你最想做什么运动？','Which activity would you most like to do?',[
 option('walk','散步','Walking'),option('stretch','拉伸或舒展','Stretching'),option('cardio','低冲击有氧','Low-impact cardio'),option('strength','力量训练','Strength training')]),
 q('一般情况下，你一次能留出多久？','How much time can you usually set aside for a session?',[
 option('10','10 分钟','10 minutes'),option('20','20 分钟','20 minutes'),option('30','30 分钟','30 minutes')]),
 q('你一般什么时候方便运动？','When does exercise usually fit your day?',[
 option('morning','早上','Morning'),option('midday','中午','Midday'),option('evening','晚上','Evening'),option('flexible','不固定，当天再安排','It varies from day to day')]),
 q('如果以后能提醒你，你希望我怎么做？','If reminders become available, how would you like them?',[
 option('off','不用提醒，我自己来','No reminders; I’ll manage it.'),option('gentle','到点提醒一次就好','One nudge at my chosen time.'),option('regular','没开始的话，可以再问我一次','One reminder, then a follow-up if I haven’t started.'),option('strong','我主动开启时，再多盯我一点','A little more encouragement when I opt in.')])
 ];
 const banterOptions=[
 ['再摸会儿手机；有人逗我两句，可能就起了','Scroll a little longer; a playful nudge might get me up.'],
 ['先跟朋友立个小约定，互相打趣着开练','Make a small pact with a friend and trade jokes as we start.'],
 ['有点无聊，想找个搭子边吐槽边练','I get bored; a buddy to joke with would help.'],
 ['吐槽自己两句，再找人一起接着练','Laugh at my detour, then find a buddy to restart with.'],
 ['找朋友商量个能做到的，还能互相调侃','Agree on something doable with a friend, with a little banter.'],
 ['熟人式吐槽挺管用，别攻击我就行','Friendly teasing works for me, as long as it stays kind.'],
 ['有人能接我的梗，练起来没那么无聊','A buddy who gets my jokes makes it less boring.'],
 ['一个人容易拖，有人边聊边逗就愿意动','I stall alone; playful company gets me moving.']
 ];
 banterOptions.forEach(([zh,en],i)=>questions[i].options.push(option('banter',zh,en,'banter')));
 // Preserve exact earlier scoring and wording before introducing the habit-based quiz.
 const previousQuestions=JSON.parse(JSON.stringify(questions));
 const guideOptions=[
 ['先翻翻收藏的视频，挑来挑去还没开始','Browse saved videos and keep choosing instead of starting.'],
 ['先把攻略看全，计划改了几版还没开练','Research it thoroughly and revise the plan before I ever start.'],
 ['总担心动作做错，停下来反复查教程','Worry about doing it wrong and keep stopping to check tutorials.'],
 ['先研究要不要换方案，研究着又拖了几天','Research a better routine and put off restarting a little longer.'],
 ['想找个更适合的方案，常常挑到没时间练','Look for a better-fitting routine until there’s no time left to do it.'],
 ['先帮我挑一个安排，我总在几套攻略之间犹豫','Help me pick one routine; I get stuck comparing several.'],
 ['有人帮我筛掉多余的攻略，让我直接照着做','Someone narrowing the options so I can just follow one.'],
 ['视频存了不少，真正跟着练的没几次','Lots of saved workouts, not many sessions actually done.']
 ];
 questions.slice(0,8).forEach((q,i)=>{q.options=q.options.filter(o=>o.id!=='banter');q.options.push(option('guide',...guideOptions[i],'guide'));});
 questions[5].options.push(option('witty','友善地吐槽我两句也行，别攻击我就好','Friendly teasing is welcome, as long as it stays kind.'));

 questions[8].hint=['先选最想做的一种，档案里可以多选。','Pick your first choice. You can add more in Profile.'];
 questions[9].hint=['填平时能做到的时间，不用选最久的。','Choose what usually fits, not the longest option.'];
 questions[10].hint=['以后可以在档案里直接修改。','You can change this directly in Profile.'];
 questions[11].hint=['这次只保存偏好，不会开启通知。','This only saves your preference. It does not enable notifications.'];
 const timeLabels={morning:['早上','Morning'],midday:['中午','Midday'],evening:['晚上','Evening'],flexible:['灵活安排','Flexible']};
 const reminderLabels={off:['不用提醒','No reminders'],gentle:['提醒一次','One nudge'],regular:['可以再问一次','A follow-up is welcome'],strong:['主动开启加强督促','Extra support when I opt in']};
 function score(answers,version){
  const qs=version>=4?questions:previousQuestions;
  if(!Array.isArray(answers)||answers.length!==qs.length||answers.some((a,i)=>!qs[i].options.some(o=>o.id===a)))return null;
  if(version===2&&answers.includes('banter'))return null;
  const ids=version===2?['lazy','spark','busy','feel']:version===3?['lazy','spark','busy','feel','steady','banter']:Object.keys(types);
  const scores=Object.fromEntries(ids.map(id=>[id,0]));let steady=0;
  answers.slice(0,8).forEach((a,i)=>{if(version>=4&&i===5)return;const o=qs[i].options.find(o=>o.id===a);if(o.type)scores[o.type]++;else steady++;});
  if(version!==2)scores.steady=steady;
  const balanced=steady>=5,pool=version===2?ids:balanced?['steady']:ids.filter(id=>id!=='steady');
  const max=Math.max(...pool.map(id=>scores[id])),matches=pool.filter(id=>scores[id]===max),type=matches[0];
  const secondary=balanced?[]:pool.filter(id=>id!==type&&scores[id]>0&&scores[id]>=max-1);
  const evidence=answers.slice(0,8).flatMap((a,i)=>{if(version>=4&&i===5)return [];const o=qs[i].options.find(o=>o.id===a);return (balanced?a==='steady':o.type===type)?[i]:[];}).slice(0,2);
  return {version,type,balanced,secondary,mixed:!balanced&&matches.length>1,scores,evidence,answers:[...answers],activities:[answers[8]],minutes:answers[9],preferredTime:answers[10],reminderPreference:answers[11],...(type==='banter'?{needsRetake:true}:{})};
 }
 function result(answers,legacy=false){return score(answers,legacy?2:4);}
 function quizResult(draft){return draft&&[2,3].includes(draft.version)?score(draft.answers,draft.version):result(draft?.answers);}
 function restoreDraft(draft){
  if(!draft||![2,3,4].includes(draft.version)||!['intro','questions','result'].includes(draft.phase)||!Number.isInteger(draft.index)||draft.index<0||draft.index>=questions.length||!Array.isArray(draft.answers)||draft.answers.length>questions.length)return null;
  if(draft.version<4&&draft.phase!=='result')return null;
  if(draft.phase==='result'){if(!quizResult(draft))return null;}
  else if(draft.answers.some((a,i)=>a!=null&&!questions[i].options.some(o=>o.id===a)))return null;
  return {version:draft.version,phase:draft.phase,index:draft.index,answers:[...draft.answers]};
 }
 function evidenceLabels(value){const qs=value.version>=4?questions:previousQuestions;return (value.evidence||[]).map(i=>qs[i].options.find(o=>o.id===value.answers[i])?.label).filter(Boolean);}
 // Read six-question v0.8 results without reclassifying or discarding old profiles.
 const legacyQuestions=[['lazy','spark','busy','feel'],['busy','feel','lazy','spark'],['walk','stretch','cardio','strength'],['10','20','30'],['feel','lazy','spark','busy'],['morning','midday','evening','flexible']];
 function normalize(value){
  if([2,3,4].includes(value?.version)){const r=score(value.answers,value.version);return r?.type===value.type?r:null;}
  const a=value?.answers;if(value?.version!==1||!Array.isArray(a)||a.length!==6||a.some((x,i)=>!legacyQuestions[i].includes(x)))return null;
  const scores=Object.fromEntries(Object.keys(types).map(id=>[id,0]));[0,1,4].forEach(i=>scores[a[i]]++);const m=Math.max(...Object.values(scores)),tied=Object.keys(types).filter(id=>scores[id]===m),type=tied.includes(a[0])?a[0]:tied[0];
  return type===value.type?{version:1,type,answers:[...a],activities:[a[2]],minutes:a[3],preferredTime:a[5],support:a[4]}:null;
 }
 function valid(value){return Boolean(normalize(value));}
 function typeOf(value){return value?.balanced?'steady':value?.type;}
 function recommendCoach(value){
  const r=normalize(value?.lifestyle||value);if(!r||r.needsRetake)return null;
  const type=typeOf(r),id={lazy:'fiery',spark:'calm',busy:'calm',feel:'gentle',steady:'calm',guide:'snark'}[type];
  let coach=id,reason={
   lazy:['帮你把“等会儿”变成“先动两分钟”。','A nudge from “later” to a two-minute start.'],
   spark:['提醒你留点力气，明天还能接着练。','Save some energy for tomorrow’s session.'],
   busy:['少打扰，帮你把运动安排进空档。','Less noise. Movement that fits your day.'],
   feel:['先接住心情，再商量今天怎么练。','Feel heard, then decide what fits today.'],
   steady:['按你的节奏，想聊的时候我就在。','Your rhythm, with company when you want it.'],
   guide:['少纠结哪套最好，先跟着做一小段。','Less comparing. One small routine to start.']
  }[type];
  if(r.version>=2&&r.answers[5]==='feel'){coach='gentle';reason=['你更在意语气，先温柔一点。','A gentler voice, because tone matters to you.'];}
  else if(r.version>=2&&['banter','witty'].includes(r.answers[5])){coach='snark';reason=['你喜欢友善吐槽，这位懂你的梗。','Friendly wit, just as you asked.'];}
  else if(r.version>=2&&r.answers[5]==='steady'){coach='calm';reason=['你习惯自己开始，我就少催一点。','You start on your own. I’ll keep the nudges light.'];}
  return {id:coach,reason,alternatives:['calm','snark','fiery','gentle'].filter(x=>x!==coach)};
 }
 function apply(profile,value){const r=normalize(value);return r?{...profile,lifestyle:r,activities:r.activities,minutes:r.minutes,preferredTime:r.preferredTime,reminderPreference:r.reminderPreference||profile.reminderPreference||'gentle'}:profile;}
 function recommendation(profile){
  if(!valid(profile.lifestyle))return null;
  const action=(profile.activities||[]).find(a=>['walk','stretch','cardio','strength'].includes(a))||'walk',minutes=[10,20,30].includes(Number(profile.minutes))?Number(profile.minutes):20;
  return {type:profile.lifestyle.type,checkIn:false,plan:{type:'original',action,workout:{walk:'walk',stretch:'stretch',cardio:'light',strength:'strength'}[action],minutes,done:false,reminder:false}};
 }
 const api={types,questions,evidenceLabels,timeLabels,reminderLabels,result,quizResult,restoreDraft,normalize,valid,typeOf,recommendCoach,apply,recommendation};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraLifestyle=api;
})(typeof window==='undefined'?globalThis:window);
