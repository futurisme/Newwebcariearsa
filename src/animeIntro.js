import './animeIntro.css';
import { initPlayStoreIntro, replayPlayStoreIntro, skipPlayStoreIntro } from './playstoreIntro.js';

/**
 * CARIEARSA UNIVERSAL 12-SECOND ANIME CYBER CINEMATIC 3D ENGINE (2026)
 * - 12.0s Unskippable Masterpiece Choreography
 * - Hero Point-of-View: THE ACTUAL WEBPAGE (Page Asli)
 * - Dynamic 3-Axis Camera Flight with VISIBLE HEAD-TURNS:
 *     * Menoleh ke Kanan (Camera Pans Right, Page Sweeps Left)
 *     * Menoleh ke Kiri  (Camera Pans Left, Page Sweeps Right)
 *     * Menoleh ke Atas  (Camera Tilts Up, Page Drops Down)
 *     * Menoleh ke Bawah (Camera Tilts Down, Page Rises Up)
 *     * 360° Aerial Barrel Roll Slingshot
 * - DYNAMIC ANIME CYBER SKYLINE & NEBULA BACKDROP (Zero Black Void)
 *     * 100% Vector/SVG + CSS, Instant 0ms Load, Zero Network Latency
 *     * Real-time Multi-Axis Parallax Tracking
 * - Luminous Multi-Layer Neon Border Aura & Extra Deep Black Drop Shadow
 * - Multi-Tiered Dense Radiant Neon Speedlines & Laser Sweeps
 * - Crystal-Clear Central Viewport (Zero Fog / Zero Hazy Washout)
 * - 100% GPU Hardware Accelerated, Ultra-Smooth, Zero Post-Intro Overhead.
 */
