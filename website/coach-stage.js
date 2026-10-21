'use strict';
// Scoped GSAP decoration. Recommendation is advisory, never a selection state.
(function(root){
 function createTimeline(gsap,halo,stars){
  const tl=gsap.timeline({paused:true,repeat:-1,repeatDelay:1.4,defaults:{ease:'sine.inOut'}});
  tl.fromTo(halo,{scale:.95,autoAlpha:.65},{scale:1.04,autoAlpha:.95,duration:3.6},0)
    .to(halo,{scale:.95,autoAlpha:.65,duration:3.6},3.6);
  stars.forEach((star,i)=>{
   const at=i*.65;
   tl.fromTo(star,{scale:.75,autoAlpha:.45,y:0},{scale:1.12,autoAlpha:.95,y:-5,duration:1.5},at)
     .to(star,{scale:.8,autoAlpha:.45,y:0,duration:1.9},at+1.5);
  });
  return tl;
 }
 function mount(container,options={}){
  const gsap=root.gsap,stage=container?.querySelector('.coach-spotlight');
  if(!gsap||!stage||options.paused)return ()=>{};
  const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
   const tl=createTimeline(gsap,stage.querySelector('.coach-aura'),Array.from(stage.querySelectorAll('.coach-star')));
   let visible=typeof IntersectionObserver==='undefined';
   const sync=()=>tl.paused(document.hidden||!visible);
   const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync();},{threshold:.15});
   observer?.observe(stage);document.addEventListener('visibilitychange',sync);sync();
   return ()=>{observer?.disconnect();document.removeEventListener('visibilitychange',sync);tl.kill();};
  },stage);
  return ()=>mm.revert();
 }
 const api={createTimeline,mount};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraCoachStage=api;
})(typeof window==='undefined'?globalThis:window);
