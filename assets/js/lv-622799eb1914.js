(function(){const root=window.document.getElementById("lv-622799eb1914");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        let options = { root: null, rootMargin: '0px', threshold: 0.3 };
        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    entry.target.classList.remove('is-visible');
                }
            });
        }, options);

        document.querySelectorAll('#village-ambiances-block .scroll-anim-trigger').forEach(card => {
            observer.observe(card);
        });
    });

})();