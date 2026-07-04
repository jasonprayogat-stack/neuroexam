# NeuroExam — Pocket Guide

A light, installable (PWA) pocket guide to the neurological examination:
flip cards for each test + an interactive 3D model you can rotate.

> ⚕️ **Study aid only.** Content is drafted from *Bates' Guide to Physical
> Examination and History Taking*. **Verify every card against the current
> edition before any clinical use.** The 3D figures are stylized teaching
> models, not anatomically exact.

---

## What's inside

| File | What it does |
|------|--------------|
| `index.html` | The page shell |
| `styles.css` | All styling |
| `data.js` | **The test content** — edit here to add/fix tests |
| `app.js` | Builds the cards, tabs, search, and 3D modal |
| `viewer.js` | The 3D scene + animations (Three.js) |
| `manifest.json`, `sw.js`, `icons/` | Makes it installable + offline |
| `server.ps1` | A tiny local server for testing on this PC |

## Run it on this computer (to test)

Double-click **`server.ps1`** → *Run with PowerShell*
(or in a terminal: `./server.ps1`), then open **http://localhost:8080/**

The first time you open a 3D view you need internet (it downloads the
graphics library once); after that it works offline.

## Put it on your phone (recommended)

Because it's just static files, you can host it **free**:

1. Make a free account at **Netlify** (netlify.com) or **GitHub Pages**.
2. Drag this whole folder into Netlify's "deploy" box (or push to GitHub).
3. Open the link it gives you on your phone's browser.
4. In the browser menu, choose **"Add to Home Screen"** — now it behaves
   like an app icon, full screen, works offline.

## Add or edit a test

Open `data.js` and copy one of the entries in the `TESTS` list. Fill in the
fields (`name`, `how`, `positive`, `indicates`, `conditions`). Set `anim` to
one of the existing animation names in `viewer.js` (e.g. `"knee"`, `"slr"`,
`"neck"`) — or ask Claude to build a new animation for it.

## Next ideas (for later)

- Quiz / self-test mode
- Favourites & "recently viewed"
- More tests (cranial nerves, cerebellar signs, gait)
- Nicer 3D models (can swap in licensed `.glb` files into `viewer.js`)
- Monetization: the app is already structured so a "Pro" tier (extra tests,
  quiz) could be gated later.
