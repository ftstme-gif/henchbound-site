const DATA = window.HENCHBOUND_DATA;
const $ = (s) => document.querySelector(s);
const slugify = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const typeByName = Object.fromEntries(DATA.types.map(t => [t.name, t]));

const heroGrid = $("#hero-grid");
if (heroGrid) heroGrid.innerHTML = DATA.heroes.map((h, i) => `
  <article class="hero-card"><div class="hero-art"><span class="hero-number">HÉROS 0${i + 1}</span><img class="hero-portrait" src="${h.image || ("assets/heroes/" + h.file)}" alt="${h.name}, ${h.role}"></div>
  <div class="hero-card-copy"><h3>${h.name}</h3><span class="role-pill">${h.role}</span><p>${h.tag}</p></div></article>`).join("");

const familyGrid = $("#family-grid");
if (familyGrid) familyGrid.innerHTML = DATA.types.map(t => `<div class="family-card family-${slugify(t.name)}" title="Type ${t.name}"><span class="family-symbol">${t.symbol}</span><b>${t.name}</b><small>${t.number}</small></div>`).join("");

const typeFilter = $("#type-filter");
DATA.types.forEach(t => { const option = document.createElement("option"); option.value = t.name; option.textContent = t.name; typeFilter.appendChild(option); });

const bestiaryGrid = $("#bestiary-grid");
const emptyState = $("#empty-state");
const resultCount = $("#result-count");
const levelRules = $("#level-rules");
const levelFilter = $("#level-filter");
const statusFilter = $("#status-filter");
if (levelRules && DATA.rules) levelRules.textContent = `Niveau maximum de référence : ${DATA.rules.henchLevelCap} • filtres par type et plage de niveau`;

function levelRangeFor(item) {
  if (Number.isFinite(item.levelMin) && Number.isFinite(item.levelMax)) return `${item.levelMin}–${item.levelMax}`;
  return "À définir";
}
function overlapsBand(item, band) {
  if (!band || !Number.isFinite(item.levelMin) || !Number.isFinite(item.levelMax)) return false;
  const [min, max] = band.split("-").map(Number);
  return item.levelMin <= max && item.levelMax >= min;
}

function openHenchSheet(item) {
  const modal = $("#hench-modal");
  const image = $("#hench-modal-image");
  const placeholder = $("#hench-modal-placeholder");
  const typeInfo = typeByName[item.type];
  const typeName = item.type;
  $("#hench-modal-number").textContent = `N° ${item.id}`;
  $("#hench-modal-stat-number").textContent = item.id;
  $("#hench-modal-title").textContent = item.name;
  $("#hench-modal-type").textContent = `${typeInfo?.symbol || "?"} ${typeName}`;
  $("#hench-modal-status").textContent = item.status;
  $("#hench-modal-art-status").textContent = item.status === "BOSS" ? "BOSS UNIQUE" : "HENCH MIXMASTER";
  $("#hench-modal-zone").textContent = item.zone;
  $("#hench-modal-levels").textContent = levelRangeFor(item);
  $("#hench-modal-note").textContent = `Type ${typeName} • niveau ${levelRangeFor(item)} • source : ${item.source || "MixMaster"}.`;
  modal.classList.toggle("modal-boss", item.status === "BOSS");
  $("#hench-modal-status").classList.toggle("status-boss", item.status === "BOSS");
  $("#hench-modal-status").classList.toggle("status-normal", item.status !== "BOSS");
  image.onload = () => { image.hidden = false; placeholder.hidden = true; };
  image.onerror = () => { image.hidden = true; placeholder.hidden = false; };
  image.alt = item.name;
  if (item.portrait) { image.hidden = true; placeholder.hidden = false; image.src = item.portrait; } else { image.removeAttribute("src"); image.hidden = true; placeholder.hidden = false; }
  if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
}

function renderBestiary() {
  const query = $("#search").value.trim().toLowerCase();
  const selectedType = typeFilter.value;
  const selectedLevel = levelFilter ? levelFilter.value : "";
  const status = statusFilter.value;
  const results = DATA.bestiary.filter(item => {
    const haystack = [item.id, item.name, item.type, item.zone, item.status, item.source].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (!selectedType || item.type === selectedType) && (!selectedLevel || overlapsBand(item, selectedLevel)) && (!status || item.status === status);
  });
  bestiaryGrid.innerHTML = results.map(item => {
    const typeInfo = typeByName[item.type];
    const typeSymbol = typeInfo ? typeInfo.symbol : "?";
    const typeClass = slugify(item.type);
    const statusClass = item.status === "BOSS" ? "boss" : "normal";
    const portrait = item.portrait ? `<img class="hench-portrait" src="${item.portrait}" alt="${item.name}" loading="lazy" onerror="this.remove()">` : "";
    return `<article class="hench-card" data-hench-id="${item.id}" tabindex="0" role="button" aria-label="Ouvrir la fiche de ${item.name}">
      <div class="hench-art ${item.portrait ? "has-portrait" : ""}"><span class="hench-id">N° ${item.id}</span><span class="hench-state status-${statusClass}">${item.status}</span>${portrait}<div class="portrait-placeholder"><span class="hench-placeholder-mark">✦</span><span class="hench-placeholder-text">PORTRAIT À ASSOCIER</span></div></div>
      <div class="hench-copy"><h3>${item.name}</h3><div class="hench-tags"><span class="type-pill type-${typeClass}"><span>${typeSymbol}</span>${item.type}</span></div><div class="hench-meta"><span><b>Zone</b> ${item.zone}</span><span><b>Niveaux</b> ${levelRangeFor(item)}</span></div><span class="asset-file">MIXMASTER • ${levelRangeFor(item)}</span></div>
    </article>`;
  }).join("");
  emptyState.hidden = results.length > 0;
  resultCount.textContent = `${results.length} / ${DATA.bestiary.length} Henchs`;
}

$("#search").addEventListener("input", renderBestiary);
typeFilter.addEventListener("change", renderBestiary);
if (levelFilter) levelFilter.addEventListener("change", renderBestiary);
statusFilter.addEventListener("change", renderBestiary);
bestiaryGrid.addEventListener("click", event => { const card = event.target.closest(".hench-card"); if (!card) return; const item = DATA.bestiary.find(entry => entry.id === card.dataset.henchId); if (item) openHenchSheet(item); });
bestiaryGrid.addEventListener("keydown", event => { const card = event.target.closest(".hench-card"); if (card && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); const item = DATA.bestiary.find(entry => entry.id === card.dataset.henchId); if (item) openHenchSheet(item); } });
const detailModal = $("#hench-modal");
$("#hench-modal-close").addEventListener("click", () => detailModal.close());
$("#hench-modal-close-action").addEventListener("click", () => detailModal.close());
detailModal.addEventListener("click", event => { if (event.target === detailModal) detailModal.close(); });
renderBestiary();
