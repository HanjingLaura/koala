/* Shared bounded, non-identifying chat context and suggestion contracts. */
(function(root){
 'use strict';
 const cal=typeof module!=='undefined'&&module.exports?require('./daily.js'):root.KoraDaily;
 const actions=['walk','stretch','cardio','strength'],types=['original','short','custom','rest','reschedule'];
 const keys=(o,allowed)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>allowed.includes(k));
 const date=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&cal.dateKey(cal.parseDate(d))===d;
 function plan(p){return p?{type:types.includes(p.type)?p.type:'original',action:actions.includes(p.action)?p.action:'walk',minutes:Math.max(0,Math.min(180,Number(p.minutes)||0)),done:Boolean(p.done),session:p.session?(p.session.running?'running':'paused'):'not_started'}:null;}
 function build(s){return {date:s.date,preferences:{activities:(s.profile.activities||[]).filter(a=>actions.includes(a)),minutes:Math.max(1,Math.min(180,Number(s.profile.minutes)||20)),noJump:Boolean(s.profile.noJump)},today:plan(s.plan),recent:Array.from({length:7},(_,i)=>{const d=cal.addDays(s.date,i-6),v=s.days[d];return {date:d,status:v?'recorded':'unrecorded',plan:plan(v?.plan),mealCount:v?.logs?.length||0};})};}
 function validPlan(p){return p===null||keys(p,['type','action','minutes','done','session'])&&types.includes(p.type)&&actions.includes(p.action)&&Number.isFinite(p.minutes)&&p.minutes>=0&&p.minutes<=180&&typeof p.done==='boolean'&&['running','paused','not_started'].includes(p.session);}
 function validate(c){return Boolean(keys(c,['date','preferences','today','recent'])&&date(c.date)&&keys(c.preferences,['activities','minutes','noJump'])&&Array.isArray(c.preferences.activities)&&c.preferences.activities.length<=4&&c.preferences.activities.every(a=>actions.includes(a))&&Number.isFinite(c.preferences.minutes)&&c.preferences.minutes>=1&&c.preferences.minutes<=180&&typeof c.preferences.noJump==='boolean'&&validPlan(c.today)&&Array.isArray(c.recent)&&c.recent.length===7&&c.recent.every((r,i)=>keys(r,['date','status','plan','mealCount'])&&r.date===cal.addDays(c.date,i-6)&&['recorded','unrecorded'].includes(r.status)&&validPlan(r.plan)&&Number.isInteger(r.mealCount)&&r.mealCount>=0&&r.mealCount<=10000));}
 function validSuggestion(s){return Boolean(keys(s,['action'])&&['shorten','rest','reschedule'].includes(s.action));}
 function fingerprint(s){return JSON.stringify([s.date,s.plan,s.days[cal.addDays(s.date,1)]||null,s.days[s.date]?.comeback||null]);}
 function current(s,base){return base===fingerprint(s);}
 function proposal(s,suggestion){if(!validSuggestion(suggestion)||!s.plan||s.plan.done||s.days[s.date]?.comeback?.done)return null;if(suggestion.action==='shorten'){if(['rest','reschedule'].includes(s.plan.type))return null;return cal.shorter(s);}if(suggestion.action==='rest')return {type:'rest',minutes:0,done:false,reminder:false};return {...(['rest','reschedule'].includes(s.plan.type)?cal.defaultPlan(s):s.plan),type:'reschedule',done:false,reminder:false};}
 const api={build,validate,validSuggestion,fingerprint,current,proposal};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraChatContext=api;
})(typeof window==='undefined'?globalThis:window);
