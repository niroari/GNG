// ===== Twemoji CDN (SVG) =====
const TW = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/';

// ===== קטגוריות עם תמונות אמתיות =====
const sortCategories = {
  animals: {
    label: 'חיות', iconSrc: TW + '1f43e.svg', color: '#FF3A5C',
    items: [
      { src: TW + '1f436.svg', name: 'כלב' },
      { src: TW + '1f431.svg', name: 'חתול' },
      { src: TW + '1f430.svg', name: 'ארנב' },
      { src: TW + '1f98a.svg', name: 'שועל' },
      { src: TW + '1f43b.svg', name: 'דב' },
      { src: TW + '1f43c.svg', name: 'פנדה' },
      { src: TW + '1f428.svg', name: 'קואלה' },
      { src: TW + '1f981.svg', name: 'אריה' },
      { src: TW + '1f42e.svg', name: 'פרה' },
      { src: TW + '1f437.svg', name: 'חזיר' },
      { src: TW + '1f438.svg', name: 'צפרדע' },
      { src: TW + '1f435.svg', name: 'קוף' },
    ]
  },
  food: {
    label: 'אוכל', iconSrc: TW + '1f34e.svg', color: '#00C48C',
    items: [
      { src: TW + '1f34e.svg', name: 'תפוח' },
      { src: TW + '1f34c.svg', name: 'בננה' },
      { src: TW + '1f353.svg', name: 'תות' },
      { src: TW + '1f355.svg', name: 'פיצה' },
      { src: TW + '1f366.svg', name: 'גלידה' },
      { src: TW + '1f369.svg', name: 'דונאט' },
      { src: TW + '1f347.svg', name: 'ענבים' },
      { src: TW + '1f352.svg', name: 'דובדבן' },
      { src: TW + '1f955.svg', name: 'גזר' },
      { src: TW + '1f33d.svg', name: 'תירס' },
      { src: TW + '1f349.svg', name: 'אבטיח' },
      { src: TW + '1f34a.svg', name: 'תפוז' },
    ]
  },
  transport: {
    label: 'תחבורה', iconSrc: TW + '1f697.svg', color: '#5B5EF5',
    items: [
      { src: TW + '1f697.svg', name: 'מכונית' },
      { src: TW + '1f68c.svg', name: 'אוטובוס' },
      { src: TW + '1f682.svg', name: 'רכבת' },
      { src: TW + '2708.svg',  name: 'מטוס' },
      { src: TW + '1f681.svg', name: 'מסוק' },
      { src: TW + '1f6a2.svg', name: 'ספינה' },
      { src: TW + '1f6b2.svg', name: 'אופניים' },
      { src: TW + '1f680.svg', name: 'טיל' },
      { src: TW + '1f69c.svg', name: 'טרקטור' },
      { src: TW + '1f693.svg', name: 'ניידת' },
      { src: TW + '1f6f5.svg', name: 'קטנוע' },
      { src: TW + '1f3ce.svg', name: 'מרוץ' },
    ]
  },
  toys: {
    label: 'משחקים', iconSrc: TW + '26bd.svg', color: '#FF9800',
    items: [
      { src: TW + '26bd.svg',  name: 'כדורגל' },
      { src: TW + '1f388.svg', name: 'בלון' },
      { src: TW + '1f9f8.svg', name: 'דובי' },
      { src: TW + '1f3af.svg', name: 'מטרה' },
      { src: TW + '1f3b2.svg', name: 'קוביות' },
      { src: TW + '1f3ae.svg', name: 'ג\'ויסטיק' },
      { src: TW + '1f3c0.svg', name: 'כדורסל' },
      { src: TW + '1f3a8.svg', name: 'ציור' },
      { src: TW + '1fa86.svg', name: 'בובות' },
      { src: TW + '1f380.svg', name: 'סרט' },
      { src: TW + '1fa81.svg', name: 'יו-יו' },
      { src: TW + '1f3ad.svg', name: 'תיאטרון' },
    ]
  },
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
      .forEach(item => gameItems.push({ ...item, category: cat }));
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
      <img src="${d.iconSrc}" class="sort-box-icon-img" alt="${d.label}" draggable="false">
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
  const item     = gameItems[currentItemIndex];
  const sortItem = document.getElementById('sort-item');
  sortItem.innerHTML = `
    <img src="${item.src}" class="sort-item-img" alt="${item.name}" draggable="false">
    <span class="sort-item-label">${item.name}</span>
  `;
  sortItem.className = 'sort-item';
  canDrag = true;
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

  // יצירת עותק צף
  dragClone = document.createElement('div');
  dragClone.className = 'sort-item sort-item-clone';
  dragClone.innerHTML = sortItem.innerHTML; // מעתיק את התמונה והתווית
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

  let dropped = false;
  document.querySelectorAll('.sort-box').forEach(box => {
    const r = box.getBoundingClientRect();
    if (clientX >= r.left && clientX <= r.right &&
        clientY >= r.top  && clientY <= r.bottom) {
      handleDrop(box.dataset.cat);
      dropped = true;
    }
  });
}

// ===== טיפול בשחרור =====

function handleDrop(droppedCat) {
  canDrag = false;
  const sortItem  = document.getElementById('sort-item');
  const isCorrect = gameItems[currentItemIndex].category === droppedCat;

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
