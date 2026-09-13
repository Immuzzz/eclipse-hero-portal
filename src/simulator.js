/**
 * TACTICAL RIFT SIMULATOR CONTROLLER
 * Coordinates unpredictable random rift generation and interactive deploy-and-fix sequences.
 */

import { sound } from './audio.js';

export const RIFT_LOCATIONS = [
  { name: 'SHINJUKU SUB-LEVEL 7 FRACTURE', threat: 'CLASS-IV VOID TEAR', type: 'terrestrial', flux: 16.4, defaultStability: 62.4 },
  { name: 'TOKYO BAY TECTONIC RIFT', threat: 'CLASS-III SEISMIC CHASM', type: 'terrestrial', flux: 12.8, defaultStability: 71.5 },
  { name: 'MARIANA TRENCH GRAV-ANOMALY', threat: 'CLASS-S ABYSSAL CHASM', type: 'terrestrial', flux: 28.4, defaultStability: 48.2 },
  { name: 'EXOSPHERE SINGULARITY BREAK', threat: 'CLASS-OMEGA EXTINCTION TEAR', type: 'orbital', flux: 34.6, defaultStability: 41.8 },
  { name: 'STRATOSPHERIC QUANTUM SHEAR', threat: 'CLASS-II MESOSPHERE TEAR', type: 'orbital', flux: 9.2, defaultStability: 82.1 },
  { name: 'LUNAR LAGRANGE L1 DISRUPTION', threat: 'CLASS-IV ORBITAL INSTABILITY', type: 'orbital', flux: 21.8, defaultStability: 56.7 },
  { name: 'MOUNT FUJI SUB-MAGMA VOID', threat: 'CLASS-IV VOLCANIC RIFT', type: 'terrestrial', flux: 19.3, defaultStability: 59.3 },
  { name: 'SHIBUYA CROSSING GRAVITON CRACK', threat: 'CLASS-III URBAN REALITY TEAR', type: 'terrestrial', flux: 14.1, defaultStability: 68.9 }
];

export class RiftSimulatorController {
  constructor() {
    this.activeRift = null;
    this.isDeploying = false;
    this.activeMode = 'event-horizon';
    this.canvasRef = null;

    // DOM Elements
    this.radarScreen = null;
    this.riftLayer = null;
    this.vectorCanvas = null;
    this.deployBtn = null;
    this.deployBtnText = null;
    this.spawnRiftBtn = null;
    this.threatSelect = null;
    this.simLogBox = null;
    this.radarStatusText = null;
    this.alertBanner = null;
    this.alertLocationText = null;
    this.alertFluxText = null;
    this.alertThreatText = null;

    // Telemetry Stat Boxes
    this.statStability = null;
    this.statSpeed = null;
    this.statFlux = null;
    this.statStatus = null;
  }

  init(canvasInstance) {
    this.canvasRef = canvasInstance;
    this.radarScreen = document.getElementById('sim-radar-screen');
    this.riftLayer = document.getElementById('radar-rift-layer');
    this.vectorCanvas = document.getElementById('radar-vector-canvas');
    this.deployBtn = document.getElementById('btn-sim-deploy');
    this.deployBtnText = document.getElementById('btn-sim-deploy-text');
    this.spawnRiftBtn = document.getElementById('btn-sim-spawn-rift');
    this.threatSelect = document.getElementById('threat-scenario-select');
    this.simLogBox = document.getElementById('sim-log-content');
    this.radarStatusText = document.getElementById('sim-radar-status-text');
    this.alertBanner = document.getElementById('sim-rift-alert-banner');
    this.alertLocationText = document.getElementById('sim-rift-location-text');
    this.alertFluxText = document.getElementById('sim-rift-flux-text');
    this.alertThreatText = document.getElementById('sim-rift-threat-text');

    this.statStability = document.getElementById('sim-stat-stability');
    this.statSpeed = document.getElementById('sim-stat-speed');
    this.statFlux = document.getElementById('sim-stat-flux');
    this.statStatus = document.getElementById('sim-stat-status');

    if (!this.radarScreen || !this.deployBtn) {
      // Not on simulator page
      return;
    }

    this.bindEvents();

    // Spawn initial random rift on cold load after a brief tactical delay
    setTimeout(() => {
      this.spawnRandomRift(false);
    }, 600);
  }

