(() => {
  const supported = ["fr","en","sv","da","nl","de","it","es","ja","zh-CN","nb","ru","pl"];
  const localeMatch = location.pathname.match(/^\/(en|sv|da|nl|de|it|es|ja|zh-CN|nb|ru|pl)(?=\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'fr';
  const route = (localeMatch ? location.pathname.slice(localeMatch[0].length) : location.pathname).replace(/\/$/, '') || '/';
  if (!['/', '/index', '/index.html', '/le-village-restaurant-haut-de-cagnes-sur-mer', '/le-village-restaurant-haut-de-cagnes-sur-mer.html'].includes(route)) return;
  const messages = {
  "fr": {
    "eyebrow": "Tout le mois d’octobre",
    "title": "Le Haut-de-Cagnes aux couleurs d’Automne",
    "description": "Venez flâner au cœur des décors d’automne et d’Halloween du Haut-de-Cagnes. Puis prolongez l’instant autour d’une table chaleureuse au Village, sur la place du Château.",
    "book": "Réserver une table",
    "event": "Découvrir l’événement",
    "close": "Fermer cette fenêtre",
    "alt": "Décorations d’automne dans le Haut-de-Cagnes, avec le logo Le Grimaldi x Le Village"
  },
  "en": {
    "eyebrow": "Throughout October",
    "title": "Haut-de-Cagnes in autumn colours",
    "description": "Stroll among the autumn and Halloween decorations in Haut-de-Cagnes, then linger over a welcoming meal at Le Village on Place du Château.",
    "book": "Book a table",
    "event": "Discover the event",
    "close": "Close this window",
    "alt": "Autumn decorations in Haut-de-Cagnes with the Le Grimaldi x Le Village logo"
  },
  "sv": {
    "eyebrow": "Hela oktober",
    "title": "Haut-de-Cagnes i höstens färger",
    "description": "Strosa bland höst- och halloweendekorationerna i Haut-de-Cagnes. Fortsätt sedan upplevelsen med en härlig måltid på Le Village vid Place du Château.",
    "book": "Boka bord",
    "event": "Upptäck evenemanget",
    "close": "Stäng fönstret",
    "alt": "Höstdekorationer i Haut-de-Cagnes med logotypen Le Grimaldi x Le Village"
  },
  "da": {
    "eyebrow": "Hele oktober",
    "title": "Haut-de-Cagnes i efterårets farver",
    "description": "Gå en tur blandt efterårs- og halloweenudsmykningerne i Haut-de-Cagnes. Fortsæt derefter oplevelsen med et hyggeligt måltid på Le Village på Place du Château.",
    "book": "Book et bord",
    "event": "Læs om begivenheden",
    "close": "Luk vinduet",
    "alt": "Efterårsudsmykning i Haut-de-Cagnes med logoet Le Grimaldi x Le Village"
  },
  "nl": {
    "eyebrow": "De hele maand oktober",
    "title": "Haut-de-Cagnes in herfstkleuren",
    "description": "Wandel langs de herfst- en halloweendecoraties in Haut-de-Cagnes. Geniet daarna van een gezellige maaltijd bij Le Village aan de Place du Château.",
    "book": "Reserveer een tafel",
    "event": "Ontdek het evenement",
    "close": "Sluit dit venster",
    "alt": "Herfstdecoraties in Haut-de-Cagnes met het logo Le Grimaldi x Le Village"
  },
  "de": {
    "eyebrow": "Den ganzen Oktober",
    "title": "Haut-de-Cagnes in Herbstfarben",
    "description": "Schlendern Sie durch die herbstlich und zu Halloween geschmückten Gassen von Haut-de-Cagnes. Genießen Sie anschließend ein gemütliches Essen im Le Village an der Place du Château.",
    "book": "Tisch reservieren",
    "event": "Veranstaltung entdecken",
    "close": "Fenster schließen",
    "alt": "Herbstdekorationen in Haut-de-Cagnes mit dem Logo Le Grimaldi x Le Village"
  },
  "it": {
    "eyebrow": "Per tutto ottobre",
    "title": "Haut-de-Cagnes si veste d’autunno",
    "description": "Passeggiate tra le decorazioni autunnali e di Halloween di Haut-de-Cagnes. Poi prolungate il momento con un pranzo o una cena in un’atmosfera accogliente al Village, in Place du Château.",
    "book": "Prenota un tavolo",
    "event": "Scopri l’evento",
    "close": "Chiudi questa finestra",
    "alt": "Decorazioni autunnali a Haut-de-Cagnes con il logo Le Grimaldi x Le Village"
  },
  "es": {
    "eyebrow": "Durante todo octubre",
    "title": "Haut-de-Cagnes se viste de otoño",
    "description": "Pasea entre los decorados de otoño y Halloween de Haut-de-Cagnes. Después, prolonga el momento con una comida en un ambiente acogedor en Le Village, en la Place du Château.",
    "book": "Reservar mesa",
    "event": "Descubrir el evento",
    "close": "Cerrar esta ventana",
    "alt": "Decoraciones de otoño en Haut-de-Cagnes con el logotipo Le Grimaldi x Le Village"
  },
  "ja": {
    "eyebrow": "10月いっぱい",
    "title": "秋色に染まるHaut-de-Cagnes",
    "description": "Haut-de-Cagnesの秋とハロウィンの装飾を眺めながら散策しませんか。その後は、シャトー広場のLe Villageで、温かな雰囲気の中ゆったりとお食事をお楽しみください。",
    "book": "テーブルを予約",
    "event": "イベントを見る",
    "close": "ウィンドウを閉じる",
    "alt": "秋の装飾が施されたHaut-de-Cagnesの風景とLe Grimaldi x Le Villageのロゴ"
  },
  "zh-CN": {
    "eyebrow": "整个十月",
    "title": "秋色中的 Haut-de-Cagnes",
    "description": "漫步于 Haut-de-Cagnes，欣赏秋季与万圣节主题装饰。随后来到城堡广场（Place du Château）的 Le Village，在温馨的氛围中享用美食，延续这份美好时光。",
    "book": "预订餐桌",
    "event": "了解活动",
    "close": "关闭窗口",
    "alt": "Haut-de-Cagnes 的秋季装饰与 Le Grimaldi x Le Village 标志"
  },
  "nb": {
    "eyebrow": "Hele oktober",
    "title": "Haut-de-Cagnes i høstfarger",
    "description": "Ta en rusletur blant høst- og halloweenpynten i Haut-de-Cagnes. Fortsett deretter opplevelsen med et hyggelig måltid på Le Village ved Place du Château.",
    "book": "Reserver bord",
    "event": "Se arrangementet",
    "close": "Lukk vinduet",
    "alt": "Høstpynt i Haut-de-Cagnes med logoen Le Grimaldi x Le Village"
  },
  "ru": {
    "eyebrow": "Весь октябрь",
    "title": "Haut-de-Cagnes в осенних красках",
    "description": "Прогуляйтесь по украшенному к осени и Хэллоуину Haut-de-Cagnes, а затем насладитесь уютным обедом или ужином в Le Village на площади Place du Château.",
    "book": "Забронировать столик",
    "event": "Подробнее о событии",
    "close": "Закрыть окно",
    "alt": "Осенние украшения в Haut-de-Cagnes и логотип Le Grimaldi x Le Village"
  },
  "pl": {
    "eyebrow": "Przez cały październik",
    "title": "Haut-de-Cagnes w jesiennych barwach",
    "description": "Przespaceruj się wśród jesiennych i halloweenowych dekoracji w Haut-de-Cagnes, a potem spędź miło czas przy posiłku w restauracji Le Village na Place du Château.",
    "book": "Zarezerwuj stolik",
    "event": "Poznaj wydarzenie",
    "close": "Zamknij okno",
    "alt": "Jesienne dekoracje w Haut-de-Cagnes z logo Le Grimaldi x Le Village"
  }
};
  if (new Date() > new Date('2026-11-01T00:00:00+01:00')) return;
  const key = 'lv-autumn-popup-2026';
  try { if (localStorage.getItem(key)) return; } catch (_) {}
  const dialog = document.createElement('dialog');
  dialog.className = 'lv-autumn-dialog';
  dialog.setAttribute('aria-labelledby', 'lv-autumn-title');
  dialog.innerHTML = `<div class="lv-autumn-card"><div class="lv-autumn-visual"><img class="lv-autumn-photo" src="/assets/images/automne-popup.webp" alt="Le Haut-de-Cagnes aux couleurs de l’automne, avec le logo Le Grimaldi x Le Village"/></div><button class="lv-autumn-close" type="button" aria-label="Fermer cette fenêtre">×</button><div class="lv-autumn-copy"><p class="lv-autumn-eyebrow">Tout le mois d’octobre</p><h2 id="lv-autumn-title">Le Haut-de-Cagnes aux couleurs d’Automne</h2><p class="lv-autumn-quote">Venez flâner au cœur des décors d’automne et d’Halloween du Haut-de-Cagnes. Puis prolongez l’instant autour d’une table chaleureuse au Village, sur la place du Château.</p><div class="lv-autumn-actions"><a class="lv-autumn-book" href="/reserver">Réserver une table</a><a class="lv-autumn-event" href="/automne-halloween-haut-de-cagnes">Découvrir l’événement</a></div></div></div>`;
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
  event.href = prefix + '/automne-halloween-haut-de-cagnes';
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
