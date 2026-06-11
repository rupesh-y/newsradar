// search.js
const Search = {
  highlight(text, query) {
    if (!query || !text) return text || '';
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },
  filter(articles, query) {
    if (!query) return articles;
    const q = query.toLowerCase();
    return articles.filter(a =>
      (a.title || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.source?.name || '').toLowerCase().includes(q)
    );
  }
};

// readtime.js
const ReadTime = {
  estimate(text) {
    const words = (text || '').trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }
};
