// =========================
//  GLOBALE CONSTANTEN
// =========================

const palette = [
  "#E53935", "#1E88E5", "#43A047",
  "#FDD835", "#8E24AA", "#FB8C00", "#79B4DD"
];

let selectedIdx = null;
let Zetten = 0;
let level = 1;
let hintIndices = new Set();
let lang = "NL";

let defaultMessage = {
  NL: "Hoe speel je dit? Klik op info voor wat uitleg.",
  FR: "Comment jouer? Cliquez sur info.",
  EN: "How to play? Click info.",
  DE: "Wie spielt man? Klicken Sie auf Info."
};

const texts = {
  NL: { help: "Joker", yes: "Ja", no: "Nee", confirmNewGame: "Nieuw spel starten in dit level?", chooseLang: "Kies een taal", solution: "Oplossing", new: "Nieuw spel", confirmSolution: "Oplossing tonen?", solved: "Opgelost!", hintActive: "Tegels met joker staan fout."},
  FR: { help: "Joker", hintActive: "Les tuiles contenant une joker sont incorrectes.", yes: "Oui", no: "Non", confirmNewGame: "Recommencer une nouvelle partie ?", chooseLang: "Choisir une langue", solution: "Solution", new: "Nouveau jeu", confirmSolution: "Afficher la solution?", solved: "Résolu!" },
  EN: { help: "Joker", hintActive: "Joker‑marked tiles break the rules.", yes: "Yes", no: "No", confirmNewGame: "Start a new game at this level?", chooseLang: "Choose a language", solution: "Solution", new: "New game", confirmSolution: "Show solution?", solved: "Solved!" },
  DE: { help: "Joker", hintActive: "Felder mit Joker sind falsch.", yes: "Ja", no: "Nein", confirmNewGame: "Neues Spiel auf diesem Level starten?", chooseLang: "Sprache wählen", solution: "Lösung", new: "Neues spiel", confirmSolution: "Lösung anzeigen?", solved: "Gelöst!" }
};

const langFlagImg = {
  NL: "images/NL.png",
  FR: "images/FR.png",
  EN: "images/EN.png",
  DE: "images/DE.png"
};

const readmeText = {
  NL: `<h4>Hoe speel je dit spel?</h4> ...`,
  EN: `<h4>How to play this game?</h4> ...`,
  FR: `<h4>Comment jouer à ce jeu ?</h4> ...`,
  DE: `<h4>Wie spielt man dieses Spiel?</h4> ...`
};


// =========================
//  DOM ELEMENTEN
// =========================

let boardEl, ZettenEl, rowsEl, colsEl, diagStatEl;
let messageBar, jokerBtn, solutionBtn, langBtn, readmeBtn;


// =========================
//  TAAL
// =========================

function applyLanguage() {
  const t = texts[lang];

  const jokerImg = document.querySelector("#jokerBtn img");
  if (jokerImg) jokerImg.alt = t.help;
  document.getElementById("jokerBtn").title = t.help;

  const solImg = document.querySelector("#solutionBtn img");
  if (solImg) solImg.alt = t.solution;
  document.getElementById("solutionBtn").title = t.solution;

  const newImg = document.querySelector("#newGameBtn img");
  if (newImg) newImg.alt = t.new;
  document.getElementById("newGameBtn").title = t.new;

  const langImg = document.querySelector("#langBtn img");
  if (langImg) {
    langImg.src = langFlagImg[lang];
    langImg.alt = lang;
  }
  document.getElementById("langBtn").title = lang;

  const infoImg = document.querySelector("#readmeBtn img");
  if (infoImg) infoImg.alt = "Info";
  document.getElementById("readmeBtn").title = "Info";

  document.getElementById("lev1").textContent = (lang === "EN" ? "LVL1" : "LEV1");
  document.getElementById("lev2").textContent = (lang === "EN" ? "LVL2" : "LEV2");
  document.getElementById("lev3").textContent = (lang === "EN" ? "LVL3" : "LEV3");

  const msgEl = document.getElementById("messageText");
  if (msgEl) msgEl.textContent = defaultMessage[lang];

  const labels = {
    NL: ["Zetten:", "Rijen:", "Kolommen:", "Diag:"],
    FR: ["Coups:", "Lignes:", "Colonnes:", "Diag:"],
    EN: ["Moves:", "Rows:", "Columns:", "Diag:"],
    DE: ["Züge:", "Reihen:", "Spalten:", "Diag:"]
  };

  document.getElementById("labelZetten").textContent = labels[lang][0];
  document.getElementById("labelRows").textContent = labels[lang][1];
  document.getElementById("labelCols").textContent = labels[lang][2];
  document.getElementById("labelDiag").textContent = labels[lang][3];
}


