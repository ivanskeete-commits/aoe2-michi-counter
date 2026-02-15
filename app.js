console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  const civSelect = document.getElementById("enemyCiv");
  const button = document.getElementById("findBtn");
  const resultDiv = document.getElementById("result");

  if (!civSelect) {
    console.error("enemyCiv dropdown not found");
    return;
  }

  if (typeof civs === "undefined") {
    console.error("civs object not found");
    return;
  }

  // Populate dropdown
  Object.keys(civs).forEach(civ => {
    const option = document.createElement("option");
    option.value = civ;
    option.textContent = civ;
    civSelect.appendChild(option);
  });

  // Top 3 counter table
  const topCounters = {
    Aztecs: ["Byzantines", "Turks", "Celts"],
    Berbers: ["Byzantines", "Celts", "Mayans"],
    Britons: ["Mongols", "Franks", "Byzantines"],
    Bulgarians: ["Turks", "Byzantines", "Celts"],
    Burmese: ["Celts", "Turks", "Byzantines"],
    Byzantines: ["Mongols", "Turks", "Lithuanians"],
    Celts: ["Turks", "Mongols", "Persians"],
    Chinese: ["Turks", "Franks", "Byzantines"],
    Cumans: ["Byzantines", "Turks", "Lithuanians"],
    Dravidians: ["Byzantines", "Turks", "Celts"],
    Ethiopians: ["Turks", "Mongols", "Byzantines"],
    Franks: ["Byzantines", "Mongols", "Turks"],
    Goths: ["Turks", "Byzantines", "Celts"],
    Huns: ["Byzantines", "Mongols", "Turks"],
    Incas: ["Turks", "Celts", "Byzantines"],
    Italians: ["Mongols", "Turks", "Byzantines"],
    Japanese: ["Turks", "Celts", "Byzantines"],
    Khmer: ["Turks", "Celts", "Mongols"],
    Koreans: ["Mongols", "Turks", "Byzantines"],
    Lithuanians: ["Byzantines", "Turks", "Mongols"],
    Magyars: ["Byzantines", "Turks", "Lithuanians"],
    Malay: ["Byzantines", "Turks", "Celts"],
    Malians: ["Turks", "Celts", "Byzantines"],
    Mayans: ["Turks", "Byzantines", "Celts"],
    Mongols: ["Byzantines", "Turks", "Celts"],
    Persians: ["Byzantines", "Turks", "Mongols"],
    Poles: ["Byzantines", "Turks", "Lithuanians"],
    Portuguese: ["Byzantines", "Turks", "Mongols"],
    Romans: ["Byzantines", "Celts", "Turks"],
    Saracens: ["Byzantines", "Turks", "Mongols"],
    Sicilians: ["Byzantines", "Turks", "Celts"],
    Slavs: ["Turks", "Byzantines", "Mongols"],
    Spanish: ["Byzantines", "Turks", "Celts"],
    Tatars: ["Byzantines", "Mongols", "Turks"],
    Teutons: ["Mongols", "Turks", "Byzantines"],
    Turks: ["Byzantines", "Celts", "Mongols"],
    Vietnamese: ["Byzantines", "Turks", "Celts"],
    Vikings: ["Turks", "Celts", "Byzantines"]
  };

  button.addEventListener("click", () => {
    const enemy = civSelect.value;
    const counters = topCounters[enemy];
    const enemyData = civs[enemy];

    if (!counters || counters.length === 0) {
      resultDiv.innerHTML = `<p>No counter data available for ${enemy}.</p>`;
      return;
    }

    resultDiv.innerHTML = `
      <h3>Top 3 Counter Civs vs ${enemy}</h3>
      <ol>
        ${counters.map(c => `<li>${c}: ${civs[c] ? civs[c].notes : ""}</li>`).join("")}
      </ol>
      <p><strong>Enemy Notes:</strong> ${enemyData.notes}</p>
    `;
  });
});
