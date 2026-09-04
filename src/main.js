document.addEventListener('DOMContentLoaded', () => {
  // 1. Tab Focus Title Change Effect
  const originalTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? '戻ってきて！ (SYSTEM STANDBY)' : originalTitle;
  });

  // 2. Synthesized "Paper Flip / Turn" Sound
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();
  
  const playPaperFlip = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const bufferSize = audioCtx.sampleRate * 0.04; // 40ms burst
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  };

  // Attach sound to interactive elements
  document.querySelectorAll('a, button, .custom-shape-btn, .manga-btn').forEach(el => {
    el.addEventListener('mouseenter', playPaperFlip);
    el.addEventListener('click', playPaperFlip);
  });

  // Attach subtle sound to scrolling (debounced)
  let scrollTimeout;
  window.addEventListener('wheel', () => {
    if (scrollTimeout) return;
    playPaperFlip();
    scrollTimeout = window.setTimeout(() => { scrollTimeout = 0; }, 200);
  }, { passive: true });

  // 3. Automated Floating Japanese SFX
  const sfxList = ['ドンッ!!', 'ゴゴゴ', 'ドドドド', 'バァァァン', 'ズキュウゥン', 'カッ', 'シャアァ', 'パラッ'];
  const spawnFloatingSfx = () => {
    const sfx = document.createElement('div');
    sfx.textContent = sfxList[Math.floor(Math.random() * sfxList.length)];
    sfx.style.position = 'fixed';
    sfx.style.left = `${Math.random() * 80 + 10}vw`;
    sfx.style.top = `${Math.random() * 80 + 10}vh`;
    sfx.style.fontFamily = "'Noto Sans JP', sans-serif";
    sfx.style.fontWeight = '900';
    sfx.style.fontSize = `${Math.random() * 1.5 + 1}rem`;
    sfx.style.color = Math.random() > 0.5 ? '#BC002D' : '#1A1A1A';
    sfx.style.webkitTextStroke = '1px #FFFFFF';
    sfx.style.pointerEvents = 'none';
    sfx.style.zIndex = '9998';
    sfx.style.opacity = '0';
    sfx.style.transform = `rotate(${Math.random() * 60 - 30}deg) scale(0.5)`;
    sfx.style.transition = 'all 4s cubic-bezier(0.25, 1, 0.5, 1)';
    
    document.body.appendChild(sfx);

    requestAnimationFrame(() => {
      sfx.style.opacity = '0.5';
      sfx.style.transform = `translateY(-60px) rotate(${Math.random() * 60 - 30}deg) scale(1.2)`;
    });

    setTimeout(() => {
      sfx.style.opacity = '0';
      sfx.style.transform = `translateY(-120px) scale(0.8)`;
      setTimeout(() => sfx.remove(), 4000);
    }, 2000);
  };
  
  setInterval(spawnFloatingSfx, 2500);
  setTimeout(spawnFloatingSfx, 500); // Trigger first one quickly

  // 4. Compact Parallax Effect
  const panels = document.querySelectorAll('.panel');
  panels.forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
      const mouseEvent = e;
      const rect = panel.getBoundingClientRect();
      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;
      
      const img = panel.querySelector('.manga-img');
      if (img) {
        const xOffset = (x / rect.width - 0.5) * 8;
        const yOffset = (y / rect.height - 0.5) * 8;
        img.style.transform = `scale(1.05) translate(${xOffset}px, ${yOffset}px)`;
        img.style.filter = 'grayscale(0) contrast(1.1)';
      }
    });

    panel.addEventListener('mouseleave', () => {
      const img = panel.querySelector('.manga-img');
      if (img) {
        img.style.transform = 'scale(1)';
        img.style.filter = 'grayscale(100%) contrast(1.2)';
      }
    });

    // 5. Comic Panel Shake on hover
    panel.addEventListener('mouseenter', () => {
      if (panel.querySelector('.manga-img')) {
        panel.classList.add('comic-shake');
        setTimeout(() => panel.classList.remove('comic-shake'), 300);
      }
    });
  });
});
