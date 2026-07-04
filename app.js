// ============================================================
//  NeuroExam Pocket Guide — app logic
// ============================================================
import { TESTS, CATEGORIES } from "./data.js";
// viewer.js (and Three.js) are loaded lazily on first 3D open, so the
// card guide keeps working even offline / if the CDN is unreachable.

const grid = document.getElementById("grid");
const tabs = document.getElementById("tabs");
const search = document.getElementById("search");

let activeCat = "all";
let query = "";

// ---- category tabs ----------------------------------------
function buildTabs() {
  const all = { all: { label: "All", color: "#4b6fa5", icon: "☰" }, ...CATEGORIES };
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
      <div class="card-inner">
        <div class="face front">
          <span class="badge">${cat.icon} ${cat.label}</span>
          <h2>${t.name}</h2>
          ${t.root ? `<span class="root">${t.root}</span>` : ""}
          <span class="flip-hint">tap to flip ↻</span>
        </div>
        <div class="face back">
          <h3>${t.name}</h3>
          <p><b>How</b> ${t.how}</p>
          <p><b>Positive</b> ${t.positive}</p>
          <p><b>Indicates</b> ${t.indicates}</p>
          <p><b>Associated</b> ${t.conditions}</p>
          <button class="view3d">▶ View in 3D</button>
        </div>
      </div>`;

    // flip on tap (but not when pressing the 3D button)
    card.querySelector(".card-inner").onclick = (e) => {
      if (e.target.closest(".view3d")) return;
      card.classList.toggle("flipped");
    };
    card.querySelector(".view3d").onclick = (e) => {
      e.stopPropagation();
      openViewer(t);
    };
    grid.appendChild(card);
  }
}

// ---- 3D modal ---------------------------------------------
let viewer = null;
const modal = document.getElementById("modal");
const stage = document.getElementById("stage");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");

async function openViewer(t) {
  modalTitle.textContent = t.name;
  modalDesc.innerHTML =
    `<b>How:</b> ${t.how}<br><b>Positive:</b> ${t.positive}`;
  modal.classList.add("open");
  try {
    if (!viewer) {
      const mod = await import("./viewer.js");
      viewer = mod.createViewer(stage);
    }
    requestAnimationFrame(() => { viewer.resize(); viewer.show(t); });
  } catch (err) {
    stage.innerHTML =
      `<p style="padding:24px;color:#9aa7bd;text-align:center">
         3D view needs an internet connection the first time (to load the
         graphics library). Connect once and reopen — it works offline after that.
       </p>`;
  }
}
document.getElementById("modal-close").onclick = () => modal.classList.remove("open");
modal.onclick = (e) => { if (e.target === modal) modal.classList.remove("open"); };

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
