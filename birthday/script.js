const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const levelValue = document.getElementById('levelValue');
const starsValue = document.getElementById('starsValue');
const timeValue = document.getElementById('timeValue');
const statusMessage = document.getElementById('statusMessage');
const revealCard = document.getElementById('revealCard');
const restartBtn = document.getElementById('restartBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const accountBadge = document.getElementById('accountBadge');
const adminLink = document.getElementById('adminLink');
const chooseGameBtn = document.getElementById('chooseGameBtn');
const birthdayQuote = document.getElementById('birthdayQuote');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const profileScreen = document.getElementById('profileScreen');
const gameShell = document.getElementById('gameShell');
const profileForm = document.getElementById('profileForm');
const profileError = document.getElementById('profileError');
const profileAuthError = document.getElementById('profileAuthError');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const formHeading = document.getElementById('formHeading');
const profileSubmitBtn = document.getElementById('profileSubmitBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const showSignupBtn = document.getElementById('showSignupBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const birthdayInput = document.getElementById('profileBirthday');
const revealHeading = document.getElementById('revealHeading');
const revealMessage = document.getElementById('revealMessage');
const personalWish = document.getElementById('personalWish');
const birthdayCountdown = document.getElementById('birthdayCountdown');
const countdownValue = document.getElementById('countdownValue');
const revealQuote = document.getElementById('revealQuote');
const revealQuoteBtn = document.getElementById('revealQuoteBtn');
const revealSignature = document.getElementById('revealSignature');
const personAge = document.getElementById('personAge');
const colorSwatch = document.getElementById('colorSwatch');
const colorNamePreview = document.getElementById('colorNamePreview');
const colorPreviewDescription = document.getElementById('colorPreviewDescription');
const profileColor = document.getElementById('profileColor');
const profileUsername = document.getElementById('profileUsername');
const profilePassword = document.getElementById('profilePassword');
const loginPassword = document.getElementById('loginPassword');
const toggleSignupPassword = document.getElementById('toggleSignupPassword');
const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const gamePicker = document.getElementById('gamePicker');
const balloonGame = document.getElementById('balloonGame');
const balloonGrid = document.getElementById('balloonGrid');
const balloonProgress = document.getElementById('balloonProgress');
const quizGame = document.getElementById('quizGame');
const quizProgress = document.getElementById('quizProgress');
const quizQuestion = document.getElementById('quizQuestion');
const quizAnswers = document.getElementById('quizAnswers');
const quizFeedback = document.getElementById('quizFeedback');
const extraGame = document.getElementById('extraGame');
const extraGameTitle = document.getElementById('extraGameTitle');
const extraGameEyebrow = document.getElementById('extraGameEyebrow');
const extraGameDescription = document.getElementById('extraGameDescription');
const extraGameProgress = document.getElementById('extraGameProgress');
const extraGameFeedback = document.getElementById('extraGameFeedback');
const memoryContent = document.getElementById('memoryContent');
const memoryGrid = document.getElementById('memoryGrid');
const scrambleContent = document.getElementById('scrambleContent');
const scrambleHint = document.getElementById('scrambleHint');
const scrambledWord = document.getElementById('scrambledWord');
const scrambleForm = document.getElementById('scrambleForm');
const scrambleAnswer = document.getElementById('scrambleAnswer');
const partyContent = document.getElementById('partyContent');
const partyTarget = document.getElementById('partyTarget');
const partyGrid = document.getElementById('partyGrid');
const sequenceContent = document.getElementById('sequenceContent');
const sequenceIndicators = document.getElementById('sequenceIndicators');
const sequenceButtons = document.getElementById('sequenceButtons');
const sequenceStartBtn = document.getElementById('sequenceStartBtn');
const profileMessages = document.getElementById('profileMessages');
const friendMessagesSection = document.getElementById('friendMessagesSection');
const friendMessageList = document.getElementById('friendMessageList');
const shareCardBtn = document.getElementById('shareCardBtn');
const shareStatus = document.getElementById('shareStatus');
const themeSelect = document.getElementById('themeSelect');
const effectsToggle = document.getElementById('effectsToggle');
const motionToggle = document.getElementById('motionToggle');
const soundToggle = document.getElementById('soundToggle');
const musicToggle = document.getElementById('musicToggle');
const installAppBtn = document.getElementById('installAppBtn');
const installHelp = document.getElementById('installHelp');
const installHelpText = document.getElementById('installHelpText');
const progressSummary = document.getElementById('progressSummary');
const achievementList = document.getElementById('achievementList');
const dailyChallengeDescription = document.getElementById('dailyChallengeDescription');
const dailyChallengeStatus = document.getElementById('dailyChallengeStatus');
const dailyChallengeBtn = document.getElementById('dailyChallengeBtn');
const memoryPhotoInput = document.getElementById('memoryPhotoInput');
const photoMemoryGrid = document.getElementById('photoMemoryGrid');
const photoMemoryStatus = document.getElementById('photoMemoryStatus');
const clearLocalDataBtn = document.getElementById('clearLocalDataBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const privacyStatus = document.getElementById('privacyStatus');
const instructionsDialog = document.getElementById('instructionsDialog');
const instructionsTitle = document.getElementById('instructionsTitle');
const instructionsText = document.getElementById('instructionsText');
const beginGameBtn = document.getElementById('beginGameBtn');
const contrastToggle = document.getElementById('contrastToggle');

birthdayInput.max = getLocalDateString(new Date());

const favoriteColors = {
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

const birthdayQuotes = [
  'May this new trip around the sun bring you small joys, big laughs, and people who make you feel at home.',
  'Today is a little reminder that the world is brighter with you in it. Happy birthday!',
  'Here is to another year of brave beginnings, lovely surprises, and memories worth keeping.',
  'You deserve a day as warm, wonderful, and one-of-a-kind as you are.',
  'May your wishes find their way to you, one happy moment at a time.',
  'Growing older is just collecting more stories, more laughter, and more reasons to celebrate.',
  'Save a little room for cake, a lot of room for joy, and all the room you need to be yourself.',
  'The best part of birthdays is getting to celebrate the person who makes ordinary days special: you.'
];
const positiveQuotes = [
  'You do not have to have it all figured out to take one good step forward.',
  'The little things you do with care can make a bigger difference than you know.',
  'Give yourself credit for how far you have come, not just for how far you still want to go.',
  'You are allowed to grow at your own pace and celebrate every small win.',
  'A fresh start can begin with one kind thought toward yourself.',
  'There is still so much joy, discovery, and possibility waiting in your story.',
  'Rest is part of the journey too. You deserve kindness on the busy days and the quiet ones.',
  'Keep being you. The world is better with your particular kind of light in it.'
];
let currentQuotes = birthdayQuotes;
let lastQuote = '';
let activeProfile = null;
let activeUsername = '';
let countdownInterval = null;
let isEditingProfile = false;
let selectedGame = 'stars';
let selectedDifficulty = 'easy';
let balloonsPopped = 0;
let quizQuestionIndex = 0;
let currentQuizQuestions = [];
let memoryCards = [];
let memoryFirstCard = null;
let memoryLocked = false;
let scrambleWords = [];
let scrambleWordIndex = 0;
let partyRound = 0;
let partyTargetEmoji = '';
let sequenceRound = 0;
let sequencePattern = [];
let sequenceInputIndex = 0;
let sequenceIsPlaying = false;
let isOfflineMode = false;
let activeProgress = {
  gamesPlayed: 0, wins: 0, completedGames: [], hardWins: 0,
  dailyChallengesCompleted: 0, lastChallengeDate: null
};
let pendingGame = null;
let pendingDifficulty = 'easy';
let pendingChallengeDate = null;
let deferredInstallPrompt = null;
let audioContext = null;
let musicInterval = null;
let musicNoteIndex = 0;
let currentPhotoUrls = [];
let localDatabasePromise = null;
const gameTimeouts = new Set();

const difficultySettings = {
  easy: { balloonCount: 5, quizCount: 3, memoryPairs: 3, scrambleCount: 3, partyRounds: 5, partyChoices: 6, sequenceRounds: 3, sequenceLength: 3, starTime: 90, starSpeed: 3.2 },
  normal: { balloonCount: 8, quizCount: 5, memoryPairs: 6, scrambleCount: 5, partyRounds: 8, partyChoices: 9, sequenceRounds: 4, sequenceLength: 5, starTime: 60, starSpeed: 2.8 },
  hard: { balloonCount: 12, quizCount: 8, memoryPairs: 8, scrambleCount: 8, partyRounds: 12, partyChoices: 12, sequenceRounds: 5, sequenceLength: 7, starTime: 45, starSpeed: 2.5 }
};

const preferenceKey = 'birthday-wishes-preferences';
const defaultPreferences = { theme: 'classic', effects: true, reducedMotion: false, highContrast: false };
let preferences = { ...defaultPreferences };
const gameInstructions = {
  stars: 'Use the arrow keys, WASD, or the on-screen controls to move. Collect every star in three rounds. Easy gives you more time.',
  balloons: 'Tap or click each balloon until the counter is complete. There is no penalty for taking your time.',
  quiz: 'Choose the correct answer. A wrong answer can be retried without losing progress.',
  memory: 'Turn over two cards at a time to find matching pairs. If they do not match, they turn back over.',
  scramble: 'Use the clue and letter tiles to type the birthday word, then submit. You can retry until it is correct.',
  party: 'Find the party item shown above the grid. Wrong choices do not end the round.',
  sequence: 'Watch the icons flash, then repeat their order. If you miss, show the sequence again and retry.'
};

function applyPreferences() {
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.classList.toggle('reduce-motion', preferences.reducedMotion);
  document.documentElement.classList.toggle('high-contrast', preferences.highContrast);
  themeSelect.value = preferences.theme;
  effectsToggle.checked = preferences.effects;
  motionToggle.checked = preferences.reducedMotion;
  contrastToggle.checked = preferences.highContrast;
  soundToggle.textContent = `Sound: ${preferences.effects ? 'on' : 'off'}`;
  soundToggle.setAttribute('aria-pressed', String(preferences.effects));
  try {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  } catch (error) {
    privacyStatus.textContent = `Could not save this device's preferences: ${error.message}`;
  }
}

async function saveOfflineProgress(progress) {
  await localStoreRequest('profiles', 'readwrite', (store) => store.put({
    username: localUsernameKey(),
    user: { username: activeUsername, profile: activeProfile },
    progress,
    savedAt: Date.now()
  }));
}

async function loadOfflineProgress() {
  const profile = await localStoreRequest('profiles', 'readonly', (store) => store.get(localUsernameKey()));
  return profile?.progress || {
    gamesPlayed: 0, wins: 0, completedGames: [], hardWins: 0,
    dailyChallengesCompleted: 0, lastChallengeDate: null
  };
}

function loadPreferences() {
  const systemPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const stored = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
    preferences = {
      theme: ['classic', 'ocean', 'garden', 'starlight'].includes(stored.theme) ? stored.theme : 'classic',
      effects: typeof stored.effects === 'boolean' ? stored.effects : true,
      reducedMotion: typeof stored.reducedMotion === 'boolean' ? stored.reducedMotion : systemPrefersReducedMotion,
      highContrast: stored.highContrast === true
    };
  } catch (error) {
    preferences = { ...defaultPreferences };
    privacyStatus.textContent = `Could not read saved display settings: ${error.message}`;
  }
  applyPreferences();
}

function playSoundEffect(frequency = 660, duration = 0.12) {
  if (!preferences.effects) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Sound is not supported by this browser.');
    audioContext ||= new AudioContextClass();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.07, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    privacyStatus.textContent = error.message;
  }
}

function startMusic() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Music is not supported by this browser.');
    audioContext ||= new AudioContextClass();
    audioContext.resume();
    const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
    const playNote = () => {
      if (!audioContext || audioContext.state !== 'running') return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = melody[musicNoteIndex % melody.length];
      gain.gain.setValueAtTime(0.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.32);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.32);
      musicNoteIndex += 1;
    };
    playNote();
    musicInterval = setInterval(playNote, 420);
    musicToggle.textContent = 'Pause music';
    musicToggle.setAttribute('aria-pressed', 'true');
  } catch (error) {
    privacyStatus.textContent = error.message;
  }
}

