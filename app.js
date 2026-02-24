import { CIVS } from "./civs.js";

const enemy1 = document.getElementById("enemy1");
const enemy2 = document.getElementById("enemy2");
const resultsDiv = document.getElementById("results");
const civNames = Object.keys(CIVS).sort();

// Populate dropdowns
function populate() {
  civNames.forEach(c => {
    enemy1.add(new Option(c, c));
    enemy2.add(new Option(c, c));
  });
}
populate();

// Scoring function with transparency
function scorePair(aName, bName, e1Name, e2Name) {
  const a = CIVS[aName];
  const b = CIVS[bName];
  const e1 = CIVS[e1Name];
  const e2 = CIVS[e2Name];

  let score = 0;
  let breakdown = [];

  // Core DM stats
  const lateScore = (a.late + b.late) * 3;
  const popScore = (a.pop + b.pop) * 3.5;
  const siegeScore = (a.siege + b.siege) * 2.5;
  const deathballScore = (a.deathball + b.deathball) * 3;
  const goldScore = (a.goldEff + b.goldEff) * 2;

  score += lateScore + popScore + siegeScore + deathballScore + goldScore;
  breakdown.push(`Late scaling: ${lateScore}`);
  breakdown.push(`Pop efficiency: ${popScore}`);
  breakdown.push(`Siege power: ${siegeScore}`);
  breakdown.push(`Deathball: ${deathballScore}`);
  breakdown.push(`Gold efficiency: ${goldScore}`);

  // Enemy-specific threats
  const enemyElephant = e1.deathball >= 9 || e2.deathball >= 9 || e1Name === "Persians" || e2Name === "Persians";
  const enemyHeavyCav = e1.cav >= 9 || e2.cav >= 9;

  if (enemyElephant) {
    const antiEle = (a.siege + b.siege) * 2.5 + (a.pop + b.pop) * 1.5;
    score += antiEle;
    breakdown.push(`Anti-elephant pressure: ${Math.round(antiEle)}`);
  }

  if (enemyHeavyCav) {
    const antiCav = (a.siege + b.siege) * 2;
    score += antiCav;
    breakdown.push(`Anti-heavy cav: ${antiCav}`);
  }

  // Mobility + Siege synergy
  const aMob = a.cav >= 8;
  const bMob = b.cav >= 8;
  const aSiegeCore = a.siege >= 8;
  const bSiegeCore = b.siege >= 8;
  if ((aMob && bSiegeCore) || (bMob && aSiegeCore)) {
    score += 20;
    breakdown.push("Mobility + Siege synergy: +20");
  }

  // Penalties for extreme overlap
  if (a.cav >= 9 && b.cav >= 9) {
    score -= 25;
    breakdown.push("Double heavy cav penalty: -25");
  }
  if (a.siege >= 9 && b.siege >= 9) {
    score -= 10;
    breakdown.push("Double pure siege stacking penalty: -10");
  }

  // Enemy-specific counters
  let enemyBonus = 0;
  const persianCounters = ["Celts", "Bohemians", "Teutons"];
  const khmerCounters = ["Celts", "Bohemians", "Mongols"];

  if ((e1Name === "Persians" || e2Name === "Persians") &&
      (persianCounters.includes(aName) || persianCounters.includes(bName))) {
    enemyBonus += 20;
    breakdown.push("Targeted Persian counter bonus: +20");
  }

  if ((e1Name === "Khmer" || e2Name === "Khmer") &&
      (khmerCounters.includes(aName) || khmerCounters.includes(bName))) {
    enemyBonus += 10;
    breakdown.push("Targeted Khmer counter bonus: +10");
  }

  score += enemyBonus;

  return { score: Math.round(score), breakdown };
}

// Generate all candidate pairs
function generate(e1, e2) {
  const pairs = [];

  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const c1 = civNames[i];
      const c2 = civNames[j];

      if (c1 === c2) continue; // prevent duplicates

      const { score, breakdown } = scorePair(c1, c2, e1, e2);
      pairs.push({ pair: `${c1} + ${c2}`, score, breakdown });
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  return pairs;
}

// Display top 5 pairs with transparency
function display() {
  const e1 = enemy1.value;
  const e2 = enemy2.value;

  if (!e1 || !e2 || e1 === e2) {
    resultsDiv.innerHTML = "Select two different enemy civs.";
    return;
  }

  const pairs = generate(e1, e2);
  let html = `<h3>Countering ${e1} + ${e2}</h3>`;

  pairs.slice(0, 5).forEach(p => {
    html += `<p><strong>${p.pair}</strong> (Score: ${p.score})<br>`;
    html += `${p.breakdown.join("<br>")}</p>`;
  });

  resultsDiv.innerHTML = html;
}

document.getElementById("suggestBtn").addEventListener("click", display);
