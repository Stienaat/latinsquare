// =========================
//  GLOBALE CONSTANTEN
// =========================

//  rood  blauw  groen   geel   paars   oranje   bleekblauw
const palette = [
  "#DC3545", "#00AFF0", "#00FF00",
  "#FFFF00", "#6610F2", "#FFC107", "#ADB5BD"
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
  NL: { help: "Joker", 
  yes: "Ja", no: "Nee", 
  confirmNewGame: "Nieuw spel starten ?", 
  chooseLang: "Kies een taal", 
  solution: "Oplossing", 
  new: "Nieuw spel", 
  confirmSolution: "Oplossing tonen?", 
  solved: "Opgelost!",
  hintActive: "Tegels met joker staan fout."},
  
  FR: { help: "Joker", hintActive: "Les tuiles contenant une joker sont incorrectes.",  yes: "Oui", no: "Non", confirmNewGame: "Recommencer une nouvelle partie ?", chooseLang: "Choisir une langue", solution: "Solution", new: "Nouveau jeu", confirmSolution: "Afficher la solution?", solved: "Résolu!" },
  EN: { help: "Joker", hintActive: "Joker‑marked tiles break the rules.",  yes: "Yes", no: "No", confirmNewGame: "Start a new game at this level?", chooseLang: "Choose a language", solution: "Solution", new: "New game", confirmSolution: "Show solution?", solved: "Solved!" },
  DE: { help: "Joker", hintActive: "Felder mit Joker sind falsch.",  yes: "Ja", no: "Nein", confirmNewGame: "Neues Spiel auf diesem Level starten?", chooseLang: "Sprache wählen", solution: "Lösung", new: "Neues spiel", confirmSolution: "Lösung anzeigen?", solved: "Gelöst!" }
};

const langFlagImg = {
    NL: "images/NL.png",
    FR: "images/FR.png",
    EN: "images/EN.png",
    DE: "images/DE.png"
};


const readmeText = {
  NL: `
    <h4>Hoe speel je dit spel?</h4>
    <p>* Ieder spel is altijd oplosbaar.<br>
    * Vorm rijen en kolommen die bestaan uit 7 verschillen- de kleuren.<br>
    * Selecteer 2 tegels om ze van plaats te laten wisselen.<br>
    * Lev1: Rijen en kolommen mogen maximaal van elke kleur 1 tegel hebben.<br>
    * Lev2: Idem maar aangevuld met de 2 grote diagona- len.<br>
    * Lev3: Zoals 1, maar aangevuld met alle 14 diagonalen.<br>
    * Onderaan staat uw actuele score.<br>
    * Zit u vast? Klik op de joker. Die toont U de foute tegels.<br>
    * Lukt het niet? Twijfel je of de oplossing wel bestaat. Klik op “oplossing”.<br>
    * Succes.</p>
  `,

  EN: `
    <h4>How to play this game?</h4>
    <p>* Every puzzle is solvable.<br>
    * Create rows and columns with 7 different colors.<br>
    * Select 2 tiles to swap them.<br>
    * Level 1: Rows and columns may contain max 1 tile of each color.<br>
    * Level 2: Same, plus the 2 main diagonals.<br>
    * Level 3: Same as 1, plus all 14 diagonals.<br>
    * Your score is shown at the bottom.<br>
    * Stuck? Click the joker.<br>
    * Too hard? Click “solution”.<br>
    * Good luck.</p>
  `,

  FR: `
    <h4>Comment jouer à ce jeu ?</h4>
    <p>* Chaque puzzle est solvable.<br>
    * Formez des lignes et colonnes avec 7 couleurs différentes.<br>
    * Sélectionnez 2 tuiles pour les échanger.<br>
    * Niveau 1 : lignes et colonnes max 1 tuile de chaque couleur.<br>
    * Niveau 2 : idem + les 2 grandes diagonales.<br>
    * Niveau 3 : idem + les 14 diagonales.<br>
    * Votre score est affiché en bas.<br>
    * Bloqué ? Cliquez sur le joker.<br>
    * Trop difficile ? Cliquez sur “solution”.<br>
    * Bonne chance.</p>
  `,

  DE: `
    <h4>Wie spielt man dieses Spiel?</h4>
    <p>* Jedes Puzzle ist lösbar.<br>
    * Bilden Sie Reihen und Spalten mit 7 verschiedenen Farben.<br>
    * Wählen Sie 2 Kacheln aus, um sie zu tauschen.<br>
    * Level 1: Reihen und Spalten max. 1 Kachel pro Farbe.<br>
    * Level 2: wie Level 1 + die 2 Hauptdiagonalen.<br>
    * Level 3: wie Level 1 + alle 14 Diagonalen.<br>
    * Ihr Punktestand steht unten.<br>
    * Festgefahren? Joker klicken.<br>
    * Zu schwer? “Lösung” klicken.<br>
    * Viel Erfolg.</p>
  `
};

// =========================
//  DOM ELEMENTEN
// =========================

let boardEl, ZettenEl, rowsEl, colsEl, diagStatEl;
let messageBar, jokerBtn, solutionBtn, langBtn, readmeBtn;

