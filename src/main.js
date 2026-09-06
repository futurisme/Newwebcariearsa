document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab Focus Title Change Effect
  const originalTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? '戻ってきて！ (SYSTEM STANDBY)' : originalTitle;
  });

  // 2. Synthesized "Paper Flip / Turn" Sound (Lazy-initialized on user gesture)
  let audioCtx = null;
  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  };
  
  const playPaperFlip = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = Math.floor(ctx.sampleRate * 0.04); // 40ms burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (_) {}
  };

  // Delegated sound triggers (ultra-lightweight memory footprint)
  document.addEventListener('pointerenter', (e) => {
    const target = e.target;
    if (target && target.closest && target.closest('a, button, .custom-shape-btn, .manga-btn')) {
      playPaperFlip();
    }
  }, { passive: true, capture: true });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.closest && target.closest('a, button, .custom-shape-btn, .manga-btn')) {
      playPaperFlip();
    }
  }, { passive: true });

  // Attach subtle sound to scrolling (debounced with passive listener)
  let scrollTimeout = 0;
  window.addEventListener('wheel', () => {
    if (scrollTimeout) return;
    playPaperFlip();
    scrollTimeout = window.setTimeout(() => { scrollTimeout = 0; }, 250);
  }, { passive: true });

  // 3. Automated Floating Japanese SFX (Visibility-aware, throttled, zero leak)
  const sfxList = ['ドンッ!!', 'ゴゴゴ', 'ドドドド', 'バァァァン', 'ズキュウゥン', 'カッ', 'シャアァ', 'パラッ'];
  let activeSfxCount = 0;
  const MAX_CONCURRENT_SFX = 3;

  const spawnFloatingSfx = () => {
    if (document.hidden) return;
    if (activeSfxCount >= MAX_CONCURRENT_SFX) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    activeSfxCount++;
    const sfx = document.createElement('div');
    sfx.textContent = sfxList[Math.floor(Math.random() * sfxList.length)];
    sfx.style.position = 'fixed';
    sfx.style.left = `${Math.random() * 75 + 10}vw`;
    sfx.style.top = `${Math.random() * 75 + 10}vh`;
    sfx.style.fontFamily = "'Noto Sans JP', sans-serif";
    sfx.style.fontWeight = '900';
    sfx.style.fontSize = `${Math.random() * 1.3 + 1}rem`;
    sfx.style.color = Math.random() > 0.5 ? '#BC002D' : '#1A1A1A';
    sfx.style.webkitTextStroke = '1px #FFFFFF';
    sfx.style.pointerEvents = 'none';
    sfx.style.zIndex = '9998';
    sfx.style.opacity = '0';
    sfx.style.transform = `translate3d(0, 0, 0) rotate(${Math.random() * 40 - 20}deg) scale(0.6)`;
    sfx.style.transition = 'transform 3.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 3.5s ease-out';
    sfx.style.willChange = 'transform, opacity';
    
    document.body.appendChild(sfx);

    requestAnimationFrame(() => {
      sfx.style.opacity = '0.55';
      sfx.style.transform = `translate3d(0, -60px, 0) rotate(${Math.random() * 40 - 20}deg) scale(1.15)`;
    });

    setTimeout(() => {
      sfx.style.opacity = '0';
      sfx.style.transform = `translate3d(0, -110px, 0) scale(0.85)`;
      setTimeout(() => {
        if (sfx.parentNode) sfx.parentNode.removeChild(sfx);
        activeSfxCount = Math.max(0, activeSfxCount - 1);
      }, 1000);
    }, 2200);
  };
  
  const sfxInterval = setInterval(spawnFloatingSfx, 2800);
  setTimeout(spawnFloatingSfx, 400);

  // 4. Hardware-Accelerated 120 FPS Parallax Effect (RAF Throttled)
  const panels = document.querySelectorAll('.panel');
  panels.forEach(panel => {
    const img = panel.querySelector('.manga-img');
    if (!img) return;

    let rafId = null;
    let cachedRect = null;

    panel.addEventListener('mouseenter', () => {
      cachedRect = panel.getBoundingClientRect();
      panel.classList.add('comic-shake');
      setTimeout(() => panel.classList.remove('comic-shake'), 300);
    }, { passive: true });

    panel.addEventListener('mousemove', (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!cachedRect) cachedRect = panel.getBoundingClientRect();
        const x = e.clientX - cachedRect.left;
        const y = e.clientY - cachedRect.top;
        const xOffset = ((x / cachedRect.width) - 0.5) * 8;
        const yOffset = ((y / cachedRect.height) - 0.5) * 8;
        img.style.transform = `scale(1.05) translate3d(${xOffset.toFixed(1)}px, ${yOffset.toFixed(1)}px, 0)`;
        img.style.filter = 'grayscale(0) contrast(1.1)';
      });
    }, { passive: true });

    panel.addEventListener('mouseleave', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      cachedRect = null;
      img.style.transform = 'scale(1) translate3d(0, 0, 0)';
      img.style.filter = 'grayscale(100%) contrast(1.2)';
    }, { passive: true });
  });

  // 6. High-Precision YouTube Background Video & Audio Controller (GEMN "Fatal", start 2:58 / 178s)
  const initHeroVideoController = () => {
    const iframe = document.getElementById('hero-yt-player');
    const heroPanel = document.getElementById('intro');
    const soundToggle = document.getElementById('hero-sound-toggle');
    if (!iframe) return;

    let isAudioActive = false;
    let ytPlayer = null;

    const sendYTCommand = (func, args = []) => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: func,
          args: args
        }), '*');
      }
    };

    const activateAudio = () => {
      isAudioActive = true;

      // 1. Send commands via PostMessage protocol immediately
      sendYTCommand('unMute');
      sendYTCommand('setVolume', [100]);
      sendYTCommand('playVideo');

      // 2. Control via YT.Player instance if initialized
      if (ytPlayer && typeof ytPlayer.unMute === 'function') {
        try {
          ytPlayer.unMute();
          ytPlayer.setVolume(100);
          ytPlayer.playVideo();
        } catch (_) {}
      }

      // Update audio status badge UI
      if (soundToggle) {
        soundToggle.classList.remove('needs-unmute');
        soundToggle.innerHTML = '<span class="sound-icon">🔊</span><span class="sound-text">SOUND ON (100%)</span>';
        soundToggle.title = 'Audio video YouTube aktif dan jernih (100% Volume)';
      }
    };

    // Expose globally for cinematic intro hooks
    window.__cariearsa_activate_hero_audio = activateAudio;

    // Direct YouTube Player API Hook
    const setupYTPlayer = () => {
      if (window.YT && window.YT.Player && !ytPlayer) {
        try {
          ytPlayer = new window.YT.Player('hero-yt-player', {
            events: {
              onReady: (event) => {
                event.target.seekTo(178, true);
                event.target.setVolume(100);
                try {
                  event.target.unMute();
                  event.target.playVideo();
                  if (!event.target.isMuted()) {
                    isAudioActive = true;
                    if (soundToggle) {
                      soundToggle.classList.remove('needs-unmute');
                      soundToggle.innerHTML = '<span class="sound-icon">🔊</span><span class="sound-text">SOUND ON (100%)</span>';
                    }
                  } else if (soundToggle) {
                    soundToggle.classList.add('needs-unmute');
                    soundToggle.innerHTML = '<span class="sound-icon">🔈</span><span class="sound-text">UNMUTE AUDIO</span>';
                  }
                } catch (_) {
                  if (soundToggle) soundToggle.classList.add('needs-unmute');
                }
              },
              onStateChange: (event) => {
                // If ended (0), loop back seamlessly to 178s
                if (event.data === 0) {
                  event.target.seekTo(178, true);
                  event.target.playVideo();
                }
              }
            }
          });
        } catch (err) {
          console.warn('YT Player init fallback', err);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      setupYTPlayer();
    } else {
      const prevHook = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevHook === 'function') prevHook();
        setupYTPlayer();
      };
    }

    // Instant trial on page load
    setTimeout(() => {
      sendYTCommand('seekTo', [178, true]);
      sendYTCommand('setVolume', [100]);
      sendYTCommand('unMute');
      sendYTCommand('playVideo');
    }, 400);

    // Universal unlocker on first user gesture anywhere on the window/document
    const gestureEvents = ['click', 'pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    const handleFirstGesture = () => {
      activateAudio();
      gestureEvents.forEach(evt => window.removeEventListener(evt, handleFirstGesture, { capture: true }));
    };
    gestureEvents.forEach(evt => window.addEventListener(evt, handleFirstGesture, { capture: true, passive: true }));

    // Interactive button & panel clicks
    if (soundToggle) {
      soundToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        activateAudio();
        sendYTCommand('playVideo');
      });
    }

    if (heroPanel) {
      heroPanel.addEventListener('click', () => {
        activateAudio();
        sendYTCommand('playVideo');
      });
    }
  };

  initHeroVideoController();

  // 9. About Description Accurate Language Switcher (ID, EN, JP)
  const initAboutLanguageSwitcher = () => {
    const textElem = document.getElementById('about-text-content');
    const flagBtns = document.querySelectorAll('.lang-flag-btn');
    if (!textElem || !flagBtns.length) return;

    const translations = {
      id: "Koleksi aset digital dan portofolio di bawah kepemilikan pribadi.",
      en: "A collection of digital assets and portfolios under personal ownership.",
      jp: "個人所有のデジタルアセットおよびポートフォリオのコレクション。"
    };

    const setLanguage = (lang) => {
      if (!translations[lang]) return;
      
      textElem.textContent = translations[lang];
      
      flagBtns.forEach((btn) => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      try {
        localStorage.setItem('cariearsa_about_lang', lang);
      } catch (_) {}
    };

    flagBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        if (lang) setLanguage(lang);
      });
    });

    // Initialize with saved preference if any, otherwise default to EN
    try {
      const savedLang = localStorage.getItem('cariearsa_about_lang');
      if (savedLang && translations[savedLang]) {
        setLanguage(savedLang);
      }
    } catch (_) {}
  };

  initAboutLanguageSwitcher();
});
