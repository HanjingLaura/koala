/* Browser-local leaves. One care leaf + one food leaf per date; purchases are unique. */
(function(root){
 'use strict';
 const cal=typeof module!=='undefined'&&module.exports?require('./daily.js'):root.KoraDaily;
 const items=[{id:'trail',price:0,scene:0},{id:'bird',price:3},{id:'creek',price:6,scene:1},{id:'stars',price:12,scene:2}];
 const valid=k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&cal.dateKey(cal.parseDate(k))===k;
 function earned(day,kind){if(kind==='food')return Boolean(day?.logs?.length);return Boolean(day?.plan&&((day.plan.done&&!['rest','reschedule'].includes(day.plan.type))||(day.plan.type==='rest'&&day.restCheckin?.mood)));}
 function init(state){
  if(state.wallet?.version===1)return false;
  const completed=Object.entries(state.days).filter(([d,v])=>valid(d)&&d<=state.date&&v.plan?.done&&!['rest','reschedule'].includes(v.plan.type)).length;
  if(!Number.isInteger(Number(state.profile.scene)))state.profile.scene=Math.min(2,Math.floor(completed/3));
  state.wallet={version:1,migratedOn:state.date,claims:{},ledger:[],owned:['trail',...(completed>=3?['creek']:[]),...(completed>=6?['stars']:[])],bird:false};
  for(const date of Object.keys(state.days).filter(k=>valid(k)&&k<=state.date).sort())for(const kind of ['care','food'])if(earned(state.days[date],kind))setClaim(state,date,kind,1,'migration');
  return true;
 }
 function setClaim(state,date,kind,value,reason){const key=date+':'+kind,w=state.wallet,old=w.claims[key]||0;if(old===value)return 0;w.claims[key]=value;w.ledger.push({date:state.date,sourceDate:date,kind,delta:value-old,reason});return value-old;}
 function sync(state){const migrated=init(state);let delta=0,changed=migrated;
  // Only today's records can create new rewards. Existing claims may be corrected.
  const keys=new Set([...Object.keys(state.wallet.claims),state.date+':care',state.date+':food']);
  for(const key of keys){const [date,kind]=key.split(':');const value=earned(state.days[date],kind)?1:0;const old=state.wallet.claims[key]||0;if(date!==state.date&&value>old)continue;const d=setClaim(state,date,kind,value,value?'earned':'correction');if(d){delta+=d;changed=true;}}
  return {changed,gained:migrated?0:Math.max(0,delta)};
 }
 function balance(state){return (state.wallet?.ledger||[]).reduce((n,e)=>n+e.delta,0);}
 function owns(state,id){return Boolean(state.wallet?.owned.includes(id));}
 function buy(state,id){sync(state);const item=items.find(x=>x.id===id);if(!item||owns(state,id)||balance(state)<item.price)return false;state.wallet.owned.push(id);state.wallet.ledger.push({date:state.date,kind:'purchase',item:id,delta:-item.price});return true;}
 const api={items,init,sync,balance,owns,buy,earned};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraRewards=api;
})(typeof window==='undefined'?globalThis:window);
