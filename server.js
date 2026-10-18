const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const net = require('node:net');
const { promisify } = require('node:util');
const Database = require('better-sqlite3');

const scrypt = promisify(crypto.scrypt);
const host = process.env.HOST || (process.argv.includes('--network') ? '0.0.0.0' : '127.0.0.1');
const port = Number(process.env.PORT || 3000);
const secureCookies = process.env.COOKIE_SECURE === 'true';
const rootDirectory = __dirname;
const dataDirectory = path.join(rootDirectory, 'data');
const databasePath = path.join(dataDirectory, 'birthday.sqlite');
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const maxRequestBytes = 64 * 1024;
const cookieName = 'birthday_session';
const allowedColors = new Set(['Pink', 'Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Black', 'White']);
const allowedPronouns = new Set(['', 'she/her', 'he/him', 'they/them', 'use my name']);
const sessions = new Map();
const failedLogins = new Map();
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

fs.mkdirSync(dataDirectory, { recursive: true });
const database = new Database(databasePath);
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_salt BLOB NOT NULL,
    password_hash BLOB NOT NULL,
    name TEXT NOT NULL,
    birthday TEXT NOT NULL,
    pronouns TEXT NOT NULL DEFAULT '',
    favorite_color TEXT NOT NULL DEFAULT 'Pink',
    wish TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))
  )
`);

const userColumns = database.prepare('PRAGMA table_info(users)').all();
if (!userColumns.some((column) => column.name === 'role')) {
  database.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))");
}
if (!userColumns.some((column) => column.name === 'messages')) {
  database.exec("ALTER TABLE users ADD COLUMN messages TEXT NOT NULL DEFAULT ''");
}
database.exec(`
  CREATE TABLE IF NOT EXISTS user_progress (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    completed_games TEXT NOT NULL DEFAULT '[]',
    hard_wins INTEGER NOT NULL DEFAULT 0,
    daily_challenges_completed INTEGER NOT NULL DEFAULT 0,
    last_challenge_date TEXT
  );
  CREATE TABLE IF NOT EXISTS user_progress_events (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    PRIMARY KEY (user_id, event_id)
  )
`);
const existingAdmin = database.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
if (!existingAdmin) {
  database.prepare("UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users ORDER BY id LIMIT 1)").run();
}

const createUser = database.prepare(`
  INSERT INTO users (username, password_salt, password_hash, name, birthday, pronouns, favorite_color, wish, messages, role)
  VALUES (@username, @passwordSalt, @passwordHash, @name, @birthday, @pronouns, @favoriteColor, @wish, @messages, @role)
`);
const findUserByUsername = database.prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE');
const findUserById = database.prepare('SELECT * FROM users WHERE id = ?');
const countUsers = database.prepare('SELECT COUNT(*) AS count FROM users');
const listAdminUsers = database.prepare(`
  SELECT id, username, name, birthday, pronouns, favorite_color, wish, role, created_at
  FROM users
  WHERE username LIKE @term ESCAPE '\\' COLLATE NOCASE OR name LIKE @term ESCAPE '\\' COLLATE NOCASE
  ORDER BY id
  LIMIT 200
`);
const countAdminUsers = database.prepare(`
  SELECT COUNT(*) AS count
  FROM users
  WHERE username LIKE @term ESCAPE '\\' COLLATE NOCASE OR name LIKE @term ESCAPE '\\' COLLATE NOCASE
`);
const findAdminTarget = database.prepare('SELECT id, role FROM users WHERE id = ?');
const deleteRegularUser = database.prepare("DELETE FROM users WHERE id = ? AND role = 'user'");
const updateUserProfile = database.prepare(`
  UPDATE users
  SET name = @name, birthday = @birthday, pronouns = @pronouns, favorite_color = @favoriteColor, wish = @wish, messages = @messages
  WHERE id = @id
