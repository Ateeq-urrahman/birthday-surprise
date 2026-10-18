const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const cookieName = '__Host-birthday_session';
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const maxRequestBytes = 64 * 1024;
const allowedColors = new Set(['Pink', 'Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Purple', 'Black', 'White']);
const allowedPronouns = new Set(['', 'she/her', 'he/him', 'they/them', 'use my name']);
const validGames = new Set(['stars', 'balloons', 'quiz', 'memory', 'scramble', 'party', 'sequence']);

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getConfig() {
  const config = {
    supabaseUrl: process.env.SUPABASE_URL?.replace(/\/+$/, ''),
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    sessionSecret: process.env.SESSION_SECRET,
    adminUsername: process.env.ADMIN_USERNAME?.trim().toLowerCase(),
    adminPassword: process.env.ADMIN_PASSWORD
  };
  if (!config.supabaseUrl || !config.supabaseKey ||
      !config.sessionSecret || config.sessionSecret.length < 32 ||
      !validUsername(config.adminUsername) || !config.adminPassword ||
      config.adminPassword.length < 16 || config.adminPassword.length > 128) {
    throw new RequestError(503, 'The hosted app is not configured yet. Check its Vercel environment variables.');
  }
  let supabaseUrl;
  try {
    supabaseUrl = new URL(config.supabaseUrl);
  } catch {
    throw new RequestError(503, 'The hosted app has an invalid Supabase URL configuration.');
  }
  if (supabaseUrl.protocol !== 'https:') {
    throw new RequestError(503, 'The hosted app requires an HTTPS Supabase URL.');
  }
  return config;
}

function validUsername(username) {
  return typeof username === 'string' &&
    username.length >= 3 &&
    username.length <= 32 &&
    /^[A-Za-z0-9_.-]+$/.test(username);
}

function safeEqual(first, second) {
  const firstHash = crypto.createHash('sha256').update(first).digest();
  const secondHash = crypto.createHash('sha256').update(second).digest();
  return crypto.timingSafeEqual(firstHash, secondHash);
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'same-origin',
    ...headers
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, status, message) {
  sendJson(response, status, { error: message });
}

function getRequestBody(request) {
  const contentType = request.headers['content-type']?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw new RequestError(415, 'Content-Type must be application/json.');
  }
  const body = request.body;
  if (body === undefined || body === null || body === '') {
    throw new RequestError(400, 'Request body must be a JSON object.');
  }
  let parsed = body;
  if (Buffer.isBuffer(body) || typeof body === 'string') {
    const serialized = Buffer.isBuffer(body) ? body.toString('utf8') : body;
    if (Buffer.byteLength(serialized) > maxRequestBytes) throw new RequestError(413, 'Request body is too large.');
    try {
      parsed = JSON.parse(serialized);
    } catch {
      throw new RequestError(400, 'Request body must be valid JSON.');
    }
  } else if (Buffer.byteLength(JSON.stringify(body)) > maxRequestBytes) {
    throw new RequestError(413, 'Request body is too large.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new RequestError(400, 'Request body must be a JSON object.');
  }
  return parsed;
}

function validateOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) {
    const fetchSite = request.headers['sec-fetch-site'];
    if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
      throw new RequestError(403, 'Cross-origin requests are not allowed.');
    }
    return;
  }
  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    throw new RequestError(403, 'Invalid request origin.');
  }
  const requestHost = request.headers.host;
  if (originUrl.protocol !== 'https:' || !requestHost || originUrl.host !== requestHost) {
    throw new RequestError(403, 'Cross-origin requests are not allowed.');
  }
}

