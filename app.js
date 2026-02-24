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
  const popScore = (a.pop + b.pop) * 4;        // pop matters more with 300 cap
  const siegeScore = (a.siege + b.siege) * 3;  // choke map boost
  const deathballScore = (a.deathball + b.deathball) * 3;
  const goldScore = (a.goldEff + b.goldEff) * 2;

  score += lateScore + popScore + siegeScore + deathballScore + goldScore;

  breakdown.push(`Late scaling: ${lateScore}`);
  breakdown.push(`Pop efficiency (300 cap): ${popScore}`);
  breakdown.push(`Siege power (Michi choke): ${siegeScore}`);
  breakdown.push(`Deathball: ${deathballScore}`);
  breakdown.push(`Gold efficiency (heavy trade): ${goldScore}`);

  // =========================
  // ENEMY THREAT MODELING
  // =========================

  const enemyElephant =
    e1Name === "Persians" || e2Name === "Persians" ||
    e1.deathball >= 9 || e2.deathball >= 9;

  const enemyHeavyCav =
    e1.cav >= 9 || e2.cav >= 9;

  // =========================
  // ELEPHANT FLOOD COUNTER
  // =========================

  if (enemyElephant) {
    const antiEle =
      (a.siege + b.siege) * 3 +   // scorps/SO proxy
      (a.pop + b.pop) * 1.5;      // halb spam sustain proxy

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
  // PERSIAN META REALITY
  // =========================

  if (aName === "Persians" || bName === "Persians") {
    score += 12;  // reflect actual Michi dominance
    breakdown.push("Persian post-imp trade dominance: +12");
  }

  // =========================
  // AZTEC CORRECTION
  // =========================

  if (aName === "Aztecs" || bName === "Aztecs") {
    score -= 8;   // monk eco less relevant in DM trade meta
    breakdown.push("Aztec DM trade correction: -8");
  }

  return { score: Math.round(score), breakdown };
}
