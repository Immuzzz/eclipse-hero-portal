import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;

function writeWavFile(filepath, leftChannel, rightChannel) {
  const numSamples = leftChannel.length;
  const numChannels = rightChannel ? 2 : 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    let sL = Math.max(-1, Math.min(1, leftChannel[i]));
    let valL = sL < 0 ? sL * 0x8000 : sL * 0x7FFF;
    buffer.writeInt16LE(Math.round(valL), offset);
    offset += 2;

    if (numChannels === 2) {
      let sR = Math.max(-1, Math.min(1, rightChannel[i]));
      let valR = sR < 0 ? sR * 0x8000 : sR * 0x7FFF;
      buffer.writeInt16LE(Math.round(valR), offset);
      offset += 2;
    }
  }

  fs.writeFileSync(filepath, buffer);
  console.log(`Generated WAV: ${filepath} (${(numSamples / SAMPLE_RATE).toFixed(2)}s)`);
}

class BiquadFilter {
  constructor(type, freq, q, sampleRate = SAMPLE_RATE) {
    this.type = type;
    this.sampleRate = sampleRate;
    this.x1 = 0; this.x2 = 0;
    this.y1 = 0; this.y2 = 0;
    this.setCoefficients(freq, q);
  }

  setCoefficients(freq, q) {
    const f0 = Math.max(10, Math.min(this.sampleRate * 0.49, freq));
    const Q = Math.max(0.1, q);
    const w0 = 2 * Math.PI * f0 / this.sampleRate;
    const cosw0 = Math.cos(w0);
    const sinw0 = Math.sin(w0);
    const alpha = sinw0 / (2 * Q);

    let b0, b1, b2, a0, a1, a2;
    if (this.type === 'bandpass') {
      b0 = alpha; b1 = 0; b2 = -alpha;
      a0 = 1 + alpha; a1 = -2 * cosw0; a2 = 1 - alpha;
    } else if (this.type === 'lowpass') {
      b0 = (1 - cosw0) / 2; b1 = 1 - cosw0; b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha; a1 = -2 * cosw0; a2 = 1 - alpha;
    } else if (this.type === 'highpass') {
      b0 = (1 + cosw0) / 2; b1 = -(1 + cosw0); b2 = (1 + cosw0) / 2;
      a0 = 1 + alpha; a1 = -2 * cosw0; a2 = 1 - alpha;
    }

    this.b0 = b0 / a0;
    this.b1 = b1 / a0;
    this.b2 = b2 / a0;
    this.a1 = a1 / a0;
    this.a2 = a2 / a0;
  }

  process(sample, freq, q) {
    if (freq !== undefined) {
      this.setCoefficients(freq, q !== undefined ? q : 10);
    }
    const y = this.b0 * sample + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = sample;
    this.y2 = this.y1; this.y1 = y;
    return isNaN(y) ? 0 : y;
  }
}

