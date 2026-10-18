const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const server = require('../index.js');

const environmentKeys = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SESSION_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD'
];
const originalEnvironment = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));
let baseUrl;

before(async () => {
  for (const key of environmentKeys) delete process.env[key];
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  for (const key of environmentKeys) {
    if (originalEnvironment[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnvironment[key];
  }
});

test('serves the birthday and admin pages from the Node entrypoint', async () => {
  const birthday = await fetch(`${baseUrl}/`);
  assert.equal(birthday.status, 200);
  assert.match(birthday.headers.get('content-type'), /text\/html/);
  assert.match(await birthday.text(), /Birthday Game Reveal/);

  const admin = await fetch(`${baseUrl}/admin/`);
  assert.equal(admin.status, 200);
  assert.match(admin.headers.get('content-type'), /text\/html/);
  assert.match(await admin.text(), /Birthday Wishes · Admin/);
});

test('serves static assets while preventing paths outside the app folders', async () => {
  const asset = await fetch(`${baseUrl}/birthday/style.css`);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('content-type'), /text\/css/);

  const traversal = await fetch(`${baseUrl}/birthday/%2e%2e%2fapi/index.js`);
  assert.equal(traversal.status, 404);
});

test('forwards API requests to the configured hosted API handler', async () => {
  const response = await fetch(`${baseUrl}/api/me`);
  assert.equal(response.status, 503);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.match((await response.json()).error, /not configured/);
});
