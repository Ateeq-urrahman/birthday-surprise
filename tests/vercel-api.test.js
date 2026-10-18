const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const crypto = require('node:crypto');
const apiHandler = require('../api/index.js');

const originalFetch = global.fetch;
const environmentKeys = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SESSION_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD'
];
const originalEnvironment = Object.fromEntries(environmentKeys.map((key) => [key, process.env[key]]));
const users = [];
const progress = new Map();
const progressEvents = new Set();
const loginAttempts = new Map();
let nextUserId = 1;

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(data);
    }
  };
}

function sessionCookie(response) {
  const cookie = response.headers['Set-Cookie'];
  assert.ok(cookie, 'expected an authentication cookie');
  return cookie.split(';', 1)[0];
}

async function request(route, { method = 'GET', body, cookie, query = '', origin = 'https://birthday.example', host = 'birthday.example', ip = '203.0.113.7' } = {}) {
  const requestUrl = `/api/index?path=${encodeURIComponent(route)}${query}`;
  const request = {
    method,
    url: requestUrl,
    headers: {
      host,
      origin,
      'sec-fetch-site': 'same-origin',
      'x-real-ip': ip,
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {})
    },
    body
  };
  const response = {
    headers: {},
    headersSent: false,
    destroyed: false,
    writeHead(status, headers) {
      this.status = status;
      Object.assign(this.headers, headers);
      this.headersSent = true;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(value = '') {
      this.body = value;
    }
  };
  await apiHandler(request, response);
  return {
    status: response.status,
    headers: response.headers,
    body: response.body ? JSON.parse(response.body) : null
  };
}

function userFromQuery(searchParams) {
  const id = searchParams.get('id')?.match(/^eq\.(\d+)$/)?.[1];
  const username = searchParams.get('username')?.match(/^eq\.(.*)$/)?.[1];
  return users.filter((user) =>
    (!id || user.id === Number(id)) &&
    (!username || user.username === decodeURIComponent(username))
  );
}

function createMockFetch() {
  return async (requestUrl, options = {}) => {
    const url = new URL(requestUrl);
    const path = url.pathname.replace('/rest/v1/', '');
    const body = options.body ? JSON.parse(options.body) : null;
    if (path.startsWith('rpc/')) {
      const rpcName = path.slice(4);
      if (rpcName === 'is_login_rate_limited') {
        const attempt = loginAttempts.get(body.p_key_hash);
        return jsonResponse(Boolean(attempt && attempt.failures >= 10));
      }
      if (rpcName === 'record_login_failure') {
        const attempt = loginAttempts.get(body.p_key_hash) || { failures: 0 };
        attempt.failures += 1;
        loginAttempts.set(body.p_key_hash, attempt);
        return jsonResponse(null);
      }
      if (rpcName === 'clear_login_failures') {
        loginAttempts.delete(body.p_key_hash);
        return jsonResponse(null);
      }
      if (rpcName === 'record_game_win') {
        const key = `${body.p_user_id}:${body.p_event_id}`;
        let current = progress.get(body.p_user_id);
        if (!progressEvents.has(key)) {
          progressEvents.add(key);
          current ||= {
            games_played: 0,
            wins: 0,
            completed_games: [],
            hard_wins: 0,
            daily_challenges_completed: 0,
            last_challenge_date: null
          };
          current.games_played += 1;
          current.wins += 1;
          if (!current.completed_games.includes(body.p_game)) current.completed_games.push(body.p_game);
          if (body.p_difficulty === 'hard') current.hard_wins += 1;
          if (body.p_challenge_date && current.last_challenge_date !== body.p_challenge_date) {
            current.daily_challenges_completed += 1;
            current.last_challenge_date = body.p_challenge_date;
          }
          progress.set(body.p_user_id, current);
        }
        return jsonResponse(progress.get(body.p_user_id));
      }
      if (rpcName === 'search_admin_users') {
        const term = String(body.search_term || '').toLowerCase();
        const matches = users.filter((user) =>
          user.username.includes(term) || user.name.toLowerCase().includes(term));
        return jsonResponse({
          users: matches.slice(0, 200).map(({ password_salt, password_hash, ...user }) => user),
          total: matches.length,
          limit: 200
        });
      }
      throw new Error(`Unexpected RPC: ${rpcName}`);
    }

    if (path.startsWith('users')) {
      const filtered = userFromQuery(url.searchParams);
      if (options.method === 'POST') {
        if (users.some((user) => user.username === body.username)) {
          return jsonResponse({ code: '23505' }, 409);
        }
        const user = {
          id: nextUserId++,
          ...body,
          created_at: new Date().toISOString()
        };
        users.push(user);
        return jsonResponse([user], 201);
      }
      if (options.method === 'PATCH') {
        Object.assign(filtered[0], body);
        return jsonResponse(filtered);
      }
      if (options.method === 'DELETE') {
        const target = filtered[0];
        if (target) {
          users.splice(users.indexOf(target), 1);
          progress.delete(target.id);
        }
        return jsonResponse(null);
      }
      return jsonResponse(filtered.map((user) => {
        const fields = url.searchParams.get('select');
        if (!fields || fields === '*') return user;
        return Object.fromEntries(fields.split(',').map((field) => [field, user[field]]));
      }));
    }

    if (path.startsWith('user_progress')) {
      const userId = Number(url.searchParams.get('user_id')?.replace('eq.', ''));
      if (options.method === 'POST') {
        if (!progress.has(body.user_id)) {
          progress.set(body.user_id, {
            games_played: 0,
            wins: 0,
            completed_games: [],
            hard_wins: 0,
            daily_challenges_completed: 0,
            last_challenge_date: null
          });
        }
        return jsonResponse(null);
      }
      const saved = progress.get(userId);
      return jsonResponse(saved ? [saved] : []);
    }

    throw new Error(`Unexpected database path: ${path}`);
  };
}