// -------------------------------------------------------------
// SLASH 1: THE COMPRESSED ODACHI (Dark Crescent Molecular Katana Cleave)
// -------------------------------------------------------------
// Cinematic Japanese Iaido / Cybernetic Singularity Blade Strike:
// 1. Supersonic whip crack / scabbard draw transient (<15ms)
// 2. High-tensile Tamahagane steel overtone chorus (2740, 3950, 5620, 7890 Hz)
// 3. Stereo swept razor-thin aero-shearing whoosh (8800Hz -> 1400Hz)
// 4. Kinetic molecular vacuum implosion sub-thud (145Hz -> 38Hz)
// 5. Clean spatial stereo panning across the visual cut line
// -------------------------------------------------------------
function generateOdachiSlash() {
  const duration = 0.88;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const bpL = new BiquadFilter('bandpass', 4500, 16);
  const bpR = new BiquadFilter('bandpass', 4500, 16);
  const hpTransient = new BiquadFilter('highpass', 2800, 1.2);
  const wakeLp = new BiquadFilter('lowpass', 3200, 0.9);

  let subPhase = 0;
  let ringPhase1 = 0;
  let ringPhase2 = 0;
  let ringPhase3 = 0;
  let ringPhase4 = 0;
  let fmCarrierPhase = 0;
  let fmModPhase = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // --- LAYER 1: Supersonic Whip Snap / Blade Draw Transient (0 to 22ms) ---
    // Fast FM chirp: carrier 3800Hz modulated by 8200Hz, decaying violently in 15ms
    let fmMod = Math.sin(fmModPhase);
    fmModPhase += 2 * Math.PI * 8200 / SAMPLE_RATE;
    let fmModIndex = Math.max(0, 4.5 * Math.exp(-t * 180));
    let fmCarrierFreq = 3800 * Math.exp(-t * 90) + 1200;
    fmCarrierPhase += 2 * Math.PI * (fmCarrierFreq + fmMod * fmModIndex * 1500) / SAMPLE_RATE;
    let snapTone = Math.sin(fmCarrierPhase) * Math.exp(-t * 140) * 0.85;

    // Crisp high-frequency noise burst (<10ms)
    let burstNoise = (Math.random() * 2 - 1);
    let burstEnv = t < 0.001 ? t / 0.001 : Math.exp(-(t - 0.001) * 320);
    let crackNoise = hpTransient.process(burstNoise, 4200, 1.8) * burstEnv * 1.4;
    let initialCrack = snapTone + crackNoise;

    // --- LAYER 2: Molecular Aero-Shear Whoosh (Wide Stereo Sweep) ---
    // Downward sweeping razor bandpass: starts at 8800Hz, sweeps to 1600Hz
    let shearProgress = Math.min(1, t / 0.14);
    let sweepFreq = 8800 * Math.exp(-shearProgress * 1.8) + 1200;
    let shearNoise = Math.random() * 2 - 1;
    let shearEnv = t < 0.006 ? t / 0.006 : Math.exp(-(t - 0.006) * 14.5);
    
    // Dynamic stereo pan: blade begins swift left (-0.7) and slices hard right (+0.7)
    let pan = Math.sin(Math.min(1, t / 0.18) * Math.PI * 0.5) * 1.4 - 0.7; // -0.7 to +0.7
    let panL = Math.cos((pan + 1) * Math.PI * 0.25);
    let panR = Math.sin((pan + 1) * Math.PI * 0.25);

    let cutFilteredL = bpL.process(shearNoise, sweepFreq, 14) * shearEnv * 2.2 * panL;
    let cutFilteredR = bpR.process(shearNoise, sweepFreq * 1.05, 14) * shearEnv * 2.2 * panR;

    // --- LAYER 3: Multi-modal Tamahagane Steel Blade Singing Resonance ---
    // Authentic Japanese Katana harmonic eigenmodes
    ringPhase1 += 2 * Math.PI * 2740 / SAMPLE_RATE;
    ringPhase2 += 2 * Math.PI * 3950 / SAMPLE_RATE;
    ringPhase3 += 2 * Math.PI * 5620 / SAMPLE_RATE;
    ringPhase4 += 2 * Math.PI * 7890 / SAMPLE_RATE;

    let ringEnv1 = t >= 0.004 ? Math.exp(-(t - 0.004) * 8.0) : 0;
    let ringEnv2 = t >= 0.004 ? Math.exp(-(t - 0.004) * 11.0) : 0;
    let ringEnv3 = t >= 0.004 ? Math.exp(-(t - 0.004) * 16.0) : 0;
    let ringEnv4 = t >= 0.004 ? Math.exp(-(t - 0.004) * 24.0) : 0;

    let steelL = (Math.sin(ringPhase1) * ringEnv1 * 0.22) +
                 (Math.sin(ringPhase2) * ringEnv2 * 0.15) +
                 (Math.sin(ringPhase3) * ringEnv3 * 0.09) +
                 (Math.sin(ringPhase4) * ringEnv4 * 0.05);

    // Detuned right channel for ultra-wide shimmering chorus
    let steelR = (Math.sin(ringPhase1 * 1.002) * ringEnv1 * 0.22) +
                 (Math.sin(ringPhase2 * 0.998) * ringEnv2 * 0.15) +
                 (Math.sin(ringPhase3 * 1.003) * ringEnv3 * 0.09) +
                 (Math.sin(ringPhase4 * 0.997) * ringEnv4 * 0.05);

    // --- LAYER 4: Kinetic Vacuum Displacement Thump (Chest Punch) ---
    let sub = 0;
    if (t >= 0.008) {
      let dt = t - 0.008;
      let subFreq = 145 * Math.exp(-dt * 22) + 38;
      subPhase += 2 * Math.PI * subFreq / SAMPLE_RATE;
      let subEnv = dt < 0.003 ? dt / 0.003 : Math.exp(-(dt - 0.003) * 9.2);
      // Saturated punchy kick
      sub = Math.tanh(2.6 * Math.sin(subPhase)) * subEnv * 0.72;
    }

    // --- LAYER 5: Aero-Cavitation Vacuum Wake Hiss ---
    let wakeNoise = Math.random() * 2 - 1;
    let wakeEnv = t > 0.02 ? Math.exp(-(t - 0.02) * 6.5) : 0;
    let wake = wakeLp.process(wakeNoise, 2600, 0.7) * wakeEnv * 0.28;

    // Summing layers
    let mixL = (initialCrack * 0.8) + cutFilteredL + steelL + sub + wake;
    let mixR = (initialCrack * 0.6) + cutFilteredR + steelR + sub + wake;

    // High-fidelity analog tape saturation / limiter
    left[i] = Math.tanh(mixL * 1.25);
    right[i] = Math.tanh(mixR * 1.25);
  }

  return { left, right };
}