`);
const getUserProgress = database.prepare('SELECT * FROM user_progress WHERE user_id = ?');
const getProgressEvent = database.prepare('SELECT 1 FROM user_progress_events WHERE user_id = ? AND event_id = ?');
const insertProgressEvent = database.prepare('INSERT INTO user_progress_events (user_id, event_id) VALUES (?, ?)');
const upsertUserProgress = database.prepare(`
  INSERT INTO user_progress (user_id, games_played, wins, completed_games, hard_wins, daily_challenges_completed, last_challenge_date)
  VALUES (@userId, 1, 1, @completedGames, @hardWins, @dailyCompleted, @challengeDate)
  ON CONFLICT(user_id) DO UPDATE SET
    games_played = games_played + 1,
    wins = wins + 1,
    completed_games = excluded.completed_games,
    hard_wins = hard_wins + excluded.hard_wins,
    daily_challenges_completed = daily_challenges_completed + excluded.daily_challenges_completed,
    last_challenge_date = COALESCE(excluded.last_challenge_date, last_challenge_date)
`);
const deleteOwnUser = database.prepare('DELETE FROM users WHERE id = ?');

function sendJson(response, statusCode, payload, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map((item) => {
    const separator = item.indexOf('=');
    if (separator < 0) return ['', ''];
    return [item.slice(0, separator).trim(), decodeURIComponent(item.slice(separator + 1).trim())];
  }).filter(([key]) => key));
}

function setSessionCookie(response, token) {
  const secure = secureCookies ? '; Secure' : '';
  response.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeMs / 1000}${secure}`);
}

function clearSessionCookie(response) {
  const secure = secureCookies ? '; Secure' : '';
  response.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  sessions.set(token, { userId, expiresAt: Date.now() + sessionLifetimeMs });
  return token;
}

function getAuthenticatedUser(request) {
  const token = parseCookies(request.headers.cookie)[cookieName];
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  const user = findUserById.get(session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + sessionLifetimeMs;
  return { token, user };
}

function publicUser(user) {
  return {
    username: user.username,
    role: user.role,
    profile: {
      name: user.name,
      birthday: user.birthday,
      pronouns: user.pronouns,
      favoriteColor: user.favorite_color,
      wish: user.wish,
      messages: user.messages || ''
    }
  };
}

function adminUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    birthday: user.birthday,
    pronouns: user.pronouns,
    favoriteColor: user.favorite_color,
    wish: user.wish,
    role: user.role,
    createdAt: user.created_at
  };
}

function requireAdmin(request, response) {
  const auth = getAuthenticatedUser(request);
  if (!auth) {
    sendError(response, 401, 'Log in with the administrator account to continue.');
    return null;
  }
  if (auth.user.role !== 'admin') {
    sendError(response, 403, 'Administrator access is required.');
    return null;
  }
  return auth;
}

function escapeLikeTerm(term) {
  return `%${term.replace(/[\\%_]/g, '\\$&')}%`;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    value <= new Date().toISOString().slice(0, 10);
}

function validateProfile(body) {
  if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 80) {
    return 'Name is required and must be 80 characters or fewer.';
  }
  if (!isValidDate(body.birthday)) return 'Enter a valid date of birth that is not in the future.';
  if (typeof body.pronouns !== 'string' || !allowedPronouns.has(body.pronouns)) return 'Choose a valid pronoun option.';
  if (typeof body.favoriteColor !== 'string' || !allowedColors.has(body.favoriteColor)) return 'Choose a valid favorite color.';
  if (typeof body.wish !== 'string' || body.wish.length > 250) return 'Birthday wish must be 250 characters or fewer.';
  if (body.messages !== undefined && (typeof body.messages !== 'string' || body.messages.length > 1000)) {
    return 'Birthday messages must be 1,000 characters or fewer.';
  }
  return null;
}

function normalizeProfile(body) {
  return {
    name: body.name.trim(),
    birthday: body.birthday,
    pronouns: body.pronouns,
    favoriteColor: body.favoriteColor,
    wish: body.wish.trim(),
    messages: (body.messages || '').trim()
  };
}

function validUsername(username) {
  return typeof username === 'string' &&
    username.length >= 3 &&
    username.length <= 32 &&
    /^[A-Za-z0-9_.-]+$/.test(username);
}

function getClientAddress(request) {
  return request.socket.remoteAddress || 'unknown';
}

function isRateLimited(key) {
  const record = failedLogins.get(key);
  if (!record) return false;
  if (record.resetAt <= Date.now()) {
    failedLogins.delete(key);
    return false;
  }
  return record.count >= 10;
}

function recordFailedLogin(key) {
  const current = failedLogins.get(key);
  if (!current || current.resetAt <= Date.now()) {
    failedLogins.set(key, { count: 1, resetAt: Date.now() + 15 * 60 * 1000 });
    return;
  }
  current.count += 1;
}

