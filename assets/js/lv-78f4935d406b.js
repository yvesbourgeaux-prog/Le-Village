(function(){const root=window.document.getElementById("lv-78f4935d406b");if(!root)return;const document=window.lvScopedDocument(root);

        window.addEventListener('message', function(event) {
            const iframe = document.getElementById('host-websites-booking-module');
            if (!iframe || event.source !== iframe.contentWindow) return;

            let data = event.data;
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (error) {
                    return;
                }
            }

            if (!data || data.type !== 'resize') return;

            const height = parseInt(data.height, 10);

            if (Number.isFinite(height) && height > 0) {
                iframe.style.height = Math.max(height, 500) + 'px';
            }
        });
    
})();