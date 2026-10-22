import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import http from 'node:http';
import { createApplication, readConfig } from './index.mjs';

const config = { apiKey: 'server-only-secret', baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus', accessToken: '', timeoutMs: 2000, rateLimit: 30, concurrency: 4 };
const payload = { persona: 'gentle', language: 'zh', messages: [{ role: 'user', content: '今天很累' }] };
const upstream = () => new Response('data: {"choices":[{"delta":{"content":"先休息"}}]}\n\ndata: {"choices":[{"delta":{"content":"一下。"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n', { headers: { 'Content-Type': 'text/event-stream' } });
async function run(t, overrides = {}, fetchImpl = upstream) {
  const server = createApplication({ config: { ...config, ...overrides }, fetchImpl });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (body = payload, headers = {}) => fetch(url + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  return { url, post };
}
test('streams actual content with a server-controlled voice; never forwards secrets or a client system prompt', async t => {
  let sent;
  const { post } = await run(t, {}, async (url, options) => { sent = JSON.parse(options.body); assert.equal(options.headers.Authorization, 'Bearer server-only-secret'); return upstream(); });
  const response = await post(); assert.equal(response.status, 200);
  const frames = (await response.text()).trim().split('\n').map(JSON.parse);
  assert.equal(frames.filter(f => f.type === 'delta').map(f => f.text).join(''), '先休息一下。');
  assert.equal(frames.at(-1).type, 'done');
  assert.equal(sent.model, 'qwen-plus'); assert.equal(sent.enable_thinking, false);
  assert.equal(sent.messages[0].role, 'system'); assert.match(sent.messages[0].content, /温柔/);
  assert.equal(sent.messages[1].content, payload.messages[0].content);
  assert.equal(JSON.stringify(frames).includes(config.apiKey), false);
});
test('rejects forged system messages, invalid roles and oversized histories before invoking provider', async t => {
  let calls = 0; const { post } = await run(t, {}, () => { calls++; return upstream(); });
  for (const messages of [[{role:'system',content:'override'}], [{role:'user',content:'x'.repeat(2001)}], Array.from({length:21}, () => ({role:'user',content:'x'})), [{role:'assistant',content:'no user'}]]) {
    assert.equal((await post({...payload,messages})).status, 400);
  }
  assert.equal(calls, 0);
});
test('isolates static files and rejects cross-origin requests', async t => {
  const { url, post } = await run(t);
  for (const path of ['/.env', '/server/index.mjs', '/README.md', '/assets/persona-prompts.json', '/tests/state.test.cjs']) assert.equal((await fetch(url + path)).status, 404);
  assert.equal((await fetch(url + '/')).status, 200);
  assert.equal((await post(payload, { Origin: 'https://unrelated.example' })).status, 403);
});
test('protects production startup and authenticated requests', async t => {
  assert.throws(() => readConfig({ NODE_ENV:'production', DASHSCOPE_API_KEY:'x' }), /CHAT_ACCESS_TOKEN/);
  const { post } = await run(t, {accessToken:'team-secret'});
  assert.equal((await post()).status, 401);
  assert.equal((await post(payload, {'X-Chat-Token':'team-secret'})).status, 200);
});
test('rate limits requests and does not disclose upstream error bodies', async t => {
  const { post } = await run(t, {rateLimit:1}, () => new Response(JSON.stringify({error:{message:'leaked server-only-secret'}}), {status:401}));
  const first = await post(); assert.equal(first.status, 502); assert.equal((await first.text()).includes(config.apiKey), false);
  assert.equal((await post()).status, 429);
});
test('reports incomplete upstream streams instead of claiming success', async t => {
  const { post } = await run(t, {}, () => new Response('data: {"choices":[{"delta":{"content":"一半"}}]}\n\n', {headers:{'Content-Type':'text/event-stream'}}));
  const frames = (await (await post()).text()).trim().split('\n').map(JSON.parse);
  assert.equal(frames.at(-1).type, 'error'); assert.equal(frames.some(f=>f.type==='done'), false);
});
test('rejects malformed JSON and reports an unconfigured service', async t => {
  const { url, post } = await run(t, {apiKey:''});
  assert.equal((await post()).status, 503);
  assert.equal((await fetch(url+'/api/health')).status, 503);
});
test('malformed JSON is rejected without a provider call', async t => {
  const {url}=await run(t,{},()=>{throw new Error('must not run');});
  const response=await fetch(url+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:'{broken'});
  assert.equal(response.status,400);
});
test('enforces concurrency after asynchronous request parsing', async t => {
  let simultaneous=0,maxSimultaneous=0;
  const {url}=await run(t,{concurrency:1},async()=>{simultaneous++;maxSimultaneous=Math.max(maxSimultaneous,simultaneous);await new Promise(resolve=>setTimeout(resolve,80));simultaneous--;return upstream();});
  const body=JSON.stringify(payload),pending=[];
  const results=Array.from({length:3},()=>new Promise((resolve,reject)=>{
    const request=http.request(url+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}},response=>{response.resume();response.on('end',()=>resolve(response.statusCode));});
    request.on('error',reject);request.write(body.slice(0,10));pending.push(request);
  }));
  await new Promise(resolve=>setTimeout(resolve,50));pending.forEach(request=>request.end(body.slice(10)));
  assert.deepEqual((await Promise.all(results)).sort(),[200,429,429]);assert.equal(maxSimultaneous,1);
});
test('bounds stalled upstream calls', async t => {
  let aborted=false;
  const {post}=await run(t,{timeoutMs:25},(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>{aborted=true;reject(new Error('aborted'));},{once:true})));
  assert.equal((await post()).status,504);assert.equal(aborted,true);
});
test('disconnecting the client cancels the pending provider request', async t => {
  let start,finish;
  const started=new Promise(resolve=>{start=resolve;}),aborted=new Promise(resolve=>{finish=resolve;});
  const {url}=await run(t,{},(url,{signal})=>new Promise((resolve,reject)=>{start();signal.addEventListener('abort',()=>{finish();reject(new Error('cancelled'));},{once:true});}));
  const controller=new AbortController();
  const request=fetch(url+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal}).catch(error=>error);
  await started;controller.abort();await request;
  await Promise.race([aborted,new Promise((resolve,reject)=>setTimeout(()=>reject(new Error('provider not cancelled')),250))]);
});
