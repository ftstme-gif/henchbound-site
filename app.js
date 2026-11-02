const $ = (selector) => document.querySelector(selector);
const DATA = window.HENCHBOUND_DATA;

if (!DATA.types.some(t => t.name === "Lumière")) {
  DATA.types.push({ name: "Lumière", number: "09", symbol: "☀", color: "gold" });
}

document.querySelector('.main-nav a[href="#families"]')?.replaceChildren(document.createTextNode("9 types"));
const familiesTitle = document.querySelector("#families .section-heading h2");
if (familiesTitle) familiesTitle.innerHTML = "Neuf types,<br><em>neuf familles.</em>";
const familiesIntro = document.querySelector("#families .section-heading > p");
if (familiesIntro) familiesIntro.textContent = "Les neuf familles de Henchbound : Plante, Dragon, Métal, Oiseau, Démon, Mystère, Bête, Insecte et Lumière.";
const levelRules = document.querySelector("#level-rules");
if (levelRules) levelRules.textContent = "9 types Henchbound • les créations originales viendront séparément";
const familyFootnote = document.querySelector("#families .family-footnote");
if (familyFootnote) familyFootnote.textContent = "✧ Les neuf catégories de Henchbound sont affichées ici. Les Henchs originaux seront ajoutés dans une seconde phase.";
const modalFootnote = document.querySelector(".hench-modal-footnote");
if (modalFootnote) modalFootnote.textContent = "Les niveaux et habitats affichés correspondent aux données actuellement intégrées au catalogue Henchbound.";
const footerLabel = document.querySelector(".site-footer > span");
if (footerLabel) footerLabel.textContent = "HENCHBOUND • CATALOGUE HENCHBOUND • BESTIAIRE EN CONSTRUCTION";

const slugify = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const typeByName = Object.fromEntries(DATA.types.map(t => [t.name, t]));
const heroGrid = $("#hero-grid");
if (heroGrid) heroGrid.innerHTML = DATA.heroes.map((h, i) => `
  <article class="hero-card"><div class="hero-art"><span class="hero-number">HÉROS 0${i + 1}</span><img class="hero-portrait" src="${h.image || ("assets/heroes/" + h.file)}" alt="${h.name}, ${h.role}"></div>
  <div class="hero-card-copy"><h3>${h.name}</h3><span class="role-pill">${h.role}</span><p>${h.tag}</p></div></article>`).join("");

const familyGrid = $("#family-grid");
if (familyGrid) familyGrid.innerHTML = DATA.types.map(t => `<button type="button" class="family-card family-${slugify(t.name)}" data-select-type="${t.name}" title="Afficher les Henchs ${t.name}"><span class="family-symbol">${t.symbol}</span><b>${t.name}</b><small>${t.number}</small></button>`).join("");

const categories = $("#bestiary-categories");
const bestiaryList = $("#bestiary-list");
const emptyState = $("#empty-state");
const resultCount = $("#result-count");
const collectionTitle = $("#collection-title");
const typeTitle = $("#bestiary-type-title");
const typeCount = $("#bestiary-type-count");
const search = $("#search");
let selectedType = DATA.types[1]?.name || DATA.types[0]?.name || "";

function levelRangeFor(item) {
  if (Number.isFinite(item.levelMin) && Number.isFinite(item.levelMax)) return `${item.levelMin}–${item.levelMax}`;
  if (Number.isFinite(item.levelMin)) return `${item.levelMin}+`;
  return "À définir";
}

function portraitFor(item) {
  return item.portrait || `assets/henchs/${item.id}_${slugify(item.name)}.webp`;
}

function getTypeItems(typeName) {
  const query = search?.value.trim().toLowerCase() || "";
  return DATA.bestiary.filter(item => item.type === typeName)
    .filter(item => !query || [item.id, item.name, item.zone, item.status, item.source].join(" ").toLowerCase().includes(query))
    .sort((a, b) => (a.levelMin ?? 9999) - (b.levelMin ?? 9999) || a.name.localeCompare(b.name));
}

function renderCategories() {
  if (!categories) return;
  categories.innerHTML = DATA.types.map(t => {
    const count = DATA.bestiary.filter(item => item.type === t.name).length;
    return `<button type="button" class="bestiary-category ${t.name === selectedType ? "active" : ""}" data-type="${t.name}" aria-pressed="${t.name === selectedType}"><b>${t.symbol} ${t.name}</b><small>${count} Hench${count > 1 ? "s" : ""}</small></button>`;
  }).join("");
}

