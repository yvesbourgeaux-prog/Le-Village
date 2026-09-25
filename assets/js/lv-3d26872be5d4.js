(function(){const root=window.document.getElementById("lv-3d26872be5d4");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        // Paramétrage : L'animation se déclenche quand 40% de l'image est visible à l'écran
        let options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.4
        };

        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Si l'élément entre dans la zone visible
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                } else {
                    // Optionnel : on retire la classe s'il sort, pour que l'effet se re-joue en remontant
                    entry.target.classList.remove('is-visible');
                }
            });
        }, options);

        // On cible tous les éléments qui ont la classe 'scroll-anim-trigger'
        document.querySelectorAll('#village-montmartre-block .scroll-anim-trigger').forEach(card => {
            observer.observe(card);
        });
    });

})();