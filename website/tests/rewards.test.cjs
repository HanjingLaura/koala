const test=require('node:test'),assert=require('node:assert/strict'),cal=require('../daily.js'),r=require('../rewards.js');
const fresh=()=>cal.load(null,'2026-10-20');
test('migration credits dated records once and preserves previously earned backgrounds',()=>{
 const s=fresh();for(let i=0;i<6;i++)s.days[cal.addDays(s.date,-i)]={plan:{type:'original',done:true},logs:[{id:'meal'}]};
 s.days['2026-10-21']={plan:{type:'original',done:true},logs:[{}]};s.days.invalid={plan:{done:true},logs:[{}]};
 r.sync(s);assert.equal(r.balance(s),12);assert.deepEqual(s.wallet.owned,['trail','creek','stars']);assert.equal(s.profile.scene,2);
 const restored=cal.load(JSON.parse(JSON.stringify(s)),s.date);r.sync(restored);assert.equal(r.balance(restored),12);assert.deepEqual(restored.wallet,s.wallet);
});
test('one care and one food leaf per day; toggles, edits and repeat saves never farm leaves',()=>{
 const s=fresh();r.sync(s);assert.equal(r.balance(s),0);cal.complete(s);r.sync(s);assert.equal(r.balance(s),1);
 s.logs.push({id:'a'},{id:'b'});r.sync(s);assert.equal(r.balance(s),2);s.logs.pop();r.sync(s);assert.equal(r.balance(s),2);
 s.logs=[];r.sync(s);assert.equal(r.balance(s),1);s.logs.push({id:'new'});r.sync(s);assert.equal(r.balance(s),2);
 cal.uncomplete(s);r.sync(s);assert.equal(r.balance(s),1);cal.complete(s);r.sync(s);r.sync(s);assert.equal(r.balance(s),2);
});
test('rest selection alone earns nothing; explicit check-in shares the care allowance with training',()=>{
 const s=fresh();r.sync(s);s.plan={type:'rest',done:false};r.sync(s);assert.equal(r.balance(s),0);
 s.days[s.date].restCheckin={mood:'tired'};r.sync(s);assert.equal(r.balance(s),1);
 s.plan={type:'original',done:true};r.sync(s);assert.equal(r.balance(s),1);
 s.plan={type:'rest',done:false};delete s.days[s.date].restCheckin;r.sync(s);assert.equal(r.balance(s),0);
});
test('backdated and future entries cannot earn after migration; no absence penalty or expiry',()=>{
 const s=fresh();r.sync(s);s.days['2026-10-19']={plan:{done:true},logs:[{}]};s.days['2026-10-21']={plan:{done:true},logs:[{}]};r.sync(s);assert.equal(r.balance(s),0);
 s.logs.push({});r.sync(s);cal.activate(s,'2026-11-20');r.sync(s);assert.equal(r.balance(s),1);
});
test('purchase checks price and ownership, corrections preserve purchases and prevent overspending',()=>{
 const s=fresh();s.days['2026-10-19']={plan:{type:'original',done:true},logs:[{}]};s.logs.push({});r.sync(s);
 assert.equal(r.buy(s,'creek'),false);assert.equal(r.buy(s,'invalid'),false);assert.equal(r.buy(s,'bird'),true);assert.equal(r.balance(s),0);assert.equal(r.buy(s,'bird'),false);
 s.logs=[];r.sync(s);assert.equal(r.balance(s),-1);assert.ok(r.owns(s,'bird'));assert.equal(r.buy(s,'creek'),false);
 s.logs.push({});r.sync(s);assert.equal(r.balance(s),0);s.wallet.bird=true;
 const loaded=cal.load(JSON.parse(JSON.stringify(s)),s.date);assert.equal(loaded.wallet.bird,true);assert.ok(r.owns(loaded,'bird'));
});
test('a new local day has its own two-leaf cap',()=>{const s=fresh();r.sync(s);cal.complete(s);s.logs.push({});r.sync(s);cal.activate(s,'2026-10-21');cal.complete(s);s.logs.push({});r.sync(s);assert.equal(r.balance(s),4);});
test('shop, previews, rest check-in and ledger render bilingually without altering state',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
 const c=vm.createContext({structuredClone,console,window:{KoraCoach:require('../coach.js'),KoraRewards:r,KoraDaily:cal,KoraJourney:require('../journey.js'),KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js')},localStorage:{getItem:()=>null},document:{querySelector:()=>({})}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0],c);
 const run=s=>vm.runInContext(s,c);run("openModal=html=>{globalThis.view=html};rewards.init(state)");
 for(const language of ['zh','en'])for(const tab of ['browse','collection','ledger']){run(`state.language='${language}';shopTab='${tab}';shopPreview=null`);const before=run('JSON.stringify(state)');run('showRewards()');assert.equal(run('JSON.stringify(state)'),before);const html=run('view');assert.ok(!html.includes('undefined'));if(language==='en')assert.ok(!/[\u4e00-\u9fff]/.test(html.replace('>中文<','><')));}
 for(const id of ['bird','creek','stars']){run(`shopPreview='${id}';showRewards()`);assert.ok(run('view').includes('disabled'));}
 run("state.plan={type:'rest'};showRestCheckin()");assert.ok(run('view').includes('rest-checkin-form'));assert.ok(!/[\u4e00-\u9fff]/.test(run('view').replace('>中文<','><')));
});
test('a one-off experience credit stays separate from daily rewards and survives reload',()=>{const s=fresh();r.sync(s);s.wallet.ledger.push({id:'cora-local-preview-20261020',date:s.date,kind:'experience',delta:100});r.sync(s);assert.equal(r.balance(s),100);cal.complete(s);s.logs.push({});r.sync(s);assert.equal(r.balance(s),102);const loaded=cal.load(JSON.parse(JSON.stringify(s)),s.date);r.sync(loaded);assert.equal(r.balance(loaded),102);assert.equal(loaded.wallet.ledger.filter(e=>e.kind==='experience').length,1);});