(function initAnimeIntro() {
  // Prevent running twice if imported multiple times
  if (window.__cariearsa_anime_intro_initialized) return;
  window.__cariearsa_anime_intro_initialized = true;

  // STRICT ISOLATION: The universal intro ONLY executes when accessing the /intro subdirectory!
  // All other URLs (root, /mobile, /hub, /japan, /aniwatch, etc.) are strictly exempted with zero overhead.
  const currentPath = window.location.pathname.toLowerCase();
  const isIntroPage = currentPath === '/intro' || currentPath.startsWith('/intro/') || currentPath.includes('/intro');
  if (!isIntroPage) {
    return;
  }

  // Prioritized Cache Engine & Asset Preloader (2026 Web Engineering)
  const prioritizeIntroCache = () => {
    try {
      // 1. Memory Image Pre-decode (0ms lag when camera tilts to face girl)
      const girlImg = new Image();
      girlImg.src = '/assets/girl.avif';
      if ('decode' in girlImg) {
        girlImg.decode().catch(() => {});
      }

      // 2. Browser CacheStorage API (Permanent offline & zero-latency reload)
      if ('caches' in window) {
        caches.open('cariearsa-cache-v2026.2').then((cache) => {
          const introUrls = [
            '/assets/girl.avif',
            '/public/assets/girl.avif'
          ];
          introUrls.forEach((url) => {
            fetch(url, { priority: 'high', cache: 'force-cache' })
              .then((res) => {
                if (res && res.status === 200) {
                  cache.put(url, res.clone());
                }
              })
              .catch(() => {});
          });
        }).catch(() => {});
      }
    } catch (_) {}
  };
  prioritizeIntroCache();

  // Check if current context is Play Store (/hub)
  const isPlaystorePage = () => {
    const path = window.location.pathname.toLowerCase();
    return (
      path.includes('hub') ||
      path.includes('playstore') ||
      document.body.classList.contains('playstore-body') ||
      document.title.toLowerCase().includes('play store')
    );
  };

  // Desktop/Laptop Exclusive Shortcut: Shift + S to smoothly skip the intro once
  const bindKeyboardSkipShortcut = () => {
    if (window.__cariearsa_shift_s_bound) return;
    window.__cariearsa_shift_s_bound = true;

    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input, textarea, or contenteditable
      const target = e.target;
      const isTyping = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      if (isTyping) return;

      // Check strictly for Shift + S (case insensitive: key 's'/'S' or code 'KeyS')
      if (e.shiftKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
        if (isPlaystorePage()) {
          if (document.body.classList.contains('ps-intro-active') || window.__cariearsa_ps_intro_running) {
            e.preventDefault();
            skipPlayStoreIntro();
          }
        } else {
          if (document.body.classList.contains('splash-active')) {
            e.preventDefault();
            skipUniversalIntro();
          }
        }
      }
    }, { passive: false });
  };

  // If on Play Store, activate bespoke landscape phone 3D intro
  if (isPlaystorePage()) {
    bindKeyboardSkipShortcut();
    window.replayAnimeIntro = replayPlayStoreIntro;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initPlayStoreIntro());
    } else {
      initPlayStoreIntro();
    }
    return;
  }

  const DURATION_MS = 12000;         // Exactly 12.0 seconds duration
  const FIRST_IMPACT_MS = 2600;      // Act II First Touchdown impact (2.60s - measured dynamic build)
  const SLINGSHOT_MS = 3400;         // Act III 360° Slingshot & Barrel Roll (3.40s)
  const ZOOM_OUT_MS = 6000;          // Act IV Out dari Layar HP: Zoom out revealing 2-handed landscape grip (6.00s)
  const PHONE_DIP_MS = 7100;         // Act V Animasi Genggaman Tangan Turun Dilambatkan & Dihaluskan (7.10s)
  const HORIZON_LOCK_MS = 9000;      // Act VI Menatap Wajah Karakter Lurus Sejajar / Horizon Lock (9.00s)
  const SNAP_DOWN_DIVE_MS = 10200;   // Act VII Sedikit Dipercepat: Selesai Menatap Wajah & Cepat Kembali Nengok Kebawah (10.20s)
  const FINAL_IMPACT_MS = 11550;     // Act VIII Touchdown & Layar Jadi Normal (11.55s)

  // Determine subpage context name for holographic crest
  const getSubpageMeta = () => {
    const path = window.location.pathname.toLowerCase();
    let title = 'CARIEARSA.COM X FADHIL.DEV';
    if (path.includes('cloud')) {
      title = 'CLOUD DATABASE';
    } else if (path.includes('aniwatch')) {
      title = 'ANIWATCH';
    } else if (path.includes('japan')) {
      title = 'JAPAN 3D EXPLORER';
    } else if (path.includes('components')) {
      title = 'CYBER DESIGN SYSTEM';
    } else if (path.includes('hub') || path.includes('playstore')) {
      title = 'PLAY STORE HUB';
    } else if (path.includes('note')) {
      title = 'NEURAL VAULT NOTE';
    } else if (path.includes('360')) {
      title = '360° PANORAMA';
    } else {
      title = 'CARIEARSA.COM X FADHIL.DEV';
    }

    return {
      tag: '2026 Personal Portfolio Collection',
      title: title,
      sub: 'BY FADHIL AKBAR CARIEARSA',
      status: 'Welcome to my personal website'
    };
  };

  const meta = getSubpageMeta();

  // Synthesized Web Audio Sound Engine (Zero external assets, instant zero-latency)
  let audioCtx = null;
  const getAudioContext = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    return audioCtx;
  };

  // 1. Initial Cosmic Warp Sound (0s - 1.95s: Accelerated High-Velocity Opening)
  const playAnimeWarp = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(80, now);
      osc1.frequency.exponentialRampToValueAtTime(750, now + 1.4);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 1.92);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120, now);
      osc2.frequency.exponentialRampToValueAtTime(580, now + 1.4);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.linearRampToValueAtTime(1700, now + 1.6);
      filter.Q.value = 4.0;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.8);
      gain.gain.linearRampToValueAtTime(0.08, now + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.94);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.95);
      osc2.stop(now + 1.95);
    } catch (_) {}
  };

  // 2. First Impact Shutter Boom (1.95s)
  const playFirstImpact = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(34, now + 0.5);

      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.52);

      // Noise burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(2200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.16, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch (_) {}
  };

  // 3. Slingshot Recoil & 360° Barrel Roll Synth Whoosh (2.50s)
  const playSlingshotSpin = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.9);
      osc.frequency.exponentialRampToValueAtTime(520, now + 2.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.linearRampToValueAtTime(450, now + 0.9);
      filter.frequency.linearRampToValueAtTime(2000, now + 2.1);
      filter.Q.value = 5.2;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gain.gain.linearRampToValueAtTime(0.06, now + 1.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.25);
    } catch (_) {}
  };

  // 4. Detik ke-4.8 Out dari Layar HP: Zoom-out Breaker Riser (4.80s)
  const playZoomOutWhoosh = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Rising bandpass filtered swoop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.85);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.85);
      filter.Q.value = 4.2;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.88);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.89);
    } catch (_) {}
  };

  // 5. HP Dikebawahin & Kamera Nengok Keatas Sejajar Mechanical Dip (7.50s)
  const playPhoneDipSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.75);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.linearRampToValueAtTime(140, now + 0.75);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.76);
    } catch (_) {}
  };

  // 6. Horizon Lock Straight Sejajar Chime & Sub-bass Thud (8.80s)
  const playHorizonLockSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Solid Sub-bass Alignment Thud
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(140, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

      subGain.gain.setValueAtTime(0.24, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.5);

      // Sci-Fi Horizon Lock Chimes (Harmonic Pair)
      const chime1 = ctx.createOscillator();
      const chime2 = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chime1.type = 'sine';
      chime2.type = 'sine';
      chime1.frequency.setValueAtTime(880, now);
      chime2.frequency.setValueAtTime(1320, now);

      chimeGain.gain.setValueAtTime(0.12, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      chime1.connect(chimeGain);
      chime2.connect(chimeGain);
      chimeGain.connect(ctx.destination);

      chime1.start(now);
      chime2.start(now);
      chime1.stop(now + 0.96);
      chime2.stop(now + 0.96);
    } catch (_) {}
  };

  // 7. Cepat Kembali Nengok Kebawah (ke HP) & Zooming Masuk Layar HP Dive Whoosh (10.50s)
  const playSnapDownDiveSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Whip-snap glance down
      const whipOsc = ctx.createOscillator();
      const whipGain = ctx.createGain();
      whipOsc.type = 'triangle';
      whipOsc.frequency.setValueAtTime(900, now);
      whipOsc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

      whipGain.gain.setValueAtTime(0.18, now);
      whipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      whipOsc.connect(whipGain);
      whipGain.connect(ctx.destination);
      whipOsc.start(now);
      whipOsc.stop(now + 0.16);

      // Hypersonic dive riser into the screen
      const diveOsc = ctx.createOscillator();
      const diveGain = ctx.createGain();
      const diveFilter = ctx.createBiquadFilter();

      diveOsc.type = 'sawtooth';
      diveOsc.frequency.setValueAtTime(160, now + 0.1);
      diveOsc.frequency.exponentialRampToValueAtTime(1850, now + 0.95);

      diveFilter.type = 'bandpass';
      diveFilter.frequency.setValueAtTime(320, now + 0.1);
      diveFilter.frequency.exponentialRampToValueAtTime(4500, now + 0.95);
      diveFilter.Q.value = 3.6;

      diveGain.gain.setValueAtTime(0.001, now + 0.1);
      diveGain.gain.linearRampToValueAtTime(0.2, now + 0.7);
      diveGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      diveOsc.connect(diveFilter);
      diveFilter.connect(diveGain);
      diveGain.connect(ctx.destination);

      diveOsc.start(now + 0.1);
      diveOsc.stop(now + 1.02);
    } catch (_) {}
  };

  // 8. Supreme Final Climax Shockwave Boom & 1:1 Normal Touchdown (11.55s)
  const playFinalImpact = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;

      // Colossal Sub-bass drop
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(220, now);
      subOsc.frequency.exponentialRampToValueAtTime(22, now + 0.85);

      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.9);

      // Heavy explosive noise transient
      const bufferSize = Math.floor(ctx.sampleRate * 0.24);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(2800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(110, now + 0.24);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch (_) {}
  };

  const setupDOMAndPlay = () => {
    // 1. Ensure 3D Master Viewport & Complete Hierarchy exist cleanly and defensively
    let viewport = document.getElementById('anime-camera-viewport');
    let povCamera = document.getElementById('anime-pov-camera');
    let handheldUnit = document.getElementById('anime-handheld-unit');
    let phoneFrame = document.getElementById('anime-phone-frame');
    let alignHud = document.getElementById('anime-align-hud');
    let rig = document.getElementById('anime-camera-rig');

    if (!viewport) {
      viewport = document.createElement('div');
      viewport.id = 'anime-camera-viewport';
      viewport.className = 'anime-camera-viewport';
      document.body.prepend(viewport);
    }

    if (!povCamera) {
      povCamera = document.createElement('div');
      povCamera.id = 'anime-pov-camera';
      povCamera.className = 'anime-pov-camera';
      viewport.appendChild(povCamera);
    } else if (povCamera.parentElement !== viewport) {
      viewport.appendChild(povCamera);
    }

    if (!alignHud) {
      alignHud = document.createElement('div');
      alignHud.id = 'anime-align-hud';
      alignHud.className = 'anime-align-hud';
      alignHud.innerHTML = `
        <div class="anime-hud-reticle"></div>
        <div class="anime-hud-status">DESIGN x DEVELOP x DEPLOY</div>
      `;
      povCamera.appendChild(alignHud);
    } else {
      const hudStatus = alignHud.querySelector('.anime-hud-status');
      if (hudStatus) hudStatus.textContent = 'DESIGN x DEVELOP x DEPLOY';
    }

    if (!handheldUnit) {
      handheldUnit = document.createElement('div');
      handheldUnit.id = 'anime-handheld-unit';
      handheldUnit.className = 'anime-handheld-unit';
      povCamera.appendChild(handheldUnit);
    } else if (handheldUnit.parentElement !== povCamera) {
      povCamera.appendChild(handheldUnit);
    }

    if (!phoneFrame) {
      phoneFrame = document.createElement('div');
      phoneFrame.id = 'anime-phone-frame';
      phoneFrame.className = 'anime-phone-frame';
      phoneFrame.innerHTML = `
        <!-- Left Cyber Hand -->
        <div class="anime-hand anime-hand-left">
          <svg viewBox="0 0 160 280" class="anime-hand-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="anGloveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1f2536" />
                <stop offset="60%" stop-color="#111522" />
                <stop offset="100%" stop-color="#080a11" />
              </linearGradient>
              <linearGradient id="anCyberSeamLeft" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#00F0FF" />
                <stop offset="100%" stop-color="#0088FF" />
              </linearGradient>
            </defs>
            <path d="M0,280 L0,170 C15,160 32,150 48,140 C65,130 80,120 90,110 C105,95 115,80 120,60 C125,45 130,30 135,25 C142,18 152,22 150,38 C146,65 132,105 118,140 C105,170 95,200 90,280 Z" fill="url(#anGloveGradLeft)" stroke="#2b344c" stroke-width="1.5" />
            <path d="M92,118 C110,95 130,68 140,55 C146,47 155,52 153,64 C148,85 130,120 115,145 C105,160 92,150 92,118 Z" fill="#242b3e" stroke="#00F0FF" stroke-width="1.2" />
            <ellipse cx="145" cy="58" rx="8" ry="12" transform="rotate(-20 145 58)" fill="#2f3954" stroke="#00F0FF" stroke-width="1.2" />
            <path d="M10,270 Q45,200 80,150 Q110,110 135,70" fill="none" stroke="url(#anCyberSeamLeft)" stroke-width="2.5" opacity="0.9" />
            <rect x="25" y="190" width="40" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
            <rect x="40" y="220" width="42" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
          </svg>
        </div>

        <!-- Landscape Phone Device Frame -->
        <div class="anime-phone-device">
          <div class="anime-phone-button btn-vol-up"></div>
          <div class="anime-phone-button btn-vol-down"></div>
          <div class="anime-phone-button btn-power"></div>

          <div class="anime-phone-bezel">
            <!-- Landscape Status Bar -->
            <div class="anime-screen-statusbar">
              <div class="anime-sb-left">
                <span class="anime-sb-time">10:42</span>
                <span class="anime-sb-carrier">CARIEARSA 5G</span>
              </div>
              <div class="anime-sb-notch">
                <div class="anime-notch-lens"></div>
                <div class="anime-notch-sensor"></div>
              </div>
              <div class="anime-sb-right">
                <svg class="anime-sb-wifi" width="14" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                <div class="anime-sb-battery">
                  <span class="anime-sb-pct">98%</span>
                  <div class="anime-battery-shell"><div class="anime-battery-level"></div></div>
                </div>
              </div>
            </div>
            <div class="anime-screen-glare"></div>
            <div class="anime-screen-homebar"></div>
          </div>
        </div>

        <!-- Right Cyber Hand -->
        <div class="anime-hand anime-hand-right">
          <svg viewBox="0 0 160 280" class="anime-hand-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="anGloveGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#1f2536" />
                <stop offset="60%" stop-color="#111522" />
                <stop offset="100%" stop-color="#080a11" />
              </linearGradient>
              <linearGradient id="anCyberSeamRight" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stop-color="#00F0FF" />
                <stop offset="100%" stop-color="#0088FF" />
              </linearGradient>
            </defs>
            <path d="M160,280 L160,170 C145,160 128,150 112,140 C95,130 80,120 70,110 C55,95 45,80 40,60 C35,45 30,30 25,25 C18,18 8,22 10,38 C14,65 28,105 42,140 C55,170 65,200 70,280 Z" fill="url(#anGloveGradRight)" stroke="#2b344c" stroke-width="1.5" />
            <path d="M68,118 C50,95 30,68 20,55 C14,47 5,52 7,64 C12,85 30,120 45,145 C55,160 68,150 68,118 Z" fill="#242b3e" stroke="#00F0FF" stroke-width="1.2" />
            <ellipse cx="15" cy="58" rx="8" ry="12" transform="rotate(20 15 58)" fill="#2f3954" stroke="#00F0FF" stroke-width="1.2" />
            <path d="M150,270 Q115,200 80,150 Q50,110 25,70" fill="none" stroke="url(#anCyberSeamRight)" stroke-width="2.5" opacity="0.9" />
            <rect x="95" y="190" width="40" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
            <rect x="78" y="220" width="42" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
          </svg>
        </div>
      `;
      handheldUnit.appendChild(phoneFrame);
    }

    if (!rig) {
      rig = document.createElement('div');
      rig.id = 'anime-camera-rig';
      rig.className = 'anime-camera-rig';
      handheldUnit.appendChild(rig);

      // Move existing body children (except scripts, overlay, and viewport) into rig
      const nodesToMove = [];
      document.body.childNodes.forEach((node) => {
        if (
          node !== viewport &&
          node.nodeName !== 'SCRIPT' &&
          node.id !== 'anime-splash-overlay'
        ) {
          nodesToMove.push(node);
        }
      });
      nodesToMove.forEach((node) => rig.appendChild(node));
    } else if (rig.parentElement !== handheldUnit) {
      handheldUnit.appendChild(rig);
    }

    // 2. Ensure Dynamic Anime Cyber Cityscape Backdrop + 16:9 Landscape Anime Girl POV Backdrop exists inside viewport behind the page
    let backdrop = viewport.querySelector('.anime-dynamic-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'anime-dynamic-backdrop';
      backdrop.innerHTML = `
        <!-- 16:9 Landscape Anime Girl Looking Directly At Camera (Eye-to-Eye Horizon View) -->
        <div class="anime-backdrop-girl-container" id="anime-backdrop-girl-container">
          <div class="anime-girl-frame">
            <img 
              src="/assets/girl.avif" 
              alt="Anime Girl Looking at Camera" 
              class="anime-girl-img" 
              id="anime-girl-img"
              referrerPolicy="no-referrer"
              onerror="if(this.src.indexOf('public/assets/girl.avif') === -1) this.src='/public/assets/girl.avif'; else if(this.src.indexOf('assets/girl.avif') === -1) this.src='assets/girl.avif';"
            />
            <div class="anime-girl-atmosphere"></div>
            <div class="anime-girl-vignette"></div>
            <div class="anime-girl-eyeglow"></div>
          </div>
        </div>

        <div class="anime-backdrop-nebula"></div>
        <div class="anime-backdrop-moon">
          <div class="moon-core"></div>
          <div class="moon-ring"></div>
        </div>
        <div class="anime-backdrop-cityscape">
          <svg class="cityscape-svg" viewBox="0 0 1920 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyBldgGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#141c38" />
                <stop offset="100%" stop-color="#070913" />
              </linearGradient>
              <linearGradient id="skyBldgGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#24123a" />
                <stop offset="100%" stop-color="#090614" />
              </linearGradient>
            </defs>
            <!-- Background Layer Buildings (Distant Silhouette) -->
            <path d="M0,600 L0,320 L70,320 L70,260 L140,260 L140,350 L220,350 L220,220 L280,220 L280,380 L360,380 L360,180 L420,180 L420,340 L500,340 L500,280 L580,280 L580,390 L680,390 L680,240 L760,240 L760,360 L850,360 L850,150 L910,150 L910,380 L1020,380 L1020,200 L1100,200 L1100,340 L1200,340 L1200,260 L1280,260 L1280,390 L1380,390 L1380,190 L1450,190 L1450,330 L1540,330 L1540,240 L1620,240 L1620,370 L1720,370 L1720,210 L1800,210 L1800,350 L1920,350 L1920,600 Z" fill="url(#skyBldgGrad2)" opacity="0.85" />
            
            <!-- Distant Windows / Digital Dots -->
            <g fill="#FFE600" opacity="0.65">
              <rect x="375" y="200" width="4" height="6" /><rect x="390" y="200" width="4" height="6" /><rect x="405" y="200" width="4" height="6" />
              <rect x="375" y="220" width="4" height="6" /><rect x="405" y="220" width="4" height="6" />
              <rect x="865" y="170" width="5" height="7" /><rect x="885" y="170" width="5" height="7" /><rect x="865" y="190" width="5" height="7" />
              <rect x="1395" y="210" width="4" height="6" /><rect x="1420" y="210" width="4" height="6" /><rect x="1395" y="230" width="4" height="6" />
              <rect x="1740" y="230" width="4" height="6" /><rect x="1765" y="230" width="4" height="6" />
            </g>

            <!-- Foreground Tokyo Skyscraper Complex with Glowing Neon Edges -->
            <path d="M0,600 L0,420 L90,420 L90,290 L130,290 L130,240 L135,160 L140,240 L140,450 L250,450 L250,310 L340,310 L340,480 L460,480 L460,260 L540,260 L540,430 L630,430 L630,340 L700,340 L700,470 L790,470 L790,210 L840,110 L850,210 L850,440 L960,440 L960,290 L1050,290 L1050,460 L1150,460 L1150,230 L1230,230 L1230,420 L1320,420 L1320,330 L1410,330 L1410,480 L1500,480 L1500,280 L1580,280 L1580,450 L1690,450 L1690,250 L1740,140 L1750,250 L1750,430 L1850,430 L1850,360 L1920,360 L1920,600 Z" fill="url(#skyBldgGrad1)" stroke="#00F0FF" stroke-width="1.5" />

            <!-- Neon Window Ribbons (Cyan, Crimson, Gold) -->
            <g fill="#00F0FF" opacity="0.9">
              <rect x="100" y="320" width="20" height="2.5" /><rect x="100" y="335" width="20" height="2.5" /><rect x="100" y="350" width="20" height="2.5" />
              <rect x="480" y="290" width="40" height="2.5" /><rect x="480" y="310" width="40" height="2.5" /><rect x="480" y="330" width="40" height="2.5" /><rect x="480" y="350" width="40" height="2.5" />
              <rect x="1170" y="260" width="40" height="2.5" /><rect x="1170" y="280" width="40" height="2.5" /><rect x="1170" y="300" width="40" height="2.5" />
            </g>
            <g fill="#FF003C" opacity="0.9">
              <rect x="270" y="340" width="50" height="2.5" /><rect x="270" y="360" width="50" height="2.5" /><rect x="270" y="380" width="50" height="2.5" />
              <rect x="980" y="320" width="50" height="2.5" /><rect x="980" y="340" width="50" height="2.5" />
              <rect x="1520" y="310" width="40" height="2.5" /><rect x="1520" y="330" width="40" height="2.5" />
            </g>
            <g fill="#FFE600" opacity="0.95">
              <!-- Cyber Billboards -->
              <rect x="645" y="365" width="40" height="24" rx="2" fill="#000000" stroke="#FFE600" stroke-width="2" />
              <text x="665" y="382" font-family="'Oswald', sans-serif" font-size="12" font-weight="bold" fill="#FFE600" text-anchor="middle">東京</text>
              
              <rect x="1335" y="355" width="65" height="24" rx="2" fill="#000000" stroke="#00F0FF" stroke-width="2" />
              <text x="1367" y="372" font-family="'Oswald', sans-serif" font-size="11" font-weight="bold" fill="#00F0FF" text-anchor="middle">CARIEARSA</text>
            </g>

            <!-- Antenna Warning Lights -->
            <circle cx="135" cy="160" r="3" fill="#FF003C" />
            <circle cx="840" cy="110" r="4" fill="#FF003C" />
            <circle cx="1740" cy="140" r="3.5" fill="#FF003C" />
          </svg>
        </div>
        <div class="anime-backdrop-searchlights">
          <div class="searchlight light-left"></div>
          <div class="searchlight light-right"></div>
        </div>
        <div class="anime-backdrop-grid"></div>
      `;
      viewport.prepend(backdrop);
    }

    // 3. Ensure Splash VFX Overlay exists (Unskippable 12s cyber masterpiece)
    let splash = document.getElementById('anime-splash-overlay');
    if (!splash) {
      splash = document.createElement('aside');
      splash.id = 'anime-splash-overlay';
      splash.className = 'anime-splash-overlay';
      splash.setAttribute('aria-label', '12s Anime Cinematic Intro');
      splash.innerHTML = `
        <!-- Multi-Tiered Dense Neon Speedlines (Center is transparent for clear page view) -->
        <div class="anime-speedlines"></div>
        <div class="anime-speedlines-counter"></div>
        <div class="anime-cyber-grid"></div>

        <!-- Anamorphic Prismatic Laser Sweeps -->
        <div class="anime-flare-system">
          <div class="anime-beam-streak horizontal-streak"></div>
          <div class="anime-beam-streak diagonal-streak"></div>
        </div>

        <!-- Corner Cyber HUD Reticles (Does not cover center) -->
        <div class="anime-hud-matrix">
          <div class="anime-hud-bracket bracket-tl"></div>
          <div class="anime-hud-bracket bracket-tr"></div>
          <div class="anime-hud-bracket bracket-bl"></div>
          <div class="anime-hud-bracket bracket-br"></div>
          <div class="anime-hud-telemetry">
            <span>CORE: ONLINE // 12.0s MASTER RIG</span>
            <span>VECTOR: [360° SLINGSHOT ROTATION]</span>
            <span>DATA LINK: 100% SYNCHRONIZED</span>
          </div>
          <div class="anime-hud-telemetry-right">
            <span>LATENCY: 0.00ms</span>
            <span>FPS: 120 GPU LOCK</span>
            <span>DIMENSION: 2026-NEURAL</span>
          </div>
        </div>

        <!-- Top-Docked Sleek Holographic Crest (Leaves central area completely open) -->
        <div class="anime-warp-crest">
          <div class="crest-tag">${meta.tag}</div>
          <div class="crest-title-box">
            <h1 class="crest-title">${meta.title}</h1>
            <span class="crest-jp">${meta.sub}</span>
          </div>
          <div class="crest-progress-rail">
            <div class="crest-progress-fill"></div>
          </div>
          <div class="crest-status-line">${meta.status}</div>
        </div>

        <div class="anime-impact-flash"></div>
        <div class="anime-chromatic-shutter"></div>
      `;
      document.body.appendChild(splash);
    } else {
      // Remove any skip button if present to enforce strict unskippable rule
      const skipBtn = splash.querySelector('#skip-intro-btn, .anime-skip-pill');
      if (skipBtn) skipBtn.remove();

      // Ensure crest elements reflect the universal meta accurately
      const crestTag = splash.querySelector('.crest-tag');
      if (crestTag) crestTag.textContent = meta.tag;

      const crestTitle = splash.querySelector('.crest-title');
      if (crestTitle) crestTitle.textContent = meta.title;

      const crestSub = splash.querySelector('.crest-jp');
      if (crestSub) crestSub.textContent = meta.sub;

      let crestStatus = splash.querySelector('.crest-status-line');
      if (!crestStatus) {
        const crest = splash.querySelector('.anime-warp-crest');
        if (crest) {
          crestStatus = document.createElement('div');
          crestStatus.className = 'crest-status-line';
          crest.appendChild(crestStatus);
        }
      }
      if (crestStatus) crestStatus.textContent = meta.status;
    }

    // 4. Lock body and trigger 12s master animations across all 3D rigs
    document.body.classList.remove('splash-completed');
    document.body.classList.add('splash-active');
    splash.style.display = 'flex';
    splash.classList.remove('fade-out');

    if (alignHud) alignHud.classList.remove('visible');

    if (povCamera) povCamera.classList.remove('animating');
    if (handheldUnit) handheldUnit.classList.remove('animating');
    if (phoneFrame) phoneFrame.classList.remove('animating');
    if (rig) rig.classList.remove('camera-flying');

    // Batch single reflow flush (Zero layout thrashing)
    void document.body.offsetHeight;

    if (povCamera) povCamera.classList.add('animating');
    if (handheldUnit) handheldUnit.classList.add('animating');
    if (phoneFrame) phoneFrame.classList.add('animating');
    if (rig) rig.classList.add('camera-flying');

    // Precision Audio Sequence Timers
    playAnimeWarp();
    const t1 = setTimeout(() => playFirstImpact(), FIRST_IMPACT_MS);
    const t2 = setTimeout(() => playSlingshotSpin(), SLINGSHOT_MS);
    const t3 = setTimeout(() => playZoomOutWhoosh(), ZOOM_OUT_MS);
    const t4 = setTimeout(() => playPhoneDipSound(), PHONE_DIP_MS);
    const t5 = setTimeout(() => {
      playHorizonLockSound();
      if (alignHud) alignHud.classList.add('visible');
    }, HORIZON_LOCK_MS);
    const t6 = setTimeout(() => {
      playSnapDownDiveSound();
      if (alignHud) alignHud.classList.remove('visible');
    }, SNAP_DOWN_DIVE_MS);
    const t7 = setTimeout(() => playFinalImpact(), FINAL_IMPACT_MS);

    // 5. Exact 12.0s Conclude Cinematic Sequence Smoothly & Restore Normal View
    const tEnd = setTimeout(() => {
      document.body.classList.remove('splash-active');
      document.body.classList.add('splash-completed');
      if (typeof window.__cariearsa_activate_hero_audio === 'function') {
        window.__cariearsa_activate_hero_audio();
      }

      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.style.display = 'none';
        povCamera.classList.remove('animating');
        handheldUnit.classList.remove('animating');
        phoneFrame.classList.remove('animating');
        rig.classList.remove('camera-flying');
        if (alignHud) alignHud.classList.remove('visible');
      }, 500);
    }, DURATION_MS);

    // Store active timers for clean replays
    window.__cariearsa_active_intro_timers = [t1, t2, t3, t4, t5, t6, t7, tEnd];
  };

  // Smooth Desktop Skip Function for Universal Intro
  const skipUniversalIntro = () => {
    if (!document.body.classList.contains('splash-active')) return;

    if (window.__cariearsa_active_intro_timers) {
      window.__cariearsa_active_intro_timers.forEach((t) => clearTimeout(t));
      window.__cariearsa_active_intro_timers = [];
    }

    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.suspend();
      } catch (_) {}
    }

    const splash = document.getElementById('anime-splash-overlay');
    const povCamera = document.getElementById('anime-pov-camera');
    const handheldUnit = document.getElementById('anime-handheld-unit');
    const phoneFrame = document.getElementById('anime-phone-frame');
    const rig = document.getElementById('anime-camera-rig');
    const alignHud = document.getElementById('anime-align-hud');

    document.body.classList.add('splash-skipping');

    setTimeout(() => {
      document.body.classList.remove('splash-active');
      document.body.classList.remove('splash-skipping');
      document.body.classList.add('splash-completed');
      if (typeof window.__cariearsa_activate_hero_audio === 'function') {
        window.__cariearsa_activate_hero_audio();
      }

      if (splash) {
        splash.style.display = 'none';
        splash.classList.remove('fade-out');
      }
      if (povCamera) povCamera.classList.remove('animating');
      if (handheldUnit) handheldUnit.classList.remove('animating');
      if (phoneFrame) phoneFrame.classList.remove('animating');
      if (rig) rig.classList.remove('camera-flying');
      if (alignHud) alignHud.classList.remove('visible');
    }, 300);
  };

  // Expose skip function globally
  window.skipAnimeIntro = skipUniversalIntro;

  // Expose replay function globally
  window.replayAnimeIntro = () => {
    if (window.__cariearsa_active_intro_timers) {
      window.__cariearsa_active_intro_timers.forEach((t) => clearTimeout(t));
    }
    setupDOMAndPlay();
  };

  // Connect replay button on pages
  const bindReplayBtn = () => {
    const replayBtn = document.getElementById('replay-cinematic-btn');
    if (replayBtn && !replayBtn.__anime_bound) {
      replayBtn.__anime_bound = true;
      replayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.replayAnimeIntro();
      });
    }
  };

  bindKeyboardSkipShortcut();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupDOMAndPlay();
      bindReplayBtn();
    });
  } else {
    setupDOMAndPlay();
    bindReplayBtn();
  }
})();
