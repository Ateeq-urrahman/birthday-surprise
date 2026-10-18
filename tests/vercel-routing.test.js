const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const projectRoot = path.join(__dirname, '..');
const vercelConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'vercel.json'), 'utf8'));
const packageConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));

test('Vercel entry routes point to the app and admin pages', () => {
  assert.equal(vercelConfig.framework, null);
  assert.equal(packageConfig.main, 'api/index.js');
  const rewrites = new Map(vercelConfig.rewrites.map(({ source, destination }) => [source, destination]));
  assert.equal(rewrites.get('/'), '/birthday/index.html');
  assert.equal(rewrites.get('/admin'), '/admin/index.html');
});

test('entry page assets resolve from their public routes', () => {
  const pages = [
    { file: 'birthday/index.html', prefix: '/birthday/' },
    { file: 'admin/index.html', prefix: '/admin/' }
  ];

  for (const { file, prefix } of pages) {
    const html = fs.readFileSync(path.join(projectRoot, file), 'utf8');
    const assets = [...html.matchAll(/(?:href|src)="([^"]+\.(?:css|js))"/g)].map((match) => match[1]);

    assert.ok(assets.length > 0, `${file} should declare stylesheet and script assets`);
    for (const asset of assets) {
      assert.ok(asset.startsWith(prefix), `${file} asset ${asset} should use the ${prefix} route`);
      assert.ok(fs.existsSync(path.join(projectRoot, asset.slice(1))), `${asset} should exist`);
    }
  }
});
