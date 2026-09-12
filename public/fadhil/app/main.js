/**
 * CARIEARSA x FADHIL.DEV - Interactive Cyber Controller (2026-09-09)
 * Pure vanilla TypeScript/JavaScript, ultra-lightweight Web Audio API synthesis,
 * YouTube multi-video manager, dynamic language switcher, and responsive shortcuts.
 */

(() => {
  // 1. Procedural Web Audio API Synthesizer (Zero network asset, pure math)
  let audioCtx = null;
  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  };

  const playCyberSound = (type = 'click') => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (type === 'hover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } else {
        // High-tech crisp mechanical click
        const bufferSize = Math.floor(ctx.sampleRate * 0.035);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.035);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      }
    } catch (_) {}
  };

  // Delegated sound listeners
  document.addEventListener('pointerenter', (e) => {
    const target = e.target;
    if (target && target.closest && target.closest('a, button, .cyber-action-btn, .skill-pill-item, .core-lang-item, .social-slot-link, .tool-slot-item, .portfolio-card-item')) {
      playCyberSound('hover');
    }
  }, { passive: true, capture: true });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.closest && target.closest('a, button, .cyber-action-btn, .skill-pill-item, .core-lang-item, .social-slot-link, .tool-slot-item, .portfolio-card-item')) {
      playCyberSound('click');
    }
  }, { passive: true });

  // 2. Theme Switcher (Dark Manga / Light Manga)
  const themeToggle = document.querySelector(".theme-toggle");
  const setTheme = (isLight) => {
    document.body.classList.toggle("light-theme", isLight);
    document.body.setAttribute("data-theme", isLight ? "light" : "dark");
    themeToggle?.setAttribute("aria-pressed", String(isLight));
    themeToggle?.setAttribute(
      "aria-label",
      isLight ? "Switch to Cyber Dark theme" : "Switch to Manga Light theme"
    );
    try {
      localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
    } catch {}
  };

  try {
    setTheme(localStorage.getItem("portfolio-theme") === "light");
  } catch {
    setTheme(false);
  }

  const toggleTheme = () => {
    themeToggle?.classList.remove("is-spinning");
    if (themeToggle) void themeToggle.offsetWidth;
    themeToggle?.classList.add("is-spinning");
    setTheme(!document.body.classList.contains("light-theme"));
    playCyberSound('click');
  };

  themeToggle?.addEventListener("click", toggleTheme);
  themeToggle?.addEventListener("animationend", () => {
    themeToggle.classList.remove("is-spinning");
  });

  // 3. YouTube Embed Controller & Cyclic Banner Image Overlay (2s Show / 3s Hide)
  const heroTrigger = document.querySelector(".hero-media-wrap");
  const soundToggleBtn = document.getElementById("hero-sound-btn");
  const pictureLayer = document.querySelector(".hero-picture-layer");

  if (heroTrigger) {
    const startTime = parseInt(heroTrigger.dataset.youtubeStart || "11", 10);
    const iframe = document.getElementById("fadhil-hero-yt") || heroTrigger.querySelector("iframe");
    let ytPlayer = null;
    let isAudioActive = false;
    let isPlaying = false;

    // Banner image alternating visibility timer (2s show / 3s hide)
    let bannerCycleTimer = null;
    let isCycling = false;

    const startBannerCycle = () => {
      if (isCycling) return;
      isCycling = true;

      const cycle = () => {
        if (!isCycling || !pictureLayer) return;

        // Fase 1: Image tampil selama 2 detik (menutupi video)
        pictureLayer.classList.remove("is-hidden");
        pictureLayer.classList.add("is-visible");

        bannerCycleTimer = setTimeout(() => {
          if (!isCycling || !pictureLayer) return;

          // Fase 2: Image hide selama 3 detik (video kelihatan)
          pictureLayer.classList.remove("is-visible");
          pictureLayer.classList.add("is-hidden");

          bannerCycleTimer = setTimeout(() => {
            if (!isCycling) return;
            // Berulang kembali ke fase 1
            cycle();
          }, 3000); // Hide selama 3 detik
        }, 2000); // Tampil selama 2 detik
      };

      cycle();
    };

    const stopBannerCycle = () => {
      isCycling = false;
      if (bannerCycleTimer) {
        clearTimeout(bannerCycleTimer);
        bannerCycleTimer = null;
      }
      if (pictureLayer) {
        pictureLayer.classList.remove("is-hidden");
        pictureLayer.classList.add("is-visible");
      }
    };

    const sendYTCommand = (func, args = []) => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: "command",
          func: func,
          args: args
        }), "*");
      }
    };

    const activateVideoAndAudio = () => {
      isAudioActive = true;
      isPlaying = true;

      // 1. PostMessage immediate control (seek to 11s, unMute, 100% volume, play)
      sendYTCommand("seekTo", [startTime, true]);
      sendYTCommand("unMute");
      sendYTCommand("setVolume", [100]);
      sendYTCommand("playVideo");

      // 2. YT.Player API control if initialized
      if (ytPlayer && typeof ytPlayer.playVideo === "function") {
        try {
          ytPlayer.unMute?.();
          ytPlayer.setVolume?.(100);
          ytPlayer.playVideo?.();
        } catch (_) {}
      }

      // Update sound indicator button
      if (soundToggleBtn) {
        soundToggleBtn.innerHTML = '<span class="sound-icon">🔊</span><span class="sound-label">SOUND 100%</span>';
        soundToggleBtn.classList.add("is-active");
      }

      // Start the 2s show / 3s hide image alternating cycle
      startBannerCycle();
    };

    // YouTube Iframe API Initialization
    const initYT = () => {
      if (window.YT && window.YT.Player && iframe && !ytPlayer) {
        try {
          ytPlayer = new window.YT.Player(iframe, {
            events: {
              onReady: (event) => {
                event.target.seekTo(startTime, true);
                event.target.setVolume(100);
                if (isAudioActive) {
                  try {
                    event.target.unMute();
                    event.target.playVideo();
                  } catch (_) {}
                }
              },
              onStateChange: (event) => {
                // If ended (0), seamlessly loop back to 11s
                if (event.data === 0) {
                  event.target.seekTo(startTime, true);
                  event.target.playVideo();
                } else if (event.data === 1) { // PLAYING
                  isPlaying = true;
                  startBannerCycle();
                  if (isAudioActive) {
                    try {
                      event.target.unMute();
                      event.target.setVolume(100);
                    } catch (_) {}
                  }
                }
              }
            }
          });
        } catch (_) {}
      }
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      const prevHook = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevHook === "function") prevHook();
        initYT();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.append(script);
      }
    }

    // Response to user clicks/touches on the banner or sound button
    heroTrigger.addEventListener("click", () => {
      activateVideoAndAudio();
    });

    soundToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      activateVideoAndAudio();
    });

    // Merespon ketukan di mana saja pada document / window untuk memutar video dan mengaktifkan suara
    const gestureEvents = ['click', 'pointerdown', 'keydown', 'touchstart'];
    const handleUniversalGesture = () => {
      activateVideoAndAudio();
      gestureEvents.forEach(evt => window.removeEventListener(evt, handleUniversalGesture, { capture: true }));
    };
    gestureEvents.forEach(evt => window.addEventListener(evt, handleUniversalGesture, { capture: true, passive: true }));

    // Keyboard shortcut Shift+E untuk memicu video dari detik 11
    window.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const key = event.key.toLowerCase();
      if (event.shiftKey && (key === "e" || key === "s")) {
        event.preventDefault();
        activateVideoAndAudio();
      }
    });
  }

  // 4. Dynamic About Language Switcher (ID, EN, JP Flag Icons)
  const initLanguageSwitcher = () => {
    const textElem = document.getElementById("about-desc-content");
    const langBtns = document.querySelectorAll(".lang-flag-btn, .lang-btn");
    if (!textElem || !langBtns.length) return;

    const translations = {
      en: "A generalist hobbyist with interests in design, development, animation, cybersecurity, and 2D art (strictly as a hobby and personal interest, not pursued seriously).",
      id: "Seorang generalis penikmat hobi dengan minat pada bidang desain, pengembangan, animasi, keamanan siber, dan seni 2D (murni sebagai hobi dan minat pribadi, tidak ditekuni secara profesional/serius).",
      jp: "デザイン、開発、アニメーション、サイバーセキュリティ、2Dアートに関心を持つジェネラリスト愛好家です（純粋な趣味および個人的な関心として嗜んでおり、本業や専門的な追究ではありません）。"
    };

    const setLanguage = (lang) => {
      const activeLang = translations[lang] ? lang : "en";
      textElem.textContent = translations[activeLang];

      langBtns.forEach((btn) => {
        const isActive = btn.dataset.lang === activeLang;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      try {
        localStorage.setItem("cariearsa_fadhil_lang", activeLang);
      } catch (_) {}
    };

    langBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const lang = btn.dataset.lang;
        if (lang) {
          playCyberSound('click');
          setLanguage(lang);
        }
      });
    });

    try {
      const saved = localStorage.getItem("cariearsa_fadhil_lang");
      if (saved && translations[saved]) {
        setLanguage(saved);
      } else {
        setLanguage("en");
      }
    } catch (_) {
      setLanguage("en");
    }
  };

  initLanguageSwitcher();

  // 5. Easter Egg Keyboard Shortcuts (T+S: Theme, T+D: Dance)
  const activeKeys = new Set();
  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    activeKeys.add(event.key.toLowerCase());

    if (activeKeys.has("t") && activeKeys.has("s")) {
      event.preventDefault();
      toggleTheme();
      activeKeys.clear();
      return;
    }

    if (activeKeys.has("t") && activeKeys.has("d")) {
      event.preventDefault();
      document.documentElement.classList.toggle("text-rainbow");
      activeKeys.clear();
    }
  });

  window.addEventListener("keyup", (event) => {
    activeKeys.delete(event.key.toLowerCase());
  });

  // 6. Title Change on Tab Blur
  const originalTitle = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "戻ってきて！ (PORTFOLIO STANDBY)" : originalTitle;
  });
})();
