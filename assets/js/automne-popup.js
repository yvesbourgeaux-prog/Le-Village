(() => {
  if (!['/', '/le-village-restaurant-haut-de-cagnes-sur-mer', '/le-village-restaurant-haut-de-cagnes-sur-mer.html'].includes(location.pathname)) return;
  if (new Date() > new Date('2026-11-01T00:00:00+01:00')) return;
  const key = 'lv-autumn-popup-2026';
  try { if (localStorage.getItem(key)) return; } catch (_) {}
  const dialog = document.createElement('dialog');
  dialog.className = 'lv-autumn-dialog';
  dialog.setAttribute('aria-labelledby', 'lv-autumn-title');
  dialog.innerHTML = `<div class="lv-autumn-card"><div class="lv-autumn-visual"><img class="lv-autumn-photo" src="/assets/images/automne-popup.webp" alt="Le Haut-de-Cagnes aux couleurs de l’automne, avec le logo Le Grimaldi x Le Village"/></div><button class="lv-autumn-close" type="button" aria-label="Fermer cette fenêtre">×</button><div class="lv-autumn-copy"><p class="lv-autumn-eyebrow">Tout le mois d’octobre</p><h2 id="lv-autumn-title">Le Haut-de-Cagnes aux couleurs d’Automne</h2><p class="lv-autumn-quote">Venez flâner au cœur des décors d’automne et d’Halloween du Haut-de-Cagnes. Puis prolongez l’instant autour d’une table chaleureuse au Village, sur la place du Château.</p><div class="lv-autumn-actions"><a class="lv-autumn-book" href="/reserver">Réserver une table</a><a class="lv-autumn-event" href="/automne-halloween-haut-de-cagnes">Découvrir l’événement</a></div></div></div>`;
  document.body.append(dialog);
  let initiated = false;
  const close = () => { dialog.close(); try { localStorage.setItem(key, String(Date.now())); } catch (_) {} };
  dialog.querySelector('button').addEventListener('click', close);
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  dialog.addEventListener('close', () => { try { localStorage.setItem(key, String(Date.now())); } catch (_) {} });
  const onScroll = () => {
    if (initiated || window.scrollY < 100) return;
    initiated = true;
    window.removeEventListener('scroll', onScroll);
    window.setTimeout(tryOpen, 1600);
  };
  const tryOpen = () => {
    if (document.querySelector('.lv-consent:not([hidden]),.booking-dialog[open],dialog[open]') || document.hidden) {
      window.addEventListener('lv:consent', () => window.setTimeout(tryOpen, 1600), { once: true });
      return;
    }
    dialog.showModal();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
