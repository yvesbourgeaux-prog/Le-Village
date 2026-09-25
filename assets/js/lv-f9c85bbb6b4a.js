(function(){const root=window.document.getElementById("lv-f9c85bbb6b4a");if(!root)return;const document=window.lvScopedDocument(root);

    document.addEventListener("DOMContentLoaded", function() {
        // Le seuil de déclenchement : lance la vidéo quand elle apparaît à l'écran
        let options = { root: null, rootMargin: '0px', threshold: 0.3 };

        let observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                const container = video.closest('.mini-arched-video');
                
                if (entry.isIntersecting) {
                    container.classList.add('is-visible');
                    
                    // --- GESTION AUDIO SELON LA SAISON ---
                    if (video.id === 'video-printemps') {
                        // 1. PRINTEMPS : Tente de jouer AVEC le son par défaut
                        video.muted = false;
                        let playPromise = video.play();

                        if (playPromise !== undefined) {
                            playPromise.then(_ => {
                                // Succès : le son est activé
                                updateSoundUI(container, false); 
                                updatePlayUI(container, true);
                            }).catch(error => {
                                // Échec (navigateur strict) : on passe en muet pour jouer quand même l'image
                                video.muted = true;
                                video.play();
                                updateSoundUI(container, true); 
                                updatePlayUI(container, true);
                            });
                        }
                    } else {
                        // 2. ÉTÉ, AUTOMNE, HIVER : Jouent TOUJOURS en muet par défaut
                        video.muted = true;
                        video.play();
                        // Met à jour l'UI (le bouton affichera l'icône "son coupé")
                        if (video.id !== 'video-ete') {
                            updateSoundUI(container, true); 
                        }
                        updatePlayUI(container, true);
                    }

                } else {
                    // La vidéo sort de l'écran = Pause automatique pour alléger le navigateur
                    video.pause();
                    updatePlayUI(container, false);
                }
            });
        }, options);

        // Appliquer l'observateur à toutes les vidéos (et s'assurer qu'elles ne jouent pas avant)
        document.querySelectorAll('.obs-video').forEach(video => {
            video.pause();
            observer.observe(video);
        });
    });

    // Gestion du bouton Son manuel (Printemps, Automne, Hiver)
    function toggleSound(videoId, buttonElement) {
        const video = document.getElementById(videoId);
        const container = video.closest('.mini-arched-video');

        video.muted = !video.muted;
        updateSoundUI(container, video.muted);
    }

    // Gestion du bouton Play/Pause manuel (Toutes les vidéos)
    function toggleVideoPlay(videoId, buttonElement) {
        const video = document.getElementById(videoId);
        const container = video.closest('.mini-arched-video');

        if (video.paused) {
            video.play();
            updatePlayUI(container, true);
        } else {
            video.pause();
            updatePlayUI(container, false);
        }
    }

    // Mise à jour de l'icône de lecture
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

    // Mise à jour de l'icône de son
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

document.querySelector('[data-lv-event="h0"]')?.addEventListener("click",function(event){const result=(function(event){toggleSound('video-printemps', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h1"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('video-printemps', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h2"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('video-ete', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h3"]')?.addEventListener("click",function(event){const result=(function(event){toggleSound('video-automne', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h4"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('video-automne', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h5"]')?.addEventListener("click",function(event){const result=(function(event){toggleSound('video-hiver', this)}).call(this,event);if(result===false)event.preventDefault();});
document.querySelector('[data-lv-event="h6"]')?.addEventListener("click",function(event){const result=(function(event){toggleVideoPlay('video-hiver', this)}).call(this,event);if(result===false)event.preventDefault();});
})();