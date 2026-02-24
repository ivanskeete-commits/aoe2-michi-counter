import { CIVS } from "./civs.js";

const enemy1Select = document.getElementById("enemy1");
const enemy2Select = document.getElementById("enemy2");
const ally1Select = document.getElementById("ally1");
const ally2Select = document.getElementById("ally2");
const resultsDiv = document.getElementById("results");
const logBtn = document.getElementById("logBtn");
const clearBtn = document.getElementById("clearBtn");
const gameResultSelect = document.getElementById("gameResult");
const historyTableBody = document.getElementById("historyTableBody");
const statsContainer = document.getElementById("statsContainer");

const civNames = Object.keys(CIVS).sort();

function populateDropdown(select) {
  select.innerHTML = ""; 
  civNames.forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    select.appendChild(option);
  });
}

[enemy1Select, enemy2Select, ally1Select, ally2Select].forEach(populateDropdown);

/**
 * NEW: Badge Helper (Option C)
 * Replaces broken images with a text-based shield badge.
 */
function getBadgeHTML(civName) {
  const initials = civName.substring(0, 2).toUpperCase();
  return `<span class="civ-badge">${initials}</span>`;
}

/* HISTORY LOGIC */
function getHistory() { return JSON.parse(localStorage.getItem("matchHistory")) || []; }
function saveHistory(h) { localStorage.setItem("matchHistory", JSON.stringify(h)); }

function renderHistory() {
  const history = getHistory().reverse();
  historyTableBody.innerHTML = history.slice(0, 8).map(g => `
    <tr>
      <td>${getBadgeHTML(g.enemy1)} ${g.enemy1}</td>
      <td>${getBadgeHTML(g.enemy2)} ${g.enemy2}</td>
      <td>${getBadgeHTML(g.ally1)} ${g.ally1}</td>
      <td>${getBadgeHTML(g.ally2)} ${g.ally2}</td>
      <td class="${g.result}-text">${g.result.toUpperCase()}</td>
      <td>${new Date(g.timestamp).toLocaleDateString()}</td>
    </tr>
  `).join("");
  renderStats();
}

/* STATS LOGIC */
function renderStats() {
  const history = getHistory();
  if (history.length === 0) {
    statsContainer.innerHTML = `<p style="text-align:center; font-style:italic; width:100%;">No data yet. Log games to see your best civs!</p>`;
    return;
  }

  const civStats = {};
  history.forEach(game => {
    [game.ally1, game.ally2].forEach(civ => {
      if (!civStats[civ]) civStats[civ] = { wins: 0, total: 0 };
      civStats[civ].total++;
      if (game.result === "win") civStats[civ].wins++;
    });
  });

  const sortedStats = Object.entries(civStats)
    .map(([name, data]) => ({ name, ...data, winRate: (data.wins / data.total * 100).toFixed(0) }))
    .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate)
    .slice(0, 3);

  statsContainer.innerHTML = sortedStats.map(s => `
    <div class="stat-box">
      ${getBadgeHTML(s.name)}<br>
      <strong>${s.name}</strong><br>
      <span class="win-text">${s.wins} Wins</span> (${s.winRate}%)
    </div>
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
  alert("Match recorded.");
});

clearBtn.addEventListener("click", () => {
  if (confirm("Delete all history and stats?")) {
    saveHistory([]);
    renderHistory();
  }
});

/* SCORING & SUGGESTIONS */
function calculateLearningAdjustment(civA, civB, e1, e2) {
  const history = getHistory();
  const filtered = history.filter(g => 
    g.enemy1 === e1 && g.enemy2 === e2 && 
    ((g.ally1 === civA && g.ally2 === civB) || (g.ally1 === civB && g.ally2 === civA))
  );
  if (!filtered.length) return 0;
  return Math.round(((filtered.filter(g => g.result === "win").length / filtered.length) - 0.5) * 40);
}

document.getElementById("suggestBtn").addEventListener("click", () => {
  const e1 = enemy1Select.value, e2 = enemy2Select.value;
  const pairs = [];
  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const civA = civNames[i], civB = civNames[j];
      if ([e1, e2].includes(civA) || [e1, e2].includes(civB)) continue;
      
      const a = CIVS[civA], b = CIVS[civB];
      let score = (a.late + b.late) * 3 + (a.goldEff + b.goldEff) * 2;
      
      // Cav/Siege Synergy
      if ((a.cav >= 8 && b.siege >= 8) || (b.cav >= 8 && a.siege >= 8)) score += 25;
      
      score += calculateLearningAdjustment(civA, civB, e1, e2);
      
      pairs.push({ civA, civB, score });
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  
  resultsDiv.innerHTML = pairs.slice(0, 5).map((p, i) => `
    <div class="result-card">
      <div class="card-header">
        <div class="pair-names">
          ${getBadgeHTML(p.civA)} <strong>${p.civA}</strong>
          <span style="color: #888;">&</span>
          ${getBadgeHTML(p.civB)} <strong>${p.civB}</strong>
        </div>
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
