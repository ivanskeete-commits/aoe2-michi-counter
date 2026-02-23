import { CIVS } from "./civs.js";

const enemy1 = document.getElementById("enemy1");
const enemy2 = document.getElementById("enemy2");
const resultsDiv = document.getElementById("results");

const civNames = Object.keys(CIVS).sort();

// Populate dropdowns alphabetically
function populateDropdowns() {
  civNames.forEach(name => {
    enemy1.add(new Option(name, name));
    enemy2.add(new Option(name, name));
  });
}

populateDropdowns();

function scorePair(civA, civB) {
  const a = CIVS[civA];
  const b = CIVS[civB];

  let score = 0;
  let breakdown = [];

  const mobilityScore = a.mobility + b.mobility;
  const siegeScore = a.siege + b.siege;
  const cavScore = a.cav + b.cav;

  score += mobilityScore * 2;
  breakdown.push(`Mobility bonus: ${mobilityScore * 2}`);

  score += siegeScore * 2;
  breakdown.push(`Siege bonus: ${siegeScore * 2}`);

  score += cavScore;
  breakdown.push(`Cavalry value: ${cavScore}`);

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
    score -= 6;
    breakdown.push("Double heavy cav penalty: -6");
  }

  return { score, breakdown };
}

function generatePairs() {
  const pairs = [];

  for (let i = 0; i < civNames.length; i++) {
    for (let j = i + 1; j < civNames.length; j++) {
      const civA = civNames[i];
      const civB = civNames[j];

      const { score, breakdown } = scorePair(civA, civB);

      pairs.push({
        pair: `${civA} + ${civB}`,
        civA,
        civB,
        score,
        breakdown
      });
    }
  }

  pairs.sort((a, b) => b.score - a.score);

  return pairs;
}

function displayResults() {
  const pairs = generatePairs();

  const top5 = pairs.slice(0, 5);
  const alt3 = pairs.slice(5, 8);

  let html = "<h3>Top 5 Primary Counter Pairs</h3>";
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

document.getElementById("suggestBtn").addEventListener("click", displayResults);
