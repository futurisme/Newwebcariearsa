// CARIEARSA Design System & Component Library Script
// Engineered with pure standard JavaScript & Web Audio API (August 2026)

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification System
  const toast = document.getElementById('libToast');
  const toastMsg = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  let toastTimer;

  const showToast = (message, icon = '📋') => {
    if (!toast) return;
    toastMsg.textContent = message;
    toastIcon.textContent = icon;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  };

  // 2. Synthesized Web Audio Engine
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  const canvas = document.getElementById('soundCanvas');
  const canvasCtx = canvas ? canvas.getContext('2d') : null;

  const initAudio = () => {
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  const drawWaveform = (data) => {
    if (!canvasCtx || !canvas) return;
    canvasCtx.fillStyle = '#000000';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#00F0FF';
    canvasCtx.beginPath();

    const sliceWidth = canvas.width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = (data[i] + 1) / 2;
      const y = v * canvas.height;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  };

  const playPaperFlip = () => {
    initAudio();
    if (!audioCtx) return;

    const bufferSize = Math.floor(audioCtx.sampleRate * 0.05); // 50ms burst
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    drawWaveform(data);

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.05);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  };

  // Attach sound to interactive library buttons
  document.querySelectorAll('.demo-btn, .theme-pill, .subnav-link, .lib-quick-btn, .swatch-card, .anim-trigger-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      // subtle tick
    });
    el.addEventListener('click', () => {
      playPaperFlip();
    });
  });

  const btnPlaySound = document.getElementById('btnPlaySound');
  if (btnPlaySound) {
    btnPlaySound.addEventListener('click', () => {
      playPaperFlip();
      showToast('Synthesized Paper Turn SFX Played', '🔊');
    });
  }

  // 3. Theme & Color Variant Switcher
  const themePills = document.querySelectorAll('.theme-pill');
  const currentThemeBadge = document.getElementById('currentThemeBadge');

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('cariearsa_theme', themeName);

    themePills.forEach(pill => {
      if (pill.dataset.theme === themeName) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    const themeTitles = {
      'original': 'ORIGINAL MANGA',
      'cyberpunk': 'CYBERPUNK NEON',
      'akira': 'AKIRA CRIMSON',
      'vintage': 'VINTAGE NEWSPRINT',
      'midnight-violet': 'MIDNIGHT VIOLET',
      'monochrome': 'MONOCHROME INK'
    };

    if (currentThemeBadge) {
      currentThemeBadge.textContent = `ACTIVE: ${themeTitles[themeName] || themeName.toUpperCase()}`;
    }

    showToast(`Switched Theme to ${themeTitles[themeName] || themeName}`, '🎨');
  };

  // Check saved theme
  const savedTheme = localStorage.getItem('cariearsa_theme') || 'original';
  if (savedTheme !== 'original') {
    applyTheme(savedTheme);
  }

  themePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const theme = pill.dataset.theme;
      applyTheme(theme);
    });
  });

  // 4. Interactive Copy System for Swatches & Code
  document.querySelectorAll('.swatch-card').forEach(card => {
    card.addEventListener('click', () => {
      const copyVal = card.getAttribute('data-copy');
      if (copyVal) {
        navigator.clipboard.writeText(copyVal).then(() => {
          showToast(`Copied ${copyVal} to clipboard!`, '📋');
        }).catch(() => {
          showToast(`Copied ${copyVal}`, '📋');
        });
      }
    });
  });

  document.querySelectorAll('.comp-code').forEach(codeBlock => {
    codeBlock.addEventListener('click', () => {
      const copyVal = codeBlock.getAttribute('data-copy');
      if (copyVal) {
        navigator.clipboard.writeText(copyVal).then(() => {
          showToast(`Code copied to clipboard!`, '💻');
        });
      }
    });
  });

  const btnCopyAllTokens = document.getElementById('btnCopyAllTokens');
  const tokenContent = document.getElementById('tokenContent');
  if (btnCopyAllTokens && tokenContent) {
    btnCopyAllTokens.addEventListener('click', () => {
      navigator.clipboard.writeText(tokenContent.textContent).then(() => {
        showToast('All CSS Design Tokens copied!', '🚀');
      });
    });
  }

  // 5. Animation Playground Handlers
  const btnTriggerShake = document.getElementById('btnTriggerShake');
  const shakeTarget = document.getElementById('shakeTarget');
  if (btnTriggerShake && shakeTarget) {
    btnTriggerShake.addEventListener('click', () => {
      shakeTarget.classList.add('comic-shake');
      setTimeout(() => shakeTarget.classList.remove('comic-shake'), 400);
      showToast('Comic Panel Shake Triggered!', '💥');
    });
  }

  const btnTriggerGlitch = document.getElementById('btnTriggerGlitch');
  const glitchTarget = document.getElementById('glitchTarget');
  if (btnTriggerGlitch && glitchTarget) {
    btnTriggerGlitch.addEventListener('click', () => {
      glitchTarget.classList.add('is-glitching');
      setTimeout(() => glitchTarget.classList.remove('is-glitching'), 900);
      showToast('Cyber Glitch Burst Triggered!', '⚡');
    });
  }

  // Floating Manga SFX Particle Generator
  const sfxList = ['ドンッ!!', 'ゴゴゴゴ', 'ドドドド', 'バァァァン', 'ズキュウゥン', 'カッ', 'シャアァ', 'パラッ', 'ザワ…'];
  const btnSpawnSfx = document.getElementById('btnSpawnSfx');

  const spawnSfxGlyph = (text) => {
    const glyph = document.createElement('div');
    glyph.textContent = text || sfxList[Math.floor(Math.random() * sfxList.length)];
    glyph.style.position = 'fixed';
    glyph.style.left = `${Math.random() * 70 + 15}vw`;
    glyph.style.top = `${Math.random() * 70 + 15}vh`;
    glyph.style.fontFamily = "'Noto Sans JP', sans-serif";
    glyph.style.fontWeight = '900';
    glyph.style.fontSize = `${Math.random() * 2 + 1.8}rem`;
    glyph.style.color = Math.random() > 0.5 ? 'var(--manga-red)' : 'var(--ink-true-black)';
    glyph.style.webkitTextStroke = '1.5px var(--paper-white)';
    glyph.style.pointerEvents = 'none';
    glyph.style.zIndex = '9999';
    glyph.style.opacity = '0';
    glyph.style.transform = `rotate(${Math.random() * 60 - 30}deg) scale(0.4)`;
    glyph.style.transition = 'all 3s cubic-bezier(0.2, 1, 0.3, 1)';

    document.body.appendChild(glyph);

    requestAnimationFrame(() => {
      glyph.style.opacity = '0.9';
      glyph.style.transform = `translateY(-80px) rotate(${Math.random() * 60 - 30}deg) scale(1.3)`;
    });

    setTimeout(() => {
      glyph.style.opacity = '0';
      glyph.style.transform = `translateY(-140px) scale(0.8)`;
      setTimeout(() => glyph.remove(), 3000);
    }, 1800);
  };

  if (btnSpawnSfx) {
    btnSpawnSfx.addEventListener('click', () => {
      spawnSfxGlyph();
      showToast('Spawned Manga SFX Particle', '🎌');
    });
  }

  // 6. Interactive Gallery Slideshow
  const track = document.getElementById('demoGalleryTrack');
  const prevBtn = document.getElementById('demoPrev');
  const nextBtn = document.getElementById('demoNext');
  const dotsContainer = document.getElementById('demoDots');
  let currentSlide = 0;
  const totalSlides = 3;

  const updateSlide = (index) => {
    currentSlide = (index + totalSlides) % totalSlides;
    if (track) {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot');
      dots.forEach((dot, i) => {
        if (i === currentSlide) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }
  };

  if (prevBtn) prevBtn.addEventListener('click', () => updateSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => updateSlide(currentSlide + 1));

  if (dotsContainer) {
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => updateSlide(i));
    });
  }

  // 7. Sub-nav Active Scroll Spy
  const sections = document.querySelectorAll('section[id]');
  const subnavLinks = document.querySelectorAll('.subnav-link');

  const onScroll = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        subnavLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
});
