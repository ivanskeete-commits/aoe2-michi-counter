import { CIVS } from "./civs.js";

const enemy1Select = document.getElementById("enemy1");
const enemy2Select = document.getElementById("enemy2");
const resultsDiv = document.getElementById("results");
const civNames = Object.keys(CIVS).sort();

function populateDropdowns() {
  civNames.forEach(name => {
    enemy1Select.add(new Option(name, name));
    enemy2Select.add(new Option(name, name));
  });
}

populateDropdowns();

function getEnemyProfile(civName) {
  return CIVS[civName];
}

function scorePair(civA, civB, enemy1, enemy2) {
  const a = CIVS[civA];
  const b = CIVS[civB];

  let score = 0;
  let breakdown = [];

  // Base strength
  const mobilityScore = a.mobility + b.mobility;
  const siegeScore = a.siege + b.siege;
  const cavScore = a.cav + b.cav;

  score += mobilityScore * 2;
  score += siegeScore * 2;
  score += cavScore;

  breakdown.push(`Mobility: ${mobilityScore * 2}`);
  breakdown.push(`Siege: ${siegeScore * 2}`);
  breakdown.push(`Cavalry value: ${cavScore}`);

  // Enemy counter logic
  const enemies = [enemy1, enemy2];

  enemies.forEach(enemy => {
    if (enemy.cav >= 3) {
      // Heavy cav enemy → reward infantry/siege
      const antiCav = a.siege + b.siege;
      score += antiCav * 2;
      breakdown.push(`Anti-cav vs ${enemy}: +${antiCav * 2}`);
    }

    if (enemy.mobility >= 3) {
      // High mobility enemy → reward own mobility
      score += mobilityScore * 1.5;
      breakdown.push(`Mobility vs ${enemy}: +${mobilityScore * 1.5}`);
    }

    if (enemy.siege >= 3) {
      // Heavy siege enemy → reward mobility civ
      score += mobilityScore * 2;
      breakdown.push(`Anti-siege mobility vs ${enemy}: +${mobilityScore * 2}`);
    }
  });

  // Role balance bonus
  if (
    (a.mobility > 2 && b.siege > 2) ||
    (b.mobility > 2 && a.siege > 2)
  ) {
    score += 5;
    breakdown.push("Role balance bonus: +5");
  }

  // Prevent double heavy cav stacking
  if (a.cav >= 3 && b.cav >= 3) {
    score -= 8;
    breakdown.push("Double heavy cav penalty: -8");
  }

  return { score: Math.round(score), breakdown };
}

function generatePairs(enemy1Name, enemy2Name) {
  const enemy1 = getEnemyProfile(enemy1Name);
  const enemy2 = getEnemyProfile(enemy2Name);

  const pairs = [];

  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const civA = civNames[i];
      const civB = civNames[j];

      // Do not allow picking enemy civs as counters
      if (civA === enemy1Name || civA === enemy2Name) continue;
      if (civB === enemy1Name || civB === enemy2Name) continue;

      const { score, breakdown } = scorePair(
        civA,
        civB,
        enemy1,
        enemy2
      );

      pairs.push({
        pair: `${civA} + ${civB}`,
        score,
        breakdown
      });
    }
  }

  pairs.sort((a, b) => b.score - a.score);

  return pairs;
}

function displayResults() {
  const enemy1 = enemy1Select.value;
  const enemy2 = enemy2Select.value;

  if (!enemy1 || !enemy2 || enemy1 === enemy2) {
    resultsDiv.innerHTML = "<p>Please select two different enemy civs.</p>";
    return;
  }

  const pairs = generatePairs(enemy1, enemy2);

  const top5 = pairs.slice(0, 5);
  const alt3 = pairs.slice(5, 8);

  let html = `<h3>Countering ${enemy1} + ${enemy2}</h3>`;

  html += "<h3>Top 5 Primary Counter Pairs</h3>";
  top5.forEach(p => {
    html += `
      <p><strong>${p.pair}</strong> (Score: ${p.score})<br>
      ${p.breakdown.join("<br>")}
      </p>
    `;
  });

  html += "<h3>Top 3 Alternative Combos</h3>";
  alt3.forEach(p => {
    html += `
      <p><strong>${p.pair}</strong> (Score: ${p.score})<br>
      ${p.breakdown.join("<br>")}
      </p>
    `;
  });

  resultsDiv.innerHTML = html;
}

document
  .getElementById("suggestBtn")
  .addEventListener("click", displayResults);