document.addEventListener("DOMContentLoaded", () => {
    const bar = document.getElementById("messageBar");

    // Bestaat messageExtra al? Zo niet → maak hem aan
    if (!document.getElementById("messageExtra")) {
        const extra = document.createElement("span");
        extra.id = "messageExtra";
        bar.appendChild(extra);
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("messageBar");
  if (!document.getElementById("messageExtra")) {
    const extra = document.createElement("span");
    extra.id = "messageExtra";
    bar.appendChild(extra);
  }
});


document.addEventListener('touchmove', function (e) {
    if (e.scale !== 1) {
        e.preventDefault();
    }
}, { passive: false });



// =========================
//  TAAL
// =========================

function applyLanguage() {
  const t = texts[lang];

  // Toolbar icons: alt + title
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

  // Level buttons
  document.getElementById("lev1").textContent = (lang === "EN" ? "LVL1" : "Lev1");
  document.getElementById("lev2").textContent = (lang === "EN" ? "LVL2" : "Lev2");
  document.getElementById("lev3").textContent = (lang === "EN" ? "LVL3" : "Lev3");


  const msgEl = document.getElementById("messageText");
	if (msgEl) msgEl.textContent = defaultMessage[lang];

  // Stats labels
  const labels = {
    NL: ["Zetten:", "Rij:", "Kolom:", "Diag:"],
    FR: ["Coups:", "Lignes:", "Colonnes:", "Diag:"],
    EN: ["Moves:", "Rows:", "Columns:", "Diag:"],
    DE: ["Züge:", "Reihen:", "Spalten:", "Diag:"]
  };

  const lm = document.getElementById("labelZetten");
  const lr = document.getElementById("labelRows");
  const lc = document.getElementById("labelCols");
  const ld = document.getElementById("labelDiag");

  if (lm) lm.textContent = labels[lang][0];
  if (lr) lr.textContent = labels[lang][1];
  if (lc) lc.textContent = labels[lang][2];
  if (ld) ld.textContent = labels[lang][3];

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

  // Diag‑tekst één keer berekenen
  let diagText;
  if (level === 1) {
    diagText = "Diag:";
  } else if (level === 2) {
    diagText = countValidMainDiagonals(board) + "/2";
  } else {
    diagText = countValidWrapDiagonals(board) + "/14";
  }
  if (diagStatEl) diagStatEl.textContent = diagText;
  
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

function showLevelChangeMessage(targetLevel) {
  showMessage(
    texts[lang].confirmNewGame,
    `
      <button id="confirmYes">${texts[lang].yes}</button>
      <button id="confirmNo">${texts[lang].no}</button>
    `
  );

  document.getElementById("confirmYes").onclick = () => {
    level = targetLevel;
    newGame();
    updateLevelButtons();
    clearMessage();
  };

  document.getElementById("confirmNo").onclick = clearMessage;
}

// =========================
//  LEVELS
// =========================

function setLevel(newLevel) {
  if (newLevel === level) return;
  if (Zetten > 0) return showLevelChangeMessage(newLevel);

  level = newLevel;
  updateLevelButtons();
  newGame();
}

function updateLevelButtons() {
  document.querySelectorAll(".level").forEach(btn => btn.classList.remove("active"));
  document.getElementById("lev" + level).classList.add("active");
}

function showLevelChangeMessage(targetLevel) {
  showMessage(
    texts[lang].confirmNewGame,
    `
      <button id="confirmYes">${texts[lang].yes}</button>
      <button id="confirmNo">${texts[lang].no}</button>
    `
  );

  document.getElementById("confirmYes").onclick = () => {
    level = targetLevel;
    newGame();
    updateLevelButtons();
    clearMessage();
  };

  document.getElementById("confirmNo").onclick = clearMessage;
}


function hideMessage() {
  messageBar.classList.remove("visible");
  messageBar.innerHTML = "";
}


// =========================
//  KLIKKEN, swappen
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
	saveGame();
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
		canvas.style.background = "transparent";
		canvas.style.display = "none";

		render();   // UI opnieuw opbouwen
	});

      return; 		// STOP ALLES HIER
    }

					// normale flow
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
  bar.innerHTML = `
    <span id="messageText">${text}</span>
    ${extraHTML}
  `;

  if (stats) stats.style.display = "none";
}

function clearMessage() {
    showMessage(defaultMessage[lang]);
}

// =========================
//  SAVE / LOAD (V1.1)
// =========================

const SAVE_KEY = "latinsquare-v1-save";

function saveGame() {
  const data = {
    board: [...board.cells],   // alleen de array opslaan
    level: level,
    zetten: Zetten,
    hints: Array.from(hintIndices)
  };

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Kon spel niet opslaan:", e);
  }
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;

  try {
    const data = JSON.parse(raw);

    // board herstellen
    board.cells = [...data.board];

    // overige state
    level = data.level ?? 1;
    Zetten = data.zetten ?? 0;
    hintIndices = new Set(data.hints ?? []);
    selectedIdx = null;

    updateLevelButtons();
    return true;
  } catch (e) {
    console.warn("Kon save niet laden:", e);
    return false;
  }
}


// =========================
//  NIEUW SPEL
// =========================

function newGame() {
  let solutionPattern
  clearMessage();

  showMessage(defaultMessage[lang]);

  if (level === 1) {
    solutionPattern = genLevel1Solution();
  } else if (level === 2) {
    solutionPattern = genLevel2Solution();
  } else {
    solutionPattern = genLevel3Solution();
  }

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
//  MODAL HELPERS
// =========================

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden");
}

function openModal(contentHTML) {
  const body = document.getElementById("modalBody");
  const modal = document.getElementById("modal");
  if (body) body.innerHTML = contentHTML;
  if (modal) modal.classList.remove("hidden");
}


// =========================
//  INIT — ALLES HIERBINNEN!
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
  
      /* Modal events */
    const closeBtn = document.getElementById("modalClose");
    const modal = document.getElementById("modal");

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target.id === "modal") {
                closeModal();
            }
        });
    }

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
	} else {
	  newGame();
	}

  updateLevelButtons();
};

function setLevel(targetLevel) {
  // zelfde level? niks doen
  if (targetLevel === level) return;

  // altijd eerst de confirm tonen
  showLevelChangeMessage(targetLevel);
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


