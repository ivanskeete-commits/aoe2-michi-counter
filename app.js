console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

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

  function suggestTeam() {
    const enemy = civSelect.value;
    const enemyData = civs[enemy];

    let team = [];

    if (enemyData.roles.includes("siege")) {
      team.push("Turks");
    }

    if (enemyData.roles.includes("ranged_dps")) {
      team.push("Celts");
    }

    if (team.length < 2) {
      team.push("Byzantines");
    }

    resultDiv.innerHTML = `
      <h3>Recommended 2v2 Counter vs ${enemy}</h3>
      <p><strong>Player 1:</strong> ${team[0]}</p>
      <p><strong>Player 2:</strong> ${team[1]}</p>
      <p><strong>Why:</strong> ${enemyData.notes}</p>
    `;
  }

  // Attach button listener
  button.addEventListener("click", suggestTeam);
});
