'use strict';
(() => {
 const header=document.querySelector('.home-header');
 if(!header)return;
 const update=()=>header.classList.toggle('is-scrolled',window.scrollY>24);
 update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('pageshow',update);
 const toggle=header.querySelector('.menu-toggle');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&header.contains(document.activeElement))toggle.focus();});
 const heroVideo=document.querySelector('#village-hotel-top-block .hotel-hero video');
 if(!heroVideo)return;
 // iPad Safari can reject muted autoplay (for example in Low Power Mode).
 // Keep a tap target available whenever the poster remains visible.
 const labels={fr:'Lire la vidéo',en:'Play video',sv:'Spela upp video',da:'Afspil video',nl:'Video afspelen',de:'Video abspielen',it:'Riproduci video',es:'Reproducir vídeo',ja:'動画を再生', 'zh-CN':'播放视频',nb:'Spill av video',ru:'Воспроизвести видео',pl:'Odtwórz wideo'};
 const locale=document.documentElement.lang||'fr';
 const playButton=document.createElement('button');
 playButton.type='button';
 playButton.className='hotel-hero-play';
 playButton.textContent='▶ ' + (labels[locale]||labels.en);
 playButton.setAttribute('aria-label',labels[locale]||labels.en);
 playButton.hidden=true;
 heroVideo.parentElement.appendChild(playButton);
 const updatePlayButton=()=>{playButton.hidden=!heroVideo.paused && !heroVideo.ended;};
 const tryAutoplay=()=>{
  if(document.hidden)return;
  heroVideo.muted=true;
  heroVideo.setAttribute('playsinline','');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){updatePlayButton();return;}
  const attempt=heroVideo.play();
  if(attempt && typeof attempt.catch==='function')attempt.catch(updatePlayButton);
  window.setTimeout(updatePlayButton,1200);
 };
 playButton.addEventListener('click',()=>{
  const attempt=heroVideo.play();
  if(attempt && typeof attempt.catch==='function')attempt.catch(updatePlayButton);
 });
 heroVideo.addEventListener('playing',updatePlayButton);
 heroVideo.addEventListener('pause',updatePlayButton);
 heroVideo.addEventListener('error',updatePlayButton);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden && heroVideo.paused)tryAutoplay();});
 window.addEventListener('pageshow',()=>{if(heroVideo.paused)tryAutoplay();});
 tryAutoplay();

})();
