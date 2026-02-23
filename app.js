import { CIVS } from "./civs.js";

const enemy1 = document.getElementById("enemy1");
const enemy2 = document.getElementById("enemy2");
const resultsDiv = document.getElementById("results");
const civNames = Object.keys(CIVS).sort();

function populate() {
  civNames.forEach(c => {
    enemy1.add(new Option(c, c));
    enemy2.add(new Option(c, c));
  });
}
populate();

function scorePair(aName, bName, e1Name, e2Name) {
  const a = CIVS[aName];
  const b = CIVS[bName];
  const e1 = CIVS[e1Name];
  const e2 = CIVS[e2Name];

  let score = 0;
  let breakdown = [];

  // Core DM weighting
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

  // Counter heavy cav
  if (e1.cav >= 9 || e2.cav >= 9) {
    const antiCav = a.siege + b.siege;
    score += antiCav * 3;
    breakdown.push(`Anti-cav bonus: ${antiCav * 3}`);
  }

  // Reward cav + siege combo
  if ((a.cav >= 8 && b.siege >= 8) || (b.cav >= 8 && a.siege >= 8)) {
    score += 25;
    breakdown.push("Cav + Siege synergy: +25");
  }

  // Prevent double pure cav spam
  if (a.cav >= 9 && b.cav >= 9) {
    score -= 30;
    breakdown.push("Double heavy cav penalty: -30");
  }

  return { score, breakdown };
}

function generate(e1, e2) {
  const pairs = [];

  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {

      const c1 = civNames[i];
      const c2 = civNames[j];

      if (c1 === e1 || c1 === e2) continue;
      if (c2 === e1 || c2 === e2) continue;

      const { score, breakdown } = scorePair(c1, c2, e1, e2);

      pairs.push({ pair: `${c1} + ${c2}`, score, breakdown });
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  return pairs;
}

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
    html += `<p><strong>${p.pair}</strong> (Score: ${p.score})<br>
    ${p.breakdown.join("<br>")}</p>`;
  });

  resultsDiv.innerHTML = html;
}

document.getElementById("suggestBtn").addEventListener("click", display);
