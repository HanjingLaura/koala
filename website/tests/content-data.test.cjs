const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const content=require('../content-data.js');
test('food portions use identified USDA records, not generated calorie estimates',()=>{
 const rice=content.foods.find(f=>f.id==='rice'),oats=content.foods.find(f=>f.id==='oat');
 assert.equal(rice.source.fdcId,168878);assert.equal(content.foodPortion(rice,150).cal,195);
 assert.equal(oats.cal,379);assert.equal(oats.source.fdcId,173904);
 for(const food of content.foods){assert.ok(food.source.description);assert.equal(food.source.dataType,'SR Legacy');assert.ok(food.source.url.startsWith('https://fdc.nal.usda.gov/'));assert.equal(food.basisGrams,100);}
 assert.throws(()=>content.foodPortion(rice,NaN));assert.throws(()=>content.foodPortion(rice,0));
});
test('a recorded portion retains its source and value after catalog changes',()=>{
 const food=structuredClone(content.foods[0]),log=content.foodPortion(food,150);food.cal=999;
 assert.equal(log.cal,195);assert.equal(log.nutritionSource.kcalPer100g,130);assert.equal(log.nutritionSource.fdcId,168878);
 assert.deepEqual(log.foodLabel,content.foods[0].name);
});
test('video embeds use only curated video IDs and keep original author links',()=>{
 for(const workout of content.workouts){assert.match(workout.videoId,/^[A-Za-z0-9_-]{11}$/);assert.equal(workout.url,'https://www.youtube.com/watch?v='+workout.videoId);assert.ok(workout.author);assert.match(content.embedUrl(workout.id),/^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}\?/);assert.ok(!content.embedUrl(workout.id).includes('autoplay=1'));}
 assert.equal(content.embedUrl('not-a-curated-video'),null);
});
function app(){
 const c=vm.createContext({structuredClone,console,window:{KoraContent:content,KoraCoach:require('../coach.js'),KoraRewards:require('../rewards.js'),KoraJourney:require('../journey.js'),KoraDaily:require('../daily.js'),KoraLifestyle:require('../lifestyle.js'),KoraComeback:require('../comeback.js')},localStorage:{getItem:()=>null},document:{querySelector:()=>({})}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').split("document.addEventListener('click'")[0],c);vm.runInContext("openModal=(html,view)=>{globalThis.modalHTML=html;globalThis.view=view;};state.profile.persona='calm';",c);return c;
}
test('food and video pages expose real sources and embed videos without mutating plans',()=>{
 const c=app(),run=s=>vm.runInContext(s,c),before=run('JSON.stringify(state)');
 for(const language of ['zh','en']){
  run(`state.language='${language}'`);const food=run('food()'),move=run('move()');
  assert.ok(food.includes('USDA'));assert.equal((move.match(/class=\"exercise-player\"/g)||[]).length,3);assert.ok(move.includes('youtube-nocookie.com/embed/UItWltVZZmE'));assert.ok(!move.includes('autoplay=1'));
  for(const text of ['演示营养值','Sample nutrition values'])assert.ok(!food.includes(text));
 }
 run("state.language='zh'");assert.equal(run('JSON.stringify(state)'),before);
});