function stopMusic() {
  if (musicInterval !== null) clearInterval(musicInterval);
  musicInterval = null;
  musicToggle.textContent = 'Play music';
  musicToggle.setAttribute('aria-pressed', 'false');
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getDailyChallenge() {
  const date = todayDateString();
  const seed = [...date].reduce((total, character) => total + character.charCodeAt(0), 0);
  const games = ['stars', 'balloons', 'quiz', 'memory', 'scramble', 'party', 'sequence'];
  const difficulties = ['easy', 'normal', 'hard'];
  return { date, game: games[seed % games.length], difficulty: difficulties[Math.floor(seed / 7) % difficulties.length] };
}

function gameName(game) {
  return {
    stars: 'Collect the stars', balloons: 'Pop the balloons', quiz: 'Birthday quiz',
    memory: 'Memory match', scramble: 'Word scramble', party: 'Party picker',
    sequence: 'Repeat the rhythm'
  }[game] || game;
}

function renderProgress() {
  const games = new Set(activeProgress.completedGames || []);
  progressSummary.textContent = `${activeProgress.wins || 0} games won · ${games.size} different games completed · ${activeProgress.hardWins || 0} hard-mode wins · ${activeProgress.dailyChallengesCompleted || 0} daily challenges`;
  const achievements = [
    ['First surprise', (activeProgress.wins || 0) >= 1, 'Win any game'],
    ['Game explorer', games.size >= 3, 'Complete three different games'],
    ['Hard mode hero', (activeProgress.hardWins || 0) >= 1, 'Win a game on Hard'],
    ['Daily celebrator', (activeProgress.dailyChallengesCompleted || 0) >= 1, 'Complete a daily challenge']
  ];
  achievementList.replaceChildren();
  achievements.forEach(([title, unlocked, description]) => {
    const badge = document.createElement('span');
    badge.className = `achievement-badge${unlocked ? ' unlocked' : ''}`;
    badge.textContent = `${unlocked ? '🏅' : '🔒'} ${title} · ${description}`;
    badge.setAttribute('aria-label', `${title}: ${unlocked ? 'unlocked' : 'locked'}. ${description}`);
    achievementList.append(badge);
  });
  const challenge = getDailyChallenge();
  dailyChallengeDescription.textContent = `${gameName(challenge.game)} · ${challenge.difficulty[0].toUpperCase()}${challenge.difficulty.slice(1)} challenge`;
  const doneToday = activeProgress.lastChallengeDate === challenge.date;
  dailyChallengeStatus.textContent = doneToday ? 'Completed today—come back tomorrow for a fresh challenge!' : '';
  dailyChallengeBtn.disabled = doneToday;
  dailyChallengeBtn.textContent = doneToday ? 'Challenge completed' : "Play today's challenge";
}

async function loadProgress() {
  if (isOfflineMode) {
    renderProgress();
    return;
  }
  const { progress } = await apiRequest('/api/progress');
  activeProgress = progress;
  renderProgress();
}

async function persistGameWin() {
  const challengeDate = pendingChallengeDate;
  pendingChallengeDate = null;
  const run = { eventId: createProgressEventId(), game: selectedGame, difficulty: selectedDifficulty, challengeDate };
  if (isOfflineMode) {
    applyOfflineProgress(run);
    await queueOfflineProgress(run);
    await saveOfflineProgress(activeProgress);
    renderProgress();
    return;
  }
  try {
    const { progress } = await apiRequest('/api/progress', {
      method: 'POST',
      body: JSON.stringify(run)
    });
    activeProgress = progress;
    renderProgress();
  } catch (error) {
    if (error instanceof TypeError || !navigator.onLine) {
      isOfflineMode = true;
      accountBadge.textContent = `Offline · Signed in as ${activeUsername}`;
      applyOfflineProgress(run);
      await queueOfflineProgress(run);
      await saveOfflineProgress(activeProgress);
      renderProgress();
      privacyStatus.textContent = `Connection lost. This win is saved on this device and will sync after you reconnect and sign in.`;
      return;
    }
    privacyStatus.textContent = `Game progress could not be saved: ${error.message}`;
  }
}

function createProgressEventId() {
  const bytes = new Uint8Array(16);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function applyOfflineProgress(run) {
  activeProgress.wins += 1;
  activeProgress.gamesPlayed += 1;
  activeProgress.hardWins += run.difficulty === 'hard' ? 1 : 0;
  activeProgress.completedGames = [...new Set([...activeProgress.completedGames, run.game])];
  if (run.challengeDate && activeProgress.lastChallengeDate !== run.challengeDate) {
    activeProgress.dailyChallengesCompleted += 1;
    activeProgress.lastChallengeDate = run.challengeDate;
  }
}

async function syncPendingProgress() {
  if (!activeUsername || isOfflineMode || !navigator.onLine) return;
  const key = localUsernameKey();
  const pending = await localStoreRequest('pendingProgress', 'readonly', (store) =>
    store.index('username').getAll(IDBKeyRange.only(key)));
  for (const item of pending) {
    await apiRequest('/api/progress', {
      method: 'POST',
      body: JSON.stringify({
        eventId: item.eventId,
        game: item.game,
        difficulty: item.difficulty,
        challengeDate: item.challengeDate === todayDateString() ? item.challengeDate : null
      })
    });
    await localStoreRequest('pendingProgress', 'readwrite', (store) => store.delete(item.id));
  }
  await loadProgress();
}

function clearPhotoUrls() {
  currentPhotoUrls.forEach((url) => URL.revokeObjectURL(url));
  currentPhotoUrls = [];
}

async function loadPhotoMemories() {
  clearPhotoUrls();
  const items = await getLocalMemories();
  photoMemoryGrid.replaceChildren();
  items.forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'photo-memory';
    const image = document.createElement('img');
    const url = URL.createObjectURL(item.blob);
    currentPhotoUrls.push(url);
    image.src = url;
    image.alt = item.caption || `Birthday memory ${index + 1}`;
    const caption = document.createElement('figcaption');
    caption.textContent = item.caption || `Birthday memory ${index + 1}`;
    const remove = document.createElement('button');
    remove.className = 'photo-remove';
    remove.type = 'button';
    remove.textContent = 'Remove photo';
    remove.setAttribute('aria-label', `Remove ${caption.textContent}`);
    remove.addEventListener('click', async () => {
      try {
        const currentItems = await getLocalMemories();
        currentItems.splice(index, 1);
        await saveLocalMemories(currentItems);
        await loadPhotoMemories();
        photoMemoryStatus.textContent = 'Photo removed from this browser.';
      } catch (error) {
        photoMemoryStatus.textContent = `Could not remove the photo: ${error.message}`;
      }
    });
    figure.append(image, caption, remove);
    photoMemoryGrid.append(figure);
  });
  photoMemoryStatus.textContent = items.length ? `${items.length} of 5 photos saved on this device.` : 'No photos added yet.';
}

