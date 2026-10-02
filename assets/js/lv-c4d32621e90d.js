(function(){const root=window.document.getElementById("lv-c4d32621e90d");if(!root)return;const document=window.lvScopedDocument(root);

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

    try {
      const w = window.top || window.parent || window;
      w.history.replaceState(null, '', w.location.pathname + w.location.search);
      w.location.hash = '';
      w.location.hash = 'zc-action-open';
    } catch (e) {
      window.location.href = '/dossier-presse/?zc=open';
    }

    return false;
  }

})();