// ===== אוסף האימוג'י לפי קטגוריה =====
const emojiSets = {
  animals:   ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🦋','🐢','🦀'],
  food:      ['🍎','🍌','🍓','🍕','🍦','🍩','🌮','🍭','🍇','🍒','🥕','🌽','🍉','🍊','🧁'],
  transport: ['🚗','🚌','🚂','✈️','🚁','🚢','🚲','🛵','🚀','🚜','🚓','🏎️','🚑','🛸','🚐'],
  toys:      ['⚽','🎈','🎀','🪁','🧸','🎯','🎲','🎮','🏀','🎨','🪆','🎭','🏈','🎪','🎠']
};

// ===== מרובה משתתפים — קבועים =====
const playerColors  = ['#FF6B6B', '#4ECDC4', '#6C5CE7', '#e17055'];
const defaultEmojis = ['🦁', '🐯', '🦊', '🐼'];
const playerEmojis  = ['🦁','🐯','🦊','🐼','🐸','🦋','🐬','🦄','🐧','🐙','🦕','🤩','⭐','🌈','🚀'];

// ===== צבעי גב קלף =====
const cardBackColors = {
  red:    'radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px), linear-gradient(145deg, #FF6B6B 0%, #FF9A9A 100%)',
  blue:   'radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px), linear-gradient(145deg, #4a90d9 0%, #74b3ef 100%)',
  green:  'radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px), linear-gradient(145deg, #27ae60 0%, #55efc4 100%)',
  purple: 'radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px), linear-gradient(145deg, #6C5CE7 0%, #a29bfe 100%)',
  orange: 'radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px), linear-gradient(145deg, #e17055 0%, #fab1a0 100%)',
};

// ===== מצב המשחק =====
let selectedMode       = 'emoji';
let selectedCategory   = 'animals';
let selectedDifficulty = 'easy';
let selectedCardColor  = 'red';
let uploadedPhotos     = [];

// מרובה משתתפים
let gameMode           = 'single';
let players            = [];
let currentPlayerIndex = 0;

let flippedCards  = [];
let matchedPairs  = 0;
let movesCount    = 0;
let totalPairs    = 0;
let canFlip       = true;

// ===== פונקציות בחירת הגדרות =====

