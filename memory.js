// ===== אוסף האימוג'י לפי קטגוריה =====
const emojiSets = {
  animals:   ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🦋','🐢','🦀'],
  food:      ['🍎','🍌','🍓','🍕','🍦','🍩','🌮','🍭','🍇','🍒','🥕','🌽','🍉','🍊','🧁'],
  transport: ['🚗','🚌','🚂','✈️','🚁','🚢','🚲','🛵','🚀','🚜','🚓','🏎️','🚑','🛸','🚐'],
  toys:      ['⚽','🎈','🎀','🪁','🧸','🎯','🎲','🎮','🏀','🎨','🪆','🎭','🏈','🎪','🎠']
};

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
  const pairsCount = selectedDifficulty === 'easy' ? 6 : 8;

  // בדיקה שיש מספיק תמונות
  if (selectedMode === 'photos' && uploadedPhotos.length < pairsCount) {
    alert(`בבקשה בחרו לפחות ${pairsCount} תמונות 📸`);
    return;
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
  grid.style.gridTemplateColumns = `repeat(4, var(--card-size))`;

  allCards.forEach((data, index) => {
    const card = createCard(data, index);
    grid.appendChild(card);
  });

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
    document.getElementById('pairs-found').textContent = matchedPairs;

    flippedCards = [];
    canFlip = true;

    if (matchedPairs === totalPairs) {
      setTimeout(showVictory, 650);
    }

  } else {
    // לא מתאים — הופכים בחזרה
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      canFlip = true;
    }, 550);
  }
}

// ===== ניצחון =====

function showVictory() {
  document.getElementById('final-moves').textContent = movesCount;
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
