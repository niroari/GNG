// ===== קטגוריות =====
const sortCategories = {
  animals:   { label: 'חיות',   icon: '🐾', color: '#FF6B6B',
               items: ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸'] },
  food:      { label: 'אוכל',   icon: '🍎', color: '#4ECDC4',
               items: ['🍎','🍌','🍓','🍕','🍦','🍩','🌮','🍭','🍇','🍒','🥕','🌽'] },
  transport: { label: 'תחבורה', icon: '🚗', color: '#6C5CE7',
               items: ['🚗','🚌','🚂','✈️','🚁','🚢','🚲','🛵','🚀','🚜','🚓','🏎️'] },
  toys:      { label: 'משחקים', icon: '⚽', color: '#e17055',
               items: ['⚽','🎈','🎀','🪁','🧸','🎯','🎲','🎮','🏀','🎨','🪆','🎭'] },
};

// ===== מצב הגדרות =====
let activeCats = ['animals', 'food'];

// ===== מצב המשחק =====
let gameItems        = [];
let currentItemIndex = 0;
let sortedCount      = 0;
let totalItems       = 0;
let canDrag          = false;

// ===== גרירה =====
let isDragging  = false;
let dragClone   = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

// ===== בחירת קטגוריות =====

function toggleCategory(btn) {
  const activeCount = document.querySelectorAll('.sort-cat-btn.active').length;
  if (btn.classList.contains('active')) {
    if (activeCount <= 2) return; // מינימום 2
    btn.classList.remove('active');
    activeCats = activeCats.filter(c => c !== btn.dataset.cat);
  } else {
    if (activeCount >= 3) return; // מקסימום 3
    btn.classList.add('active');
    activeCats.push(btn.dataset.cat);
  }
  const n = activeCats.length;
  document.getElementById('cat-count-label').textContent = `✅ ${n} קטגוריות נבחרו`;
}

// ===== התחלת המשחק =====

function startGame() {
  const itemsPerCat = activeCats.length === 2 ? 5 : 4;
  gameItems = [];
  activeCats.forEach(cat => {
    shuffle([...sortCategories[cat].items]).slice(0, itemsPerCat)
      .forEach(emoji => gameItems.push({ emoji, category: cat }));
  });
  gameItems = shuffle(gameItems);
  totalItems       = gameItems.length;
  currentItemIndex = 0;
  sortedCount      = 0;
  canDrag          = true;

  document.getElementById('sorted-total').textContent = totalItems;
  document.getElementById('sorted-count').textContent = 0;

  buildBoxes();
  show('game-screen');
  showNextItem();
}

// ===== בניית קופסאות =====

function buildBoxes() {
  const el = document.getElementById('sort-boxes');
  el.innerHTML = '';
  activeCats.forEach(cat => {
    const d   = sortCategories[cat];
    const box = document.createElement('div');
    box.className    = 'sort-box';
    box.dataset.cat  = cat;
    box.style.borderColor = d.color;
    box.innerHTML = `
      <span class="sort-box-icon">${d.icon}</span>
      <span class="sort-box-label">${d.label}</span>
    `;
    el.appendChild(box);
  });
}

// ===== הצגת פריט הבא =====

function showNextItem() {
  if (currentItemIndex >= totalItems) {
    setTimeout(showVictory, 400);
    return;
  }
  const sortItem      = document.getElementById('sort-item');
  sortItem.textContent = gameItems[currentItemIndex].emoji;
  sortItem.className   = 'sort-item';
  canDrag              = true;
}

// ===== גרירה — אתחול =====

function initDrag() {
  const sortItem = document.getElementById('sort-item');
  sortItem.addEventListener('mousedown',  onDragStart, { passive: false });
  sortItem.addEventListener('touchstart', onDragStart, { passive: false });
  document.addEventListener('mousemove',  onDragMove,  { passive: false });
  document.addEventListener('touchmove',  onDragMove,  { passive: false });
  document.addEventListener('mouseup',    onDragEnd);
  document.addEventListener('touchend',   onDragEnd);
}

function onDragStart(e) {
  if (!canDrag) return;
  const sortItem = document.getElementById('sort-item');
  const rect     = sortItem.getBoundingClientRect();
  const clientX  = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY  = e.touches ? e.touches[0].clientY : e.clientY;

  dragOffsetX = clientX - rect.left;
  dragOffsetY = clientY - rect.top;

  // יצירת עותק צף שעוקב אחר האצבע/עכבר
  dragClone = document.createElement('div');
  dragClone.className   = 'sort-item sort-item-clone';
  dragClone.textContent = sortItem.textContent;
  dragClone.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    pointer-events: none;
    z-index: 1000;
    transform: scale(1.12);
  `;
  document.body.appendChild(dragClone);

  sortItem.style.opacity = '0.25';
  isDragging = true;
  e.preventDefault();
}

function onDragMove(e) {
  if (!isDragging || !dragClone) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  dragClone.style.left = (clientX - dragOffsetX) + 'px';
  dragClone.style.top  = (clientY - dragOffsetY) + 'px';

  // הדגשת הקופסה שמתחת לעכבר/אצבע
  document.querySelectorAll('.sort-box').forEach(box => {
    const r      = box.getBoundingClientRect();
    const isOver = clientX >= r.left && clientX <= r.right &&
                   clientY >= r.top  && clientY <= r.bottom;
    box.classList.toggle('box-hover', isOver);
  });

  e.preventDefault();
}

function onDragEnd(e) {
  if (!isDragging) return;
  isDragging = false;

  const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
  const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

  if (dragClone) { dragClone.remove(); dragClone = null; }

  const sortItem = document.getElementById('sort-item');
  sortItem.style.opacity = '';

  document.querySelectorAll('.sort-box').forEach(b => b.classList.remove('box-hover'));

  // בדיקה על איזו קופסה שוחרר
  let dropped = false;
  document.querySelectorAll('.sort-box').forEach(box => {
    const r = box.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right &&
        clientY >= r.top  && clientY <= r.bottom) {
      handleDrop(box.dataset.cat);
      dropped = true;
    }
  });
  // אם לא נחת על קופסה — חוזר למקומו (לא עושים כלום, הפריט כבר שם)
}

// ===== טיפול בשחרור =====

function handleDrop(droppedCat) {
  canDrag = false;
  const sortItem   = document.getElementById('sort-item');
  const isCorrect  = gameItems[currentItemIndex].category === droppedCat;

  if (isCorrect) {
    sortedCount++;
    document.getElementById('sorted-count').textContent = sortedCount;
    sortItem.classList.add('sort-correct');

    const box = document.querySelector(`.sort-box[data-cat="${droppedCat}"]`);
    box.classList.add('box-flash');
    setTimeout(() => {
      box.classList.remove('box-flash');
      currentItemIndex++;
      showNextItem();
    }, 700);

  } else {
    sortItem.classList.add('sort-wrong');
    setTimeout(() => {
      sortItem.classList.remove('sort-wrong');
      canDrag = true;
    }, 500);
  }
}

// ===== ניצחון =====

function showVictory() {
  document.getElementById('final-score').textContent = sortedCount;
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

// ===== אתחול =====
document.addEventListener('DOMContentLoaded', initDrag);
