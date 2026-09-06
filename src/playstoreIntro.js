import './playstoreIntro.css';

/**
 * CARIEARSA PLAY STORE BESPOKE 3D INTRO ENGINE (2026)
 * - Specific to Play Store (/hub)
 * - Phase 1 (0.0s - 5.8s): Inside Landscape Phone with Touch-Swiping Game & App Photos
 * - Phase 2 (5.8s - 6.8s): Detik ke-6 Zoom-out Breach revealing 2-Handed Landscape Phone Grip
 * - Phase 3 (6.8s - 8.8s): Phone Rapidly Dips & Tilts Downward; Camera Tilts UP to Level Eye-line
 * - Phase 4 (8.8s - 12.0s): Pristine Straight Horizon Lock on Play Store Webpage
 * - Pure Vector SVG + CSS 3D Transforms, Hyper-Lightweight, 120 FPS GPU Smooth.
 */

let psAudioCtx = null;
const getPlaystoreAudioContext = () => {
  if (!psAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) psAudioCtx = new AudioContextClass();
  }
  return psAudioCtx;
};

// 1. Tactile Touch Swipe Whoosh & Click Sound
const playSwipeSound = () => {
  try {
    const ctx = getPlaystoreAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.linearRampToValueAtTime(320, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (_) {}
};

// 2. Detik ke-6 Zoom-Out Riser & Breaker (5.8s)
const playZoomOutWhoosh = () => {
  try {
    const ctx = getPlaystoreAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Rising synth sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(1150, now + 0.75);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(2200, now + 0.75);
    filter.Q.value = 4.2;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.55);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.79);
  } catch (_) {}
};

// 3. Phone Dips & Hands Lower Mechanical Whoosh (6.8s)
const playPhoneDipSound = () => {
  try {
    const ctx = getPlaystoreAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.85);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(140, now + 0.85);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.88);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.89);
  } catch (_) {}
};

// 4. Straight Eye-Level Horizon Lock Sound (9.2s)
const playHorizonLockSound = () => {
  try {
    const ctx = getPlaystoreAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Sub-bass thud
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.6);

    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.62);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.62);

    // Crystal harmonic chime
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, now);
    chime.frequency.exponentialRampToValueAtTime(440, now + 0.45);

    chimeGain.gain.setValueAtTime(0.12, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chime.start(now);
    chime.stop(now + 0.48);
  } catch (_) {}
};

