/* ─── STATE ─── */
const state = {
  active: false,
  total: 10,
  strand: 'number',
  numOps: new Set(['add', 'sub', 'mul', 'div']),
  geoOps: new Set(['perimeter', 'area', 'angles', 'shapes', 'units', 'time']),
  statOps: new Set(['mean', 'range', 'mode', 'median', 'probability']),
  players: [
    { score: 0, answer: 0, name: 'Player 1' },
    { score: 0, answer: 0, name: 'Player 2' }
  ]
};

/* ─── AUDIO ─── */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playCorrect() {
  try {
    const ctx = getAudio();
    const t = ctx.currentTime;
    [[523, 0], [659, 0.1], [784, 0.2], [1046, 0.32]].forEach(([freq, dt]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq; o.type = 'triangle';
      g.gain.setValueAtTime(0.18, t + dt);
      g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.18);
      o.start(t + dt); o.stop(t + dt + 0.2);
    });
  } catch (_) {}
}
function playWrong() {
  try {
    const ctx = getAudio();
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(110, t + 0.25);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.start(t); o.stop(t + 0.3);
  } catch (_) {}
}
function playWin() {
  try {
    const ctx = getAudio();
    const t = ctx.currentTime;
    [[523, 0], [659, 0.12], [784, 0.24], [1046, 0.38], [1318, 0.55]].forEach(([freq, dt]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq; o.type = 'sine';
      g.gain.setValueAtTime(0.22, t + dt);
      g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.35);
      o.start(t + dt); o.stop(t + dt + 0.4);
    });
  } catch (_) {}
}

/* ─── QUESTION GENERATORS ─── */
const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function makeNumberQuestion() {
  const pool = [...state.numOps];
  if (!pool.length) return { text: '10 + 10 = ?', answer: 20, op: 'add' };
  const op = pool[ri(0, pool.length - 1)];
  let a, b, answer, display;

  switch (op) {
    case 'add':
      a = ri(10, 59); b = ri(10, 40);
      answer = a + b;
      display = `${a} + ${b} = ?`;
      break;
    case 'sub':
      a = ri(21, 99); b = ri(10, Math.min(a - 1, 50));
      answer = a - b;
      display = `${a} − ${b} = ?`;
      break;
    case 'mul':
      a = ri(11, 19); b = ri(2, 9);
      answer = a * b;
      display = `${a} × ${b} = ?`;
      break;
    case 'div':
      b = ri(2, 9); answer = ri(11, 19); a = answer * b;
      display = `${a} ÷ ${b} = ?`;
      break;
  }
  return { text: display, answer, op };
}

function makeGeometryQuestion() {
  const pool = [...state.geoOps];
  if (!pool.length) return { text: 'Sides in a square?', answer: 4, op: 'shapes' };
  const op = pool[ri(0, pool.length - 1)];
  let answer, display;

  switch (op) {
    case 'perimeter': {
      const a = ri(3, 12), b = ri(3, 12);
      answer = 2 * (a + b);
      display = `Perimeter: ${a}×${b} rect?`;
      break;
    }
    case 'area': {
      const a = ri(3, 12), b = ri(3, 12);
      answer = a * b;
      display = `Area: ${a}×${b} rect?`;
      break;
    }
    case 'angles': {
      const a1 = ri(20, 80);
      const a2 = ri(20, Math.min(80, 160 - a1));
      answer = 180 - a1 - a2;
      display = `△: ${a1}°+${a2}°+?=180°`;
      break;
    }
    case 'shapes': {
      const options = [
        ['triangle', 3], ['square', 4], ['pentagon', 5],
        ['hexagon', 6], ['heptagon', 7], ['octagon', 8]
      ];
      const [name, sides] = options[ri(0, options.length - 1)];
      answer = sides;
      display = `Sides in a ${name}?`;
      break;
    }
    case 'units': {
      const type = ri(0, 2);
      if (type === 0) {
        answer = ri(1, 9);
        display = `${answer * 100} cm = ? m`;
      } else if (type === 1) {
        const m = ri(1, 9); answer = m * 100;
        display = `${m} m = ? cm`;
      } else {
        const km = ri(1, 5); answer = km * 1000;
        display = `${km} km = ? m`;
      }
      break;
    }
    case 'time': {
      const type = ri(0, 1);
      if (type === 0) {
        const h = ri(1, 5); answer = h * 60;
        display = `${h} hr = ? min`;
      } else {
        const m = ri(1, 9); answer = m * 60;
        display = `${m} min = ? sec`;
      }
      break;
    }
  }
  return { text: display, answer, op };
}

