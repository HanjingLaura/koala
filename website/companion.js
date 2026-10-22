/* Kora live companion: GSAP timing + local WebGL deformation, original PNG fallback. */
(function(global){
 'use strict';
 const RIGS={
  calm:{eyes:[.382,.386,.594,.432],left:[.22,.25],right:[.80,.35]},
  snark:{eyes:[.400,.392,.596,.458],left:[.25,.24],right:[.81,.39]},
  fiery:{eyes:[.403,.397,.603,.429],left:[.23,.25],right:[.81,.32]},
  gentle:{eyes:[.399,.379,.589,.459],left:[.25,.24],right:[.81,.40]},
  'life-lazy':{eyes:[.417,.328,.580,.386],left:[.30,.23],right:[.81,.34],chest:.012,ear:0},
  'life-spark':{eyes:[.384,.380,.591,.421],left:[.28,.25],right:[.82,.36],chest:.016,ear:0},
  'life-busy':{eyes:[.384,.379,.592,.427],left:[.27,.26],right:[.81,.36],chest:.012,ear:0},
  'life-feel':{eyes:[.391,.383,.582,.454],left:[.28,.25],right:[.82,.36],chest:.012,ear:0},
  'life-steady':{eyes:[.378,.375,.595,.416],left:[.27,.25],right:[.82,.35],chest:.012,ear:0},
  'life-guide':{eyes:[.381,.374,.586,.420],left:[.27,.25],right:[.82,.35],chest:.012,ear:0}
 };
 // Gentle local motion: one fifth of the previous amplitude; never whole-image scale.
 const AMPLITUDE={chest:.03,ear:.0105};
 function blink(tl,v,at){
  return tl.to(v,{blink:1,duration:.10,ease:'power1.in'},at)
   .to(v,{blink:1,duration:.075})
   .to(v,{blink:0,duration:.17,ease:'power1.out'});
 }
 function ear(tl,v,key,at){
  return tl.to(v,{[key]:1,duration:.28,ease:'power2.out'},at)
   .to(v,{[key]:-.08,duration:.18,ease:'sine.inOut'})
   .to(v,{[key]:0,duration:.34,ease:'sine.out'});
 }
 function createMotion(gsap,phase=0){
  const values={breath:0,blink:0,earL:0,earR:0};
  const breath=gsap.timeline({repeat:-1,paused:true,defaults:{ease:'sine.inOut'}})
   .to(values,{breath:1,duration:2.8}).to(values,{breath:0,duration:3.2});
  const eyes=gsap.timeline({repeat:-1,paused:true});
  [1.35,5.6,9.8,10.35].forEach(at=>blink(eyes,values,at));
  eyes.to(values,{blink:0,duration:2.4});
  const ears=gsap.timeline({repeat:-1,paused:true});
  // First twitch after 12 s; subsequent onsets are 20 / 24 s apart.
  ear(ears,values,'earL',12);ear(ears,values,'earR',32);
  ears.to(values,{earR:0,duration:11.2});
  if(phase){breath.totalTime(phase%6);eyes.totalTime(phase%12);ears.totalTime(phase%40);}
  let greeting=null,paused=true,dead=false;
  const loops=[breath,eyes,ears];
  return {values,loops,
   pause(value){paused=value;if(dead)return;breath.paused(value);if(greeting)greeting.paused(value);else{eyes.paused(value);ears.paused(value);}},
   greet(){if(paused||dead)return;greeting?.kill();eyes.pause();ears.pause();values.blink=values.earL=values.earR=0;
    greeting=gsap.timeline({onComplete(){greeting=null;if(!paused){eyes.restart();ears.restart();}}});
    blink(greeting,values,0);ear(greeting,values,'earR',.12);blink(greeting,values,.65);
   },
   destroy(){dead=true;loops.forEach(tl=>tl.kill());greeting?.kill();greeting=null;}
  };
 }
 const VERTEX='attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.0)*.5,(1.0-p.y)*.5);gl_Position=vec4(p,0.,1.);}';
 const FRAGMENT=`precision mediump float;
 varying vec2 uv;uniform sampler2D original;uniform sampler2D closedEyes;
 uniform vec4 motion;uniform vec4 eyes;uniform vec4 ears;uniform vec2 amplitude;
 float bell(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.25,1.,length((p-c)/r));}
 vec4 source(vec2 q){if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return vec4(0.);return texture2D(original,q);}
 vec4 lid(vec4 base,vec2 q,vec2 c){
  vec2 r=vec2(.054,.047);vec2 p=(q-c)/r;
  float feather=1.-smoothstep(.72,1.,length(p));
  // Reveal an actual closed eyelid from above, without squeezing the eyeball.
  float edge=mix(-1.15,1.15,motion.y);
  float cover=(1.-smoothstep(edge-.08,edge+.08,p.y))*feather*step(.001,motion.y);
  return mix(base,texture2D(closedEyes,q),cover);
 }
 void main(){
  vec2 q=(uv-.5)*1.12+.5;
  float chest=smoothstep(.56,.64,q.y)*(1.-smoothstep(.77,.86,q.y));
  q.x=.5+(q.x-.5)/(1.+amplitude.x*chest*motion.x);
  q.y+=.0024*chest*motion.x;
  // Smooth local ear motion fades out before either eye; no detached cutouts.
  float l=bell(q,ears.xy,vec2(.27,.28))*(1.-smoothstep(.31,.37,q.x));
  float r=bell(q,ears.zw,vec2(.26,.28))*smoothstep(.67,.74,q.x);
  q+=vec2(-.002,amplitude.y)*l*motion.z;
  q+=vec2(.002,amplitude.y)*r*motion.w;
  vec4 color=source(q);
  if(motion.y>.001){color=lid(color,q,eyes.xy);color=lid(color,q,eyes.zw);}
  gl_FragColor=color;
 }`;
 function createRenderer(canvas,open,closed,rig){
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});
  if(!gl)throw Error('WebGL unavailable');
  const shaders=[],textures=[];let program=null,buffer=null,resizeObserver=null,needsSize=true;
  function destroy(){resizeObserver?.disconnect();textures.forEach(t=>gl.deleteTexture(t));if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));gl.getExtension('WEBGL_lose_context')?.loseContext();}
  try{
   function shader(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
   program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,FRAGMENT));gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
   gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
   [open,closed].forEach((img,index)=>{const texture=gl.createTexture();textures.push(texture);gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    gl.uniform1i(gl.getUniformLocation(program,index?'closedEyes':'original'),index);
   });
   gl.uniform4fv(gl.getUniformLocation(program,'eyes'),rig.eyes);gl.uniform4fv(gl.getUniformLocation(program,'ears'),[...rig.left,...rig.right]);
   gl.uniform2f(gl.getUniformLocation(program,'amplitude'),rig.chest??AMPLITUDE.chest,rig.ear??AMPLITUDE.ear);
   const movement=gl.getUniformLocation(program,'motion');
   if(global.ResizeObserver){resizeObserver=new global.ResizeObserver(()=>{needsSize=true;});resizeObserver.observe(canvas);}
   return {draw(values){
    if(needsSize){needsSize=false;const size=Math.min(1000,Math.max(1,Math.round(canvas.clientWidth*Math.min(global.devicePixelRatio||1,2))));
    if(canvas.width!==size||canvas.height!==size){canvas.width=canvas.height=size;gl.viewport(0,0,size,size);}}
    gl.uniform4f(movement,values.breath,values.blink,values.earL,values.earR);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);
   },destroy};
  }catch(error){destroy();throw error;}
 }
 // Decoded eyelids are shared across renders. Offscreen/paused portraits never request them.
 const frameCache=new Map();let instance=0;
 function loadFrame(src){
  if(frameCache.has(src))return frameCache.get(src);
  const promise=new Promise((resolve,reject)=>{const img=new global.Image();img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>{frameCache.delete(src);reject(Error('Closed-eye frame unavailable'));};img.src=src;});
  frameCache.set(src,promise);return promise;
 }
 function mount(root,options={}){
  if(!global.gsap)return ()=>{};
  const paused=Boolean(options.paused);
  const cleanups=Array.from(root.querySelectorAll('[data-kora-live]')).map((stage,index)=>mountStage(stage,index,paused));
  return ()=>cleanups.forEach(dispose=>dispose());
 }
 function mountStage(stage,index,userPaused){
  const image=stage.querySelector('img'),canvas=stage.querySelector('canvas');
  const media=global.matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,renderer=null,motion=null,closed=null,inView=!global.IntersectionObserver,observer=null,ticking=false,broken=false,pending=false,idle=null,lastDraw=-Infinity;
  function active(){return !disposed&&!userPaused&&!media.matches&&!global.document.hidden&&inView&&!broken;}
  function draw(time){const now=typeof time==='number'?time:global.performance.now()/1000;if(renderer&&motion&&now-lastDraw>=1/30){lastDraw=now;renderer.draw(motion.values);}}
  function sync(){
   if(disposed||!motion)return;
   const running=active();motion.pause(!running);stage.classList.toggle('is-live',running);
   if(running&&!ticking){lastDraw=-Infinity;global.gsap.ticker.add(draw);ticking=true;draw();}
   else if(!running&&ticking){global.gsap.ticker.remove(draw);ticking=false;}
  }
  function cancelIdle(){if(!idle)return;if(idle.kind==='idle')global.cancelIdleCallback?.(idle.id);else global.clearTimeout(idle.id);idle=null;}
  const greet=()=>{if(active())motion?.greet();};
  const fail=()=>{broken=true;cancelIdle();sync();stage.classList.remove('is-live');stage.dataset.liveStatus='fallback';if(image.dataset?.fallback&&!image.dataset.fallbackUsed){image.dataset.fallbackUsed='true';image.srcset=image.dataset.fallbackSmall+' 384w, '+image.dataset.fallback+' 768w';image.src=image.dataset.fallback;}};
  const lose=event=>{event.preventDefault();fail();};
  function ready(){
   if(!active()||renderer||!image.complete||!image.naturalWidth||!closed)return;
   try{const base=RIGS[stage.dataset.koraLive]||RIGS.calm,eyes=stage.dataset.eyeRig?.split(',').map(Number);renderer=createRenderer(canvas,image,closed,eyes?.length===4&&eyes.every(v=>Number.isFinite(v)&&v>0&&v<1)?{...base,eyes}:base);motion=createMotion(global.gsap,index*1.73);
    stage.dataset.liveStatus='ready';stage.dataset.liveInstance=String(++instance);sync();
   }catch(error){console.warn('Kora keeps its static portrait:',error.message);fail();}
  }
  function begin(){
   idle=null;if(!active()||pending||closed||!image.complete||!image.naturalWidth)return;
   pending=true;stage.dataset.liveStatus='loading';
   const small=(image.currentSrc||image.src).includes('-small.webp');
   loadFrame((small?stage.dataset.closedSmall:stage.dataset.closed)||'assets/web/kora-'+stage.dataset.koraLive+'-blink'+(small?'-small':'')+'.webp').then(frame=>{if(disposed)return;closed=frame;pending=false;ready();}).catch(()=>{if(!disposed)fail();});
  }
  function update(){
   if(!active()){cancelIdle();sync();return;}
   if(closed)ready();
   else if(!pending&&!idle&&image.complete&&image.naturalWidth){
    idle=global.requestIdleCallback?{kind:'idle',id:global.requestIdleCallback(begin,{timeout:1000})}:{kind:'timer',id:global.setTimeout(begin,80)};
   }
   sync();
  }
  if(global.IntersectionObserver){observer=new global.IntersectionObserver(entries=>{inView=entries[0].isIntersecting;update();},{threshold:.05});observer.observe(stage);}
  image.addEventListener('load',update);image.addEventListener('error',fail);
  stage.addEventListener('kora-greet',greet);
  global.document.addEventListener('visibilitychange',update);media.addEventListener('change',update);canvas.addEventListener('webglcontextlost',lose);
  update();
  return ()=>{disposed=true;cancelIdle();global.gsap.ticker.remove(draw);observer?.disconnect();motion?.destroy();
   image.removeEventListener('load',update);image.removeEventListener('error',fail);
   stage.removeEventListener('kora-greet',greet);global.document.removeEventListener('visibilitychange',update);media.removeEventListener('change',update);
   canvas.removeEventListener('webglcontextlost',lose);renderer?.destroy();stage.classList.remove('is-live');
  };
 }
 const api={mount,createMotion,RIGS,AMPLITUDE};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else global.KoraCompanion=api;
})(typeof window!=='undefined'?window:globalThis);