function selectMode(mode, btn) {
  selectedMode = mode;

  // עדכון כפתורים
  document.querySelectorAll('#setup-screen .mode-selector .mode-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // הצגת החלק הנכון
  document.getElementById('emoji-section').classList.toggle('hidden', mode !== 'emoji');
  document.getElementById('photo-section').classList.toggle('hidden', mode !== 'photos');
}

function selectCategory(category, btn) {
  selectedCategory = category;
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectCardColor(color, btn) {
  selectedCardColor = color;
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectGameMode(mode, btn) {
  gameMode = mode;
  document.querySelectorAll('.players-mode-selector .mode-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('players-section').classList.toggle('hidden', mode !== 'multi');
}

function cycleEmoji(btn) {
  const idx = playerEmojis.indexOf(btn.textContent);
  btn.textContent = playerEmojis[(idx + 1) % playerEmojis.length];
}

function addPlayerInput() {
  const container = document.getElementById('player-inputs-container');
  const count = container.querySelectorAll('.player-input-row').length;
  if (count >= 4) return;
  const idx = count;
  const row = document.createElement('div');
  row.className = 'player-input-row';
  row.innerHTML = `
    <span class="player-color-dot" style="background:${playerColors[idx]};"></span>
    <button class="player-emoji-btn" onclick="cycleEmoji(this)">${defaultEmojis[idx]}</button>
    <input type="text" class="player-name-input" placeholder="שם שחקן ${idx + 1}" maxlength="12">
  `;
  container.appendChild(row);
  if (count + 1 >= 4) {
    document.getElementById('add-player-btn').classList.add('hidden');
  }
}

function selectDifficulty(difficulty, btn) {
  selectedDifficulty = difficulty;
  document.querySelectorAll('.difficulty-selector .mode-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== העלאת תמונות =====

function handlePhotoUpload(input) {
  uploadedPhotos = [];
  const preview = document.getElementById('photo-preview');
  preview.innerHTML = '';

  const files = Array.from(input.files);
  let loaded = 0;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedPhotos.push(e.target.result);

      // הצגת תמונת מיניאטורה
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.appendChild(img);

      loaded++;
      document.getElementById('photo-count').textContent = `✅ נבחרו ${loaded} תמונות`;
    };
    reader.readAsDataURL(file);
  });
}

// ===== התחלת המשחק =====

function startGame() {
  const pairsMap = { easy: 6, hard: 8, super: 12 };
  const pairsCount = pairsMap[selectedDifficulty] || 6;

  // בדיקה שיש מספיק תמונות
  if (selectedMode === 'photos' && uploadedPhotos.length < pairsCount) {
    alert(`בבקשה בחרו לפחות ${pairsCount} תמונות 📸`);
    return;
  }

  // הגדרת שחקנים במצב רבים
  if (gameMode === 'multi') {
    const rows = document.querySelectorAll('.player-input-row');
    players = Array.from(rows).map((row, i) => ({
      emoji: row.querySelector('.player-emoji-btn').textContent,
      name:  row.querySelector('.player-name-input').value.trim() || `שחקן ${i + 1}`,
      color: playerColors[i],
      pairs: 0,
    }));
    currentPlayerIndex = 0;
  }

  // איפוס מצב
  totalPairs   = pairsCount;
  matchedPairs = 0;
  movesCount   = 0;
  flippedCards = [];
  canFlip      = true;

  // עדכון מונים
  document.getElementById('pairs-total').textContent  = totalPairs;
  document.getElementById('pairs-found').textContent  = 0;
  document.getElementById('moves-count').textContent  = 0;

  // בחירת התוכן לקלפים
  let uniqueItems;
  if (selectedMode === 'emoji') {
    uniqueItems = shuffle([...emojiSets[selectedCategory]]).slice(0, pairsCount);
  } else {
    uniqueItems = shuffle([...uploadedPhotos]).slice(0, pairsCount);
  }

  // יצירת זוגות: כל פריט מקבל מזהה זוג (pairId)
  const pairs = uniqueItems.flatMap((content, i) => [
    { content, pairId: i },
    { content, pairId: i }
  ]);

  const allCards = shuffle(pairs);

  // בניית גריד הקלפים
  const grid = document.getElementById('memory-grid');
  grid.innerHTML = '';

  if (pairsCount <= 8) {
    grid.style.gridTemplateColumns = `repeat(4, var(--card-size))`;
    document.documentElement.style.setProperty('--card-size', '165px');
    grid.classList.remove('grid-super');
  } else {
    grid.style.gridTemplateColumns = `repeat(6, var(--card-size))`;
    document.documentElement.style.setProperty('--card-size', '115px');
    grid.classList.add('grid-super');
  }

  allCards.forEach((data, index) => {
    const card = createCard(data, index);
    grid.appendChild(card);
  });

  // הצגת הכותרת הנכונה
  const isMulti = gameMode === 'multi';
  document.getElementById('game-header-single').classList.toggle('hidden',  isMulti);
  document.getElementById('game-header-multi').classList.toggle('hidden', !isMulti);
  if (isMulti) {
    buildPlayerScoreboard();
    updateTurnDisplay();
  }

  // מעבר למסך המשחק
  show('game-screen');
}

// ===== יצירת קלף בודד =====

function createCard(data, index) {
  const card = document.createElement('div');
  card.className = 'memory-card';
  card.dataset.index  = index;
  card.dataset.pairId = data.pairId;

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  // גב הקלף (מה שרואים כשהוא הפוך)
  const backFace = document.createElement('div');
  backFace.className = 'card-face card-back-face';
  backFace.style.background     = cardBackColors[selectedCardColor];
  backFace.style.backgroundSize = '18px 18px, 100% 100%';

  // פני הקלף (מה שמגלים)
  const frontFace = document.createElement('div');
  frontFace.className = 'card-face card-front-face';

  if (selectedMode === 'emoji') {
    frontFace.textContent = data.content;
  } else {
    const img = document.createElement('img');
    img.src = data.content;
    frontFace.appendChild(img);
  }

  inner.appendChild(backFace);
  inner.appendChild(frontFace);
  card.appendChild(inner);

  card.addEventListener('click', () => flipCard(card));
  return card;
}

// ===== היפוך קלף =====

function flipCard(card) {
  if (!canFlip)                              return;
  if (card.classList.contains('flipped'))    return;
  if (card.classList.contains('matched'))    return;
  if (flippedCards.length >= 2)              return;

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    movesCount++;
    document.getElementById('moves-count').textContent = movesCount;
    canFlip = false;
    setTimeout(checkMatch, 950);
  }
}

// ===== בדיקת התאמה =====

function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.pairId === card2.dataset.pairId) {
    // נמצא זוג!
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;

    if (gameMode === 'multi') {
      // מסגרת בצבע השחקן שמצא
      const color = players[currentPlayerIndex].color;
      card1.querySelector('.card-front-face').style.borderColor = color;
      card2.querySelector('.card-front-face').style.borderColor = color;
      // עדכון ניקוד
      players[currentPlayerIndex].pairs++;
      updatePlayerScoreboard();

      if (matchedPairs === totalPairs) {
        flippedCards = [];
        setTimeout(showVictory, 650);
      } else {
        // הודעה: תור נוסף לאותו שחקן
        const p = players[currentPlayerIndex];
        showTurnMessage(`🎉 כל הכבוד <span class="turn-emoji">${p.emoji}</span>! תור נוסף`, () => {
          flippedCards = [];
          canFlip = true;
        });
      }

    } else {
      document.getElementById('pairs-found').textContent = matchedPairs;
      flippedCards = [];
      canFlip = true;
      if (matchedPairs === totalPairs) {
        setTimeout(showVictory, 650);
      }
    }

  } else {
    // לא מתאים — הופכים בחזרה
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      canFlip = true;
      // מעבר לשחקן הבא
      if (gameMode === 'multi') {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnDisplay();
      }
    }, 550);
  }
}

