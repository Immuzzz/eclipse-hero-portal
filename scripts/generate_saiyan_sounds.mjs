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
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
    } else if (this.type === 'lowpass') {
      b0 = (1 - cosw0) / 2;
      b1 = 1 - cosw0;
      b2 = (1 - cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
    } else if (this.type === 'highpass') {
      b0 = (1 + cosw0) / 2;
      b1 = -(1 + cosw0);
      b2 = (1 + cosw0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosw0;
      a2 = 1 - alpha;
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
    this.x2 = this.x1;
    this.x1 = sample;
    this.y2 = this.y1;
    this.y1 = y;
    return isNaN(y) ? 0 : y;
  }
}

function generateMode1SaiyanSound() {
  const duration = 1.35;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const bpLeft = new BiquadFilter('bandpass', 320, 14);
  const bpRight = new BiquadFilter('bandpass', 320, 14);
  const airLpL = new BiquadFilter('lowpass', 3500, 1.2);
  const airLpR = new BiquadFilter('lowpass', 3500, 1.2);

  let subPhase = 0;
  let sawPhase = 0;
  let humPhase = 0;
  const sparks = [0.08, 0.14, 0.22, 0.31, 0.44, 0.58, 0.72];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Sub-bass Ki Detonation Shockwave
    let subFreq = 160 * Math.exp(-t * 9) + 40;
    subPhase += 2 * Math.PI * subFreq / SAMPLE_RATE;
    let subEnv = t < 0.005 ? t / 0.005 : Math.exp(-(t - 0.005) * 6.5);
    let sub = Math.tanh(1.8 * Math.sin(subPhase)) * subEnv * 0.45;

    // Iconic DBZ Saiyan Resonant Ki Whistle Sweep
    let sweepProgress = Math.min(1, t / 0.55);
    let baseWhistleFreq = 320 + 2180 * Math.sin(sweepProgress * (Math.PI / 2));
    if (t > 0.55) {
      baseWhistleFreq = 2500 - (t - 0.55) * 400;
    }
    let flutter = Math.sin(2 * Math.PI * 16 * t) * 140;
    let whistleCutoff = Math.max(150, baseWhistleFreq + flutter);
    let whistleAmpMod = 0.75 + 0.25 * Math.sin(2 * Math.PI * 16 * t);

    let sawFreq = 110 + 60 * sweepProgress;
    sawPhase += 2 * Math.PI * sawFreq / SAMPLE_RATE;
    let saw = (sawPhase % (2 * Math.PI)) / Math.PI - 1.0;
    let noise = Math.random() * 2 - 1;
    let whistleExciter = 0.55 * saw + 0.45 * noise;

    let whistleEnv = t < 0.04 ? t / 0.04 : Math.exp(-(t - 0.04) * 2.8);
    let whistleOutL = bpLeft.process(whistleExciter, whistleCutoff, 14) * whistleEnv * whistleAmpMod * 1.6;
    let whistleOutR = bpRight.process(whistleExciter, whistleCutoff * 1.03, 14) * whistleEnv * whistleAmpMod * 1.6;

    // Rushing Energy Aura Blast
    let airNoiseL = (Math.random() * 2 - 1);
    let airNoiseR = (Math.random() * 2 - 1);
    let airCutoff = Math.max(200, 3800 * Math.exp(-t * 3.5));
    let airEnv = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 4.2);
    let airOutL = airLpL.process(airNoiseL, airCutoff, 0.9) * airEnv * 0.35;
    let airOutR = airLpR.process(airNoiseR, airCutoff, 0.9) * airEnv * 0.35;

    // SSJ2 Electric Arc Sparks
    let sparkOut = 0;
    for (let s of sparks) {
      let dt = t - s;
      if (dt >= 0 && dt < 0.018) {
        let snapFreq = 4200 * Math.exp(-dt * 300) + 800;
        let snap = Math.sin(2 * Math.PI * snapFreq * dt) * (Math.random() * 2 - 1);
        sparkOut += snap * Math.exp(-dt * 200) * 0.35;
      }
    }

    // Pulsing Ki Hum
    humPhase += 2 * Math.PI * 72 / SAMPLE_RATE;
    let humTremolo = 0.5 + 0.5 * Math.sin(2 * Math.PI * 15 * t);
    let humEnv = t < 0.1 ? t / 0.1 : Math.exp(-(t - 0.1) * 2.2);
    let hum = Math.sin(humPhase) * humTremolo * humEnv * 0.22;

    let mixL = sub + whistleOutL * 0.85 + airOutL + sparkOut * 0.8 + hum;
    let mixR = sub + whistleOutR * 0.85 + airOutR + sparkOut * 0.6 + hum;

    left[i] = Math.tanh(mixL * 1.15);
    right[i] = Math.tanh(mixR * 1.15);
  }

  return { left, right };
}

