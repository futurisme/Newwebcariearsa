/**
 * ==========================================================================
 * CARIEARSA INTROLAB // 360° HYPER-DIMENSIONAL CINEMATIC ENGINE
 * Subdirectory: /introlab/
 * Dedicated script - 100% isolated from all other subdirectories.
 * Floating YouTube 8D Theater • 14 Cam-Facing Monoliths • Zero Blank Space
 * Interleaved 360° Formation • Continuous Motion Across All Devices
 * Instant Gesture Audio Playback • Simplified XYZ Indicator
 * ==========================================================================
 */

(function () {
  'use strict';

  // 1. Master Subdirectory Registry (7 Core Monoliths)
  const MASTER_SUBDIRECTORIES = [
    {
      id: 'main',
      deg: 0,
      elevation: -80,
      route: '/',
      title: 'MANGA STUDIO',
      jp: '漫画スタジオ',
      tag: 'CORE 01',
      badge: 'CORE',
      accent: '#00F0FF',
      glow: 'rgba(0, 240, 255, 0.45)',
      img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
      desc: 'Portofolio utama manga & visual art CARIEARSA dengan grid komik dinamis, tipografi ekspresif, dan sound FX.'
    },
    {
      id: 'hub',
      deg: 51.4,
      elevation: 75,
      route: '/hub/',
      title: 'PLAY STORE',
      jp: 'プレイスストア',
      tag: 'CORE 02',
      badge: 'APEX HUB',
      accent: '#00FF88',
      glow: 'rgba(0, 255, 136, 0.45)',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
      desc: 'Toko aplikasi digital bernuansa Play Store gelap: Manga Studio, Tokyo Drift Maps, Yen Tracker, dan instalasi.'
    },
    {
      id: 'japan',
      deg: 102.9,
      elevation: -85,
      route: '/japan/',
      title: 'TOKYO ODYSSEY',
      jp: '東京マップ',
      tag: 'CORE 03',
      badge: 'CYBER MAP',
      accent: '#FF0055',
      glow: 'rgba(255, 0, 85, 0.45)',
      img: 'https://images.unsplash.com/photo-1542051812871-757500850028?w=600&q=80',
      desc: 'Peta interaktif Tokyo & Shinjuku bertabur neon malam, penanda interaktif, rute Yamanote, dan soundscape kota.'
    },
    {
      id: 'aniwatch',
      deg: 154.3,
      elevation: 70,
      route: '/aniwatch/',
      title: 'ANIWATCH',
      jp: 'アニウォッチ',
      tag: 'CORE 04',
      badge: 'STREAM VAULT',
      accent: '#FF3366',
      glow: 'rgba(255, 51, 102, 0.45)',
      img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
      desc: 'Platform streaming anime cyberpunk: katalog serial aksi, antarmuka bernuansa Akira, episode tracker, dan player.'
    },
    {
      id: 'cloud',
      deg: 205.7,
      elevation: -80,
      route: '/cloud/',
      title: 'CLOUD STORAGE',
      jp: 'クラウド金庫',
      tag: 'CORE 05',
      badge: 'SUPABASE VAULT',
      accent: '#0284C7',
      glow: 'rgba(2, 132, 199, 0.45)',
      img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
      desc: 'Penyimpanan berkas cloud Supabase instan: drag-and-drop file vault, visual audio player, dan enkripsi cepat.'
    },
    {
      id: 'note',
      deg: 257.1,
      elevation: 75,
      route: '/note/',
      title: 'DEV SCRATCHPAD',
      jp: 'メモ帳',
      tag: 'CORE 06',
      badge: 'MEMO SYNC',
      accent: '#FFB800',
      glow: 'rgba(255, 184, 0, 0.45)',
      img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80',
      desc: 'Aplikasi catatan digital minimalis & kilat dengan auto-save real-time, sinkronisasi multi-perangkat, dan markdown.'
    },
    {
      id: 'components',
      deg: 308.6,
      elevation: -75,
      route: '/components/',
      title: 'DESIGN SYSTEM',
      jp: 'デザイン部品',
      tag: 'CORE 07',
      badge: 'UI KIT',
      accent: '#9D4EDD',
      glow: 'rgba(157, 78, 221, 0.45)',
      img: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&q=80',
      desc: 'Katalog pustaka komponen manga: tombol khusus berpola slash & impact, lencana anime, spek token, dan panduan kode.'
    }
  ];

  // 2. Satellite Preview Registry (7 Nodes interleaved between master monoliths)
  // Perfectly spaced at ~25.7° increments to guarantee ZERO empty seconds!
  const SATELLITE_NODES = [
    {
      id: 'sat-w1',
      deg: 25.7,
      elevation: 75,
      title: 'SHINJUKU CYBER RUN',
      sub: 'TOKYO WEST FLANK',
      accent: '#00F0FF',
      route: '/japan/',
      img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&q=80'
    },
    {
      id: 'sat-e1',
      deg: 77.1,
      elevation: -75,
      title: 'AKIHABARA PULSE',
      sub: 'EAST SECTOR GRID',
      accent: '#00FF88',
      route: '/japan/',
      img: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=500&q=80'
    },
    {
      id: 'sat-w2',
      deg: 128.6,
      elevation: 80,
      title: 'NEO TOKYO DRIFT',
      sub: 'SPEED VECTOR LAB',
      accent: '#FF0055',
      route: '/hub/',
      img: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&q=80'
    },
    {
      id: 'sat-north',
      deg: 180.0,
      elevation: -80,
      title: '4K ANIME CINEMA',
      sub: 'NORTH ZENITH THEATER',
      accent: '#FF3366',
      route: '/aniwatch/',
      img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80'
    },
    {
      id: 'sat-s1',
      deg: 231.4,
      elevation: 75,
      title: 'SUPABASE CIPHER',
      sub: 'SOUTHWEST ENCRYPT',
      accent: '#0284C7',
      route: '/cloud/',
      img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'
    },
    {
      id: 'sat-e2',
      deg: 282.9,
      elevation: -75,
      title: 'YEN QUANTUM LIVE',
      sub: 'FINANCE MATRIX',
      accent: '#FFB800',
      route: '/hub/',
      img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500&q=80'
    },
    {
      id: 'sat-s2',
      deg: 334.3,
      elevation: 80,
      title: 'MANGA IMPACT LAB',
      sub: 'SOUTHEAST CANVASES',
      accent: '#9D4EDD',
      route: '/',
      img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&q=80'
    }
  ];

  class IntroLabEngine {
    constructor() {
      this.cameraSpace = document.getElementById('introlab-camera-space');
      this.pageCanvas = document.getElementById('introlab-page-canvas');
      this.orbitCluster = document.getElementById('introlab-orbit-cluster');
      this.sfxCluster = document.getElementById('introlab-sfx-cluster');
      this.speedlinesOverlay = document.getElementById('introlab-speedlines-overlay');
      this.fullBgVideo = document.getElementById('introlab-full-bg-video');

      // Telemetry Elements (Minimalist: XYZ Coordinates & Yaw only)
      this.valYaw = document.getElementById('introlab-val-yaw');
      this.valCoord = document.getElementById('introlab-val-coord');
      this.zoomStat = document.getElementById('introlab-zoom-stat');
      this.audioIndicator = document.getElementById('introlab-audio-indicator');

      // 24 seconds continuous consistent 360° kinetic orbit
      this.loopDuration = 24;

      // Card nodes cache
      this.cardNodes = [];
      this.satelliteNodes = [];
      this.sfxNodes = [];

      // YouTube Player instance & audio state
      this.ytPlayer = null;
      this.isAudioActivated = false;

      // Dynamic Responsive Parameters
      this.updateDimensions();

      this.init();
    }

    updateDimensions() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      const isPortrait = h > w;

      if (isMobile) {
        this.monolithRadius = isPortrait ? Math.min(w * 0.72, 330) : 380;
        this.satelliteRadius = this.monolithRadius * 1.06;
        this.camOrbitRadius = this.monolithRadius + (isPortrait ? 250 : 280);
        this.vScale = isPortrait ? 0.65 : 0.75;
      } else if (w < 1200) {
        this.monolithRadius = 480;
        this.satelliteRadius = 520;
        this.camOrbitRadius = 780;
        this.vScale = 0.85;
      } else {
        this.monolithRadius = 580;
        this.satelliteRadius = 620;
        this.camOrbitRadius = 900;
        this.vScale = 1.0;
      }
    }

    init() {
      this.setupYouTubePlayer();
      this.setupMonoliths();
      this.setupSatellites();
      this.setupSfxParticles();
      this.setupGestureAudioActivation();
      this.startChoreographyLoop();

      window.addEventListener('resize', () => {
        this.updateDimensions();
        this.recalculateCardPositions();
      });
    }

    /**
     * YouTube IFrame Playlist Embed & Instant Load (Full Background Coverage)
     * Playlist: PLxFmUU-8D-UbX24xnBaf64-mqoRZjsqdf (8D TUNES Mixes)
     */
    setupYouTubePlayer() {
      const playlistId = 'PLxFmUU-8D-UbX24xnBaf64-mqoRZjsqdf';
      const playerContainer = document.getElementById('introlab-yt-player');
      if (!playerContainer) return;

      const initPlayer = () => {
        try {
          if (window.YT && window.YT.Player) {
            this.ytPlayer = new window.YT.Player('introlab-yt-player', {
              width: '100%',
              height: '100%',
              playerVars: {
                listType: 'playlist',
                list: playlistId,
                autoplay: 1,
                mute: 1, // Start muted for instant load without browser restriction
                controls: 0,
                loop: 1,
                rel: 0,
                showinfo: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1,
                iv_load_policy: 3
              },
              events: {
                onReady: (event) => {
                  try {
                    event.target.playVideo();
                    event.target.setLoop(true);
                  } catch (e) {
                    console.warn('YT playVideo issue:', e);
                  }
                },
                onStateChange: (event) => {
                  if (event.data === 0 && this.ytPlayer) {
                    this.ytPlayer.playVideo();
                  }
                }
              }
            });
          } else {
            // Fallback iframe embed for instant reliability
            playerContainer.innerHTML = `
              <iframe 
                id="introlab-yt-iframe"
                src="https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&enablejsapi=1" 
                class="introlab-bg-yt-iframe" 
                allow="autoplay; encrypted-media" 
                allowfullscreen>
              </iframe>
            `;
          }
        } catch (err) {
          console.warn('YouTube Player setup:', err);
        }
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        window.onYouTubeIframeAPIReady = initPlayer;
        setTimeout(initPlayer, 1000);
      }
    }

    /**
     * Instant Gesture Audio Activation:
     * Plays with audio on the very first gesture (click, tap, keypress)
     * as required by browser media autoplay policies. No intrusive button needed!
     */
    setupGestureAudioActivation() {
      const activateAudio = () => {
        if (this.isAudioActivated) return;
        this.isAudioActivated = true;

        if (this.ytPlayer && typeof this.ytPlayer.unMute === 'function') {
          try {
            this.ytPlayer.unMute();
            this.ytPlayer.setVolume(100);
            this.ytPlayer.playVideo();
          } catch (e) {
            console.warn('unMute error:', e);
          }
        }

        // PostMessage fallback for direct iframe embed
        const iframe = document.getElementById('introlab-yt-iframe');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
          iframe.contentWindow.postMessage('{"event":"command","func":"setVolume","args":[100]}', '*');
          iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }

        if (this.audioIndicator) {
          this.audioIndicator.textContent = 'PLAYING (8D SURROUND)';
          this.audioIndicator.style.color = 'var(--intro-lime)';
        }
      };

      const gestures = ['pointerdown', 'click', 'touchstart', 'keydown', 'wheel'];
      gestures.forEach(evt => {
        window.addEventListener(evt, activateAudio, { passive: true, once: true });
      });
    }

    /**
     * Populate 7 Master Subdirectory Monoliths
     */
    setupMonoliths() {
      if (!this.orbitCluster) return;
      this.cardNodes = [];

      MASTER_SUBDIRECTORIES.forEach((sub) => {
        const card = document.createElement('a');
        card.href = sub.route;
        card.className = 'introlab-banner-card';
        card.id = `introlab-card-${sub.id}`;
        card.style.setProperty('--banner-accent', sub.accent);
        card.style.setProperty('--banner-glow', sub.glow);
        card.title = `Kunjungi ${sub.title} (${sub.route})`;

        card.innerHTML = `
          <div class="introlab-banner-top">
            <span class="introlab-banner-route">${sub.route}</span>
            <span class="introlab-banner-badge">${sub.badge}</span>
          </div>
          <div class="introlab-banner-visual">
            <span class="introlab-banner-sector-tag">${sub.tag}</span>
            <img class="introlab-banner-img" src="${sub.img}" alt="${sub.title}" loading="lazy" />
            <div class="introlab-banner-visual-overlay"></div>
          </div>
          <div class="introlab-banner-content">
            <div>
              <h3 class="introlab-banner-title">
                <span>${sub.title}</span>
                <span class="introlab-banner-jp">${sub.jp}</span>
              </h3>
              <p class="introlab-banner-desc">${sub.desc}</p>
            </div>
            <div class="introlab-banner-btn">
              <span>JELAJAHI ${sub.route}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        `;

        this.orbitCluster.appendChild(card);

        const rad = (sub.deg * Math.PI) / 180;
        const x = this.monolithRadius * Math.sin(rad);
        const z = this.monolithRadius * Math.cos(rad);
        const y = sub.elevation * this.vScale;

        this.cardNodes.push({
          element: card,
          data: sub,
          x: x,
          y: y,
          z: z,
          deg: sub.deg,
          baseElevation: sub.elevation
        });
      });
    }

    /**
     * Populate 7 Satellite Nodes (Interleaved seamlessly between monoliths)
     * Guaranteeing ZERO BLANK SECONDS and harmonious 3D flow!
     */
    setupSatellites() {
      if (!this.orbitCluster) return;
      this.satelliteNodes = [];

      SATELLITE_NODES.forEach((sat) => {
        const satCard = document.createElement('a');
        satCard.href = sat.route;
        satCard.className = 'introlab-satellite-card';
        satCard.id = `introlab-sat-${sat.id}`;
        satCard.style.setProperty('--sat-accent', sat.accent);
        satCard.title = `Preview ${sat.title}`;

        satCard.innerHTML = `
          <div class="introlab-satellite-visual">
            <img class="introlab-satellite-img" src="${sat.img}" alt="${sat.title}" loading="lazy" />
          </div>
          <div class="introlab-satellite-body">
            <div>
              <span class="introlab-satellite-sub">${sat.sub}</span>
              <h4 class="introlab-satellite-title">${sat.title}</h4>
            </div>
            <div style="font-size: 0.68rem; color: var(--sat-accent); font-family: var(--intro-font-mono); font-weight: 700;">
              VISIT SECTOR →
            </div>
          </div>
        `;

        this.orbitCluster.appendChild(satCard);

        const rad = (sat.deg * Math.PI) / 180;
        const x = this.satelliteRadius * Math.sin(rad);
        const z = this.satelliteRadius * Math.cos(rad);
        const y = sat.elevation * this.vScale;

        this.satelliteNodes.push({
          element: satCard,
          data: sat,
          x: x,
          y: y,
          z: z,
          deg: sat.deg,
          baseElevation: sat.elevation
        });
      });
    }

    recalculateCardPositions() {
      this.cardNodes.forEach((node) => {
        const rad = (node.deg * Math.PI) / 180;
        node.x = this.monolithRadius * Math.sin(rad);
        node.z = this.monolithRadius * Math.cos(rad);
        node.y = node.baseElevation * this.vScale;
      });

      this.satelliteNodes.forEach((node) => {
        const rad = (node.deg * Math.PI) / 180;
        node.x = this.satelliteRadius * Math.sin(rad);
        node.z = this.satelliteRadius * Math.cos(rad);
        node.y = node.baseElevation * this.vScale;
      });
    }

    setupSfxParticles() {
      if (!this.sfxCluster) return;
      this.sfxNodes = Array.from(this.sfxCluster.querySelectorAll('.introlab-sfx-particle')).map(el => {
        return {
          element: el,
          x: parseFloat(el.getAttribute('data-x') || '0'),
          y: parseFloat(el.getAttribute('data-y') || '0'),
          z: parseFloat(el.getAttribute('data-z') || '-500')
        };
      });
    }

    /**
     * Master Kinetic Trajectory Math: Consistent Continuous 360° Orbit
     * Smooth undulation with balanced camera pitch and elevation so cards never get clipped or lost.
     */
    calculateCameraPose(progress) {
      const angle = progress * Math.PI * 2;
      const camYaw = -(progress * 360);

      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;

      // Dynamic breathing radius
      const currentRadius = this.camOrbitRadius + Math.sin(angle * 2) * (isMobile ? 25 : 45);
      const camX = Math.sin(angle) * currentRadius;
      const camZ = Math.cos(angle) * currentRadius;

      // Gentle vertical camera undulation (avoid extreme dips that push cards off-screen)
      const maxCamY = isMobile ? (isPortrait ? 50 : 65) : 95;
      const camY = Math.sin(angle) * maxCamY + Math.cos(angle * 2) * (maxCamY * 0.22);

      // Gentle pitch: keeps cards in comfortable eye level without tipping away
      const maxPitch = isMobile ? (isPortrait ? 6 : 8) : 11;
      const camPitch = -Math.sin(angle) * maxPitch;

      // Subtle cinematic banking roll
      const camRoll = Math.sin(angle * 2) * (isMobile ? 3 : 4.5);

      // Kinetic speedline effect
      const speedlineOpacity = 0.15 + Math.abs(Math.sin(angle * 2)) * 0.25;
      const zoomLabel = `ORBIT: ${Math.round(currentRadius)}PX (360°)`;

      return { camX, camY, camZ, camYaw, camPitch, camRoll, speedlineOpacity, zoomLabel };
    }

    /**
     * Master 60/120 FPS Composited Animation Loop
     */
    startChoreographyLoop() {
      const startTime = performance.now();
      const isMobile = () => window.innerWidth < 768;

      const tick = (now) => {
        const elapsedSec = ((now - startTime) / 1000) % this.loopDuration;
        const progress = elapsedSec / this.loopDuration;

        // 1. Calculate Consistent 360° Pose
        const pose = this.calculateCameraPose(progress);

        // 2. Apply Camera Matrix to World Camera Space
        if (this.cameraSpace) {
          this.cameraSpace.style.transform = `
            rotateZ(${-pose.camRoll}deg)
            rotateX(${-pose.camPitch}deg)
            rotateY(${-pose.camYaw}deg)
            translate3d(${-pose.camX}px, ${-pose.camY}px, ${-pose.camZ}px)
          `;
        }

        // 3. Subtle Parallax for Full Background Video
        if (this.fullBgVideo) {
          const subtleTiltX = (pose.camX / 800) * 12;
          const subtleTiltY = (pose.camY / 400) * 6;
          this.fullBgVideo.style.transform = `translate3d(${-subtleTiltX}px, ${-subtleTiltY}px, 0px) scale(1.03)`;
        }

        // 4. Center Live Website Page Canvas Adaptive Billboarding
        if (this.pageCanvas) {
          const canvDist = Math.sqrt(pose.camX * pose.camX + pose.camZ * pose.camZ) || 1;
          const canvYaw = (Math.atan2(pose.camX, pose.camZ) * 180) / Math.PI;
          const canvPitch = -(Math.atan2(pose.camY, canvDist) * 180) / Math.PI;
          const bounceY = Math.sin(progress * Math.PI * 8) * 8;

          this.pageCanvas.style.transform = `
            translate3d(0px, ${bounceY}px, 0px)
            rotateY(${canvYaw}deg)
            rotateX(${canvPitch}deg)
            scale(${isMobile() ? 0.78 : 1})
          `;
        }

        // 5. TRUE CAM-FACING 3D BILLBOARDS FOR ALL 7 MASTER CARDS
        // Nodes exist in world space; rotating by worldYaw & worldPitch aligns their normal with the camera vector
        this.cardNodes.forEach((node) => {
          const dx = pose.camX - node.x;
          const dy = pose.camY - node.y;
          const dz = pose.camZ - node.z;
          const distXZ = Math.sqrt(dx * dx + dz * dz) || 1;

          const worldYaw = (Math.atan2(dx, dz) * 180) / Math.PI;
          const worldPitch = -(Math.atan2(dy, distXZ) * 180) / Math.PI;

          const totalDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const scaleBase = isMobile() ? 600 : 850;
          const scale = Math.max(0.78, Math.min(1.12, scaleBase / Math.max(340, totalDist)));

          node.element.style.transform = `
            translate3d(${node.x}px, ${node.y}px, ${node.z}px)
            rotateY(${worldYaw}deg)
            rotateX(${worldPitch}deg)
            scale(${scale})
          `;
        });

        // 6. TRUE CAM-FACING SATELLITE CARDS (INTERLEAVED PREVIEWS)
        this.satelliteNodes.forEach((node) => {
          const dx = pose.camX - node.x;
          const dy = pose.camY - node.y;
          const dz = pose.camZ - node.z;
          const distXZ = Math.sqrt(dx * dx + dz * dz) || 1;

          const worldYaw = (Math.atan2(dx, dz) * 180) / Math.PI;
          const worldPitch = -(Math.atan2(dy, distXZ) * 180) / Math.PI;

          const totalDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const scaleBase = isMobile() ? 580 : 820;
          const scale = Math.max(0.75, Math.min(1.08, scaleBase / Math.max(340, totalDist)));

          node.element.style.transform = `
            translate3d(${node.x}px, ${node.y}px, ${node.z}px)
            rotateY(${worldYaw}deg)
            rotateX(${worldPitch}deg)
            scale(${scale})
          `;
        });

        // 7. Align Distant Kanji SFX Particles
        if (this.sfxNodes) {
          this.sfxNodes.forEach((node) => {
            const dx = pose.camX - node.x;
            const dy = pose.camY - node.y;
            const dz = pose.camZ - node.z;
            const distXZ = Math.sqrt(dx * dx + dz * dz) || 1;
            const worldYaw = (Math.atan2(dx, dz) * 180) / Math.PI;
            const worldPitch = -(Math.atan2(dy, distXZ) * 180) / Math.PI;

            node.element.style.transform = `
              translate3d(${node.x}px, ${node.y}px, ${node.z}px)
              rotateY(${worldYaw}deg)
              rotateX(${worldPitch}deg)
            `;
          });
        }

        // 8. Update Speedlines
        if (this.speedlinesOverlay) {
          this.speedlinesOverlay.style.opacity = pose.speedlineOpacity.toFixed(2);
        }

        // 9. Update Telemetry: Indikator XYZ Sederhana & Ringkas
        if (this.zoomStat) this.zoomStat.textContent = pose.zoomLabel;
        if (this.valCoord) {
          this.valCoord.textContent = `${Math.round(pose.camX)}, ${Math.round(pose.camY)}, ${Math.round(pose.camZ)}`;
        }
        if (this.valYaw) {
          const normalizedYaw = Math.round(((-pose.camYaw % 360) + 360) % 360);
          this.valYaw.textContent = `${normalizedYaw}°`;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    }
  }

  // Boot on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new IntroLabEngine());
  } else {
    new IntroLabEngine();
  }
})();
