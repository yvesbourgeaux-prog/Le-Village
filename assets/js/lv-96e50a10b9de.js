(function(){const root=window.document.getElementById("lv-96e50a10b9de");if(!root)return;const document=window.lvScopedDocument(root);

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

    // SLIDER DE PHOTOS DU RESTAURANT
    const track = document.getElementById('lvSliderTrack');
    const prevBtn = document.getElementById('lvPrev');
    const nextBtn = document.getElementById('lvNext');
    const lb = document.getElementById('lvLightbox');
    const lbImg = document.getElementById('lvLightboxImg');
    const lbClose = document.getElementById('lvLightboxClose');
    const lbPrev = document.getElementById('lvLightboxPrev');
    const lbNext = document.getElementById('lvLightboxNext');

    if(!track || !prevBtn || !nextBtn || !lb || !lbImg) return;

    // IMAGES DU DIAPORAMA (Hébergement Zyro)
    const galleryUrls = [
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/504395225_18102878239554133_6056775670913634295_n-gweKjIBbBQ5QyhVg.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/488371696_18095818531554133_8304191921673601096_n-6gnFEvgtRNLRghHv.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/703259494_18136664518554133_6619495604491241963_n-3yjAmERH9tRWsFwV.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/513835140_18103783702554133_6317778776442415054_n-S7tcvJG9GTXm6wWS.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/657939819_18131902972554133_7251435359781396547_n-AWcxKKUL9f9pqbWU.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/748740788_1009759625306939_2296296747972267665_n-KzxXdNNzOpo29ZUX.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/500535905_18100351483554133_835940706174291298_n-GhwIqzy5r5uAgOdo.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/488203826_18095457658554133_5216173859984779515_n-BDv53pDaoB7OzoLh.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/711654846_18137754040554133_8052639981046428030_n-iDu5hvdcHJ5DrUY4.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/513863059_18103982920554133_9191930750479670739_n-MSoJZLYYUQlX7XBi.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/504286757_18102878248554133_8944073310212698634_n-GQL3ddGeuKFP8cjT.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/770572402_2278800949625005_8302478297907390947_n-OM0PezvBkJOGEzLD.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/527319260_18107052976554133_4738786729584938908_n-KAj8opp5hGF6Ex8r.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/564600432_18114710110554133_6740503655027694972_n-jXyuqjJBXvGElDlI.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/541143579_18109403821554133_4456943639796817976_n-4acY72GRtY3LAmVK.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/530369719_18107444293554133_7087495931175276754_n-vGYVnLC4m7VOLwRW.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/612229937_18123077806554133_7378364166757796804_n-McB2e5bjcp7qxo8K.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/761573811_1059806816417319_5426909959661665231_n-kPM1eo7H0xxz6pO5.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/539525256_18109092652554133_3526101198962320744_n-R6pUXBZa5KdazO9G.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/93d43268-c8a4-4ba2-8767-ff2c5cee8678-r9IP3uk3J0Z39XoD.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/557350303_18113034502554133_5860897413871185886_n-rzhoJ2MlexnsOvEP.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/632346999_18126438499554133_2171823029215461232_n-hvDdl9ACTX5Upqj8.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/488302779_18095457667554133_8500758729900312102_n-MLTomotyeNRmLhId.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/490935715_18096532069554133_8717733356139315233_n-6ntZgcZZoxmJs8wl.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/579686947_18117931381554133_899787466243231279_n-udU6MAhISS0gVme8.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/491418272_18096961897554133_6752366734478910133_n-toAoeaTjCvNUSsZj.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/582507593_18118524469554133_921341003334502966_n-WL9kWlBk1lpToElZ.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/626285517_18126899017554133_3600391897983015929_n-0155WIdX8xrtfjeV.jpg",
        "https://assets.zyrosite.com/gnKoPAn3rxzY53IR/582793372_18118705186554133_7027943419963072274_n-ibrm673r03DV27Ah.jpg"
    ];

    const urls = galleryUrls;
    
    let currentPhotoIndex = 0;

    function altFor(index){
        const a = [
            "Le Village – restaurant à Haut-de-Cagnes, cuisine maison",
            "Le Village – Cagnes-sur-Mer, plats de saison",
            "Restaurant Le Village – ambiance conviviale au Haut-de-Cagnes",
            "Le Village – assiette gourmande à Cagnes-sur-Mer"
        ];
        return a[index % a.length];
    }

    function makeSlide(src, i){
        const slide = document.createElement('div');
        slide.className = 'lvSlide';
        slide.dataset.index = i;
        slide.setAttribute('role', 'button');
        slide.setAttribute('tabindex', '0');
        slide.setAttribute('aria-label', `Agrandir la photo ${i + 1}`);
        const inner = document.createElement('div');
        inner.className = 'lvSlideInner';
        const img = document.createElement('img');
        img.src = src;
        img.alt = altFor(i);
        img.loading = (i < 2) ? 'eager' : 'lazy';
        img.decoding = 'async';
        img.dataset.index = i;
        inner.appendChild(img);
        slide.appendChild(inner);
        return slide;
    }

    urls.forEach((src, i) => track.appendChild(makeSlide(src, i)));

    function openCarouselLightbox(index){
        currentPhotoIndex = index;
        lbImg.src = urls[currentPhotoIndex].replace(",w_900/", ",w_1400/");
        lbImg.alt = altFor(currentPhotoIndex);
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
    }

    function closeCarouselLightbox(){
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden','true');
        lbImg.src = "";
        document.body.style.overflow = 'auto';
    }

    function changeCarouselPhoto(direction){
        currentPhotoIndex = (currentPhotoIndex + direction + urls.length) % urls.length;
        lbImg.src = urls[currentPhotoIndex].replace(",w_900/", ",w_1400/");
        lbImg.alt = altFor(currentPhotoIndex);
    }

    // GESTION DU DÉFILEMENT TACTILE (SWIPE) SUR SMARTPHONE
    let isDragging = false;
    let startX = 0;
    let startOffset = 0;
    let dragDistance = 0;
    const dragThreshold = 8; // Sensibilité du drag vs clic

    track.addEventListener('touchstart', (e) => {
        if (!e.touches || !e.touches.length) return;
        isDragging = true;
        startX = e.touches[0].clientX;
        startOffset = offset;
        dragDistance = 0;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging || !e.touches || !e.touches.length) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        dragDistance = diff;
        offset = startOffset + diff;
        normalizeOffset();
        track.style.transform = `translate3d(${offset}px,0,0)`;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        // Boost ou impulsion cinétique légère si le swipe est franc
        if (Math.abs(dragDistance) > 30) {
            const direction = dragDistance > 0 ? -1 : 1;
            boostTap(direction);
        }
    }, { passive: true });

    track.addEventListener('click', (e) => {
        // Bloque le clic de zoom si l'utilisateur était en train de swiper
        if (Math.abs(dragDistance) > dragThreshold) {
            dragDistance = 0;
            return;
        }
        const slide = e.target.closest('.lvSlide');
        if(!slide) return;
        openCarouselLightbox(parseInt(slide.dataset.index, 10));
    });

    // Ouverture au clavier pour l'accessibilité
    track.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const slide = e.target.closest('.lvSlide');
        if (!slide) return;
        e.preventDefault();
        openCarouselLightbox(parseInt(slide.dataset.index, 10));
    });

    lbClose.addEventListener('click', closeCarouselLightbox);
    lbPrev.addEventListener('click', (e) => { e.stopPropagation(); changeCarouselPhoto(-1); });
    lbNext.addEventListener('click', (e) => { e.stopPropagation(); changeCarouselPhoto(1); });
    
    // Fermeture intuitive : un clic/tap sur le fond sombre (hors image et commandes) ferme la photo
    lb.addEventListener('click', (e) => {
        if (!e.target.closest('#lvLightboxImg, button')) {
            closeCarouselLightbox();
        }
    });

    const baseSpeed = 0.55;
    const boostSpeed = 5.2;
    let offset = 0;
    let rafId = null;
    let currentSpeed = baseSpeed;
    let halfWidth = 0;

    function computeSizes(){ halfWidth = track.scrollWidth / 2; }

    function ensureLoopClones() {
        if (track.dataset.cloned === "1") return;
        Array.from(track.children).forEach(node => {
            const clone = node.cloneNode(true);
            clone.querySelector('img').dataset.index = node.querySelector('img').dataset.index;
            track.appendChild(clone);
        });
        track.dataset.cloned = "1";
    }

    function normalizeOffset(){
        if (!halfWidth) return;
        if (offset <= -halfWidth) offset += halfWidth;
        if (offset >= 0) offset -= halfWidth;
    }

    function loop(){
        // Ne fait défiler automatiquement que si l'utilisateur ne drag pas à la main
        if (!isDragging) {
            offset -= currentSpeed;
            normalizeOffset();
            track.style.transform = `translate3d(${offset}px,0,0)`;
        }
        rafId = requestAnimationFrame(loop);
    }

    function boostTap(direction){
        currentSpeed = direction === 1 ? boostSpeed : -boostSpeed;
        setTimeout(() => currentSpeed = baseSpeed, 220);
    }

    nextBtn.addEventListener('click', () => boostTap(1));
    prevBtn.addEventListener('click', () => boostTap(-1));

    function init(){
        ensureLoopClones();
        computeSizes();
        if(!rafId) rafId = requestAnimationFrame(loop);
    }

    setTimeout(init, 500);
    window.addEventListener('resize', computeSizes);

    document.addEventListener('keydown', (e) => {
        if(!menuLightbox.classList.contains('hidden')) {
            if(e.key === 'Escape') closeMenuLightbox();
            if(e.key === 'ArrowLeft') changeMenuImage(-1);
            if(e.key === 'ArrowRight') changeMenuImage(1);
        }

        if(lb.classList.contains('is-open')) {
            if(e.key === 'Escape') closeCarouselLightbox();
            if(e.key === 'ArrowLeft') changeCarouselPhoto(-1);
            if(e.key === 'ArrowRight') changeCarouselPhoto(1);
        }
    });
})();

})();