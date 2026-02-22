console.log("civs.js loaded");

const civs = {
  Byzantines: {
    strengths: ["halberdier", "trash", "defense"],
    weaknesses: ["low-damage-cavalry"],
    traits: ["defensive", "cheap-units"],
    notes: "Cheap counter units and excellent choke defense."
  },
  Franks: {
    strengths: ["cavalry"],
    weaknesses: ["halberdier"],
    traits: ["aggressive", "gold-heavy"],
    notes: "Strong paladins and direct pressure."
  },
  Mongols: {
    strengths: ["cavalry-archer", "siege"],
    weaknesses: ["halberdier"],
    traits: ["mobile", "power-spike"],
    notes: "Fast siege and high mobility."
  },
  Turks: {
    strengths: ["gunpowder", "siege"],
    weaknesses: ["trash"],
    traits: ["gold-heavy", "late-game"],
    notes: "Strong bombard cannons and gunpowder push."
  },
  Celts: {
    strengths: ["siege", "infantry"],
    weaknesses: ["mobility"],
    traits: ["choke-control"],
    notes: "Fast siege and strong push through narrow paths."
  },
  Britons: {
    strengths: ["archer"],
    weaknesses: ["siege", "cavalry"],
    traits: ["ranged"],
    notes: "Long-range arbalest dominance."
  }
};
