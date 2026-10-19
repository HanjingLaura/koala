'use strict';
// A playful, transparent preference quiz. Never a psychological or health assessment.
(function(root){
 const types={
  lazy:{name:['省电型','Energy saver'],code:'LAZY',color:'#657657',soft:'#f0f2e9',quote:['不是没有梦想，是沙发暂时扣留了我。','I have dreams. The sofa just has custody.'],care:['开始的门槛，越低越好。先做一点，做完就停。','Make starting easy. Do a little, then let that be enough.'],tag:['小步启动','Start small']},
  spark:{name:['热启动型','Quick starter'],code:'SPARK',color:'#a75b3f',soft:'#fbefe7',quote:['周一立志，周二买装备，周三再议。','Monday: big plans. Tuesday: new gear. Wednesday: we’ll see.'],care:['热情留一点给明天。今天先选一小段，不追加任务。','Save a little enthusiasm for tomorrow. One short session, no extras.'],tag:['热情慢慢用','Pace the spark']},
  busy:{name:['忙碌型','Busy bee'],code:'BUSY',color:'#526c83',soft:'#edf1f5',quote:['我不是不想练，我的日程没同意。','I’m willing. My calendar has other ideas.'],care:['给生活留余地。把运动放进一小段空档，变动了也能改。','Leave room for life. Find a small opening; plans can move.'],tag:['见缝动一动','Make a little room']},
  feel:{name:['心情型','Feeling first'],code:'FEEL',color:'#956176',soft:'#fbecf0',quote:['今天能走多远，先问问心情。','How far today? Let me check in with my feelings.'],care:['先听听今天的你。动一点或休息，都可以一起商量。','Listen to yourself first. Movement or rest: we can decide together.'],tag:['状态优先','Feelings first']}
 };
 const option=(id,zh,en,extra={})=>({id,label:[zh,en],...extra});
 const questions=[
  {title:['终于到家了，你的第一反应是？','Home at last. What’s your first move?'],hint:['选最像平时的你，不用选“最自律”的答案。','Choose the everyday you, not the most disciplined answer.'],options:[option('lazy','先和沙发合体，什么都晚点说','Become one with the sofa. Everything else can wait.',{type:'lazy'}),option('spark','新装备到货了！今天要练个大的','New gear is here! Time for an ambitious workout.',{type:'spark'}),option('busy','看眼日程，还能挤出多少时间','Check my calendar for a little breathing room.',{type:'busy'}),option('feel','先感受一下，今天的心情怎么样','Check in with how I’m feeling today.',{type:'feel'})]},
  {title:['计划断了三天，你更可能……','Three days off your plan. You’re likely to…'],hint:['空白的日子不扣分，我们只是想更懂你。','No points lost for a pause. We’re getting to know you.'],options:[option('busy','一直等一个没那么忙的日子','Wait for a less busy day.',{type:'busy'}),option('feel','有点自责，更不想打开计划了','Feel bad and avoid opening the plan.',{type:'feel'}),option('lazy','想着明天吧，然后又是明天','Think “tomorrow”… and then tomorrow again.',{type:'lazy'}),option('spark','立刻写一个更厉害的新计划','Write an even more ambitious new plan.',{type:'spark'})]},
  {title:['给你一小段自己的时间，想怎么动？','A little time for yourself. How would you move?'],hint:['这会成为你的运动偏好，之后随时能改。','This becomes your movement preference. You can change it later.'],options:[option('walk','散散步，顺便看看天','Take a walk and look at the sky.'),option('stretch','舒展一下，让身体松下来','Stretch gently and unwind.'),option('cardio','跟着节奏，做点低冲击有氧','Find a rhythm with low-impact cardio.'),option('strength','练一点力量，感受身体发力','Try a little strength work.')]},
  {title:['普通的一天，能给自己留多久？','On an ordinary day, how much time fits?'],hint:['按现实来，不用按理想中的自己来。','Think real life, not an ideal version of you.'],options:[option('10','十分钟以内，碎片时间也算','Up to 10 minutes. Little pockets count.'),option('20','大概二十分钟，舒服就好','Around 20 minutes, at a comfortable pace.'),option('30','三十分钟左右，有余地慢慢来','Around 30 minutes, with room to take it slowly.')]},
  {title:['不想开始时，哪句话最能接住你？','When starting feels hard, what would help?'],hint:['这是你需要的支持方式，搭子的说话语气稍后再选。','This is the support you need. Choose Kora’s voice next.'],options:[option('feel','“先不练也行。想说说今天吗？”','“We can pause. Want to talk about today?”',{type:'feel'}),option('lazy','“就一点点，做完就可以停。”','“Just a tiny step. Then you can stop.”',{type:'lazy'}),option('spark','“别一次用光热情，今天这些就够。”','“Save some enthusiasm. This is enough today.”',{type:'spark'}),option('busy','“计划配合你，有事我们就调整。”','“The plan fits you. If life changes, we adjust.”',{type:'busy'})]},
  {title:['哪段时间，更像是属于你的？','What part of the day feels most like yours?'],hint:['只记录偏好，不会自动开启通知。','A preference only. This does not enable notifications.'],options:[option('morning','早一点，趁世界还没忙起来','Morning, before the world gets busy.'),option('midday','午间，给自己一个小间隙','Midday, a little pause for myself.'),option('evening','晚上，忙完之后慢慢来','Evening, after the day settles.'),option('flexible','不固定，跟着当天的生活走','It varies. Let the day decide.')]}
 ];
 const timeLabels={morning:['早间','Morning'],midday:['午间','Midday'],evening:['晚间','Evening'],flexible:['灵活安排','Flexible']};
 function result(answers){
  if(!Array.isArray(answers)||answers.length!==questions.length||answers.some((a,i)=>!questions[i].options.some(o=>o.id===a)))return null;
  const scores=Object.fromEntries(Object.keys(types).map(id=>[id,0]));
  [0,1,4].forEach(i=>scores[questions[i].options.find(o=>o.id===answers[i]).type]++);
  const max=Math.max(...Object.values(scores)),tied=Object.keys(types).filter(id=>scores[id]===max);
  // A tie uses the user's first everyday-life answer, never body measurements.
  const type=tied.includes(answers[0])?answers[0]:tied[0];
  return {version:1,type,answers:[...answers],activities:[answers[2]],minutes:answers[3],preferredTime:answers[5],support:answers[4]};
 }
 function valid(value){const r=result(value?.answers);return value?.version===1&&r?.type===value.type;}
 function apply(profile,value){if(!valid(value))return profile;const r=result(value.answers);return {...profile,lifestyle:r,activities:r.activities,minutes:r.minutes};}
 function recommendation(profile){
  if(!valid(profile.lifestyle))return null;
  const type=profile.lifestyle.type,action=['walk','stretch','cardio','strength'].find(a=>profile.activities?.includes(a))||'walk';
  if(type==='feel')return {type,checkIn:true};
  const minutes=type==='lazy'?(action==='stretch'?1:2):type==='spark'?5:Math.min(Number(profile.minutes)||10,10);
  return {type,checkIn:false,plan:{type:'starter',action,minutes,done:false,reminder:false}};
 }
 const api={types,questions,timeLabels,result,valid,apply,recommendation};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.KoraLifestyle=api;
})(typeof window==='undefined'?globalThis:window);
