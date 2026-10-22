import { createApplication, readConfig } from '../server/index.mjs';

// Reuse validation and streaming; protected previews admit users via share links.
// NODEJS_HELPERS=0 leaves the request stream intact for its bounded body reader.
let application;
export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const route = url.searchParams.get('route');
  if (!['chat', 'health'].includes(route)) {
    res.writeHead(404, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({error:'not_found'}));
    return;
  }
  if (!application) {
    const config = readConfig();
    if (!config.apiKey || !config.platformProtected && config.accessToken.length < 16) throw new Error('Beta deployment requires server credentials and protected access.');
    application = createApplication({config});
  }
  req.url = '/api/' + route;
  const cancel = () => res.destroy();
  req.once('error', cancel);
  try { await application.listeners('request')[0](req, res); }
  finally { req.off('error', cancel); }
}
