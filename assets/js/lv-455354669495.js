(function(){const root=window.document.getElementById("lv-455354669495");if(!root)return;const document=window.lvScopedDocument(root);

document.addEventListener("DOMContentLoaded", function() {
    const carousels = document.querySelectorAll('#village-montmartre-block .lv-ig-carousel');
    
    carousels.forEach(carousel => {
        const slides = Array.from(carousel.querySelectorAll('.lv-ig-slide'));
        const dots   = Array.from(carousel.querySelectorAll('.lv-ig-dot'));
        const prev   = carousel.querySelector('.lv-ig-arrow-left');
        const next   = carousel.querySelector('.lv-ig-arrow-right');

        if(slides.length === 0) return;

        let index = 0;
        const delay = 5000;
        let timer = null;
        let startX = null;
        let autoSlideStopped = false;

        function stopAutoSlide() {
            autoSlideStopped = true;
            if(timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function startAutoSlide() {
            if(autoSlideStopped) return;
            if(timer) clearInterval(timer);
            timer = setInterval(goNext, delay);
        }

        function show(i) {
            slides[index].classList.remove('lv-active');
            if(dots[index]) dots[index].classList.remove('lv-active');

            index = (i + slides.length) % slides.length;

            slides[index].classList.add('lv-active');
            if(dots[index]) dots[index].classList.add('lv-active');

            /* Stoppe automatiquement le carrousel quand la vidéo devient visible */
            if(slides[index].classList.contains('lv-video-slide') || slides[index].querySelector('iframe')) {
                stopAutoSlide();
            }
        }
        
        function goNext() {
            show(index + 1);
        }

        function goPrev() {
            show(index - 1);
        }

        if(dots.length > 0) {
            dots.forEach(d => d.addEventListener('click', () => {
                stopAutoSlide();
                show(parseInt(d.dataset.index, 10));
            }));
        }

        if(next && prev) {
            next.addEventListener('click', () => {
                stopAutoSlide();
                goNext();
            });

            prev.addEventListener('click', () => {
                stopAutoSlide();
                goPrev();
            });
        }

        carousel.addEventListener('touchstart', (e) => {
            stopAutoSlide();
            if(!e.touches || !e.touches.length) return;
            startX = e.touches[0].clientX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            if(startX === null) return;

            const endX = e.changedTouches[0].clientX;
            const diff = endX - startX;
            const threshold = 50;

            if(Math.abs(diff) > threshold) {
                if(diff < 0) goNext();
                else goPrev();
            }

            startX = null;
        }, { passive: true });

        carousel.addEventListener('mouseenter', () => {
            stopAutoSlide();
        });

        carousel.addEventListener('click', () => {
            stopAutoSlide();
        });

        startAutoSlide();
    });
});

})();