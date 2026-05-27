# BuildStock — Construction Equipment Inventory Manager

A Progressive Web App (PWA) for managing construction equipment inventory, recording sales by employee, and getting AI-powered insights.

---

## How to Install (No App Store Needed)

### iPhone / iPad
1. Open **Safari** and go to your hosted URL (or localhost)
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add** — done!

### Samsung / Android
1. Open **Chrome** and go to your URL
2. Tap the **⋮ menu** → **"Install app"** or **"Add to Home Screen"**
3. Done!

### Desktop (Chrome / Edge)
1. Open your URL in Chrome or Edge
2. Click the **install icon** (⊕) in the address bar, or go to the browser menu → **"Install BuildStock"**
3. Done!

---

## Host on GitHub Pages

1. Create a new GitHub repository (e.g. `buildstock`)
2. Upload all files from this folder to the repository root
3. Go to **Settings → Pages**
4. Under **Source**, select `Deploy from a branch` → `main` → `/ (root)` → Save
5. Your app will be live at `https://YOUR-USERNAME.github.io/buildstock/`

---

## Run Locally

```bash
# Python 3
python3 -m http.server 8080

# Node.js (if you have npx)
npx serve .
```

Then open: `http://localhost:8080`

---

## Features

- **Dashboard** — revenue, profit, inventory value, low-stock alerts, top products chart
- **Products** — full CRUD (add, edit, remove), category badges, stock status
- **Record Sale** — pick product + employee, live profit preview, auto stock deduction
- **Sales History** — full log with employee, product, revenue, profit, margin
- **Employees** — add/edit/remove staff, see each person's sales count, revenue & profit
- **AI Assistant** — powered by Claude with live access to your data

---

## Tech Stack

- Vanilla HTML/CSS/JavaScript (no build step needed)
- PWA with Service Worker (works offline after first load)
- localStorage for data persistence
- Anthropic Claude API for AI features

---

## File Structure

```
buildstock/
├── index.html          # Main app shell
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline support)
├── css/
│   └── style.css       # All styles
├── js/
│   ├── data.js         # Data layer + localStorage
│   └── app.js          # App logic + page rendering
├── icons/
│   ├── icon-192.png    # PWA icon (small)
│   └── icon-512.png    # PWA icon (large)
└── README.md           # This file
```
