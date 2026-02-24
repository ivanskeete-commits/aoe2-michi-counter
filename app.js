// MICHI DATASET (Embedded for absolute reliability)
const CIVS = {
  "Aztecs": { late: 6, goldEff: 7, siege: 6, pop: 7, cav: 0 },
  "Bohemians": { late: 10, goldEff: 8, siege: 10, pop: 8, cav: 4 },
  "Britons": { late: 8, goldEff: 7, siege: 6, pop: 7, cav: 5 },
  "Bengalis": { late: 9, goldEff: 10, siege: 7, pop: 10, cav: 7 },
  "Burmese": { late: 8, goldEff: 7, siege: 8, pop: 9, cav: 8 },
  "Byzantines": { late: 7, goldEff: 9, siege: 7, pop: 8, cav: 7 },
  "Celts": { late: 9, goldEff: 7, siege: 10, pop: 9, cav: 6 },
  "Chinese": { late: 8, goldEff: 8, siege: 7, pop: 8, cav: 7 },
  "Cumans": { late: 7, goldEff: 7, siege: 8, pop: 7, cav: 9 },
  "Dravidians": { late: 8, goldEff: 7, siege: 9, pop: 8, cav: 3 },
  "Ethiopians": { late: 9, goldEff: 7, siege: 10, pop: 7, cav: 6 },
  "Franks": { late: 7, goldEff: 7, siege: 6, pop: 8, cav: 10 },
  "Georgians": { late: 9, goldEff: 8, siege: 7, pop: 9, cav: 10 },
  "Goths": { late: 7, goldEff: 6, siege: 6, pop: 10, cav: 5 },
  "Gurjaras": { late: 8, goldEff: 9, siege: 6, pop: 8, cav: 9 },
  "Hindustanis": { late: 9, goldEff: 10, siege: 7, pop: 8, cav: 8 },
  "Huns": { late: 6, goldEff: 6, siege: 5, pop: 7, cav: 9 },
  "Incas": { late: 7, goldEff: 7, siege: 7, pop: 8, cav: 0 },
  "Italians": { late: 8, goldEff: 9, siege: 7, pop: 7, cav: 6 },
  "Japanese": { late: 7, goldEff: 7, siege: 7, pop: 8, cav: 6 },
  "Khmer": { late: 10, goldEff: 8, siege: 9, pop: 10, cav: 9 },
  "Koreans": { late: 9, goldEff: 7, siege: 9, pop: 8, cav: 5 },
  "Lithuanians": { late: 8, goldEff: 7, siege: 7, pop: 8, cav: 10 },
  "Magyars": { late: 9, goldEff: 7, siege: 6, pop: 8, cav: 10 },
  "Malay": { late: 8, goldEff: 7, siege: 7, pop: 10, cav: 5 },
  "Malians": { late: 7, goldEff: 9, siege: 6, pop: 7, cav: 8 },
  "Mayans": { late: 8, goldEff: 7, siege: 6, pop: 8, cav: 0 },
  "Mongols": { late: 10, goldEff: 7, siege: 9, pop: 9, cav: 9 },
  "Persians": { late: 10, goldEff: 9, siege: 8, pop: 10, cav: 10 },
  "Poles": { late: 8, goldEff: 9, siege: 7, pop: 8, cav: 9 },
  "Portuguese": { late: 9, goldEff: 10, siege: 8, pop: 8, cav: 8 },
  "Romans": { late: 8, goldEff: 7, siege: 8, pop: 8, cav: 8 },
  "Saracens": { late: 9, goldEff: 8, siege: 9, pop: 8, cav: 8 },
  "Sicilians": { late: 8, goldEff: 7, siege: 8, pop: 9, cav: 9 },
  "Slavs": { late: 9, goldEff: 7, siege: 9, pop: 9, cav: 8 },
  "Spanish": { late: 8, goldEff: 10, siege: 7, pop: 8, cav: 10 },
  "Tatars": { late: 8, goldEff: 7, siege: 8, pop: 8, cav: 9 },
  "Teutons": { late: 10, goldEff: 7, siege: 8, pop: 10, cav: 9 },
  "Turks": { late: 9, goldEff: 9, siege: 9, pop: 8, cav: 9 },
  "Vietnamese": { late: 8, goldEff: 8, siege: 7, pop: 9, cav: 6 },
  "Vikings": { late: 7, goldEff: 7, siege: 7, pop: 8, cav: 6 }
};

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

