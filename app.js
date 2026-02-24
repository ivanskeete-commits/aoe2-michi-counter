import { CIVS } from "./civs.js";

const enemy1Select = document.getElementById("enemy1");
const enemy2Select = document.getElementById("enemy2");
const ally1Select = document.getElementById("ally1");
const ally2Select = document.getElementById("ally2");
const resultsDiv = document.getElementById("results");
const logBtn = document.getElementById("logBtn");
const gameResultSelect = document.getElementById("gameResult");
const historyTableBody = document.getElementById("historyTableBody");

const civNames = Object.keys(CIVS).sort();

function populateDropdown(select) {
  civNames.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    select.appendChild(option);
  });
}

[enemy1Select, enemy2Select, ally1Select, ally2Select].forEach(populateDropdown);

/* HISTORY LOGIC */
function getHistory() { return JSON.parse(localStorage.getItem("matchHistory")) || []; }
function saveHistory(h) { localStorage.setItem("matchHistory", JSON.stringify(h)); }

function renderHistory() {
  const history = getHistory().reverse();
  historyTableBody.innerHTML = history.slice(0, 5).map(g => `
    <tr>
      <td>${g.enemy1}</td><td>${g.enemy2}</td><td>${g.ally1}</td><td>${g.ally2}</td>
      <td class="${g.result}-text">${g.result.toUpperCase()}</td>
      <td>${new Date(g.timestamp).toLocaleDateString()}</td>
    </tr>
  `).join("");
}

logBtn.addEventListener("click", () => {
  const history = getHistory();
  history.push({
    enemy1: enemy1Select.value, enemy2: enemy2Select.value,
    ally1: ally1Select.value, ally2: ally2Select.value,
    result: gameResultSelect.value, timestamp: Date.now()
  });
  saveHistory(history);
  renderHistory();
  alert("Result Logged!");
});

/* SCORING LOGIC */
function calculateLearningAdjustment(civA, civB, e1, e2) {
  const history = getHistory();
  const filtered = history.filter(g => 
    g.enemy1 === e1 && g.enemy2 === e2 && 
    ((g.ally1 === civA && g.ally2 === civB) || (g.ally1 === civB && g.ally2 === civA))
  );
  if (!filtered.length) return 0;
  const wins = filtered.filter(g => g.result === "win").length;
  return Math.round(((wins / filtered.length) - 0.5) * 40);
}

function scorePair(civA, civB, enemy1, enemy2) {
  const a = CIVS[civA], b = CIVS[civB], e1 = CIVS[enemy1], e2 = CIVS[enemy2];
  let score = (a.late + b.late) * 3 + (a.pop + b.pop) * 3 + (a.goldEff + b.goldEff) * 2;
  if ((a.cav >= 8 && b.siege >= 8) || (b.cav >= 8 && a.siege >= 8)) score += 25;
  if (a.cav >= 9 && b.cav >= 9) score -= 30;
  score += calculateLearningAdjustment(civA, civB, enemy1, enemy2);
  return score;
}

/* SUGGESTIONS */
document.getElementById("suggestBtn").addEventListener("click", () => {
  const e1 = enemy1Select.value, e2 = enemy2Select.value;
  const pairs = [];
  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const civA = civNames[i], civB = civNames[j];
      if ([e1, e2].includes(civA) || [e1, e2].includes(civB)) continue;
      pairs.push({ civA, civB, score: scorePair(civA, civB, e1, e2) });
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  
  resultsDiv.innerHTML = pairs.slice(0, 5).map((p, i) => `
    <div class="result-card">
      <div class="card-header">
        <strong>${p.civA} + ${p.civB}</strong>
        <button class="btn btn-orange" style="font-size:10px; padding:2px 8px;" onclick="const el=document.getElementById('det-${i}'); el.style.display=el.style.display==='block'?'none':'block'">Details ▾</button>
      </div>
      <div id="det-${i}" class="details-pane">
        <div class="stat-row">Late Scaling: <span class="stat-plus">+${CIVS[p.civA].late + CIVS[p.civB].late}</span></div>
        <div class="stat-row">Gold Efficiency: <span class="stat-plus">+${CIVS[p.civA].goldEff + CIVS[p.civB].goldEff}</span></div>
        <div class="stat-row">Learning Bonus: <span class="stat-plus">${calculateLearningAdjustment(p.civA, p.civB, e1, e2)}</span></div>
      </div>
    </div>
  `).join("");
});

renderHistory();