async function addPhotoMemories(files) {
  const images = [...files];
  if (!images.length) return;
  try {
    const items = await getLocalMemories();
    for (const file of images) {
      if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image.`);
      if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name} is larger than 2 MB.`);
      if (items.length >= 5) throw new Error('You can save up to five photos per account on this browser.');
      items.push({ caption: file.name.slice(0, 80), blob: file });
    }
    await saveLocalMemories(items);
    await loadPhotoMemories();
    photoMemoryStatus.textContent = `${items.length} of 5 photos saved only in this browser.`;
  } catch (error) {
    photoMemoryStatus.textContent = error.message;
  } finally {
    memoryPhotoInput.value = '';
  }
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = candidate;
    }
  }
  if (line) context.fillText(line, x, y);
}

async function shareBirthdayCard() {
  shareStatus.textContent = '';
  const card = document.createElement('canvas');
  card.width = 1200;
  card.height = 630;
  const context = card.getContext('2d');
  const gradients = {
    classic: ['#fff0f4', '#ffd6e4', '#f35c8d'],
    ocean: ['#e8f8ff', '#b5e4f5', '#237eab'],
    garden: ['#effbef', '#c9edc8', '#3a8d58'],
    starlight: ['#f4efff', '#d7c7ff', '#8054b8']
  };
  const [top, bottom, accent] = gradients[preferences.theme];
  const gradient = context.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  context.fillStyle = gradient;
  context.fillRect(0, 0, card.width, card.height);
  context.fillStyle = 'rgba(255,255,255,0.86)';
  context.beginPath();
  context.moveTo(106, 60);
  context.lineTo(1094, 60);
  context.quadraticCurveTo(1130, 60, 1130, 96);
  context.lineTo(1130, 534);
  context.quadraticCurveTo(1130, 570, 1094, 570);
  context.lineTo(106, 570);
  context.quadraticCurveTo(70, 570, 70, 534);
  context.lineTo(70, 96);
  context.quadraticCurveTo(70, 60, 106, 60);
  context.closePath();
  context.fill();
  context.textAlign = 'center';
  context.fillStyle = accent;
  context.font = '700 26px Segoe UI, sans-serif';
  context.fillText('A BIRTHDAY SURPRISE', 600, 140);
  context.fillStyle = '#2d1c2c';
  context.font = '700 58px Georgia, serif';
  drawWrappedText(context, revealHeading.textContent, 600, 230, 900, 70);
  context.fillStyle = '#594553';
  context.font = '28px Segoe UI, sans-serif';
  drawWrappedText(context, revealMessage.textContent, 600, 330, 880, 44);
  context.fillStyle = accent;
  context.font = '700 30px Segoe UI, sans-serif';
  context.fillText(personAge.textContent.replace('🎂 ', ''), 600, 450);
  context.fillStyle = '#594553';
  context.font = 'italic 24px Georgia, serif';
  drawWrappedText(context, revealQuote.textContent, 600, 505, 900, 34);

  const blob = await new Promise((resolve) => card.toBlob(resolve, 'image/png'));
  if (!blob) {
    shareStatus.textContent = 'Could not create the birthday card image in this browser.';
    return;
  }
  const fileName = `birthday-card-${activeProfile.name.trim().replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'surprise'}.png`;
  if (navigator.canShare && navigator.share && typeof File === 'function') {
    const file = new File([blob], fileName, { type: 'image/png' });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title: revealHeading.textContent, text: revealMessage.textContent, files: [file] });
        shareStatus.textContent = 'Birthday card shared.';
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
        shareStatus.textContent = `Sharing was unavailable: ${error.message}`;
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  shareStatus.textContent = 'Birthday card downloaded as an image.';
}

function showConfetti() {
  if (preferences.reducedMotion) return;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  for (let index = 0; index < 24; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.setProperty('--confetti-color', ['#f35c8d', '#ffd76a', '#9fe2bf', '#8054b8'][index % 4]);
    layer.append(piece);
  }
  revealCard.append(layer);
  layer.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('confetti-piece')) event.target.remove();
    if (!layer.firstChild) layer.remove();
  });
}

function beginGameSelection(game, difficulty, challengeDate = null) {
  pendingGame = game;
  pendingDifficulty = difficulty;
  pendingChallengeDate = challengeDate;
  instructionsTitle.textContent = gameName(game);
  instructionsText.textContent = `${difficulty[0].toUpperCase()}${difficulty.slice(1)} difficulty. ${gameInstructions[game]}`;
  if (typeof instructionsDialog.showModal === 'function') instructionsDialog.showModal();
  else selectGame(game, difficulty);
}

function openDailyChallenge() {
  const challenge = getDailyChallenge();
  if (activeProgress.lastChallengeDate === challenge.date) return;
  beginGameSelection(challenge.game, challenge.difficulty, challenge.date);
}

function scheduleGameTimeout(callback, delay) {
  const timeout = setTimeout(() => {
    gameTimeouts.delete(timeout);
    callback();
  }, delay);
  gameTimeouts.add(timeout);
  return timeout;
}

function clearGameTimeouts() {
  gameTimeouts.forEach((timeout) => clearTimeout(timeout));
  gameTimeouts.clear();
  memoryLocked = false;
  sequenceIsPlaying = false;
}

function showRandomQuote(quotes = currentQuotes) {
  let quote = quotes[Math.floor(Math.random() * quotes.length)];
  if (quotes.length > 1 && quote === lastQuote) {
    const otherQuotes = quotes.filter((item) => item !== lastQuote);
    quote = otherQuotes[Math.floor(Math.random() * otherQuotes.length)];
  }
  lastQuote = quote;
  const formattedQuote = `“${quote}”`;
  birthdayQuote.textContent = formattedQuote;
  revealQuote.textContent = formattedQuote;
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function showProfileError(message) {
  profileError.textContent = message;
  profileError.hidden = !message;
}

function showProfileAuthError(message) {
  profileAuthError.textContent = message;
  profileAuthError.hidden = !message;
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.hidden = !message;
}

function bindPasswordToggle(input, button, description) {
  button.addEventListener('click', () => {
    const passwordVisible = input.type === 'password';
    input.type = passwordVisible ? 'text' : 'password';
    button.textContent = passwordVisible ? 'Hide' : 'Show';
    button.setAttribute('aria-label', `${passwordVisible ? 'Hide' : 'Show'} ${description} password`);
    button.setAttribute('aria-pressed', String(passwordVisible));
  });
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || 'The request could not be completed.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function openLocalDatabase() {
  if (!localDatabasePromise) {
    localDatabasePromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('This browser does not support local photo or offline storage.'));
        return;
      }
      const request = indexedDB.open('birthday-wishes-local', 1);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains('profiles')) database.createObjectStore('profiles', { keyPath: 'username' });
        if (!database.objectStoreNames.contains('memories')) database.createObjectStore('memories', { keyPath: 'username' });
        if (!database.objectStoreNames.contains('pendingProgress')) {
          const store = database.createObjectStore('pendingProgress', { keyPath: 'id', autoIncrement: true });
          store.createIndex('username', 'username');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Unable to open private device storage.'));
    });
  }
  return localDatabasePromise;
}

async function localStoreRequest(storeName, mode, action) {
  const database = await openLocalDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to read private device storage.'));
    transaction.onabort = () => reject(transaction.error || new Error('Private device storage was interrupted.'));
  });
}

function localUsernameKey(username = activeUsername) {
  return username.toLowerCase();
}

async function saveOfflineProfile(user) {
  await localStoreRequest('profiles', 'readwrite', (store) => store.put({
    username: localUsernameKey(user.username),
    user: { username: user.username, role: user.role, profile: user.profile },
    savedAt: Date.now()
  }));
}

async function loadLatestOfflineProfile() {
  const profiles = await localStoreRequest('profiles', 'readonly', (store) => store.getAll());
  profiles.sort((first, second) => second.savedAt - first.savedAt);
  return profiles[0]?.user || null;
}