// -------------------------------------------------------------
// SLASH 2: NIHIL VERITAS (Genesis Cleave / Cosmic World Stitch)
// -------------------------------------------------------------
// Colossal, reality-rending dimensional broadsword cleave:
// 1. Reality fracture & crystal glass shatter transient (<45ms)
// 2. Gravitational singularity tectonic sub-boom (120Hz -> 26Hz + sub-tremor)
// 3. Stacked celestial constellation choir / starlight chord (Eb minor 9th shimmer)
// 4. Abyssal dimensional flanger & time-dilation vortex whoosh
// 5. Vast cosmic spatial reverberation decay (~2.3s)
// -------------------------------------------------------------
function generateNihilSlash() {
  const duration = 2.45;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const tearBpL = new BiquadFilter('bandpass', 1200, 14);
  const tearBpR = new BiquadFilter('bandpass', 1200, 14);
  const crystalHp = new BiquadFilter('highpass', 3800, 2.0);
  const spaceLpL = new BiquadFilter('lowpass', 6000, 1.2);
  const spaceLpR = new BiquadFilter('lowpass', 6000, 1.2);

  let subPhase1 = 0;
  let subPhase2 = 0;
  let sawPhase = 0;

  // Starlight constellation chord intervals (Genesis Harmony - Eb minor 9 add 11)
  // Voiced across 3 octaves for massive transcendent weight
  const cosmicPitches = [
    { freq: 155.56, pan: -0.2, gain: 0.16 }, // Eb3 (sub foundation)
    { freq: 311.13, pan: 0.3,  gain: 0.15 }, // Eb4 (core body)
    { freq: 466.16, pan: -0.4, gain: 0.14 }, // Bb4 (celestial fifth)
    { freq: 622.25, pan: 0.2,  gain: 0.13 }, // Eb5 (octave)
    { freq: 698.46, pan: -0.3, gain: 0.11 }, // F5 (transcendent 9th)
    { freq: 932.33, pan: 0.4,  gain: 0.10 }, // Bb5 (singing overtone)
    { freq: 1244.5, pan: -0.2, gain: 0.08 }, // Eb6 (starlight shimmer)
    { freq: 1661.2, pan: 0.3,  gain: 0.06 }, // Ab6 (cosmic shimmer)
    { freq: 2489.0, pan: -0.1, gain: 0.04 }  // Eb7 (diamond brilliance)
  ];

  // Micro glass fracture pings
  const fracturePings = [
    { time: 0.000, freq: 4800, q: 22 },
    { time: 0.008, freq: 6400, q: 26 },
    { time: 0.016, freq: 3200, q: 18 },
    { time: 0.028, freq: 8800, q: 28 },
    { time: 0.042, freq: 5200, q: 20 }
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // --- LAYER 1: Dimensional Glass Fracture & Singularity Pop (0 to 60ms) ---
    let fractureL = 0;
    let fractureR = 0;
    for (let f of fracturePings) {
      if (t >= f.time) {
        let dt = t - f.time;
        let env = Math.exp(-dt * 65);
        let ping = Math.sin(2 * Math.PI * f.freq * dt) * env * 0.18;
        if (f.freq % 2 === 0) fractureL += ping;
        else fractureR += ping;
      }
    }

    // Laser-like reality rupture transient (9200Hz -> 750Hz in 55ms)
    let laserFreq = 9200 * Math.exp(-t * 48) + 750;
    let laserEnv = t < 0.004 ? t / 0.004 : Math.exp(-(t - 0.004) * 36);
    let laserTone = Math.sin(2 * Math.PI * laserFreq * t) * laserEnv * 0.35;
    let crystalNoise = crystalHp.process(Math.random() * 2 - 1, 5500, 2.0) * laserEnv * 0.55;

    let totalFractureL = fractureL + (laserTone * 0.7) + (crystalNoise * 0.6);
    let totalFractureR = fractureR + (laserTone * 0.5) + (crystalNoise * 0.8);

    // --- LAYER 2: Tectonic Sub-Bass Gravitational Collapse (0 to 1.6s) ---
    // Deep 115Hz -> 26Hz gravitational plunge
    let subFreq1 = 115 * Math.exp(-t * 3.8) + 26;
    subPhase1 += 2 * Math.PI * subFreq1 / SAMPLE_RATE;
    // Slow 6.2Hz space-time tremor / ripple
    let tremor = 1.0 + 0.28 * Math.sin(2 * Math.PI * 6.2 * t);
    let subEnv = t < 0.012 ? t / 0.012 : Math.exp(-(t - 0.012) * 1.9);
    let subBoom = Math.tanh(2.8 * Math.sin(subPhase1)) * subEnv * tremor * 0.75;

    // Sub-harmonic warm 32Hz rumble
    subPhase2 += 2 * Math.PI * 32 / SAMPLE_RATE;
    let subHarmonic = Math.sin(subPhase2) * subEnv * 0.35;

    let subTotal = subBoom + subHarmonic;

    // --- LAYER 3: Abyssal Dimensional Tear & Vortex Flanger (30ms to 900ms) ---
    let tearProgress = Math.min(1, t / 0.55);
    let tearFreq = 380 + 4800 * (1 - Math.cos(tearProgress * Math.PI));
    let sawFreq = 82 + 95 * tearProgress;
    sawPhase += 2 * Math.PI * sawFreq / SAMPLE_RATE;
    let rawSaw = (sawPhase % (2 * Math.PI)) / Math.PI - 1.0;
    let rawNoise = Math.random() * 2 - 1;
    let exciter = 0.45 * rawSaw + 0.55 * rawNoise;

    let tearEnv = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 2.4);
    // Binaural spatial flutter
    let flutter = Math.sin(2 * Math.PI * 8.5 * t) * 180;
    let tearL = tearBpL.process(exciter, Math.max(150, tearFreq + flutter), 14) * tearEnv * 1.8;
    let tearR = tearBpR.process(exciter, Math.max(150, tearFreq * 1.06 - flutter), 14) * tearEnv * 1.8;

    // --- LAYER 4: Singing Celestial Chord Choir / Constellation Resonance ---
    let chordL = 0;
    let chordR = 0;
    if (t >= 0.04) {
      let dt = t - 0.04;
      let chordEnv = dt < 0.07 ? dt / 0.07 : Math.exp(-(dt - 0.07) * 1.25);
      for (let note of cosmicPitches) {
        let vib = Math.sin(2 * Math.PI * 5.4 * t + note.freq);
        let s = Math.sin(2 * Math.PI * note.freq * t + vib * 0.4);
        let pL = Math.cos((note.pan + 1) * Math.PI * 0.25);
        let pR = Math.sin((note.pan + 1) * Math.PI * 0.25);
        chordL += s * note.gain * pL;
        chordR += s * note.gain * pR;
      }
      chordL *= chordEnv;
      chordR *= chordEnv;
    }

    // --- LAYER 5: Vast Cosmic Shimmer Reverb Tail ---
    let spaceNoiseL = Math.random() * 2 - 1;
    let spaceNoiseR = Math.random() * 2 - 1;
    let spaceCutoff = Math.max(220, 5200 * Math.exp(-t * 1.6));
    let spaceEnv = t < 0.06 ? t / 0.06 : Math.exp(-(t - 0.06) * 1.4);
    let spaceL = spaceLpL.process(spaceNoiseL, spaceCutoff, 1.2) * spaceEnv * 0.45;
    let spaceR = spaceLpR.process(spaceNoiseR, spaceCutoff, 1.2) * spaceEnv * 0.45;

    // Total master mix
    let mixL = totalFractureL + subTotal + tearL + chordL + spaceL;
    let mixR = totalFractureR + subTotal + tearR + chordR + spaceR;

    // Saturation and soft limiter
    left[i] = Math.tanh(mixL * 1.15);
    right[i] = Math.tanh(mixR * 1.15);
  }

  return { left, right };
}

const audioDir = path.resolve(__dirname, '../assets/audio');
const publicAudioDir = path.resolve(__dirname, '../public/assets/audio');

// Generate Odachi Slash
const oSlash = generateOdachiSlash();
writeWavFile(path.join(audioDir, 'slash-odachi.wav'), oSlash.left, oSlash.right);
if (fs.existsSync(publicAudioDir)) {
  writeWavFile(path.join(publicAudioDir, 'slash-odachi.wav'), oSlash.left, oSlash.right);
}

// Generate Nihil Slash
const nSlash = generateNihilSlash();
writeWavFile(path.join(audioDir, 'slash-nihil.wav'), nSlash.left, nSlash.right);
if (fs.existsSync(publicAudioDir)) {
  writeWavFile(path.join(publicAudioDir, 'slash-nihil.wav'), nSlash.left, nSlash.right);
}

console.log('Finished generating distinct weapon slash sound effects.');