function makeStatisticsQuestion() {
  const pool = [...state.statOps];
  if (!pool.length) return { text: 'Mean: 4,8,12?', answer: 8, op: 'mean' };
  const op = pool[ri(0, pool.length - 1)];
  let answer, display;

  switch (op) {
    case 'mean': {
      const avg = ri(3, 12);
      const d1 = ri(1, avg - 1);
      const d2 = ri(1, d1);
      const nums = [avg - d1, avg + d2, avg + d1 - d2].sort(() => Math.random() - 0.5);
      answer = avg;
      display = `Mean: ${nums.join(',')}?`;
      break;
    }
    case 'range': {
      const min = ri(2, 10);
      const max = min + ri(5, 12);
      const mid1 = ri(min + 1, max - 1);
      const mid2 = ri(min + 1, max - 1);
      const nums = [min, mid1, mid2, max].sort(() => Math.random() - 0.5);
      answer = max - min;
      display = `Range: ${nums.join(',')}?`;
      break;
    }
    case 'mode': {
      const mode = ri(2, 10);
      const others = [];
      while (others.length < 2) {
        const n = ri(1, 15);
        if (n !== mode && !others.includes(n)) others.push(n);
      }
      const nums = [mode, mode, others[0], others[1]].sort(() => Math.random() - 0.5);
      answer = mode;
      display = `Mode: ${nums.join(',')}?`;
      break;
    }
    case 'median': {
      const a = ri(1, 9), b = ri(10, 19), c = ri(20, 30);
      answer = b;
      display = `Median: ${a},${b},${c}?`;
      break;
    }
    case 'probability': {
      const total = ri(8, 20);
      const fav = ri(1, total - 1);
      answer = total - fav;
      display = `${fav} red out of ${total}. Not red?`;
      break;
    }
  }
  return { text: display, answer, op };
}

function makeQuestion() {
  if (state.strand === 'geometry') return makeGeometryQuestion();
  if (state.strand === 'statistics') return makeStatisticsQuestion();
  return makeNumberQuestion();
}

const opLabels = {
  add: 'Addition', sub: 'Subtraction', mul: 'Multiplication', div: 'Division',
  perimeter: 'Perimeter', area: 'Area', angles: 'Angles',
  shapes: 'Shapes', units: 'Units', time: 'Time',
  mean: 'Mean', range: 'Range', mode: 'Mode',
  median: 'Median', probability: 'Probability'
};
const opClass = {
  add: 'op-add', sub: 'op-sub', mul: 'op-mul', div: 'op-div',
  perimeter: 'op-perimeter', area: 'op-area', angles: 'op-angles',
  shapes: 'op-shapes', units: 'op-units', time: 'op-time',
  mean: 'op-mean', range: 'op-range', mode: 'op-mode',
  median: 'op-median', probability: 'op-probability'
};

function setQuestion(p) {
  const q = makeQuestion();
  state.players[p].answer = q.answer;
  const qEl = document.getElementById(`question${p + 1}`);
  qEl.textContent = q.text;
  qEl.className = 'question-text' + (state.strand !== 'number' ? ' sm' : '');
  const badge = document.getElementById(`opbadge${p + 1}`);
  badge.textContent = opLabels[q.op];
  badge.className = `op-badge ${opClass[q.op]}`;
}

