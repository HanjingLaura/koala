const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('modal companion mounts and disposes when preview changes or closes',()=>{
 let mounted=0,disposed=0;const modal={open:false,classList:{toggle(){}},showModal(){this.open=true;},close(){this.open=false;}},content={innerHTML:''};
 const window={KoraCompanion:{mount(root){assert.equal(root,content);mounted++;return()=>disposed++;}}};for(const [name,file]of Object.entries({KoraContent:'content-data',KoraChatContext:'chat-context',KoraWardrobe:'wardrobe',KoraCoach:'coach',KoraRewards:'rewards',KoraJourney:'journey',KoraLifestyle:'lifestyle',KoraComeback:'comeback',KoraDaily:'daily'}))window[name]=require('../'+file+'.js');
 const c=vm.createContext({structuredClone,console,window,localStorage:{getItem:()=>null},document:{activeElement:null,querySelector:s=>s==='#modal'?modal:content}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0],c);vm.runInContext("openModal('first','rewards');openModal('second','rewards');closeModal()",c);assert.equal(mounted,2);assert.equal(disposed,2);
});
