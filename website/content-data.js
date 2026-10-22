(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;else root.KoraContent=data;})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const rows=[
  ['rice',['熟米饭','Cooked rice'],168878,'Rice, white, long-grain, regular, enriched, cooked',130,2.69,.28,28.17],
  ['banana',['香蕉（去皮）','Banana (peeled)'],173944,'Bananas, raw',89,1.09,.33,22.84],
  ['egg',['水煮鸡蛋（去壳）','Boiled egg (shelled)'],173424,'Egg, whole, cooked, hard-boiled',155,12.58,10.61,1.12],
  ['chicken',['烤鸡胸肉（去皮）','Roasted skinless chicken breast'],171477,'Chicken, broilers or fryers, breast, meat only, cooked, roasted',165,31.02,3.57,0],
  ['broccoli',['水煮西兰花（沥干）','Boiled broccoli (drained)'],169967,'Broccoli, cooked, boiled, drained, without salt',35,2.38,.41,7.18],
  ['oat',['原味干燕麦','Plain dry oats'],173904,'Cereals, oats, regular and quick, not fortified, dry',379,13.15,6.52,67.7]
 ];
 const legacyNames={banana:['香蕉','Banana'],egg:['水煮鸡蛋','Boiled egg'],chicken:['熟鸡胸肉','Cooked chicken breast'],broccoli:['熟西兰花','Cooked broccoli']};
 const foods=rows.map(([id,name,fdcId,description,cal,protein,fat,carbs])=>({id,name,aliases:legacyNames[id]||[],basisGrams:100,cal,protein,fat,carbs,source:{provider:'USDA FoodData Central',fdcId,description,dataType:'SR Legacy',publicationDate:'2019-04-01',retrievedAt:'2026-10-22',url:`https://fdc.nal.usda.gov/food-details/${fdcId}/nutrients`}}));
 const workouts=[
  {id:'light',name:['低冲击有氧','Low-impact cardio'],minutes:10,kind:'cardio',noJump:true,glyph:'walk',author:'Love Sweat Fitness',videoId:'tluhEI5bJF0',title:'10 Min Low Impact CARDIO for Beginners w/ POPSUGAR // No Jumping!',equipment:['无需器械','No equipment']},
  {id:'strength',name:['自重力量训练','Bodyweight strength'],minutes:20,kind:'strength',noJump:false,glyph:'move',author:'Pamela Reif',videoId:'UItWltVZZmE',title:'20 MIN FULL BODY WORKOUT - Beginner Version // No Equipment I Pamela Reif',equipment:['无需器械','No equipment']},
  {id:'stretch',name:['全身舒展','Full-body stretch'],minutes:10,kind:'stretch',noJump:true,glyph:'yoga',author:'Yoga With Adriene',videoId:'lxuTCHJSers',title:'Full Body Stretch - 10 Minute Workout',equipment:['准备瑜伽垫','Prepare a mat']}
 ].map(w=>({...w,url:`https://www.youtube.com/watch?v=${w.videoId}`,verifiedAt:'2026-10-22'}));
 function foodPortion(food,grams){if(!foods.some(f=>f.id===food?.id)||!Number.isFinite(grams)||grams<1||grams>2000)throw new RangeError('Invalid food portion');return {foodId:food.id,foodLabel:[...food.name],grams,cal:Math.round(food.cal*grams/100),nutritionSource:{...food.source,kcalPer100g:food.cal,basisGrams:100},nutrients:{protein:food.protein*grams/100,fat:food.fat*grams/100,carbs:food.carbs*grams/100}};}
 function embedUrl(id){const w=workouts.find(w=>w.id===id);return w?`https://www.youtube-nocookie.com/embed/${w.videoId}?rel=0&playsinline=1`:null;}
 return {foods,workouts,foodPortion,embedUrl};
});
