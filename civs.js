console.log("civs.js loaded");

const civs = {

  // CAVALRY POWER
  Franks: { strengths:["cavalry"], traits:["aggressive","power-spike"], notes:"Top-tier paladin civ." },
  Lithuanians: { strengths:["cavalry"], traits:["aggressive","power-spike"], notes:"High burst cavalry." },
  Poles: { strengths:["cavalry"], traits:["aggressive"], notes:"Strong cavalry scaling." },
  Persians: { strengths:["cavalry"], traits:["power-spike"], notes:"War elephants and cav flood." },
  Teutons: { strengths:["cavalry","infantry"], traits:["tank"], notes:"Extremely durable units." },
  Bulgarians: { strengths:["infantry","cavalry"], traits:["aggressive"], notes:"Strong melee pressure." },
  Sicilians: { strengths:["cavalry","infantry"], traits:["tank"], notes:"Resilient frontline." },

  // CAV ARCHER / MOBILE DPS
  Mongols: { strengths:["cavalry-archer","siege"], traits:["mobile","power-spike"], notes:"Elite CA + fast siege." },
  Magyars: { strengths:["cavalry-archer"], traits:["mobile"], notes:"Strong late-game CA." },
  Tatars: { strengths:["cavalry-archer"], traits:["mobile"], notes:"Mobile high-ground power." },
  Cumans: { strengths:["cavalry"], traits:["mobile"], notes:"Fast cavalry flood." },
  Huns: { strengths:["cavalry","cavalry-archer"], traits:["mobile"], notes:"Rapid cavalry production." },

  // GUNPOWDER / DPS
  Turks: { strengths:["gunpowder","siege"], traits:["power-spike"], notes:"Elite bombard + gunpowder." },
  Portuguese: { strengths:["gunpowder"], traits:["late-game"], notes:"Strong bombard cannons." },
  Spanish: { strengths:["gunpowder","cavalry"], traits:["aggressive"], notes:"Conqs + bombard." },
  Hindustanis: { strengths:["gunpowder","anti-cavalry"], traits:["power-spike"], notes:"Great camels + HC." },
  Saracens: { strengths:["archer","camel"], traits:["mobile"], notes:"Flexible archer + camel civ." },

  // SIEGE PRESSURE
  Celts: { strengths:["siege","infantry"], traits:["power-spike"], notes:"Fast siege flood." },
  Slavs: { strengths:["siege","infantry"], traits:["aggressive"], notes:"Heavy siege pushes." },
  Ethiopians: { strengths:["archer","siege"], traits:["power-spike"], notes:"Fast-firing siege + archers." },
  Koreans: { strengths:["siege"], traits:["late-game"], notes:"Strong defensive siege." },

  // DEFENSIVE / FLEX
  Byzantines: { strengths:["trash","halberdier"], traits:["defensive"], notes:"Cheap counter units." },
  Chinese: { strengths:["archer"], traits:["balanced"], notes:"Strong ranged scaling." },
  Japanese: { strengths:["infantry"], traits:["balanced"], notes:"Solid halbs + infantry." },
  Vikings: { strengths:["infantry"], traits:["balanced"], notes:"Strong infantry core." },
  Romans: { strengths:["infantry"], traits:["tank"], notes:"Durable infantry." },
  Dravidians: { strengths:["infantry"], traits:["balanced"], notes:"Infantry focus." },
  Malians: { strengths:["infantry"], traits:["balanced"], notes:"Versatile infantry." },
  Incas: { strengths:["infantry"], traits:["balanced"], notes:"Flexible infantry options." },

  // ARCHER FOCUS
  Britons: { strengths:["archer"], traits:["ranged"], notes:"Long-range arbalest civ." },
  Mayans: { strengths:["archer"], traits:["ranged"], notes:"Strong archer spam." },
  Vietnamese: { strengths:["archer"], traits:["ranged"], notes:"Durable archers." },
  Aztecs: { strengths:["infantry"], traits:["aggressive"], notes:"Infantry flood." },

  // ELEPHANTS
  Khmer: { strengths:["elephant"], traits:["power-spike"], notes:"Strong battle elephants." },
  Burmese: { strengths:["infantry","elephant"], traits:["aggressive"], notes:"Elephant + infantry." },
  Malay: { strengths:["elephant"], traits:["power-spike"], notes:"Cheap elephants." },

  // OTHER CAV MIX
  Berbers: { strengths:["cavalry"], traits:["mobile"], notes:"Discount cavalry." },
  Goths: { strengths:["infantry"], traits:["aggressive"], notes:"Infantry swarm." },
  Italians: { strengths:["gunpowder"], traits:["balanced"], notes:"Flexible gunpowder civ." }
};