function clearLoginFailures(key) {
  failedLogins.delete(key);
}

function validateLocalRequest(request, response) {
  const hostHeader = request.headers.host || '';
  let hostUrl;
  try {
    hostUrl = new URL(`http://${hostHeader}`);
  } catch {
    sendError(response, 400, 'Invalid request host.');
    return false;
  }
  if (hostUrl.port !== String(port) || !isAllowedRequestAddress(hostUrl.hostname)) {
    sendError(response, 400, 'Requests must use localhost or a private network address.');
    return false;
  }

  const origin = request.headers.origin;
  if (origin) {
    let originUrl;
    try {
      originUrl = new URL(origin);
    } catch {
      sendError(response, 403, 'Invalid request origin.');
      return false;
    }
    if (originUrl.protocol !== 'http:' || originUrl.port !== String(port) ||
      originUrl.hostname !== hostUrl.hostname || !isAllowedRequestAddress(originUrl.hostname)) {
      sendError(response, 403, 'Cross-origin requests are not allowed.');
      return false;
    }
  }
  return true;
}

function isAllowedRequestAddress(address) {
  const hostname = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (hostname === 'localhost') return true;
  const version = net.isIP(hostname);
  if (version === 4) {
    const octets = hostname.split('.').map(Number);
    return octets[0] === 10 ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      octets[0] === 127;
  }
  return version === 6 &&
    (hostname === '::1' || hostname.startsWith('fc') || hostname.startsWith('fd') || hostname.startsWith('fe80:'));
}

function serializeProgress(progress) {
  if (!progress) {
    return {
      gamesPlayed: 0,
      wins: 0,
      completedGames: [],
      hardWins: 0,
      dailyChallengesCompleted: 0,
      lastChallengeDate: null
    };
  }
  return {
    gamesPlayed: progress.games_played,
    wins: progress.wins,
    completedGames: JSON.parse(progress.completed_games),
    hardWins: progress.hard_wins,
    dailyChallengesCompleted: progress.daily_challenges_completed,
    lastChallengeDate: progress.last_challenge_date
  };
}

function readJson(request) {
  const contentType = request.headers['content-type']?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    return Promise.reject(Object.assign(new Error('Content-Type must be application/json.'), { statusCode: 415 }));
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxRequestBytes) {
        reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        request.resume();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          reject(Object.assign(new Error('Request body must be a JSON object.'), { statusCode: 400 }));
          return;
        }
        resolve(body);
      } catch {
        reject(Object.assign(new Error('Request body must be valid JSON.'), { statusCode: 400 }));
      }
    });
    request.on('error', reject);
  });
}

function sendStaticFile(response, filePath, headers = {}) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendError(response, error.code === 'ENOENT' ? 404 : 500, error.code === 'ENOENT' ? 'Page not found.' : 'Unable to read the requested page.');
      return;
    }
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      ...headers
    });
    response.end(content);
  });
}

