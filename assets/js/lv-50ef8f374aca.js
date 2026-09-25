(function(){const root=window.document.getElementById("lv-50ef8f374aca");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        // L'animation se déclenche quand 40% de l'image est visible à l'écran
        let options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.4
        };

        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    // Retire la classe quand on scrolle ailleurs pour que l'effet puisse se rejouer
                    entry.target.classList.remove('is-visible');
                }
            });
        }, options);

        // On cible les éléments avec la classe 'scroll-anim-trigger' dans ce bloc
        document.querySelectorAll('#village-lieu-block .scroll-anim-trigger').forEach(card => {
            observer.observe(card);
        });
    });

})();