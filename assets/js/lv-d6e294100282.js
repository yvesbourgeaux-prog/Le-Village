(function(){const root=window.document.getElementById("lv-d6e294100282");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        let options = { root: null, rootMargin: '0px', threshold: 0.6 };

        let observerAudio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const container = video.closest('.arched-video-frame');
                
                if (entry.isIntersecting) {
                    container.classList.add('is-visible');
                    
                    // --- LOGIQUE MISE À JOUR : SON PAR DÉFAUT AU SCROLL ---
                    video.muted = false;
                    let playPromise = video.play();

                    if (playPromise !== undefined) {
                        playPromise.then(_ => {
                            // Le navigateur autorise le son
                            updateSoundUI(container, false); // Affiche l'icône son activé
                            updatePlayUI(container, true);
                        }).catch(error => {
                            // Si le navigateur bloque l'autoplay audio (sécurité Apple/Google), on force le muet
                            video.muted = true;
                            video.play();
                            updateSoundUI(container, true);
                            updatePlayUI(container, true);
                        });
                    }

                } else {
                    // La vidéo s'arrête dès qu'elle quitte l'écran
                    video.pause();
                    updatePlayUI(container, false);
                }
            });
        }, options);

        document.querySelectorAll('.obs-video').forEach(video => {
            observerAudio.observe(video);
        });
    });

    function toggleSound(videoId, buttonElement) {
        const video = document.getElementById(videoId);
        const container = video.closest('.arched-video-frame');
        video.muted = !video.muted;
        updateSoundUI(container, video.muted);
    }

    function toggleVideoPlay(videoId, buttonElement) {
        const video = document.getElementById(videoId);
        const container = video.closest('.arched-video-frame');
        if (video.paused) {
            video.play();
            updatePlayUI(container, true);
        } else {
            video.pause();
            updatePlayUI(container, false);
        }
    }

    function updatePlayUI(container, isPlaying) {
        const pauseIcon = container.querySelector('.pause-icon');
        const playIcon = container.querySelector('.play-icon');
        if(pauseIcon && playIcon) {
            if(isPlaying) {
                pauseIcon.classList.remove('hidden');
                playIcon.classList.add('hidden');
            } else {
                pauseIcon.classList.add('hidden');
                playIcon.classList.remove('hidden');
            }
        }
    }

    function updateSoundUI(container, isMuted) {
        const muteIcon = container.querySelector('.mute-icon');
        const unmuteIcon = container.querySelector('.unmute-icon');
        if(muteIcon && unmuteIcon) {
            if(isMuted) {
                muteIcon.classList.remove('hidden');
                unmuteIcon.classList.add('hidden');
            } else {
                muteIcon.classList.add('hidden');
                unmuteIcon.classList.remove('hidden');
            }
        }
    }

document.querySelector('[data-lv-event="h0"]')?.addEventListener("click",function(event){const result=(function(event){toggleSound('noelVideo', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h1"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('noelVideo', this)}).call(this,event);if(result===false)event.preventDefault();});
})();