async function getLocalMemories(username = activeUsername) {
  const result = await localStoreRequest('memories', 'readonly', (store) => store.get(localUsernameKey(username)));
  return result?.items || [];
}

async function saveLocalMemories(items, username = activeUsername) {
  await localStoreRequest('memories', 'readwrite', (store) => store.put({
    username: localUsernameKey(username),
    items
  }));
}

async function clearUserLocalData(username = activeUsername) {
  const key = localUsernameKey(username);
  await Promise.all([
    localStoreRequest('profiles', 'readwrite', (store) => store.delete(key)),
    localStoreRequest('memories', 'readwrite', (store) => store.delete(key))
  ]);
  const database = await openLocalDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction('pendingProgress', 'readwrite');
    const request = transaction.objectStore('pendingProgress').index('username').openCursor(IDBKeyRange.only(key));
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Unable to clear queued game progress.'));
  });
}

async function queueOfflineProgress(record) {
  await localStoreRequest('pendingProgress', 'readwrite', (store) => store.add({
    ...record,
    username: localUsernameKey(),
    createdAt: Date.now()
  }));
}

function profileFromForm() {
  return {
    name: document.getElementById('profileName').value.trim(),
    birthday: birthdayInput.value,
    pronouns: document.getElementById('profilePronouns').value,
    favoriteColor: profileColor.value,
    wish: document.getElementById('profileWish').value.trim(),
    messages: profileMessages.value.trim()
  };
}

function fillProfileForm(profile) {
  document.getElementById('profileName').value = profile.name;
  birthdayInput.value = profile.birthday;
  document.getElementById('profilePronouns').value = profile.pronouns || '';
  profileColor.value = getFavoriteColorName(profile.favoriteColor);
  updateColorPreview();
  document.getElementById('profileWish').value = profile.wish || '';
  profileMessages.value = profile.messages || '';
}

function getFavoriteColorName(value) {
  if (favoriteColors[value]) return value;
  return Object.entries(favoriteColors).find(([, hex]) => hex === value)?.[0] || 'Pink';
}

function updateColorPreview() {
  const name = profileColor.value;
  colorSwatch.style.backgroundColor = favoriteColors[name];
  colorNamePreview.textContent = name;
  colorPreviewDescription.textContent = `${name} color preview`;
}

function setAuthenticatedUser(user, { offline = false } = {}) {
  isOfflineMode = offline;
  activeUsername = user.username;
  activeProfile = user.profile;
  accountBadge.textContent = `${offline ? 'Offline · ' : ''}Signed in as ${activeUsername}`;
  accountBadge.hidden = false;
  fillProfileForm(activeProfile);
  profileScreen.hidden = true;
  gamePicker.hidden = false;
  gameShell.hidden = true;
  balloonGame.hidden = true;
  quizGame.hidden = true;
  extraGame.hidden = true;
  revealCard.classList.add('hidden');
  restartBtn.hidden = true;
  chooseGameBtn.hidden = true;
  editProfileBtn.hidden = false;
  logoutBtn.hidden = false;
  soundToggle.hidden = false;
  musicToggle.hidden = false;
  adminLink.hidden = offline || user.role !== 'admin';
  deleteAccountBtn.disabled = offline;
  if (offline) {
    privacyStatus.textContent = 'Offline mode: games work on this device. Sign in while connected to sync progress or manage your account.';
    loadOfflineProgress().then((progress) => {
      activeProgress = progress;
      renderProgress();
    }).catch((error) => {
      privacyStatus.textContent = `Could not load local game progress: ${error.message}`;
    });
    loadPhotoMemories().catch((error) => {
      photoMemoryStatus.textContent = `Photo memories could not be loaded: ${error.message}`;
    });
  } else {
    privacyStatus.textContent = '';
    saveOfflineProfile(user).catch((error) => {
      privacyStatus.textContent = `Offline sign-in could not be saved on this device: ${error.message}`;
    });
    loadProgress().catch((error) => {
      progressSummary.textContent = `Saved progress is temporarily unavailable: ${error.message}`;
    });
    loadPhotoMemories().catch((error) => {
      photoMemoryStatus.textContent = `Photo memories could not be loaded: ${error.message}`;
    });
    syncPendingProgress().catch((error) => {
      privacyStatus.textContent = `Saved offline game progress could not sync: ${error.message}`;
    });
  }
}

function startGame() {
  clearGameTimeouts();
  if (state.animationId !== null) {
    cancelAnimationFrame(state.animationId);
  }
  if (countdownInterval !== null) clearInterval(countdownInterval);
  countdownInterval = null;
  revealCard.classList.add('hidden');
  state.levelIndex = 0;
  state.completed = false;
  state.lastTimestamp = 0;
  setStatus('Collect all stars to unlock the surprise.');
  resetLevel();
  state.animationId = requestAnimationFrame(tick);
}

function selectGame(game, difficulty = selectedDifficulty) {
  if (!difficultySettings[difficulty]) difficulty = 'easy';
  selectedGame = game;
  selectedDifficulty = difficulty;
  state.completed = false;
  state.levelIndex = 0;
  state.keys = {};
  clearGameTimeouts();
  gamePicker.hidden = true;
  gameShell.hidden = game !== 'stars';
  balloonGame.hidden = game !== 'balloons';
  quizGame.hidden = game !== 'quiz';
  extraGame.hidden = !['memory', 'scramble', 'party', 'sequence'].includes(game);
  revealCard.classList.add('hidden');
  restartBtn.hidden = false;
  chooseGameBtn.hidden = false;
  if (countdownInterval !== null) clearInterval(countdownInterval);
  countdownInterval = null;

  if (game === 'stars') {
    startGame();
  } else {
    if (state.animationId !== null) cancelAnimationFrame(state.animationId);
    state.animationId = null;
    state.started = false;
    if (game === 'balloons') {
      balloonsPopped = 0;
      renderBalloons();
    } else if (game === 'quiz') {
      quizQuestionIndex = 0;
      currentQuizQuestions = shuffled(quizQuestions).slice(0, difficultySettings[selectedDifficulty].quizCount);
      renderQuizQuestion();
    } else {
      renderExtraGame();
    }
  }
}

function returnToGamePicker() {
  clearGameTimeouts();
  if (state.animationId !== null) cancelAnimationFrame(state.animationId);
  state.animationId = null;
  state.started = false;
  state.keys = {};
  if (countdownInterval !== null) clearInterval(countdownInterval);
  countdownInterval = null;
  revealCard.classList.add('hidden');
  gameShell.hidden = true;
  balloonGame.hidden = true;
  quizGame.hidden = true;
  extraGame.hidden = true;
  gamePicker.hidden = false;
  restartBtn.hidden = true;
  chooseGameBtn.hidden = true;
}

function completeMiniGame() {
  if (state.completed) return;
  clearGameTimeouts();
  if (state.animationId !== null) cancelAnimationFrame(state.animationId);
  state.animationId = null;
  state.started = false;
  state.completed = true;
  gameShell.hidden = true;
  balloonGame.hidden = true;
  quizGame.hidden = true;
  extraGame.hidden = true;
  restartBtn.hidden = true;
  chooseGameBtn.hidden = false;
  showPersonalizedReveal();
  revealCard.classList.remove('hidden');
  playSoundEffect(880, 0.3);
  persistGameWin().catch((error) => {
    privacyStatus.textContent = `Game progress could not be saved on this device: ${error.message}`;
  });
}

function renderBalloons() {
  balloonGrid.replaceChildren();
  const balloonCount = difficultySettings[selectedDifficulty].balloonCount;
  balloonProgress.textContent = `${balloonsPopped} of ${balloonCount} balloons popped`;
  for (let index = 0; index < balloonCount; index += 1) {
    const emoji = '🎈';
    const balloon = document.createElement('button');
    balloon.className = 'balloon-button';
    balloon.type = 'button';
    balloon.textContent = emoji;
    balloon.setAttribute('aria-label', `Pop balloon ${index + 1}`);
    balloon.addEventListener('click', () => {
    playSoundEffect(760);
    balloon.disabled = true;
      balloon.classList.add('popped');
      balloon.textContent = '✨';
      balloon.setAttribute('aria-label', `Balloon ${index + 1} popped`);
      balloonsPopped += 1;
      balloonProgress.textContent = `${balloonsPopped} of ${balloonCount} balloons popped`;
      if (balloonsPopped === balloonCount) completeMiniGame();
    });
    balloonGrid.append(balloon);
  }
}

const quizQuestions = [
  { question: 'What do we usually celebrate on a birthday?', answers: ['A person’s special day', 'The first day of winter', 'A new school subject'], correct: 0 },
  { question: 'What sweet treat is often served at a birthday party?', answers: ['Birthday cake', 'A bowl of snow', 'A birthday sandwich'], correct: 0 },
  { question: 'What do people often make before blowing out the candles?', answers: ['A wish', 'A weather report', 'A shopping list'], correct: 0 },
  { question: 'Which decoration might float around a party?', answers: ['A balloon', 'A bookcase', 'A spoon'], correct: 0 },
  { question: 'Which treat is often shared at a birthday party?', answers: ['Cupcakes', 'Ice cubes', 'Plain paper'], correct: 0 },
  { question: 'What do people sing at many birthday celebrations?', answers: ['Happy Birthday', 'The alphabet backwards', 'A weather forecast'], correct: 0 },
  { question: 'What might you open as a birthday surprise?', answers: ['A present', 'A traffic light', 'A window blind'], correct: 0 },
  { question: 'What is a lovely thing to give someone on their birthday?', answers: ['A kind wish', 'More homework', 'An empty box'], correct: 0 }
];

