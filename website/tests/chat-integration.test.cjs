const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function context(streamChat){
 const c=vm.createContext({structuredClone,console,AbortController,window:{KoraChat:{streamChat},KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js'),KoraDaily:require('../daily.js')},localStorage:{getItem:()=>null},document:{querySelector:()=>({value:'',innerHTML:'',scrollHeight:0})}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0],c);
 vm.runInContext("currentRoute='chat';updateChatView=()=>{};state.profile.persona='gentle';",c);return c;
}
test('real replies retain context without sending health records or mutating plans',async()=>{
 let request;const c=context(async options=>{request=options;options.onDelta('听到了。');});const before=vm.runInContext('JSON.stringify(state)',c);
 await vm.runInContext("sendChat('今天很累')",c);
 assert.ok(request,'provider transport must be called');assert.equal(request.persona,'gentle');assert.equal(request.messages.at(-1).content,'今天很累');
 assert.equal(vm.runInContext('chats.at(-1).text',c),'听到了。');assert.equal(vm.runInContext('JSON.stringify(state)',c),before);
 assert.equal('profile' in request,false);assert.equal('days' in request,false);
});
test('failed send can retry without duplicating user messages or sending failed assistant text',async()=>{
 let calls=0;const c=context(async options=>{calls++;if(calls===1)throw Object.assign(new Error('network'),{code:'unavailable'});options.onDelta('重试成功');});
 await vm.runInContext("sendChat('你好')",c);assert.equal(vm.runInContext('chatSession.error',c),'unavailable');
 await vm.runInContext('retryChat()',c);assert.equal(calls,2);assert.equal(vm.runInContext("chats.filter(m=>m.role==='user').length",c),1);assert.equal(vm.runInContext('chats.at(-1).text',c),'重试成功');
});
