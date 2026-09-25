(function(){const root=window.document.getElementById("lv-012d39e69969");if(!root)return;const document=window.lvScopedDocument(root);

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