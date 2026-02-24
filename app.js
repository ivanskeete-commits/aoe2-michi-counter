// app.js
import { CIVS } from "./civs.js";

/* ==============================
   INITIALIZE DROPDOWNS
============================== */

const enemy1Select = document.getElementById("enemy1");
const enemy2Select = document.getElementById("enemy2");
const ally1Select = document.getElementById("ally1");
const ally2Select = document.getElementById("ally2");
const resultsDiv = document.getElementById("results");
const logBtn = document.getElementById("logBtn");
const gameResultSelect = document.getElementById("gameResult");

const civNames = Object.keys(CIVS).sort();

// Populate all dropdowns
function populateDropdown(select) {
  civNames.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    select.appendChild(option);
  });
}

populateDropdown(enemy1Select);
populateDropdown(enemy2Select);
populateDropdown(ally1Select);
populateDropdown(ally2Select);

/* ==============================
   MATCH HISTORY STORAGE
============================== */

function getHistory() {
  return JSON.parse(localStorage.getItem("matchHistory")) || [];
}

function saveHistory(history) {
  localStorage.setItem("matchHistory", JSON.stringify(history));
}

/* ==============================
   LOG GAME RESULT
============================== */

if (logBtn) {
  logBtn.addEventListener("click", () => {
    const entry = {
      enemy1: enemy1Select.value,
      enemy2: enemy2Select.value,
      ally1: ally1Select.value,
      ally2: ally2Select.value,
      result: gameResultSelect.value,
      timestamp: Date.now()
    };

    const history = getHistory();
    history.push(entry);
    saveHistory(history);

    alert("Game logged.");
  });
}

/* ==============================
   LEARNING SYSTEM
============================== */

const MAX_LEARNING_BONUS = 25;     // max score impact
const DECAY_HALF_LIFE_DAYS = 30;   // older games lose influence

function calculateLearningAdjustment(civA, civB, enemy1, enemy2) {
  const history = getHistory();
  const now = Date.now();
  const halfLifeMs = DECAY_HALF_LIFE_DAYS * 24 * 60 * 60 * 1000;

  let weightedWins = 0;
  let weightedTotal = 0;

  history.forEach(game => {
    const sameMatchup =
      game.enemy1 === enemy1 &&
      game.enemy2 === enemy2 &&
      (
        (game.ally1 === civA && game.ally2 === civB) ||
        (game.ally1 === civB && game.ally2 === civA)
      );

    if (!sameMatchup) return;

    const age = now - game.timestamp;
    const decayFactor = Math.pow(0.5, age / halfLifeMs);

    weightedTotal += decayFactor;
    if (game.result === "win") weightedWins += decayFactor;
  });

  if (weightedTotal === 0) return 0;

  const winRate = weightedWins / weightedTotal;
  let bonus = (winRate - 0.5) * 50; // neutral at 50%
  bonus = Math.max(-MAX_LEARNING_BONUS, Math.min(MAX_LEARNING_BONUS, bonus));

  return bonus;
}

/* ==============================
   SCORING LOGIC
============================== */

function scorePair(civA, civB, enemy1, enemy2) {
  let score = 0;

  const a = CIVS[civA];
  const b = CIVS[civB];
  const e1 = CIVS[enemy1];
  const e2 = CIVS[enemy2];

  if (!a || !b || !e1 || !e2) return 0;

  // Core DM weighting
  const lateScore = (a.late + b.late) * 3;
  const popScore = (a.pop + b.pop) * 3;
  const siegeScore = (a.siege + b.siege) * 2;
  const deathballScore = (a.deathball + b.deathball) * 3;
  const goldScore = (a.goldEff + b.goldEff) * 2;

  score += lateScore + popScore + siegeScore + deathballScore + goldScore;

  // Anti-heavy cav bonus if enemy has strong cav
  if (e1.cav >= 9 || e2.cav >= 9) {
    const antiCav = a.siege + b.siege;
    score += antiCav * 3;
  }

  // Reward cav + siege combo
  if ((a.cav >= 8 && b.siege >= 8) || (b.cav >= 8 && a.siege >= 8)) {
    score += 25;
  }

  // Prevent double heavy cav spam
  if (a.cav >= 9 && b.cav >= 9) score -= 30;

  // Add learning adjustment
  score += calculateLearningAdjustment(civA, civB, enemy1, enemy2);

  return score;
}

/* ==============================
   GENERATE SUGGESTIONS
============================== */

document.getElementById("suggestBtn").addEventListener("click", () => {
  const e1 = enemy1Select.value;
  const e2 = enemy2Select.value;

  if (!e1 || !e2 || e1 === e2) {
    resultsDiv.innerHTML = "<p>Select two different enemy civs.</p>";
    return;
  }

  const pairs = [];
  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const civA = civNames[i];
      const civB = civNames[j];
      if (civA === e1 || civA === e2) continue;
      if (civB === e1 || civB === e2) continue;

      const score = scorePair(civA, civB, e1, e2);
      pairs.push({ civA, civB, score });
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  const top5 = pairs.slice(0, 5);

  resultsDiv.innerHTML = `
    <h3>Top Suggestions for ${e1} + ${e2}</h3>
    ${top5
      .map(pair => `<div>${pair.civA} + ${pair.civB} — Score: ${pair.score.toFixed(1)}</div>`)
      .join("")}
  `;
});
