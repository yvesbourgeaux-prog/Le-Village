(function(){const root=window.document.getElementById("lv-9bba7c447bd2");if(!root)return;const document=window.lvScopedDocument(root);

    function footerGoToTop(event, url) {
        if (event) event.preventDefault();

        try {
            window.top.location.href = url;
        } catch (e) {
            window.location.href = url;
        }

        return false;
    }

})();