(function(){const root=window.document.getElementById("lv-7ac2eb90a8f5");if(!root)return;const document=window.lvScopedDocument(root);

        const menuImages = [
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/548927768_18110917903554133_6103352769976099505_n-tx4bw2LvKuuQwaTd.jpg",
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/548927768_18110917903554133_6103352769976099505_n-tx4bw2LvKuuQwaTd.jpg",
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/548927768_18110917903554133_6103352769976099505_n-tx4bw2LvKuuQwaTd.jpg",
            "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/548927768_18110917903554133_6103352769976099505_n-tx4bw2LvKuuQwaTd.jpg"
        ];
        
        let currentMenuIndex = 0;
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
                lbImg.src = menuImages[currentMenuIndex];
                counter.innerText = (currentMenuIndex + 1) + " / " + menuImages.length;
                
                lbImg.onload = () => {
                    loader.classList.add('hidden');
                    lbImg.style.opacity = 1;
                    lbImg.classList.remove('scale-95');
                    lbImg.classList.add('scale-100');
                };
            }, 200);
        }

        function openLightbox(index) {
            currentMenuIndex = index;
            lightbox.classList.remove('hidden');
            setTimeout(() => {
                lightbox.classList.remove('opacity-0');
            }, 10);
            updateImage();
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.add('opacity-0');
            setTimeout(() => {
                lightbox.classList.add('hidden');
                document.body.style.overflow = 'auto';
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
                if(e.key === 'Escape') closeLightbox();
                if(e.key === 'ArrowLeft') changeLightboxImage(-1);
                if(e.key === 'ArrowRight') changeLightboxImage(1);
            }
        });
    
})();