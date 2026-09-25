(function(){const root=window.document.getElementById("lv-86801dde34c6");if(!root)return;const document=window.lvScopedDocument(root);

        function footerGoToTop(event, url) {
            if (event) event.preventDefault();
            try {
                window.top.location.href = url;
            } catch (e) {
                window.location.href = url;
            }
            return false;
        }

        function openFooterZenchef(event) {
            if (event) event.preventDefault();
            let fallbackUrl = '/?zc=open';
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
    
})();