/* ─── CAR POSITION ─── */
function updateCar(p) {
  const score   = state.players[p].score;
  const trackEl = document.getElementById(`track${p + 1}`);
  const carEl   = document.getElementById(`carSlot${p + 1}`);
  const carW = 96, finishW = 22, pad = 10;
  const usable = trackEl.offsetWidth - carW - finishW - pad;
  carEl.style.left = (pad + (score / state.total) * usable) + 'px';

  carEl.classList.add('boosting');
  carEl.querySelectorAll('.wheel').forEach(w => w.classList.add('spin'));
  setTimeout(() => {
    carEl.classList.remove('boosting');
    carEl.querySelectorAll('.wheel').forEach(w => w.classList.remove('spin'));
  }, 500);
}

function updateProgress(p) {
  const score = state.players[p].score;
  document.getElementById(`bar${p + 1}`).style.width = (score / state.total * 100) + '%';
  document.getElementById(`cnt${p + 1}`).textContent = `${score}/${state.total}`;
}

/* ─── FEEDBACK ─── */
const fbTimers = [null, null];
function showFeedback(p, correct) {
  const el = document.getElementById(`fb${p + 1}`);
  clearTimeout(fbTimers[p]);
  el.textContent = correct ? '✓ Correct! 🚀' : '✗ Wrong, try again!';
  el.className = 'feedback-row ' + (correct ? 'fb-correct' : 'fb-wrong');
  if (!correct) {
    void el.offsetWidth;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }
  fbTimers[p] = setTimeout(() => { el.textContent = ''; el.className = 'feedback-row'; }, 900);
}

function flashPanel(p) {
  const el = document.getElementById(`flash${p + 1}`);
  el.className = 'speed-flash go';
  setTimeout(() => { el.className = 'speed-flash'; }, 400);
}

/* ─── SUBMIT ANSWER ─── */
function submit(p) {
  if (!state.active) return;
  const inp = document.getElementById(`input${p + 1}`);
  const val = parseInt(inp.value, 10);
  inp.value = '';

  if (isNaN(val)) { inp.focus(); return; }

  if (val === state.players[p].answer) {
    state.players[p].score++;
    playCorrect();
    flashPanel(p);
    updateCar(p);
    updateProgress(p);
    showFeedback(p, true);

    if (state.players[p].score >= state.total) {
      endGame(p);
      return;
    }
    setQuestion(p);
  } else {
    playWrong();
    showFeedback(p, false);
  }
  inp.focus();
}

/* ─── LEADERBOARD PERSISTENCE ─── */
function saveResult(winner) {
  const history = JSON.parse(localStorage.getItem('mathRaceHistory') || '[]');
  history.push({
    p1: { name: state.players[0].name, score: state.players[0].score },
    p2: { name: state.players[1].name, score: state.players[1].score },
    total: state.total,
    winner,
    date: new Date().toISOString()
  });
  localStorage.setItem('mathRaceHistory', JSON.stringify(history));
}

/* ─── END GAME ─── */
function endGame(winner) {
  state.active = false;
  playWin();
  saveResult(winner);

  const p = state.players;
  const wName = p[winner].name;
  const lName = p[winner ^ 1].name;

  document.getElementById('winTitle').textContent = `${wName} Wins! 🎉`;
  document.getElementById('winTitle').style.color = winner === 0 ? '#ff8855' : '#33ddff';
  document.getElementById('winSubtitle').textContent = `${lName} keeps practising — the race goes on!`;
  document.getElementById('winN1').textContent = p[0].name;
  document.getElementById('winN2').textContent = p[1].name;
  document.getElementById('winS1').textContent = `${p[0].score}/${state.total}`;
  document.getElementById('winS2').textContent = `${p[1].score}/${state.total}`;

  launchConfetti();
  document.getElementById('winScreen').classList.remove('hidden');
}

