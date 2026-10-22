const test = require('node:test');
const assert = require('node:assert/strict');
const { streamChat } = require('../chat-client.js');
test('decodes split UTF-8 chunks and only completes on an explicit done event', async () => {
  const bytes = new TextEncoder().encode('{"type":"delta","text":"你好"}\n{"type":"done"}\n');
  const chunks = [bytes.slice(0,27), bytes.slice(27,28), bytes.slice(28)]; let text='';
  await streamChat({messages:[{role:'user',content:'Hi'}],onDelta:delta=>text+=delta}, async()=>new Response(new ReadableStream({start(c){chunks.forEach(b=>c.enqueue(b));c.close();}}),{headers:{'Content-Type':'application/x-ndjson'}}));
  assert.equal(text,'你好');
});
test('maps authentication errors and rejects HTML/static fallback', async () => {
  await assert.rejects(streamChat({messages:[]},async()=>new Response('{"error":"access_required"}',{status:401})), e=>e.code==='access_required');
  await assert.rejects(streamChat({messages:[]},async()=>new Response('<html>static</html>',{headers:{'Content-Type':'text/html'}})),e=>e.code==='unavailable');
});
test('an interrupted response is retryable and request contains only allowed context', async () => {
  let request;
  await assert.rejects(streamChat({persona:'calm',language:'en',messages:[{role:'user',content:'Hi'}],accessToken:'team-token',onDelta:()=>{}},async(url,options)=>{request=options;return new Response('{"type":"delta","text":"Hi"}\n',{headers:{'Content-Type':'application/x-ndjson'}});}),e=>e.code==='interrupted');
  assert.equal(request.headers['X-Chat-Token'],'team-token');assert.deepEqual(Object.keys(JSON.parse(request.body)).sort(),['language','messages','persona']);
});
test('stop aborts an idle streaming reader without waiting for another token',async()=>{
  const controller=new AbortController();
  const request=streamChat({messages:[],signal:controller.signal},async()=>new Response(new ReadableStream({start(){}}),{headers:{'Content-Type':'application/x-ndjson'}}));
  setTimeout(()=>controller.abort(),10);
  await assert.rejects(request,error=>error.name==='AbortError');
});
test('only delivers a structured suggestion after done, never after interruption',async()=>{
 let received=[];const opts={messages:[],context:{date:'2026-10-22'},onSuggestion:s=>received.push(s)};
 const response=text=>async()=>new Response(text,{headers:{'Content-Type':'application/x-ndjson'}});
 await assert.rejects(streamChat(opts,response('{"type":"suggestion","suggestion":{"action":"rest"}}\n')),e=>e.code==='interrupted');assert.deepEqual(received,[]);
 await streamChat(opts,response('{"type":"suggestion","suggestion":{"action":"rest"}}\n{"type":"done"}\n'));assert.deepEqual(received,[{action:'rest'}]);
});
