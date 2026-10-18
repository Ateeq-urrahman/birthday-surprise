const accessNotice = document.getElementById('accessNotice');
const dashboard = document.getElementById('dashboard');
const pageError = document.getElementById('pageError');
const resultSummary = document.getElementById('resultSummary');
const userRows = document.getElementById('userRows');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const logoutBtn = document.getElementById('logoutBtn');

const colorValues = {
  Pink: '#f35c8d',
  Red: '#e5484d',
  Orange: '#f28c28',
  Yellow: '#f2c94c',
  Green: '#3a9d5d',
  Teal: '#159a9c',
  Blue: '#3978c5',
  Purple: '#8054b8',
  Black: '#2d2933',
  White: '#ffffff'
};

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const responseBody = await response.text();
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The account API returned a web page instead of JSON. Live Server only serves static files. Run `npm start` from the project folder and open http://localhost:3000/admin/.');
  }
  if (!responseBody) {
    throw new Error(`The account server returned an empty response (HTTP ${response.status}). Check that the app server is running and try again.`);
  }
  let result;
  try {
    result = JSON.parse(responseBody);
  } catch {
    throw new Error(`The account server returned an invalid response (HTTP ${response.status}). Try again, and check the server logs if this continues.`);
  }
  if (!response.ok) {
    const error = new Error(result.error || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function setNotice(message, showLoginLink = false) {
  accessNotice.replaceChildren();
  accessNotice.hidden = false;
  accessNotice.append(document.createTextNode(message));
  if (showLoginLink) {
    accessNotice.append(document.createTextNode(' '));
    const loginLink = document.createElement('a');
    loginLink.href = '/birthday/';
    loginLink.textContent = 'Log in to Birthday Wishes';
    accessNotice.append(loginLink);
  }
}

function setError(message) {
  pageError.textContent = message;
  pageError.hidden = !message;
}

function appendCell(row, value, className = '') {
  const cell = document.createElement('td');
  if (className) cell.className = className;
  cell.textContent = value || '—';
  row.append(cell);
  return cell;
}

function renderUser(user) {
  const row = document.createElement('tr');
  const accountCell = document.createElement('td');
  const name = document.createElement('span');
  name.className = 'user-name';
  name.textContent = user.name;
  const username = document.createElement('span');
  username.className = 'username';
  username.textContent = `@${user.username}`;
  accountCell.append(name, username);
  if (user.role === 'admin') {
    const roleBadge = document.createElement('span');
    roleBadge.className = 'role-badge';
    roleBadge.textContent = 'Admin';
    accountCell.append(document.createElement('br'), roleBadge);
  }
  row.append(accountCell);

  appendCell(row, user.birthday);
  appendCell(row, user.pronouns);

  const colorCell = document.createElement('td');
  const colorContent = document.createElement('span');
  colorContent.className = 'color-cell';
  const swatch = document.createElement('span');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = colorValues[user.favoriteColor] || '#f35c8d';
  swatch.setAttribute('aria-hidden', 'true');
  const colorName = document.createElement('span');
  colorName.textContent = user.favoriteColor;
  colorContent.append(swatch, colorName);
  colorCell.append(colorContent);
  row.append(colorCell);

  appendCell(row, user.wish);
  appendCell(row, user.createdAt);

  const actionCell = document.createElement('td');
  if (user.role === 'user') {
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete account @${user.username}`);
    deleteButton.addEventListener('click', () => deleteUser(user));
    actionCell.append(deleteButton);
  } else {
    actionCell.textContent = 'Protected';
    actionCell.className = 'muted';
  }
  row.append(actionCell);
  return row;
}

async function loadUsers() {
  setError('');
  resultSummary.textContent = 'Loading accounts…';
  const query = searchInput.value.trim();
  const endpoint = `/api/admin/users${query ? `?q=${encodeURIComponent(query)}` : ''}`;
  try {
    const result = await apiRequest(endpoint);
    userRows.replaceChildren();
    if (!result.users.length) {
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.className = 'empty-state';
      emptyCell.colSpan = 7;
      emptyCell.textContent = 'No matching accounts found.';
      emptyRow.append(emptyCell);
      userRows.append(emptyRow);
    } else {
      const fragment = document.createDocumentFragment();
      result.users.forEach((user) => fragment.append(renderUser(user)));
      userRows.append(fragment);
    }
    resultSummary.textContent = result.total > result.limit
      ? `Showing ${result.users.length} of ${result.total} matching accounts.`
      : `${result.total} ${result.total === 1 ? 'account' : 'accounts'} found.`;
  } catch (error) {
    setError(error.message);
    resultSummary.textContent = 'Could not load accounts.';
  }
}

async function deleteUser(user) {
  const confirmed = window.confirm(`Delete @${user.username} and their birthday profile? This cannot be undone.`);
  if (!confirmed) return;

  setError('');
  try {
    await apiRequest(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    await loadUsers();
  } catch (error) {
    setError(error.message);
  }
}

async function initialize() {
  try {
    const { user } = await apiRequest('/api/me');
    if (!user) {
      setNotice('Sign in with the administrator account to view user data.', true);
      return;
    }
    if (user.role !== 'admin') {
      setNotice('This account does not have administrator access.');
      return;
    }

    accessNotice.hidden = true;
    dashboard.hidden = false;
    logoutBtn.hidden = false;
    await loadUsers();
  } catch (error) {
    setNotice(`Could not verify administrator access: ${error.message}`);
  }
}

searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loadUsers();
});

logoutBtn.addEventListener('click', async () => {
  logoutBtn.disabled = true;
  try {
    await apiRequest('/api/logout', { method: 'POST' });
    window.location.assign('/birthday/');
  } catch (error) {
    logoutBtn.disabled = false;
    setError(error.message);
  }
});

initialize();
