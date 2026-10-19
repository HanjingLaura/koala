'use strict';
// Calendar arithmetic uses local noon, avoiding UTC date shifts and DST day lengths.
(function (root) {
  const copy = value => JSON.parse(JSON.stringify(value));
  const snapshot = day => JSON.stringify(day?[day.plan,day.mealDone,day.logs,day.undo,day.comeback||null]:null);
  function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function parseDate(key) { const [y,m,d] = key.split('-').map(Number); return new Date(y,m-1,d,12); }
  function addDays(key, count) { const d=parseDate(key); d.setDate(d.getDate()+count); return dateKey(d); }
  function weekDates(key) { const day=parseDate(key).getDay(); const monday=addDays(key,-((day+6)%7)); return Array.from({length:7},(_,i)=>addDays(monday,i)); }
  function fresh(key=dateKey()) {
    return bind({schema:3,date:key,profile:{name:'Cora',goal:'养成舒服的生活节奏',minutes:'30',noJump:true},days:{},history:[],legacy:null});
  }
  function bind(state) {
    for (const field of ['plan','mealDone','logs','undo']) Object.defineProperty(state,field,{configurable:true,get(){return state.days[state.date][field];},set(value){state.days[state.date][field]=value;}});
    ensureDay(state,state.date);
    return state;
  }
  function ensureDay(state,key) {
    if (!state.days[key]) state.days[key]={plan:null,mealDone:false,logs:[],undo:null};
    return state.days[key];
  }
  function defaultPlan(state) {
    const minutes=[10,20,30].includes(Number(state.profile.minutes))?Number(state.profile.minutes):30;
    return {type:'original',workout:'light',title:`${minutes} 分钟轻运动安排`,minutes,done:false,reminder:true};
  }
  function activate(state,key) {
    state.date=key;
    const day=ensureDay(state,key);
    if (!day.plan) day.plan=defaultPlan(state);
    return state;
  }
  function load(saved,key=dateKey()) {
    if ([2,3].includes(saved?.schema) && saved.profile && saved.days && !Array.isArray(saved.days) && Array.isArray(saved.history)) {
      // Only keys produced by this calendar are admitted as day records.
      const state=fresh(key);
      state.profile={...state.profile,...saved.profile};
      for (const [date,day] of Object.entries(saved.days)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date) && dateKey(parseDate(date))===date && day && Array.isArray(day.logs)) {
          state.days[date]={plan:null,mealDone:false,undo:null,...day};
        }
      }
      state.history=saved.history;
      state.legacy=saved.legacy||null;
      state.language=saved.language||'zh';state.onboarded=Boolean(saved.onboarded);
      return activate(state,key);
    }
    const state=fresh(key);
    if ([1,2].includes(saved?.schema) && saved.profile && saved.plan && Array.isArray(saved.logs)) {
      state.profile={...state.profile,...saved.profile};
      // Legacy plans and meals have no reliable date. Never invent one.
      state.legacy=copy(saved);
      state.language=saved.language||'zh';state.onboarded=Boolean(saved.onboarded);
    }
    return activate(state,key);
  }
  function canReschedule(state) { return !state.days[addDays(state.date,1)]?.plan; }
  function adjust(state,next,reason,at=new Date().toISOString()) {
    if (state.plan.done || state.days[state.date].comeback?.done) return false;
    const tomorrow=addDays(state.date,1);
    if (next.type==='reschedule' && !canReschedule(state)) return false;
    const existingTarget=state.plan.type==='reschedule'?state.plan.targetDate:null;
    if (existingTarget && (state.days[existingTarget]?.plan?.sourceDate!==state.date || state.days[existingTarget].plan.done)) return false;
    const target=next.type==='reschedule'?tomorrow:existingTarget;
    const beforeTarget=target&&state.days[target]?copy(state.days[target]):null;
    const undo={plan:copy(state.plan),historyLength:state.history.length,target,beforeTarget,comeback:copy(state.days[state.date].comeback||null)};
    // Only remove a reservation owned by today's previous adjustment.
    if (existingTarget && state.days[existingTarget]?.plan?.sourceDate===state.date) state.days[existingTarget].plan=null;
    state.plan=copy(next);
    delete state.days[state.date].comeback;
    if (next.type==='reschedule') {
      state.plan.targetDate=tomorrow;
      ensureDay(state,tomorrow).plan={...copy(next),type:'custom',title:`${next.minutes} 分钟轻运动安排`,sourceDate:state.date,done:false,reminder:true};
    }
    undo.afterTarget=target&&state.days[target]?copy(state.days[target]):null;
    state.undo=undo;
    state.history.push({kind:'plan-adjustment',date:state.date,reason,at});
    return true;
  }
  function undo(state) {
    const previous=state.undo;
    if (!previous) return false;
    // A target record edited later must not be silently overwritten.
    if (previous.target) {
      const targetDay=state.days[previous.target];
      if (snapshot(targetDay)!==snapshot(previous.afterTarget)) return false;
      if (previous.beforeTarget) state.days[previous.target]=copy(previous.beforeTarget);
      else delete state.days[previous.target];
    }
    state.plan=copy(previous.plan);
    if(previous.comeback)state.days[state.date].comeback=copy(previous.comeback);
    else delete state.days[state.date].comeback;
    state.history=state.history.slice(0,previous.historyLength);
    state.undo=null;
    return true;
  }
  const api={dateKey,parseDate,addDays,weekDates,fresh,load,activate,adjust,undo,canReschedule};
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  else root.KoraDaily=api;
})(typeof window==='undefined'?globalThis:window);
