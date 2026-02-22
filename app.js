console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  const civSelect = document.getElementById("enemyCiv");
  const button = document.getElementById("findBtn");
  const resultDiv = document.getElementById("result");

  // Populate dropdown
  Object.keys(civs).forEach(civ => {
    const option = document.createElement("option");
    option.value = civ;
    option.textContent = civ;
    civSelect.appendChild(option);
  });

  // Adjustable weights (this is your AI personality)
  const weights = {
    counterStrength: 3,
    traitAdvantage: 2,
    mobilityBonus: 1,
    mapBiasDefense: 1
  };

  function scoreCounter(enemy, candidate) {
    let score = 0;

    // Strength vs Weakness
    enemy.weaknesses.forEach(w => {
      if (candidate.strengths.includes(w)) {
        score += weights.counterStrength;
      }
    });

    // Trait advantage (aggressive vs defensive)
    if (
      enemy.traits.includes("aggressive") &&
      candidate.traits.includes("defensive")
    ) {
      score += weights.traitAdvantage;
    }

    // Mobility advantage
    if (
      enemy.traits.includes("choke-control") &&
      candidate.traits.includes("mobile")
    ) {
      score += weights.mobilityBonus;
    }

    // Map bias (Michi favors defense slightly)
    if (candidate.traits.includes("defensive")) {
      score += weights.mapBiasDefense;
    }

    return score;
  }

  button.addEventListener("click", () => {

    const enemyName = civSelect.value;
    const enemyData = civs[enemyName];

    const ranked = Object.keys(civs)
      .filter(c => c !== enemyName)
      .map(c => ({
        civ: c,
        score: scoreCounter(enemyData, civs[c])
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    resultDiv.innerHTML = `
      <h3>Top Counter Civs vs ${enemyName}</h3>
      <ol>
        ${ranked.map(r => `
          <li>
            <strong>${r.civ}</strong> (Score: ${r.score})<br>
            ${civs[r.civ].notes}
          </li>
        `).join("")}
      </ol>
    `;
  });

});
