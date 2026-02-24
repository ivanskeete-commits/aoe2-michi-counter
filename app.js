function scorePair(aName, bName, e1Name, e2Name) {

  const a = CIVS[aName];
  const b = CIVS[bName];
  const e1 = CIVS[e1Name];
  const e2 = CIVS[e2Name];

  let score = 0;
  let breakdown = [];

  // =========================
  // CORE POST-IMP TRADE META
  // =========================
  const lateScore = (a.late + b.late) * 3;
  const popScore = (a.pop + b.pop) * 3.5; // pop matters more with 300 cap
  const siegeScore = (a.siege + b.siege) * 2.5; // Michi bonus
  const deathballScore = (a.deathball + b.deathball) * 3;
  const goldScore = (a.goldEff + b.goldEff) * 2;

  score += lateScore + popScore + siegeScore + deathballScore + goldScore;
  breakdown.push(`Late scaling: ${lateScore}`);
  breakdown.push(`Pop efficiency: ${popScore}`);
  breakdown.push(`Siege power: ${siegeScore}`);
  breakdown.push(`Deathball: ${deathballScore}`);
  breakdown.push(`Gold efficiency: ${goldScore}`);

  // =========================
  // ENEMY THREAT MODELING
  // =========================
  const enemyElephant = e1Name === "Persians" || e2Name === "Persians" || e1.deathball >= 9 || e2.deathball >= 9;
  const enemyHeavyCav = e1.cav >= 9 || e2.cav >= 9;

  // =========================
  // ELEPHANT FLOOD COUNTER
  // =========================
  if (enemyElephant) {
    let antiEle = (a.siege + b.siege) * 2.5 + (a.pop + b.pop) * 1.5;
    score += antiEle;
    breakdown.push(`Anti-elephant pressure: ${Math.round(antiEle)}`);
  }

  // =========================
  // ANTI HEAVY CAV
  // =========================
  if (enemyHeavyCav) {
    const antiCav = (a.siege + b.siege) * 2;
    score += antiCav;
    breakdown.push(`Anti-heavy cav: ${antiCav}`);
  }

  // =========================
  // ROLE BALANCING
  // =========================
  const aMob = a.cav >= 8;
  const bMob = b.cav >= 8;
  const aSiegeCore = a.siege >= 8;
  const bSiegeCore = b.siege >= 8;

  if ((aMob && bSiegeCore) || (bMob && aSiegeCore)) {
    score += 20;
    breakdown.push("Mobility + Siege synergy: +20");
  }

  // =========================
  // OVERLAP PENALTIES
  // =========================
  if (a.cav >= 9 && b.cav >= 9) {
    score -= 25;
    breakdown.push("Double heavy cav penalty: -25");
  }
  if (a.siege >= 9 && b.siege >= 9) {
    score -= 10;
    breakdown.push("Double pure siege stacking penalty: -10");
  }

  // =========================
  // ENEMY-SPECIFIC COUNTERS
  // =========================
  let enemyBonus = 0;
  const persianCounters = ["Celts", "Bohemians", "Teutons"];
  const khmerCounters = ["Celts", "Bohemians", "Mongols"];

  // Bonus vs Persian elephants
  if ((e1Name === "Persians" || e2Name === "Persians") && (persianCounters.includes(aName) || persianCounters.includes(bName))) {
    enemyBonus += 12;
    breakdown.push("Targeted Persian counter bonus: +12");
  }

  // Bonus vs Khmer siege pressure
  if ((e1Name === "Khmer" || e2Name === "Khmer") && (khmerCounters.includes(aName) || khmerCounters.includes(bName))) {
    enemyBonus += 8;
    breakdown.push("Targeted Khmer counter bonus: +8");
  }

  score += enemyBonus;

  // =========================
  // AZTEC CORRECTION
  // =========================
  if (aName === "Aztecs" || bName === "Aztecs") {
    score -= 8;
    breakdown.push("Aztec DM trade correction: -8");
  }

  return { score: Math.round(score), breakdown };
}