function getCookie(request, name) {
  for (const item of (request.headers.cookie || '').split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0 || item.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(item.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

function createSession(userId, secret) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    expiresAt: Date.now() + sessionLifetimeMs
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySession(token, secret) {
  if (!token || token.length > 2048) return null;
  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;
  const payload = token.slice(0, separator);
  const suppliedSignature = Buffer.from(token.slice(separator + 1), 'base64url');
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest();
  if (suppliedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(suppliedSignature, expectedSignature)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isSafeInteger(session.userId) || session.userId < 1 ||
        !Number.isSafeInteger(session.expiresAt) || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

function setSessionCookie(response, userId, secret) {
  const token = encodeURIComponent(createSession(userId, secret));
  response.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${sessionLifetimeMs / 1000}`);
}

function clearSessionCookie(response) {
  response.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`);
}

async function databaseRequest(config, path, { method = 'GET', body, prefer } = {}) {
  const headers = {
    apikey: config.supabaseKey,
    Authorization: `Bearer ${config.supabaseKey}`,
    Accept: 'application/json'
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;
  let response;
  try {
    response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
  } catch {
    throw new RequestError(503, 'Could not connect to the hosted database. Try again shortly.');
  }
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new RequestError(503, 'The hosted database returned an invalid response.');
    }
  }
  if (!response.ok) {
    if (data?.code === '23505') throw new RequestError(409, 'That username is already taken. Choose another one.');
    if (response.status === 401 || response.status === 403) {
      throw new RequestError(503, 'The hosted database credentials or permissions are not configured correctly.');
    }
    console.error('Supabase database request failed:', response.status, data?.code || 'unknown error');
    throw new RequestError(503, 'The hosted database could not complete the request.');
  }
  return data;
}

async function getUserById(config, id) {
  const rows = await databaseRequest(config, `users?id=eq.${id}&select=*&limit=1`);
  return rows[0] || null;
}

async function getAuthenticatedUser(request, response, config) {
  const session = verifySession(getCookie(request, cookieName), config.sessionSecret);
  if (!session) return null;
  const user = await getUserById(config, session.userId);
  if (!user) {
    clearSessionCookie(response);
    return null;
  }
  return { user };
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
    favorite_color: body.favoriteColor,
    wish: body.wish.trim(),
    messages: (body.messages || '').trim()
  };
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
    completedGames: progress.completed_games,
    hardWins: progress.hard_wins,
    dailyChallengesCompleted: progress.daily_challenges_completed,
    lastChallengeDate: progress.last_challenge_date
  };
}

async function requireUser(request, response, config) {
  const auth = await getAuthenticatedUser(request, response, config);
  if (!auth) {
    sendError(response, 401, 'Your session has expired. Please log in again.');
    return null;
  }
  return auth;
}

async function requireAdmin(request, response, config) {
  const auth = await requireUser(request, response, config);
  if (!auth) return null;
  if (auth.user.role !== 'admin') {
    sendError(response, 403, 'Administrator access is required for this action.');
    return null;
  }
  return auth;
}

async function handleApi(request, response, config, route, url) {
  if (request.method === 'GET' && route === '/me') {
    const auth = await getAuthenticatedUser(request, response, config);
    sendJson(response, 200, { user: auth ? publicUser(auth.user) : null });
    return;
  }

  if (request.method === 'POST' && route === '/signup') {
    const body = getRequestBody(request);
    if (!validUsername(body.username)) {
      throw new RequestError(400, 'Username must be 3–32 characters using letters, numbers, dot, underscore, or hyphen.');
    }
    if (typeof body.password !== 'string' || body.password.length < 6 || body.password.length > 128) {
      throw new RequestError(400, 'Password must be between 6 and 128 characters.');
    }
    const profileError = validateProfile(body);
    if (profileError) throw new RequestError(400, profileError);

    const username = body.username.toLowerCase();
    const isConfiguredAdmin = username === config.adminUsername;
    if (isConfiguredAdmin && !safeEqual(body.password, config.adminPassword)) {
      throw new RequestError(409, 'That username is reserved for the configured administrator.');
    }
    const passwordSalt = crypto.randomBytes(16);
    const passwordHash = await scrypt(body.password, passwordSalt, 64);
    const createdRows = await databaseRequest(config, 'users?select=*', {
      method: 'POST',
      prefer: 'return=representation',
      body: {
        username,
        password_salt: passwordSalt.toString('hex'),
        password_hash: Buffer.from(passwordHash).toString('hex'),
        ...normalizeProfile(body),
        role: isConfiguredAdmin ? 'admin' : 'user'
      }
    });
    const user = createdRows[0];
    await databaseRequest(config, 'user_progress?on_conflict=user_id', {
      method: 'POST',
      prefer: 'resolution=merge-duplicates,return=minimal',
      body: { user_id: user.id }
    });
    setSessionCookie(response, user.id, config.sessionSecret);
    sendJson(response, 201, publicUser(user));
    return;
  }

  if (request.method === 'POST' && route === '/login') {
    const body = getRequestBody(request);
    if (typeof body.username !== 'string' || typeof body.password !== 'string') {
      throw new RequestError(400, 'Enter your username and password.');
    }
    if (body.password.length > 128) throw new RequestError(400, 'Password must be 128 characters or fewer.');
    const username = body.username.toLowerCase().slice(0, 32);
    const ipAddress = String(request.headers['x-real-ip'] || 'unknown').slice(0, 128);
    const rateKey = crypto.createHash('sha256').update(`${ipAddress}:${username}`).digest('hex');
    const limited = await databaseRequest(config, 'rpc/is_login_rate_limited', {
      method: 'POST',
      body: { p_key_hash: rateKey }
    });
    if (limited === true) throw new RequestError(429, 'Too many unsuccessful attempts. Try again in 15 minutes.');

    const users = await databaseRequest(config, `users?username=eq.${encodeURIComponent(username)}&select=*&limit=1`);
    const user = users[0];
    const salt = user ? Buffer.from(user.password_salt, 'hex') : Buffer.alloc(16);
    const storedHash = user ? Buffer.from(user.password_hash, 'hex') : Buffer.alloc(64);
    const submittedHash = Buffer.from(await scrypt(body.password, salt, 64));
    const passwordMatches = storedHash.length === submittedHash.length &&
      crypto.timingSafeEqual(storedHash, submittedHash);
    if (!user || !passwordMatches) {
      await databaseRequest(config, 'rpc/record_login_failure', {
        method: 'POST',
        body: { p_key_hash: rateKey }
      });
      throw new RequestError(401, 'Username or password is incorrect.');
    }
    await databaseRequest(config, 'rpc/clear_login_failures', {
      method: 'POST',
      body: { p_key_hash: rateKey }
    });
    setSessionCookie(response, user.id, config.sessionSecret);
    sendJson(response, 200, publicUser(user));
    return;
  }

  if (request.method === 'POST' && route === '/logout') {
    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && route === '/progress') {
    const auth = await requireUser(request, response, config);
    if (!auth) return;
    const rows = await databaseRequest(config, `user_progress?user_id=eq.${auth.user.id}&select=*&limit=1`);
    sendJson(response, 200, { progress: serializeProgress(rows[0]) });
    return;
  }

  if (request.method === 'POST' && route === '/progress') {
    const auth = await requireUser(request, response, config);
    if (!auth) return;
    const body = getRequestBody(request);
    if (typeof body.game !== 'string' || !validGames.has(body.game)) {
      throw new RequestError(400, 'Choose a valid game to save progress.');
    }
    if (!['easy', 'normal', 'hard'].includes(body.difficulty)) {
      throw new RequestError(400, 'Choose a valid difficulty.');
    }
    if (body.eventId !== undefined &&
      (typeof body.eventId !== 'string' || !/^[a-zA-Z0-9-]{16,64}$/.test(body.eventId))) {
      throw new RequestError(400, 'Progress event ID is invalid.');
    }
    if (body.challengeDate !== null && body.challengeDate !== undefined &&
      (!isValidDate(body.challengeDate) || body.challengeDate !== new Date().toISOString().slice(0, 10))) {
      throw new RequestError(400, 'Daily challenge date is invalid or has expired.');
    }
    const rows = await databaseRequest(config, 'rpc/record_game_win', {
      method: 'POST',
      body: {
        p_user_id: auth.user.id,
        p_event_id: body.eventId || crypto.randomUUID(),
        p_game: body.game,
        p_difficulty: body.difficulty,
        p_challenge_date: body.challengeDate || null
      }
    });
    sendJson(response, 200, { progress: serializeProgress(rows) });
    return;
  }

  if (request.method === 'PUT' && route === '/profile') {
    const auth = await requireUser(request, response, config);
    if (!auth) return;
    const body = getRequestBody(request);
    const profileError = validateProfile(body);
    if (profileError) throw new RequestError(400, profileError);
    const rows = await databaseRequest(config, `users?id=eq.${auth.user.id}&select=*`, {
      method: 'PATCH',
      prefer: 'return=representation',
      body: normalizeProfile(body)
    });
    sendJson(response, 200, publicUser(rows[0]));
    return;
  }

  if (request.method === 'DELETE' && route === '/account') {
    const auth = await requireUser(request, response, config);
    if (!auth) return;
    await databaseRequest(config, `users?id=eq.${auth.user.id}`, {
      method: 'DELETE',
      prefer: 'return=minimal'
    });
    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && route === '/admin/users') {
    const auth = await requireAdmin(request, response, config);
    if (!auth) return;
    const term = (url.searchParams.get('q') || '').trim();
    if (term.length > 80) throw new RequestError(400, 'Search must be 80 characters or fewer.');
    const result = await databaseRequest(config, 'rpc/search_admin_users', {
      method: 'POST',
      body: { search_term: term }
    });
    sendJson(response, 200, result);
    return;
  }

  const deleteUserMatch = route.match(/^\/admin\/users\/(\d+)$/);
  if (request.method === 'DELETE' && deleteUserMatch) {
    const auth = await requireAdmin(request, response, config);
    if (!auth) return;
    const userId = Number(deleteUserMatch[1]);
    if (!Number.isSafeInteger(userId) || userId < 1) throw new RequestError(400, 'Invalid user id.');
    const targets = await databaseRequest(config, `users?id=eq.${userId}&select=id,role&limit=1`);
    if (!targets.length) throw new RequestError(404, 'User account not found.');
    if (targets[0].role === 'admin') {
      throw new RequestError(403, 'Administrator accounts cannot be deleted from this page.');
    }
    await databaseRequest(config, `users?id=eq.${userId}&role=eq.user`, {
      method: 'DELETE',
      prefer: 'return=minimal'
    });
    sendJson(response, 200, { ok: true });
    return;
  }

  throw new RequestError(404, 'API endpoint not found.');
}

function getRoute(request, url) {
  const routeFromQuery = url.searchParams.get('path');
  const route = routeFromQuery || url.pathname.replace(/^\/api(?:\/index)?/, '');
  return `/${route.replace(/^\/+/, '')}`.replace(/\/+$/, '') || '/';
}

module.exports = async function handler(request, response) {
  try {
    const config = getConfig();
    const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
    const route = getRoute(request, url);
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) validateOrigin(request);
    await handleApi(request, response, config, route, url);
  } catch (error) {
    if (response.headersSent || response.destroyed) return;
    const status = error instanceof RequestError ? error.status : 500;
    if (!(error instanceof RequestError)) console.error('Vercel API request failed:', error.message);
    const message = error instanceof RequestError
      ? error.message
      : 'The server could not complete the request.';
    sendError(response, status, message);
  }
};
