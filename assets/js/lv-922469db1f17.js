(function(){const root=window.document.getElementById("lv-922469db1f17");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        // --- LOGIQUE D'APPARITION DES VIDÉOS ---
        let options = { root: null, rootMargin: '0px', threshold: 0.6 };

        let observerAudio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const container = video.closest('.arched-video-frame');
                
                if (entry.isIntersecting) {
                    container.classList.add('is-visible');
                }
            });
        }, options);

        document.querySelectorAll('.obs-video').forEach(video => {
            observerAudio.observe(video);
        });
    });

    // --- FONCTIONS DE PARTAGE SOCIAL ---
    function getShareUrl() {
        try {
            return encodeURIComponent((window.top && window.top.location.href) ? window.top.location.href : window.location.href);
        } catch (e) {
            return encodeURIComponent(window.location.href);
        }
    }

    function getShareText() {
        try {
            return encodeURIComponent(document.title + ' - ' + ((window.top && window.top.location.href) ? window.top.location.href : window.location.href));
        } catch (e) {
            return encodeURIComponent(document.title + ' - ' + window.location.href);
        }
    }

    function shareOnFacebook() {
        const shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + getShareUrl();
        window.open(shareUrl, '_blank', 'width=640,height=580');
    }

    function shareOnWhatsApp() {
        const shareUrl = 'https://wa.me/?text=' + getShareText();
        window.open(shareUrl, '_blank');
    }

    function copyPageLink() {
        let url = '';
        try {
            url = (window.top && window.top.location.href) ? window.top.location.href : window.location.href;
        } catch (e) {
            url = window.location.href;
        }

        navigator.clipboard.writeText(url).then(() => {
            alert('Lien copié');
        }).catch(() => {
            prompt('Copiez ce lien :', url);
        });
    }

document.querySelector('[data-lv-event="h0"]')?.addEventListener("click",function(event){const result=(function(event){event.preventDefault(); shareOnFacebook();}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h1"]')?.addEventListener("click",function(event){const result=(function(event){event.preventDefault(); copyPageLink();}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h2"]')?.addEventListener("click",function(event){const result=(function(event){event.preventDefault(); shareOnWhatsApp();}).call(this,event);if(result===false)event.preventDefault();});
})();