// 5. Cepat Kembali Nengok Kebawah (ke HP) & Zooming Masuk Layar HP Dive (10.5s)
const playSnapDownDiveSound = () => {
  try {
    const ctx = getPlaystoreAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    // Whip snap downward look
    const whipOsc = ctx.createOscillator();
    const whipGain = ctx.createGain();
    whipOsc.type = 'triangle';
    whipOsc.frequency.setValueAtTime(850, now);
    whipOsc.frequency.exponentialRampToValueAtTime(160, now + 0.16);

    whipGain.gain.setValueAtTime(0.18, now);
    whipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    whipOsc.connect(whipGain);
    whipGain.connect(ctx.destination);
    whipOsc.start(now);
    whipOsc.stop(now + 0.17);

    // Zooming dive riser into the phone screen
    const diveOsc = ctx.createOscillator();
    const diveGain = ctx.createGain();
    const diveFilter = ctx.createBiquadFilter();

    diveOsc.type = 'sawtooth';
    diveOsc.frequency.setValueAtTime(140, now + 0.1);
    diveOsc.frequency.exponentialRampToValueAtTime(1750, now + 0.95);

    diveFilter.type = 'bandpass';
    diveFilter.frequency.setValueAtTime(280, now + 0.1);
    diveFilter.frequency.exponentialRampToValueAtTime(4200, now + 0.95);
    diveFilter.Q.value = 3.8;

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

// 6. Supreme Final Touchdown Shockwave (11.5s)
const playFinalTouchdownSound = () => {
  try {
    const ctx = getPlaystoreAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(200, now);
    subOsc.frequency.exponentialRampToValueAtTime(24, now + 0.7);

    subGain.gain.setValueAtTime(0.26, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.75);
  } catch (_) {}
};

let psActiveTimers = [];
const clearAllPSTimers = () => {
  psActiveTimers.forEach(t => clearTimeout(t));
  psActiveTimers = [];
};

export function initPlayStoreIntro() {
  if (window.__cariearsa_ps_intro_running) return;
  window.__cariearsa_ps_intro_running = true;

  // Respect system reduced-motion accessibility preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('ps-intro-completed');
    window.__cariearsa_ps_intro_running = false;
    return;
  }

  clearAllPSTimers();

  // Create or retrieve stage
  let stage = document.getElementById('ps-intro-stage');
  if (!stage) {
    stage = document.createElement('div');
    stage.id = 'ps-intro-stage';
    stage.className = 'ps-intro-stage';
    stage.setAttribute('aria-label', 'Play Store 3D Cinematic Landscape Phone Intro');

    stage.innerHTML = `
      <div class="ps-intro-backdrop">
        <!-- 16:9 Landscape Anime Girl Looking Directly At Camera -->
        <div class="ps-backdrop-girl-container" id="ps-backdrop-girl-container">
          <div class="ps-girl-frame">
            <img 
              src="/assets/girl.avif" 
              alt="Anime Girl Looking at Camera" 
              class="ps-girl-img" 
              id="ps-girl-img"
              referrerPolicy="no-referrer"
              onerror="if(this.src.indexOf('public/assets/girl.avif') === -1) this.src='/public/assets/girl.avif'; else if(this.src.indexOf('assets/girl.avif') === -1) this.src='assets/girl.avif';"
            />
            <div class="ps-girl-atmosphere"></div>
            <div class="ps-girl-vignette"></div>
            <div class="ps-girl-eyeglow"></div>
          </div>
        </div>
        <div class="ps-backdrop-pillars"></div>
      </div>

      <div id="ps-pov-camera" class="ps-pov-camera">
        
        <!-- The 2-Handed Landscape Phone Assembly -->
        <div id="ps-phone-assembly" class="ps-phone-assembly">
          
          <!-- Left Hand Gripping Left Bezel -->
          <div class="ps-hand ps-hand-left">
            <svg viewBox="0 0 160 280" class="ps-hand-svg" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="psGloveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#1f2536" />
                  <stop offset="60%" stop-color="#111522" />
                  <stop offset="100%" stop-color="#080a11" />
                </linearGradient>
                <linearGradient id="psCyberSeamLeft" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#00F0FF" />
                  <stop offset="100%" stop-color="#0088FF" />
                </linearGradient>
              </defs>
              <!-- Forearm & Palm Base from lower-left -->
              <path d="M0,280 L0,170 C15,160 32,150 48,140 C65,130 80,120 90,110 C105,95 115,80 120,60 C125,45 130,30 135,25 C142,18 152,22 150,38 C146,65 132,105 118,140 C105,170 95,200 90,280 Z" fill="url(#psGloveGradLeft)" stroke="#2b344c" stroke-width="1.5" />
              <!-- Thumb wrapping over front left bezel -->
              <path d="M92,118 C110,95 130,68 140,55 C146,47 155,52 153,64 C148,85 130,120 115,145 C105,160 92,150 92,118 Z" fill="#242b3e" stroke="#00F0FF" stroke-width="1.2" />
              <ellipse cx="145" cy="58" rx="8" ry="12" transform="rotate(-20 145 58)" fill="#2f3954" stroke="#00F0FF" stroke-width="1.2" />
              <!-- Luminous Cyber Seam -->
              <path d="M10,270 Q45,200 80,150 Q110,110 135,70" fill="none" stroke="url(#psCyberSeamLeft)" stroke-width="2.5" opacity="0.9" />
              <!-- Tactical Armor Pads -->
              <rect x="25" y="190" width="40" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
              <rect x="40" y="220" width="42" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
            </svg>
          </div>

          <!-- Physical Phone Hardware in Landscape -->
          <div class="ps-phone-device">
            <!-- Hardware Buttons -->
            <div class="ps-phone-button btn-vol-up"></div>
            <div class="ps-phone-button btn-vol-down"></div>
            <div class="ps-phone-button btn-power"></div>

            <div class="ps-phone-bezel">
              <div class="ps-phone-screen">
                
                <!-- Landscape Phone Status Bar -->
                <div class="ps-screen-statusbar">
                  <div class="ps-sb-left">
                    <span class="ps-sb-time">10:42</span>
                    <span class="ps-sb-carrier">CARIEARSA 5G</span>
                  </div>
                  <div class="ps-sb-notch">
                    <div class="ps-notch-lens"></div>
                    <div class="ps-notch-sensor"></div>
                  </div>
                  <div class="ps-sb-right">
                    <svg class="ps-sb-wifi" width="14" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                    <div class="ps-sb-battery">
                      <span class="ps-sb-pct">98%</span>
                      <div class="ps-battery-shell"><div class="ps-battery-level"></div></div>
                    </div>
                  </div>
                </div>

                <!-- Swiping Photos Showcase Slider (4 High-Res Showcase Cards) -->
                <div class="ps-showcase-slider">
                  <!-- Slide 1: Tokyo Drift Maps 3D -->
                  <div class="ps-slide ps-slide-1 active">
                    <img src="https://images.unsplash.com/photo-1542051812871-757500850028?w=1200&q=80" alt="Tokyo Drift 3D" class="ps-slide-img" />
                    <div class="ps-slide-overlay">
                      <div class="ps-slide-badge">FEATURED GAME • RACING</div>
                      <h2 class="ps-slide-title">TOKYO DRIFT MAPS 3D</h2>
                      <p class="ps-slide-desc">Ultra-realistic midnight Shinjuku highway cyber drift</p>
                    </div>
                  </div>

                  <!-- Slide 2: Mecha Strike Tactics -->
                  <div class="ps-slide ps-slide-2">
                    <img src="https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1200&q=80" alt="Mecha Strike" class="ps-slide-img" />
                    <div class="ps-slide-overlay">
                      <div class="ps-slide-badge">EDITORS' CHOICE • ACTION</div>
                      <h2 class="ps-slide-title">MECHA STRIKE TACTICS</h2>
                      <p class="ps-slide-desc">High-voltage neural combat & anime mecha customization</p>
                    </div>
                  </div>

                  <!-- Slide 3: Manga Studio Pro -->
                  <div class="ps-slide ps-slide-3">
                    <img src="https://images.unsplash.com/photo-1578496479763-c21c718af028?w=1200&q=80" alt="Manga Studio" class="ps-slide-img" />
                    <div class="ps-slide-overlay">
                      <div class="ps-slide-badge">CREATIVE • STUDIO</div>
                      <h2 class="ps-slide-title">MANGA STUDIO PRO 2026</h2>
                      <p class="ps-slide-desc">Ultra-responsive screentone & digital ink canvas</p>
                    </div>
                  </div>

                  <!-- Slide 4: Cariearsa Play Store Hub -->
                  <div class="ps-slide ps-slide-4">
                    <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80" alt="Play Store Hub" class="ps-slide-img" />
                    <div class="ps-slide-overlay">
                      <div class="ps-slide-badge">CARIEARSA HUB • ECOSYSTEM</div>
                      <h2 class="ps-slide-title">PLAY STORE HUB</h2>
                      <p class="ps-slide-desc">Connect with millions of cyber apps & otaku creators</p>
                    </div>
                  </div>
                </div>

                <!-- Gallery Footer (Dots & Counter) -->
                <div class="ps-gallery-footer">
                  <div class="ps-indicator-dots">
                    <span class="ps-dot dot-1 active"></span>
                    <span class="ps-dot dot-2"></span>
                    <span class="ps-dot dot-3"></span>
                    <span class="ps-dot dot-4"></span>
                  </div>
                  <div class="ps-indicator-counter"><span id="ps-counter-text">1 / 4</span></div>
                </div>

                <!-- Touch Swiping Streak FX -->
                <div class="ps-swipe-gesture-fx">
                  <div id="ps-touch-streak" class="ps-touch-streak"></div>
                </div>

                <!-- Glass Glare Reflection -->
                <div class="ps-screen-glare"></div>
                <!-- Landscape Home Indicator -->
                <div class="ps-screen-homebar"></div>
              </div>
            </div>
          </div>

          <!-- Right Hand Gripping Right Bezel -->
          <div class="ps-hand ps-hand-right">
            <svg viewBox="0 0 160 280" class="ps-hand-svg" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="psGloveGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#1f2536" />
                  <stop offset="60%" stop-color="#111522" />
                  <stop offset="100%" stop-color="#080a11" />
                </linearGradient>
                <linearGradient id="psCyberSeamRight" x1="100%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stop-color="#00F0FF" />
                  <stop offset="100%" stop-color="#0088FF" />
                </linearGradient>
              </defs>
              <!-- Forearm & Palm Base from lower-right -->
              <path d="M160,280 L160,170 C145,160 128,150 112,140 C95,130 80,120 70,110 C55,95 45,80 40,60 C35,45 30,30 25,25 C18,18 8,22 10,38 C14,65 28,105 42,140 C55,170 65,200 70,280 Z" fill="url(#psGloveGradRight)" stroke="#2b344c" stroke-width="1.5" />
              <!-- Thumb wrapping over front right bezel -->
              <path d="M68,118 C50,95 30,68 20,55 C14,47 5,52 7,64 C12,85 30,120 45,145 C55,160 68,150 68,118 Z" fill="#242b3e" stroke="#00F0FF" stroke-width="1.2" />
              <ellipse cx="15" cy="58" rx="8" ry="12" transform="rotate(20 15 58)" fill="#2f3954" stroke="#00F0FF" stroke-width="1.2" />
              <!-- Luminous Cyber Seam -->
              <path d="M150,270 Q115,200 80,150 Q50,110 25,70" fill="none" stroke="url(#psCyberSeamRight)" stroke-width="2.5" opacity="0.9" />
              <!-- Tactical Armor Pads -->
              <rect x="95" y="190" width="40" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
              <rect x="78" y="220" width="42" height="18" rx="4" fill="#0d1017" stroke="#3b4663" stroke-width="1" />
            </svg>
          </div>

        </div>

        <!-- Forward-Facing Alignment Telemetry HUD -->
        <div id="ps-align-hud" class="ps-align-hud">
          <div class="ps-hud-reticle"></div>
          <div class="ps-hud-status">DESIGN x DEVELOP x DEPLOY</div>
        </div>

      </div>
    `;
    document.body.prepend(stage);
  }

  // Bind replay buttons
  bindPlayStoreReplayButtons();

  // Reset CSS states
  document.body.classList.remove('ps-intro-completed');
  document.body.classList.add('ps-intro-active');
  stage.style.display = 'flex';
  stage.classList.remove('fade-out');

  const camera = stage.querySelector('#ps-pov-camera');
  const assembly = stage.querySelector('#ps-phone-assembly');
  const hud = stage.querySelector('#ps-align-hud');
  const streak = stage.querySelector('#ps-touch-streak');
  const counter = stage.querySelector('#ps-counter-text');

  const slides = [
    stage.querySelector('.ps-slide-1'),
    stage.querySelector('.ps-slide-2'),
    stage.querySelector('.ps-slide-3'),
    stage.querySelector('.ps-slide-4')
  ];
  const dots = [
    stage.querySelector('.dot-1'),
    stage.querySelector('.dot-2'),
    stage.querySelector('.dot-3'),
    stage.querySelector('.dot-4')
  ];

  // Reset slider state
  slides.forEach((s, idx) => {
    s.classList.remove('active', 'slide-out-left');
    if (idx === 0) s.classList.add('active');
  });
  dots.forEach((d, idx) => {
    d.classList.toggle('active', idx === 0);
  });
  if (counter) counter.textContent = '1 / 4';
  if (hud) hud.classList.remove('visible');

  // Trigger CSS animations
  if (camera) {
    camera.classList.remove('animating');
    void camera.offsetWidth;
    camera.classList.add('animating');
  }
  if (assembly) {
    assembly.classList.remove('animating');
    void assembly.offsetWidth;
    assembly.classList.add('animating');
  }

  // Trigger touch gesture FX
  const triggerSwipeEffect = (fromIdx, toIdx) => {
    if (streak) {
      streak.classList.remove('swiping');
      void streak.offsetWidth;
      streak.classList.add('swiping');
    }
    if (slides[fromIdx]) {
      slides[fromIdx].classList.remove('active');
      slides[fromIdx].classList.add('slide-out-left');
    }
    if (slides[toIdx]) {
      slides[toIdx].classList.remove('slide-out-left');
      slides[toIdx].classList.add('active');
    }
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === toIdx);
    });
    if (counter) counter.textContent = `${toIdx + 1} / 4`;
    playSwipeSound();
  };

  // TIMELINE CHOREOGRAPHY:
  // Swipe 1 (1.4s): Tokyo Drift -> Mecha Strike
  const t1 = setTimeout(() => triggerSwipeEffect(0, 1), 1400);

  // Swipe 2 (2.8s): Mecha Strike -> Manga Studio
  const t2 = setTimeout(() => triggerSwipeEffect(1, 2), 2800);

  // Swipe 3 (4.2s): Manga Studio -> Play Store Hub
  const t3 = setTimeout(() => triggerSwipeEffect(2, 3), 4200);

  // Detik ke-6 (5.8s): Zoom-out breach riser begins
  const t4 = setTimeout(() => {
    playZoomOutWhoosh();
  }, 5800);

  // 6.8s: Hands rapidly lower the phone & tilt it down; camera tilts UP
  const t5 = setTimeout(() => {
    playPhoneDipSound();
  }, 6800);

  // 8.0s: Camera reaches straight forward gaze (PITCH 0.00°)
  const t6 = setTimeout(() => {
    if (hud) hud.classList.add('visible');
  }, 8000);

  // 9.4s: Horizon lock sound and alignment snap
  const t7 = setTimeout(() => {
    playHorizonLockSound();
  }, 9400);

  // 10.5s: Cepat kembali nengok kebawah (ke HP) & zooming masuk kembali kedalam layar HP
  const t8 = setTimeout(() => {
    playSnapDownDiveSound();
    if (hud) hud.classList.remove('visible');
  }, 10500);

  // 11.55s: Final touchdown impact into live screen
  const t9 = setTimeout(() => {
    playFinalTouchdownSound();
  }, 11550);

  // 12.0s: Intro completes, smooth fade-out to live interactive Play Store
  const tEnd = setTimeout(() => {
    document.body.classList.remove('ps-intro-active');
    document.body.classList.add('ps-intro-completed');
    stage.classList.add('fade-out');

    setTimeout(() => {
      stage.style.display = 'none';
      if (camera) camera.classList.remove('animating');
      if (assembly) assembly.classList.remove('animating');
      if (hud) hud.classList.remove('visible');
      window.__cariearsa_ps_intro_running = false;
    }, 600);
  }, 12000);

  psActiveTimers = [t1, t2, t3, t4, t5, t6, t7, t8, t9, tEnd];
}

