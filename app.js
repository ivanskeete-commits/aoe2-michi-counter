console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  const resultDiv = document.getElementById("result");
  const button = document.getElementById("findBtn");

  // --- Create Enemy Selectors ---
  const enemy1 = document.createElement("select");
  const enemy2 = document.createElement("select");
  enemy1.id = "enemy1";
  enemy2.id = "enemy2";

  // --- Map Style ---
  const mapSelect = document.createElement("select");
  mapSelect.id = "mapStyle";

  ["balanced", "open"].forEach(style => {
    const o = document.createElement("option");
    o.value = style;
    o.textContent = style;
    mapSelect.appendChild(o);
  });

  // Populate dropdowns
  Object.keys(civs).forEach(civ => {
    const opt1 = document.createElement("option");
    opt1.value = civ;
    opt1.textContent = civ;
    enemy1.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = civ;
    opt2.textContent = civ;
    enemy2.appendChild(opt2.cloneNode(true));
  });

  button.parentNode.insertBefore(enemy1, button);
  button.parentNode.insertBefore(enemy2, button);
  button.parentNode.insertBefore(mapSelect, button);

  // --- Weights tuned for your format ---
  const weights = {
    mobility: 4,
    powerSpike: 3,
    counter: 3,
    synergy: 3
  };

  function scoreSingle(enemy, candidate, mapStyle) {
    let score = 0;

    // Mobility bias (your open fast 2v2 format)
    if (mapStyle === "open") {
      if (candidate.traits.includes("mobile")) score += weights.mobility;
      if (
        candidate.strengths.includes("cavalry") ||
        candidate.strengths.includes("cavalry-archer")
      ) score += weights.mobility;
    }

    // Power spike (important in DM)
    if (candidate.traits.includes("power-spike"))
      score += weights.powerSpike;

    // Basic counter logic (if candidate has different role)
    if (
      JSON.stringify(candidate.strengths) !==
      JSON.stringify(enemy.strengths)
    ) score += weights.counter;

    return score;
  }

  function scoreCombo(enemyA, enemyB, civA, civB, mapStyle) {

    let score = 0;

    // Score both civs against both enemies
    score += scoreSingle(enemyA, civA, mapStyle);
    score += scoreSingle(enemyA, civB, mapStyle);
    score += scoreSingle(enemyB, civA, mapStyle);
    score += scoreSingle(enemyB, civB, mapStyle);

    // Encourage complementary roles
    if (
      JSON.stringify(civA.strengths) !==
      JSON.stringify(civB.strengths)
    ) {
      score += weights.synergy;
    } else {
      score -= weights.synergy;
    }

    return score;
  }

  button.addEventListener("click", () => {

    const enemyName1 = enemy1.value;
    const enemyName2 = enemy2.value;
    const mapStyle = mapSelect.value;

    const e1 = civs[enemyName1];
    const e2 = civs[enemyName2];

    let bestCombo = null;
    let bestScore = -Infinity;

    const civNames = Object.keys(civs);

    for (let i = 0; i < civNames.length; i++) {
      for (let j = i + 1; j < civNames.length; j++) {

        const civA = civs[civNames[i]];
        const civB = civs[civNames[j]];

        const comboScore = scoreCombo(e1, e2, civA, civB, mapStyle);

        if (comboScore > bestScore) {
          bestScore = comboScore;
          bestCombo = [civNames[i], civNames[j]];
        }
      }
    }

    resultDiv.innerHTML = `
      <h3>Best 2v2 Counter vs ${enemyName1} + ${enemyName2}</h3>
      <p>Map: ${mapStyle}</p>
      <h2>${bestCombo[0]} + ${bestCombo[1]}</h2>
      <p><strong>${bestCombo[0]}:</strong> ${civs[bestCombo[0]].notes}</p>
      <p><strong>${bestCombo[1]}:</strong> ${civs[bestCombo[1]].notes}</p>
      <p><em>Score: ${bestScore}</em></p>
    `;
  });

});
