// bookmarks.js
const Bookmarks = {
  KEY: 'nr_bookmarks',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY))||[]; } catch { return []; } },
  toggle(article) {
    let bms = this.get();
    const idx = bms.findIndex(b => b.url === article.url);
    if (idx >= 0) { bms.splice(idx, 1); showToast('Removed from Read Later'); }
    else { bms.unshift({ ...article, savedAt: Date.now() }); showToast('Saved to Read Later 🔖'); }
    localStorage.setItem(this.KEY, JSON.stringify(bms.slice(0,50)));
    this.updateCount();
    this.renderSidebar();
    return idx < 0;
  },
  has(url) { return this.get().some(b => b.url === url); },
  updateCount() {
    document.getElementById('bookmarkCount').textContent = this.get().length;
  },
  renderSidebar() {
    const list = document.getElementById('bookmarksList');
    const bms = this.get();
    if (!bms.length) { list.innerHTML = '<p style="color:var(--text2);font-size:.85rem">Nothing saved yet</p>'; return; }
    list.innerHTML = bms.map(b => `
      <div class="bm-item">
        <div class="bm-title" onclick="window.open('${b.url}','_blank')">${b.title}</div>
        <div class="bm-meta">
          <span>${b.source?.name || 'Unknown'} · ${ReadTime.estimate(b.description||'')} min read</span>
          <button class="bm-remove" onclick="Bookmarks.toggle({url:'${b.url}',title:'${(b.title||'').replace(/'/g,'\\'')}',source:${JSON.stringify(b.source||{})}})">Remove</button>
        </div>
      </div>`).join('');
  }
};
