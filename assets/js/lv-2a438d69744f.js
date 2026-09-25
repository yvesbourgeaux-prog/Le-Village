(function(){const root=window.document.getElementById("lv-2a438d69744f");if(!root)return;const document=window.lvScopedDocument(root);

    const VH_ROOM_TITLES = {
        suite: 'La Suite Grimaldi',
        coccinelle: 'Coccinelle',
        coquelicot: 'Coquelicot',
        jungle: 'Jungle',
        colibris: 'Colibris'
    };

    const VH_ROOM_IMAGES = {
        suite: [
            'https://img.holidu.com/images/7035f3c1-d952-43c9-9cdd-d553b622db8a/m.jpg',
            'https://img.holidu.com/images/631d8a75-b674-4abe-a363-ac1e84929434/m.jpg',
            'https://img.holidu.com/images/b7a1c90c-3b2f-4648-8473-3cf71b28f515/m.jpg',
            'https://img.holidu.com/images/f4006ccb-3212-4c8c-9362-5abc3644cf30/m.jpg',
            'https://img.holidu.com/images/4db47c08-554d-45a1-92cd-0ed28c7ecc58/m.jpg',
            'https://img.holidu.com/images/3e4a96ec-85cd-49f8-b203-0c78fa507ec3/m.jpg',
            'https://img.holidu.com/images/6d67e7e6-cc3a-44f5-9639-25f0c721411f/m.jpg',
            'https://img.holidu.com/images/b21c3130-1447-42e8-9a61-0d07d1c403aa/m.jpg',
            'https://img.holidu.com/images/20b29672-adb3-447c-a203-9d2dd0400ef6/m.jpg',
            'https://img.holidu.com/images/059d6e3d-ff02-4114-be65-76c11a73dc1d/m.jpg',
            'https://img.holidu.com/images/bcd27fd3-fb85-4e48-b058-eb76946a6c7d/m.jpg',
            'https://img.holidu.com/images/03947690-6464-4ac8-a228-e97c7077852d/m.jpg'
        ],
        coccinelle: [
            'https://img.holidu.com/images/c1fd73cb-33a7-40b1-8af3-654863ca10e8/m.jpg',
            'https://img.holidu.com/images/9c4ac5c5-0300-4871-80c2-349b2bd5fb5b/m.jpg',
            'https://img.holidu.com/images/2854f759-2ea6-4db7-ba52-07afe0c227bf/m.jpg',
            'https://img.holidu.com/images/0a652b77-de0e-4f86-b783-9d497b824536/m.jpg',
            'https://img.holidu.com/images/5c54238b-043e-4374-b1be-8f4f57d844d0/m.jpg',
            'https://img.holidu.com/images/fddea3d6-10f7-4fd5-8200-b3529e05df88/m.jpg',
            'https://img.holidu.com/images/d48790f5-4506-43fa-a1d6-02f9462e5778/m.jpg',
            'https://img.holidu.com/images/ae0abf6e-0ec7-4baa-a5e2-1991d50ec060/m.jpg'
        ],
        coquelicot: [
            'https://img.holidu.com/images/64411b32-2f25-4275-86a9-56f33d9b8427/l.avif',
            'https://img.holidu.com/images/c23fef86-5df7-471b-9863-eb0328e8d105/l.avif',
            'https://img.holidu.com/images/92a4dd10-625c-4dac-b040-90516980f48c/l.avif',
            'https://img.holidu.com/images/7cd6aa81-4c10-4ace-8b02-574341a4039d/l.avif',
            'https://img.holidu.com/images/58403396-4da7-4f14-b058-46d64796734a/l.avif',
            'https://img.holidu.com/images/bd2559c3-c350-4859-92b0-810528c71cb2/m.jpg',
            'https://img.holidu.com/images/48b9c45c-ad3c-4537-83ee-91a5d0463bec/m.jpg',
            'https://img.holidu.com/images/5f615f37-8c1c-42d9-b917-7a63fef17edc/m.jpg',
            'https://img.holidu.com/images/e971b35f-e197-4626-be3b-1bb010650d70/m.jpg'
        ],
        jungle: [
            'https://img.holidu.com/images/0d3153c2-d047-46b5-ad35-a82638fe0a6c/l.avif',
            'https://img.holidu.com/images/41e78487-70b0-4597-9fff-b7b518d29e50/l.avif',
            'https://img.holidu.com/images/aaeae9a2-5d22-4090-b2e5-9f92c0ce1b03/l.avif',
            'https://img.holidu.com/images/5e675864-c958-4030-8efa-89291df8cd20/l.avif',
            'https://img.holidu.com/images/a6cd5106-39e5-4b28-8d03-0b5cca92158e/l.avif',
            'https://img.holidu.com/images/83e31ac6-bd7d-48ee-af53-986d84917c32/m.jpg',
            'https://img.holidu.com/images/4451c86f-d7e0-4df0-9159-ea6911fb20a2/m.jpg',
            'https://img.holidu.com/images/3d33adf0-88d9-44cb-8a58-70860c219607/m.jpg',
            'https://img.holidu.com/images/77c80302-78e7-4173-86ad-8cd7e74de4cc/m.jpg',
            'https://img.holidu.com/images/1a4c16ab-3d5d-48ce-ba2a-c72c320ac5ee/m.jpg'
        ],
        colibris: [
            'https://img.holidu.com/images/ec1a3246-8577-422a-a5c5-89568185f587/m.jpg',
            'https://img.holidu.com/images/e6598400-d6d8-4b18-a443-4fa08fb0c13c/m.jpg',
            'https://img.holidu.com/images/a133b907-cd7b-42ef-a099-b888da537847/m.jpg',
            'https://img.holidu.com/images/abed414f-24be-4d0b-b0c1-9e3b46841ad2/l.avif',
            'https://img.holidu.com/images/2599bf8d-18aa-4c4e-b71f-f43b546ae984/l.avif',
            'https://img.holidu.com/images/306493a1-b5c1-4752-9815-4116caa24a99/m.jpg',
            'https://img.holidu.com/images/c2f96be2-f69b-45cb-9479-8e69e50c4fac/m.jpg',
            'https://img.holidu.com/images/c0602af7-c721-49b2-b266-4cbdc8b61ceb/m.jpg',
            'https://img.holidu.com/images/1798a7b9-5766-412a-9a32-3b12be03e7ba/m.jpg',
            'https://img.holidu.com/images/e7b41d19-75e6-43f2-a0b7-eafae4eb28b5/m.jpg'
        ]
    };

    const vhGalleryStates = {};

    function vhRenderGalleries() {
        const galleries = document.querySelectorAll('#village-hotel-block .vh-gallery-shell');

        galleries.forEach((gallery) => {
            const room = gallery.dataset.room;
            const images = VH_ROOM_IMAGES[room] || [];
            const roomTitle = VH_ROOM_TITLES[room] || '';

            vhGalleryStates[room] = 0;

            gallery.innerHTML = `
                <div class="vh-gallery-main-wrap rounded-sm">
                    <button type="button" class="vh-gallery-main-btn">
                        <img class="vh-gallery-main-image" src="${images[0]}" alt="${roomTitle} - photo 1">
                    </button>

                    <button type="button" class="vh-gallery-arrow vh-gallery-arrow-left" aria-label="Image précédente" onclick="vhChangeImage('${room}', -1)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>

                    <button type="button" class="vh-gallery-arrow vh-gallery-arrow-right" aria-label="Image suivante" onclick="vhChangeImage('${room}', 1)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>

                    <div class="vh-gallery-counter">1 / ${images.length}</div>
                </div>

                <div class="vh-gallery-thumbs">
                    ${images.map((src, index) => `
                        <button
                            type="button"
                            class="vh-thumb-btn ${index === 0 ? 'is-active' : ''}"
                            onclick="vhSetImage('${room}', ${index})"
                            aria-label="${roomTitle} - photo ${index + 1}"
                        >
                            <img src="${src}" alt="${roomTitle} - miniature ${index + 1}">
                        </button>
                    `).join('')}
                </div>
            `;

            const mainWrap = gallery.querySelector('.vh-gallery-main-wrap');
            let startX = 0;
            let endX = 0;

            mainWrap.addEventListener('touchstart', function(e) {
                startX = e.changedTouches[0].clientX;
            }, { passive: true });

            mainWrap.addEventListener('touchend', function(e) {
                endX = e.changedTouches[0].clientX;
                const delta = endX - startX;

                if (Math.abs(delta) > 40) {
                    if (delta > 0) {
                        vhChangeImage(room, -1);
                    } else {
                        vhChangeImage(room, 1);
                    }
                }
            }, { passive: true });
        });
    }

    function vhUpdateGallery(room) {
        const gallery = document.querySelector(`#village-hotel-block .vh-gallery-shell[data-room="${room}"]`);
        if (!gallery) return;

        const images = VH_ROOM_IMAGES[room] || [];
        const roomTitle = VH_ROOM_TITLES[room] || '';
        const index = vhGalleryStates[room] || 0;

        const mainImage = gallery.querySelector('.vh-gallery-main-image');
        const counter = gallery.querySelector('.vh-gallery-counter');
        const thumbs = gallery.querySelectorAll('.vh-thumb-btn');

        if (mainImage) {
            mainImage.src = images[index];
            mainImage.alt = `${roomTitle} - photo ${index + 1}`;
        }

        if (counter) {
            counter.textContent = `${index + 1} / ${images.length}`;
        }

        thumbs.forEach((thumb, i) => {
            thumb.classList.toggle('is-active', i === index);
        });

        const activeThumb = thumbs[index];
        if (activeThumb) {
            activeThumb.scrollIntoView({ inline: 'center', block: 'nearest' });
        }
    }

    function vhSetImage(room, index) {
        vhGalleryStates[room] = index;
        vhUpdateGallery(room);
    }

    function vhChangeImage(room, direction) {
        const images = VH_ROOM_IMAGES[room] || [];
        if (!images.length) return;

        let index = vhGalleryStates[room] || 0;
        index = (index + direction + images.length) % images.length;
        vhGalleryStates[room] = index;
        vhUpdateGallery(room);
    }

    function vhOpenRoom(roomId) {
        const contents = document.querySelectorAll('#village-hotel-block .room-content');
        contents.forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('block');
        });

        const tabs = document.querySelectorAll('#village-hotel-block .room-tab');
        tabs.forEach(tab => {
            tab.classList.remove('text-village-white', 'border-b-2', 'border-village-accent');
            tab.classList.add('text-village-light/50', 'hover:text-village-light');
        });

        const targetContent = document.getElementById(`content-${roomId}`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
            targetContent.classList.add('block');
        }

        const targetTab = document.getElementById(`tab-${roomId}`);
        if (targetTab) {
            targetTab.classList.remove('text-village-light/50', 'hover:text-village-light');
            targetTab.classList.add('text-village-white', 'border-b-2', 'border-village-accent');
            targetTab.scrollIntoView({ inline: 'center', block: 'nearest' });
        }
    }

    vhRenderGalleries();

document.querySelector('[data-lv-event="h0"]')?.addEventListener("click",function(event){const result=(function(event){vhOpenRoom('suite')}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h1"]')?.addEventListener("click",function(event){const result=(function(event){vhOpenRoom('coccinelle')}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h2"]')?.addEventListener("click",function(event){const result=(function(event){vhOpenRoom('coquelicot')}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h3"]')?.addEventListener("click",function(event){const result=(function(event){vhOpenRoom('jungle')}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h4"]')?.addEventListener("click",function(event){const result=(function(event){vhOpenRoom('colibris')}).call(this,event);if(result===false)event.preventDefault();});
})();