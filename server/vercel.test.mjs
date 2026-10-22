import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import handler from './vercel.mjs';
import { readConfig } from './index.mjs';

test('only an explicitly configured Vercel runtime can use platform admission', () => {
  assert.throws(() => readConfig({NODE_ENV:'production',CHAT_AUTH_MODE:'vercel'}), /CHAT_ACCESS_TOKEN/);
  assert.throws(() => readConfig({NODE_ENV:'production',VERCEL:'1'}), /CHAT_ACCESS_TOKEN/);
  const config = readConfig({NODE_ENV:'production',VERCEL:'1',CHAT_AUTH_MODE:'vercel',CHAT_ACCESS_TOKEN:'stale-token'});
  assert.equal(config.platformProtected, true);
  assert.equal(config.accessToken, '');
});

test('protected beta adapter streams without a second chat password and retains origin checks', async () => {
  const originalFetch = globalThis.fetch;
  const priorEnv = {...process.env};
  process.env.DASHSCOPE_API_KEY = 'test-key-not-real';
  process.env.VERCEL = '1';
  process.env.CHAT_AUTH_MODE = 'vercel';
  delete process.env.CHAT_ACCESS_TOKEN;
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    assert.equal(options.headers.Authorization, 'Bearer test-key-not-real');
    return new Response('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: [DONE]\n\n',
      {headers:{'Content-Type':'text/event-stream'}});
  };
  const server = http.createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await originalFetch(origin+'/api/index?route=health')).status, 200);
    assert.equal((await originalFetch(origin+'/api/index?route=unknown')).status, 404);
    const payload = JSON.stringify({persona:'calm',language:'en',messages:[{role:'user',content:'Hello'}]});
    assert.equal(calls, 0);
    const result = await originalFetch(origin+'/api/index?route=chat', {
      method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:payload
    });
    assert.equal(result.status, 200);
    const events = (await result.text()).trim().split('\n').map(JSON.parse);
    assert.deepEqual(events, [{type:'delta',text:'Hello'},{type:'done'}]);
    assert.equal(calls, 1);
    assert.equal((await originalFetch(origin+'/api/index?route=chat', {
      method:'POST',headers:{'Content-Type':'application/json',Origin:'https://other.example'},body:payload
    })).status, 403);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of ['DASHSCOPE_API_KEY','CHAT_ACCESS_TOKEN','VERCEL','CHAT_AUTH_MODE']) {
      if (priorEnv[key] === undefined) delete process.env[key]; else process.env[key] = priorEnv[key];
    }
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
