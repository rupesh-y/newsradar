// =====================================================
// app.js — NewsRadar Main Controller
// Get a free API key at: https://newsapi.org/
// =====================================================

const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';
const NEWS_BASE    = 'https://newsapi.org/v2';

let allArticles = [];
let page = 1;
let isLoading = false;
let currentCategory = 'general';
let currentCountry  = 'us';
let currentSort     = 'publishedAt';
let searchQuery     = '';
let debounceTimer;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2500);
}

function relativeTime(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function showSkeletons() {
  const skels = document.getElementById('skeletons');
  skels.innerHTML = Array(6).fill(`
    <div class="sk-card">
      <div class="skeleton sk-img"></div>
      <div class="skeleton sk-line"></div>
      <div class="skeleton sk-line short"></div>
    </div>`).join('');
}
function hideSkeletons() { document.getElementById('skeletons').innerHTML = ''; }

async function fetchArticles(reset = false) {
  if (isLoading) return;
  isLoading = true;
  if (reset) { page = 1; allArticles = []; document.getElementById('articlesGrid').innerHTML = ''; document.getElementById('heroArticle').innerHTML = ''; }

  showSkeletons();
  try {
    let url;
    if (searchQuery) {
      url = `${NEWS_BASE}/everything?q=${encodeURIComponent(searchQuery)}&sortBy=${currentSort}&page=${page}&pageSize=12&apiKey=${NEWS_API_KEY}`;
    } else {
      url = `${NEWS_BASE}/top-headlines?country=${currentCountry}&category=${currentCategory}&page=${page}&pageSize=12&apiKey=${NEWS_API_KEY}`;
    }
    const res  = await fetch(url);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.message || 'API Error');

    const articles = (data.articles || []).filter(a => a.title && a.title !== '[Removed]');
    allArticles = [...allArticles, ...articles];
    document.getElementById('articleCount').textContent = `${data.totalResults?.toLocaleString() || 0} articles`;

    hideSkeletons();
    renderArticles(articles, reset);
    page++;
  } catch(e) {
    hideSkeletons();
    if (e.message.includes('apiKey') || e.message.includes('401')) {
      document.getElementById('articlesGrid').innerHTML = `
        <div style="grid-column:1/4;padding:40px;text-align:center;color:var(--text2)">
          <div style="font-size:3rem;margin-bottom:12px">🗝️</div>
          <h3>API Key Required</h3>
          <p>Open <code>js/app.js</code> and add your NewsAPI key.<br>
          Get a free key at <a href="https://newsapi.org" target="_blank" style="color:var(--accent)">newsapi.org</a></p>
        </div>`;
    } else {
      showToast('Failed to load news. Try again.');
    }
  } finally {
    isLoading = false;
  }
}

function renderArticles(articles, reset) {
  const filtered = Search.filter(articles, searchQuery);
  const grid = document.getElementById('articlesGrid');
  const hero = document.getElementById('heroArticle');

  if (reset && filtered.length > 0 && !searchQuery) {
    const [first, ...rest] = filtered;
    hero.innerHTML = buildHeroCard(first);
    renderGrid(rest, grid, false);
  } else {
    renderGrid(filtered, grid, !reset);
  }
}

function buildHeroCard(a) {
  const rt = ReadTime.estimate((a.description||'') + (a.content||''));
  const bm = Bookmarks.has(a.url) ? 'bookmarked' : '';
  const img = a.urlToImage
    ? `<img class="hero-img" src="${a.urlToImage}" alt="${a.title}" onerror="this.outerHTML='<div class=hero-img-placeholder>📰</div>'">`
    : `<div class="hero-img-placeholder">📰</div>`;
  return `
    <div>${img}</div>
    <div>
      <div class="hero-source">${a.source?.name || 'Unknown'}</div>
      <h2 class="hero-title" onclick="window.open('${a.url}','_blank')">${a.title}</h2>
      <p class="hero-desc">${a.description || ''}</p>
      <div class="article-meta">
        <span>${relativeTime(a.publishedAt)}</span>
        <span class="read-time-badge">~${rt} min read</span>
      </div>
      <button class="bookmark-btn ${bm}" onclick='toggleBookmark(${JSON.stringify({url:a.url,title:a.title,description:a.description,urlToImage:a.urlToImage,source:a.source,publishedAt:a.publishedAt}).replace(/'/g,"\\'")})'>${bm ? '🔖 Saved' : '🔖 Save'}</button>
    </div>`;
}

