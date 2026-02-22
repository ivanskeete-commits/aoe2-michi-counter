console.log("app.js loaded");

document.addEventListener("DOMContentLoaded", () => {

  const civSelect = document.getElementById("enemyCiv");
  const button = document.getElementById("findBtn");
  const resultDiv = document.getElementById("result");

  // Create Map Style
  const mapSelect = document.createElement("select");
  mapSelect.id = "mapStyle";
  ["balanced","open"].forEach(style=>{
    const o=document.createElement("option");
    o.value=style;
    o.textContent=style;
    mapSelect.appendChild(o);
  });

  // Create Teammate Selector
  const mateSelect=document.createElement("select");
  mateSelect.id="mateCiv";

  Object.keys(civs).forEach(civ=>{
    const opt=document.createElement("option");
    opt.value=civ;
    opt.textContent=civ;
    civSelect.appendChild(opt.cloneNode(true));
    mateSelect.appendChild(opt);
  });

  button.parentNode.insertBefore(mapSelect,button);
  button.parentNode.insertBefore(mateSelect,button);

  const weights={
    counterStrength:3,
    mobility:4,
    powerSpike:3,
    synergy:3
  };

  function score(enemy,candidate,mate,mapStyle){
    let s=0;

    // Counter logic
    enemy.strengths?.forEach(str=>{
      if(candidate.strengths.includes("anti-"+str))
        s+=weights.counterStrength;
    });

    // Mobility bias (open maps)
    if(mapStyle==="open"){
      if(candidate.traits.includes("mobile"))
        s+=weights.mobility;
      if(candidate.strengths.includes("cavalry")||
         candidate.strengths.includes("cavalry-archer"))
        s+=weights.mobility;
    }

    // DM power spike bonus
    if(candidate.traits.includes("power-spike"))
      s+=weights.powerSpike;

    // Synergy: avoid duplicate roles
    if(mate){
      if(JSON.stringify(candidate.strengths)===
         JSON.stringify(mate.strengths))
        s-=weights.synergy;
      else
        s+=weights.synergy;
    }

    return s;
  }

  button.addEventListener("click",()=>{

    const enemyName=civSelect.value;
    const mateName=mateSelect.value;
    const mapStyle=mapSelect.value;

    const enemy=civs[enemyName];
    const mate=civs[mateName];

    const ranked=Object.keys(civs)
      .filter(c=>c!==enemyName)
      .map(c=>({
        civ:c,
        score:score(enemy,civs[c],mate,mapStyle)
      }))
      .sort((a,b)=>b.score-a.score)
      .slice(0,3);

    resultDiv.innerHTML=`
      <h3>Top Counters vs ${enemyName}</h3>
      <p>Map: ${mapStyle} | Teammate: ${mateName}</p>
      <ol>
        ${ranked.map(r=>`
          <li><strong>${r.civ}</strong> (${r.score})<br>
          ${civs[r.civ].notes}</li>
        `).join("")}
      </ol>
    `;
  });

});
