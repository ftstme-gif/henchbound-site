const DATA = window.HENCHBOUND_DATA;
const $ = (s) => document.querySelector(s);
const slugify = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const typeByName = Object.fromEntries(DATA.types.map(t => [t.name, t]));

const heroGrid = $("#hero-grid");
heroGrid.innerHTML = DATA.heroes.map((h, i) => `
  <article class="hero-card">
    <div class="hero-art">
      <span class="hero-number">HÉROS 0${i + 1}</span>
      <img class="hero-portrait" src="${h.image || ("assets/heroes/" + h.file)}" alt="${h.name}, ${h.role}">
    </div>
    <div class="hero-card-copy">
      <h3>${h.name}</h3>
      <span class="role-pill">${h.role}</span>
      <p>${h.tag}</p>
    </div>
  </article>`).join("");

const familyGrid = $("#family-grid");
familyGrid.innerHTML = DATA.types.map(t => `
  <div class="family-card family-${slugify(t.name)}" title="Type ${t.name}">
    <span class="family-symbol">${t.symbol}</span><b>${t.name}</b><small>${t.number}</small>
  </div>`).join("");

const typeFilter = $("#type-filter");
DATA.types.forEach(t => {
  const option = document.createElement("option");
  option.value = t.name;
  option.textContent = t.name;
  typeFilter.appendChild(option);
});
const unconfirmedTypeOption = document.createElement("option");
unconfirmedTypeOption.value = "À confirmer";
unconfirmedTypeOption.textContent = "Type à confirmer";
typeFilter.appendChild(unconfirmedTypeOption);

const bestiaryGrid = $("#bestiary-grid");
const emptyState = $("#empty-state");
const resultCount = $("#result-count");
const levelRules = $("#level-rules");
if (levelRules && DATA.rules) {
  levelRules.textContent = `Niveau max Hench : ${DATA.rules.henchLevelCap} • Écart héros/Hench : ${DATA.rules.maxHeroHenchLevelGap} niveaux max • Paliers de référence : ${DATA.rules.levelBandWidth} niveaux`;
}
function renderBestiary() {
  const query = $("#search").value.trim().toLowerCase();
  const type = typeFilter.value;
  const status = $("#status-filter").value;
  const results = DATA.bestiary.filter(item => {
    const haystack = [item.id, item.name, item.type, item.zone, item.status, item.portraitStatus].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) &&
      (!type || item.type === type) &&
      (!status || item.status === status);
  });
  bestiaryGrid.innerHTML = results.map(item => {
    const type = typeByName[item.type];
    const displayType = item.type === "À confirmer" ? "Type à confirmer" : item.type;
    const typeSymbol = type ? type.symbol : "?";
    const typeClass = slugify(item.type);
    const statusClass = item.status === "BOSS" ? "boss" : "normal";
    const portrait = item.portrait ? `
      <img class="hench-portrait" src="${item.portrait}" alt="${item.name}" loading="lazy"
        onload="this.closest('.hench-art').classList.add('portrait-loaded')"
        onerror="this.remove()">` : "";
    return `
      <article class="hench-card">
        <div class="hench-art ${item.portrait ? "has-portrait" : ""}">
          <span class="hench-id">N° ${item.id}</span>
          <span class="hench-state status-${statusClass}">${item.status}</span>
          ${portrait}
          <div class="portrait-placeholder">
            <span class="hench-placeholder-mark">✦</span>
            <span class="hench-placeholder-text">PORTRAIT À ASSOCIER</span>
          </div>
        </div>
        <div class="hench-copy">
          <h3>${item.name}</h3>
          <div class="hench-tags">
            <span class="type-pill type-${typeClass}"><span>${typeSymbol}</span>${displayType}</span>
            ${item.typeConfirmed ? "" : '<span class="confirm-pill">À confirmer</span>'}
          </div>
          <div class="hench-meta">
            <span><b>Zone</b> ${item.zone}</span>
          </div>
          <span class="asset-file">${item.portrait ? "PORTRAIT IDENTIFIÉ • IMPORT EN COURS" : "VISUEL NON ASSOCIÉ — AUCUN SPRITE AFFICHÉ"}</span>
        </div>
      </article>`;
  }).join("");
  emptyState.hidden = results.length > 0;
  resultCount.textContent = `${results.length} / ${DATA.bestiary.length} Henchs`;
}
$("#search").addEventListener("input", renderBestiary);
typeFilter.addEventListener("change", renderBestiary);
$("#status-filter").addEventListener("change", renderBestiary);
renderBestiary();
