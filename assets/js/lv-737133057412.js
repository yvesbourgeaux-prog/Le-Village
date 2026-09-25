(function(){const root=window.document.getElementById("lv-737133057412");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        
        let options = { root: null, rootMargin: '0px', threshold: 0.6 };

        let observerAudio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const container = video.closest('.arched-video-frame');
                
                if (entry.isIntersecting) {
                    container.classList.add('is-visible');
                    
                    // --- LOGIQUE DIFFÉRENCIÉE POUR LES 2 VIDÉOS ---
                    
                    if (video.id === 'chefVideo1') {
                        // VIDÉO 1 (LE CHEF) : On force le muet
                        video.muted = true;
                        video.play();
                        updateSoundUI(container, true); // true = bouton barré
                        updatePlayUI(container, true);
                    } 
                    else if (video.id === 'chefVideo2') {
                        // VIDÉO 2 (AMBIANCE) : On tente avec le son
                        video.muted = false;
                        let playPromise = video.play();

                        if (playPromise !== undefined) {
                            playPromise.then(_ => {
                                // Le navigateur a autorisé le son
                                updateSoundUI(container, false); // false = son visible
                                updatePlayUI(container, true);
                            }).catch(error => {
                                // Le navigateur a bloqué le son, on bascule en muet forcé
                                video.muted = true;
                                video.play();
                                updateSoundUI(container, true); // true = bouton barré
                                updatePlayUI(container, true);
                            });
                        }
                    }

                } else {
                    // Hors champ : on met en pause
                    video.pause();
                    updatePlayUI(container, false);
                }
            });
        }, options);

        document.querySelectorAll('.obs-video').forEach(video => {
            observerAudio.observe(video);
        });
    });

    // Gestion du bouton Son manuel (en bas à gauche)
    function toggleSound(videoId, buttonElement) {
        const video = document.getElementById(videoId);
        const container = video.closest('.arched-video-frame');

        video.muted = !video.muted;
        updateSoundUI(container, video.muted);
    }

    // Gestion du bouton Play/Pause manuel (en bas à droite)
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

    // Fonctions pour changer les icônes
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

document.querySelector('[data-lv-event="h0"]')?.addEventListener("click",function(event){const result=(function(event){toggleSound('chefVideo1', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h1"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('chefVideo1', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h2"]')?.addEventListener("click",function(event){const result=(function(event){toggleSound('chefVideo2', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h3"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('chefVideo2', this)}).call(this,event);if(result===false)event.preventDefault();});
})();