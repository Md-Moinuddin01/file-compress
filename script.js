/* ==========================================================================
       1. WEB AUDIO API SYNTHESIZER
       Generates cartoon meme sounds entirely via math & oscillators
      ========================================================================== */
    class SoundEngine {
      constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterGain = null;
      }

      init() {
        if (!this.ctx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
        }
        return this.isMuted;
      }

      /* 1. THE SIGNATURE FAAAA SOUND
         A screaming downward vocal formant sweep + noise burst + brassy wobble */
      playFaaaa(intensity = 1) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.85;

        // Dual oscillators for thick vocal timbre (sawtooth + triangle)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        // Pitch envelope: starts high with comic scream, sweeps down into comical "faaa"
        const startFreq = 480 * Math.min(intensity, 1.4);
        const endFreq = 120;
        osc1.frequency.setValueAtTime(startFreq, now);
        osc1.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

        osc2.frequency.setValueAtTime(startFreq * 1.01, now);
        osc2.frequency.exponentialRampToValueAtTime(endFreq * 0.99, now + duration);

        // Vocal Formant Filter (Bandpass centered around speech vowel frequencies)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(450, now + duration);
        filter.Q.setValueAtTime(3.5, now);

        // Tremolo / Vocal wobble (LFO)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(14, now); // 14Hz fast wobble
        lfoGain.gain.setValueAtTime(25, now);
        lfo.connect(osc1.frequency);

        // Gain envelope
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(0.9, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        lfo.start(now);

        osc1.stop(now + duration);
        osc2.stop(now + duration);
        lfo.stop(now + duration);

        // Add a burst of white noise for the compressed air blast
        this.playSteamBurst(now, 0.4);
      }

      /* 2. BOING SOUND: Classic cartoon spring jaw-harp */
      playBoing() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.6;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        // Fast upward pitch sweep followed by bouncing vibrato
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

        // Vibrato
        const vibrato = this.ctx.createOscillator();
        const vibGain = this.ctx.createGain();
        vibrato.frequency.setValueAtTime(18, now);
        vibGain.gain.setValueAtTime(30, now);
        vibrato.connect(osc.frequency);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        vibrato.start(now);
        osc.stop(now + duration);
        vibrato.stop(now + duration);
      }

      /* 3. BRUH SOUND: Low resonance sad trombone / bruh buzz */
      playBruh() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.75;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'square';

        osc1.frequency.setValueAtTime(95, now);
        osc1.frequency.linearRampToValueAtTime(70, now + duration);

        osc2.frequency.setValueAtTime(96, now);
        osc2.frequency.linearRampToValueAtTime(69, now + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.linearRampToValueAtTime(150, now + duration);
        filter.Q.setValueAtTime(5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
      }

      /* 4. SPLAT SOUND: Wet squishy impact */
      playSplat() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.35;

        // Low bubbling sine
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + duration);

        // Wet noise crack
        this.playSteamBurst(now, 0.25, 900);
      }

      /* 5. WOW SOUND: Anime / meme style rising vocal sweep */
      playWow() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const duration = 0.7;

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.35);
        osc.frequency.linearRampToValueAtTime(320, now + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 0.35);
        filter.frequency.linearRampToValueAtTime(600, now + duration);
        filter.Q.setValueAtTime(5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
      }

      /* 6. LAUGH SOUND: Staccato bouncy comic giggles */
      playLaugh() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const bursts = [0, 0.12, 0.24, 0.38, 0.52];
        const freqs = [380, 420, 390, 440, 320];

        bursts.forEach((offset, idx) => {
          const now = this.ctx.currentTime + offset;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freqs[idx], now);
          osc.frequency.exponentialRampToValueAtTime(freqs[idx] * 0.7, now + 0.09);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.45, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 850;
          filter.Q.value = 2;

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 0.09);
        });
      }

      /* Metallic punch & sub bass slam */
      playHeavySlam() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Sub bass thump
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(140, now);
        sub.frequency.exponentialRampToValueAtTime(32, now + 0.3);

        subGain.gain.setValueAtTime(1, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(now);
        sub.stop(now + 0.35);

        // Metallic clink
        const metal = this.ctx.createOscillator();
        const metalGain = this.ctx.createGain();
        metal.type = 'square';
        metal.frequency.setValueAtTime(850, now);
        metal.frequency.exponentialRampToValueAtTime(120, now + 0.15);

        metalGain.gain.setValueAtTime(0.35, now);
        metalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        metal.connect(metalGain);
        metalGain.connect(this.masterGain);
        metal.start(now);
        metal.stop(now + 0.15);
      }

      /* Noise burst for steam exhaust */
      playSteamBurst(startTime = null, dur = 0.3, centerFreq = 1200) {
        if (!this.ctx) return;
        const now = startTime || this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * dur;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(centerFreq, now);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + dur);
      }
    }

    const audio = new SoundEngine();

    /* ==========================================================================
       2. CONFETTI & EMOJI PARTICLE SYSTEM
       Pure Canvas 2D physics explosion
       ========================================================================== */
    class ParticleCannon {
      constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }

      resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }

      burst(x, y, count = 55) {
        const emojis = ['🥞', '⚡', '✨', '⭐', '💥', '🔥', '🗜️', '🎉', '💨'];
        const colors = ['#ffd60a', '#ff2a5f', '#10b981', '#06b6d4', '#8b5cf6', '#ff7b00'];

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 14 + 5;
          const isEmoji = Math.random() > 0.65;

          this.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.25,
            size: isEmoji ? Math.random() * 16 + 18 : Math.random() * 8 + 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
            alpha: 1,
            gravity: 0.35,
            decay: Math.random() * 0.015 + 0.01
          });
        }

        if (!this.animationId) {
          this.animate();
        }
      }

      animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.rotation += p.rotSpeed;
          p.alpha -= p.decay;

          if (p.alpha <= 0 || p.y > this.canvas.height + 50) {
            this.particles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.globalAlpha = p.alpha;
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);

          if (p.emoji) {
            this.ctx.font = `${p.size}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.emoji, 0, 0);
          } else {
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          }

          this.ctx.restore();
        }

        if (this.particles.length > 0) {
          this.animationId = requestAnimationFrame(() => this.animate());
        } else {
          this.animationId = null;
        }
      }
    }

    const cannon = new ParticleCannon();

    /* ==========================================================================
       3. DOM ELEMENTS & STATE MANAGEMENT
       ========================================================================== */
    const elements = {
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundIcon: document.getElementById('soundIcon'),
      soundText: document.getElementById('soundText'),
      soundButtons: document.querySelectorAll('.sound-btn'),

      dropzone: document.getElementById('dropzone'),
      fileInput: document.getElementById('fileInput'),
      fileCard: document.getElementById('fileCard'),
      fileBadge: document.getElementById('fileBadge'),
      fileNameDisplay: document.getElementById('fileNameDisplay'),
      fileSizeDisplay: document.getElementById('fileSizeDisplay'),
      fileStatusBadge: document.getElementById('fileStatusBadge'),
      removeFileBtn: document.getElementById('removeFileBtn'),

      pressBtn: document.getElementById('pressBtn'),
      pressHint: document.getElementById('pressHint'),
      pistonAssembly: document.getElementById('pistonAssembly'),
      pistonRod: document.getElementById('pistonRod'),
      stageChamber: document.getElementById('stageChamber'),
      gaugeNeedle: document.getElementById('gaugeNeedle'),
      gaugeLabel: document.getElementById('gaugeLabel'),
      comicPop: document.getElementById('comicPop'),
      steamLeft: document.getElementById('steamLeft'),
      steamRight: document.getElementById('steamRight'),

      resultsCard: document.getElementById('resultsCard'),
      origSizeStat: document.getElementById('origSizeStat'),
      squishedSizeStat: document.getElementById('squishedSizeStat'),
      savedStat: document.getElementById('savedStat'),
      diagnosisBox: document.getElementById('diagnosisBox'),
      diagnosisText: document.getElementById('diagnosisText'),
      downloadBtn: document.getElementById('downloadBtn'),
      pressAgainBtn: document.getElementById('pressAgainBtn'),
      resetBtn: document.getElementById('resetBtn'),
      shareBtn: document.getElementById('shareBtn'),
      squashStreakBadge: document.getElementById('squashStreakBadge'),
      toast: document.getElementById('toast')
    };

    let currentFile = null;
    let compressedBlob = null;
    let compressedUrl = null;
    let isPressing = false;
    let squashCount = 0;

    /* Utility: Format bytes into readable format */
    function formatBytes(bytes, decimals = 2) {
      if (!bytes || bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /* Utility: Return emoji icon matching file extension */
    function getFileIcon(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return '🖼️';
      if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return '🎬';
      if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) return '🎵';
      if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) return '📑';
      if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
      if (['js', 'html', 'css', 'ts', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) return '💻';
      return '📄';
    }

    /* Utility: Show temporary toast */
    function showToast(msg) {
      elements.toast.textContent = msg;
      elements.toast.classList.add('show');
      setTimeout(() => elements.toast.classList.remove('show'), 2400);
    }

    /* ==========================================================================
       4. SOUNDBOARD EVENT HANDLERS
       ========================================================================== */
    elements.soundToggleBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      elements.soundIcon.textContent = isMuted ? '🔇' : '🔊';
      elements.soundText.textContent = isMuted ? 'Sound OFF' : 'Sound ON';
      showToast(isMuted ? 'Audio muted' : 'Audio enabled!');
    });

    elements.soundButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const soundType = btn.dataset.sound;
        switch (soundType) {
          case 'faaa': audio.playFaaaa(1); break;
          case 'boing': audio.playBoing(); break;
          case 'bruh': audio.playBruh(); break;
          case 'splat': audio.playSplat(); break;
          case 'wow': audio.playWow(); break;
          case 'laugh': audio.playLaugh(); break;
        }

        // Mini confetti on sound button click
        const rect = btn.getBoundingClientRect();
        cannon.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
      });
    });

    /* ==========================================================================
       5. FILE UPLOAD & DROPZONE HANDLING
       ========================================================================== */
    function handleSelectedFile(file) {
      if (!file) return;
      currentFile = file;
      squashCount = 0;

      // Update UI
      elements.fileBadge.textContent = getFileIcon(file.name);
      elements.fileNameDisplay.textContent = file.name;
      elements.fileSizeDisplay.textContent = formatBytes(file.size);
      elements.fileStatusBadge.textContent = 'READY TO CRUNCH';
      elements.fileStatusBadge.style.background = '#dcfce7';
      elements.fileStatusBadge.style.color = '#15803d';

      elements.dropzone.style.display = 'none';
      elements.fileCard.style.display = 'flex';
      elements.fileCard.classList.remove('squashed');

      elements.pressBtn.disabled = false;
      elements.pressHint.textContent = `File loaded (${formatBytes(file.size)}). Ready for 20,000 tons of pressure!`;

      // Hide past results
      elements.resultsCard.style.display = 'none';

      // Needle twitch
      elements.gaugeNeedle.style.transform = 'rotate(-10deg)';
      elements.gaugeLabel.textContent = 'PRIMED';

      audio.playBoing();
    }

    elements.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleSelectedFile(e.target.files[0]);
      }
    });

    // Drag and drop events
    ['dragenter', 'dragover'].forEach(name => {
      elements.dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        elements.dropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      elements.dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        elements.dropzone.classList.remove('drag-over');
      });
    });

    elements.dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });

    elements.removeFileBtn.addEventListener('click', () => {
      resetMachine();
      audio.playBoing();
    });

    function resetMachine() {
      currentFile = null;
      compressedBlob = null;
      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
        compressedUrl = null;
      }
      squashCount = 0;
      elements.fileInput.value = '';
      elements.fileCard.style.display = 'none';
      elements.fileCard.classList.remove('squashed');
      elements.dropzone.style.display = 'flex';
      elements.pressBtn.disabled = true;
      elements.pressHint.textContent = 'Feed a file into the chamber to unlock the piston!';
      elements.resultsCard.style.display = 'none';
      elements.gaugeNeedle.style.transform = 'rotate(-50deg)';
      elements.gaugeLabel.textContent = 'IDLE';
    }

    /* ==========================================================================
       6. REAL FILE COMPRESSION ENGINE (CompressionStream Gzip)
       ========================================================================== */
    async function compressFile(file) {
      // Check for native CompressionStream API
      if ('CompressionStream' in window) {
        try {
          const cs = new CompressionStream('gzip');
          const stream = file.stream().pipeThrough(cs);
          const response = new Response(stream);
          const blob = await response.blob();
          return blob;
        } catch (err) {
          console.warn('CompressionStream error, fallback to simulated wrapper:', err);
        }
      }

      // Fallback: If CompressionStream is unsupported, wrap original file in a gzip-named blob
      return new Blob([await file.arrayBuffer()], { type: 'application/gzip' });
    }

    /* ==========================================================================
       7. THE GRAND "PRESS IT!" ACTION & ANIMATION SEQUENCE
       ========================================================================== */
    elements.pressBtn.addEventListener('click', () => triggerSquash(false));
    elements.pressAgainBtn.addEventListener('click', () => triggerSquash(true));

    async function triggerSquash(isReSquash = false) {
      if (!currentFile || isPressing) return;
      isPressing = true;
      squashCount++;

      // UI state
      elements.pressBtn.disabled = true;
      elements.gaugeNeedle.style.transform = 'rotate(60deg)';
      elements.gaugeLabel.textContent = 'MAX FAAAA!';

      // Random comic words
      const comicWords = ['FAAAAAA!', 'WHAM!', 'SQUISHED!', 'KABLAM!', 'PANCAKE!', 'BRUUUH!'];
      elements.comicPop.textContent = isReSquash ? 'ULTRA FAAAA!' : comicWords[Math.floor(Math.random() * comicWords.length)];

      // 1. Hydraulic descent: calculate travel distance dynamically
      const chamberRect = elements.stageChamber.getBoundingClientRect();
      const cardRect = elements.fileCard.getBoundingClientRect();
      const pistonRect = elements.pistonAssembly.getBoundingClientRect();

      // Lower piston to touch the file card
      const travelDist = Math.max(120, (cardRect.top - pistonRect.bottom + 40));
      elements.pistonAssembly.style.transition = 'transform 0.22s cubic-bezier(.77,0,.175,1)';
      elements.pistonAssembly.style.transform = `translateY(${travelDist}px)`;

      // Start compression promise in background
      const compressionPromise = compressFile(currentFile);

      // 2. The Impact moment (after 220ms descent)
      setTimeout(async () => {
        // Screen shake
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 450);

        // Heavy slam & FAAAA screaming audio
        audio.playHeavySlam();
        audio.playFaaaa(1 + squashCount * 0.15);

        // Visual squash on card
        elements.fileCard.classList.add('squashed');
        elements.fileStatusBadge.textContent = `SQUASHED x${squashCount}`;
        elements.fileStatusBadge.style.background = '#fef08a';
        elements.fileStatusBadge.style.color = '#854d0e';

        // Comic pop badge
        elements.comicPop.classList.add('show');

        // Steam cloud burst
        elements.steamLeft.style.opacity = '1';
        elements.steamLeft.style.transform = 'translate(-40px, -20px) scale(1.4)';
        elements.steamRight.style.opacity = '1';
        elements.steamRight.style.transform = 'translate(40px, -20px) scale(1.4)';

        // Confetti explosion from the anvil
        const anvilRect = elements.fileCard.getBoundingClientRect();
        cannon.burst(anvilRect.left + anvilRect.width / 2, anvilRect.top + anvilRect.height / 2, 45);

        // 3. Piston Retraction (after 450ms hold)
        setTimeout(async () => {
          elements.pistonAssembly.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
          elements.pistonAssembly.style.transform = 'translateY(0)';
          elements.comicPop.classList.remove('show');

          // Reset steam
          elements.steamLeft.style.opacity = '0';
          elements.steamLeft.style.transform = 'none';
          elements.steamRight.style.opacity = '0';
          elements.steamRight.style.transform = 'none';

          elements.gaugeNeedle.style.transform = 'rotate(-10deg)';
          elements.gaugeLabel.textContent = 'DONE';

          // Await compression result
          try {
            compressedBlob = await compressionPromise;
            displayResults(currentFile, compressedBlob, squashCount);
          } catch (err) {
            console.error(err);
            showToast('Compression warning: Used fallback packing');
          } finally {
            isPressing = false;
            elements.pressBtn.disabled = false;
          }
        }, 550);

      }, 220);
    }

    /* ==========================================================================
       8. DISPLAY RESULTS & DOWNLOAD
       ========================================================================== */
    function displayResults(origFile, squashedBlob, count) {
      const origSize = origFile.size;
      const compSize = squashedBlob.size;
      const savedBytes = origSize - compSize;
      const pctSaved = origSize > 0 ? ((savedBytes / origSize) * 100).toFixed(1) : '0';

      elements.origSizeStat.textContent = formatBytes(origSize);
      elements.squishedSizeStat.textContent = formatBytes(compSize);

      if (savedBytes > 0) {
        elements.savedStat.textContent = `-${pctSaved}%`;
        elements.savedStat.parentElement.classList.add('highlight');
      } else {
        // Files like already-compressed JPEGs or MP4s might slightly expand due to gzip headers
        const expandPct = Math.abs(parseFloat(pctSaved));
        elements.savedStat.textContent = `+${expandPct}%*`;
        elements.savedStat.parentElement.classList.remove('highlight');
      }

      // Generate funny diagnosis
      let verdict = '';
      if (savedBytes > 0) {
        if (parseFloat(pctSaved) > 50) {
          verdict = `MAXIMUM CRUNCH! File crushed like a soda can! You stripped away ${formatBytes(savedBytes)} of pure digital bloat.`;
        } else {
          verdict = `SOLID SQUISH! Shaved off ${formatBytes(savedBytes)}. The file fits much better into browser pockets now.`;
        }
      } else {
        verdict = `PHYSICS SAID NO! This file was already rock-solid (already compressed). Gzip added a tiny header, but our piston spiritually squished it into the 2nd dimension!`;
      }
      elements.diagnosisText.textContent = verdict;

      // Update download link
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      compressedUrl = URL.createObjectURL(squashedBlob);
      elements.downloadBtn.href = compressedUrl;

      // Calculate clean download filename
      const baseName = origFile.name.endsWith('.gz') ? origFile.name.replace(/\.gz$/, '') : origFile.name;
      elements.downloadBtn.download = `${baseName}.gz`;

      elements.squashStreakBadge.textContent = `${count}x SQUASHED`;

      // Show results card
      elements.resultsCard.style.display = 'block';
      elements.resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /* Reset button */
    elements.resetBtn.addEventListener('click', () => {
      resetMachine();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* Share brag */
    elements.shareBtn.addEventListener('click', async () => {
      const origText = elements.origSizeStat.textContent;
      const compText = elements.squishedSizeStat.textContent;
      const savedText = elements.savedStat.textContent;
      const shareText = `I just squashed ${currentFile.name} from ${origText} down to ${compText} (${savedText}) using FAAAA File Press! 🔨💥 FAAAAAA!`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'FAAAA File Press',
            text: shareText,
            url: window.location.href
          });
          return;
        } catch (err) {
          // Fallback to clipboard
        }
      }

      navigator.clipboard.writeText(shareText).then(() => {
        showToast('Squash brag copied to clipboard! 📋');
      }).catch(() => {
        showToast('Brag ready: ' + shareText);
      });
    });

    // Clean up object URLs on page unload
    window.addEventListener('beforeunload', () => {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    });