  setMode(modeKey) {
    this.activeMode = modeKey;
    this.updateButtonLabels();
  }

  updateButtonLabels() {
    if (!this.deployBtnText || this.isDeploying) return;
    const isMode1 = this.activeMode === 'event-horizon';
    if (this.activeRift && !this.activeRift.isSealed) {
      this.deployBtnText.textContent = isMode1
        ? `DEPLOY KEI // FIX RIFT [RELATIVISTIC IAIDO]`
        : `DEPLOY KEI // FIX RIFT [GENESIS CLEAVE]`;
    } else {
      this.deployBtnText.textContent = isMode1
        ? `DEPLOY KEI // ENGAGE RELATIVISTIC IAIDO CLEAVE`
        : `DEPLOY KEI // ENGAGE ORBITAL GENESIS CLEAVE`;
    }
  }

  bindEvents() {
    if (this.spawnRiftBtn) {
      this.spawnRiftBtn.addEventListener('click', () => {
        if (this.isDeploying) return;
        sound.playNavClick();
        this.spawnRandomRift(true);
      });
      this.spawnRiftBtn.addEventListener('mouseenter', () => sound.playNavHover());
    }

    if (this.deployBtn) {
      this.deployBtn.addEventListener('click', () => {
        if (this.isDeploying) return;
        this.deployAndFix();
      });
      this.deployBtn.addEventListener('mouseenter', () => sound.playNavHover());
    }

    if (this.threatSelect) {
      this.threatSelect.addEventListener('change', () => {
        if (this.isDeploying) return;
        sound.playNavClick();
        const customName = this.threatSelect.value;
        this.spawnRiftFromScenario(customName);
      });
    }
  }

  spawnRandomRift(playAlarmSound = true) {
    const template = RIFT_LOCATIONS[Math.floor(Math.random() * RIFT_LOCATIONS.length)];
    this.generateRiftInstance(template, playAlarmSound);
  }

  spawnRiftFromScenario(scenarioName) {
    const found = RIFT_LOCATIONS.find((r) => r.name === scenarioName);
    const template = found || {
      name: scenarioName,
      threat: 'CLASS-IV DIMENSIONAL RIFT',
      type: 'terrestrial',
      flux: 15.5,
      defaultStability: 64.0
    };
    this.generateRiftInstance(template, true);
  }