function renderQuizQuestion() {
  const questionCount = currentQuizQuestions.length;
  const current = currentQuizQuestions[quizQuestionIndex];
  quizProgress.textContent = `Question ${quizQuestionIndex + 1} of ${questionCount}`;
  quizQuestion.textContent = current.question;
  quizFeedback.textContent = '';
  quizAnswers.replaceChildren();
  shuffled(current.answers.map((answer, index) => ({ answer, correct: index === current.correct })))
    .forEach(({ answer, correct }) => {
      const option = document.createElement('button');
      option.className = 'answer-button';
      option.type = 'button';
      option.textContent = answer;
      option.addEventListener('click', () => {
        if (!correct) {
          playSoundEffect(260, 0.08);
          quizFeedback.textContent = 'Not quite—choose another answer. You can take your time!';
          return;
        }
        playSoundEffect(700);
        quizQuestionIndex += 1;
        if (quizQuestionIndex === questionCount) {
          quizProgress.textContent = `All ${questionCount} questions answered!`;
          quizQuestion.textContent = 'You are a birthday quiz champion!';
          quizAnswers.replaceChildren();
          quizFeedback.textContent = 'Your surprise is ready…';
          completeMiniGame();
          return;
        }
        renderQuizQuestion();
      });
      quizAnswers.append(option);
    });
}

const memoryEmojis = ['🎂', '🎁', '🎈', '⭐', '🧁', '🎉', '🍰', '💝'];
const partyItems = ['🎂', '🎁', '🎈', '⭐', '🧁', '🎉', '🍰', '💝', '🎊', '🍭', '🎀', '🥳'];
const sequenceEmojis = ['🎂', '🎈', '⭐', '🎁'];
const scrambleWordBank = [
  { word: 'cake', hint: 'A sweet birthday treat' },
  { word: 'gift', hint: 'A wrapped surprise' },
  { word: 'party', hint: 'A fun celebration' },
  { word: 'candle', hint: 'It glows on a cake' },
  { word: 'balloon', hint: 'A colorful party decoration' },
  { word: 'birthday', hint: 'A special day that comes once a year' },
  { word: 'surprise', hint: 'Something unexpected and exciting' },
  { word: 'celebrate', hint: 'What you do at a party' }
];

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function renderExtraGame() {
  const descriptions = {
    memory: ['Memory match', 'Flip two cards at a time and find every matching pair.'],
    scramble: ['Birthday word scramble', 'Unscramble each birthday word. You can retry as often as you like.'],
    party: ['Party picker', 'Find the matching party item in each round. Wrong taps do not cost a turn.'],
    sequence: ['Repeat the birthday rhythm', 'Watch the icons light up, then tap them in the same order.']
  };
  const [title, description] = descriptions[selectedGame];
  extraGameEyebrow.textContent = `Birthday game · ${selectedDifficulty}`;
  extraGameTitle.textContent = title;
  extraGameDescription.textContent = description;
  extraGameFeedback.textContent = '';
  memoryContent.hidden = selectedGame !== 'memory';
  scrambleContent.hidden = selectedGame !== 'scramble';
  partyContent.hidden = selectedGame !== 'party';
  sequenceContent.hidden = selectedGame !== 'sequence';

  if (selectedGame === 'memory') startMemoryGame();
  if (selectedGame === 'scramble') startScrambleGame();
  if (selectedGame === 'party') startPartyGame();
  if (selectedGame === 'sequence') startSequenceGame();
}

function startMemoryGame() {
  const pairs = difficultySettings[selectedDifficulty].memoryPairs;
  memoryCards = shuffled([...memoryEmojis.slice(0, pairs), ...memoryEmojis.slice(0, pairs)])
    .map((emoji, index) => ({ id: index, emoji, revealed: false, matched: false }));
  memoryFirstCard = null;
  memoryLocked = false;
  extraGameProgress.textContent = `0 of ${pairs} pairs found`;
  renderMemoryCards();
}

function renderMemoryCards() {
  memoryGrid.replaceChildren();
  memoryCards.forEach((card) => {
    const button = document.createElement('button');
    button.className = 'memory-card';
    button.type = 'button';
    button.textContent = card.revealed || card.matched ? card.emoji : '?';
    button.setAttribute('aria-label', card.revealed || card.matched ? card.emoji : 'Hidden birthday card');
    button.disabled = card.matched || card.revealed || memoryLocked;
    if (card.revealed || card.matched) button.classList.add('revealed');
    if (card.matched) button.classList.add('matched');
    button.addEventListener('click', () => {
      if (memoryLocked || card.matched || card.revealed) return;
    playSoundEffect(520);
      card.revealed = true;
      button.textContent = card.emoji;
      button.setAttribute('aria-label', card.emoji);
      button.classList.add('revealed');
      button.disabled = true;
      if (memoryFirstCard === null) {
        memoryFirstCard = card.id;
        return;
      }

      const firstCard = memoryCards[memoryFirstCard];
      if (firstCard.emoji === card.emoji) {
        firstCard.matched = true;
        card.matched = true;
        memoryFirstCard = null;
        const matches = memoryCards.filter((item) => item.matched).length / 2;
        const pairCount = difficultySettings[selectedDifficulty].memoryPairs;
        extraGameProgress.textContent = `${matches} of ${pairCount} pairs found`;
        renderMemoryCards();
        if (matches === pairCount) completeMiniGame();
        return;
      }

      memoryLocked = true;
      renderMemoryCards();
      scheduleGameTimeout(() => {
        firstCard.revealed = false;
        card.revealed = false;
        memoryFirstCard = null;
        memoryLocked = false;
        renderMemoryCards();
      }, 800);
    });
    memoryGrid.append(button);
  });
}

function startScrambleGame() {
  const wordCount = difficultySettings[selectedDifficulty].scrambleCount;
  scrambleWords = shuffled(scrambleWordBank).slice(0, wordCount);
  scrambleWordIndex = 0;
  renderScrambleWord();
}

function renderScrambleWord() {
  const entry = scrambleWords[scrambleWordIndex];
  extraGameProgress.textContent = `Word ${scrambleWordIndex + 1} of ${scrambleWords.length}`;
  scrambleHint.textContent = `Hint: ${entry.hint}`;
  const letters = shuffled(entry.word.toUpperCase().split(''));
  if (letters.join('') === entry.word.toUpperCase()) letters.push(letters.shift());
  scrambledWord.textContent = letters.join(' ');
  scrambleAnswer.value = '';
  scrambleAnswer.focus();
}

function startPartyGame() {
  partyRound = 0;
  renderPartyRound();
}

function renderPartyRound() {
  const settings = difficultySettings[selectedDifficulty];
  const choices = shuffled(partyItems).slice(0, settings.partyChoices);
  partyTargetEmoji = choices[Math.floor(Math.random() * choices.length)];
  extraGameProgress.textContent = `Round ${partyRound + 1} of ${settings.partyRounds}`;
  partyTarget.textContent = `Find: ${partyTargetEmoji}`;
  partyTarget.setAttribute('aria-label', `Find ${partyTargetEmoji}`);
  partyGrid.replaceChildren();
  shuffled(choices).forEach((emoji, index) => {
    const button = document.createElement('button');
    button.className = 'party-item';
    button.type = 'button';
    button.textContent = emoji;
    button.setAttribute('aria-label', `Party item ${index + 1}: ${emoji}`);
    button.addEventListener('click', () => {
      if (emoji !== partyTargetEmoji) {
      playSoundEffect(260, 0.08);
      extraGameFeedback.textContent = 'Not that one—keep looking!';
      return;
    }
    playSoundEffect(820);
      partyRound += 1;
      if (partyRound === settings.partyRounds) {
        extraGameProgress.textContent = `All ${settings.partyRounds} rounds complete!`;
        completeMiniGame();
        return;
      }
      extraGameFeedback.textContent = 'Great find!';
      renderPartyRound();
    });
    partyGrid.append(button);
  });
}

function startSequenceGame() {
  sequenceRound = 0;
  sequencePattern = [];
  sequenceInputIndex = 0;
  sequenceIsPlaying = false;
  extraGameProgress.textContent = `Round 1 of ${difficultySettings[selectedDifficulty].sequenceRounds}`;
  sequenceIndicators.replaceChildren();
  sequenceButtons.replaceChildren();
  sequenceEmojis.forEach((emoji, index) => {
    const button = document.createElement('button');
    button.className = 'sequence-button';
    button.type = 'button';
    button.textContent = emoji;
    button.setAttribute('aria-label', `Birthday rhythm button ${index + 1}`);
    button.disabled = true;
    button.addEventListener('click', () => handleSequenceInput(index));
    sequenceButtons.append(button);
  });
  sequenceStartBtn.disabled = false;
  sequenceStartBtn.textContent = 'Start round';
}

