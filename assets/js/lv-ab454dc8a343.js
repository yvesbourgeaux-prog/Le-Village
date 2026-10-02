(function(){const root=window.document.getElementById("lv-ab454dc8a343");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        const track = document.getElementById('blog-track');
        const btnNext = document.getElementById('blog-next');
        const btnPrev = document.getElementById('blog-prev');

        if(track && btnNext && btnPrev) {
            const getScrollAmount = () => window.innerWidth < 768 ? 300 : 410; 

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