// =========================
//  RENDER
// =========================

function render() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, i) => {
    cell.classList.toggle("selected", i === selectedIdx);
  });

  boardEl.innerHTML = "";

  let diagText;
  if (level === 1) diagText = "Diag:";
  else if (level === 2) diagText = countValidMainDiagonals(board) + "/2";
  else diagText = countValidWrapDiagonals(board) + "/14";

  diagStatEl.textContent = diagText;

  board.cells.forEach((value, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";

    const inner = document.createElement("div");
    inner.className = "cell-inner";
    inner.style.background = palette[value];
    cell.appendChild(inner);

    if (hintIndices.has(idx)) {
      const joker = document.createElement("div");
      joker.className = "joker";
      const img = document.createElement("img");
      img.src = "images/joker.png";
      img.alt = "Joker";
      joker.appendChild(img);
      cell.appendChild(joker);
    }

    if (selectedIdx === idx) cell.classList.add("selected");

    cell.onclick = () => handleClick(idx);
    boardEl.appendChild(cell);
  });

  ZettenEl.textContent = Zetten;
  rowsEl.textContent = countValidRows(board);
  colsEl.textContent = countValidCols(board);
}


// =========================
//  KLIKKEN / SWAPPEN
// =========================

function handleClick(idx) {
  if (hintIndices.size > 0) {
    hintIndices = new Set();
    clearMessage();
  }

  if (selectedIdx === null) {
    selectedIdx = idx;
    render();
    return;
  }

  if (selectedIdx !== idx) {
    swapCells(board, selectedIdx, idx);
    Zetten++;
  }
  selectedIdx = null;

  render();

  setTimeout(() => {
    const fouten = badTileIndices(board, level);

    if (fouten.size === 0) {
      showMessage(texts[lang].solved);
      startFireworks(() => {
        const canvas = document.getElementById("fireworksCanvas");
        canvas.classList.add("hidden");
        canvas.style.display = "none";
        render();
      });
      return;
    }

    hintIndices = new Set();
    clearMessage();
  }, 50);
}


// =========================
//  MESSAGES
// =========================

function showMessage(text, extraHTML = "") {
  const bar = document.getElementById("messageBar");
  const stats = document.getElementById("toolbar3");

  bar.classList.add("visible");
  bar.style.display = "flex";
  bar.innerHTML = `<span id="messageText">${text}</span>${extraHTML}`;

  if (stats) stats.style.display = "none";
}

function clearMessage() {
  const bar = document.getElementById("messageBar");

  bar.classList.remove("visible");
  bar.style.display = "none";
  bar.innerHTML = "";

  // Zet de default boodschap terug
  setTimeout(() => {
    showMessage(defaultMessage[lang]);
  }, 10);
}



// =========================
//  SAVE / LOAD
// =========================

function saveGame() {
  const data = {
    board: [...board.cells],
    level: level,
    zetten: Zetten,
    hints: [...hintIndices]
  };
  localStorage.setItem("latinsquare-save", JSON.stringify(data));
}