function openHenchSheet(item) {
  const modal = $("#hench-modal");
  const image = $("#hench-modal-image");
  const placeholder = $("#hench-modal-placeholder");
  const typeInfo = typeByName[item.type];
  $("#hench-modal-number").textContent = `N° ${item.id}`;
  $("#hench-modal-stat-number").textContent = item.id;
  $("#hench-modal-title").textContent = item.name;
  $("#hench-modal-type").textContent = `${typeInfo?.symbol || "?"} ${item.type}`;
  $("#hench-modal-status").textContent = item.status;
  $("#hench-modal-art-status").textContent = item.status === "BOSS" ? "BOSS UNIQUE" : "HENCHBOUND";
  $("#hench-modal-zone").textContent = item.zone || "Zone à définir";
  $("#hench-modal-levels").textContent = levelRangeFor(item);
  $("#hench-modal-note").textContent = `${item.name} • ${item.type} • niveau ${levelRangeFor(item)} • catalogue Henchbound.`;
  modal.classList.toggle("modal-boss", item.status === "BOSS");
  $("#hench-modal-status").classList.toggle("status-boss", item.status === "BOSS");
  $("#hench-modal-status").classList.toggle("status-normal", item.status !== "BOSS");
  image.onload = () => { image.hidden = false; placeholder.hidden = true; };
  image.onerror = () => { image.hidden = true; placeholder.hidden = false; };
  image.alt = item.name;
  image.hidden = true;
  placeholder.hidden = false;
  image.src = portraitFor(item);
  if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
}

function renderBestiary() {
  const typeInfo = typeByName[selectedType];
  const allInType = DATA.bestiary.filter(item => item.type === selectedType);
  const results = getTypeItems(selectedType);
  renderCategories();
  if (typeTitle) typeTitle.textContent = selectedType;
  if (typeCount) typeCount.textContent = `${results.length} / ${allInType.length} Henchs de type ${selectedType}`;
  if (collectionTitle) collectionTitle.textContent = `${typeInfo?.symbol || "✦"} ${selectedType} — catalogue Henchbound`;
  if (resultCount) resultCount.textContent = `${results.length} affichés`;
  if (!bestiaryList) return;
  bestiaryList.innerHTML = results.map(item => `
    <article class="hench-row" data-hench-id="${item.id}" tabindex="0" role="button" aria-label="Ouvrir la fiche de ${item.name}">
      <span class="hench-row-art"><img src="${portraitFor(item)}" alt="${item.name}" loading="lazy" onerror="this.parentElement.classList.add('portrait-missing');this.remove()"><span>✦</span></span>
      <span class="hench-row-number">N° ${item.id}</span>
      <span class="hench-row-main"><strong>${item.name}${item.status === "BOSS" ? `<span class="hench-row-status">BOSS</span>` : ""}</strong><small>${item.zone || "Zone à définir"}</small></span>
      <span class="hench-row-level">Lv. ${levelRangeFor(item)}</span>
    </article>`).join("");
  if (emptyState) {
    emptyState.hidden = results.length > 0;
    emptyState.textContent = selectedType === "Lumière" ? "Aucun Hench Lumière pour le moment. Cette famille est réservée aux futures créations originales Henchbound." : "Aucun Hench ne correspond à cette recherche.";
  }
}

function selectType(typeName, scrollIntoView = false) {
  if (!typeByName[typeName]) return;
  selectedType = typeName;
  renderBestiary();
  if (scrollIntoView) $("#bestiary")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

categories?.addEventListener("click", event => { const button = event.target.closest("[data-type]"); if (button) selectType(button.dataset.type); });
familyGrid?.addEventListener("click", event => { const button = event.target.closest("[data-select-type]"); if (button) selectType(button.dataset.selectType, true); });
search?.addEventListener("input", renderBestiary);

bestiaryList?.addEventListener("click", event => {
  const row = event.target.closest(".hench-row");
  if (!row) return;
  const item = DATA.bestiary.find(entry => entry.id === row.dataset.henchId);
  if (item) openHenchSheet(item);
});

bestiaryList?.addEventListener("keydown", event => {
  const row = event.target.closest(".hench-row");
  if (row && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    const item = DATA.bestiary.find(entry => entry.id === row.dataset.henchId);
    if (item) openHenchSheet(item);
  }
});

const detailModal = $("#hench-modal");
$("#hench-modal-close")?.addEventListener("click", () => detailModal.close());
$("#hench-modal-close-action")?.addEventListener("click", () => detailModal.close());
detailModal?.addEventListener("click", event => { if (event.target === detailModal) detailModal.close(); });
renderBestiary();
