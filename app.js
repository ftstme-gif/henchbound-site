const DATA = window.HENCHBOUND_DATA;
const $ = (s) => document.querySelector(s);

const heroGrid = $("#hero-grid");
heroGrid.innerHTML = DATA.heroes.map((h, i) => `
  <article class="hero-card">
    <div class="hero-art">
      <span class="hero-number">HÉROS 0${i + 1}</span>
      <img class="hero-portrait" src="${h.image || ('assets/heroes/' + h.file)}" alt="${h.name}, ${h.role}">
    </div>
    <div class="hero-card-copy">
      <h3>${h.name}</h3>
      <span class="role-pill">${h.role}</span>
      <p>${h.tag}</p>
    </div>
  </article>`).join("");

const familyGrid = $("#family-grid");
familyGrid.innerHTML = DATA.types.map(t => `
  <div class="family-card" title="Type ${t.name}">
    <span class="family-symbol">${t.symbol}</span><b>${t.name}</b><small>${t.number}</small>
  </div>`).join("");

const typeFilter = $("#type-filter");
DATA.types.forEach(t => {
  const option = document.createElement("option");
  option.value = t.name;
  option.textContent = t.name;
  typeFilter.appendChild(option);
});

const bestiaryGrid = $("#bestiary-grid");
const emptyState = $("#empty-state");
const resultCount = $("#result-count");
function renderBestiary() {
  const query = $("#search").value.trim().toLowerCase();
  const type = typeFilter.value;
  const status = $("#status-filter").value;
  const results = DATA.bestiary.filter(item => {
    const haystack = [item.id, item.name, item.type, item.zone, item.status].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) &&
      (!type || item.type === type) &&
      (!status || item.status === status);
  });
  bestiaryGrid.innerHTML = results.map(item => `
    <article class="hench-card">
      <div class="hench-art">
        <span class="hench-id">${item.id}</span>
        <span class="hench-state">EN PRÉPARATION</span>
        <div class="hench-placeholder-mark" aria-hidden="true">✧</div>
        <div class="hench-placeholder-text">VISUEL EN ATTENTE</div>
      </div>
      <div class="hench-copy">
        <h3>${item.name}</h3>
        <div class="hench-meta"><span>Type : ${item.type}</span><span>Zone : ${item.zone}</span></div>
        <span class="asset-file">FICHE EN PRÉPARATION</span>
      </div>
    </article>`).join("");
  emptyState.hidden = results.length > 0;
  resultCount.textContent = `${results.length} fiche${results.length === 1 ? "" : "s"}`;
}
$("#search").addEventListener("input", renderBestiary);
typeFilter.addEventListener("change", renderBestiary);
$("#status-filter").addEventListener("change", renderBestiary);
renderBestiary();