function loadGame() {
  const raw = localStorage.getItem("latinsquare-save");
  if (!raw) return false;

  try {
    const data = JSON.parse(raw);

    board.cells = [...data.board];
    level = data.level;
    Zetten = data.zetten;
    hintIndices = new Set(data.hints || []);
    selectedIdx = null;

    updateLevelButtons();
    return true;
  } catch {
    return false;
  }
}


// =========================
//  NIEUW SPEL
// =========================

function newGame() {
  clearMessage();
  showMessage(defaultMessage[lang]);

  let solutionPattern;

  if (level === 1) solutionPattern = genLevel1Solution();
  else if (level === 2) solutionPattern = genLevel2Solution();
  else solutionPattern = genLevel3Solution();

  const swaps = level === 1 ? 30 : level === 2 ? 70 : 90;

  const solutionBoard = scrambleFromSolution(solutionPattern, 0);

  let boardLocal;
  do {
    boardLocal = scrambleFromSolution(solutionPattern, swaps);
  } while (level === 1 && isSolvedLevel1(boardLocal));

  solution = solutionBoard;
  board = boardLocal;

  Zetten = 0;
  selectedIdx = null;
  updateLevelButtons();
  render();
}


// =========================
//  INIT
// =========================

window.onload = () => {
  boardEl = document.getElementById("board");
  ZettenEl = document.getElementById("Zetten");
  rowsEl = document.getElementById("rowsOk");
  colsEl = document.getElementById("colsOk");
  diagStatEl = document.getElementById("diagStat");
  messageBar = document.getElementById("messageBar");
  jokerBtn = document.getElementById("jokerBtn");
  solutionBtn = document.getElementById("solutionBtn");
  langBtn = document.getElementById("langBtn");
  readmeBtn = document.getElementById("readmeBtn");

  applyLanguage();

  document.getElementById("newGameBtn").onclick = newGame;
  document.getElementById("lev1").onclick = () => setLevel(1);
  document.getElementById("lev2").onclick = () => setLevel(2);
  document.getElementById("lev3").onclick = () => setLevel(3);

  jokerBtn.onclick = () => {
    hintIndices = badTileIndices(board, level);
    showMessage(texts[lang].hintActive);
    render();
  };

  solutionBtn.onclick = () => {
    showMessage(texts[lang].confirmSolution, `
      <button id="confirmYes">${texts[lang].yes}</button>
      <button id="confirmNo">${texts[lang].no}</button>
    `);

    document.getElementById("confirmYes").onclick = () => {
      board = solution.copy();
      hintIndices = new Set();
      Zetten = 0;
      render();
      showMessage(texts[lang].solved);
    };

    document.getElementById("confirmNo").onclick = clearMessage;
  };

  langBtn.onclick = () => {
    showMessage(texts[lang].chooseLang, `
      <div class="lang-select">
        <button data-lang="NL"><img src="images/NL.png"></button>
        <button data-lang="FR"><img src="images/FR.png"></button>
        <button data-lang="EN"><img src="images/EN.png"></button>
        <button data-lang="DE"><img src="images/DE.png"></button>
      </div>
    `);

    document.querySelectorAll(".lang-select button").forEach(btn => {
      btn.onclick = () => {
        lang = btn.dataset.lang;
        applyLanguage();
        clearMessage();
      };
    });
  };

  if (readmeBtn) {
    readmeBtn.onclick = () => openModal(readmeText[lang]);
  }

  // Eerst een geldig board-object maken
  newGame();

  // Daarna proberen laden
  if (loadGame()) {
    render();
    showMessage(defaultMessage[lang]);
  }
  updateLevelButtons();
};

function setLevel(n) {
  level = n;
  newGame();
}


function updateLevelButtons() {
  const buttons = document.querySelectorAll(".level");
  buttons.forEach(btn => {
    const btnLevel = parseInt(btn.id.replace("lev", ""), 10);
    if (btnLevel === level) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}




// =========================
//  AUTOSAVE BIJ AFSLUITEN
// =========================

window.addEventListener("beforeunload", saveGame);