function playSequence() {
  if (sequenceIsPlaying) return;
  if (sequencePattern.length === 0) {
    const settings = difficultySettings[selectedDifficulty];
    const targetLength = Math.max(
      2,
      Math.ceil((sequenceRound + 1) * settings.sequenceLength / settings.sequenceRounds)
    );
    sequencePattern = Array.from({ length: targetLength }, () => Math.floor(Math.random() * sequenceEmojis.length));
  }
  sequenceInputIndex = 0;
  sequenceIsPlaying = true;
  sequenceIndicators.replaceChildren(...sequencePattern.map(() => {
    const indicator = document.createElement('span');
    indicator.className = 'sequence-indicator';
    indicator.textContent = '●';
    return indicator;
  }));
  sequenceStartBtn.disabled = true;
  sequenceButtons.querySelectorAll('button').forEach((button) => { button.disabled = true; });
  extraGameFeedback.textContent = 'Watch the sequence…';
  let step = 0;
  const showNext = () => {
    if (step >= sequencePattern.length) {
      sequenceButtons.querySelectorAll('button').forEach((button) => { button.disabled = false; });
      sequenceIsPlaying = false;
      extraGameFeedback.textContent = 'Your turn—repeat the sequence.';
      sequenceStartBtn.disabled = false;
      sequenceStartBtn.textContent = 'Show sequence again';
      return;
    }
    const button = sequenceButtons.children[sequencePattern[step]];
    const indicator = sequenceIndicators.children[step];
    indicator.classList.add('active');
    button.classList.add('active');
    scheduleGameTimeout(() => {
      indicator.classList.remove('active');
      button.classList.remove('active');
      step += 1;
      scheduleGameTimeout(showNext, 220);
    }, 500);
  };
  scheduleGameTimeout(showNext, 350);
}

function handleSequenceInput(index) {
  if (sequenceIsPlaying) return;
  if (index !== sequencePattern[sequenceInputIndex]) {
    playSoundEffect(260, 0.08);
    extraGameFeedback.textContent = 'Almost! Watch it again and have another try.';
    sequenceInputIndex = 0;
    sequenceStartBtn.disabled = false;
    sequenceStartBtn.textContent = 'Show sequence again';
    return;
  }
  playSoundEffect(620 + (index * 80));
  sequenceInputIndex += 1;
  if (sequenceInputIndex !== sequencePattern.length) return;

  sequenceRound += 1;
  const totalRounds = difficultySettings[selectedDifficulty].sequenceRounds;
  if (sequenceRound === totalRounds) {
    extraGameProgress.textContent = `All ${totalRounds} rounds complete!`;
    completeMiniGame();
    return;
  }
  sequencePattern = [];
  extraGameProgress.textContent = `Round ${sequenceRound + 1} of ${totalRounds}`;
  extraGameFeedback.textContent = 'Perfect! Ready for the next one?';
  sequenceStartBtn.disabled = false;
  sequenceStartBtn.textContent = 'Start next round';
}

function parseBirthdayDate(birthday) {
  const [year, month, day] = birthday.split('-').map(Number);
  return { year, month, day };
}

function isValidBirthday(birthday) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return false;
  const { year, month, day } = parseBirthdayDate(birthday);
  const parsedDate = new Date(year, month - 1, day);
  return parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;
}

function getNextBirthday(birthday, now = new Date()) {
  const { month, day } = parseBirthdayDate(birthday);
  let nextBirthday = new Date(now.getFullYear(), month - 1, day);
  nextBirthday.setHours(0, 0, 0, 0);
  if (nextBirthday <= now) {
    nextBirthday = new Date(now.getFullYear() + 1, month - 1, day);
    nextBirthday.setHours(0, 0, 0, 0);
  }
  return nextBirthday;
}

