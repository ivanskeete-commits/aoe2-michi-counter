// Inside your suggestBtn listener, change how resultsDiv.innerHTML is set:

resultsDiv.innerHTML = `
  <div class="section-title"><span>Top Counter Suggestions</span></div>
  ${top5.map((pair, i) => {
    const a = CIVS[pair.civA];
    const b = CIVS[pair.civB];
    const learning = calculateLearningAdjustment(pair.civA, pair.civB, e1, e2);
    
    return `
      <div class="result-card">
        <div class="card-header">
          <strong>${pair.civA} + ${pair.civB}</strong>
          <button class="details-btn" onclick="const d = document.getElementById('details-${i}'); d.style.display = d.style.display === 'none' ? 'block' : 'none'">Details ▾</button>
        </div>
        <div id="details-${i}" class="details-content" style="display:none;">
          <div class="stat-row">Late scaling: <span class="stat-val">+${(a.late + b.late)}</span></div>
          <div class="stat-row">Cav + Siege synergy: <span class="stat-val">+${(a.cav >= 8 && b.siege >= 8 ? 25 : 0)}</span></div>
          <div class="stat-row">Gold efficiency: <span class="stat-val">+${(a.goldEff + b.goldEff)}</span></div>
          <div class="stat-row">Learning bonus: <span class="stat-val">${learning >= 0 ? '+' : ''}${learning.toFixed(0)}</span></div>
        </div>
      </div>
    `;
  }).join("")}
`;
