// -------- Constants --------

const N = 7;

// -------- Board --------

class Board {
  constructor(n = N) {
    this.n = n;
    this.cells = new Array(n * n).fill(0);
  }

  get(r, c) {
    return this.cells[r * this.n + c];
  }

  set(r, c, v) {
    this.cells[r * this.n + c] = v;
  }

  copy() {
    const b = new Board(this.n);
    b.cells = [...this.cells];
    return b;
  }
}

// -------- Helpers --------

function fullMask(n) {
  return (1 << n) - 1;
}

function isRowValid(b, r) {
  let mask = 0;
  for (let c = 0; c < b.n; c++) {
    mask |= (1 << b.get(r, c));
  }
  return mask === fullMask(b.n);
}

function isColValid(b, c) {
  let mask = 0;
  for (let r = 0; r < b.n; r++) {
    mask |= (1 << b.get(r, c));
  }
  return mask === fullMask(b.n);
}
function countValidRows(b) {
  let count = 0;
  for (let r = 0; r < b.n; r++) {
    if (isRowValid(b, r)) count++;
  }
  return count;
}

function countValidCols(b) {
  let count = 0;
  for (let c = 0; c < b.n; c++) {
    if (isColValid(b, c)) count++;
  }
  return count;
}

function isSolvedLevel1(b) {
  for (let i = 0; i < b.n; i++) {
    if (!isRowValid(b, i)) return false;
    if (!isColValid(b, i)) return false;
  }
  return true;
}

function isSolvedLevel2(b) {
  // rows + cols + 2 hoofddiagonalen
  for (let i = 0; i < b.n; i++) {
    if (!isRowValid(b, i)) return false;
    if (!isColValid(b, i)) return false;
  }
  return isMainDiagValid(b) && isAntiDiagValid(b);
}

function isSolvedLevel3(b) {
  // rows + cols + alle wrap-diagonalen (14)
  for (let i = 0; i < b.n; i++) {
    if (!isRowValid(b, i)) return false;
    if (!isColValid(b, i)) return false;
  }
  for (let d = 0; d < b.n; d++) {
    if (!isWrapDiagMinusValid(b, d)) return false;
    if (!isWrapDiagPlusValid(b, d)) return false;
  }
  return true;
}

function isSolvedByLevel(b, level) {
  if (level === 1) return isSolvedLevel1(b);
  if (level === 2) return isSolvedLevel2(b);
  return isSolvedLevel3(b);
}

// -------- Random helpers --------

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function perm(n) {
  return shuffleArray([...Array(n).keys()]);
}

// -------- Generator Level 1 --------

function genLevel1Solution() {
  const base = new Board(N);

  // cyclisch basispatroon
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      base.set(r, c, (r + c) % N);
    }
  }

  const rows = perm(N);
  const cols = perm(N);
  const sym  = perm(N);

  const out = new Board(N);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const v = base.get(rows[r], cols[c]);
      out.set(r, c, sym[v]);
    }
  }

  // optionele transpose
  if (Math.random() < 0.5) {
    const t = new Board(N);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        t.set(r, c, out.get(c, r));
      }
    }
    return t;
  }

  return out;
}

function genLevel2Solution() {
  const template = [
    [0,2,4,6,1,3,5],
    [1,3,5,0,2,4,6],
    [2,4,6,1,3,5,0],
    [3,5,0,2,4,6,1],
    [4,6,1,3,5,0,2],
    [5,0,2,4,6,1,3],
    [6,1,3,5,0,2,4],
  ];

  const b = new Board(N);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      b.set(r, c, template[r][c]);
    }
  }

  const sym = perm(N);

  for (let i = 0; i < b.cells.length; i++) {
    b.cells[i] = sym[b.cells[i]];
  }

  if (Math.random() < 0.5) {
    const t = new Board(N);
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        t.set(r, c, b.get(c, r));
      }
    }
    return t;
  }

  return b;
}

function genLevel3Solution() {
  const candidates = [];

  for (let a = 1; a < N; a++) {
    for (let b = 1; b < N; b++) {
      if (a === b) continue;
      if ((a + b) % N === 0) continue;
      candidates.push([a, b]);
    }
  }

  const [a, bCoeff] = candidates[Math.floor(Math.random() * candidates.length)];
  const k = Math.floor(Math.random() * N);
  const sr = Math.floor(Math.random() * N);
  const sc = Math.floor(Math.random() * N);

  const out = new Board(N);

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const rr = (r + sr) % N;
      const cc = (c + sc) % N;
      out.set(r, c, (a * rr + bCoeff * cc + k) % N);
    }
  }

  const sym = perm(N);

  for (let i = 0; i < out.cells.length; i++) {
    out.cells[i] = sym[out.cells[i]];
  }

  return out;
}

// -------- Scramble --------

function swapCells(b, a, c) {
  const tmp = b.cells[a];
  b.cells[a] = b.cells[c];
  b.cells[c] = tmp;
}

function scrambleFromSolution(solution, swaps = 30) {
  const b = solution.copy();
  const n2 = b.n * b.n;

  for (let i = 0; i < swaps; i++) {
    let a = Math.floor(Math.random() * n2);
    let c = Math.floor(Math.random() * n2);
    while (c === a) {
      c = Math.floor(Math.random() * n2);
    }
    swapCells(b, a, c);
  }

  return b;
}

// -------- Test helper --------

