import { CIVS } from "./civs.js";

const enemy1Select = document.getElementById("enemy1");
const enemy2Select = document.getElementById("enemy2");
const resultsDiv = document.getElementById("results");

// Populate dropdowns
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

// Score function
function scorePair(civA, civB, enemy1, enemy2) {
  const a = CIVS[civA];
  const b = CIVS[civB];
  const e1 = CIVS[enemy1];
  const e2 = CIVS[enemy2];

  if (!a || !b || !e1 || !e2) return 0;

  let score = 0;
  let breakdown = [];

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

  // Anti-heavy cav bonus
  if (e1.cav >= 9 || e2.cav >= 9) {
    const antiCav = a.siege + b.siege;
    score += antiCav * 3;
    breakdown.push(`Anti-cav bonus: ${antiCav * 3}`);
  }

  // Cav + Siege synergy
  if ((a.cav >= 8 && b.siege >= 8) || (b.cav >= 8 && a.siege >= 8)) {
    score += 25;
    breakdown.push("Cav + Siege synergy: +25");
  }

  // Double heavy cav penalty
  if (a.cav >= 9 && b.cav >= 9) {
    score -= 30;
    breakdown.push("Double heavy cav penalty: -30");
  }

  return { score, breakdown };
}

// Generate top suggestions
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
    top.map(p => `<p><strong>${p.pair}</strong> (Score: ${p.score})<br>${p.breakdown.join("<br>")}</p>`).join("");
});