export function skipPlayStoreIntro() {
  if (!window.__cariearsa_ps_intro_running && !document.body.classList.contains('ps-intro-active')) {
    return;
  }
  clearAllPSTimers();

  if (psAudioCtx && psAudioCtx.state !== 'closed') {
    try {
      psAudioCtx.suspend();
    } catch (_) {}
  }

  const stage = document.getElementById('ps-intro-stage');
  const camera = document.getElementById('ps-pov-camera');
  const assembly = document.getElementById('ps-phone-assembly');
  const hud = document.getElementById('ps-horizon-hud');

  document.body.classList.add('ps-intro-skipping');

  setTimeout(() => {
    document.body.classList.remove('ps-intro-active');
    document.body.classList.remove('ps-intro-skipping');
    document.body.classList.add('ps-intro-completed');

    if (stage) {
      stage.style.display = 'none';
      stage.classList.remove('fade-out');
    }
    if (camera) camera.classList.remove('animating');
    if (assembly) assembly.classList.remove('animating');
    if (hud) hud.classList.remove('visible');
    window.__cariearsa_ps_intro_running = false;
  }, 300);
}

// Expose globally for instant access
window.skipPlayStoreIntro = skipPlayStoreIntro;

export function replayPlayStoreIntro() {
  clearAllPSTimers();
  window.__cariearsa_ps_intro_running = false;
  initPlayStoreIntro();
}

// Expose globally for instant access
window.replayPlayStoreIntro = replayPlayStoreIntro;

function bindPlayStoreReplayButtons() {
  const btns = document.querySelectorAll('#replay-cinematic-btn, .ps-replay-pill');
  btns.forEach(btn => {
    if (!btn.__ps_bound) {
      btn.__ps_bound = true;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        replayPlayStoreIntro();
      });
    }
  });
}
