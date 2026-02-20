// ===== אוסף האימוג'י =====
const emojiSets = {
  animals:   ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🦋','🐢','🦀'],
  food:      ['🍎','🍌','🍓','🍕','🍦','🍩','🌮','🍭','🍇','🍒','🥕','🌽','🍉','🍊','🧁'],
  transport: ['🚗','🚌','🚂','✈️','🚁','🚢','🚲','🛵','🚀','🚜','🚓','🏎️','🚑','🛸','🚐'],
  toys:      ['⚽','🎈','🎀','🪁','🧸','🎯','🎲','🎮','🏀','🎨','🪆','🎭','🏈','🎪','🎠']
};

// ===== מצב הגדרות =====
let selectedMode     = 'emoji';
let selectedCategory = 'animals';
let pairsCount       = 4;
let uploadedPhotos   = [];

// ===== מצב משחק =====
let leftItems        = [];   // [{content, pairId}]
let rightItems       = [];   // [{content, pairId}] — מעורבב
let selectedLeftIdx  = null; // אינדקס הקלף שנבחר בעמודה שמאל
let matchedPairs     = 0;

// ===== בחירת הגדרות =====

function selectMode(mode, btn) {
  selectedMode = mode;
  document.querySelectorAll('.mode-selector .mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('emoji-section').classList.toggle('hidden', mode !== 'emoji');
  document.getElementById('photo-section').classList.toggle('hidden', mode !== 'photos');
}

function selectCategory(category, btn) {
  selectedCategory = category;
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectPairs(n, btn) {
  pairsCount = n;
  document.querySelectorAll('.difficulty-selector .mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
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

// ===== התחלת המשחק =====
function startGame() {
  if (selectedMode === 'photos' && uploadedPhotos.length < pairsCount) {
    alert(`בבקשה בחרו לפחות ${pairsCount} תמונות 📸`);
    return;
  }

  // בחירת תוכן
  const source = selectedMode === 'emoji'
    ? shuffle([...emojiSets[selectedCategory]])
    : shuffle([...uploadedPhotos]);

  const uniqueItems = source.slice(0, pairsCount);

  // בניית שתי עמודות
  leftItems  = uniqueItems.map((content, i) => ({ content, pairId: i }));
  rightItems = shuffle(leftItems.map(item => ({ ...item })));

  selectedLeftIdx = null;
  matchedPairs    = 0;

  document.getElementById('pairs-total').textContent = pairsCount;
  document.getElementById('pairs-found').textContent = 0;

  buildColumns();
  show('game-screen');
}

// ===== בניית עמודות =====
function buildColumns() {
  const leftCol  = document.getElementById('left-col');
  const rightCol = document.getElementById('right-col');
  leftCol.innerHTML  = '';
  rightCol.innerHTML = '';

  leftItems.forEach((item, i)  => leftCol.appendChild(createCard(item, 'left',  i)));
  rightItems.forEach((item, i) => rightCol.appendChild(createCard(item, 'right', i)));
}

function createCard(item, side, index) {
  const card = document.createElement('div');
  card.className       = 'matching-card';
  card.dataset.side    = side;
  card.dataset.index   = index;
  card.dataset.pairId  = item.pairId;

  if (selectedMode === 'emoji') {
    card.textContent = item.content;
  } else {
    const img = document.createElement('img');
    img.src = item.content;
    card.appendChild(img);
  }

  card.addEventListener('click', () => handleClick(side, index, card));
  return card;
}

// ===== טיפול בלחיצה =====
function handleClick(side, index, card) {
  if (card.classList.contains('matched'))      return;
  if (card.classList.contains('flash-wrong'))  return;

  if (side === 'left') {
    // לחיצה על עמודה שמאל — בחירה / ביטול בחירה
    const prevSelected = document.querySelector('.matching-card[data-side="left"].selected');
    if (prevSelected) prevSelected.classList.remove('selected');

    if (selectedLeftIdx === index) {
      selectedLeftIdx = null; // ביטול בחירה בלחיצה חוזרת
    } else {
      card.classList.add('selected');
      selectedLeftIdx = index;
    }

  } else {
    // לחיצה על עמודה ימין — בדיקת התאמה
    if (selectedLeftIdx === null) return;

    const leftCard = document.querySelector(`.matching-card[data-side="left"][data-index="${selectedLeftIdx}"]`);
    const isMatch  = leftItems[selectedLeftIdx].pairId === rightItems[index].pairId;

    if (isMatch) {
      // התאמה נמצאה!
      leftCard.classList.remove('selected');
      leftCard.classList.add('matched');
      card.classList.add('matched');

      matchedPairs++;
      document.getElementById('pairs-found').textContent = matchedPairs;
      selectedLeftIdx = null;

      if (matchedPairs === pairsCount) {
        setTimeout(showVictory, 700);
      }

    } else {
      // לא מתאים — הבהוב אדום ואיפוס
      leftCard.classList.add('flash-wrong');
      card.classList.add('flash-wrong');

      setTimeout(() => {
        leftCard.classList.remove('flash-wrong', 'selected');
        card.classList.remove('flash-wrong');
        selectedLeftIdx = null;
      }, 650);
    }
  }
}

// ===== ניצחון =====
function showVictory() {
  show('victory-screen');
}

// ===== חזרה להגדרות =====
function resetToSetup() {
  show('setup-screen');
}

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
