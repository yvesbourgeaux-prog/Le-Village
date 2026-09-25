(function(){const root=window.document.getElementById("lv-1c9e2557b0a5");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        const options = { root: null, rootMargin: '120px 0px', threshold: 0.35 };

        const observerVideo = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const container = video.closest('.arched-video-frame');

                // La vidéo reste toujours silencieuse, y compris après une interaction.
                video.muted = true;
                video.volume = 0;

                if (entry.isIntersecting) {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            updatePlayUI(container, true);
                        }).catch(() => {
                            updatePlayUI(container, false);
                        });
                    }
                } else {
                    video.pause();
                    updatePlayUI(container, false);
                }
            });
        }, options);

        document.querySelectorAll('.obs-video').forEach(video => {
            video.muted = true;
            video.volume = 0;
            observerVideo.observe(video);
        });
    });

    function toggleVideoPlay(videoId, buttonElement) {
        const video = document.getElementById(videoId);
        const container = video.closest('.arched-video-frame');
        if (video.paused) { video.play(); updatePlayUI(container, true); } 
        else { video.pause(); updatePlayUI(container, false); }
    }

    function updatePlayUI(container, isPlaying) {
        const pauseIcon = container.querySelector('.pause-icon');
        const playIcon = container.querySelector('.play-icon');
        if(pauseIcon && playIcon) {
            if(isPlaying) { pauseIcon.classList.remove('hidden'); playIcon.classList.add('hidden'); } 
            else { pauseIcon.classList.add('hidden'); playIcon.classList.remove('hidden'); }
        }
    }

    /* PARTAGE SOCIAL */
    function getShareUrl() { try { return encodeURIComponent((window.top && window.top.location.href) ? window.top.location.href : window.location.href); } catch (e) { return encodeURIComponent(window.location.href); } }
    function getShareText() { try { return encodeURIComponent(document.title + ' - ' + ((window.top && window.top.location.href) ? window.top.location.href : window.location.href)); } catch (e) { return encodeURIComponent(document.title + ' - ' + window.location.href); } }
    function shareOnFacebook() { window.open('https://www.facebook.com/sharer/sharer.php?u=' + getShareUrl(), '_blank', 'width=640,height=580'); }
    function shareOnWhatsApp() { window.open('https://wa.me/?text=' + getShareText(), '_blank'); }
    function copyPageLink() {
        let url = '';
        try { url = (window.top && window.top.location.href) ? window.top.location.href : window.location.href; } catch (e) { url = window.location.href; }
        navigator.clipboard.writeText(url).then(() => { alert('Lien copié'); }).catch(() => { prompt('Copiez ce lien :', url); });
    }

document.querySelector('[data-lv-event="h0"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('jazzVideo', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h1"]')?.addEventListener("click",function(event){const result=(function(event){event.preventDefault(); shareOnFacebook();}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h2"]')?.addEventListener("click",function(event){const result=(function(event){event.preventDefault(); copyPageLink();}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h3"]')?.addEventListener("click",function(event){const result=(function(event){event.preventDefault(); shareOnWhatsApp();}).call(this,event);if(result===false)event.preventDefault();});
})();