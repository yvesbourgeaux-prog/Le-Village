(function(){const root=window.document.getElementById("lv-82efaf4e48b1");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        const track = document.getElementById('blog-track');
        const btnNext = document.getElementById('blog-next');
        const btnPrev = document.getElementById('blog-prev');

        if(track && btnNext && btnPrev) {
            const getScrollAmount = () => window.innerWidth < 768 ? 300 : 410; 

            // Le premier article du HTML est « Les Sunsets du Château ».
            // On revient explicitement au début pour éviter la restauration
            // d'une ancienne position horizontale sur mobile.
            const resetCarouselToStart = () => {
                track.scrollTo({ left: 0, behavior: 'auto' });
            };
            resetCarouselToStart();
            window.addEventListener('load', () => {
                requestAnimationFrame(resetCarouselToStart);
            }, { once: true });

            btnNext.addEventListener('click', () => {
                track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
            });

            btnPrev.addEventListener('click', () => {
                track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
            });
        }
    });

})();