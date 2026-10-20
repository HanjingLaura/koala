const assert=require('node:assert/strict');
const {gsap}=require('../vendor/gsap.min.js');
const {createMotion,RIGS,AMPLITUDE}=require('../companion.js');
const before=gsap.globalTimeline.getChildren().length;
const idle=createMotion(gsap);
// Exercise the actual shipped GSAP timelines, including fully closed eyelid holds.
idle.loops[0].totalTime(2.8);assert.equal(idle.values.breath,1);
idle.loops[0].totalTime(6);assert.equal(idle.values.breath,0);
idle.loops[1].totalTime(1.50);assert.equal(idle.values.blink,1);
idle.loops[1].totalTime(1.75);assert.equal(idle.values.blink,0);
idle.loops[1].totalTime(10.50);assert.equal(idle.values.blink,1);
for(const time of [2,6,11]){idle.loops[2].totalTime(time);assert.equal(idle.values.earL,0);assert.equal(idle.values.earR,0);}
idle.loops[2].totalTime(12.28);assert.equal(idle.values.earL,1);assert.equal(idle.values.earR,0);
idle.loops[2].totalTime(12.90);assert.equal(idle.values.earL,0);
for(const time of [15,24,31,34,43,50,55]){idle.loops[2].totalTime(time);assert.equal(idle.values.earL,0);assert.equal(idle.values.earR,0);}
idle.pause(false);assert.ok(idle.loops.every(tl=>!tl.paused()));
idle.greet();assert.ok(idle.loops[1].paused());assert.ok(idle.loops[2].paused());
idle.pause(true);assert.ok(idle.loops.every(tl=>tl.paused()));
const duringPause=gsap.globalTimeline.getChildren().length;idle.greet();assert.equal(gsap.globalTimeline.getChildren().length,duringPause);
idle.destroy();assert.equal(gsap.globalTimeline.getChildren().length,before);
idle.greet();assert.equal(gsap.globalTimeline.getChildren().length,before);
assert.equal(AMPLITUDE.chest,.03);assert.equal(AMPLITUDE.ear,.0105);
for(const rig of Object.values(RIGS)){
 assert.equal(rig.eyes.length,4);assert.ok(rig.eyes.every(v=>v>0&&v<1));
 // Eye regions stay in the face, outside the ear masks and chest support.
 assert.ok(rig.eyes[0]-.054>.31&&rig.eyes[2]+.054<.67);
 assert.ok(rig.eyes[1]+.047<.56&&rig.eyes[3]+.047<.56);
}
gsap.ticker.sleep();
console.log('PASS: real GSAP breath, full blink, return to open, single-ear motion, pause, greeting and teardown. Browser visual QA still required.');