function makeLevel1Game() {
  const solution = genLevel1Solution();
  let board;
  do {
    board = scrambleFromSolution(solution, 30);
  } while (isSolvedLevel1(board));

  return { solution, board };
}

function isMainDiagValid(b) {
  let mask = 0;
  for (let i = 0; i < b.n; i++) {
    mask |= (1 << b.get(i, i));
  }
  return mask === fullMask(b.n);
}

function isAntiDiagValid(b) {
  let mask = 0;
  for (let i = 0; i < b.n; i++) {
    mask |= (1 << b.get(i, b.n - 1 - i));
  }
  return mask === fullMask(b.n);
}

function countValidMainDiagonals(b) {
  let ok = 0;
  if (isMainDiagValid(b)) ok++;
  if (isAntiDiagValid(b)) ok++;
  return ok;
}

function isWrapDiagMinusValid(b, d) {
  let mask = 0;
  for (let r = 0; r < b.n; r++) {
    const c = (r - d + b.n) % b.n;
    mask |= (1 << b.get(r, c));
  }
  return mask === fullMask(b.n);
}

function isWrapDiagPlusValid(b, d) {
  let mask = 0;
  for (let r = 0; r < b.n; r++) {
    const c = (d - r + b.n) % b.n;
    mask |= (1 << b.get(r, c));
  }
  return mask === fullMask(b.n);
}

function countValidWrapDiagonals(b) {
  let ok = 0;
  for (let d = 0; d < b.n; d++) {
    if (isWrapDiagMinusValid(b, d)) ok++;
    if (isWrapDiagPlusValid(b, d)) ok++;
  }
  return ok;
}
function duplicateIndicesOf(lineIndices, b) {
  const buckets = new Map();
  for (const idx of lineIndices) {
    const v = b.cells[idx];
	if (v === 0) continue;   // lege cellen overslaan
	if (!buckets.has(v)) buckets.set(v, []);
	buckets.get(v).push(idx);

  }
  const dupes = new Set();
  for (const arr of buckets.values()) {
    if (arr.length > 1) arr.forEach(i => dupes.add(i));
  }
  return dupes;
}

function badTileIndices(b, level) {
  const n = b.n;
  const bad = new Set();

  // rijen
  for (let r = 0; r < n; r++) {
    const line = [];
    for (let c = 0; c < n; c++) line.push(r * n + c);
    for (const i of duplicateIndicesOf(line, b)) bad.add(i);
  }

  // kolommen
  for (let c = 0; c < n; c++) {
    const line = [];
    for (let r = 0; r < n; r++) line.push(r * n + c);
    for (const i of duplicateIndicesOf(line, b)) bad.add(i);
  }

  // level 3: alle wrap diagonalen
  if (level === 3) {
    for (let d = 0; d < n; d++) {
      const minus = [];
      const plus = [];
      for (let r = 0; r < n; r++) {
        const c1 = (r - d + n) % n;
        const c2 = (d - r + n) % n;
        minus.push(r * n + c1);
        plus.push(r * n + c2);
      }
      for (const i of duplicateIndicesOf(minus, b)) bad.add(i);
      for (const i of duplicateIndicesOf(plus, b)) bad.add(i);
    }
    return bad;
  }

  // level 2: enkel 2 hoofddiagonalen
  if (level === 2) {
    const main = [];
    const anti = [];
    for (let i = 0; i < n; i++) {
      main.push(i * n + i);
      anti.push(i * n + (n - 1 - i));
    }
    for (const i of duplicateIndicesOf(main, b)) bad.add(i);
    for (const i of duplicateIndicesOf(anti, b)) bad.add(i);
  }

  return bad;
  
}

/* Fireworks */
function startFireworks(done) {
    const canvas = document.getElementById("fireworksCanvas");
    const ctx = canvas.getContext("2d");

    // Canvas zichtbaar maken
    canvas.classList.remove("hidden");
    canvas.style.display = "block";
    canvas.style.background = "rgba(0,0,0,0.95)";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let running = true;

    // --- HSL → RGBA converter (perfect werkend) ---
    function hslToRgba(h, s, l, a) {
        s /= 100;
        l /= 100;

        const k = n => (n + h / 30) % 12;
        const f = n =>
            l - s * Math.min(l, 1 - l) *
            Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        return `rgba(${Math.round(255 * f(0))}, ${Math.round(255 * f(8))}, ${Math.round(255 * f(4))}, ${a})`;
    }

    // --- Explosie maken ---
    function createExplosion() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.7;

        for (let i = 0; i < 120; i++) {
            particles.push({
                x,
                y,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 5 + 2,
                alpha: 1,
                radius: 2 + Math.random() * 3,
                color: {
                    h: Math.random() * 360,
                    s: 100,
                    l: 50 + Math.random() * 30
                }
            });
        }
    }

    // --- Animatie ---
    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles = particles.filter(p => p.alpha > 0);

        particles.forEach(p => {
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.alpha -= 0.015;

            ctx.fillStyle = hslToRgba(p.color.h, p.color.s, p.color.l, p.alpha);

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        if (running) {
            requestAnimationFrame(update);
        } else {
            // Canvas verbergen
            canvas.classList.add("hidden");
            canvas.style.display = "none";
            canvas.style.background = "transparent";

          if (done) done();
        }
    }

    // --- Meerdere explosies ---
    let count = 0;
    const interval = setInterval(() => {
        createExplosion();
        count++;
        if (count >= 8) {
            clearInterval(interval);
            setTimeout(() => running = false, 2000);
        }
    }, 300);

    update();
}




	