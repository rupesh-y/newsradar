# 📡 NewsRadar — Personalized News Aggregator

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![NewsAPI](https://img.shields.io/badge/NewsAPI-dc2626?style=flat)
![License](https://img.shields.io/badge/License-MIT-green)

> A clean, magazine-style news aggregator with real-time search, category filters, read-later bookmarks, reading time estimates, and infinite scroll — no frameworks, just vanilla JS.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📰 Multi-Category News | Top, Tech, Business, Science, Health, Sports, Entertainment |
| 🔍 Live Search | Debounced full-text search with keyword highlighting |
| 🔖 Read Later | Bookmark articles to a persistent sidebar |
| ⏱️ Reading Time | Auto-estimated read time per article |
| 🌍 Country Filter | Switch between US, UK, India, Australia, Canada |
| ♾️ Infinite Scroll | IntersectionObserver-based auto-pagination |
| 📋 Read History | Fades articles you've already opened |
| 🌙 Dark Mode | Full OLED-optimized dark theme |
| 💀 Skeleton Loaders | Shimmer placeholders while content loads |

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/newsradar.git
cd newsradar
```

### 2. Get your free API key
- Go to [newsapi.org](https://newsapi.org/)
- Click **Get API Key** → Sign up (free)
- Copy your API key from the dashboard

### 3. Add your key
Open `js/app.js` and replace:
```javascript
const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';
```

### 4. Open in browser
```bash
open index.html
# or use VS Code Live Server (recommended)
```

> ⚠️ **Localhost only:** NewsAPI free tier only works on `localhost`. Use Live Server or similar.

---

## 📁 Project Structure

```
newsradar/
├── index.html
├── css/
│   └── main.css          # All styles — typography, grid, dark mode, skeletons
├── js/
│   ├── app.js            # Main controller — fetch, render, events
│   ├── bookmarks.js      # Read-later system with sidebar
│   ├── search.js         # Search filter + keyword highlight
│   └── readtime.js       # Reading time estimator (200 wpm)
└── README.md
```

---

## 🔑 API Used

| API | Key Required | Free Tier |
|---|---|---|
| [NewsAPI](https://newsapi.org/) | ✅ Free | 100 requests/day on localhost |

---

## 🛠️ Technical Highlights

- **IntersectionObserver** — efficient infinite scroll with 300px root margin
- **Debounced search** — 400ms delay prevents excessive API calls
- **Keyword highlighting** — `RegExp` with `gi` flags marks matched terms in titles
- **`Intl.RelativeTimeFormat`-style** — human-readable timestamps ("2h ago")
- **Skeleton loaders** — shimmer animation during API fetch
- **Read tracking** — localStorage stores visited URLs, fades read cards
- **CSS Grid** — `repeat(3, 1fr)` responsive layout, collapses on mobile

---

## 🌐 Deploy

```bash
# GitHub Pages
# Settings → Pages → Source: main / root
# ⚠️ Note: NewsAPI free tier blocks non-localhost in browser
# For deployment, you need a backend proxy (Node.js/Express)

# Recommended for demo: run locally with Live Server
```

### Backend Proxy (for deployment)
```javascript
// server.js (Node.js + Express)
app.get('/news', async (req, res) => {
  const url = `https://newsapi.org/v2/top-headlines?${new URLSearchParams(req.query)}&apiKey=${process.env.NEWS_API_KEY}`;
  const data = await fetch(url).then(r => r.json());
  res.json(data);
});
```

---

## 📄 License

MIT License

---

## 👤 Author

Built as part of an internship mini project.  
⭐ Star the repo if you liked it!
