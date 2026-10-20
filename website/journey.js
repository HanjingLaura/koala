/* Read-only progress summaries; calendar plans remain the source of truth. */
(function(root){
 'use strict';
 const cal=typeof module!=='undefined'&&module.exports?require('./daily.js'):root.KoraDaily;
 const valid=k=>typeof k==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(k)&&cal.dateKey(cal.parseDate(k))===k;
 const action=p=>p?.action||({light:'cardio',strength:'strength',stretch:'stretch',walk:'walk'}[p?.workout])||'cardio';
 function entries(state){return Object.keys(state.days).filter(k=>valid(k)&&k<=state.date).sort().map(date=>{const d=state.days[date],p=d.plan;return {date,day:d,plan:p,done:Boolean(p?.done&&!['rest','reschedule'].includes(p.type)),rest:p?.type==='rest',meal:Boolean(d.mealDone||d.logs?.length),adjusted:state.history.some(h=>h.date===date&&h.kind==='plan-adjustment')};});}
 function completed(state){return entries(state).filter(e=>e.done);}
 function weekNodes(state,offset=0){
  return cal.weekDates(cal.addDays(state.date,offset*7)).map(date=>{const day=state.days[date],plan=day?.plan,today=date===state.date,future=date>state.date;
   const kind=plan?.type==='rest'?'rest':plan?.type==='reschedule'?'moved':!future&&plan?.done?'done':future?(plan?'planned':'future'):(day?.logs?.length||day?.mealDone||day?.comeback||plan?.session||state.history.some(h=>h.date===date&&h.kind==='plan-adjustment')?'recorded':'empty');
   return {date,plan:plan||null,today,future,kind};
  });
 }
 function range(today,kind='week',offset=0){
  if(kind==='month'){const d=cal.parseDate(today);const first=new Date(d.getFullYear(),d.getMonth()+offset,1,12),last=new Date(first.getFullYear(),first.getMonth()+1,0,12);return {start:cal.dateKey(first),end:cal.dateKey(last)};}
  const days=cal.weekDates(cal.addDays(today,offset*7));return {start:days[0],end:days[6]};
 }
 function report(state,kind='week',offset=0){
  const bounds=range(state.date,kind,offset),rows=entries(state).filter(e=>e.date>=bounds.start&&e.date<=bounds.end),done=rows.filter(e=>e.done),types={};
  let timedMs=0,timedCount=0;
  for(const e of done){types[action(e.plan)]=(types[action(e.plan)]||0)+1;const s=e.plan.session,ms=Number(s?.elapsedMs);if(s&&!s.running&&Number.isFinite(ms)&&ms>0){timedMs+=ms;timedCount++;}}
  const recorded=rows.filter(e=>e.done||e.rest||e.meal||e.adjusted||e.day.comeback||Number(e.plan?.session?.elapsedMs)>0||e.plan?.session?.running);
  return {...bounds,kind,offset,partial:bounds.end>=state.date,done,completed:done.length,rest:rows.filter(e=>e.rest).length,mealDays:rows.filter(e=>e.meal).length,adjustedDays:rows.filter(e=>e.adjusted).length,recordedDays:recorded.length,timedMs,timedCount,untimedCount:done.length-timedCount,types,shortDone:done.filter(e=>['short','tiny'].includes(e.plan.type)).length};
 }
 function suggestedMinutes(state,r){return r.completed>=2&&r.shortDone>=Math.ceil(r.completed/2)?10:cal.defaultPlan(state).minutes;}
 function scheduleDraft(state,dates,minutes,activity){
  const next=range(state.date,'week',1),unique=[...new Set(dates)].sort();
  if(!unique.length||unique.length>7||!unique.every(k=>valid(k)&&k>=next.start&&k<=next.end)||![10,20,30].includes(Number(minutes))||!['cardio','strength','stretch','walk'].includes(activity))return null;
  return {createdOn:state.date,dates:unique,minutes:Number(minutes),activity,base:unique.map(k=>JSON.stringify(state.days[k]?.plan||null))};
 }
 function applySchedule(state,draft){
  if(!draft||!Array.isArray(draft.base)||!Array.isArray(draft.dates)||draft.createdOn!==state.date||!scheduleDraft(state,draft.dates,draft.minutes,draft.activity))return {ok:false,reason:'stale'};
  if(draft.dates.some((k,i)=>JSON.stringify(state.days[k]?.plan||null)!==draft.base[i]))return {ok:false,reason:'stale'};
  const added=[],kept=[];
  for(const date of draft.dates){if(state.days[date]?.plan){kept.push(date);continue;}state.days[date]||={plan:null,mealDone:false,logs:[],undo:null};state.days[date].plan={type:'custom',action:draft.activity,workout:{cardio:'light',strength:'strength',stretch:'stretch',walk:'walk'}[draft.activity],minutes:draft.minutes,done:false,reminder:false,source:'report'};added.push(date);}
  return {ok:true,added,kept};
 }
 function cancelScheduled(state,date){const d=state.days[date];if(!valid(date)||date<=state.date||d?.plan?.source!=='report'||d.plan.done||d.comeback)return false;d.plan=null;return true;}
 const api={entries,completed,weekNodes,range,report,suggestedMinutes,scheduleDraft,applySchedule,cancelScheduled,action};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraJourney=api;
})(typeof window==='undefined'?globalThis:window);