/* ─── CONFETTI ─── */
function launchConfetti() {
  const wrap = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  const colors = ['#ff6b35', '#ffcc00', '#00d4ff', '#ff44aa', '#88ff44', '#cc88ff', '#ffffff'];
  for (let i = 0; i < 90; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const dur = 2 + Math.random() * 2.5;
    const dx  = (Math.random() - 0.5) * 200;
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[i % colors.length]};
      width: ${6 + Math.random() * 8}px;
      height: ${10 + Math.random() * 14}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${dur}s;
      animation-delay: ${Math.random() * 0.8}s;
      --dx: ${dx}px;
    `;
    wrap.appendChild(piece);
  }
}

/* ─── RESET ─── */
function resetGame() {
  state.players.forEach((pl, i) => {
    pl.score = 0;
    document.getElementById(`carSlot${i + 1}`).style.left = '10px';
    document.getElementById(`bar${i + 1}`).style.width = '0%';
    document.getElementById(`cnt${i + 1}`).textContent = `0/${state.total}`;
    document.getElementById(`fb${i + 1}`).textContent = '';
    document.getElementById(`flash${i + 1}`).className = 'speed-flash';
  });
  document.getElementById('winScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
  document.getElementById('numpad1').classList.remove('visible');
  document.getElementById('numpad2').classList.remove('visible');
  document.getElementById('input1').classList.remove('readonly-look');
  document.getElementById('input2').classList.remove('readonly-look');
}

/* ─── START ─── */
function startGame() {
  const n1 = document.getElementById('name1').value.trim() || 'Player 1';
  const n2 = document.getElementById('name2').value.trim() || 'Player 2';

  state.players[0].name = n1;
  state.players[1].name = n2;

  document.getElementById('pname1').textContent = n1;
  document.getElementById('pname2').textContent = n2;
  document.getElementById('lbl1').textContent = n1;
  document.getElementById('lbl2').textContent = n2;

  state.players.forEach((pl, i) => {
    pl.score = 0;
    document.getElementById(`carSlot${i + 1}`).style.left = '10px';
    document.getElementById(`bar${i + 1}`).style.width = '0%';
    document.getElementById(`cnt${i + 1}`).textContent = `0/${state.total}`;
    document.getElementById(`fb${i + 1}`).textContent = '';
    document.getElementById(`input${i + 1}`).value = '';
    setQuestion(i);
  });

  state.active = true;
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('numpad1').classList.add('visible');
  document.getElementById('numpad2').classList.add('visible');
  document.getElementById('input1').classList.add('readonly-look');
  document.getElementById('input2').classList.add('readonly-look');
}

/* ─── UI EVENT LISTENERS ─── */

// Strand selector
document.querySelectorAll('.strand-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.strand-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.strand = btn.dataset.strand;
    document.getElementById('opSelectorNumber').classList.toggle('hidden', state.strand !== 'number');
    document.getElementById('opSelectorGeometry').classList.toggle('hidden', state.strand !== 'geometry');
    document.getElementById('opSelectorStatistics').classList.toggle('hidden', state.strand !== 'statistics');
  });
});

// Op toggles (strand-aware)
document.querySelectorAll('.op-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const op = btn.dataset.op;
    const strand = btn.dataset.strand;
    const set = strand === 'geometry' ? state.geoOps : strand === 'statistics' ? state.statOps : state.numOps;
    if (set.has(op)) {
      if (set.size > 1) { set.delete(op); btn.classList.remove('active'); }
    } else {
      set.add(op); btn.classList.add('active');
    }
  });
});

document.querySelectorAll('.q-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.q-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.total = parseInt(btn.dataset.q);
  });
});

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('name1').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('name2').focus(); });
document.getElementById('name2').addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });

document.getElementById('playAgainBtn').addEventListener('click', resetGame);

[0, 1].forEach(p => {
  document.getElementById(`input${p + 1}`).addEventListener('keydown', e => { if (e.key === 'Enter') submit(p); });
  document.getElementById(`btn${p + 1}`).addEventListener('click', () => submit(p));
});

document.querySelectorAll('.numkey').forEach(btn => {
  btn.addEventListener('mousedown', e => e.preventDefault());
  btn.addEventListener('click', () => {
    const p   = parseInt(btn.dataset.p, 10);
    const val = btn.dataset.val;
    const inp = document.getElementById(`input${p + 1}`);
    if (val === 'go') {
      submit(p);
    } else if (val === 'del') {
      inp.value = inp.value.toString().slice(0, -1);
    } else {
      if (inp.value.toString().length < 5) {
        inp.value = inp.value + val;
      }
    }
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') e.preventDefault();
});
