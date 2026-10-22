/* Streaming transport. Tokens and conversation stay in page memory. */
(function(root){
  'use strict';
  class ChatError extends Error { constructor(code){ super(code); this.code=code; } }
  async function streamChat({messages,persona='calm',language='zh',accessToken='',context,signal,onDelta=()=>{},onSuggestion=()=>{}},fetchImpl=globalThis.fetch){
    const headers={'Content-Type':'application/json'};if(accessToken)headers['X-Chat-Token']=accessToken;
    const response=await fetchImpl('api/chat',{method:'POST',headers,body:JSON.stringify({messages,persona,language,...(context?{context}:{})}),signal});
    if(!response.ok){let code='unavailable';try{code=(await response.json()).error||code;}catch{}throw new ChatError(code);}
    if(!response.body||!response.headers.get('content-type')?.includes('application/x-ndjson'))throw new ChatError('unavailable');
    const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',finished=false,suggestion=null;
    const abort=()=>{reader.cancel().catch(()=>{});};signal?.addEventListener('abort',abort,{once:true});
    try{
      while(true){
        if(signal?.aborted)throw new DOMException('Aborted','AbortError');
        const chunk=await reader.read();if(signal?.aborted)throw new DOMException('Aborted','AbortError');
        buffer+=chunk.done?decoder.decode():decoder.decode(chunk.value,{stream:true});
        if(buffer.length>262144)throw new ChatError('interrupted');
        let index;while((index=buffer.indexOf('\n'))>=0){
          const line=buffer.slice(0,index).trim();buffer=buffer.slice(index+1);if(!line)continue;
          const event=JSON.parse(line);
          if(event.type==='error')throw new ChatError(event.code||'interrupted');
          if(event.type==='delta'&&typeof event.text==='string')onDelta(event.text);
          if(event.type==='suggestion')suggestion=event.suggestion;
          if(event.type==='done'){finished=true;break;}
        }
        if(finished||chunk.done)break;
      }
      if(!finished)throw new ChatError('interrupted');
      if(signal?.aborted)throw new DOMException('Aborted','AbortError');
      if(suggestion)onSuggestion(suggestion);
    }finally{signal?.removeEventListener('abort',abort);await reader.cancel().catch(()=>{});reader.releaseLock();}
  }
  const api={streamChat,ChatError};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KoraChat=api;
})(typeof window==='undefined'?globalThis:window);
