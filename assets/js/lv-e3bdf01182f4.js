(function(){const root=window.document.getElementById("lv-e3bdf01182f4");if(!root)return;const document=window.lvScopedDocument(root);

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