function generateMode2SaiyanSound() {
  const duration = 2.4;
  const numSamples = Math.floor(duration * SAMPLE_RATE);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  const bpL1 = new BiquadFilter('bandpass', 280, 16);
  const bpR1 = new BiquadFilter('bandpass', 280, 16);
  const bpL2 = new BiquadFilter('bandpass', 600, 20);
  const bpR2 = new BiquadFilter('bandpass', 600, 20);
  const airLpL = new BiquadFilter('lowpass', 5000, 1.4);
  const airLpR = new BiquadFilter('lowpass', 5000, 1.4);

  let subPhase = 0;
  let sawPhase = 0;
  let dronePhase = 0;
  const celestialPitches = [1760, 2217.46, 2637, 3520];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Atmospheric Intake / Pre-Ignition Suction (0.0s - 0.22s)
    let intake = 0;
    if (t < 0.22) {
      let progress = t / 0.22;
      let intakeFreq = 40 + 120 * progress;
      let intakeNoise = (Math.random() * 2 - 1) * Math.pow(progress, 2) * 0.3;
      intake = (Math.sin(2 * Math.PI * intakeFreq * t) * progress * 0.35) + intakeNoise;
    }

    // Seismic Detonation Ki Shockwave (t >= 0.22s)
    let sub = 0;
    let burstAirL = 0;
    let burstAirR = 0;
    if (t >= 0.22) {
      let dt = t - 0.22;
      let subFreq = 180 * Math.exp(-dt * 6.5) + 38;
      subPhase += 2 * Math.PI * subFreq / SAMPLE_RATE;
      let subEnv = dt < 0.008 ? dt / 0.008 : Math.exp(-(dt - 0.008) * 3.8);
      sub = Math.tanh(2.2 * Math.sin(subPhase)) * subEnv * 0.55;

      let airNoiseL = (Math.random() * 2 - 1);
      let airNoiseR = (Math.random() * 2 - 1);
      let airCutoff = Math.max(300, 6500 * Math.exp(-dt * 2.8));
      let airEnv = dt < 0.02 ? dt / 0.02 : Math.exp(-(dt - 0.02) * 3.2);
      burstAirL = airLpL.process(airNoiseL, airCutoff, 1.2) * airEnv * 0.45;
      burstAirR = airLpR.process(airNoiseR, airCutoff, 1.2) * airEnv * 0.45;
    }

    // Soaring Dual-Resonant Saiyan Ki Scream
    let whistleOutL = 0;
    let whistleOutR = 0;
    if (t >= 0.18) {
      let dt = t - 0.18;
      let sweepTime = 0.95;
      let progress = Math.min(1, dt / sweepTime);
      let curve = 1 - Math.cos(progress * Math.PI / 2);

      let baseFreq1 = 280 + 3600 * curve;
      let baseFreq2 = 480 + 3800 * curve;

      let flutter1 = Math.sin(2 * Math.PI * 13.5 * t) * 220;
      let flutter2 = Math.cos(2 * Math.PI * 13.5 * t) * 280;

      let cut1 = Math.max(160, baseFreq1 + flutter1);
      let cut2 = Math.max(250, baseFreq2 + flutter2);
      let tremolo = 0.7 + 0.3 * Math.sin(2 * Math.PI * 13.5 * t);

      sawPhase += 2 * Math.PI * (130 + 120 * curve) / SAMPLE_RATE;
      let saw = (sawPhase % (2 * Math.PI)) / Math.PI - 1.0;
      let noise = Math.random() * 2 - 1;
      let exciter = 0.5 * saw + 0.5 * noise;

      let whistleEnv = dt < 0.06 ? dt / 0.06 : Math.exp(-(dt - 0.06) * 1.55);

      let w1L = bpL1.process(exciter, cut1, 16);
      let w1R = bpR1.process(exciter, cut1 * 1.04, 16);
      let w2L = bpL2.process(exciter, cut2, 18);
      let w2R = bpR2.process(exciter, cut2 * 0.97, 18);

      whistleOutL = (w1L * 0.9 + w2L * 0.7) * whistleEnv * tremolo * 1.7;
      whistleOutR = (w1R * 0.9 + w2R * 0.7) * whistleEnv * tremolo * 1.7;
    }

    // Celestial Hard-Light Shimmer
    let shimmerL = 0;
    let shimmerR = 0;
    if (t >= 0.35) {
      let dt = t - 0.35;
      let shimmerEnv = dt < 0.15 ? dt / 0.15 : Math.exp(-(dt - 0.15) * 1.2);
      for (let idx = 0; idx < celestialPitches.length; idx++) {
        let p = celestialPitches[idx];
        let phase = 2 * Math.PI * p * t + (idx * 0.5);
        let vibrato = Math.sin(2 * Math.PI * 8.5 * t + idx);
        let s = Math.sin(phase + vibrato * 0.2);
        if (idx % 2 === 0) shimmerL += s * 0.07;
        else shimmerR += s * 0.07;
      }
      shimmerL *= shimmerEnv;
      shimmerR *= shimmerEnv;
    }

    // Earth-Shaking Ki Drone (48Hz)
    let drone = 0;
    if (t >= 0.22) {
      let dt = t - 0.22;
      dronePhase += 2 * Math.PI * 48 / SAMPLE_RATE;
      let droneTremolo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 12 * t);
      let droneEnv = dt < 0.1 ? dt / 0.1 : Math.exp(-(dt - 0.1) * 1.3);
      drone = Math.sin(dronePhase) * droneTremolo * droneEnv * 0.28;
    }

    let mixL = intake + sub + whistleOutL * 0.9 + burstAirL + shimmerL + drone;
    let mixR = intake + sub + whistleOutR * 0.9 + burstAirR + shimmerR + drone;

    left[i] = Math.tanh(mixL * 1.1);
    right[i] = Math.tanh(mixR * 1.1);
  }

  return { left, right };
}

const audioDir = path.resolve(__dirname, '../assets/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const s1 = generateMode1SaiyanSound();
writeWavFile(path.join(audioDir, 'saiyan-mode1-burst.wav'), s1.left, s1.right);

const s2 = generateMode2SaiyanSound();
writeWavFile(path.join(audioDir, 'saiyan-mode2-transcendent.wav'), s2.left, s2.right);

console.log('Finished generating Dragon Ball Super Saiyan transformation audio assets.');