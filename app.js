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
const zoneLevelBands = {
  "Départ": [1, 25],
  "Prairie des Aulnes": [1, 26],
  "Mont des Cendres": [51, 76],
  "Îles Oubliées": [76, 101],
  "Forêt Brumeuse": [101, 126]
};
function levelRangeFor(item) {
  const band = zoneLevelBands[item.zone];
  if (!band) return "À définir";
  if (item.id === "014" && item.name === "Gardien des Aulnes") return "26–51";
  if (item.status === "BOSS") {
    const start = band[1];
    const end = Math.min(start + (DATA.rules?.levelBandWidth || 25), DATA.rules?.henchLevelCap || 300);
    return `${start}–${end}`;
  }
  return `${band[0]}–${band[1]}`;
}

function openHenchSheet(item) {
  const modal = $("#hench-modal");
  const image = $("#hench-modal-image");
  const placeholder = $("#hench-modal-placeholder");
  const typeInfo = typeByName[item.type];
  const typeName = item.type === "À confirmer" ? "Type à confirmer" : item.type;
  const range = levelRangeFor(item);

  $("#hench-modal-number").textContent = `N° ${item.id}`;
  $("#hench-modal-stat-number").textContent = item.id;
  $("#hench-modal-title").textContent = item.name;
  $("#hench-modal-type").textContent = `${typeInfo?.symbol || "?"} ${typeName}`;
  $("#hench-modal-status").textContent = item.status;
  $("#hench-modal-art-status").textContent = item.status === "BOSS" ? "BOSS UNIQUE" : "HENCH NORMAL";
  $("#hench-modal-zone").textContent = item.zone;
  $("#hench-modal-levels").textContent = range;
  $("#hench-modal-note").textContent = item.exclusiveHero
    ? `Hench exclusif à ${item.exclusiveHero}. Ce compagnon est lié à ce héros et à lui seul.`
    : item.status === "BOSS"
      ? "Boss unique : un adversaire exceptionnel, sans mécanique d’évolution."
      : `Hench de type ${typeName}, répertorié dans la zone ${item.zone}.`;
  modal.classList.toggle("modal-boss", item.status === "BOSS");
  $("#hench-modal-type").classList.toggle("type-unconfirmed", item.type === "À confirmer");
  $("#hench-modal-status").classList.toggle("status-boss", item.status === "BOSS");
  $("#hench-modal-status").classList.toggle("status-normal", item.status !== "BOSS");

  image.onload = () => { image.hidden = false; placeholder.hidden = true; };
  image.onerror = () => { image.hidden = true; placeholder.hidden = false; };
  image.alt = item.name;
  if (item.portrait) {
    image.hidden = true;
    placeholder.hidden = false;
    image.src = item.portrait;
    if (image.complete && image.naturalWidth > 0) { image.hidden = false; placeholder.hidden = true; }
  } else {
    image.removeAttribute("src");
    image.hidden = true;
    placeholder.hidden = false;
  }
  if (typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open", "");
}

function renderBestiary() {
  const query = $("#search").value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const status = $("#status-filter").value;
  const results = DATA.bestiary.filter(item => {
    const haystack = [item.id, item.name, item.type, item.zone, item.status, item.portraitStatus].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) &&
      (!selectedType || item.type === selectedType) &&
      (!status || item.status === status);
  });
  bestiaryGrid.innerHTML = results.map(item => {
    const typeInfo = typeByName[item.type];
    const displayType = item.type === "À confirmer" ? "Type à confirmer" : item.type;
    const typeSymbol = typeInfo ? typeInfo.symbol : "?";
    const typeClass = slugify(item.type);
    const statusClass = item.status === "BOSS" ? "boss" : "normal";
    const portrait = item.portrait ? `
      <img class="hench-portrait" src="${item.portrait}" alt="${item.name}" loading="lazy"
        onload="this.closest('.hench-art').classList.add('portrait-loaded')"
        onerror="this.remove()">` : "";
    return `
      <article class="hench-card" data-hench-id="${item.id}" tabindex="0" role="button" aria-label="Ouvrir la fiche de ${item.name}">
        <div class="hench-art ${item.portrait ? "has-portrait" : ""}">
          <span class="hench-id">N° ${item.id}</span>
          <span class="hench-state status-${statusClass}">${item.status}</span>
          ${portrait}
          <div class="portrait-placeholder">
            <span class="hench-placeholder-mark">✦</span>
            <span class="hench-placeholder-text">${item.portrait ? "PORTRAIT À IMPORTER" : "PORTRAIT À ASSOCIER"}</span>
          </div>
        </div>
        <div class="hench-copy">
          <h3>${item.name}</h3>
          <div class="hench-tags">
            <span class="type-pill type-${typeClass}"><span>${typeSymbol}</span>${displayType}</span>
            ${item.typeConfirmed || item.type === "À confirmer" ? "" : '<span class="confirm-pill">À confirmer</span>'}
            ${item.exclusiveHero ? `<span class="exclusive-pill">✦ Exclusif à ${item.exclusiveHero}</span>` : ""}
          </div>
          <div class="hench-meta"><span><b>Zone</b> ${item.zone}</span></div>
          <span class="asset-file">${item.exclusiveHero ? `HENCH EXCLUSIF À ${item.exclusiveHero.toUpperCase()}` : (item.portrait ? "PORTRAIT ASSOCIÉ • CLIQUER POUR LA FICHE" : "CLIQUE POUR VOIR LA FICHE • PORTRAIT À ASSOCIER")}</span>
        </div>
      </article>`;
  }).join("");
  emptyState.hidden = results.length > 0;
  resultCount.textContent = `${results.length} / ${DATA.bestiary.length} Henchs`;
}
$("#search").addEventListener("input", renderBestiary);
typeFilter.addEventListener("change", renderBestiary);
$("#status-filter").addEventListener("change", renderBestiary);
bestiaryGrid.addEventListener("click", event => {
  const card = event.target.closest(".hench-card");
  if (!card) return;
  const item = DATA.bestiary.find(entry => entry.id === card.dataset.henchId);
  if (item) openHenchSheet(item);
});
bestiaryGrid.addEventListener("keydown", event => {
  const card = event.target.closest(".hench-card");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    const item = DATA.bestiary.find(entry => entry.id === card.dataset.henchId);
    if (item) openHenchSheet(item);
  }
});
const detailModal = $("#hench-modal");
$("#hench-modal-close").addEventListener("click", () => detailModal.close());
$("#hench-modal-close-action").addEventListener("click", () => detailModal.close());
detailModal.addEventListener("click", event => { if (event.target === detailModal) detailModal.close(); });
renderBestiary();