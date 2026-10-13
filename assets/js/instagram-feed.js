(() => {
  const grid = document.getElementById('village-instagram-grid');
  if (!grid) return;
  const label = document.getElementById('village-instagram-status');
  const lang = document.documentElement.lang || 'fr';
  const english = !lang.startsWith('fr');
  const failure = () => {
    if (label) label.textContent = english ? 'See our latest posts on Instagram.' : 'Retrouvez nos dernières publications sur Instagram.';
  };
  fetch('/instagram-feed.php?v=2', { credentials: 'omit', cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error('Feed unavailable'); return response.json(); })
    .then(data => {
      grid.dataset.feedState = data.state || 'unknown';
      grid.dataset.received = String(data.received || 0);
      if (!Array.isArray(data.posts) || !data.posts.length) { failure(); return; }
      const fragment = document.createDocumentFragment();
      data.posts.slice(0, 8).forEach((post, index) => {
        if (typeof post.image !== 'string' || typeof post.url !== 'string') return;
        const link = document.createElement('a');
        link.className = 'village-instagram-post';
        link.href = post.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', (english ? 'Instagram post ' : 'Publication Instagram ') + (index + 1));
        const img = document.createElement('img');
        img.src = post.image;
        img.alt = typeof post.caption === 'string' && post.caption ? post.caption : (english ? 'Restaurant Le Village on Instagram' : 'Le Village sur Instagram');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.referrerPolicy = 'no-referrer';
        link.appendChild(img);
        if (post.type === 'video') {
          const badge = document.createElement('span');
          badge.className = 'village-instagram-video';
          badge.textContent = '▶';
          badge.setAttribute('aria-hidden', 'true');
          link.appendChild(badge);
        }
        fragment.appendChild(link);
      });
      grid.replaceChildren(fragment);
      if (!grid.children.length) failure();
      else if (label) label.remove();
    })
    .catch(() => { grid.dataset.feedState = 'network'; failure(); });
})();
