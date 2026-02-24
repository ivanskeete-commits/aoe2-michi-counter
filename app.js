import { CIVS } from "./civs.js";

const enemy1Select = document.getElementById("enemy1");
const enemy2Select = document.getElementById("enemy2");
const ally1Select = document.getElementById("ally1");
const ally2Select = document.getElementById("ally2");
const gameResultSelect = document.getElementById("gameResult");
const resultsDiv = document.getElementById("results");

const civNames = Object.keys(CIVS).sort();
function populateDropdown(select) {
  civNames.forEach(civ => {
    const option = document.createElement("option");
    option.value = civ;
    option.textContent = civ;
    select.appendChild(option);
  });
}
populateDropdown(enemy1Select);
populateDropdown(enemy2Select);
populateDropdown(ally1Select);
populateDropdown(ally2Select);

// ------------------------
// Match History
// ------------------------
function getHistory() {
  return JSON.parse(localStorage.getItem("matchHistory")) || [];
}
function saveHistory(history) {
  localStorage.setItem("matchHistory", JSON.stringify(history));
}

// ------------------------
// Learning adjustment
// ------------------------
const MAX_LEARNING_BONUS = 25;
const DECAY_HALF_LIFE_DAYS = 30;

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
      ((game.ally1 === civA && game.ally2 === civB) || (game.ally1 === civB && game.ally2 === civA));

    if (!sameMatchup) return;

    const age = now - game.timestamp;
    const decay = Math.pow(0.5, age / halfLifeMs);

    weightedTotal += decay;
    if (game.result === "win") weightedWins += decay;
  });

  if (weightedTotal === 0) return 0;
  const winRate = weightedWins / weightedTotal;
  let bonus = (winRate - 0.5) * 50;
  return Math.max(-MAX_LEARNING_BONUS, Math.min(MAX_LEARNING_BONUS, bonus));
}

// ------------------------
// Scoring Logic
// ------------------------
function scorePair(civA, civB, enemy1, enemy2) {
  const a = CIVS[civA];
  const b = CIVS[civB];
  const e1 = CIVS[enemy1];
  const e2 = CIVS[enemy2];
  if (!a || !b || !e1 || !e2) return { score: 0, breakdown: [] };

  let score = 0;
  const breakdown = [];

  const lateScore = (a.late + b.late) * 3;
  const popScore = (a.pop + b.pop) * 3;
  const siegeScore = (a.siege + b.siege) * 2;
  const deathballScore = (a.deathball + b.deathball) * 3;
  const goldScore = (a.goldEff + b.goldEff) * 2;

  score += lateScore + popScore + siegeScore + deathballScore + goldScore;
  breakdown.push(`Late scaling: ${lateScore}`);
  breakdown.push(`Pop efficiency: ${popScore}`);
  breakdown.push(`Siege power: ${siegeScore}`);
  breakdown.push(`Deathball: ${deathballScore}`);
  breakdown.push(`Gold efficiency: ${goldScore}`);

  if (e1.cav >= 9 || e2.cav >= 9) {
    const antiCav = a.siege + b.siege;
    score += antiCav * 3;
    breakdown.push(`Anti-cav bonus: ${antiCav * 3}`);
  }

  if ((a.cav >= 8 && b.siege >= 8) || (b.cav >= 8 && a.siege >= 8)) {
    score += 25;
    breakdown.push("Cav + Siege synergy: +25");
  }

  if (a.cav >= 9 && b.cav >= 9) {
    score -= 30;
    breakdown.push("Double heavy cav penalty: -30");
  }

  // Learning adjustment
  score += calculateLearningAdjustment(civA, civB, enemy1, enemy2);

  return { score, breakdown };
}

// ------------------------
// Suggestion Generation
// ------------------------
document.getElementById("suggestBtn").addEventListener("click", () => {
  const e1 = enemy1Select.value;
  const e2 = enemy2Select.value;
  if (!e1 || !e2 || e1 === e2) {
    resultsDiv.innerHTML = "Select two different enemy civs.";
    return;
  }

  const pairs = [];
  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const c1 = civNames[i];
      const c2 = civNames[j];
      if (c1 === e1 || c1 === e2 || c2 === e1 || c2 === e2) continue;
      const { score, breakdown } = scorePair(c1, c2, e1, e2);
      pairs.push({ pair: `${c1} + ${c2}`, score, breakdown });
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  const top = pairs.slice(0, 5);

  resultsDiv.innerHTML = `<h3>Countering ${e1} + ${e2}</h3>` +
    top.map(p => `<p><strong>${p.pair}</strong> (Score: ${p.score.toFixed(1)})<br>${p.breakdown.join("<br>")}</p>`).join("");
});

// ------------------------
// Log Game Result
// ------------------------
document.getElementById("logBtn").addEventListener("click", () => {
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

  alert("Game logged successfully!");
});
