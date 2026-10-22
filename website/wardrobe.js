/* Clothing is permanent; previews never mutate wallet or equipment. */
(function(root){
 'use strict';
 const rewards=typeof module!=='undefined'&&module.exports?require('./rewards.js'):root.KoraRewards;
 const items=[{id:'hoodie',price:4,name:['日常卫衣','Everyday hoodie']},{id:'sport',price:8,name:['运动背带装','Sport overalls']},{id:'camp',price:12,name:['露营外套','Camping jacket']}];
 const eyeRigs={calm:{hoodie:[.3852,.3868,.5877,.4288],sport:[.385,.3865,.5876,.4287],camp:[.3863,.3876,.5874,.4285]},gentle:{hoodie:[.4007,.379,.5841,.4558],sport:[.4009,.3792,.5837,.4553],camp:[.4019,.3789,.5848,.455]},snark:{hoodie:[.3981,.3924,.5933,.4581],sport:[.398,.3923,.5938,.458],camp:[.398,.3923,.5934,.458]},fiery:{hoodie:[.4041,.3971,.5989,.426],sport:[.4044,.397,.5989,.4259],camp:[.4037,.397,.599,.426]}};
 const coaches=['calm','snark','fiery','gentle'];
 function init(s){if(!s.wardrobe||!Array.isArray(s.wardrobe.owned)){s.wardrobe={owned:['original'],equipped:'original'};return true;}const old=JSON.stringify(s.wardrobe);s.wardrobe.owned=[...new Set(['original',...s.wardrobe.owned.filter(id=>items.some(i=>i.id===id))])];if(!s.wardrobe.owned.includes(s.wardrobe.equipped))s.wardrobe.equipped='original';return old!==JSON.stringify(s.wardrobe);}
 function owns(s,id){return id==='original'||Boolean(Array.isArray(s.wardrobe?.owned)&&s.wardrobe.owned.includes(id));}
 function equip(s,id){init(s);if(!owns(s,id))return false;s.wardrobe.equipped=id;return true;}
 function buy(s,id){const item=items.find(i=>i.id===id);rewards.sync(s);init(s);if(!item||owns(s,id)||rewards.balance(s)<item.price)return false;s.wallet.ledger.push({date:s.date,kind:'purchase',item:'outfit-'+id,delta:-item.price});s.wardrobe.owned.push(id);s.wardrobe.equipped=id;return true;}
 function resolve(s,coach,preview){const key=coaches.includes(coach)?coach:'calm',id=preview===undefined?(owns(s,s.wardrobe?.equipped)?s.wardrobe?.equipped:'original'):preview;const fallback=`assets/web/kora-${key}-sport-${['snark','fiery'].includes(key)?'v4':'v2'}`;const stem=items.some(i=>i.id===id)?`assets/web/outfits/${key}-${id}`:fallback;return {open:stem+'.webp',small:stem+'-small.webp',closed:stem===fallback?`assets/web/kora-${key}-blink.webp`:stem+'-blink.webp',closedSmall:stem===fallback?`assets/web/kora-${key}-blink-small.webp`:stem+'-blink-small.webp',eyes:eyeRigs[key]?.[id],fallback:fallback+'.webp',fallbackSmall:fallback+'-small.webp',coach:key,outfit:stem===fallback?'original':id};}
 const api={items,init,owns,equip,buy,resolve};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraWardrobe=api;
})(typeof window==='undefined'?globalThis:window);
