const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function fixture({paused=false,reduced=false}={}){
 const requests=[],timers=new Map(),listeners=new Map(),observers=[];let serial=0;
 const media={matches:reduced,addEventListener:(n,f)=>listeners.set('media',f),removeEventListener:()=>listeners.delete('media')};
 const doc={hidden:false,addEventListener:(n,f)=>listeners.set('doc',f),removeEventListener:()=>listeners.delete('doc')};
 const events=new Map(),image={complete:true,naturalWidth:384,currentSrc:'assets/web/kora-calm-sport-v2-small.webp',addEventListener:(n,f)=>events.set('img-'+n,f),removeEventListener:n=>events.delete('img-'+n)};
 const canvas={addEventListener:(n,f)=>events.set('canvas-'+n,f),removeEventListener:n=>events.delete('canvas-'+n)};
 const stage={dataset:{koraLive:'calm'},classList:{toggle(){},remove(){}},querySelector:q=>q==='img'?image:canvas,addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
 const context=vm.createContext({document:doc,console,performance:{now:()=>0},gsap:{ticker:{add(){},remove(){}}},matchMedia:()=>media,Image:class{set src(value){requests.push(value);}},IntersectionObserver:class{constructor(fn){this.fn=fn;observers.push(this);}observe(){}disconnect(){this.closed=true;}},requestIdleCallback:fn=>{const id=++serial;timers.set(id,fn);return id;},cancelIdleCallback:id=>timers.delete(id)});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../companion.js'),'utf8'),context);
 const dispose=context.KoraCompanion.mount({querySelectorAll:()=>[stage]},{paused});
 return {requests,timers,listeners,events,observers,doc,media,dispose,show(){observers[0].fn([{isIntersecting:true}]);},flush(){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}};
}
test('eyelids are deferred until visible and idle; cleanup cancels pending initialization',()=>{
 const a=fixture();assert.equal(a.requests.length,0);assert.equal(a.timers.size,0);a.show();assert.equal(a.requests.length,0);assert.equal(a.timers.size,1);a.dispose();assert.equal(a.timers.size,0);assert.equal(a.events.size,0);assert.equal(a.listeners.size,0);assert.equal(a.observers[0].closed,true);
 const b=fixture();b.show();b.flush();assert.deepEqual(b.requests,['assets/web/kora-calm-blink-small.webp']);b.dispose();
});
test('user pause, reduced motion and hidden pages do not request animation frames',()=>{
 for(const options of [{paused:true},{reduced:true}]){const a=fixture(options);a.show();assert.equal(a.requests.length,0);assert.equal(a.timers.size,0);a.dispose();}
 const b=fixture();b.show();b.doc.hidden=true;b.listeners.get('doc')();assert.equal(b.timers.size,0);assert.equal(b.requests.length,0);b.dispose();
});
