console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const enemy1 = document.getElementById("enemy1");
  const enemy2 = document.getElementById("enemy2");
  const results = document.getElementById("results");
  const button = document.getElementById("findBtn");
  const civNames = Object.keys(civs).sort(); // Alphabetical

  // Populate dropdowns
  civNames.forEach(civ => {
    const option1 = document.createElement("option");
    option1.value = civ;
    option1.textContent = civ;
    enemy1.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = civ;
    option2.textContent = civ;
    enemy2.appendChild(option2);
  });

  function scoreCounter(counter, enemy) {
    const c = civs[counter];
    const e = civs[enemy];
    let score = 0;
    score += c.antiCav * e.cav * 1.5;
    score += c.antiArcher * e.archer * 1.5;
    score += c.antiInf * (5 - e.archer) * 1.0;
    score += c.siege * 1.2;
    score += c.mobility * 1.5;
    score += c.eco * 0.5;
    return score;
  }

  function findCounters() {
    const e1 = enemy1.value;
    const e2 = enemy2.value;
    const resultsArr = [];

    civNames.forEach(c1 => {
      civNames.forEach(c2 => {
        if (c1 !== c2) {
          let total =
            scoreCounter(c1, e1) +
            scoreCounter(c1, e2) +
            scoreCounter(c2, e1) +
            scoreCounter(c2, e2);

          resultsArr.push({ pair: c1 + " + " + c2, score: total });
        }
      });
    });

    resultsArr.sort((a,b)=>b.score-a.score);

    let output = "<h3>Top 5 Primary Counter Pairs</h3>";
    for (let i=0;i<5;i++){
      output += `<div class="result">${resultsArr[i].pair} <br>Score: ${Math.round(resultsArr[i].score)}</div>`;
    }

    output += "<h3>Top 3 Alternative Combos</h3>";
    for (let i=5;i<8;i++){
      output += `<div class="result">${resultsArr[i].pair} <br>Score: ${Math.round(resultsArr[i].score)}</div>`;
    }

    results.innerHTML = output;
  }

  button.addEventListener("click", findCounters);
});
