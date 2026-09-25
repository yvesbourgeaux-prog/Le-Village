(function(){const root=window.document.getElementById("lv-97d0f3034425");if(!root)return;const document=window.lvScopedDocument(root);

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