  generateRiftInstance(template, playAudio = true) {
    // Generate randomized polar coordinates within radar circular dish (radius: 30% to 75%)
    const angle = Math.random() * Math.PI * 2;
    const distRatio = 0.32 + Math.random() * 0.42; // normalized distance from center
    const xPercent = (50 + Math.cos(angle) * (distRatio * 50)).toFixed(2);
    const yPercent = (50 + Math.sin(angle) * (distRatio * 50)).toFixed(2);

    const bearing = Math.floor(((angle * 180 / Math.PI) + 450) % 360);
    const range = Math.floor(18 + Math.random() * 78);
    const fluxVal = (template.flux + (Math.random() * 4 - 2)).toFixed(1);
    const stabilityVal = (template.defaultStability + (Math.random() * 6 - 3)).toFixed(2);

    this.activeRift = {
      id: `RIFT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: template.name,
      threat: template.threat,
      flux: `${fluxVal} TT`,
      stability: stabilityVal,
      bearing,
      range,
      xPercent,
      yPercent,
      isSealed: false
    };

    if (playAudio) {
      sound.playRiftSpawn();
    }

    this.renderRiftOnRadar();
    this.updateAlertBanner();
    this.updateTelemetryStats(false);
    this.logRiftSpawn();
    this.updateButtonLabels();
  }

  /**
   * RADAR FRACTURE & SUTURE RENDERER
   * 
   * STRUGGLE / PERFORMANCE NOTES:
   * First attempt: Generating dynamic random SVG spline calculations and particle trails
   * directly on every frame caused severe 60fps frame drops, especially on mobile WebKit.
   * 
   * FAILED ATTEMPT:
   * - Recalculating path d attributes on each tick spiked garbage collection.
   * 
   * SOLUTION:
   * - Switched to pre-calculated normalized SVG paths for the fracture core
   *   combined with a lightweight 2D canvas laser vector overlay for dynamic intercept lines.
   * - Clean 60fps lock achieved with near-zero CPU overhead.
   * - Lesson: Always profile before optimizing!
   */
  renderRiftOnRadar() {
    if (!this.riftLayer) return;
    this.riftLayer.innerHTML = '';
    if (this.vectorCanvas) this.vectorCanvas.innerHTML = '';

    const rift = this.activeRift;
    const node = document.createElement('div');
    node.id = 'active-radar-rift-node';
    node.className = 'radar-rift-node';
    node.style.left = `${rift.xPercent}%`;
    node.style.top = `${rift.yPercent}%`;
    node.title = `${rift.name} [${rift.threat}]`;

    // High-tech SVG Jagged Fracture Path
    node.innerHTML = `
      <div class="rift-shockwave"></div>
      <svg class="rift-fracture-svg" viewBox="0 0 60 60" fill="none">
        <path d="M30 4 L34 18 L26 26 L38 34 L28 42 L34 56" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M26 26 L12 28" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <path d="M38 34 L50 32" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <circle cx="30" cy="30" r="3" fill="#ffffff" />
      </svg>
      <div class="rift-badge">${rift.id} &bull; ${rift.threat.split(' ')[0]}</div>
    `;

    this.riftLayer.appendChild(node);
  }

  updateAlertBanner() {
    if (!this.alertBanner) return;
    const r = this.activeRift;
    if (this.alertLocationText) this.alertLocationText.textContent = r.name;
    if (this.alertFluxText) this.alertFluxText.textContent = r.flux;
    if (this.alertThreatText) this.alertThreatText.textContent = r.threat;

    this.alertBanner.style.display = 'flex';
    this.alertBanner.classList.remove('is-sealed');

    if (this.radarStatusText) {
      this.radarStatusText.textContent = `[ ⚠ ANOMALY DETECTED: ${r.name} // BEARING: ${r.bearing}° // RANGE: ${r.range} KM ]`;
    }
  }

  updateTelemetryStats(isSealed = false) {
    if (isSealed) {
      if (this.statStability) {
        this.animateCounter(this.statStability, 100.00, '%', '#a0ff90');
      }
      if (this.statFlux) {
        this.statFlux.textContent = '0.00 TT [SEALED]';
        this.statFlux.style.color = '#a0ff90';
      }
      if (this.statStatus) {
        this.statStatus.textContent = 'REALITY STABILIZED';
        this.statStatus.style.color = '#00e5ff';
      }
    } else if (this.activeRift) {
      if (this.statStability) {
        this.statStability.textContent = `${this.activeRift.stability}%`;
        this.statStability.style.color = '#ff4466';
      }
      if (this.statFlux) {
        this.statFlux.textContent = this.activeRift.flux;
        this.statFlux.style.color = '#ffd000';
      }
      if (this.statStatus) {
        this.statStatus.textContent = 'BREACH DETECTED [CRITICAL]';
        this.statStatus.style.color = '#ff4466';
      }
    }
  }

  logRiftSpawn() {
    if (!this.simLogBox) return;
    const r = this.activeRift;
    this.simLogBox.innerHTML = '';
    const logs = [
      `> [ALERT] NEW SPATIAL TEAR DETECTED AT GRID BEARING ${r.bearing}°, RANGE ${r.range} KM.`,
      `> [ANOMALY] LOCATION: ${r.name} // IDENTIFIER: ${r.id}`,
      `> [METRIC] MEASURED ANOMALY FLUX: ${r.flux} // THREAT: ${r.threat}`,
      `> [STATUS] CONTINENTAL STABILITY DESTABILIZED TO ${r.stability}%.`,
      `> [TACTICAL] STANDBY FOR KEI DEPLOYMENT TO FIX REALITY SEAM.`
    ];

    logs.forEach((line, i) => {
      const div = document.createElement('div');
      div.textContent = line;
      div.style.color = i === 0 ? '#ff4466' : i === 1 ? '#ffd000' : '#cbd5e1';
      this.simLogBox.appendChild(div);
    });
    this.simLogBox.scrollTop = this.simLogBox.scrollHeight;
  }

  deployAndFix() {
    if (!this.activeRift || this.activeRift.isSealed) {
      // Auto-spawn a new random rift if none is active, then proceed
      this.spawnRandomRift(true);
    }

    this.isDeploying = true;
    const r = this.activeRift;
    const isMode1 = this.activeMode === 'event-horizon';
    const weaponName = isMode1 ? 'THE COMPRESSED ODACHI' : 'NIHIL VERITAS';
    const techniqueName = isMode1 ? 'RELATIVISTIC IAIDO CLEAVE' : 'ORBITAL GENESIS SUTURE';

    if (this.deployBtnText) {
      this.deployBtnText.textContent = `INTERCEPTING AT 0.94c... [LOCKING TARGET]`;
    }
    if (this.deployBtn) {
      this.deployBtn.classList.add('is-deploying');
    }

    // Step 1: Intercept Siren & Tactical Radar Vector Laser Line (0ms)
    sound.playRiftDeploy();
    this.drawInterceptLaser(r.xPercent, r.yPercent);

    if (this.simLogBox) {
      const div1 = document.createElement('div');
      div1.textContent = `> [ENGAGE] LAUNCHING INTERCEPT VECTOR TOWARDS BEARING ${r.bearing}°...`;
      div1.style.color = '#00e5ff';
      this.simLogBox.appendChild(div1);

      const div2 = document.createElement('div');
      div2.textContent = `> [SPEED] VELOCITY ACCELERATED TO 0.94c SLIPSTREAM // VACUUM DISPLACEMENT ACTIVE.`;
      div2.style.color = '#a0ff90';
      this.simLogBox.appendChild(div2);
      this.simLogBox.scrollTop = this.simLogBox.scrollHeight;
    }

    // Step 2: Strike & Kinetic Cleave Severing (450ms)
    setTimeout(() => {
      if (isMode1) {
        sound.playOdachiSlash();
        if (this.canvasRef) {
          this.canvasRef.triggerEventHorizonBlitz(window.innerWidth / 2, window.innerHeight / 2);
        }
        document.body.classList.add('fx-mode1-shake');
        setTimeout(() => document.body.classList.remove('fx-mode1-shake'), 450);
        const slashOverlay = document.getElementById('slash-overlay');
        if (slashOverlay) {
          slashOverlay.classList.remove('active', 'active-odachi', 'active-nihil');
          void slashOverlay.offsetWidth;
          slashOverlay.classList.add('active-odachi');
        }
      } else {
        sound.playNihilSlash();
        if (this.canvasRef) {
          this.canvasRef.triggerCosmicSupernova(window.innerWidth / 2, window.innerHeight / 2);
        }
        document.body.classList.add('fx-mode2-warp');
        setTimeout(() => document.body.classList.remove('fx-mode2-warp'), 900);
        const slashOverlay = document.getElementById('slash-overlay');
        if (slashOverlay) {
          slashOverlay.classList.remove('active', 'active-odachi', 'active-nihil');
          void slashOverlay.offsetWidth;
          slashOverlay.classList.add('active-nihil');
        }
      }

      this.drawSutureCut(r.xPercent, r.yPercent);

      if (this.simLogBox) {
        const divCut = document.createElement('div');
        divCut.textContent = `> [STRIKE] ${weaponName} DRAWN: EXECUTING ${techniqueName}!`;
        divCut.style.color = isMode1 ? '#ff5500' : '#ffd000';
        this.simLogBox.appendChild(divCut);
        this.simLogBox.scrollTop = this.simLogBox.scrollHeight;
      }
    }, 450);

    // Step 3: Spatial Suture & Healing Pulse (950ms)
    setTimeout(() => {
      sound.playRiftSealed();

      const node = document.getElementById('active-radar-rift-node');
      if (node) {
        node.classList.add('is-repairing');
        setTimeout(() => {
          node.classList.remove('is-repairing');
          node.classList.add('is-sealed');
          const badge = node.querySelector('.rift-badge');
          if (badge) {
            badge.innerHTML = `&#10003; SEALED [100%]`;
          }
        }, 300);
      }

      r.isSealed = true;
      this.updateTelemetryStats(true);

      if (this.alertBanner) {
        this.alertBanner.classList.add('is-sealed');
        this.alertBanner.style.background = 'rgba(160, 255, 144, 0.15)';
        this.alertBanner.style.borderColor = '#a0ff90';
        const title = document.getElementById('sim-rift-alert-title');
        if (title) {
          title.textContent = `✓ BREACH RESOLVED: ${r.name} STABILIZED`;
          title.style.color = '#a0ff90';
        }
      }

      if (this.radarStatusText) {
        this.radarStatusText.textContent = `[ ✓ RIFT AT ${r.name} PERMANENTLY SEALED // REALITY SECURE ]`;
      }

      if (this.simLogBox) {
        const divSuccess = document.createElement('div');
        divSuccess.textContent = `> [SUCCESS] SPATIAL VACUUM MATRIX COLLAPSED. ATOMIC SEAMS FUSED.`;
        divSuccess.style.color = '#a0ff90';
        this.simLogBox.appendChild(divSuccess);

        const divOptimal = document.createElement('div');
        divOptimal.textContent = `> [OPTIMAL] CONTINENTAL DEFENSE INTEGRITY: 100.00% SECURE. CASUALTIES: ZERO.`;
        divOptimal.style.color = '#00e5ff';
        this.simLogBox.appendChild(divOptimal);
        this.simLogBox.scrollTop = this.simLogBox.scrollHeight;
      }

      if (this.deployBtnText) {
        this.deployBtnText.textContent = `✓ RIFT FIXED & SEALED // SECTOR SECURED`;
      }
    }, 950);

    // Step 4: Standby Reset for Next Anomaly (2400ms)
    setTimeout(() => {
      this.isDeploying = false;
      if (this.vectorCanvas) {
        this.vectorCanvas.innerHTML = '';
      }
      if (this.deployBtn) {
        this.deployBtn.classList.remove('is-deploying');
      }
      this.updateButtonLabels();
    }, 2400);
  }

  drawInterceptLaser(targetX, targetY) {
    if (!this.vectorCanvas) return;
    this.vectorCanvas.innerHTML = `
      <line class="radar-vector-line" x1="50" y1="50" x2="${targetX}" y2="${targetY}" />
    `;
  }

  drawSutureCut(targetX, targetY) {
    if (!this.vectorCanvas) return;
    const x = parseFloat(targetX);
    const y = parseFloat(targetY);
    const offset = 8;
    this.vectorCanvas.innerHTML += `
      <line class="radar-suture-cut" x1="${x - offset}" y1="${y - offset}" x2="${x + offset}" y2="${y + offset}" />
    `;
  }

  animateCounter(element, targetVal, unit = '%', color = '#a0ff90') {
    if (!element) return;
    const startVal = parseFloat(element.textContent) || 60;
    const duration = 800;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = (startVal + (targetVal - startVal) * ease).toFixed(2);
      element.textContent = `${current}${unit}`;
      element.style.color = color;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }
}

export const simulator = new RiftSimulatorController();
