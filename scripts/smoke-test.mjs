const api = process.env.SMOKE_API_URL ?? 'http://localhost:4000/api/v1';
const web = process.env.SMOKE_WEB_URL ?? 'http://localhost:3000';

async function check(name, url, predicate) {
  const response = await fetch(url);
  const body = await response.text();
  if (!response.ok || !predicate(body)) throw new Error(`${name} failed: ${response.status}`);
  console.log(`✓ ${name}`);
}

await check('API health', `${api}/health`, (body) => body.includes('"status":"ok"'));
await check('Published jobs', `${api}/jobs`, (body) => body.includes('Registered Nurse'));
await check('Web home page', web, (body) => body.includes('Great people'));
console.log('Smoke tests passed.');
