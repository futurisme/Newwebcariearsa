(() => {
  let audioCtx = null;
  let isAudioUnlocked = false;

  const unlockAudio = () => {
    isAudioUnlocked = true;
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };

  ['click', 'pointerdown', 'keydown', 'touchstart'].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { capture: true, passive: true });
  });

  const getAudioContext = () => {
    const hasGesture = isAudioUnlocked || (typeof navigator !== 'undefined' && navigator.userActivation && navigator.userActivation.hasBeenActive);
    if (!hasGesture) return null;

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

  const themeToggle = document.querySelector(".theme-toggle");
  const setTheme = (isLight) => {
    document.body.classList.toggle("light-theme", isLight);
    document.body.setAttribute("data-theme", isLight ? "light" : "dark");
    themeToggle?.setAttribute("aria-pressed", String(isLight));
    themeToggle?.setAttribute(
      "aria-label",
      isLight ? "Switch to Cyber Dark theme" : "Switch to Manga Light theme"
    );
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", isLight ? "#240308" : "#05060A");
    }
  };

  // Enforce default ALWAYS dark theme upon entry, refresh, or returning to page
  try {
    localStorage.removeItem("portfolio-theme");
  } catch {}
  setTheme(false);

  const toggleTheme = () => {
    if (themeToggle) {
      themeToggle.classList.remove("is-spinning");
      requestAnimationFrame(() => {
        themeToggle.classList.add("is-spinning");
      });
    }
    const isNowLight = !document.body.classList.contains("light-theme");
    setTheme(isNowLight);
    playCyberSound('click');
  };

  themeToggle?.addEventListener("click", toggleTheme);
  themeToggle?.addEventListener("animationend", () => {
    themeToggle.classList.remove("is-spinning");
  });

  const heroTrigger = document.querySelector(".hero-media-wrap");
  const soundToggleBtn = document.getElementById("hero-sound-btn");
  const pictureLayer = document.querySelector(".hero-picture-layer");

  if (heroTrigger) {
    const startTime = parseInt(heroTrigger.dataset.youtubeStart || "6", 10);
    const iframe = document.getElementById("fadhil-hero-yt") || heroTrigger.querySelector("iframe");
    let ytPlayer = null;
    let isAudioActive = false;
    let isPlaying = false;

    let bannerCycleTimer = null;
    let isCycling = false;

    const startBannerCycle = () => {
      if (isCycling) return;
      isCycling = true;

      const cycle = () => {
        if (!isCycling || !pictureLayer) return;

        pictureLayer.classList.remove("is-hidden");
        pictureLayer.classList.add("is-visible");

        bannerCycleTimer = setTimeout(() => {
          if (!isCycling || !pictureLayer) return;

          pictureLayer.classList.remove("is-visible");
          pictureLayer.classList.add("is-hidden");

          bannerCycleTimer = setTimeout(() => {
            if (!isCycling) return;
            cycle();
          }, 3000);
        }, 2000);
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

      sendYTCommand("seekTo", [startTime, true]);
      sendYTCommand("unMute");
      sendYTCommand("setVolume", [100]);
      sendYTCommand("setPlaybackQuality", ["hd1080"]);
      sendYTCommand("setPlaybackQualityRange", ["hd1080", "highres"]);
      sendYTCommand("playVideo");

      if (ytPlayer && typeof ytPlayer.playVideo === "function") {
        try {
          ytPlayer.seekTo?.(startTime, true);
          ytPlayer.unMute?.();
          ytPlayer.setVolume?.(100);
          ytPlayer.setPlaybackQuality?.("hd1080");
          if (typeof ytPlayer.setPlaybackQualityRange === "function") {
            ytPlayer.setPlaybackQualityRange("hd1080", "highres");
          }
          ytPlayer.playVideo?.();
        } catch (_) {}
      }

      if (soundToggleBtn) {
        soundToggleBtn.innerHTML = '<span class="sound-icon">🔊</span><span class="sound-label">SOUND 100%</span>';
        soundToggleBtn.classList.add("is-active");
      }

      startBannerCycle();
    };

    const initYT = () => {
      if (window.YT && window.YT.Player && iframe && !ytPlayer) {
        try {
          ytPlayer = new window.YT.Player(iframe, {
            events: {
              onReady: (event) => {
                event.target.seekTo(startTime, true);
                event.target.setVolume(100);
                try {
                  event.target.setPlaybackQuality("hd1080");
                  if (typeof event.target.setPlaybackQualityRange === "function") {
                    event.target.setPlaybackQualityRange("hd1080", "highres");
                  }
                } catch (_) {}
                if (isAudioActive) {
                  try {
                    event.target.unMute();
                    event.target.playVideo();
                  } catch (_) {}
                }
              },
              onStateChange: (event) => {
                try {
                  event.target.setPlaybackQuality("hd1080");
                } catch (_) {}
                if (event.data === 0) {
                  event.target.seekTo(startTime, true);
                  event.target.playVideo();
                } else if (event.data === 1) {
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

    heroTrigger.addEventListener("click", () => {
      activateVideoAndAudio();
    });

    heroTrigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateVideoAndAudio();
      }
    });

    soundToggleBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      activateVideoAndAudio();
    });

    soundToggleBtn?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        activateVideoAndAudio();
      }
    });

    const gestureEvents = ['click', 'pointerdown', 'keydown', 'touchstart'];
    const handleUniversalGesture = () => {
      activateVideoAndAudio();
      gestureEvents.forEach(evt => window.removeEventListener(evt, handleUniversalGesture, { capture: true }));
    };
    gestureEvents.forEach(evt => window.addEventListener(evt, handleUniversalGesture, { capture: true, passive: true }));

    window.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const key = event.key.toLowerCase();
      if (event.shiftKey && (key === "e" || key === "s")) {
        event.preventDefault();
        activateVideoAndAudio();
      }
    });
  }

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
      document.documentElement.lang = activeLang === 'jp' ? 'ja' : activeLang;

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
        langBtns.forEach((other) => {
          if (other !== btn) other.classList.remove("is-clicked");
        });
        btn.classList.add("is-clicked");
        setTimeout(() => {
          btn.classList.remove("is-clicked");
        }, 600);
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
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

  const originalTitle = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "戻ってきて！ (PORTFOLIO STANDBY)" : originalTitle;
  });

  const bindInteractiveGroup = (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((item) => {
      const handleActivate = () => {
        elements.forEach((other) => {
          if (other !== item) other.classList.remove("is-clicked");
        });
        item.classList.add("is-clicked");
        playCyberSound('click');
        setTimeout(() => {
          item.classList.remove("is-clicked");
        }, 700);
      };

      item.addEventListener("click", handleActivate);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (item.tagName.toLowerCase() !== 'a') {
            e.preventDefault();
          }
          handleActivate();
        }
      });
    });
  };

  bindInteractiveGroup(".core-lang-item");
  bindInteractiveGroup(".social-slot-link");
  bindInteractiveGroup(".tool-slot-item");
  bindInteractiveGroup(".skill-pill-item");
})();
