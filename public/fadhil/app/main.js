(() => {
  const trigger = document.querySelector(".hero-video-trigger");
  const themeToggle = document.querySelector(".theme-toggle");

  const setTheme = (isLight) => {
    document.body.classList.toggle("light-theme", isLight);
    themeToggle?.setAttribute("aria-pressed", String(isLight));
    themeToggle?.setAttribute(
      "aria-label",
      isLight
        ? "Switch to original dark theme"
        : "Switch to elegant light theme",
    );
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isLight ? "#f3f2ef" : "#261015");
    try {
      localStorage.setItem("portfolio-theme", isLight ? "light" : "dark");
    } catch {}
  };

  try {
    setTheme(localStorage.getItem("portfolio-theme") === "light");
  } catch {
    setTheme(false);
  }

  const blockContentExtraction = (event) => {
    event.preventDefault();
  };

  for (const eventName of [
    "copy",
    "cut",
    "dragstart",
    "selectstart",
    "contextmenu",
  ]) {
    document.addEventListener(eventName, blockContentExtraction, {
      capture: true,
      passive: false,
    });
  }

  const activeKeys = new Set();
  const isTextDanceShortcut = () => activeKeys.has("t") && activeKeys.has("d");
  const isThemeShortcut = () => activeKeys.has("t") && activeKeys.has("s");
  const toggleTheme = () => {
    themeToggle?.classList.remove("is-spinning");
    if (themeToggle) void themeToggle.offsetWidth;
    themeToggle?.classList.add("is-spinning");
    setTheme(!document.body.classList.contains("light-theme"));
  };

  themeToggle?.addEventListener("click", toggleTheme);

  themeToggle?.addEventListener("animationend", () => {
    themeToggle.classList.remove("is-spinning");
  });

  if (trigger) {
    const primaryVideoId = trigger.dataset.youtubeVideoId;
    const secondaryVideoId = trigger.dataset.youtubeSecondaryVideoId;
    const layer = trigger.querySelector(".hero-video-layer");
    let player;
    let activeVideoId;
    let pendingVideoId;
    let playerReady = false;
    let iframeSerial = 0;
    let apiPromise;

    const loadYouTubeApi = () => {
      if (window.YT?.Player) return Promise.resolve(window.YT);
      if (apiPromise) return apiPromise;

      apiPromise = new Promise((resolve) => {
        const previousReady = window.onYouTubeIframeAPIReady;

        window.onYouTubeIframeAPIReady = () => {
          previousReady?.();
          resolve(window.YT);
        };

        if (
          !document.querySelector(
            'script[src="https://www.youtube.com/iframe_api"]',
          )
        ) {
          const apiScript = document.createElement("script");
          apiScript.src = "https://www.youtube.com/iframe_api";
          apiScript.async = true;
          document.head.append(apiScript);
        }
      });

      return apiPromise;
    };

    const buildEmbedUrl = (videoId) => {
      const url = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
      url.search = new URLSearchParams({
        autoplay: "0",
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

    const stopCurrentPlayer = () => {
      if (!player) return;

      try {
        player.stopVideo?.();
        player.destroy?.();
      } catch {}
      player = undefined;
      playerReady = false;
    };

    const playLoud = () => {
      if (!player?.playVideo) return;

      player.unMute?.();
      player.setVolume?.(100);
      player.setPlaybackQuality?.("hd1080");
      player.playVideo();
    };

    const revealPlayer = (videoId) => {
      trigger.classList.add("is-video-active");
      trigger.setAttribute(
        "aria-label",
        videoId === secondaryVideoId
          ? "Fadhil Akbar portfolio video 2 is playing"
          : "Fadhil Akbar portfolio video 1 is playing",
      );
    };

    const createIframe = (videoId) => {
      const iframe = document.createElement("iframe");
      iframe.src = buildEmbedUrl(videoId);
      iframe.title = "YouTube video player";
      iframe.allow = [
        "accelerometer",
        "autoplay",
        "clipboard-write",
        "encrypted-media",
        "gyroscope",
        "picture-in-picture",
        "web-share",
      ].join("; ");
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      layer.replaceChildren(iframe);
      return iframe;
    };

    const createPlayer = async (videoId = primaryVideoId) => {
      if (!videoId || !layer || pendingVideoId === videoId) return;

      pendingVideoId = videoId;
      const serial = ++iframeSerial;
      if (trigger.dataset.userRequestedVideo === "true") {
        trigger.classList.add("is-video-loading");
      }
      stopCurrentPlayer();

      const iframe = createIframe(videoId);
      activeVideoId = videoId;
      if (
        videoId !== primaryVideoId ||
        trigger.dataset.userRequestedVideo === "true"
      ) {
        revealPlayer(videoId);
      }

      const YT = await loadYouTubeApi();
      if (serial !== iframeSerial || activeVideoId !== videoId) return;

      player = new YT.Player(iframe, {
        events: {
          onReady: () => {
            playerReady = true;
            pendingVideoId = undefined;
            trigger.classList.remove("is-video-loading");
            if (trigger.dataset.userRequestedVideo === "true") playLoud();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) revealPlayer(videoId);
          },
        },
      });
    };

    const requestSoundAwareness = () => {
      if (trigger.dataset.soundPrompted === "true") return;
      trigger.dataset.soundPrompted = "true";
      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission().catch(() => {});
      }
    };

    const switchVideo = (videoId) => {
      if (!videoId) return;
      trigger.dataset.userRequestedVideo = "true";
      requestSoundAwareness();
      revealPlayer(videoId);
      if (activeVideoId === videoId && playerReady) {
        playLoud();
        return;
      }
      void createPlayer(videoId);
    };

    trigger.addEventListener("click", () => switchVideo(primaryVideoId));

    const queuePrimaryPreload = () => {
      const preload = () => void createPlayer(primaryVideoId);
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(preload, { timeout: 1800 });
      } else {
        window.setTimeout(preload, 700);
      }
    };

    if (document.readyState === "complete") {
      queuePrimaryPreload();
    } else {
      window.addEventListener("load", queuePrimaryPreload, { once: true });
    }

    window.addEventListener("keydown", (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat)
        return;

      const key = event.key.toLowerCase();
      if (event.shiftKey && key === "s") {
        event.preventDefault();
        switchVideo(secondaryVideoId);
        return;
      }
      if (event.shiftKey && key === "e") {
        event.preventDefault();
        switchVideo(primaryVideoId);
      }
    });
  }

  const stabilizeToolIconPaint = () => {
    const toolImages = document.querySelectorAll(".tool-grid img");
    if (!toolImages.length) return;

    const markReady = (image) => {
      image.dataset.paintReady = "true";
    };

    const settleImage = async (image) => {
      image.loading = "eager";
      image.decoding = "sync";
      image.fetchPriority = "high";

      if (!image.complete || image.naturalWidth === 0) {
        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }

      try {
        await image.decode?.();
      } catch {}

      requestAnimationFrame(() => {
        markReady(image);
        image.closest("li")?.classList.add("is-tool-icon-ready");
      });
    };

    toolImages.forEach((image) => {
      void settleImage(image);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", stabilizeToolIconPaint, {
      once: true,
    });
  } else {
    stabilizeToolIconPaint();
  }

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;

    activeKeys.add(event.key.toLowerCase());

    if (isThemeShortcut()) {
      event.preventDefault();
      toggleTheme();
      activeKeys.clear();
      return;
    }

    if (!isTextDanceShortcut()) return;

    document.documentElement.classList.toggle("text-rainbow");
    activeKeys.clear();
  });

  window.addEventListener("keyup", (event) => {
    activeKeys.delete(event.key.toLowerCase());
  });
})();
