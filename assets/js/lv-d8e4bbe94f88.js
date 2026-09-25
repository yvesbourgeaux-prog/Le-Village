(function(){const root=window.document.getElementById("lv-d8e4bbe94f88");if(!root)return;const document=window.lvScopedDocument(root);

document.addEventListener("DOMContentLoaded", function() {
    // Sélectionne tous les carrousels de la page
    const carousels = document.querySelectorAll('.lv-ig-carousel');
    
    carousels.forEach(carousel => {
        const slides = Array.from(carousel.querySelectorAll('.lv-ig-slide'));
        const dots   = Array.from(carousel.querySelectorAll('.lv-ig-dot'));
        const prev   = carousel.querySelector('.lv-ig-arrow-left');
        const next   = carousel.querySelector('.lv-ig-arrow-right');

        if(slides.length === 0) return;

        slides.forEach((slide, slideIndex) => {
            slide.setAttribute('aria-hidden', slideIndex === 0 ? 'false' : 'true');
        });

        let index = 0;
        const delay = 5000;
        let timer = null;
        let startX = null;

        function updateArrows() {
            if(!prev || !next) return;
            const lastIndex = slides.length - 1;
        }

        function show(i) {
            slides[index].classList.remove('lv-active');
            dots[index].classList.remove('lv-active');
            
            // Boucle infinie
            index = (i + slides.length) % slides.length;
            
            slides[index].classList.add('lv-active');
            dots[index].classList.add('lv-active');
            updateArrows();
        }
        
        function goNext() { show(index + 1); }
        function goPrev() { show(index - 1); }

        function reset() {
            clearInterval(timer);
            timer = setInterval(goNext, delay);
        }

        if(dots.length > 0) {
            dots.forEach(d => d.addEventListener('click', () => {
                show(parseInt(d.dataset.index, 10));
                reset();
            }));
        }

        if(next && prev) {
            next.addEventListener('click', () => { goNext(); reset(); });
            prev.addEventListener('click', () => { goPrev(); reset(); });
        }

        // Gestion du swipe sur mobile
        carousel.addEventListener('touchstart', (e) => {
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
                reset();
            }
            startX = null;
        }, { passive: true });

        updateArrows();
        reset();
    });
});

})();