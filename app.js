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

// 1. Initial Populate
function populateDropdown(select) {
    let html = "";
    civNames.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });
    select.innerHTML = html;
}

[enemy1Select, enemy2Select, ally1Select, ally2Select].forEach(populateDropdown);

// 2. Data Persistence
function getHistory() { return JSON.parse(localStorage.getItem("matchHistory")) || []; }
function saveHistory(h) { localStorage.setItem("matchHistory", JSON.stringify(h)); }

// 3. UI Rendering Functions
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
        statsContainer.innerHTML = "<p>No data recorded.</p>";
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
        .map(([name, d]) => ({ name, ...d, winRate: (d.wins / d.total * 100).toFixed(0) }))
        .sort((a, b) => b.wins - a.wins).slice(0, 3);

    statsContainer.innerHTML = sorted.map(s => `
        <div class="stat-box">
            <strong>${s.name}</strong><br>
            <span class="win-text">${s.wins} Wins</span> (${s.winRate}%)
        </div>
    `).join("");
}

// 4. Action Listeners
logBtn.addEventListener("click", () => {
    const history = getHistory();
    history.push({
        enemy1: enemy1Select.value, enemy2: enemy2Select.value,
        ally1: ally1Select.value, ally2: ally2Select.value,
        result: gameResultSelect.value, timestamp: Date.now()
    });
    saveHistory(history);
    renderHistory();
});

clearBtn.addEventListener("click", () => {
    if (confirm("Delete all data?")) { saveHistory([]); renderHistory(); }
});

// 5. THE SUGGESTION ENGINE (Re-runnable Fix)
document.getElementById("suggestBtn").onclick = function() {
    try {
        // Force-clear the UI so the user sees a change immediately
        resultsDiv.innerHTML = "<p style='text-align:center;'>Calculating Michi Meta...</p>";

        const e1 = enemy1Select.value;
        const e2 = enemy2Select.value;
        const history = getHistory();
        const pairs = [];

        for (let i = 0; i < civNames.length; i++) {
            for (let j = i + 1; j < civNames.length; j++) {
                const civA = civNames[i];
                const civB = civNames[j];

                // Don't suggest enemies
                if (civA === e1 || civA === e2 || civB === e1 || civB === e2) continue;

                const a = CIVS[civA];
                const b = CIVS[civB];

                // Michi Math
                let score = (a.late + b.late) * 15 + (a.goldEff + b.goldEff) * 10;
                
                // Synergy Bonuses
                if ((a.siege >= 8 && b.pop >= 8) || (b.siege >= 8 && a.pop >= 8)) score += 50;
                if (civA === "Spanish" || civB === "Spanish") score += 60;

                // Learning Engine
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

        // Sort and Render
        pairs.sort((a, b) => b.score - a.score);
        
        const topFive = pairs.slice(0, 5);
        let finalHtml = "";
        topFive.forEach(p => {
            finalHtml += `
                <div class="result-card">
                    <div class="card-header">
                        <div class="pair-names"><strong>${p.nameA}</strong> & <strong>${p.nameB}</strong></div>
                        <div class="score-tag">Rating: ${Math.round(p.score)}</div>
                    </div>
                </div>`;
        });
        
        resultsDiv.innerHTML = finalHtml;

    } catch (error) {
        console.error("Engine Error:", error);
        resultsDiv.innerHTML = "<p>Error generating suggestions. Check console.</p>";
    }
};

// Initial Load
renderHistory();
