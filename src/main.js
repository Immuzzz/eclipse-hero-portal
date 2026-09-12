import { sound } from './audio.js';
import { ParticleCanvas } from './canvas.js';
import { chat } from './chat.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Canvas Particle System
  const canvas = new ParticleCanvas('bg-canvas');

  // 2. Audio Toggle Setup
  const sfxBtn = document.getElementById('btn-sfx-toggle');
  const sfxLabel = document.getElementById('sfx-label');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      const isEnabled = sound.toggle();
      sfxLabel.textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
    });
  }

  // 3. Distinct Navigation Sound Bindings
  document.querySelectorAll('nav.main-nav a, a.logo-tag').forEach((el) => {
    el.addEventListener('mouseenter', () => sound.playNavHover());
    el.addEventListener('click', () => sound.playNavClick());
  });

  // Action CTA buttons
  document.querySelectorAll('a.btn-cyber-primary, a.btn-cyber-ghost').forEach((el) => {
    el.addEventListener('mouseenter', () => sound.playNavHover());
    el.addEventListener('click', () => sound.playNavClick());
  });

  // 4. Dual-Mode Master Switcher Data (STRICTLY THE 2 MODES - 100% FAITHFUL DESIGN)
  let currentMode = 'event-horizon';
  let currentView = 'action';
  let isImageFitContain = true;

  const modeData = {
    'event-horizon': {
      title: 'EVENT HORIZON',
      titleBadge: 'RELATIVISTIC DUELIST',
      telemetry: 'SYSTEM: COMPRESSED // ACCELERATION: 0.94c // THREAT: VANGUARD',
      desc: 'Condensing all internal gravimetric pressure into zero air resistance, Eclipse achieves instantaneous spatial folding. Slices through dreadnought armor and energy barriers with micro-molecular precision.',
      views: {
        action: {
          src: './assets/mode-event-horizon-action.jpg',
          label: 'ACTION IAIDO',
          tag: 'TACTICAL DUEL FORM',
          subtag: 'MID-COMBAT IAIDO CUT // COMPRESSED 99.8%'
        },
        aerial: {
          src: './assets/mode-event-horizon-aerial.jpg',
          label: 'AERIAL DESCENT',
          tag: 'SKYFALL STRIKE',
          subtag: 'VERTICAL ANOMALY SHEAR // VIOLET ARC'
        },
        focus: {
          src: './assets/mode-event-horizon-focus.jpg',
          label: 'DUELIST FOCUS',
          tag: 'SPATIAL VORTEX DRAW',
          subtag: 'CONCENTRATED PRESSURE // AMBER SIGHT'
        },
        cinematic: {
          src: './assets/mode-event-horizon-blitz.jpg',
          label: 'VELOCITY BLITZ',
          tag: 'HYPER-VELOCITY BLITZ',
          subtag: 'AFTERIMAGE SONIC BOOM // 0.94c SLIPSTREAM'
        },
        stance: {
          src: './assets/mode-event-horizon.jpg',
          label: 'CANON ARCHIVE',
          tag: 'ARCHIVE COMBAT STANCE',
          subtag: 'HIGH-COLLAR MASK & WHITE X-HARNESS CANON'
        }
      },
      stat1Val: '0.94c',
      stat1Label: 'Slipstream Velocity',
      stat2Val: '50k T',
      stat2Label: 'Kinetic Cleave Mass',
      stat3Val: '100%',
      stat3Label: 'Barrier Bypass',
      heroTag: 'TACTICAL DUEL FORM'
    },
    'transcendent': {
      title: 'TRANSCENDENT',
      titleBadge: 'PLANETARY SAVIOR',
      telemetry: 'SYSTEM: TRANSCENDENT // ORBIT: EXOSPHERE // THREAT: EXTINCTION',
      desc: 'Awakened only when the Earth faces cosmic annihilation. Floating in the upper exosphere, Eclipse becomes a living dimensional anchor, slicing open or stitching shut the fabric of space-time.',
      views: {
        action: {
          src: './assets/mode-transcendent-action.jpg',
          label: 'SAVIOR ASCENSION',
          tag: 'PLANETARY SAVIOR FORM',
          subtag: 'EXOSPHERE ORBIT // GENESIS SUTURE ENGAGED'
        },
        cleave: {
          src: './assets/mode-transcendent-cleave.jpg',
          label: 'GENESIS CLEAVE',
          tag: 'DIMENSIONAL CLEAVE',
          subtag: 'STITCHING CONTINENTAL FAULT // AURORA SWEEP'
        },
        cinematic: {
          src: './assets/mode-transcendent-stitch.jpg',
          label: 'PLANETARY SUTURE',
          tag: 'ORBITAL SUTURE CUT',
          subtag: 'STARLIGHT THREADS SUTURE CONTINENTAL RIFT'
        },
        stance: {
          src: './assets/mode-transcendent.jpg',
          label: 'CANON ARCHIVE',
          tag: 'ARCHIVE COSMIC FORM',
          subtag: 'WHITE CREST & NIHIL VERITAS VOID CANON'
        }
      },
      stat1Val: 'ORBITAL',
      stat1Label: 'Operational Altitude',
      stat2Val: 'INFINITE',
      stat2Label: 'Gravitational Anchor',
      stat3Val: 'GLOBAL',
      stat3Label: 'Rift Sealing Reach',
      heroTag: 'PLANETARY EXTINCTION FORM'
    }
  };

  const modeButtons = document.querySelectorAll('.mode-btn');
  const heroTitle = document.getElementById('hero-mode-title');
  const heroSubtitle = document.getElementById('hero-mode-desc');
  const heroImage = document.getElementById('hero-main-img');
  const heroBackdrop = document.getElementById('hero-backdrop');
  const heroTelemetry = document.getElementById('hero-telemetry-text');
  const heroBadge = document.getElementById('hero-title-badge');
  const stat1Val = document.getElementById('stat-1-val');
  const stat1Label = document.getElementById('stat-1-label');
  const stat2Val = document.getElementById('stat-2-val');
  const stat2Label = document.getElementById('stat-2-label');
  const stat3Val = document.getElementById('stat-3-val');
  const stat3Label = document.getElementById('stat-3-label');
  const frameHeroTag = document.getElementById('frame-hero-tag');
  const frameHeroSubtag = document.getElementById('frame-hero-subtag');
  const heroViewPills = document.getElementById('hero-view-pills');
  const heroImageFrame = document.getElementById('hero-image-frame');
  const btnToggleFit = document.getElementById('btn-toggle-fit');
  const btnHeroLightbox = document.getElementById('btn-hero-lightbox');

  // Master Fullscreen Lightbox Controller
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxSubtag = document.getElementById('lightbox-subtag');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  function openLightbox(src, tag = 'ECLIPSE // CANON ARCHIVE', subtag = 'HIGH-RESOLUTION MASTER') {
    if (!lightboxModal || !lightboxImg) return;
    sound.playZoomIn();
    lightboxImg.src = src;
    if (lightboxTag) lightboxTag.textContent = tag;
    if (lightboxSubtag) lightboxSubtag.textContent = subtag;
    if (lightboxCaption) lightboxCaption.textContent = `${tag} // ${subtag}`;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    sound.playNavClick();
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Hero Image Click & Expand Button Click
  if (heroImageFrame) {
    heroImageFrame.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const d = modeData[currentMode];
      const v = d.views[currentView] || d.views.action;
      openLightbox(v.src, v.tag, v.subtag);
    });
  }
  if (btnHeroLightbox) {
    btnHeroLightbox.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = modeData[currentMode];
      const v = d.views[currentView] || d.views.action;
      openLightbox(v.src, v.tag, v.subtag);
    });
  }

  // FIT / FILL Toggle (Contain vs Cover)
  function applyFitToggle() {
    if (heroImageFrame) {
      heroImageFrame.classList.toggle('fit-contain', isImageFitContain);
      heroImageFrame.classList.toggle('fit-cover', !isImageFitContain);
    }
    if (btnToggleFit) {
      const txt = btnToggleFit.querySelector('.btn-text');
      if (txt) txt.textContent = isImageFitContain ? 'FIT (100%)' : 'FILL';
      btnToggleFit.title = isImageFitContain
        ? 'Currently displaying 100% full uncropped illustration. Click to fill frame.'
        : 'Currently filling frame. Click to display 100% uncropped illustration.';
    }
  }
  if (btnToggleFit) {
    btnToggleFit.addEventListener('click', (e) => {
      e.stopPropagation();
      sound.playNavClick();
      isImageFitContain = !isImageFitContain;
      applyFitToggle();
    });
  }

  function updateHeroView() {
    const d = modeData[currentMode];
    const v = d.views[currentView] || d.views.action;
    if (heroImage) {
      heroImage.style.transition = 'opacity 0.25s ease';
      heroImage.style.opacity = '0.5';
      setTimeout(() => {
        heroImage.src = v.src;
        heroImage.style.opacity = '1';
      }, 120);
    }
    if (heroBackdrop) {
      heroBackdrop.style.backgroundImage = `url('${v.src}')`;
    }
    if (frameHeroTag) frameHeroTag.textContent = v.tag;
    if (frameHeroSubtag) frameHeroSubtag.textContent = v.subtag;
  }

  function renderViewPills() {
    if (!heroViewPills) return;
    const views = modeData[currentMode].views;
    heroViewPills.innerHTML = '';

    if (!views[currentView]) {
      currentView = Object.keys(views)[0];
    }

    Object.entries(views).forEach(([key, info]) => {
      const btn = document.createElement('button');
      btn.className = `view-pill ${key === currentView ? 'active' : ''}`;
      btn.dataset.view = key;
      btn.title = `${info.tag} — ${info.subtag}`;
      btn.innerHTML = `<span class="pill-dot"></span> <span>${info.label || key.toUpperCase()}</span>`;
      btn.addEventListener('click', () => {
        sound.playNavClick();
        currentView = key;
        heroViewPills.querySelectorAll('.view-pill').forEach((p) => p.classList.toggle('active', p === btn));
        updateHeroView();
      });
      btn.addEventListener('mouseenter', () => sound.playNavHover());
      heroViewPills.appendChild(btn);
    });
  }

  const modeFxOverlay = document.getElementById('mode-fx-overlay');

  function setMode(modeKey) {
    currentMode = modeKey;

    // Reset previous animation classes
    document.body.classList.remove('fx-mode1-shake', 'fx-mode2-warp');
    if (heroImageFrame) {
      heroImageFrame.classList.remove('fx-mode1-hero', 'fx-mode2-hero');
    }
    if (modeFxOverlay) {
      modeFxOverlay.className = '';
    }

    // Force browser reflow so re-triggering the same animation executes reliably
    void document.body.offsetWidth;

    // Determine transformation epicenter from the hero frame
    let originX = window.innerWidth * 0.65;
    let originY = window.innerHeight * 0.45;
    if (heroImageFrame) {
      const rect = heroImageFrame.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
    }

    if (modeKey === 'event-horizon') {
      // 1. Dragon Ball Super Saiyan 2 / Kaio-Ken Audio
      sound.playModeEventHorizon();

      // 2. Canvas Relativistic Warp Streaks & Branching Spatial Lightning
      canvas.setMode('event-horizon');
      canvas.triggerEventHorizonBlitz(originX, originY);

      // 3. Screen Recoil & High-Velocity Iaido Shake
      document.body.classList.add('fx-mode1-shake');
      setTimeout(() => {
        document.body.classList.remove('fx-mode1-shake');
      }, 500);

      // 4. Fullscreen Diagonal Spatial Slash Flash
      if (modeFxOverlay) {
        modeFxOverlay.classList.add('flash-mode1');
        setTimeout(() => {
          modeFxOverlay.className = '';
        }, 520);
      }

      // 5. Hero Frame: Spatial Cut Blade Sweep & Snap Recoil
      if (heroImageFrame) {
        heroImageFrame.classList.add('fx-mode1-hero');
        setTimeout(() => {
          heroImageFrame.classList.remove('fx-mode1-hero');
        }, 600);
      }

      document.body.classList.remove('mode-transcendent');
    } else {
      // 1. Dragon Ball Super Saiyan 3 / Ultra Instinct God Audio
      sound.playModeTranscendent();

      // 2. Canvas Concentric Supernova Shockwave & 360-Degree Starlight Burst
      canvas.setMode('transcendent');
      canvas.triggerCosmicSupernova(originX, originY);

      // 3. Screen Cosmic Gravitational Lens Warp & Expansion
      document.body.classList.add('fx-mode2-warp');
      setTimeout(() => {
        document.body.classList.remove('fx-mode2-warp');
      }, 1000);

      // 4. Fullscreen Supernova Radial Flash
      if (modeFxOverlay) {
        modeFxOverlay.classList.add('flash-mode2');
        setTimeout(() => {
          modeFxOverlay.className = '';
        }, 950);
      }

      // 5. Hero Frame: Celestial Levitation Ascension & Golden God Corona Bloom
      if (heroImageFrame) {
        heroImageFrame.classList.add('fx-mode2-hero');
        setTimeout(() => {
          heroImageFrame.classList.remove('fx-mode2-hero');
        }, 1100);
      }

      document.body.classList.add('mode-transcendent');
    }

    modeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === modeKey);
    });

    const d = modeData[modeKey];
    if (heroTitle) heroTitle.textContent = d.title;
    if (heroBadge) heroBadge.textContent = d.titleBadge;
    if (heroSubtitle) heroSubtitle.textContent = d.desc;
    if (heroTelemetry) heroTelemetry.textContent = d.telemetry;
    if (stat1Val) stat1Val.textContent = d.stat1Val;
    if (stat1Label) stat1Label.textContent = d.stat1Label;
    if (stat2Val) stat2Val.textContent = d.stat2Val;
    if (stat2Label) stat2Label.textContent = d.stat2Label;
    if (stat3Val) stat3Val.textContent = d.stat3Val;
    if (stat3Label) stat3Label.textContent = d.stat3Label;

    renderViewPills();
    updateHeroView();
    chat.setMode(modeKey);
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setMode(btn.dataset.mode);
    });
  });

  // Initial Holo-Display Setup
  applyFitToggle();
  renderViewPills();
  updateHeroView();

  // 5. Dedicated Armory Specs & Blueprint Lightbox
  // 5. Dedicated Armory Specs & Blueprint Lightbox
  const weaponData = {
    'odachi': {
      title: 'THE COMPRESSED ODACHI',
      mode: 'BOUND TO: EVENT HORIZON MODE',
      image: './assets/weapon-compressed-odachi.jpg',
      frameTag: 'WEAPON SPECIFICATION SHEET',
      frameMode: 'EVENT HORIZON ARSENAL',
      frameTitle: 'THE COMPRESSED ODACHI // RELATIVISTIC SPATIAL BLADE',
      frameDesc: 'SLENDER OBSIDIAN SPATIAL BLADE // 160CM OVERALL',
      slashPromptTitle: 'SIMULATE SPATIAL KINETIC CLEAVE',
      slashPromptDesc: 'Deploy relativistic molecular cut at 0.94c with vacuum wake and ringing folded steel overtone',
      components: [
        {
          code: 'COMP-01',
          name: 'KASHIRA / POMMEL',
          badge: 'GRAV-CAPACITOR CORE',
          desc: 'Dense gravimetric counterweight that dynamically offsets blade momentum from 0kg to 50,000 metric tons at point of contact.'
        },
        {
          code: 'COMP-02',
          name: 'TSUKA / HILT',
          badge: 'KINETIC ABSORPTION WRAP',
          desc: 'Woven nano-carbon friction wrap absorbing hypersonic recoil shockwaves directly into an internal thermal sink.'
        },
        {
          code: 'COMP-03',
          name: 'TSUBA / GUARD',
          badge: 'SPATIAL RUNE COLLAR',
          desc: 'Low-profile aerodynamic cross-guard inscribed with spatial runes, diverting atmospheric shockwaves away from Kaelen.'
        },
        {
          code: 'COMP-04',
          name: 'HA & NAGASA / BLADE',
          badge: '160CM OBSIDIAN MONOFILAMENT',
          desc: 'Sub-molecular single-edged event horizon spine tapered to 0.1nm, parting atomic bonds with zero physical drag.'
        }
      ],
      metrics: [
        { label: 'Sub-Molecular Sharpness', val: '99%' },
        { label: 'Spatial Acceleration (Mach)', val: '94%' },
        { label: 'Kinetic Mass Multiplier', val: '88%' },
        { label: 'Shield Severing Index', val: '100%' }
      ],
      diagnostics: [
        { label: 'RESONANCE FREQ', val: '942.8 THz // SYNC' },
        { label: 'GRAV LOAD', val: '0 ➔ 50,000 MT' },
        { label: 'BARRIER PENETRATION', val: '100% ABSOLUTE' }
      ]
    },
    'nihil': {
      title: 'NIHIL VERITAS (COSMIC SPACE BLADE)',
      mode: 'BOUND TO: TRANSCENDENT WORLD-SAVING MODE',
      image: './assets/weapon-nihil-veritas.jpg',
      frameTag: 'PLANETARY RELIC BLUEPRINT',
      frameMode: 'TRANSCENDENT ARSENAL',
      frameTitle: 'NIHIL VERITAS // THE COSMIC SPACE BLADE',
      frameDesc: 'SOLIDIFIED EVENT HORIZON // 165CM EXTINCTION SCALE',
      slashPromptTitle: 'SIMULATE DIMENSIONAL SUTURE CLEAVE',
      slashPromptDesc: 'Deploy extinction-scale cosmic cleave with tectonic sub-bass, starlight sweep, and reality healing',
      components: [
        {
          code: 'COMP-01',
          name: 'SINGULARITY SOUL-ANCHOR',
          badge: 'HYBRID LIFE-CORE LINK',
          desc: 'Direct gravimetric conduit linked to Kaelen’s cosmic consciousness, stabilizing planetary-scale spatial rifts.'
        },
        {
          code: 'COMP-02',
          name: 'HARD-LIGHT STELLAR GUARD',
          badge: 'CORONAL PHOTONIC CROSS-GUARD',
          desc: 'Forged from crystallized starlight photons, projecting globe-spanning orbital defensive barrier fields.'
        },
        {
          code: 'COMP-03',
          name: 'SOLIDIFIED EVENT HORIZON',
          badge: '165CM CRYSTALLIZED SPACETIME',
          desc: 'Semi-translucent crystalline spatial matter housing a living galaxy of stars that sutures continental faults.'
        }
      ],
      metrics: [
        { label: 'Dimensional Rift Stitching', val: '100%' },
        { label: 'Reality Stability Anchoring', val: '100%' },
        { label: 'Cosmic Event Density', val: '98%' },
        { label: 'Orbital Barrier Radius', val: '100%' }
      ],
      diagnostics: [
        { label: 'SPACETIME CURVE', val: '1.240 λ / INFINITE' },
        { label: 'STELLAR OUTPUT', val: '4.88 × 10²⁶ W' },
        { label: 'CONTINENTAL SUTURE', val: 'ACTIVE // 100%' }
      ]
    }
  };

  const weaponBtns = document.querySelectorAll('.weapon-tab-btn');
  const weaponTitle = document.getElementById('weapon-active-title');
  const weaponModeTag = document.getElementById('weapon-active-mode');
  const armoryImg = document.getElementById('armory-weapon-img');
  const armoryTag = document.getElementById('armory-frame-tag');
  const armoryMode = document.getElementById('armory-frame-mode');
  const armoryTitle = document.getElementById('armory-frame-title');
  const armoryDesc = document.getElementById('armory-frame-desc');
  const metricsContainer = document.getElementById('weapon-metrics-container');

  const pipelineContainer = document.getElementById('component-pipeline');
  const componentCardsList = document.getElementById('component-cards-list');
  const slashHeadingText = document.getElementById('slash-heading-text');
  const slashSubText = document.getElementById('slash-sub-text');
  const slashStatusBadge = document.getElementById('slash-status-badge');
  const auxDiagnosticsContainer = document.getElementById('aux-diagnostics-container');

  let currentActiveWeapon = 'odachi';

  function renderWeapon(key, playSound = true) {
    currentActiveWeapon = key;
    if (playSound) {
      if (key === 'odachi') {
        sound.playWeaponOdachi();
      } else {
        sound.playWeaponNihil();
      }
    }

    const w = weaponData[key];
    if (weaponTitle) weaponTitle.textContent = w.title;
    if (weaponModeTag) weaponModeTag.textContent = w.mode;
    if (armoryImg) armoryImg.src = w.image;
    if (armoryTag) armoryTag.textContent = w.frameTag;
    if (armoryMode) armoryMode.textContent = w.frameMode;
    if (armoryTitle) armoryTitle.textContent = w.frameTitle;
    if (armoryDesc) armoryDesc.textContent = w.frameDesc;

    // Update Tactical Slash Sidebar & Firing Deck
    if (slashHeadingText) slashHeadingText.textContent = w.slashPromptTitle;
    if (slashSubText) slashSubText.textContent = w.slashPromptDesc;
    if (slashStatusBadge) {
      slashStatusBadge.textContent = key === 'odachi' 
        ? 'RELATIVISTIC KINETIC MATRIX // ARMED' 
        : 'COSMIC SUTURE RESONATOR // ARMED';
    }
    const slashSysId = document.getElementById('slash-sys-id');
    if (slashSysId) {
      slashSysId.textContent = key === 'odachi' ? 'PROTOCOL // WPN-01 IAIDO' : 'PROTOCOL // WPN-02 GENESIS';
    }
    const telemetryHarmonics = document.getElementById('telemetry-harmonics');
    if (telemetryHarmonics) {
      telemetryHarmonics.textContent = key === 'odachi' ? '942.8 THz // SYNCHRONIZED' : '1.240 λ // SPACETIME CURVE';
    }
    const telemetryVelocity = document.getElementById('telemetry-velocity');
    if (telemetryVelocity) {
      telemetryVelocity.textContent = key === 'odachi' ? '0.94c // RELATIVISTIC' : 'SINGULARITY FOLD // INSTANT';
    }
    const telemetryCleave = document.getElementById('telemetry-cleave');
    if (telemetryCleave) {
      telemetryCleave.textContent = key === 'odachi' ? '0.1nm SUB-ATOMIC CUT' : 'PLANETARY RIFT SUTURE';
    }

    // Render Anatomy Pipeline Track (Visual segments without any +-)
    if (pipelineContainer) {
      pipelineContainer.innerHTML = '';
      w.components.forEach((c, idx) => {
        const node = document.createElement('div');
        node.className = `pipeline-node cyber-cut ${idx === 0 ? 'active' : ''}`;
        node.innerHTML = `
          <span class="pipeline-num">SEG-${String(idx + 1).padStart(2, '0')}</span>
          <span class="pipeline-name">${c.name.split('/')[0].trim()}</span>
        `;
        node.addEventListener('click', () => {
          sound.playHudChirp();
          pipelineContainer.querySelectorAll('.pipeline-node').forEach(n => n.classList.remove('active'));
          node.classList.add('active');
          const targetCard = document.getElementById(`comp-card-${c.code}`);
          if (targetCard) {
            document.querySelectorAll('.comp-card').forEach(card => card.classList.remove('highlighted'));
            targetCard.classList.add('highlighted');
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
        node.addEventListener('mouseenter', () => sound.playNavHover());
        pipelineContainer.appendChild(node);

        if (idx < w.components.length - 1) {
          const arrow = document.createElement('span');
          arrow.className = 'pipeline-arrow';
          arrow.innerHTML = '&#9656;';
          pipelineContainer.appendChild(arrow);
        }
      });
    }

    // Render Modern Component Cards
    if (componentCardsList) {
      componentCardsList.innerHTML = '';
      w.components.forEach((c, idx) => {
        const card = document.createElement('div');
        card.className = `comp-card cyber-cut ${idx === 0 ? 'highlighted' : ''}`;
        card.id = `comp-card-${c.code}`;
        card.innerHTML = `
          <div class="comp-card-header">
            <div class="comp-code-name">
              <span class="comp-code-pill">[${c.code}]</span>
              <span class="comp-name">${c.name}</span>
            </div>
            <span class="comp-badge">${c.badge}</span>
          </div>
          <div class="comp-desc">${c.desc}</div>
        `;
        card.addEventListener('mouseenter', () => {
          sound.playNavHover();
          if (pipelineContainer) {
            pipelineContainer.querySelectorAll('.pipeline-node').forEach((n, i) => {
              n.classList.toggle('active', i === idx);
            });
          }
        });
        card.addEventListener('click', () => sound.playHudChirp());
        componentCardsList.appendChild(card);
      });
    }

    // Render Metrics Bars
    if (metricsContainer) {
      metricsContainer.innerHTML = '';
      w.metrics.forEach((m) => {
        const row = document.createElement('div');
        row.className = 'metric-row';
        row.innerHTML = `
          <div class="metric-header">
            <span>${m.label}</span>
            <span style="color: var(--theme-primary); font-weight: 800;">${m.val}</span>
          </div>
          <div class="metric-bar-track cyber-cut">
            <div class="metric-bar-fill" style="width: ${m.val};"></div>
          </div>
        `;
        metricsContainer.appendChild(row);
      });
    }

    // Render Auxiliary Diagnostics Matrix
    if (auxDiagnosticsContainer) {
      auxDiagnosticsContainer.innerHTML = '';
      w.diagnostics.forEach((d) => {
        const box = document.createElement('div');
        box.className = 'diag-box cyber-cut';
        box.innerHTML = `
          <span class="diag-label">${d.label}</span>
          <span class="diag-val">${d.val}</span>
        `;
        auxDiagnosticsContainer.appendChild(box);
      });
    }

    weaponBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.weapon === key);
    });
  }

  weaponBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      renderWeapon(btn.dataset.weapon, true);
    });
  });

  // Initial weapon render without loud audio
  renderWeapon('odachi', false);

  // 6. Blueprint Viewport Fullscreen Zoom Click
  const bpViewport = document.getElementById('blueprint-clickable-viewport');
  const bpExpandBtn = document.getElementById('btn-expand-blueprint');
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const modalClose = document.getElementById('lightbox-close');

  function openBlueprintModal() {
    if (armoryImg) {
      const w = weaponData[currentActiveWeapon];
      openLightbox(armoryImg.src, w.frameTitle, w.frameDesc);
    }
  }

  if (bpViewport) bpViewport.addEventListener('click', openBlueprintModal);
  if (bpExpandBtn) bpExpandBtn.addEventListener('click', openBlueprintModal);

  // 7. Test Slash Simulator (Dedicated Weapon Slash Systems)
  const slashBtn = document.getElementById('btn-test-slash');
  const slashOverlay = document.getElementById('slash-overlay');
  if (slashBtn && slashOverlay) {
    slashBtn.addEventListener('click', () => {
      slashOverlay.classList.remove('active', 'active-odachi', 'active-nihil');
      void slashOverlay.offsetWidth; // trigger reflow

      if (currentActiveWeapon === 'nihil') {
        // Weapon 02: Nihil Veritas Genesis Cleave
        sound.playNihilSlash(); // Earth-shattering cosmic greatsword cleave + tectonic sub-bass + celestial starlight choir
        slashOverlay.classList.add('active-nihil');

        document.body.classList.remove('fx-mode1-shake', 'fx-mode2-warp');
        document.body.classList.add('fx-mode2-warp');
        setTimeout(() => {
          document.body.classList.remove('fx-mode2-warp');
        }, 900);

        canvas.triggerCosmicSupernova(window.innerWidth / 2, window.innerHeight / 2);
      } else {
        // Weapon 01: The Compressed Odachi Molecular Katana Slice
        sound.playOdachiSlash(); // Ultra-sharp frictionless katana cut + vacuum hiss + kinetic snap
        slashOverlay.classList.add('active-odachi');

        document.body.classList.remove('fx-mode1-shake', 'fx-mode2-warp');
        document.body.classList.add('fx-mode1-shake');
        setTimeout(() => {
          document.body.classList.remove('fx-mode1-shake');
        }, 450);

        canvas.triggerEventHorizonBlitz(window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  }

  // 8. Threat Simulator Module (Emergency Klaxon + Power Surge)
  const simTriggerBtn = document.getElementById('btn-sim-deploy');
  const simLogBox = document.getElementById('sim-log-content');
  const threatSelect = document.getElementById('threat-scenario-select');

  if (simTriggerBtn && simLogBox) {
    simTriggerBtn.addEventListener('click', () => {
      const scenario = threatSelect ? threatSelect.value : 'PACIFIC FISSURE';
      sound.playRiftDeploy(); // Tactical siren + power surge
      simLogBox.innerHTML = '';

      const logLines = [
        `> [ALERT] DETECTED DIMENSIONAL BREACH: ${scenario}`,
        `> [LOC] COORDINATES LOCKED. INITIATING RECON VECTORS...`,
        `> [TELEMETRY] EXOSPHERE ORBITAL VELOCITY ENGAGED: 11.2 km/s`,
        `> [WEAPON] NIHIL VERITAS MANIFESTED: SOLIDIFIED EVENT HORIZON 100%`,
        `> [TACTICAL] EXECUTING GENESIS CLEAVE // THE WORLD STITCH...`,
        `> [SUCCESS] CONTINENTAL SEAM SEALED. ANOMALY NEUTRALIZED.`,
        `> [STATUS] EARTH STABILITY INDEX: 99.98% OPTIMAL.`
      ];

      logLines.forEach((line, i) => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.textContent = line;
          div.style.color = i === logLines.length - 1 ? '#00e5ff' : '#a0ff90';
          simLogBox.appendChild(div);
          simLogBox.scrollTop = simLogBox.scrollHeight;
          if (i === 4) {
            sound.playNihilSlash(); // Nihil Veritas Genesis Cleave
            canvas.triggerCosmicSupernova(window.innerWidth / 2, window.innerHeight / 2);
            if (slashOverlay) {
              slashOverlay.classList.remove('active', 'active-odachi', 'active-nihil');
              void slashOverlay.offsetWidth;
              slashOverlay.classList.add('active-nihil');
            }
          } else {
            sound.playHudChirp();
          }
        }, i * 350);
      });
    });
  }

  // 9. Lightbox Gallery Functionality for Vault Items
  document.querySelectorAll('.vault-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.vault-caption');
      if (img) {
        openLightbox(
          img.src,
          caption ? caption.textContent.trim() : 'CLASSIFIED HOLO ARCHIVE',
          'CANON ARTWORK ARCHIVE'
        );
      }
    });
  });

  // 10. Initialize Eclipse In-Character Holographic Comms Chatbot
  chat.init();
  chat.setMode(currentMode);

  const heroCommsBtn = document.getElementById('hero-btn-comms');
  if (heroCommsBtn) {
    heroCommsBtn.addEventListener('click', () => {
      chat.openDrawer();
    });
    heroCommsBtn.addEventListener('mouseenter', () => sound.playNavHover());
  }

  const navCommsLink = document.getElementById('nav-comms-link');
  if (navCommsLink) {
    navCommsLink.addEventListener('click', (e) => {
      e.preventDefault();
      chat.openDrawer();
    });
    navCommsLink.addEventListener('mouseenter', () => sound.playNavHover());
  }
});