// ===== אוסף האימוג'י =====
const emojiSets = {
  animals:   ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🦋','🐢','🦀'],
  food:      ['🍎','🍌','🍓','🍕','🍦','🍩','🌮','🍭','🍇','🍒','🥕','🌽','🍉','🍊','🧁'],
  transport: ['🚗','🚌','🚂','✈️','🚁','🚢','🚲','🛵','🚀','🚜','🚓','🏎️','🚑','🛸','🚐'],
  toys:      ['⚽','🎈','🎀','🪁','🧸','🎯','🎲','🎮','🏀','🎨','🪆','🎭','🏈','🎪','🎠']
};

// ===== מצב הגדרות =====
let selectedMode   = 'emoji';
let uploadedPhotos = [];

// ===== מצב המשחק =====
let totalRounds    = 6;
let currentRound   = 0;
let score          = 0;
let cardCount      = 4;
let canClick       = true;
let currentOddCard = null;

// ===== בחירת מצב =====
function selectMode(mode, btn) {
  selectedMode = mode;
  document.querySelectorAll('.mode-selector .mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('photo-section').classList.toggle('hidden', mode !== 'photos');
}

// ===== העלאת תמונות =====
function handlePhotoUpload(input) {
  uploadedPhotos = [];
  const preview  = document.getElementById('photo-preview');
  preview.innerHTML = '';
  let loaded = 0;

  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      uploadedPhotos.push(e.target.result);
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.appendChild(img);
      loaded++;
      document.getElementById('photo-count').textContent = `✅ נבחרו ${loaded} תמונות`;
    };
    reader.readAsDataURL(file);
  });
}

// ===== עדכון סליידר =====
function updateCardCount(val) {
  cardCount = parseInt(val);
  document.getElementById('card-count-display').textContent = cardCount;
}

// ===== בחירת סיבובים =====
function selectRounds(n, btn) {
  totalRounds = n;
  document.querySelectorAll('.difficulty-selector .mode-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== התחלת המשחק =====
function startGame() {
  if (selectedMode === 'photos' && uploadedPhotos.length < 2) {
    alert('בבקשה בחרו לפחות 2 תמונות שונות 📸');
    return;
  }

  currentRound = 0;
  score        = 0;
  document.getElementById('round-total').textContent = totalRounds;
  document.getElementById('score').textContent       = 0;
  show('game-screen');
  nextRound();
}

// ===== סיבוב הבא =====
function nextRound() {
  if (currentRound >= totalRounds) {
    showVictory();
    return;
  }

  currentRound++;
  canClick       = true;
  currentOddCard = null;
  document.getElementById('round-current').textContent = currentRound;

  const { cards, oddIndex } = generateRound();
  buildCardGrid(cards, oddIndex);
}

// ===== יצירת תוכן הסיבוב =====
function generateRound() {
  let majorityContent, oddContent;

  if (selectedMode === 'photos') {
    // בחר שתי תמונות שונות: אחת לרוב, אחת ליוצא הדופן
    const [a, b] = shuffle([...uploadedPhotos]);
    majorityContent = a;
    oddContent      = b;
  } else {
    // בחר שני אימוג'י מקטגוריות שונות
    const allEmojis   = Object.values(emojiSets).flat();
    const shuffled    = shuffle(allEmojis);
    majorityContent   = shuffled[0];
    // יוצא הדופן — מקטגוריה אחרת
    const majorityCategory = Object.entries(emojiSets)
      .find(([, emojis]) => emojis.includes(majorityContent))?.[0];
    oddContent = shuffle(
      Object.entries(emojiSets)
        .filter(([cat]) => cat !== majorityCategory)
        .flatMap(([, emojis]) => emojis)
    )[0];
  }

  const majorityCount = cardCount - 1;
  const cards = shuffle([
    ...Array.from({ length: majorityCount }, () => ({ content: majorityContent, isOdd: false })),
    { content: oddContent, isOdd: true }
  ]);

  return { cards, oddIndex: cards.findIndex(c => c.isOdd) };
}

// ===== חישוב ממדי גריד מלא =====
function getGridDimensions(n) {
  let rows = Math.floor(Math.sqrt(n));
  while (rows >= 1) {
    if (n % rows === 0) return { rows, cols: n / rows };
    rows--;
  }
  return { rows: 1, cols: n };
}

// ===== בניית גריד דינמי =====
function buildCardGrid(cards, oddIndex) {
  const n              = cards.length;
  const { rows, cols } = getGridDimensions(n);
  const gap            = n <= 16 ? 10 : n <= 36 ? 7 : 5;

  const reservedH = 310;
  const reservedW = 50;
  const availH    = window.innerHeight - reservedH;
  const availW    = Math.min(window.innerWidth - reservedW, 920);

  const maxCardW  = Math.floor((availW - (cols - 1) * gap) / cols);
  const maxCardH  = Math.floor((availH - (rows - 1) * gap) / rows);
  const cardSize  = Math.max(Math.min(maxCardW, maxCardH, 200), 65);
  const fontSize  = Math.max(Math.floor(cardSize * 0.75), 12);
  const radius    = Math.max(Math.round(cardSize * 0.13), 5);

  const grid = document.getElementById('ood-grid');
  grid.innerHTML                 = '';
  grid.style.gridTemplateColumns = `repeat(${cols}, ${cardSize}px)`;
  grid.style.gap                 = `${gap}px`;

  cards.forEach((item, i) => {
    const card              = document.createElement('div');
    card.className          = 'ood-card';
    card.style.width        = `${cardSize}px`;
    card.style.height       = `${cardSize}px`;
    card.style.borderRadius = `${radius}px`;
    card.style.overflow     = 'hidden';

    if (selectedMode === 'photos') {
      // מצב תמונות — תמונה ממלאת את כל הקלף
      const img     = document.createElement('img');
      img.src       = item.content;
      img.style.cssText = 'width:100%; height:100%; object-fit:cover; display:block; pointer-events:none;';
      card.appendChild(img);
    } else {
      // מצב אימוג'י
      card.style.fontSize = `${fontSize}px`;
      card.textContent    = item.content;
    }

    if (i === oddIndex) currentOddCard = card;

    card.addEventListener('click', () => handleClick(i === oddIndex, card));
    grid.appendChild(card);
  });
}

// ===== טיפול בלחיצה =====
function handleClick(isCorrect, clickedCard) {
  if (!canClick) return;
  canClick = false;

  if (isCorrect) {
    clickedCard.classList.add('correct');
    score++;
    document.getElementById('score').textContent = score;
    setTimeout(nextRound, 1000);
  } else {
    clickedCard.classList.add('wrong');
    setTimeout(() => {
      if (currentOddCard && currentOddCard !== clickedCard) {
        currentOddCard.classList.add('reveal');
      }
      setTimeout(nextRound, 1400);
    }, 600);
  }
}

// ===== ניצחון =====
function showVictory() {
  document.getElementById('final-score').textContent = score;
  document.getElementById('max-score').textContent   = totalRounds;
  const pct    = score / totalRounds;
  document.getElementById('victory-trophy').textContent =
    pct >= 0.8 ? '🏆' : pct >= 0.5 ? '🌟' : '😊';
  show('victory-screen');
}

// ===== חזרה להגדרות =====
function resetToSetup() { show('setup-screen'); }

// ===== עזרים =====
function show(screenId) {
  ['setup-screen', 'game-screen', 'victory-screen'].forEach(id => {
    document.getElementById(id).classList.toggle('hidden', id !== screenId);
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
