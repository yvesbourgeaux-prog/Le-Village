(function(){const root=window.document.getElementById("lv-0e61f442530d");if(!root)return;const document=window.lvScopedDocument(root);

    function goToTop(event, url) {
      if (event) event.preventDefault();

      try {
        window.top.location.href = url;
      } catch (e) {
        window.location.href = url;
      }

      return false;
    }

    function openZenchef(event) {
      if (event) event.preventDefault();

      let fallbackUrl = '/espace-presse/?zc=open';

      try {
        const activeWindow = window.top && window.top !== window ? window.top : window;
        const current = new URL(activeWindow.location.href);

        current.searchParams.set('zc', 'open');
        current.hash = '';

        fallbackUrl = current.toString();
      } catch (e) {}

      try {
        if (window.top && window.top !== window) {
          window.top.location.href = fallbackUrl;
        } else {
          window.location.href = fallbackUrl;
        }
      } catch (e) {
        window.location.href = fallbackUrl;
      }

      return false;
    }

    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    function closeMenu() {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      mobileMenu.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
    }

    menuBtn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (mobileMenu.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    mobileMenu.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    document.addEventListener('click', function (event) {
      if (!mobileMenu.contains(event.target) && !menuBtn.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });
  
})();