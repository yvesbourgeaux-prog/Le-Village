(() => {
  const supported = ["fr","en","sv","da","nl","de","it","es","ja","zh-CN","nb","ru","pl"];
  const localeMatch = location.pathname.match(/^\/(en|sv|da|nl|de|it|es|ja|zh-CN|nb|ru|pl)(?=\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'fr';
  const route = (localeMatch ? location.pathname.slice(localeMatch[0].length) : location.pathname).replace(/\/$/, '') || '/';
  if (!['/', '/index', '/index.html', '/le-village-restaurant-haut-de-cagnes-sur-mer', '/le-village-restaurant-haut-de-cagnes-sur-mer.html'].includes(route)) return;
  const messages = {
  "fr": {
    "eyebrow": "31 octobre · 19h · Ouvert à tous",
    "title": "Halloween au Haut-de-Cagnes",
    "description": "Tout au long d’octobre, venez flâner dans les ruelles décorées. Le 31 octobre à 19h, partageons une soupe de citrouilles offerte à tous sur la place du Château, parmi les citrouilles illuminées. Habitants et visiteurs, tout le monde est le bienvenu !",
    "book": "Réserver une table",
    "event": "Voir le programme",
    "close": "Fermer cette fenêtre",
    "alt": "Affiche de la soirée Halloween du 31 octobre à 19h, place du Château au Haut-de-Cagnes : soupe de citrouilles offerte à tous."
  },
  "en": {
    "eyebrow": "31 October · 7pm · Everyone welcome",
    "title": "Halloween in Haut-de-Cagnes",
    "description": "Throughout October, stroll through the decorated lanes. On 31 October at 7pm, share free pumpkin soup on Place du Château among the glowing pumpkins. Residents and visitors are all welcome!",
    "book": "Book a table",
    "event": "See the programme",
    "close": "Close this window",
    "alt": "Poster for Halloween on 31 October at 7pm, Place du Château in Haut-de-Cagnes: free pumpkin soup for everyone."
  },
  "sv": {
    "eyebrow": "31 oktober · Kl. 19 · Alla är välkomna",
    "title": "Halloween i Haut-de-Cagnes",
    "description": "Hela oktober kan du promenera genom de dekorerade gränderna. Den 31 oktober kl. 19 bjuder vi på pumpasoppa på Place du Château bland lysande pumpor. Invånare och besökare är alla välkomna!",
    "book": "Boka bord",
    "event": "Se programmet",
    "close": "Stäng fönstret",
    "alt": "Affisch för Halloween den 31 oktober kl. 19 på Place du Château i Haut-de-Cagnes: gratis pumpasoppa för alla."
  },
  "da": {
    "eyebrow": "31. oktober · Kl. 19 · Alle er velkomne",
    "title": "Halloween i Haut-de-Cagnes",
    "description": "Hele oktober kan du gå en tur i de pyntede gyder. Den 31. oktober kl. 19 deler vi gratis græskarsuppe på Place du Château blandt lysende græskar. Beboere og besøgende er alle velkomne!",
    "book": "Book et bord",
    "event": "Se programmet",
    "close": "Luk vinduet",
    "alt": "Halloweenplakat for 31. oktober kl. 19 på Place du Château i Haut-de-Cagnes: gratis græskarsuppe til alle."
  },
  "nl": {
    "eyebrow": "31 oktober · 19 uur · Iedereen welkom",
    "title": "Halloween in Haut-de-Cagnes",
    "description": "Wandel de hele maand oktober door de versierde straatjes. Op 31 oktober om 19 uur delen we gratis pompoensoep op Place du Château tussen verlichte pompoenen. Bewoners en bezoekers zijn allemaal welkom!",
    "book": "Reserveer een tafel",
    "event": "Bekijk het programma",
    "close": "Sluit dit venster",
    "alt": "Halloweenposter voor 31 oktober om 19 uur, Place du Château in Haut-de-Cagnes: gratis pompoensoep voor iedereen."
  },
  "de": {
    "eyebrow": "31. Oktober · 19 Uhr · Alle sind willkommen",
    "title": "Halloween in Haut-de-Cagnes",
    "description": "Spazieren Sie den ganzen Oktober durch die geschmückten Gassen. Am 31. Oktober um 19 Uhr gibt es kostenlose Kürbissuppe auf der Place du Château zwischen leuchtenden Kürbissen. Bewohner und Besucher sind alle willkommen!",
    "book": "Tisch reservieren",
    "event": "Programm ansehen",
    "close": "Fenster schließen",
    "alt": "Halloween-Plakat für den 31. Oktober um 19 Uhr, Place du Château in Haut-de-Cagnes: kostenlose Kürbissuppe für alle."
  },
  "it": {
    "eyebrow": "31 ottobre · Ore 19 · Aperto a tutti",
    "title": "Halloween a Haut-de-Cagnes",
    "description": "Per tutto ottobre, passeggiate tra i vicoli decorati. Il 31 ottobre alle 19, condividiamo una zuppa di zucca gratuita in Place du Château tra le zucche illuminate. Abitanti e visitatori, siete tutti benvenuti!",
    "book": "Prenota un tavolo",
    "event": "Scopri il programma",
    "close": "Chiudi questa finestra",
    "alt": "Locandina di Halloween del 31 ottobre alle 19 in Place du Château a Haut-de-Cagnes: zuppa di zucca offerta a tutti."
  },
  "es": {
    "eyebrow": "31 de octubre · 19 h · Abierto a todos",
    "title": "Halloween en Haut-de-Cagnes",
    "description": "Durante todo octubre, pasea por las callejuelas decoradas. El 31 de octubre a las 19 h, comparte una sopa de calabaza gratis en la Place du Château, entre calabazas iluminadas. ¡Vecinos y visitantes, todos son bienvenidos!",
    "book": "Reservar mesa",
    "event": "Ver el programa",
    "close": "Cerrar esta ventana",
    "alt": "Cartel de Halloween del 31 de octubre a las 19 h en la Place du Château de Haut-de-Cagnes: sopa de calabaza gratis para todos."
  },
  "ja": {
    "eyebrow": "10月31日 · 19時 · どなたも歓迎",
    "title": "Haut-de-Cagnesのハロウィン",
    "description": "10月いっぱい、装飾された路地を散策できます。10月31日19時、灯るかぼちゃに囲まれたPlace du Châteauで無料のかぼちゃスープを楽しみましょう。住民も旅行者も、どなたも歓迎です！",
    "book": "テーブルを予約",
    "event": "プログラムを見る",
    "close": "ウィンドウを閉じる",
    "alt": "10月31日19時、Haut-de-CagnesのPlace du Châteauで開かれるハロウィンのポスター。無料かぼちゃスープをどなたにも提供。"
  },
  "zh-CN": {
    "eyebrow": "10月31日 · 19时 · 欢迎所有人",
    "title": "Haut-de-Cagnes万圣节",
    "description": "整个十月，都可以漫步装饰中的小巷。10月31日19时，在Place du Château的南瓜灯之间共享免费南瓜汤。居民和游客，欢迎所有人参加！",
    "book": "预订餐桌",
    "event": "查看活动安排",
    "close": "关闭窗口",
    "alt": "万圣节海报：10月31日19时，Haut-de-Cagnes的Place du Château，免费南瓜汤，所有人均可参加。"
  },
  "nb": {
    "eyebrow": "31. oktober · Kl. 19 · Alle er velkomne",
    "title": "Halloween i Haut-de-Cagnes",
    "description": "Hele oktober kan du rusle gjennom de pyntede smugene. Den 31. oktober kl. 19 deler vi gratis gresskarsuppe på Place du Château blant lysende gresskar. Innbyggere og besøkende er alle velkomne!",
    "book": "Reserver bord",
    "event": "Se programmet",
    "close": "Lukk vinduet",
    "alt": "Halloweenplakat for 31. oktober kl. 19 på Place du Château i Haut-de-Cagnes: gratis gresskarsuppe til alle."
  },
  "ru": {
    "eyebrow": "31 октября · 19:00 · Приглашаются все",
    "title": "Хэллоуин в Haut-de-Cagnes",
    "description": "Весь октябрь гуляйте по украшенным улочкам. 31 октября в 19:00 угощаем бесплатным тыквенным супом на Place du Château среди светящихся тыкв. Жители и гости — приглашаются все!",
    "book": "Забронировать столик",
    "event": "Посмотреть программу",
    "close": "Закрыть окно",
    "alt": "Афиша Хэллоуина 31 октября в 19:00 на Place du Château в Haut-de-Cagnes: бесплатный тыквенный суп для всех."
  },
  "pl": {
    "eyebrow": "31 października · 19:00 · Wszyscy mile widziani",
    "title": "Halloween w Haut-de-Cagnes",
    "description": "Przez cały październik spaceruj udekorowanymi uliczkami. 31 października o 19:00 zapraszamy na darmową zupę dyniową na Place du Château wśród rozświetlonych dyń. Mieszkańcy i goście, wszyscy są mile widziani!",
    "book": "Zarezerwuj stolik",
    "event": "Zobacz program",
    "close": "Zamknij okno",
    "alt": "Plakat Halloween 31 października o 19:00 na Place du Château w Haut-de-Cagnes: darmowa zupa dyniowa dla wszystkich."
  }
};
  const endsAt = new Date('2026-11-01T00:00:00+01:00').getTime();
  if (Date.now() >= endsAt) return;
  const key = 'lv-halloween-soup-20261027-v1';
  // A new campaign resets the previous once-only dismissal for every visitor.
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
  let views = { day, count: 0, last: 0 };
  try {
    localStorage.removeItem('lv-autumn-popup-2026');
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.day === day && Number.isFinite(saved.count) && Number.isFinite(saved.last)) views = saved;
    if (views.count >= 3 || Date.now() - views.last < 20 * 60 * 1000) return;
  } catch (_) {}
  const dialog = document.createElement('dialog');
  dialog.className = 'lv-autumn-dialog';
  dialog.setAttribute('aria-labelledby', 'lv-autumn-title');
  dialog.innerHTML = `<div class="lv-autumn-card"><div class="lv-autumn-visual"><img class="lv-autumn-photo" src="/assets/images/halloween-31-octobre-2026.webp" alt="Le Haut-de-Cagnes aux couleurs de l’automne, avec le logo Le Grimaldi x Le Village"/></div><button class="lv-autumn-close" type="button" aria-label="Fermer cette fenêtre">×</button><div class="lv-autumn-copy"><p class="lv-autumn-eyebrow">Tout le mois d’octobre</p><h2 id="lv-autumn-title">Le Haut-de-Cagnes aux couleurs d’Automne</h2><p class="lv-autumn-quote">Venez flâner au cœur des décors d’automne et d’Halloween du Haut-de-Cagnes. Puis prolongez l’instant autour d’une table chaleureuse au Village, sur la place du Château.</p><div class="lv-autumn-actions"><a class="lv-autumn-book" href="/reserver">Réserver une table</a><a class="lv-autumn-event" href="/halloween-31-octobre-haut-de-cagnes-soupe-citrouille">Découvrir l’événement</a></div></div></div>`;
  const copy = messages[supported.includes(locale) ? locale : 'en'];
  dialog.lang = locale;
  dialog.querySelector('.lv-autumn-photo').alt = copy.alt;
  dialog.querySelector('.lv-autumn-close').setAttribute('aria-label', copy.close);
  dialog.querySelector('.lv-autumn-eyebrow').textContent = copy.eyebrow;
  dialog.querySelector('#lv-autumn-title').textContent = copy.title;
  dialog.querySelector('.lv-autumn-quote').textContent = copy.description;
  const prefix = locale === 'fr' ? '' : '/' + locale;
  const booking = dialog.querySelector('.lv-autumn-book');
  booking.textContent = copy.book;
  booking.href = prefix + '/reserver';
  const event = dialog.querySelector('.lv-autumn-event');
  event.textContent = copy.event;
  event.href = prefix + '/halloween-31-octobre-haut-de-cagnes-soupe-citrouille';
  document.body.append(dialog);
  let initiated = false;
  let expiryTimer = null;
  const clearTheme = () => {
    document.body.classList.remove('lv-halloween-active');
    if (expiryTimer !== null) window.clearTimeout(expiryTimer);
    expiryTimer = null;
  };
  const close = () => { clearTheme(); dialog.close(); };
  dialog.querySelector('button').addEventListener('click', close);
  booking.addEventListener('click', close);
  event.addEventListener('click', close);
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  dialog.addEventListener('cancel', clearTheme);
  dialog.addEventListener('close', clearTheme);
  window.addEventListener('pagehide', clearTheme);
  window.addEventListener('pageshow', () => {
    if (dialog.open && Date.now() < endsAt) document.body.classList.add('lv-halloween-active');
    else clearTheme();
  });
  const onScroll = () => {
    if (initiated || window.scrollY < 100) return;
    initiated = true;
    window.removeEventListener('scroll', onScroll);
    window.setTimeout(tryOpen, 1600);
  };
  const tryOpen = () => {
    if (dialog.open || Date.now() >= endsAt) return;
    if (document.querySelector('.lv-consent:not([hidden]),.booking-dialog[open],dialog[open]') || document.hidden) {
      window.setTimeout(tryOpen, 4000);
      return;
    }
    dialog.showModal();
    views.count += 1;
    views.last = Date.now();
    try { localStorage.setItem(key, JSON.stringify(views)); } catch (_) {}
    document.body.classList.add('lv-halloween-active');
    expiryTimer = window.setTimeout(close, Math.max(0, endsAt - Date.now()));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  // Also reach visitors who remain above the fold after choosing their cookies.
  window.setTimeout(() => { if (!initiated) { initiated = true; window.removeEventListener('scroll', onScroll); tryOpen(); } }, 6500);
})();
