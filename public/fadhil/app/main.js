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

  // 3. YouTube Multi-Video Manager (Shift+E: Video 1, Shift+S: Video 2)
  const heroTrigger = document.querySelector(".hero-media-wrap");
  const soundToggleBtn = document.getElementById("hero-sound-btn");
  if (heroTrigger) {
    const primaryVideoId = heroTrigger.dataset.youtubeVideoId || "9wp5jBgOcKo";
    const secondaryVideoId = heroTrigger.dataset.youtubeSecondaryVideoId || "GzUa3kGo03A";
    const layer = heroTrigger.querySelector(".hero-video-frame-layer");
    let ytPlayer = null;
    let activeVideoId = null;
    let pendingVideoId = null;
    let playerReady = false;

    const loadYouTubeApi = () => {
      if (window.YT?.Player) return Promise.resolve(window.YT);
      return new Promise((resolve) => {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve(window.YT);
        };
        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
          const script = document.createElement("script");
          script.src = "https://www.youtube.com/iframe_api";
          script.async = true;
          document.head.append(script);
        }
      });
    };

    const buildEmbedUrl = (videoId) => {
      const url = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
      url.search = new URLSearchParams({
        autoplay: "1",
        controls: "1",
        enablejsapi: "1",
        playsinline: "1",
        rel: "0",
        origin: window.location.origin,
        mute: "0",
        widget_referrer: window.location.href,
      }).toString();
      return url.toString();
    };

    const playLoud = () => {
      if (!ytPlayer) return;
      try {
        ytPlayer.unMute?.();
        ytPlayer.setVolume?.(100);
        ytPlayer.playVideo?.();
      } catch (_) {}
      if (soundToggleBtn) {
        soundToggleBtn.innerHTML = '<span>🔊</span><span>SOUND ON (100%)</span>';
      }
    };

    const createPlayer = async (videoId) => {
      if (!videoId || !layer || pendingVideoId === videoId) return;
      pendingVideoId = videoId;

      if (ytPlayer) {
        try {
          ytPlayer.stopVideo?.();
          ytPlayer.destroy?.();
        } catch (_) {}
        ytPlayer = null;
        playerReady = false;
      }

      const iframe = document.createElement("iframe");
      iframe.src = buildEmbedUrl(videoId);
      iframe.title = "YouTube Video Player";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      layer.replaceChildren(iframe);

      activeVideoId = videoId;
      heroTrigger.classList.add("is-video-active");

      const YT = await loadYouTubeApi();
      ytPlayer = new YT.Player(iframe, {
        events: {
          onReady: (event) => {
            playerReady = true;
            pendingVideoId = null;
            try {
              event.target.unMute();
              event.target.setVolume(100);
              event.target.playVideo();
            } catch (_) {}
            playLoud();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              playLoud();
            }
          }
        }
      });
    };

    const switchVideo = (videoId) => {
      if (!videoId) return;
      heroTrigger.classList.add("is-video-active");
      if (activeVideoId === videoId && playerReady) {
        playLoud();
        return;
      }
      createPlayer(videoId);
    };

    heroTrigger.addEventListener("click", () => switchVideo(primaryVideoId));
    soundToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!heroTrigger.classList.contains("is-video-active")) {
        switchVideo(primaryVideoId);
      } else {
        playLoud();
      }
    });

    // Keyboard controls (Shift+E, Shift+S)
    window.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const key = event.key.toLowerCase();
      if (event.shiftKey && key === "s") {
        event.preventDefault();
        switchVideo(secondaryVideoId);
      } else if (event.shiftKey && key === "e") {
        event.preventDefault();
        switchVideo(primaryVideoId);
      }
    });
  }

  // 4. Dynamic About Language Switcher (ID, EN, JP)
  const initLanguageSwitcher = () => {
    const textElem = document.getElementById("about-desc-content");
    const langBtns = document.querySelectorAll(".lang-btn");
    if (!textElem || !langBtns.length) return;

    const translations = {
      en: "A trilingual hobbyist generalist in development, writing, cybersecurity, editing, and analysis.",
      id: "Seorang generalis hobiis trilingual dalam pengembangan, penulisan, keamanan siber, penyuntingan, dan analisis.",
      jp: "開発、執筆、サイバーセキュリティ、編集、分析を行うトライリンガルの趣味探求型ジェネラリスト。"
    };

    const setLanguage = (lang) => {
      if (!translations[lang]) return;
      textElem.textContent = translations[lang];

      langBtns.forEach((btn) => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      try {
        localStorage.setItem("cariearsa_fadhil_lang", lang);
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
      if (saved && translations[saved]) setLanguage(saved);
    } catch (_) {}
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
