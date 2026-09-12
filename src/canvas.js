// Interactive High-Performance Canvas Animation Engine
// Features Completely Distinct Mode Transformation FX:
// 1. Event Horizon: Relativistic Speed Warp Streaks & Spatial Lightning Discharges
// 2. Transcendent: Celestial Supernova Shockwave & 360-degree Starlight Constellation Burst
export class ParticleCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.mode = "event-horizon";
    this.particles = [];
    this.burstEffects = [];
    this.lightningBolts = [];
    this.shockwaves = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse = { x: this.width / 2, y: this.height / 2, active: false };

    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });

    this.initParticles();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setMode(mode) {
    this.mode = mode;
    this.initParticles();
  }

  // -------------------------------------------------------------
  // TRANSFORMATION 1: EVENT HORIZON MODE — RELATIVISTIC WARP & LIGHTNING
  // -------------------------------------------------------------
  triggerEventHorizonBlitz(originX, originY) {
    const ox = originX || this.width * 0.6;
    const oy = originY || this.height * 0.45;

    // 1. Spatially compressed warp speed lines (65 streaks tearing across screen)
    for (let i = 0; i < 65; i++) {
      const angle = (Math.PI * 0.72) + (Math.random() - 0.5) * 0.35;
      const speed = Math.random() * 32 + 18;
      this.burstEffects.push({
        type: 'warp-line',
        x: ox + (Math.random() - 0.5) * 400,
        y: oy + (Math.random() - 0.5) * 400,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 180 + 80,
        width: Math.random() * 3 + 1,
        color: Math.random() > 0.45 ? 'rgba(255, 85, 0, ' : 'rgba(180, 50, 255, ',
        alpha: 1.0,
        decay: Math.random() * 0.035 + 0.02
      });
    }

    // 2. High-Voltage Spatial Lightning Arcs (4 violent branching bolts)
    for (let b = 0; b < 4; b++) {
      const startX = ox + (Math.random() - 0.5) * 150;
      const startY = oy + (Math.random() - 0.5) * 150;
      const endX = startX + (Math.random() - 0.5) * 700;
      const endY = startY + (Math.random() - 0.5) * 600;

      const points = [{ x: startX, y: startY }];
      const segments = 9;
      let currX = startX;
      let currY = startY;

      for (let s = 1; s <= segments; s++) {
        const t = s / segments;
        const targetX = startX + (endX - startX) * t;
        const targetY = startY + (endY - startY) * t;
        const jitterX = (Math.random() - 0.5) * 90;
        const jitterY = (Math.random() - 0.5) * 90;
        currX = targetX + jitterX;
        currY = targetY + jitterY;
        points.push({ x: currX, y: currY });
      }

      this.lightningBolts.push({
        points,
        color: b % 2 === 0 ? 'rgba(210, 100, 255, ' : 'rgba(255, 140, 40, ',
        width: Math.random() * 2.5 + 1.5,
        alpha: 1.0,
        decay: 0.05
      });
    }

    // 3. Angular Knife-Edge Spatial Slash Fracture
    this.burstEffects.push({
      type: 'spatial-cut',
      startX: -100,
      startY: oy - 250,
      endX: this.width + 100,
      endY: oy + 250,
      width: 6,
      alpha: 1.0,
      decay: 0.04
    });
  }

  // -------------------------------------------------------------
  // TRANSFORMATION 2: TRANSCENDENT MODE — CELESTIAL SUPERNOVA & CONSTELLATION ERUPTION
  // -------------------------------------------------------------
  triggerCosmicSupernova(originX, originY) {
    const ox = originX || this.width * 0.6;
    const oy = originY || this.height * 0.45;

    // 1. Concentric Celestial Starlight Shockwave Rings (3 tiers expanding radially)
    const ringColors = [
      'rgba(255, 208, 0, ',
      'rgba(0, 229, 255, ',
      'rgba(255, 255, 255, '
    ];
    for (let r = 0; r < 3; r++) {
      this.shockwaves.push({
        x: ox,
        y: oy,
        radius: 12 + r * 16,
        maxRadius: Math.max(this.width, this.height) * 1.1,
        speed: 18 + r * 7,
        lineWidth: 5 - r,
        color: ringColors[r],
        alpha: 0.95,
        decay: 0.95
      });
    }

    // 2. 360-degree Omnidirectional Starlight Burst (120 stellar motes)
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 20 + 4;
      this.burstEffects.push({
        type: 'starlight-mote',
        x: ox,
        y: oy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1,
        color: Math.random() > 0.5 ? 'rgba(255, 215, 0, ' : 'rgba(160, 240, 255, ',
        alpha: 1.0,
        friction: 0.94, // Slows down to float as ethereal cosmic dust
        decay: Math.random() * 0.015 + 0.008,
        pulseSpeed: Math.random() * 0.08 + 0.04,
        pulse: Math.random() * Math.PI
      });
    }

    // 3. Ethereal Hard-Light Crosshairs
    for (let a = 0; a < 4; a++) {
      const beamAngle = (Math.PI / 2) * a + (Math.PI / 4);
      this.burstEffects.push({
        type: 'hardlight-beam',
        x: ox,
        y: oy,
        angle: beamAngle,
        length: 0,
        maxLength: Math.max(this.width, this.height) * 0.9,
        speed: 45,
        alpha: 0.85,
        decay: 0.03
      });
    }
  }

  initParticles() {
    this.particles = [];
    const count = this.mode === "event-horizon" ? 75 : 120;

    for (let i = 0; i < count; i++) {
      if (this.mode === "event-horizon") {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          length: Math.random() * 80 + 30,
          speed: Math.random() * 8 + 4,
          width: Math.random() * 2 + 0.5,
          color: Math.random() > 0.4 ? "rgba(180, 50, 255, " : "rgba(255, 85, 0, ",
          alpha: Math.random() * 0.6 + 0.2
        });
      } else {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 2.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          color: Math.random() > 0.5 ? "rgba(255, 215, 0, " : "rgba(160, 240, 255, ",
          alpha: Math.random() * 0.8 + 0.2,
          pulseSpeed: Math.random() * 0.03 + 0.01,
          pulse: Math.random() * Math.PI
        });
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Ambient fade trail
    this.ctx.fillStyle = this.mode === "event-horizon" 
      ? "rgba(6, 6, 10, 0.28)" 
      : "rgba(4, 4, 12, 0.24)";
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render & update shockwave rings (Mode 2)
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = sw.color + sw.alpha + ")";
      this.ctx.lineWidth = sw.lineWidth;
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = sw.color + "0.8)";
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      sw.radius += sw.speed;
      sw.alpha *= sw.decay;

      if (sw.alpha < 0.01 || sw.radius > sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Render & update lightning bolts (Mode 1)
    for (let i = this.lightningBolts.length - 1; i >= 0; i--) {
      const lb = this.lightningBolts[i];
      this.ctx.beginPath();
      this.ctx.moveTo(lb.points[0].x, lb.points[0].y);
      for (let p = 1; p < lb.points.length; p++) {
        this.ctx.lineTo(lb.points[p].x, lb.points[p].y);
      }
      this.ctx.strokeStyle = lb.color + lb.alpha + ")";
      this.ctx.lineWidth = lb.width;
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = lb.color + "1)";
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;

      lb.alpha -= lb.decay;
      if (lb.alpha <= 0) {
        this.lightningBolts.splice(i, 1);
      }
    }

    // Render & update burst effects (Warp lines, starlight motes, spatial cuts)
    for (let i = this.burstEffects.length - 1; i >= 0; i--) {
      const b = this.burstEffects[i];

      if (b.type === 'warp-line') {
        this.ctx.beginPath();
        this.ctx.moveTo(b.x, b.y);
        this.ctx.lineTo(b.x - b.vx * 3.5, b.y - b.vy * 3.5);
        this.ctx.strokeStyle = b.color + b.alpha + ")";
        this.ctx.lineWidth = b.width;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = b.color + "0.7)";
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        b.x += b.vx;
        b.y += b.vy;
        b.alpha -= b.decay;
      } else if (b.type === 'starlight-mote') {
        b.pulse += b.pulseSpeed;
        const currentAlpha = b.alpha * (0.7 + 0.3 * Math.sin(b.pulse));

        this.ctx.beginPath();
        this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = b.color + currentAlpha + ")";
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = b.color + "0.9)";
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        b.x += b.vx;
        b.y += b.vy;
        b.vx *= b.friction;
        b.vy *= b.friction;
        b.alpha -= b.decay;
      } else if (b.type === 'spatial-cut') {
        this.ctx.beginPath();
        this.ctx.moveTo(b.startX, b.startY);
        this.ctx.lineTo(b.endX, b.endY);
        this.ctx.strokeStyle = "rgba(255, 255, 255, " + b.alpha + ")";
        this.ctx.lineWidth = b.width;
        this.ctx.shadowBlur = 24;
        this.ctx.shadowColor = "rgba(255, 85, 0, 1)";
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        b.alpha -= b.decay;
        b.width = Math.max(1, b.width * 0.92);
      } else if (b.type === 'hardlight-beam') {
        b.length = Math.min(b.maxLength, b.length + b.speed);
        const bx = b.x + Math.cos(b.angle) * b.length;
        const by = b.y + Math.sin(b.angle) * b.length;

        this.ctx.beginPath();
        this.ctx.moveTo(b.x, b.y);
        this.ctx.lineTo(bx, by);
        this.ctx.strokeStyle = "rgba(255, 215, 0, " + b.alpha + ")";
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = "rgba(0, 229, 255, 0.8)";
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        b.alpha -= b.decay;
      }

      if (b.alpha <= 0) {
        this.burstEffects.splice(i, 1);
      }
    }

    // Render regular ambient particles
    if (this.mode === "event-horizon") {
      this.particles.forEach((p) => {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - p.length * 0.6, p.y + p.length);
        this.ctx.strokeStyle = p.color + p.alpha + ")";
        this.ctx.lineWidth = p.width;
        this.ctx.stroke();

        p.x -= p.speed * 0.6;
        p.y += p.speed;

        if (p.x < 0 || p.y > this.height) {
          p.x = Math.random() * this.width + this.width * 0.2;
          p.y = -p.length;
        }
      });
    } else {
      this.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color + currentAlpha + ")";
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color + "0.8)";
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      });
    }
  }
}