function isBirthdayToday(birthday, now = new Date()) {
  const { month, day } = parseBirthdayDate(birthday);
  const birthdayMatches = now.getMonth() + 1 === month && now.getDate() === day;
  const leapBirthdayObserved = month === 2 &&
    day === 29 &&
    now.getMonth() === 2 &&
    now.getDate() === 1 &&
    !isLeapYear(now.getFullYear());
  return birthdayMatches || leapBirthdayObserved;
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function calculateAge(birthday, now = new Date()) {
  const { year, month, day } = parseBirthdayDate(birthday);
  let age = now.getFullYear() - year;
  let anniversaryMonth = month;
  let anniversaryDay = day;
  if (month === 2 && day === 29 && !isLeapYear(now.getFullYear())) {
    anniversaryMonth = 3;
    anniversaryDay = 1;
  }
  const birthdayHasPassed = now.getMonth() + 1 > anniversaryMonth ||
    (now.getMonth() + 1 === anniversaryMonth && now.getDate() >= anniversaryDay);
  if (!birthdayHasPassed) age -= 1;
  return age;
}

function updateCountdown() {
  if (!activeProfile || birthdayCountdown.hidden) return;
  const now = new Date();
  if (isBirthdayToday(activeProfile.birthday, now)) {
    if (countdownInterval !== null) clearInterval(countdownInterval);
    countdownInterval = null;
    showPersonalizedReveal();
    return;
  }
  const millisecondsLeft = getNextBirthday(activeProfile.birthday, now).getTime() - now.getTime();
  const secondsLeft = Math.max(0, Math.floor(millisecondsLeft / 1000));
  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;
  countdownValue.textContent = `${days} days · ${String(hours).padStart(2, '0')} hours · ${String(minutes).padStart(2, '0')} minutes · ${String(seconds).padStart(2, '0')} seconds`;
}

function showPersonalizedReveal() {
  const birthdayToday = isBirthdayToday(activeProfile.birthday);
  const age = calculateAge(activeProfile.birthday);
  personalWish.hidden = !activeProfile.wish;
  personalWish.textContent = activeProfile.wish ? `“${activeProfile.wish}”` : '';
  personAge.textContent = `🎂 ${age} ${age === 1 ? 'year' : 'years'} young`;
  revealCard.style.setProperty('--profile-accent', favoriteColors[activeProfile.favoriteColor] || '#f35c8d');
  const pronouns = activeProfile.pronouns ? ` (${activeProfile.pronouns})` : '';
  revealSignature.textContent = `Made with love for ${activeProfile.name}${pronouns} 💖`;
  const messages = (activeProfile.messages || '').split(/\r?\n/).map((message) => message.trim()).filter(Boolean);
  friendMessageList.replaceChildren();
  friendMessagesSection.hidden = messages.length === 0;
  messages.forEach((message) => {
    const quote = document.createElement('blockquote');
    quote.textContent = message;
    friendMessageList.append(quote);
  });

  if (birthdayToday) {
    revealHeading.textContent = `Happy birthday, ${activeProfile.name}!`;
    revealMessage.textContent = 'Today is all about celebrating you. May your day be full of laughter, love, and the little things that make you happiest.';
    birthdayCountdown.hidden = true;
    currentQuotes = birthdayQuotes;
    document.getElementById('quoteTitle').textContent = 'Birthday wishes for you';
  } else {
    revealHeading.textContent = `Surprise unlocked, ${activeProfile.name}!`;
    revealMessage.textContent = `Your birthday is coming up. Until then, here is a little encouragement for today${activeProfile.pronouns ? `, ${activeProfile.pronouns}` : ''}.`;
    birthdayCountdown.hidden = false;
    currentQuotes = positiveQuotes;
    document.getElementById('quoteTitle').textContent = 'A little encouragement';
    updateCountdown();
    if (countdownInterval !== null) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  showRandomQuote(currentQuotes);
  showConfetti();
}

const state = {
  levelIndex: 0,
  player: { x: 50, y: 50, r: 14, speed: 2.8 },
  stars: [],
  obstacleRects: [],
  starsCollected: 0,
  timeLeft: 30,
  completed: false,
  keys: {},
  lastTimestamp: 0,
  animationId: null,
  started: false,
};

const levels = [
  {
    time: 60,
    playerStart: { x: 52, y: 52 },
    stars: [
      { x: 180, y: 120 },
      { x: 520, y: 120 },
      { x: 620, y: 340 },
      { x: 210, y: 380 },
      { x: 350, y: 220 },
    ],
    obstacles: [],
  },
  {
    time: 60,
    playerStart: { x: 56, y: 420 },
    stars: [
      { x: 140, y: 120 },
      { x: 290, y: 90 },
      { x: 410, y: 150 },
      { x: 620, y: 180 },
      { x: 560, y: 380 },
      { x: 220, y: 360 },
    ],
    obstacles: [],
  },
  {
    time: 60,
    playerStart: { x: 60, y: 60 },
    stars: [
      { x: 120, y: 360 },
      { x: 240, y: 180 },
      { x: 340, y: 260 },
      { x: 470, y: 100 },
      { x: 560, y: 360 },
      { x: 650, y: 220 },
      { x: 340, y: 420 },
    ],
    obstacles: [],
  },
];

sequenceStartBtn.addEventListener('click', playSequence);

function resetLevel() {
  const level = levels[state.levelIndex];
  const settings = difficultySettings[selectedDifficulty];
  state.player.x = level.playerStart.x;
  state.player.y = level.playerStart.y;
  state.player.speed = settings.starSpeed;
  state.stars = level.stars.map((star) => ({ ...star, collected: false }));
  state.obstacleRects = level.obstacles;
  state.starsCollected = 0;
  state.timeLeft = settings.starTime;
  statusMessage.textContent = `${selectedDifficulty[0].toUpperCase()}${selectedDifficulty.slice(1)} mode · Collect all the stars before time runs out.`;
  state.completed = false;
  state.started = true;
  updateHud();
}

function updateHud() {
  const level = levels[state.levelIndex];
  const total = state.stars.length || level.stars.length;
  levelValue.textContent = String(state.levelIndex + 1);
  starsValue.textContent = `${state.starsCollected}/${total}`;
  timeValue.textContent = `${Math.max(0, Math.ceil(state.timeLeft))}`;
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function proceedToNextLevel() {
  if (state.levelIndex < levels.length - 1) {
    state.levelIndex += 1;
    setStatus(`Level ${state.levelIndex + 1}! Collect all the stars to unlock the next clue.`);
    resetLevel();
    return;
  }

  completeMiniGame();
  setStatus('You did it! The surprise has been unlocked.');
}

function checkCollisions() {
  const player = state.player;

  for (const rect of state.obstacleRects) {
    const nearestX = Math.max(rect.x, Math.min(player.x, rect.x + rect.w));
    const nearestY = Math.max(rect.y, Math.min(player.y, rect.y + rect.h));
    const dx = player.x - nearestX;
    const dy = player.y - nearestY;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < player.r * player.r) {
      const pushX = dx === 0 ? 0 : (dx / Math.abs(dx)) * 1.5;
      const pushY = dy === 0 ? 0 : (dy / Math.abs(dy)) * 1.5;
      player.x += pushX;
      player.y += pushY;
    }
  }
}

function collectStars() {
  for (const star of state.stars) {
    if (star.collected) continue;

    const dx = state.player.x - star.x;
    const dy = state.player.y - star.y;
    const dist = Math.hypot(dx, dy);

    if (dist < state.player.r + 10) {
      star.collected = true;
      state.starsCollected += 1;
      setStatus(`Nice! ${state.starsCollected} of ${state.stars.length} stars collected.`);
      updateHud();
    }
  }

  if (state.starsCollected === state.stars.length) {
    proceedToNextLevel();
  }
}

function updatePlayer() {
  const p = state.player;
  let moveX = 0;
  let moveY = 0;

  if (state.keys.ArrowUp || state.keys.w) moveY -= 1;
  if (state.keys.ArrowDown || state.keys.s) moveY += 1;
  if (state.keys.ArrowLeft || state.keys.a) moveX -= 1;
  if (state.keys.ArrowRight || state.keys.d) moveX += 1;

  if (moveX !== 0 || moveY !== 0) {
    const length = Math.hypot(moveX, moveY) || 1;
    p.x += (moveX / length) * p.speed;
    p.y += (moveY / length) * p.speed;
  }

  p.x = Math.max(p.r, Math.min(canvas.width - p.r, p.x));
  p.y = Math.max(p.r, Math.min(canvas.height - p.r, p.y));

  checkCollisions();
  collectStars();
}

function drawRoundedRect(x, y, w, h, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawStar(x, y, radius, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const outerX = Math.cos(angle) * radius;
    const outerY = Math.sin(angle) * radius;
    const innerAngle = angle + Math.PI / 10;
    const innerX = Math.cos(innerAngle) * (radius * 0.5);
    const innerY = Math.sin(innerAngle) * (radius * 0.5);

    if (i === 0) {
      ctx.moveTo(outerX, outerY);
    } else {
      ctx.lineTo(outerX, outerY);
    }
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI * 2);
  ctx.fillStyle = '#f35c8d';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(state.player.x - 4, state.player.y - 3, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(state.player.x + 4, state.player.y - 3, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(state.player.x - 4, state.player.y - 3, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#2d1c2c';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(state.player.x + 4, state.player.y - 3, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#2d1c2c';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(state.player.x, state.player.y + 5, 5, 0, Math.PI, false);
  ctx.strokeStyle = '#2d1c2c';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fffaf5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 18; i += 1) {
    const x = (i * 90) % canvas.width;
    const y = (i * 52) % canvas.height;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 223, 233, 0.7)' : 'rgba(255, 218, 175, 0.28)';
    ctx.fillRect(x, y, 46, 46);
  }

  for (const rect of state.obstacleRects) {
    drawRoundedRect(rect.x, rect.y, rect.w, rect.h, 12, '#e5c9d7');
  }

  for (const star of state.stars) {
    if (!star.collected) {
      drawStar(star.x, star.y, 12, '#ffd76a');
      drawStar(star.x, star.y, 7, '#fff1af');
    }
  }

  drawPlayer();
}

function tick(timestamp) {
  if (!state.started) {
    drawBoard();
    state.animationId = null;
    return;
  }

  const delta = (timestamp - (state.lastTimestamp || timestamp)) / 1000;
  state.lastTimestamp = timestamp;

  if (!state.completed) {
    state.timeLeft -= delta;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      setStatus('Time is up! Press restart and try again.');
      state.started = false;
      updateHud();
      drawBoard();
      state.animationId = null;
      return;
    }

    updatePlayer();
    updateHud();
  }

  drawBoard();
  state.animationId = state.completed ? null : requestAnimationFrame(tick);
}

function restartGame() {
  selectGame(selectedGame, selectedDifficulty);
}

window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault();
  }
  state.keys[event.key] = true;
  state.keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  state.keys[event.key] = false;
  state.keys[event.key.toLowerCase()] = false;
});

const touchButtons = document.querySelectorAll('.dir-btn');
touchButtons.forEach((button) => {
  const direction = button.dataset.dir;

  const press = (event) => {
    event.preventDefault();
    if (direction === 'up') state.keys.ArrowUp = true;
    if (direction === 'down') state.keys.ArrowDown = true;
    if (direction === 'left') state.keys.ArrowLeft = true;
    if (direction === 'right') state.keys.ArrowRight = true;
  };

  const release = () => {
    if (direction === 'up') state.keys.ArrowUp = false;
    if (direction === 'down') state.keys.ArrowDown = false;
    if (direction === 'left') state.keys.ArrowLeft = false;
    if (direction === 'right') state.keys.ArrowRight = false;
  };

  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
});

restartBtn.addEventListener('click', restartGame);
newQuoteBtn.addEventListener('click', () => showRandomQuote());
revealQuoteBtn.addEventListener('click', () => showRandomQuote());
bindPasswordToggle(profilePassword, toggleSignupPassword, 'sign-up');
bindPasswordToggle(loginPassword, toggleLoginPassword, 'login');

function setEditProfileMode(enabled) {
  isEditingProfile = enabled;
  profileForm.hidden = false;
  loginForm.hidden = true;
  document.querySelectorAll('.account-field').forEach((field) => {
    field.hidden = enabled;
    field.querySelector('input').disabled = enabled;
    field.querySelector('input').required = !enabled;
  });
  formHeading.textContent = enabled ? 'Edit your birthday profile' : 'Create your account';
  profileSubmitBtn.textContent = enabled ? 'Save profile changes' : 'Create account & play';
  showLoginBtn.hidden = enabled;
  cancelEditBtn.hidden = !enabled;
  showProfileError('');
  showProfileAuthError('');
}

function showSignupScreen() {
  isEditingProfile = false;
  profileScreen.hidden = false;
  loginForm.hidden = true;
  profileForm.hidden = false;
  setEditProfileMode(false);
  profileUsername.focus();
}

function showLoginScreen() {
  isEditingProfile = false;
  profileScreen.hidden = false;
  profileForm.hidden = true;
  loginForm.hidden = false;
  showLoginError('');
  document.getElementById('loginUsername').focus();
}

showLoginBtn.addEventListener('click', showLoginScreen);
showSignupBtn.addEventListener('click', showSignupScreen);

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showLoginError('');
  try {
    const user = await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        username: document.getElementById('loginUsername').value.trim(),
        password: document.getElementById('loginPassword').value
      })
    });
    document.getElementById('loginPassword').value = '';
    setAuthenticatedUser(user);
  } catch (error) {
    showLoginError(error.message);
  }
});

