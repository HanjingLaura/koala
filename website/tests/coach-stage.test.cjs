const test=require('node:test');
const assert=require('node:assert/strict');
const {gsap}=require('../vendor/gsap.min.js');
const {createTimeline,mount}=require('../coach-stage.js');
test('actual GSAP star sequence breathes slowly, pauses and releases its tweens',()=>{
 const before=gsap.globalTimeline.getChildren().length;
 const halo={scale:1,autoAlpha:1},stars=Array.from({length:5},()=>({scale:1,autoAlpha:1,y:0}));
 const tl=createTimeline(gsap,halo,stars);assert.equal(tl.paused(),true);assert.equal(tl.duration(),7.2);
 tl.totalTime(1.5);assert.equal(stars[0].autoAlpha,.95);assert.equal(stars[0].y,-5);
 tl.totalTime(3.6);assert.equal(halo.scale,1.04);tl.totalTime(7.2);assert.equal(halo.scale,.95);
 tl.kill();assert.equal(gsap.globalTimeline.getChildren().length,before);
});
test('offscreen and hidden pages pause; reduced-motion and user-pause stay static; disposal removes listeners',()=>{
 let timeline,cleanup,intersect,reduce=false;const listeners=new Map();
 global.gsap={timeline:o=>(timeline=gsap.timeline(o)),matchMedia:()=>({add(query,fn){if(!reduce)cleanup=fn();},revert(){cleanup?.();cleanup=null;}})};
 global.document={hidden:false,addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:n=>listeners.delete(n)};
 global.IntersectionObserver=class{constructor(fn){intersect=fn;}observe(){}disconnect(){intersect=null;}};
 const halo={scale:1,autoAlpha:1},stars=[{scale:1,autoAlpha:1,y:0}],stage={querySelector:()=>halo,querySelectorAll:()=>stars},container={querySelector:()=>stage};
 const dispose=mount(container);assert.equal(timeline.paused(),true);
 intersect([{isIntersecting:true}]);assert.equal(timeline.paused(),false);
 document.hidden=true;listeners.get('visibilitychange')();assert.equal(timeline.paused(),true);
 dispose();assert.equal(listeners.size,0);assert.equal(intersect,null);
 timeline=null;reduce=true;mount(container)();assert.equal(timeline,null);
 reduce=false;mount(container,{paused:true})();assert.equal(timeline,null);
 delete global.gsap;delete global.document;delete global.IntersectionObserver;gsap.ticker.sleep();
});
