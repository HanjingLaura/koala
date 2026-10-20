const test=require('node:test'),assert=require('node:assert/strict');
const coach=require('../coach.js');
test('all four voices have eight bilingual replies; random selection never repeats the last line',()=>{
 for(const persona of ['calm','snark','fiery','gentle']){assert.equal(Object.values(coach.lines[persona]).flat().length,8);for(const mode of ['ready','done','rest']){let previous=-1;for(let i=0;i<12;i++){const result=coach.pick(persona,mode,previous,()=>i%2?0:.99999);assert.notEqual(result.index,previous);assert.equal(result.line.length,2);assert.ok(result.line[0].length&&result.line[1].length);assert.ok(!/[\u4e00-\u9fff]/.test(result.line[1]));previous=result.index;}}}
});
test('completed, resting and moved plans get appropriate responses without mutating the plan',()=>{
 for(const [plan,mode] of [[{done:true,type:'short'},'done'],[{done:true,type:'rest'},'rest'],[{type:'reschedule'},'rest'],[{type:'original'},'ready']]){const before=JSON.stringify(plan);assert.equal(coach.context(plan),mode);assert.equal(JSON.stringify(plan),before);}
 const done=coach.lines.snark.done.flat().join(' '),rest=coach.lines.snark.rest.flat().join(' ');assert.ok(!done.includes('不如先动'));assert.ok(!rest.includes('不如先动'));assert.ok(coach.pick('unknown','ready').line.length===2);
});
