// ============================================================
//  NeuroExam Pocket Guide — app logic
// ============================================================
import { TESTS, CATEGORIES } from "./data.js";
// viewer.js (and Three.js) are loaded lazily on first 3D open.

const grid = document.getElementById("grid");
const tabs = document.getElementById("tabs");
const search = document.getElementById("search");

let activeCat = "all";
let query = "";

// ---- category tabs ----------------------------------------
function buildTabs() {
  const all = { all: { label: "All tests", color: "#4f46e5", icon: "◆" }, ...CATEGORIES };
  tabs.innerHTML = "";
  for (const [key, c] of Object.entries(all)) {
    const b = document.createElement("button");
    b.className = "tab" + (key === activeCat ? " active" : "");
    b.textContent = c.label;
    b.style.setProperty("--tab", c.color);
    b.onclick = () => { activeCat = key; buildTabs(); render(); };
    tabs.appendChild(b);
  }
}

// ---- card grid --------------------------------------------
function render() {
  grid.innerHTML = "";
  const list = TESTS.filter((t) => {
    const catOk = activeCat === "all" || t.category === activeCat;
    const q = query.trim().toLowerCase();
    const qOk = !q || t.name.toLowerCase().includes(q) ||
      t.conditions.toLowerCase().includes(q) || t.indicates.toLowerCase().includes(q);
    return catOk && qOk;
  });

  if (!list.length) {
    grid.innerHTML = `<p class="empty">No tests match “${query}”.</p>`;
    return;
  }

  for (const t of list) {
    const cat = CATEGORIES[t.category];
    const card = document.createElement("div");
    card.className = "card";
    card.style.setProperty("--accent", cat.color);
    card.innerHTML = `
      <span class="badge">${cat.icon} ${cat.label}</span>
      <h3>${t.name}</h3>
      ${t.root ? `<span class="root">${t.root}</span>` : ""}
      <span class="play"><span class="ico">▶</span> View animation</span>`;
    card.onclick = () => openViewer(t);
    grid.appendChild(card);
  }
}

// ---- 3D modal ---------------------------------------------
let viewer = null;
const modal = document.getElementById("modal");
const stage = document.getElementById("stage");
const modalTitle = document.getElementById("modal-title");
const modalBadge = document.getElementById("modal-badge");
const explainToggle = document.getElementById("explain-toggle");
const explain = document.getElementById("explain");

const exFields = {
  how: document.getElementById("ex-how"),
  positive: document.getElementById("ex-positive"),
  indicates: document.getElementById("ex-indicates"),
  conditions: document.getElementById("ex-conditions"),
};

function collapseExplain() {
  explain.classList.remove("open");
  explainToggle.classList.remove("open");
  explainToggle.querySelector(".chev").nextSibling.textContent = " Show explanation";
}

async function openViewer(t) {
  const cat = CATEGORIES[t.category];
  modalTitle.textContent = t.name;
  modalBadge.textContent = cat.label;

  // fill explanation (kept collapsed until the user asks for it)
  exFields.how.textContent = t.how;
  exFields.positive.textContent = t.positive;
  exFields.indicates.textContent = t.indicates;
  exFields.conditions.textContent = t.conditions;
  collapseExplain();

  modal.classList.add("open");
  try {
    if (!viewer) {
      const mod = await import("./viewer.js");
      viewer = mod.createViewer(stage);
    }
    requestAnimationFrame(() => { viewer.resize(); viewer.show(t); });
  } catch (err) {
    stage.innerHTML =
      `<p style="padding:24px;color:#6f6e8c;text-align:center">
         The 3D view needs an internet connection the first time (to load the
         graphics library). Connect once and reopen — it works offline after that.
       </p>`;
  }
}

// explanation toggle
explainToggle.onclick = () => {
  const nowOpen = !explain.classList.contains("open");
  explain.classList.toggle("open", nowOpen);
  explainToggle.classList.toggle("open", nowOpen);
  explainToggle.querySelector(".chev").nextSibling.textContent =
    nowOpen ? " Hide explanation" : " Show explanation";
};

function closeModal() { modal.classList.remove("open"); }
document.getElementById("modal-close").onclick = closeModal;
modal.onclick = (e) => { if (e.target === modal) closeModal(); };
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

// ---- search -----------------------------------------------
search.oninput = (e) => { query = e.target.value; render(); };

// ---- boot -------------------------------------------------
buildTabs();
render();

// ---- PWA service worker -----------------------------------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(() => {})
  );
}