editProfileBtn.addEventListener('click', () => {
  clearGameTimeouts();
  if (state.animationId !== null) cancelAnimationFrame(state.animationId);
  state.animationId = null;
  state.started = false;
  state.keys = {};
  if (countdownInterval !== null) clearInterval(countdownInterval);
  countdownInterval = null;
  gameShell.hidden = true;
  gamePicker.hidden = true;
  balloonGame.hidden = true;
  quizGame.hidden = true;
  extraGame.hidden = true;
  revealCard.classList.add('hidden');
  profileScreen.hidden = false;
  loginForm.hidden = true;
  setEditProfileMode(true);
  restartBtn.hidden = true;
  chooseGameBtn.hidden = true;
  editProfileBtn.hidden = true;
  logoutBtn.hidden = true;
  document.getElementById('profileName').focus();
});

cancelEditBtn.addEventListener('click', () => {
  profileScreen.hidden = true;
  editProfileBtn.hidden = false;
  logoutBtn.hidden = false;
  accountBadge.hidden = false;
  setEditProfileMode(false);
  selectGame(selectedGame);
});

document.querySelectorAll('.game-start-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const game = button.dataset.game;
    if (['stars', 'balloons', 'quiz', 'memory', 'scramble', 'party', 'sequence'].includes(game)) {
      const difficulty = document.querySelector(`[data-difficulty-for="${game}"]`).value;
      beginGameSelection(game, difficulty);
    }
  });
});

beginGameBtn.addEventListener('click', () => {
  if (pendingGame) selectGame(pendingGame, pendingDifficulty);
  pendingGame = null;
  if (instructionsDialog.open) instructionsDialog.close();
});

instructionsDialog.addEventListener('close', () => {
  if (instructionsDialog.returnValue === 'cancel') pendingChallengeDate = null;
});

dailyChallengeBtn.addEventListener('click', openDailyChallenge);

scrambleForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const answer = scrambleAnswer.value.trim().toLowerCase();
  const currentWord = scrambleWords[scrambleWordIndex];
  if (answer !== currentWord.word) {
    extraGameFeedback.textContent = 'Not quite—try rearranging the letters again.';
    scrambleAnswer.focus();
    return;
  }
  scrambleWordIndex += 1;
  if (scrambleWordIndex === scrambleWords.length) {
    extraGameProgress.textContent = `All ${scrambleWords.length} words solved!`;
    extraGameFeedback.textContent = 'Brilliant word work!';
    completeMiniGame();
    return;
  }
  extraGameFeedback.textContent = 'That is right! Here comes the next word.';
  renderScrambleWord();
});

document.querySelectorAll('.back-to-games').forEach((button) => {
  button.addEventListener('click', returnToGamePicker);
});

chooseGameBtn.addEventListener('click', returnToGamePicker);

function resetToAuthScreen() {
  clearGameTimeouts();
  if (state.animationId !== null) cancelAnimationFrame(state.animationId);
  state.animationId = null;
  state.started = false;
  state.keys = {};
  if (countdownInterval !== null) clearInterval(countdownInterval);
  countdownInterval = null;
  stopMusic();
  activeProfile = null;
  activeUsername = '';
  isOfflineMode = false;
  profileForm.reset();
  document.getElementById('profileColor').value = 'Pink';
  updateColorPreview();
  profileScreen.hidden = false;
  gamePicker.hidden = true;
  gameShell.hidden = true;
  balloonGame.hidden = true;
  quizGame.hidden = true;
  extraGame.hidden = true;
  revealCard.classList.add('hidden');
  restartBtn.hidden = true;
  chooseGameBtn.hidden = true;
  soundToggle.hidden = true;
  musicToggle.hidden = true;
  editProfileBtn.hidden = true;
  logoutBtn.hidden = true;
  accountBadge.hidden = true;
  showSignupScreen();
}

logoutBtn.addEventListener('click', async () => {
  logoutBtn.disabled = true;
  try {
    if (!isOfflineMode) await apiRequest('/api/logout', { method: 'POST' });
    resetToAuthScreen();
  } catch (error) {
    showProfileAuthError(error.message);
  } finally {
    logoutBtn.disabled = false;
  }
});

clearLocalDataBtn.addEventListener('click', async () => {
  if (!activeUsername || !window.confirm('Clear this account’s saved photos, offline profile copy, and unsynced game results from this browser?')) return;
  try {
    await clearUserLocalData();
    clearPhotoUrls();
    photoMemoryGrid.replaceChildren();
    photoMemoryStatus.textContent = 'Local photos and offline profile copy cleared.';
    privacyStatus.textContent = 'This does not delete your server account. Use Delete my account and data for that.';
  } catch (error) {
    privacyStatus.textContent = `Could not clear device data: ${error.message}`;
  }
});

deleteAccountBtn.addEventListener('click', async () => {
  if (isOfflineMode) {
    privacyStatus.textContent = 'Connect to the account server before deleting your server-stored account. You can clear this device’s copy above.';
    return;
  }
  if (!window.confirm('Permanently delete your account, profile, saved game progress, and this browser’s local copies? This cannot be undone.')) return;
  deleteAccountBtn.disabled = true;
  try {
    await apiRequest('/api/account', { method: 'DELETE' });
    await clearUserLocalData();
    clearPhotoUrls();
    resetToAuthScreen();
    showProfileAuthError('Your account and its saved data have been deleted.');
  } catch (error) {
    privacyStatus.textContent = `Account deletion failed: ${error.message}`;
  } finally {
    deleteAccountBtn.disabled = isOfflineMode;
  }
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showProfileError('');
  const profile = profileFromForm();
  if (!profile.name) {
    showProfileError('Please enter your name to continue.');
    return;
  }
  if (!isValidBirthday(profile.birthday) || profile.birthday > getLocalDateString(new Date())) {
    showProfileError('Please enter a valid date of birth that is not in the future.');
    return;
  }

  try {
    if (isEditingProfile) {
      const user = await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setEditProfileMode(false);
      setAuthenticatedUser(user);
      return;
    }

    showProfileAuthError('');
    const user = await apiRequest('/api/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: profileUsername.value.trim(),
        password: profilePassword.value,
        ...profile
      })
    });
    profilePassword.value = '';
    setAuthenticatedUser(user);
  } catch (error) {
    if (isEditingProfile) {
      showProfileError(error.message);
    } else {
      showProfileAuthError(error.message);
    }
  }
});

profileColor.addEventListener('change', updateColorPreview);

themeSelect.addEventListener('change', () => {
  preferences.theme = themeSelect.value;
  applyPreferences();
});

effectsToggle.addEventListener('change', () => {
  preferences.effects = effectsToggle.checked;
  applyPreferences();
  if (preferences.effects) playSoundEffect();
});

soundToggle.addEventListener('click', () => {
  preferences.effects = !preferences.effects;
  applyPreferences();
});

motionToggle.addEventListener('change', () => {
  preferences.reducedMotion = motionToggle.checked;
  applyPreferences();
});

contrastToggle.addEventListener('change', () => {
  preferences.highContrast = contrastToggle.checked;
  applyPreferences();
});

musicToggle.addEventListener('click', () => {
  if (musicInterval === null) startMusic();
  else stopMusic();
});

memoryPhotoInput.addEventListener('change', () => addPhotoMemories(memoryPhotoInput.files));
shareCardBtn.addEventListener('click', () => shareBirthdayCard().catch((error) => {
  shareStatus.textContent = `Could not create the birthday card: ${error.message}`;
}));

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installAppBtn.hidden = false;
  installHelp.hidden = false;
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installAppBtn.hidden = true;
  installHelp.hidden = false;
  installHelpText.textContent = 'Birthday Wishes is installed. It can open offline on this device; sign-in and account changes need the server connection.';
});

installAppBtn.addEventListener('click', async () => {
  if (!deferredInstallPrompt) {
    installHelp.hidden = false;
    return;
  }
  await deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installAppBtn.hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/birthday/sw.js', { scope: '/birthday/' })
      .then(() => {
        installHelp.hidden = false;
      })
      .catch((error) => {
        privacyStatus.textContent = `Offline app setup could not start: ${error.message}`;
      });
  });
}

window.addEventListener('online', async () => {
  if (!isOfflineMode || !activeUsername) return;
  try {
    const { user } = await apiRequest('/api/me');
    if (!user) {
      privacyStatus.textContent = 'Connection restored. Log in to sync saved progress.';
      return;
    }
    setAuthenticatedUser(user);
  } catch (error) {
    privacyStatus.textContent = `The connection returned, but game progress could not sync yet: ${error.message}`;
  }
});

document.querySelectorAll('.balloon-button').forEach((button) => {
  button.addEventListener('click', () => playSoundEffect(760));
});

showRandomQuote();
updateColorPreview();
loadPreferences();
setEditProfileMode(false);
apiRequest('/api/me')
  .then(({ user }) => {
    if (user) setAuthenticatedUser(user);
  })
  .catch((error) => {
    loadLatestOfflineProfile()
      .then((user) => {
        if (user) {
          setAuthenticatedUser(user, { offline: true });
          showProfileAuthError('');
        } else {
          showProfileAuthError(`Unable to connect to the account server or find a saved offline profile. Start the app server and try again. ${error.message}`);
        }
      })
      .catch((storageError) => {
        showProfileAuthError(`Unable to connect to the account server, and offline profile storage failed: ${storageError.message}`);
      });
  });