// ===== פונקציות מרובה משתתפים =====

function buildPlayerScoreboard() {
  const board = document.getElementById('player-scoreboard');
  board.innerHTML = '';
  players.forEach((p, i) => {
    const chip = document.createElement('div');
    chip.className = 'player-chip';
    chip.id = `player-chip-${i}`;
    chip.innerHTML = `
      <span class="player-chip-dot" style="background:${p.color};"></span>
      <span class="chip-emoji">${p.emoji}</span>
      <span>${p.name}</span>
      <span class="player-chip-score" id="player-score-${i}">0</span>
    `;
    board.appendChild(chip);
  });
}

function updateTurnDisplay() {
  const p = players[currentPlayerIndex];
  document.getElementById('turn-text').innerHTML =
    `תור של: <span class="turn-emoji">${p.emoji}</span> <strong style="color:${p.color}">${p.name}</strong>`;
  players.forEach((_, i) => {
    document.getElementById(`player-chip-${i}`)
      .classList.toggle('active-player', i === currentPlayerIndex);
  });
}

function updatePlayerScoreboard() {
  players.forEach((p, i) => {
    document.getElementById(`player-score-${i}`).textContent = p.pairs;
  });
}

function showTurnMessage(msg, callback) {
  document.getElementById('turn-text').innerHTML = msg;
  setTimeout(() => {
    updateTurnDisplay();
    if (callback) callback();
  }, 1300);
}

// ===== ניצחון =====

function showVictory() {
  if (gameMode === 'multi') {
    document.getElementById('single-victory').classList.add('hidden');
    document.getElementById('multi-victory').classList.remove('hidden');

    const sorted = [...players].sort((a, b) => b.pairs - a.pairs);
    const isTie  = sorted.length > 1 && sorted[0].pairs === sorted[1].pairs;

    const winnerEl = document.getElementById('winner-emoji');
    winnerEl.textContent = isTie ? '🤝' : sorted[0].emoji;
    winnerEl.classList.toggle('winner-big-emoji', !isTie);
    document.getElementById('winner-title').textContent =
      isTie ? 'תיקו!' : `${sorted[0].name} ניצח/ה!`;

    const medals = ['🥇', '🥈', '🥉', '🏅'];
    const resultsDiv = document.getElementById('player-results');
    resultsDiv.innerHTML = '';
    sorted.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'result-row';
      row.innerHTML = `
        <span class="result-medal">${medals[i]}</span>
        <span class="result-name" style="color:${p.color}">${p.emoji} ${p.name}</span>
        <span class="result-score">${p.pairs} זוגות</span>
      `;
      resultsDiv.appendChild(row);
    });

  } else {
    document.getElementById('single-victory').classList.remove('hidden');
    document.getElementById('multi-victory').classList.add('hidden');
    document.getElementById('final-moves').textContent = movesCount;
  }
  show('victory-screen');
}

// ===== חזרה למסך הגדרות =====

function resetToSetup() {
  show('setup-screen');
}

// ===== עזרים =====

// מציג מסך אחד ומסתיר את השאר
function show(screenId) {
  ['setup-screen', 'game-screen', 'victory-screen'].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', id !== screenId);
  });
}

// ערבוב מערך (אלגוריתם Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
