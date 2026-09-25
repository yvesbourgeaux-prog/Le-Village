(function(){const root=window.document.getElementById("lv-9693338ce32a");if(!root)return;const document=window.lvScopedDocument(root);

document.addEventListener("DOMContentLoaded", function() {
    const carousel = document.getElementById('lvIgCarousel');
    if(!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.lv-ig-slide'));
    const dots   = Array.from(carousel.querySelectorAll('.lv-ig-dot'));
    const prev   = carousel.querySelector('.lv-ig-arrow-left');
    const next   = carousel.querySelector('.lv-ig-arrow-right');

    let index = 0;
    const delay = 5000;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null;
    let startX = null;

    function show(i) {
        slides[index].classList.remove('lv-active');
        slides[index].setAttribute('aria-hidden', 'true');
        dots[index].classList.remove('lv-active');
        dots[index].setAttribute('aria-current', 'false');

        index = (i + slides.length) % slides.length;

        slides[index].classList.add('lv-active');
        slides[index].setAttribute('aria-hidden', 'false');
        dots[index].classList.add('lv-active');
        dots[index].setAttribute('aria-current', 'true');
    }
    
    function goNext() { show(index + 1); }
    function goPrev() { show(index - 1); }

    function reset() {
        clearInterval(timer);
        if (!prefersReducedMotion) {
            timer = setInterval(goNext, delay);
        }
    }

    slides.forEach((slide, slideIndex) => {
        slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
    });

    dots.forEach(d => d.addEventListener('click', () => {
        show(parseInt(d.dataset.index, 10));
        reset();
    }));

    next.addEventListener('click', () => { goNext(); reset(); });
    prev.addEventListener('click', () => { goPrev(); reset(); });

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

    reset();
});

})();