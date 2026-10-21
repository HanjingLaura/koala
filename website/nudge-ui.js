/* Persistent opt-in scheduler; transient cards own their motion and cleanup. */
(function(root){
 'use strict';
 function create(app){
  const api=root.KoraNudges,{t,pair}=app;
  let card=null,current=null,animation=null,companion=null,interval=null,config=null;
  let previewStage=0;
  let guide=null,guideTimer=null,guideAnimation=null;
  function hideGuide(){
   clearTimeout(guideTimer);guideTimer=null;guideAnimation?.revert();guideAnimation=null;
   if(guide?.contains(document.activeElement))document.querySelector('.nudge-bell')?.focus({preventScroll:true});
   guide?.remove();guide=null;document.querySelector('.nudge-bell')?.classList.remove('is-guided');
  }
  function positionGuide(){
   if(!guide)return;const bell=document.querySelector('.nudge-bell');if(!bell){hideGuide();return;}
   const rect=bell.getBoundingClientRect(),width=Math.min(320,root.innerWidth-32);
   const left=Math.max(16,Math.min(rect.right-width,root.innerWidth-width-16));
   guide.style.width=width+'px';guide.style.left=left+'px';guide.style.top=(rect.bottom+13)+'px';
   guide.style.setProperty('--guide-arrow-left',Math.max(20,Math.min(width-20,rect.left+rect.width/2-left))+'px');
  }
  function paintGuide(){
   if(!guide)return;
   guide.innerHTML=`<h2 id="nudge-guide-title">${t('需要我按时叫你动一动吗？','Want a little nudge to move?')}</h2><p>${t('点这里设置运动提醒，网站打开时我就来敲门。','Set a movement reminder here. I’ll knock while the site is open.')}</p><div class="nudge-guide-actions"><button type="button" class="primary" data-nudge="guide-open">${t('试试看','Try it')}${app.icon('arrow')}</button><button type="button" data-nudge="guide-later">${t('稍后','Later')}</button></div>`;
   document.querySelector('.nudge-bell')?.classList.add('is-guided');positionGuide();
  }
  function guideBlocked(){return app.blocked()||app.guideBlocked?.()||document.hidden||current||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');}
  function syncGuide(){
   const s=app.getState();
   if(guide){if(guideBlocked()||!s.onboarded||api.settings(s).enabled)hideGuide();else{if(s.profile.motionPaused){guideAnimation?.revert();guideAnimation=null;}paintGuide();}return;}
   if(!api.guidePending(s)||guideBlocked()){clearTimeout(guideTimer);guideTimer=null;return;}
   if(guideTimer)return;
   guideTimer=setTimeout(()=>{
    guideTimer=null;if(!api.guidePending(app.getState())||guideBlocked())return;
    api.finishGuide(app.getState());app.save();
    guide=document.createElement('aside');guide.className='nudge-guide';guide.setAttribute('role','region');guide.setAttribute('aria-labelledby','nudge-guide-title');
    document.body.append(guide);paintGuide();
    if(root.gsap&&!app.getState().profile.motionPaused&&!root.matchMedia('(prefers-reduced-motion: reduce)').matches){
     guideAnimation=root.gsap.context(()=>{
      root.gsap.fromTo(guide,{y:-7,opacity:0},{y:0,opacity:1,duration:.32,ease:'power3.out',clearProps:'transform,opacity'});
      const bell=document.querySelector('.nudge-bell');
      root.gsap.timeline().to(bell,{rotation:-10,duration:.12}).to(bell,{rotation:8,duration:.14}).to(bell,{rotation:-4,duration:.12}).to(bell,{rotation:0,duration:.2,clearProps:'transform'});
     },guide);
    }
   },1800);
  }
  function hide(){
   hideGuide();
   animation?.revert();animation=null;companion?.();companion=null;
   if(card?.contains(document.activeElement))document.querySelector('.nudge-bell')?.focus({preventScroll:true});
   card?.remove();card=null;current=null;
  }
  function motion(){
   const s=app.getState();if(!root.gsap||s.profile.motionPaused||root.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   animation=root.gsap.context(()=>{
    root.gsap.fromTo(card,{y:18,opacity:0,scale:.98},{y:0,opacity:1,scale:1,duration:.42,ease:'power3.out',clearProps:'transform,opacity',overwrite:'auto'});
    const lean={calm:-3,snark:-5,fiery:4,gentle:3}[current.coach];
    const tl=root.gsap.timeline({defaults:{overwrite:'auto'}});
    if(current.stage===0){
     tl.to('.nudge-character',{rotation:lean,y:-4,duration:.3,ease:'power2.out'})
       .to('.nudge-character',{rotation:0,y:0,duration:.55,ease:'back.out(1.5)',clearProps:'transform'});
    }else if(current.stage===1){
     tl.to('.nudge-character',{scale:1.045,y:-7,duration:.32,ease:'power2.out'})
       .to('.nudge-character',{scale:1,y:0,duration:.5,ease:'power2.out',clearProps:'transform'});
    }else{
     tl.to('.nudge-character',{y:-9,rotation:lean*.4,duration:.18,ease:'power2.out'})
       .to('.nudge-character',{y:0,rotation:0,duration:.22,ease:'power2.inOut'})
       .to('.nudge-character',{y:-5,duration:.16,ease:'power2.out'})
       .to('.nudge-character',{y:0,duration:.36,ease:'power2.out',clearProps:'transform'});
    }
    root.gsap.from('.nudge-knock',{scale:.6,opacity:0,duration:.28,delay:.2,ease:'back.out(1.6)',clearProps:'transform,opacity'});
   },card);
  }
  function show({preview=false,stage=0,event=null}={}){
   hide();const s=app.getState();
   current={preview,date:s.date,coach:api.coachOf(s),stage:Math.max(0,Math.min(2,stage)),event};paint(true);
  }
  function paint(enter=false){
   if(!current)return;animation?.revert();animation=null;companion?.();companion=null;
   const s=app.getState();current.coach=api.coachOf(s);
   const c=current,line=pair(api.message(c.coach,c.stage)[0]);
   if(!card){
    card=document.createElement('aside');card.id='kora-nudge';card.className='kora-nudge';
    card.setAttribute('aria-label',c.preview?t('Kora 提醒效果预览','Kora reminder preview'):t('Kora 运动提醒','Kora movement reminder'));
    document.body.append(card);
   }
   card.dataset.nudgePhase=String(c.stage);
   card.innerHTML=`
    <button type="button" class="nudge-close" data-nudge="dismiss" aria-label="${c.preview?t('关闭预览','Close preview'):t('今天不再提醒','No more nudges today')}">×</button>
    <div class="nudge-scene">
     <span class="nudge-orbit" aria-hidden="true"></span>
     <div class="nudge-character">${app.livePortrait(c.coach)}</div>
     <span class="nudge-knock" aria-hidden="true"><i></i><i></i></span>
    </div>
    <div class="nudge-copy">
     <h2 role="status" aria-live="polite">${line}</h2>
     <div class="nudge-actions">
      <button type="button" class="primary" data-nudge="start">${t('去运动','Let’s move')}${app.icon('arrow')}</button>
      <button type="button" class="secondary" data-nudge="later">${t('10 分钟后叫我','In 10 minutes')}</button>
     </div>
    </div>`;
   companion=root.KoraCompanion?.mount(card,{paused:s.profile.motionPaused});if(enter)motion();
  }
  function open({preserve=false}={}){
   hide();const s=app.getState();if(api.finishGuide(s))app.save();if(!preserve||!config)config={...api.settings(s)};
   const r=config;
   app.openModal(app.modalShell(`
    <div class="nudge-center-heading">
     <span class="nudge-door">${app.icon('bell')}</span>
     <h2 id="modal-title">${t('让 Kora 来敲敲门。','A little knock from Kora.')}</h2>
     <p>${t('有点黏人，但听得懂「今天先到这」。','A little persistent. Always knows when to stop.')}</p>
    </div>
    <section class="nudge-preview-invite">
     <div><strong>${t('先听听，它会怎么催你','Hear your coach in action')}</strong><p>${t('你的教练，三次不同的敲门。','Your coach. Three different knocks.')}</p></div>
     <button type="button" class="primary" data-nudge="preview">${t('看看效果','Try a nudge')}${app.icon('arrow')}</button>
    </section>
    <form id="nudge-settings-form">
     <div class="nudge-optin"><label for="nudge-enabled">${t('开启站内提醒','Enable in-page reminders')}</label><input id="nudge-enabled" type="checkbox" ${r.enabled?'checked':''}></div>
     <div class="nudge-fields">
      <label for="nudge-time">${t('提醒时间','Reminder time')}<input id="nudge-time" type="time" min="06:00" max="21:59" value="${r.time}" aria-describedby="nudge-rules" required></label>
      <label for="nudge-level">${t('提醒频率','Frequency')}<select id="nudge-level" aria-describedby="nudge-rules">${[['gentle',['每天最多 1 次','Up to 1 / day']],['regular',['每天最多 2 次','Up to 2 / day']],['strong',['每天最多 3 次','Up to 3 / day']]].map(([id,n])=>`<option value="${id}" ${r.level===id?'selected':''}>${pair(n)}</option>`).join('')}</select></label>
     </div>
     <div class="nudge-notes" id="nudge-rules">
      <p>${t('按本机时间提醒，22:00—06:00 不打扰。开始、完成或休息后停止催促；关闭网站后不推送。','Device time. Quiet from 22:00 to 06:00. Nudges stop after starting, finishing or resting; no push when the site is closed.')}</p>
      <p>${t('最多两次时相隔 45 分钟，最多三次时相隔 20 分钟；主动选择稍后提醒则等 10 分钟。','Two nudges: 45 minutes apart. Three: 20 minutes apart. Snooze: 10 minutes.')}</p>
      <p>${t('每次预览依次展示下一次敲门，不会开启提醒或修改计划。','Each preview shows the next knock. It never enables reminders or changes your plan.')}</p>
     </div>
     <p class="nudge-save-error" role="alert"></p>
     <div class="modal-actions"><button type="button" class="secondary" data-action="close">${t('先不改','Cancel')}</button><button type="submit" class="primary">${t('保存提醒设置','Save reminder settings')}</button></div>
    </form>`,t('KORA 敲敲门','KORA · KNOCK KNOCK')),'nudges');
  }
  function capture(){if(!document.querySelector('#nudge-settings-form'))return;config={enabled:document.querySelector('#nudge-enabled').checked,time:document.querySelector('#nudge-time').value,level:document.querySelector('#nudge-level').value};}
  function sync(){
   const s=app.getState(),enabled=api.settings(s).enabled,bell=document.querySelector('.nudge-bell');
   if(bell){bell.setAttribute('aria-label',t('Kora 提醒','Kora reminders')+t(enabled?' · 已开启站内提醒':' · 未开启',enabled?' · in-page reminders on':' · off'));bell.classList.toggle('is-enabled',enabled);}
   if(current){if(!s.onboarded||(!current.preview&&(!api.eligible(s)||!enabled||current.date!==s.date)))hide();else if(!document.hidden)paint();}
   syncGuide();
  }
  function tick(){
   if(document.hidden)return;app.refreshDate();const s=app.getState();syncGuide();if(guide||guideTimer)return;
   if(current){if(!current.preview&&(!api.eligible(s)||!api.settings(s).enabled||current.date!==s.date))hide();return;}
   if(app.blocked()||document.activeElement?.matches('input,textarea,select,[contenteditable="true"]'))return;
   const event=api.due(s);if(!event)return;
   const before=s.days[s.date].nudge?structuredClone(s.days[s.date].nudge):undefined;api.shown(s,event);
   if(!app.save()){if(before)s.days[s.date].nudge=before;else delete s.days[s.date].nudge;return;}
   show({event,stage:event.stage});
  }
  function click(e){
   const b=e.target.closest('[data-nudge]');if(!b)return;const action=b.dataset.nudge;
   if(action==='center'){open();return;}
   if(action==='guide-open'){open();return;}
   if(action==='guide-later'){hideGuide();return;}
   if(action==='preview'){
    capture();app.closeModal();show({preview:true,stage:previewStage});previewStage=(previewStage+1)%3;return;
   }
   if(!current||!['start','later','dismiss'].includes(action))return;
   if(current.preview){
    hide();if(action==='start')app.showTodayPlan();else if(action==='later')app.toast(t('预览结束，没有设置定时。','Preview finished. No reminder was scheduled.'));return;
   }
   const s=app.getState();if(!api.eligible(s)){hide();return;}
   const previous=structuredClone(s.days[s.date].nudge||{});api.respond(s,action==='later'?'later':'quiet');
   if(!app.save()){s.days[s.date].nudge=previous;app.toast(t('暂时无法保存，请稍后重试。','Couldn’t save. Please try again.'));return;}
   hide();if(action==='start')app.showTodayPlan();else app.toast(action==='later'?t('好，10 分钟后再来。页面需要保持打开。','Back in 10. Keep the page open.'):t('收到，今天不再催你。','Got it. No more nudges today.'));
  }
  function change(e){if(e.target.closest('#nudge-settings-form'))capture();}
  function submit(e){
   if(e.target.id!=='nudge-settings-form')return;e.preventDefault();capture();const s=app.getState();
   if(api.settings({profile:{nudges:config}}).time!==config.time){document.querySelector('.nudge-save-error').textContent=t('请选择 06:00—21:59 之间的时间。','Choose a time from 06:00 to 21:59.');return;}
   const previous=s.profile.nudges,preference=s.profile.reminderPreference;s.profile.nudges={...config};s.profile.reminderPreference=config.enabled?config.level:'off';
   if(!app.save()){s.profile.nudges=previous;s.profile.reminderPreference=preference;document.querySelector('.nudge-save-error').textContent=t('浏览器无法保存，设置还没有生效。','Storage is unavailable. Settings have not changed.');return;}
   app.syncPreferences?.();app.closeModal();sync();app.toast(config.enabled?t('约好了。网站打开时，我来敲敲门。','It’s a date. I’ll nudge while the site is open.'):t('提醒已关闭。需要时再叫我。','Reminders off. I’m here when you need me.'));
  }
  const hidden=()=>{if(document.hidden){animation?.revert();animation=null;hideGuide();}else tick();};
  const start=()=>{clearInterval(interval);interval=setInterval(tick,15000);syncGuide();};
  const stop=()=>{clearInterval(interval);interval=null;hide();};
  const escape=e=>{if(e.key!=='Escape'||app.modalOpen())return;if(guide){e.preventDefault();hideGuide();}else if(current){e.preventDefault();click({target:card.querySelector('[data-nudge="dismiss"]')});}};
  document.addEventListener('click',click);document.addEventListener('change',change);document.addEventListener('submit',submit);document.addEventListener('keydown',escape);document.addEventListener('visibilitychange',hidden);root.addEventListener('pageshow',start);root.addEventListener('pagehide',stop);root.addEventListener('resize',positionGuide);root.addEventListener('scroll',positionGuide,{passive:true});start();sync();
  return {sync,open,capture,hide,destroy(){stop();document.removeEventListener('click',click);document.removeEventListener('change',change);document.removeEventListener('submit',submit);document.removeEventListener('keydown',escape);document.removeEventListener('visibilitychange',hidden);root.removeEventListener('pageshow',start);root.removeEventListener('pagehide',stop);root.removeEventListener('resize',positionGuide);root.removeEventListener('scroll',positionGuide);}};
 }
 root.KoraNudgeUI={create};
})(window);
