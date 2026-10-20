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
    const p=state.profile||{},minutes=[10,20,30].includes(Number(p.minutes))?Number(p.minutes):20;
    const action=(p.activities||[]).find(a=>['walk','stretch','cardio','strength'].includes(a))||'walk';
    return {type:'original',action,workout:{cardio:'light',strength:'strength',stretch:'stretch',walk:'walk'}[action],minutes,done:false,reminder:false};
  }
  function shorter(state,action) {
    const current=state.plan,base=current.type==='rest'||current.type==='reschedule'?defaultPlan(state):current;
    const minutes=Math.max(1,Math.min(10,Math.floor(Number(base.minutes)/2)||1));
    return {...copy(base),type:'short',action:action||base.action||({light:'cardio',strength:'strength',stretch:'stretch'}[base.workout])||'walk',minutes,done:false,reminder:false,session:null};
  }
  function elapsed(plan,now=Date.now()) {
    const s=plan.session;if(!s)return 0;
    return Math.max(0,Number(s.elapsedMs)||0)+(s.running?Math.max(0,now-s.startedAt):0);
  }
  function start(state,now=Date.now()) {
    if(state.plan.done||['rest','reschedule'].includes(state.plan.type))return false;
    if(!state.plan.session?.running)state.plan.session={elapsedMs:elapsed(state.plan,now),startedAt:now,running:true};
    state.undo=null;return true;
  }
  function pause(state,now=Date.now()) {
    if(!state.plan.session?.running)return false;
    state.plan.session={elapsedMs:elapsed(state.plan,now),running:false};return true;
  }
  function complete(state,now=Date.now()) {
    if(state.plan.done||['rest','reschedule'].includes(state.plan.type))return false;
    pause(state,now);state.plan.done=true;state.plan.reminder=false;
    if(state.days[state.date].comeback)state.days[state.date].comeback.done=true;
    state.undo=null;return true;
  }
  function uncomplete(state) {
    if(!state.plan.done)return false;
    state.plan.done=false;state.plan.reminder=false;
    if(state.days[state.date].comeback)state.days[state.date].comeback.done=false;
    state.undo=null;return true;
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
      if(saved.wallet?.version===1)state.wallet=copy(saved.wallet);
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
  function adjust(state,next,reason,at=new Date().toISOString(),options={}) {
    if (state.plan.done || state.days[state.date].comeback?.done) return false;
    const tomorrow=addDays(state.date,1);
    if (next.type==='reschedule' && !canReschedule(state)) return false;
    const existingTarget=state.plan.type==='reschedule'?state.plan.targetDate:null;
    if (existingTarget && options.cancelReservation && (state.days[existingTarget]?.plan?.sourceDate!==state.date || state.days[existingTarget].plan.done || state.days[existingTarget].comeback)) return false;
    const target=next.type==='reschedule'?tomorrow:existingTarget;
    const beforeTarget=target&&state.days[target]?copy(state.days[target]):null;
    const undo={plan:copy(state.plan),historyLength:state.history.length,target,beforeTarget,comeback:copy(state.days[state.date].comeback||null)};
    if(undo.plan.session?.running)undo.plan.session={elapsedMs:elapsed(undo.plan,Date.parse(at)||Date.now()),running:false};
    // Only remove a reservation owned by today's previous adjustment.
    if (existingTarget && options.cancelReservation && state.days[existingTarget]?.plan?.sourceDate===state.date) state.days[existingTarget].plan=null;
    state.plan=copy(next);
    delete state.plan.session;delete state.plan.sourceDate;delete state.plan.targetDate;
    delete state.days[state.date].comeback;
    if (next.type==='reschedule') {
      state.plan.targetDate=tomorrow;
      ensureDay(state,tomorrow).plan={...copy(state.plan),type:'custom',sourceDate:state.date,done:false,reminder:false};
      delete state.days[tomorrow].plan.targetDate;delete state.days[tomorrow].plan.session;
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
  const api={defaultPlan,shorter,elapsed,start,pause,complete,uncomplete,dateKey,parseDate,addDays,weekDates,fresh,load,activate,adjust,undo,canReschedule};
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  else root.KoraDaily=api;
})(typeof window==='undefined'?globalThis:window);
