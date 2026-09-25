(function(){const root=window.document.getElementById("lv-582b5edb21a2");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        let options = { root: null, rootMargin: '0px', threshold: 0.6 };

        const forceMute = (video) => {
            video.muted = true;
            video.defaultMuted = true;
            video.volume = 0;
        };

        let observerAudio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const container = video.closest('.arched-video-frame');
                if (entry.isIntersecting) {
                    forceMute(video); // La vidéo reste toujours silencieuse.
                    let playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                            updatePlayUI(container, true);
                        }).catch(error => {
                            console.warn("Lecture vidéo retardée ou bloquée par le navigateur :", error);
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
            forceMute(video);
            video.addEventListener('play', () => forceMute(video));
            observerAudio.observe(video);
        });
    });

    function toggleVideoPlay(videoId, buttonElement) {
        const video = document.getElementById(videoId);
        const container = video.closest('.arched-video-frame');
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        if (video.paused) { 
            let playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    updatePlayUI(container, true);
                }).catch(error => {
                    console.warn("Erreur au lancement manuel de la vidéo :", error);
                    updatePlayUI(container, false);
                });
            }
        } 
        else { 
            video.pause(); 
            updatePlayUI(container, false); 
        }
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