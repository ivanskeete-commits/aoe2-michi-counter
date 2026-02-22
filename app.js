console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  const civSelect = document.getElementById("enemyCiv");
  const button = document.getElementById("findBtn");
  const resultDiv = document.getElementById("result");

  // --- Add Map Style Dropdown Dynamically ---
  const mapLabel = document.createElement("label");
  mapLabel.textContent = " Map Style: ";

  const mapSelect = document.createElement("select");
  mapSelect.id = "mapStyle";

  ["balanced", "choke", "open"].forEach(style => {
    const option = document.createElement("option");
    option.value = style;
    option.textContent =
      style.charAt(0).toUpperCase() + style.slice(1);
    mapSelect.appendChild(option);
  });

  button.parentNode.insertBefore(mapLabel, button);
  button.parentNode.insertBefore(mapSelect, button);

  // --- Populate Civ Dropdown ---
  Object.keys(civs).forEach(civ => {
    const option = document.createElement("option");
    option.value = civ;
    option.textContent = civ;
    civSelect.appendChild(option);
  });

  // --- Adjustable AI Weights ---
  const weights = {
    counterStrength: 3,
    traitAdvantage: 2,
    chokeBonus: 2,
    mobilityBonus: 2
  };

  function scoreCounter(enemy, candidate, mapStyle) {
    let score = 0;

    // 1. Strength vs Weakness
    enemy.weaknesses.forEach(w => {
      if (candidate.strengths.includes(w)) {
        score += weights.counterStrength;
      }
    });

    // 2. Trait Advantage (Defensive counters Aggressive)
    if (
      enemy.traits.includes("aggressive") &&
      candidate.traits.includes("defensive")
    ) {
      score += weights.traitAdvantage;
    }

    // 3. Map Style Bias
    if (mapStyle === "choke") {
      if (candidate.traits.includes("defensive"))
        score += weights.chokeBonus;
      if (candidate.traits.includes("choke-control"))
        score += weights.chokeBonus;
    }

    if (mapStyle === "open") {
      if (candidate.traits.includes("mobile"))
        score += weights.mobilityBonus;
      if (candidate.strengths.includes("cavalry"))
        score += weights.mobilityBonus;
      if (candidate.strengths.includes("cavalry-archer"))
        score += weights.mobilityBonus;
    }

    return score;
  }

  button.addEventListener("click", () => {

    const enemyName = civSelect.value;
    const mapStyle = mapSelect.value;
    const enemyData = civs[enemyName];

    if (!enemyData) {
      resultDiv.innerHTML = "<p>No civ data found.</p>";
      return;
    }

    const ranked = Object.keys(civs)
      .filter(c => c !== enemyName)
      .map(c => ({
        civ: c,
        score: scoreCounter(enemyData, civs[c], mapStyle)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    resultDiv.innerHTML = `
      <h3>Top Counter Civs vs ${enemyName}</h3>
      <p><strong>Map Style:</strong> ${mapStyle}</p>
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
