console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const enemy1 = document.getElementById("enemy1");
  const enemy2 = document.getElementById("enemy2");
  const results = document.getElementById("results");
  const button = document.getElementById("findBtn");
  const civNames = Object.keys(civs).sort();

  // Populate dropdowns
  civNames.forEach(civ => {
    const opt1 = document.createElement("option");
    opt1.value = civ;
    opt1.textContent = civ;
    enemy1.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = civ;
    opt2.textContent = civ;
    enemy2.appendChild(opt2);
  });

  // --- NEW OPEN TERRAIN DM SCORING ENGINE ---
  function scoreCounter(counter, enemy) {
    const c = civs[counter];
    const e = civs[enemy];
    let score = 0;

    // Reduced pure counter weight (less Byzantine bias)
    score += c.antiCav * e.cav * 1.0;
    score += c.antiArcher * e.archer * 1.0;
    score += c.antiInf * (5 - e.archer) * 0.8;

    // Increased mobility importance (open terrain)
    score += c.mobility * 2.2;

    // Cavalry strength matters more in DM open maps
    score += c.cav * 1.8;

    // Siege still matters, but not Arena-level
    score += c.siege * 1.3;

    // Eco matters less in DM start
    score += c.eco * 0.3;

    // Aggression bonus (mobility + cav synergy)
    score += (c.mobility + c.cav) * 0.8;

    return score;
  }

  // Small synergy bonus for aggressive 2v2 comps
  function pairSynergy(c1, c2) {
    const a = civs[c1];
    const b = civs[c2];
    let synergy = 0;

    // Mobility pairing bonus
    synergy += (a.mobility + b.mobility) * 0.5;

    // Siege + mobility combo bonus
    synergy += (a.siege * b.mobility) * 0.2;

    // Cav + archer pairing bonus
    synergy += (a.cav * b.archer) * 0.2;

    return synergy;
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

          // Add 2v2 synergy bonus
          total += pairSynergy(c1, c2);

          resultsArr.push({ pair: c1 + " + " + c2, score: total });
        }
      });
    });

    resultsArr.sort((a,b)=>b.score-a.score);

    let output = "<h3>Top 5 Primary Counter Pairs</h3>";
    for (let i=0;i<5;i++){
      output += `<div class="result">${resultsArr[i].pair}<br>Score: ${Math.round(resultsArr[i].score)}</div>`;
    }

    output += "<h3>Top 3 Alternative Combos</h3>";
    for (let i=5;i<8;i++){
      output += `<div class="result">${resultsArr[i].pair}<br>Score: ${Math.round(resultsArr[i].score)}</div>`;
    }

    results.innerHTML = output;
  }

  button.addEventListener("click", findCounters);
});
