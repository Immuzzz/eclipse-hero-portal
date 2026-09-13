// Advanced Web Audio API Synthesizer with Distinct Sound Design per Use-Case
class SoundController {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.audioBuffers = {};
    this.loadAudioAssets();
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    // HACK: iOS Safari unconditionally starts AudioContext in 'suspended' state
    // until a direct user touch/click gesture occurs. Checking and resuming here on first interaction.
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  loadAudioAssets() {
    const assets = {
      'saiyan-mode1': './assets/audio/saiyan-mode1-burst.wav',
      'saiyan-mode2': './assets/audio/saiyan-mode2-transcendent.wav',
      'slash-odachi': './assets/audio/slash-odachi.wav',
      'slash-nihil': './assets/audio/slash-nihil.wav'
    };

    Object.entries(assets).forEach(([key, url]) => {
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buf) => {
          this.init();
          return this.ctx.decodeAudioData(buf);
        })
        .then((decoded) => {
          this.audioBuffers[key] = decoded;
        })
        .catch(() => {
          // Graceful fallback to procedural Dragon Ball synthesis
        });
    });
  }

  playBuffer(key, gainVal = 1.0) {
    if (!this.enabled || !this.audioBuffers[key]) return false;
    this.init();
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.audioBuffers[key];
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      source.connect(gain);
      gain.connect(this.ctx.destination);
      source.start(0);
      return true;
    } catch {
      return false;
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playToggleSound(true);
    }
    return this.enabled;
  }

  // 1. UI Subtle Nav Hover (Light tick)
  playNavHover() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.02);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.02);
  }

  // 2. UI Nav Click (Tactile mechanical key switch click)
  playNavClick() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.035);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  // 3. High-Tech HUD Telemetry Chirp (Apex/Cyberpunk telemetry blip)
  playHudChirp() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    [2200, 3300].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.025;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.04, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.03);
    });
  }

  // 4. Mode I: EVENT HORIZON Activation (Dragon Ball Goku Super Saiyan 2 / Kaio-Ken Ki Flare)
  playModeEventHorizon() {
    if (!this.enabled) return;
    this.init();

    // 1. Play pristine high-fidelity Saiyan audio buffer
    if (this.playBuffer('saiyan-mode1', 1.0)) {
      return;
    }

    // 2. Procedural Dragon Ball Super Saiyan Ki Flare Engine Fallback
    const t = this.ctx.currentTime;

    // Sub-bass Ki shockwave thump
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(42, t + 0.4);
    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.4);

    // Iconic DBZ Saiyan resonant whistle sweep (Bandpass Q=15 with 16Hz vibrato flutter)
    const bufSize = Math.floor(this.ctx.sampleRate * 0.75);
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(15, t);
    bp.frequency.setValueAtTime(320, t);
    bp.frequency.exponentialRampToValueAtTime(2500, t + 0.55);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(16, t);
    lfoGain.gain.setValueAtTime(120, t);
    lfo.connect(bp.frequency);
    lfo.start(t);
    lfo.stop(t + 0.75);

    const whistleGain = this.ctx.createGain();
    whistleGain.gain.setValueAtTime(0.7, t);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    noiseSrc.connect(bp);
    bp.connect(whistleGain);
    whistleGain.connect(this.ctx.destination);
    noiseSrc.start(t);
    noiseSrc.stop(t + 0.75);

    // High-voltage electric arc crackles (SSJ2 Sparks)
    [0.08, 0.16, 0.28, 0.42].forEach((delay) => {
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(4200, t + delay);
      click.frequency.exponentialRampToValueAtTime(800, t + delay + 0.025);
      clickGain.gain.setValueAtTime(0.2, t + delay);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.025);
      click.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      click.start(t + delay);
      click.stop(t + delay + 0.025);
    });
  }

  // 5. Mode II: TRANSCENDENT Activation (Dragon Ball Goku Super Saiyan 3 / Ultra Instinct God Awakening)
  playModeTranscendent() {
    if (!this.enabled) return;
    this.init();

    // 1. Play pristine high-fidelity Saiyan God audio buffer
    if (this.playBuffer('saiyan-mode2', 1.0)) {
      return;
    }

    // 2. Procedural Dragon Ball Super Saiyan God Awakening Engine Fallback
    const t = this.ctx.currentTime;

    // Atmospheric intake suction (0.0s - 0.2s)
    const suck = this.ctx.createOscillator();
    const suckGain = this.ctx.createGain();
    suck.type = 'sine';
    suck.frequency.setValueAtTime(40, t);
    suck.frequency.exponentialRampToValueAtTime(160, t + 0.2);
    suckGain.gain.setValueAtTime(0.01, t);
    suckGain.gain.linearRampToValueAtTime(0.35, t + 0.2);
    suckGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    suck.connect(suckGain);
    suckGain.connect(this.ctx.destination);
    suck.start(t);
    suck.stop(t + 0.22);

    // Seismic detonation Ki shockwave (t >= 0.2s)
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(180, t + 0.2);
    sub.frequency.exponentialRampToValueAtTime(36, t + 0.9);
    subGain.gain.setValueAtTime(0.5, t + 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t + 0.2);
    sub.stop(t + 1.2);

    // Soaring dual-resonant Saiyan Ki scream (Bandpass Q=18, sweeping to 4200Hz with 13.5Hz flutter)
    const bufSize = Math.floor(this.ctx.sampleRate * 1.5);
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(18, t + 0.18);
    bp.frequency.setValueAtTime(280, t + 0.18);
    bp.frequency.exponentialRampToValueAtTime(4200, t + 1.1);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(13.5, t + 0.18);
    lfoGain.gain.setValueAtTime(200, t + 0.18);
    lfo.connect(bp.frequency);
    lfo.start(t + 0.18);
    lfo.stop(t + 1.6);

    const screamGain = this.ctx.createGain();
    screamGain.gain.setValueAtTime(0.8, t + 0.2);
    screamGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

    noiseSrc.connect(bp);
    bp.connect(screamGain);
    screamGain.connect(this.ctx.destination);
    noiseSrc.start(t + 0.18);
    noiseSrc.stop(t + 1.6);

    // Celestial hard-light shimmer (Ultra Instinct harmonics)
    [1760, 2217, 2637, 3520].forEach((freq, idx) => {
      const shim = this.ctx.createOscillator();
      const shimGain = this.ctx.createGain();
      const delay = 0.3 + idx * 0.04;
      shim.type = 'sine';
      shim.frequency.setValueAtTime(freq, t + delay);
      shimGain.gain.setValueAtTime(0.08, t + delay);
      shimGain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.2);
      shim.connect(shimGain);
      shimGain.connect(this.ctx.destination);
      shim.start(t + delay);
      shim.stop(t + delay + 1.2);
    });
  }

  // 6. Weapon 01: The Compressed Odachi Selection (Metallic blade unsheathing ring: "Shhh-shing!")
  playWeaponOdachi() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    // Metallic scrape noise
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(4500, t);
    bandpass.frequency.exponentialRampToValueAtTime(7500, t + 0.12);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);

    // Resonant ringing steel blade tone
    const ring = this.ctx.createOscillator();
    const ringGain = this.ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(2637, t + 0.05); // E7 ringing tone
    ringGain.gain.setValueAtTime(0.12, t + 0.05);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

    ring.connect(ringGain);
    ringGain.connect(this.ctx.destination);
    ring.start(t + 0.05);
    ring.stop(t + 0.5);
  }

  // 7. Weapon 02: Nihil Veritas Selection (Ethereal crystal bell chime + cosmic pulse)
  playWeaponNihil() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    // Deep cosmic resonance
    const hum = this.ctx.createOscillator();
    const humGain = this.ctx.createGain();
    hum.type = 'triangle';
    hum.frequency.setValueAtTime(110, t);
    humGain.gain.setValueAtTime(0.2, t);
    humGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    hum.connect(humGain);
    humGain.connect(this.ctx.destination);
    hum.start(t);
    hum.stop(t + 0.55);

    // High crystalline chime (detuned pair for shimmering crystal glass sound)
    [1760, 1774].forEach((freq) => {
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(freq, t);
      chimeGain.gain.setValueAtTime(0.1, t);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      chime.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chime.start(t);
      chime.stop(t + 0.7);
    });
  }

  // 8A. Weapon 01 Slash: THE COMPRESSED ODACHI (Dark Crescent Molecular Katana Cleave)
  playOdachiSlash() {
    if (!this.enabled) return;
    this.init();

    // Try pre-rendered high-definition Katana slice buffer
    if (this.playBuffer('slash-odachi', 1.0)) {
      return;
    }

    // Procedural Odachi Iaido Slash Synthesis Fallback
    const t = this.ctx.currentTime;

    // 1. Supersonic whip crack / blade draw transient (<20ms)
    const snapOsc = this.ctx.createOscillator();
    const snapMod = this.ctx.createOscillator();
    const snapModGain = this.ctx.createGain();
    const snapGain = this.ctx.createGain();

    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(3800, t);
    snapOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.02);

    snapMod.type = 'sine';
    snapMod.frequency.setValueAtTime(8200, t);

    snapModGain.gain.setValueAtTime(4500, t);
    snapModGain.gain.exponentialRampToValueAtTime(1, t + 0.018);

    snapMod.connect(snapOsc.frequency);
    snapOsc.connect(snapGain);

    snapGain.gain.setValueAtTime(0.75, t);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

    snapGain.connect(this.ctx.destination);
    snapMod.start(t);
    snapOsc.start(t);
    snapMod.stop(t + 0.025);
    snapOsc.stop(t + 0.025);

    // 2. High-frequency crack noise burst (<12ms)
    const burstSize = Math.floor(this.ctx.sampleRate * 0.02);
    const burstBuf = this.ctx.createBuffer(1, burstSize, this.ctx.sampleRate);
    const burstData = burstBuf.getChannelData(0);
    for (let i = 0; i < burstSize; i++) burstData[i] = Math.random() * 2 - 1;
    const burstSrc = this.ctx.createBufferSource();
    burstSrc.buffer = burstBuf;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(4200, t);

    const burstGain = this.ctx.createGain();
    burstGain.gain.setValueAtTime(0.85, t);
    burstGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    burstSrc.connect(hp);
    hp.connect(burstGain);
    burstGain.connect(this.ctx.destination);
    burstSrc.start(t);
    burstSrc.stop(t + 0.02);

    // 3. Razor-sharp molecular aero-shearing whoosh (8800Hz -> 1400Hz)
    const bufSize = Math.floor(this.ctx.sampleRate * 0.3);
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(14, t);
    bp.frequency.setValueAtTime(8800, t);
    bp.frequency.exponentialRampToValueAtTime(1400, t + 0.16);

    const cutGain = this.ctx.createGain();
    cutGain.gain.setValueAtTime(0.8, t);
    cutGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    noiseSrc.connect(bp);
    bp.connect(cutGain);
    cutGain.connect(this.ctx.destination);
    noiseSrc.start(t);
    noiseSrc.stop(t + 0.3);

    // 4. Multi-modal Tamahagane steel blade singing resonance (2740Hz, 3950Hz, 5620Hz)
    [2740, 3950, 5620].forEach((freq, idx) => {
      const ring = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(freq, t);
      const vol = idx === 0 ? 0.22 : idx === 1 ? 0.15 : 0.08;
      const decay = idx === 0 ? 0.55 : idx === 1 ? 0.4 : 0.25;
      ringGain.gain.setValueAtTime(vol, t + 0.004);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      ring.connect(ringGain);
      ringGain.connect(this.ctx.destination);
      ring.start(t + 0.004);
      ring.stop(t + decay);
    });

    // 5. Kinetic vacuum displacement thump (145Hz -> 38Hz punch)
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(145, t + 0.008);
    sub.frequency.exponentialRampToValueAtTime(38, t + 0.22);
    subGain.gain.setValueAtTime(0.65, t + 0.008);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t + 0.008);
    sub.stop(t + 0.32);
  }

  // 8B. Weapon 02 Slash: NIHIL VERITAS (Genesis Cleave / Cosmic World Stitch)
  playNihilSlash() {
    if (!this.enabled) return;
    this.init();

    // Try pre-rendered high-definition Cosmic Blade buffer
    if (this.playBuffer('slash-nihil', 1.0)) {
      return;
    }

    // Procedural Nihil Veritas Cosmic Slash Synthesis Fallback
    const t = this.ctx.currentTime;

    // 1. Reality fracture & crystal glass shatter pings
    [4800, 6400, 3200, 8800].forEach((freq, idx) => {
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      const delay = idx * 0.008;
      ping.type = 'sine';
      ping.frequency.setValueAtTime(freq, t + delay);
      pingGain.gain.setValueAtTime(0.18, t + delay);
      pingGain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.08);
      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      ping.start(t + delay);
      ping.stop(t + delay + 0.09);
    });

    // Laser reality rupture chirp (9200Hz -> 750Hz in 55ms)
    const laser = this.ctx.createOscillator();
    const laserGain = this.ctx.createGain();
    laser.type = 'sawtooth';
    laser.frequency.setValueAtTime(9200, t);
    laser.frequency.exponentialRampToValueAtTime(750, t + 0.06);
    laserGain.gain.setValueAtTime(0.28, t);
    laserGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    laser.connect(laserGain);
    laserGain.connect(this.ctx.destination);
    laser.start(t);
    laser.stop(t + 0.09);

    // 2. Tectonic gravitational collapse sub-boom (115Hz -> 26Hz)
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(115, t);
    sub.frequency.exponentialRampToValueAtTime(26, t + 1.4);
    subGain.gain.setValueAtTime(0.75, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 1.8);

    // Warm sub-harmonic 32Hz rumble
    const subHarmonic = this.ctx.createOscillator();
    const harmGain = this.ctx.createGain();
    subHarmonic.type = 'sine';
    subHarmonic.frequency.setValueAtTime(32, t);
    harmGain.gain.setValueAtTime(0.35, t);
    harmGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    subHarmonic.connect(harmGain);
    harmGain.connect(this.ctx.destination);
    subHarmonic.start(t);
    subHarmonic.stop(t + 1.5);

    // 3. Abyssal dimensional tear & vortex whoosh
    const bufSize = Math.floor(this.ctx.sampleRate * 1.2);
    const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.setValueAtTime(12, t);
    bp.frequency.setValueAtTime(380, t);
    bp.frequency.exponentialRampToValueAtTime(4800, t + 0.5);

    const tearGain = this.ctx.createGain();
    tearGain.gain.setValueAtTime(0.8, t);
    tearGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

    noiseSrc.connect(bp);
    bp.connect(tearGain);
    tearGain.connect(this.ctx.destination);
    noiseSrc.start(t);
    noiseSrc.stop(t + 1.1);

    // 4. Singing celestial constellation choir / starlight chord (Eb minor 9th shimmer)
    const cosmicChord = [155.56, 311.13, 466.16, 622.25, 698.46, 932.33, 1244.5, 1661.2];
    cosmicChord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = 0.04 + idx * 0.015;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      const vol = 0.07 * (1 - idx * 0.08);
      gain.gain.setValueAtTime(vol, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 1.8);
    });
  }

  // Unified Slash Dispatcher
  playWeaponSlash(weaponKey) {
    if (weaponKey === 'nihil') {
      this.playNihilSlash();
    } else {
      this.playOdachiSlash();
    }
  }

  playEpicSlash() {
    this.playOdachiSlash();
  }

  // 9. Planetary Rift Deployment (Emergency klaxon sweep + power surge)
  playRiftDeploy() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    const klaxon = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    klaxon.type = 'sawtooth';
    klaxon.frequency.setValueAtTime(440, t);
    klaxon.frequency.linearRampToValueAtTime(880, t + 0.15);
    klaxon.frequency.linearRampToValueAtTime(440, t + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    klaxon.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    klaxon.start(t);
    klaxon.stop(t + 0.35);
  }

  // 10. Zoom / Blueprint Expand (Camera aperture snap)
  playZoomIn() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    [1400, 2200].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.03);
      gain.gain.setValueAtTime(0.07, t + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.04);
    });
  }

  // 11. Audio System Power On / Off Feedback
  playToggleSound(isOn) {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (isOn) {
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
    } else {
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
    }

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 12. Holographic Comms Audio Suite
  playCommsOpen() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;
    
    // Rising aperture harmonic (480Hz -> 960Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(960, t + 0.18);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);

    // Subtle atmospheric hiss release
    const bufSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.04, t);
    nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + 0.12);
  }

  playCommsMessage() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    // Incoming telemetry double-chirp
    [1046, 1318].forEach((freq, idx) => {
      const start = t + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.08);
    });
  }

  playCommsSend() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    // Outgoing packet blip
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, t);
    osc.frequency.exponentialRampToValueAtTime(1180, t + 0.07);
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playIncidentLocked() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    // Resonant locking chord (F#3, A#3, C#4, F#4)
    const freqs = [185.00, 233.08, 277.18, 369.99];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      const startGain = idx === 0 ? 0.12 : 0.06;
      gain.gain.setValueAtTime(startGain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  // 7. Tactical Rift Anomaly Detected Klaxon
  playRiftSpawn() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    // Deep sub-bass tear
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(32, t + 0.5);
    subGain.gain.setValueAtTime(0.2, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(t);
    sub.stop(t + 0.6);

    // Urgent tactical warning pulse
    [0, 0.14, 0.28].forEach((delay) => {
      const ping = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      ping.type = 'triangle';
      ping.frequency.setValueAtTime(880, t + delay);
      ping.frequency.exponentialRampToValueAtTime(540, t + delay + 0.09);
      pingGain.gain.setValueAtTime(0.12, t + delay);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);
      ping.connect(pingGain);
      pingGain.connect(this.ctx.destination);
      ping.start(t + delay);
      ping.stop(t + delay + 0.1);
    });
  }

  // 8. Reality Anchor Restored / Rift Suture Sealed Harmonic Chime
  /**
   * PROCEDURAL SYNTHESIS: REALITY ANCHOR RESTORED
   * 
   * DEV STRUGGLE NOTE:
   * Spent nearly 8 hours tuning this single harmonic suture chime!
   * 
   * - Attempt 1: Pentatonic arpeggio felt too arcade / video-gamey.
   * - Attempt 2: Diminished 7th chord sounded too ominous and dissonant for a "healing" action.
   * - Solution: Staggered D major 9 arpeggio (D4, F#4, A4, C#5, E5) with exponential decay
   *   finally achieved that pure, transcendent "celestial spatial stitch" resonance.
   * - Audio theory Discord communities were a huge help here.
   */
  playRiftSealed() {
    if (!this.enabled) return;
    this.init();
    const t = this.ctx.currentTime;

    // Ascending harmonic celestial chime (D maj9 arpeggio: D4, F#4, A4, C#5, E5)
    const chord = [293.66, 369.99, 440.00, 554.37, 659.25];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.9);
    });
  }
}

export const sound = new SoundController();