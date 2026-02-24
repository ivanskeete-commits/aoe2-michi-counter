import { civs } from "./civs.js";

/* ==============================
   INITIALIZE DROPDOWNS
============================== */

const enemy1Select = document.getElementById("enemy1");
const enemy2Select = document.getElementById("enemy2");
const ally1Select = document.getElementById("ally1");
const ally2Select = document.getElementById("ally2");
const resultsDiv = document.getElementById("results");

function populateDropdown(select) {
  civs.forEach(civ => {
    const option = document.createElement("option");
    option.value = civ.name;
    option.textContent = civ.name;
    select.appendChild(option);
  });
}

populateDropdown(enemy1Select);
populateDropdown(enemy2Select);
if (ally1Select) populateDropdown(ally1Select);
if (ally2Select) populateDropdown(ally2Select);

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

const logBtn = document.getElementById("logBtn");

if (logBtn) {
  logBtn.addEventListener("click", () => {
    const entry = {
      enemy1: enemy1Select.value,
      enemy2: enemy2Select.value,
      ally1: ally1Select.value,
      ally2: ally2Select.value,
      result: document.getElementById("gameResult").value,
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

// CONFIGURABLE PARAMETERS
const MAX_LEARNING_BONUS = 25;     // hard cap
const DECAY_HALF_LIFE_DAYS = 30;   // older games weaken after 30 days

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
    const decayFactor = Math.pow(0.5, age / halfLifeMs); // exponential decay

    weightedTotal += decayFactor;
    if (game.result === "win") {
      weightedWins += decayFactor;
    }
  });

  if (weightedTotal === 0) return 0;

  const winRate = weightedWins / weightedTotal;

  // Neutral at 50%
  let bonus = (winRate - 0.5) * 50;

  // Cap to prevent runaway bias
  bonus = Math.max(-MAX_LEARNING_BONUS, Math.min(MAX_LEARNING_BONUS, bonus));

  return bonus;
}

/* ==============================
   SCORING LOGIC
============================== */

function scorePair(civA, civB, enemy1, enemy2) {
  let score = 0;

  const civObjA = civs.find(c => c.name === civA);
  const civObjB = civs.find(c => c.name === civB);
  const enemyObj1 = civs.find(c => c.name === enemy1);
  const enemyObj2 = civs.find(c => c.name === enemy2);

  if (!civObjA || !civObjB || !enemyObj1 || !enemyObj2) return 0;

  // BASE COUNTER LOGIC
  score += civObjA.counters?.includes(enemy1) ? 15 : 0;
  score += civObjA.counters?.includes(enemy2) ? 15 : 0;
  score += civObjB.counters?.includes(enemy1) ? 15 : 0;
  score += civObjB.counters?.includes(enemy2) ? 15 : 0;

  // ANTI-SAME CIV PENALTY
  if (civA === civB) score -= 10;

  // LEARNING ADJUSTMENT
  score += calculateLearningAdjustment(civA, civB, enemy1, enemy2);

  return score;
}

/* ==============================
   GENERATE SUGGESTIONS
============================== */

document.getElementById("suggestBtn").addEventListener("click", () => {
  const enemy1 = enemy1Select.value;
  const enemy2 = enemy2Select.value;

  const pairs = [];

  for (let i = 0; i < civs.length; i++) {
    for (let j = i + 1; j < civs.length; j++) {
      const civA = civs[i].name;
      const civB = civs[j].name;

      const score = scorePair(civA, civB, enemy1, enemy2);

      pairs.push({ civA, civB, score });
    }
  }

  pairs.sort((a, b) => b.score - a.score);

  const top = pairs.slice(0, 5);

  resultsDiv.innerHTML = `
    <h3>Top Suggestions</h3>
    ${top
      .map(
        pair =>
          `<div>${pair.civA} + ${pair.civB} — Score: ${pair.score.toFixed(1)}</div>`
      )
      .join("")}
  `;
});
