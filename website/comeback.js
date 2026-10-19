/* Explicit check-ins only: opening the page never counts as an action. */
(function(root){
 'use strict';
 const calendar=typeof module!=='undefined'&&module.exports?require('./daily.js'):root.KoraDaily;
 const copy=value=>JSON.parse(JSON.stringify(value));
 const energies=['ready','low','rest'], reasons=['time','tired','return','guilt'];
 const options={ready:['keep'],low:['walk','stretch'],rest:['pause']};
 function fingerprint(state){return JSON.stringify([state.plan,state.days[state.date].comeback||null]);}
 function begin(state,energy){if(!energies.includes(energy))return null;return {date:state.date,base:fingerprint(state),energy,reason:'return',action:options[energy][0]};}
 function plan(state,draft){
  if(draft.energy==='ready')return copy(state.plan);
  if(draft.energy==='rest')return {type:'rest',minutes:0,done:false,reminder:false};
  return {type:'tiny',action:draft.action,minutes:draft.action==='walk'?2:1,done:false,reminder:false};
 }
 function confirm(state,draft){
  if(!draft||draft.date!==state.date||draft.base!==fingerprint(state))return false;
  if(!energies.includes(draft.energy)||!reasons.includes(draft.reason)||!options[draft.energy].includes(draft.action))return false;
  // Never replace a completed action or accidentally reschedule an existing reservation.
  if(state.plan.done||state.days[state.date].comeback?.done)return false;
  if(draft.energy==='ready'){
   state.undo={plan:copy(state.plan),historyLength:state.history.length,comeback:copy(state.days[state.date].comeback||null)};
   state.history.push({kind:'check-in',date:state.date,reason:draft.reason,at:new Date().toISOString()});
  }else if(!calendar.adjust(state,plan(state,draft),'comeback:'+draft.reason))return false;
  state.days[state.date].comeback={energy:draft.energy,reason:draft.reason,action:draft.action,done:false,at:new Date().toISOString()};
  return true;
 }
 function complete(state){
  const day=state.days[state.date];if(!day.comeback||day.comeback.done||day.plan?.type==='reschedule')return false;
  day.comeback.done=true;if(day.plan.type!=='rest'){day.plan.done=true;day.plan.reminder=false;}
  state.undo=null;return true;
 }
 function records(state){
  return Object.keys(state.days).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&date<=state.date&&calendar.dateKey(calendar.parseDate(date))===date).sort().flatMap(date=>{
   const day=state.days[date],done=day.plan?.done||day.comeback?.done;
   const changed=state.history.some(h=>h.date===date&&(h.kind==='plan-adjustment'||h.kind==='check-in'));
   if(!done&&!day.comeback&&!changed&&!day.mealDone&&!day.logs?.length)return [];
   const kind=done?(day.plan?.type==='rest'?'care':'action'):day.comeback?.energy==='rest'?'rest':day.comeback?'checkin':changed?'adjust':'meal';
   return [{date,kind,done:Boolean(done)}];
  });
 }
 function gap(a,b){const x=calendar.parseDate(a),y=calendar.parseDate(b);return Math.round((Date.UTC(y.getFullYear(),y.getMonth(),y.getDate())-Date.UTC(x.getFullYear(),x.getMonth(),x.getDate()))/86400000)-1;}
 function returnInsight(state){
  const dates=records(state).filter(r=>r.done).map(r=>r.date),gaps=[];
  for(let i=1;i<dates.length;i++){const days=gap(dates[i-1],dates[i]);if(days>0)gaps.push({date:dates[i],days});}
  if(!gaps.length||gaps.at(-1).date!==state.date)return null;
  return {days:gaps.at(-1).days,previous:gaps.length>1?gaps.at(-2).days:null};
 }
 const api={begin,plan,confirm,complete,records,returnInsight,gap};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraComeback=api;
})(typeof window==='undefined'?globalThis:window);