async function handleApi(request, response, url) {
  if (!validateLocalRequest(request, response)) return;

  if (request.method === 'GET' && url.pathname === '/api/me') {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      sendJson(response, 200, { user: null });
      return;
    }
    sendJson(response, 200, { user: publicUser(auth.user) });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/signup') {
    const body = await readJson(request);
    if (!validUsername(body.username)) {
      sendError(response, 400, 'Username must be 3–32 characters using letters, numbers, dot, underscore, or hyphen.');
      return;
    }
    if (typeof body.password !== 'string' || body.password.length < 6 || body.password.length > 128) {
      sendError(response, 400, 'Password must be between 6 and 128 characters.');
      return;
    }
    const profileError = validateProfile(body);
    if (profileError) {
      sendError(response, 400, profileError);
      return;
    }

    const username = body.username.toLowerCase();
    if (findUserByUsername.get(username)) {
      sendError(response, 409, 'That username is already taken. Choose another one.');
      return;
    }

    const passwordSalt = crypto.randomBytes(16);
    const passwordHash = await scrypt(body.password, passwordSalt, 64);
    const profile = normalizeProfile(body);
    let userId;
    try {
      const createAccount = database.transaction(() => {
        const role = countUsers.get().count === 0 ? 'admin' : 'user';
        const result = createUser.run({
          username,
          passwordSalt,
          passwordHash,
          ...profile,
          role
        });
        return { id: Number(result.lastInsertRowid), role };
      });
      userId = createAccount().id;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        sendError(response, 409, 'That username is already taken. Choose another one.');
        return;
      }
      throw error;
    }

    const token = createSession(userId);
    setSessionCookie(response, token);
    sendJson(response, 201, publicUser(findUserById.get(userId)));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/users') {
    if (!requireAdmin(request, response)) return;
    const term = (url.searchParams.get('q') || '').trim();
    if (term.length > 80) {
      sendError(response, 400, 'Search must be 80 characters or fewer.');
      return;
    }
    const parameters = { term: escapeLikeTerm(term) };
    const users = listAdminUsers.all(parameters).map(adminUser);
    sendJson(response, 200, {
      users,
      total: countAdminUsers.get(parameters).count,
      limit: 200
    });
    return;
  }

  if (request.method === 'DELETE' && /^\/api\/admin\/users\/\d+$/.test(url.pathname)) {
    if (!requireAdmin(request, response)) return;
    const userId = Number(url.pathname.split('/').at(-1));
    if (!Number.isSafeInteger(userId) || userId < 1) {
      sendError(response, 400, 'Invalid user id.');
      return;
    }
    const target = findAdminTarget.get(userId);
    if (!target) {
      sendError(response, 404, 'User account not found.');
      return;
    }
    if (target.role === 'admin') {
      sendError(response, 403, 'Administrator accounts cannot be deleted from this page.');
      return;
    }
    deleteRegularUser.run(userId);
    for (const [token, session] of sessions) {
      if (session.userId === userId) sessions.delete(token);
    }
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/login') {
    const body = await readJson(request);
    if (typeof body.username !== 'string' || typeof body.password !== 'string') {
      sendError(response, 400, 'Enter your username and password.');
      return;
    }
    const rateKey = `${getClientAddress(request)}:${body.username.toLowerCase().slice(0, 32)}`;
    if (isRateLimited(rateKey)) {
      sendError(response, 429, 'Too many unsuccessful attempts. Try again in 15 minutes.');
      return;
    }
    const user = findUserByUsername.get(body.username);
    const salt = user ? user.password_salt : Buffer.alloc(16);
    const storedHash = user ? user.password_hash : Buffer.alloc(64);
    const submittedHash = await scrypt(body.password, salt, 64);
    const passwordMatches = crypto.timingSafeEqual(storedHash, submittedHash);
    if (!user || !passwordMatches) {
      recordFailedLogin(rateKey);
      sendError(response, 401, 'Username or password is incorrect.');
      return;
    }

    clearLoginFailures(rateKey);
    const token = createSession(user.id);
    setSessionCookie(response, token);
    sendJson(response, 200, publicUser(user));
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/logout') {
    const auth = getAuthenticatedUser(request);
    if (auth) sessions.delete(auth.token);
    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/progress') {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      sendError(response, 401, 'Your session has expired. Please log in again.');
      return;
    }
    sendJson(response, 200, { progress: serializeProgress(getUserProgress.get(auth.user.id)) });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/progress') {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      sendError(response, 401, 'Your session has expired. Please log in again.');
      return;
    }
    const body = await readJson(request);
    const validGames = new Set(['stars', 'balloons', 'quiz', 'memory', 'scramble', 'party', 'sequence']);
    if (typeof body.game !== 'string' || !validGames.has(body.game)) {
      sendError(response, 400, 'Choose a valid game to save progress.');
      return;
    }
    if (!['easy', 'normal', 'hard'].includes(body.difficulty)) {
      sendError(response, 400, 'Choose a valid difficulty.');
      return;
    }
    if (body.eventId !== undefined &&
      (typeof body.eventId !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(body.eventId))) {
      sendError(response, 400, 'Progress event ID is invalid.');
      return;
    }
    if (body.challengeDate !== null && body.challengeDate !== undefined &&
      (!isValidDate(body.challengeDate) || body.challengeDate !== new Date().toISOString().slice(0, 10))) {
      sendError(response, 400, 'Daily challenge date is invalid or has expired.');
      return;
    }

    const saveProgress = database.transaction(() => {
      if (body.eventId && getProgressEvent.get(auth.user.id, body.eventId)) {
        return serializeProgress(getUserProgress.get(auth.user.id));
      }
      if (body.eventId) insertProgressEvent.run(auth.user.id, body.eventId);
      const existing = getUserProgress.get(auth.user.id);
      const progress = serializeProgress(existing);
      const completedGames = new Set(progress.completedGames);
      completedGames.add(body.game);
      const challengeDate = body.challengeDate || null;
      const isNewDailyChallenge = challengeDate !== null && progress.lastChallengeDate !== challengeDate;
      upsertUserProgress.run({
        userId: auth.user.id,
        completedGames: JSON.stringify([...completedGames]),
        hardWins: body.difficulty === 'hard' ? 1 : 0,
        dailyCompleted: isNewDailyChallenge ? 1 : 0,
        challengeDate: isNewDailyChallenge ? challengeDate : null
      });
      return serializeProgress(getUserProgress.get(auth.user.id));
    });
    sendJson(response, 200, { progress: saveProgress() });
    return;
  }

  if (request.method === 'DELETE' && url.pathname === '/api/account') {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      sendError(response, 401, 'Your session has expired. Please log in again.');
      return;
    }
    deleteOwnUser.run(auth.user.id);
    for (const [token, session] of sessions) {
      if (session.userId === auth.user.id) sessions.delete(token);
    }
    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'PUT' && url.pathname === '/api/profile') {
    const auth = getAuthenticatedUser(request);
    if (!auth) {
      sendError(response, 401, 'Your session has expired. Please log in again.');
      return;
    }
    const body = await readJson(request);
    const profileError = validateProfile(body);
    if (profileError) {
      sendError(response, 400, profileError);
      return;
    }
    updateUserProfile.run({ id: auth.user.id, ...normalizeProfile(body) });
    sendJson(response, 200, publicUser(findUserById.get(auth.user.id)));
    return;
  }

  sendError(response, 404, 'API endpoint not found.');
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(request, response, url).catch((error) => {
      if (response.headersSent || response.destroyed) return;
      const statusCode = error.statusCode || 500;
      if (statusCode >= 500) console.error('Request failed:', error);
      sendError(response, statusCode, statusCode >= 500 ? 'The server could not complete the request.' : error.message);
    });
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendError(response, 405, 'Method not allowed.');
    return;
  }

  const routes = new Map([
    ['/', 'index.html'],
    ['/index.html', 'index.html'],
    ['/birthday', 'birthday/index.html'],
    ['/birthday/', 'birthday/index.html'],
    ['/birthday/index.html', 'birthday/index.html'],
    ['/birthday/style.css', 'birthday/style.css'],
    ['/birthday/script.js', 'birthday/script.js'],
    ['/birthday/manifest.webmanifest', 'birthday/manifest.webmanifest'],
    ['/birthday/sw.js', 'birthday/sw.js'],
    ['/birthday/icon.svg', 'birthday/icon.svg'],
    ['/admin', 'admin/index.html'],
    ['/admin/', 'admin/index.html'],
    ['/admin/index.html', 'admin/index.html'],
    ['/admin/style.css', 'admin/style.css'],
    ['/admin/script.js', 'admin/script.js']
  ]);
  const relativePath = routes.get(url.pathname);
  if (!relativePath) {
    sendError(response, 404, 'Page not found.');
    return;
  }

  const filePath = path.join(rootDirectory, relativePath);
  if (request.method === 'HEAD') {
    fs.stat(filePath, (error, stats) => {
      if (error || !stats.isFile()) {
        sendError(response, 404, 'Page not found.');
        return;
      }
      response.writeHead(200, {
        'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
        'Content-Length': stats.size,
        'X-Content-Type-Options': 'nosniff'
      });
      response.end();
    });
    return;
  }
  sendStaticFile(response, filePath, url.pathname === '/birthday/sw.js' ? {
    'Service-Worker-Allowed': '/birthday/',
    'Cache-Control': 'no-cache'
  } : {});
});

server.listen(port, host, () => {
  if (host === '0.0.0.0') {
    console.log(`Birthday Wishes is available to devices on this network at http://<this-computer-ip>:${port}/birthday/`);
  } else {
    console.log(`Birthday Wishes is running at http://${host}:${port}/birthday/`);
  }
});

server.on('error', (error) => {
  console.error('Unable to start Birthday Wishes:', error);
  process.exitCode = 1;
});
