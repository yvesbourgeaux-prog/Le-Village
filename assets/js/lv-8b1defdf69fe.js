(function(){const root=window.document.getElementById("lv-8b1defdf69fe");if(!root)return;const document=window.lvScopedDocument(root);

        const menuImages = [
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0001-UOvdH59PfVkrM42N.jpg",
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0002-dCjfLzbZOChvxSn0.jpg",
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0003-Wdtr3QeJV3bq5k32.jpg",
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0004-rKs8tZaLCkhUd3cd.jpg"
        ];
        
        let currentMenuIndex = 0;
        let previousFocus = null;
        const lightbox = document.getElementById('menuLightbox');
        const lbImg = document.getElementById('lightboxImage');
        const counter = document.getElementById('lightboxCounter');
        const loader = document.getElementById('lbLoader');

        function updateImage() {
            lbImg.style.opacity = 0;
            lbImg.classList.remove('scale-100');
            lbImg.classList.add('scale-95');
            loader.classList.remove('hidden');
            
            setTimeout(() => {

                counter.innerText = (currentMenuIndex + 1) + " / " + menuImages.length;
                
                lbImg.onload = () => {
                    loader.classList.add('hidden');
                    lbImg.style.opacity = 1;
                    lbImg.classList.remove('scale-95');
                    lbImg.classList.add('scale-100');
                };
                lbImg.onerror = () => { loader.classList.add('hidden'); lbImg.style.opacity = 1; };
                lbImg.src = menuImages[currentMenuIndex];
                if (lbImg.complete && lbImg.naturalWidth) lbImg.onload();
            }, 200);
        }

        function openLightbox(index) {
            previousFocus = window.document.activeElement;
            currentMenuIndex = index;
            lightbox.classList.remove('hidden');
            setTimeout(() => {
                lightbox.classList.remove('opacity-0');
            }, 10);
            updateImage();
            document.getElementById('closeLightbox').focus();
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.add('opacity-0');
            setTimeout(() => {
                lightbox.classList.add('hidden');
                document.body.style.overflow = '';
                previousFocus?.focus();
            }, 300);
        }

        function changeLightboxImage(direction) {
            currentMenuIndex = (currentMenuIndex + direction + menuImages.length) % menuImages.length;
            updateImage();
        }

        document.querySelectorAll('.menu-trigger').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                let idx = parseInt(el.getAttribute('data-index'));
                openLightbox(idx);
            });
        });

        document.getElementById('closeLightbox').addEventListener('click', closeLightbox);
        document.getElementById('prevLightbox').addEventListener('click', (e) => { e.stopPropagation(); changeLightboxImage(-1); });
        document.getElementById('nextLightbox').addEventListener('click', (e) => { e.stopPropagation(); changeLightboxImage(1); });
        
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox || e.target.parentElement === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if(!lightbox.classList.contains('hidden')) {
                if(e.key === 'Tab') {
                    const buttons = [...lightbox.querySelectorAll('button')];
                    const first = buttons[0], last = buttons[buttons.length - 1];
                    if(e.shiftKey && window.document.activeElement === first) { e.preventDefault(); last.focus(); }
                    else if(!e.shiftKey && window.document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
                if(e.key === 'Escape') closeLightbox();
                if(e.key === 'ArrowLeft') changeLightboxImage(-1);
                if(e.key === 'ArrowRight') changeLightboxImage(1);
            }
        });
    
})();