before(() => {
  process.env.SUPABASE_URL = 'https://database.example';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  process.env.SESSION_SECRET = 'test-session-secret-with-at-least-32-characters';
  process.env.ADMIN_USERNAME = 'site-admin';
  process.env.ADMIN_PASSWORD = 'A-Private-Admin-Password-123!';
  global.fetch = createMockFetch();
});

after(() => {
  global.fetch = originalFetch;
  for (const key of environmentKeys) {
    if (originalEnvironment[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnvironment[key];
  }
});

test('requires Vercel and Supabase environment configuration', async () => {
  const savedSecret = process.env.SESSION_SECRET;
  delete process.env.SESSION_SECRET;
  const response = await request('/me');
  process.env.SESSION_SECRET = savedSecret;
  assert.equal(response.status, 503);
  assert.match(response.body.error, /environment variables/);
});

test('reserves the configured administrator username and grants admin only with its secret password', async () => {
  const profile = {
    username: 'site-admin',
    password: 'Wrong-Admin-Password-123!',
    name: 'Configured Administrator',
    birthday: '1990-05-06',
    pronouns: 'they/them',
    favoriteColor: 'Teal',
    wish: '',
    messages: ''
  };
  const blocked = await request('/signup', { method: 'POST', body: profile });
  assert.equal(blocked.status, 409);
  assert.equal(users.length, 0);

  profile.password = process.env.ADMIN_PASSWORD;
  const created = await request('/signup', { method: 'POST', body: profile });
  assert.equal(created.status, 201);
  assert.equal(created.body.role, 'admin');
  assert.equal(created.body.profile.messages, '');
  assert.equal(created.body.password_hash, undefined);
  assert.match(created.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Strict/);
  const savedAdmin = users.find((user) => user.username === 'site-admin');
  assert.ok(savedAdmin);
  assert.match(savedAdmin.password_salt, /^[a-f0-9]{32}$/);
  assert.match(savedAdmin.password_hash, /^[a-f0-9]{128}$/);
});

test('accepts six-character passwords and rejects shorter signup passwords', async () => {
  const profile = {
    username: 'minimum-pass',
    password: '12345',
    name: 'Minimum Password',
    birthday: '1990-05-06',
    pronouns: '',
    favoriteColor: 'Pink',
    wish: '',
    messages: ''
  };
  const tooShort = await request('/signup', { method: 'POST', body: profile });
  assert.equal(tooShort.status, 400);
  assert.match(tooShort.body.error, /between 6 and 128 characters/);

  profile.password = '123456';
  const accepted = await request('/signup', { method: 'POST', body: profile });
  assert.equal(accepted.status, 201);
});

test('supports account, profile, idempotent progress, administration, and account deletion', async () => {
  const adminLogin = await request('/login', {
    method: 'POST',
    body: { username: 'site-admin', password: process.env.ADMIN_PASSWORD }
  });
  assert.equal(adminLogin.status, 200);
  const adminCookie = sessionCookie(adminLogin);
  const adminFromUserTable = users.find((user) => user.username === 'site-admin');
  assert.ok(adminFromUserTable);

  const profile = {
    username: 'birthday-user',
    password: 'User-Password-123456!',
    name: 'Birthday User',
    birthday: '1994-04-05',
    pronouns: 'she/her',
    favoriteColor: 'Blue',
    wish: 'A lovely year',
    messages: 'Happy birthday!'
  };
  const signup = await request('/signup', { method: 'POST', body: profile });
  assert.equal(signup.status, 201);
  assert.equal(signup.body.role, 'user');
  const userCookie = sessionCookie(signup);

  const current = await request('/me', { cookie: userCookie });
  assert.equal(current.body.user.username, 'birthday-user');
  const deniedAdminAccess = await request('/admin/users', { cookie: userCookie });
  assert.equal(deniedAdminAccess.status, 403);
  const savedProfile = await request('/profile', {
    method: 'PUT',
    cookie: userCookie,
    body: { ...profile, favoriteColor: 'Purple', messages: 'Another birthday note.' }
  });
  assert.equal(savedProfile.body.profile.favoriteColor, 'Purple');
  assert.equal(savedProfile.body.profile.messages, 'Another birthday note.');

  const eventId = crypto.randomBytes(16).toString('hex');
  const win = { eventId, game: 'balloons', difficulty: 'hard', challengeDate: null };
  const firstWin = await request('/progress', { method: 'POST', cookie: userCookie, body: win });
  const retryWin = await request('/progress', { method: 'POST', cookie: userCookie, body: win });
  assert.equal(firstWin.body.progress.wins, 1);
  assert.equal(retryWin.body.progress.wins, 1);
  assert.equal(retryWin.body.progress.hardWins, 1);

  const invalidWin = await request('/progress', {
    method: 'POST',
    cookie: userCookie,
    body: { ...win, eventId: 'bad' }
  });
  assert.equal(invalidWin.status, 400);

  const search = await request('/admin/users', {
    cookie: adminCookie,
    query: '&q=birthday-user'
  });
  assert.equal(search.status, 200);
  assert.equal(search.body.total, 1);
  assert.equal(search.body.users[0].username, 'birthday-user');
  const protectedAdmin = await request(`/admin/users/${adminFromUserTable.id}`, {
    method: 'DELETE',
    cookie: adminCookie
  });
  assert.equal(protectedAdmin.status, 403);

  const createdUser = users.find((user) => user.username === 'birthday-user');
  assert.ok(createdUser);
  const deleted = await request(`/admin/users/${createdUser.id}`, {
    method: 'DELETE',
    cookie: adminCookie
  });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.ok, true);
  const expiredSession = await request('/progress', { cookie: userCookie });
  assert.equal(expiredSession.status, 401);
});

test('rejects cross-origin account changes and rate-limits repeated failed logins', async () => {
  const crossOrigin = await request('/logout', {
    method: 'POST',
    origin: 'https://attacker.example'
  });
  assert.equal(crossOrigin.status, 403);

  const firstFailure = await request('/login', {
    method: 'POST',
    body: { username: 'missing-user', password: 'Wrong-Password-123!' },
    ip: '198.51.100.55'
  });
  assert.equal(firstFailure.status, 401);
  for (let attempt = 1; attempt < 10; attempt += 1) {
    await request('/login', {
      method: 'POST',
      body: { username: 'missing-user', password: 'Wrong-Password-123!' },
      ip: '198.51.100.55'
    });
  }
  const throttled = await request('/login', {
    method: 'POST',
    body: { username: 'missing-user', password: 'Wrong-Password-123!' },
    ip: '198.51.100.55'
  });
  assert.equal(throttled.status, 429);
});
