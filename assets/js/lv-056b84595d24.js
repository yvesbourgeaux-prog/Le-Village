(function(){const root=window.document.getElementById("lv-056b84595d24");if(!root)return;const document=window.lvScopedDocument(root);

(function(){
    // PAGES DU MENU (Hébergement Zyro)
    const menuImages = [
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0001-UOvdH59PfVkrM42N.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0002-dCjfLzbZOChvxSn0.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0003-Wdtr3QeJV3bq5k32.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/carte-avril-26_page-0004-rKs8tZaLCkhUd3cd.jpg"
    ];

    let currentMenuIndex = 0;
    const menuLightbox = document.getElementById('menuLightbox');
    const menuLbImg = document.getElementById('menuLightboxImage');
    const menuCounter = document.getElementById('menuLightboxCounter');
    const menuLoader = document.getElementById('menuLbLoader');

    function updateMenuImage() {
        menuLbImg.style.opacity = 0;
        menuLbImg.classList.remove('scale-100');
        menuLbImg.classList.add('scale-95');
        menuLoader.classList.remove('hidden');

        setTimeout(() => {
            menuLbImg.src = menuImages[currentMenuIndex];
            menuCounter.innerText = (currentMenuIndex + 1) + " / " + menuImages.length;
            menuLbImg.onload = () => {
                menuLoader.classList.add('hidden');
                menuLbImg.style.opacity = 1;
                menuLbImg.classList.remove('scale-95');
                menuLbImg.classList.add('scale-100');
            };
        }, 200);
    }

    function openMenuLightbox(index) {
        currentMenuIndex = index;
        menuLightbox.classList.remove('hidden');
        setTimeout(() => menuLightbox.classList.remove('opacity-0'), 10);
        updateMenuImage();
        document.body.style.overflow = 'hidden'; 
    }

    function closeMenuLightbox() {
        menuLightbox.classList.add('opacity-0');
        setTimeout(() => {
            menuLightbox.classList.add('hidden');
            document.body.style.overflow = 'auto'; 
        }, 300);
    }

    function changeMenuImage(direction) {
        currentMenuIndex = (currentMenuIndex + direction + menuImages.length) % menuImages.length;
        updateMenuImage();
    }

    document.querySelectorAll('.menu-trigger').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openMenuLightbox(parseInt(el.getAttribute('data-index')));
        });
    });

    document.getElementById('closeMenuLightbox').addEventListener('click', closeMenuLightbox);
    document.getElementById('prevMenuLightbox').addEventListener('click', (e) => { e.stopPropagation(); changeMenuImage(-1); });
    document.getElementById('nextMenuLightbox').addEventListener('click', (e) => { e.stopPropagation(); changeMenuImage(1); });
    
    // Fermeture intuitive : un clic/tap en dehors de l'image ou des commandes referme la lightbox
    menuLightbox.addEventListener('click', (e) => {
        if (!e.target.closest('#menuLightboxImage, button, #menuLbLoader')) {
            closeMenuLightbox();
        }
    });

    document.addEventListener('keydown', e => {if(!menuLightbox.classList.contains('hidden')) {if(e.key==='Escape') closeMenuLightbox();if(e.key==='ArrowLeft') changeMenuImage(-1);if(e.key==='ArrowRight') changeMenuImage(1);}});})();
})();