function renderGrid(articles, container, append) {
  const html = articles.map(a => buildCard(a)).join('');
  if (append) container.innerHTML += html;
  else container.innerHTML = html;
}

function buildCard(a) {
  const rt = ReadTime.estimate(a.description || '');
  const bm = Bookmarks.has(a.url);
  const title = Search.highlight(a.title || '', searchQuery);
  const img = a.urlToImage
    ? `<img class="card-img" src="${a.urlToImage}" alt="${a.title}" loading="lazy" onerror="this.outerHTML='<div class=card-img-placeholder>📰</div>'">`
    : `<div class="card-img-placeholder">📰</div>`;
  const readClass = isRead(a.url) ? 'read' : '';
  return `
    <div class="article-card ${readClass}" onclick="openArticle('${a.url.replace(/'/g,"\\'")}')">
      ${img}
      <div class="card-body">
        <div class="card-source">${a.source?.name || 'Unknown'}</div>
        <div class="card-title">${title}</div>
        <div class="card-meta">
          <span>${relativeTime(a.publishedAt)} · ~${rt}min</span>
          <button class="card-bookmark ${bm?'bookmarked':''}"
            onclick='event.stopPropagation();handleCardBookmark(${JSON.stringify({url:a.url,title:a.title,description:a.description,source:a.source}).replace(/'/g,"\\'")},this)'>${bm?'🔖':'🏷️'}</button>
        </div>
      </div>
    </div>`;
}

// Read tracking
const READ_KEY = 'nr_read';
function markRead(url) {
  const reads = JSON.parse(localStorage.getItem(READ_KEY)||'[]');
  if (!reads.includes(url)) { reads.unshift(url); localStorage.setItem(READ_KEY, JSON.stringify(reads.slice(0,200))); }
}
function isRead(url) {
  return (JSON.parse(localStorage.getItem(READ_KEY)||'[]')).includes(url);
}

function openArticle(url) {
  markRead(url);
  window.open(url, '_blank');
}

function handleCardBookmark(article, btn) {
  const isNow = Bookmarks.toggle(article);
  btn.textContent = isNow ? '🔖' : '🏷️';
  btn.classList.toggle('bookmarked', isNow);
}

function toggleBookmark(article) {
  Bookmarks.toggle(article);
}

// Infinite Scroll
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting && !isLoading) fetchArticles(false);
}, { rootMargin: '300px' });
observer.observe(document.getElementById('scrollSentinel'));

// Category buttons
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    fetchArticles(true);
  });
});

// Country select
document.getElementById('countrySelect').addEventListener('change', e => {
  currentCountry = e.target.value;
  fetchArticles(true);
});

// Sort buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    fetchArticles(true);
  });
});

// Search
document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value.trim();
  document.getElementById('clearSearch').classList.toggle('hidden', !searchQuery);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => fetchArticles(true), 400);
});
document.getElementById('clearSearch').addEventListener('click', () => {
  searchQuery = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearch').classList.add('hidden');
  fetchArticles(true);
});

// Bookmarks sidebar
document.getElementById('bookmarksBtn').addEventListener('click', () => {
  document.getElementById('bookmarksSidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('hidden');
  Bookmarks.renderSidebar();
});
document.getElementById('closeSidebar').addEventListener('click', () => {
  document.getElementById('bookmarksSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('bookmarksSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.add('hidden');
});

// Theme
document.getElementById('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  document.getElementById('themeBtn').textContent =
    document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Init
Bookmarks.updateCount();
fetchArticles(true);