// 1. Dropdown Setup
function populateDropdown(select) {
  let html = "";
  civNames.forEach(c => { html += `<option value="${c}">${c}</option>`; });
  select.innerHTML = html;
}
[enemy1Select, enemy2Select, ally1Select, ally2Select].forEach(populateDropdown);

// 2. Data Storage
function getHistory() { return JSON.parse(localStorage.getItem("matchHistory")) || []; }
function saveHistory(h) { localStorage.setItem("matchHistory", JSON.stringify(h)); }

// 3. UI Renders
function renderHistory() {
  const history = getHistory().reverse();
  historyTableBody.innerHTML = history.slice(0, 8).map(g => `
    <tr>
      <td>${g.enemy1} & ${g.enemy2}</td>
      <td><strong>${g.ally1} & ${g.ally2}</strong></td>
      <td class="${g.result}-text">${g.result.toUpperCase()}</td>
      <td>${new Date(g.timestamp).toLocaleDateString()}</td>
    </tr>
  `).join("");
  renderStats();
}

function renderStats() {
  const history = getHistory();
  if (history.length === 0) {
    statsContainer.innerHTML = "<p>No games logged.</p>";
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
  const sorted = Object.entries(civStats)
    .map(([name, d]) => ({ name, ...d, winRate: (d.wins/d.total*100).toFixed(0) }))
    .sort((a,b) => b.wins - a.wins).slice(0, 3);

  statsContainer.innerHTML = sorted.map(s => `
    <div class="stat-box"><strong>${s.name}</strong><br><span class="win-text">${s.wins} Wins</span></div>
  `).join("");
}

// 4. Listeners
logBtn.onclick = () => {
  const history = getHistory();
  history.push({
    enemy1: enemy1Select.value, enemy2: enemy2Select.value,
    ally1: ally1Select.value, ally2: ally2Select.value,
    result: gameResultSelect.value, timestamp: Date.now()
  });
  saveHistory(history);
  renderHistory();
  alert("Result Logged!");
};

clearBtn.onclick = () => {
  if (confirm("Reset everything?")) { saveHistory([]); renderHistory(); }
};

// 5. THE MAIN SUGGESTION BUTTON
document.getElementById("suggestBtn").onclick = function() {
  // Reset UI
  resultsDiv.innerHTML = "<p>Analyzing Michi Meta...</p>";
  
  const e1 = enemy1Select.value;
  const e2 = enemy2Select.value;
  const history = getHistory();
  const pairs = [];

  // Calculation Loop
  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const civA = civNames[i];
      const civB = civNames[j];

      if (civA === e1 || civA === e2 || civB === e1 || civB === e2) continue;

      const a = CIVS[civA];
      const b = CIVS[civB];

      // Michi DM Scoring
      let score = (a.late + b.late) * 15 + (a.goldEff + b.goldEff) * 10;
      
      // Siege/Pop Synergy
      if ((a.siege >= 9 && b.pop >= 9) || (b.siege >= 9 && a.pop >= 9)) score += 50;
      if (civA === "Spanish" || civB === "Spanish") score += 60;

      // History Learning
      const pairGames = history.filter(g => 
        ((g.ally1 === civA && g.ally2 === civB) || (g.ally1 === civB && g.ally2 === civA))
      );
      if (pairGames.length > 0) {
        const winRate = pairGames.filter(g => g.result === "win").length / pairGames.length;
        score += (winRate - 0.5) * 200;
      }

      pairs.push({ nameA: civA, nameB: civB, score: score });
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  
  let html = "";
  pairs.slice(0, 5).forEach(p => {
    html += `<div class="result-card">
               <div class="card-header">
                 <strong>${p.nameA} & ${p.nameB}</strong>
                 <span>Rating: ${Math.round(p.score)}</span>
               </div>
             </div>`;
  });
  resultsDiv.innerHTML = html;
};

renderHistory();
