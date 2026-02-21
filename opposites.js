// ===== צמדי הפכים =====
const oppositePairs = [
  { a: { emoji: '🐘', word: 'גדול'  }, b: { emoji: '🐭', word: 'קטן'   } },
  { a: { emoji: '☀️', word: 'חם'    }, b: { emoji: '❄️', word: 'קר'    } },
  { a: { emoji: '😊', word: 'שמח'   }, b: { emoji: '😢', word: 'עצוב'  } },
  { a: { emoji: '🌞', word: 'יום'   }, b: { emoji: '🌙', word: 'לילה'  } },
  { a: { emoji: '🐆', word: 'מהיר'  }, b: { emoji: '🐢', word: 'איטי'  } },
  { a: { emoji: '⬆️', word: 'מעלה'  }, b: { emoji: '⬇️', word: 'מטה'   } },
  { a: { emoji: '🔊', word: 'רועש'  }, b: { emoji: '🤫', word: 'שקט'   } },
  { a: { emoji: '👴', word: 'זקן'   }, b: { emoji: '👶', word: 'צעיר'  } },
  { a: { emoji: '🌑', word: 'חשוך'  }, b: { emoji: '💡', word: 'בהיר'  } },
  { a: { emoji: '😴', word: 'ישן'   }, b: { emoji: '⚡', word: 'ער'    } },
  { a: { emoji: '📏', word: 'ארוך'  }, b: { emoji: '📌', word: 'קצר'   } },
  { a: { emoji: '🏋️', word: 'כבד'  }, b: { emoji: '🪶', word: 'קל'    } },
];

// ===== מצב הגדרות =====
let selectedDifficulty = 'easy';

// ===== מצב המשחק =====
let questions = [];
let currentQ  = 0;
let score     = 0;
let canAnswer = false;

// ===== בחירת רמת קושי =====

function selectDifficulty(diff, btn) {
  selectedDifficulty = diff;
  document.querySelectorAll('.difficulty-selector .mode-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== התחלת משחק =====

function startGame() {
  const count = selectedDifficulty === 'easy' ? 6 : 12;

  // כל צמד יכול להופיע בשני כיוונים (A→B או B→A)
  const allQ = [];
  oppositePairs.forEach(pair => {
    allQ.push({
      prompt:         pair.a,
      answer:         pair.b,
      distractorPool: oppositePairs.filter(p => p !== pair).map(p => p.b),
    });
    allQ.push({
      prompt:         pair.b,
      answer:         pair.a,
      distractorPool: oppositePairs.filter(p => p !== pair).map(p => p.a),
    });
  });

  questions = shuffle(allQ).slice(0, count);
  currentQ  = 0;
  score     = 0;

  document.getElementById('q-total').textContent = count;
  show('game-screen');
  showQuestion();
}

// ===== הצגת שאלה =====

function showQuestion() {
  if (currentQ >= questions.length) {
    setTimeout(showVictory, 400);
    return;
  }

  const q = questions[currentQ];
  document.getElementById('q-current').textContent = currentQ + 1;
  document.getElementById('opp-emoji').textContent = q.prompt.emoji;
  document.getElementById('opp-word').textContent  = q.prompt.word;

  // תשובה נכונה + 2 מסיחים
  const distractors = shuffle(q.distractorPool).slice(0, 2);
  const choices     = shuffle([q.answer, ...distractors]);

  const container = document.getElementById('opp-choices');
  container.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'opp-choice-btn';
    btn.innerHTML = `
      <span class="choice-emoji">${choice.emoji}</span>
      <span class="choice-word">${choice.word}</span>
    `;
    btn.addEventListener('click', () => handleAnswer(btn, choice.word === q.answer.word));
    container.appendChild(btn);
  });

  canAnswer = true;
}

// ===== טיפול בתשובה =====

function handleAnswer(btn, isCorrect) {
  if (!canAnswer) return;
  canAnswer = false;

  if (isCorrect) {
    btn.classList.add('correct');
    score++;
    setTimeout(() => {
      currentQ++;
      showQuestion();
    }, 750);
  } else {
    btn.classList.add('wrong');
    setTimeout(() => {
      btn.classList.remove('wrong');
      canAnswer = true;
    }, 500);
  }
}

// ===== ניצחון =====

function showVictory() {
  document.getElementById('final-score').textContent = score;
  document.getElementById('final-total').textContent = questions.length;
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
