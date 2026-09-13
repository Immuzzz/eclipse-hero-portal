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
      if (sfxLabel) sfxLabel.textContent = isEnabled ? 'SFX: ON' : 'SFX: OFF';
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
      titleBadge: 'CLOSE-QUARTERS DUELIST',
      telemetry: 'OPERATIVE ARCHIVE // CALLSIGN: KEI (京) // GROUND PATROL',
      desc: 'Total kinetic compression. In close combat, Kei collapses his own physical footprint to zero resistance. He does not charge enemies—he simply appears on the other side of their guard, sheath clicking shut as the strike connects.',
      views: {
        action: {
          src: './assets/mode-event-horizon-action.jpg',
          label: 'TACTICAL IAIDO',
          tag: 'TACTICAL IAIDO DRAW',
          subtag: 'High-Velocity Monofilament Strike'
        },
        aerial: {
          src: './assets/mode-event-horizon-stand.jpg',
          label: 'GROUND ZERO',
          tag: 'VIGIL STANCE',
          subtag: 'Rooted Monofilament Ground Anchor'
        },
        focus: {
          src: './assets/mode-event-horizon-focus.jpg',
          label: 'DUELIST FOCUS',
          tag: 'DUELIST CONCENTRATION',
          subtag: 'Kinetic Trajectory Analysis'
        },
        cinematic: {
          src: './assets/mode-event-horizon-blitz.jpg',
          label: 'VELOCITY BLITZ',
          tag: 'SLIPSTREAM BLITZ',
          subtag: 'Hyper-Velocity Kinetic Afterimage'
        },
        stance: {
          src: './assets/mode-event-horizon-guardian.jpg',
          label: 'URBAN SENTINEL',
          tag: 'URBAN SENTINEL',
          subtag: 'Neo-Tokyo Skyline Night Patrol'
        }
      },
      stat1Val: 'INSTANT',
      stat1Label: 'Draw Speed',
      stat2Val: 'IAIDO',
      stat2Label: 'Combat Stance',
      stat3Val: 'CLEAVE',
      stat3Label: 'Barrier Bypass',
      heroTag: 'CLOSE-QUARTERS IAIDO FORM'
    },
    'transcendent': {
      title: 'TRANSCENDENT',
      titleBadge: 'DIMENSIONAL ANCHOR',
      telemetry: 'EXOSPHERIC ASCENSION // THREAT: EXTINCTION // ORBIT READY',
      desc: 'When planetary rifts breach global stability, Kei sheds physical constraints to ascend into the exosphere. Armed with the massive Nihil Veritas, his strikes become living gravitational sutures—cleaving anomalous breaches and stitching the sky back together.',
      views: {
        action: {
          src: './assets/mode-transcendent-action.jpg',
          label: 'SAVIOR ASCENT',
          tag: 'EXOSPHERIC ASCENSION',
          subtag: 'Zero-Gravity Tactical Overwatch'
        },
        cleave: {
          src: './assets/mode-transcendent-cleave.jpg',
          label: 'GENESIS CLEAVE',
          tag: 'GENESIS CLEAVE',
          subtag: 'Dimensional Rift Severance Strike'
        },
        cinematic: {
          src: './assets/mode-transcendent-stitch.jpg',
          label: 'SKY SUTURE',
          tag: 'ATMOSPHERIC SUTURE',
          subtag: 'Sealing High-Altitude Spatial Tears'
        },
        stance: {
          src: './assets/mode-transcendent.jpg',
          label: 'NIHIL VERITAS',
          tag: 'NIHIL VERITAS DOCK',
          subtag: 'Full Greatsword Deployment Stance'
        },
        maelstrom: {
          src: './assets/mode-transcendent-maelstrom.jpg',
          label: 'SINGULARITY',
          tag: 'SINGULARITY DISCHARGE',
          subtag: 'Orbital Convergence Horizon'
        }
      },
      stat1Val: 'EXOSPHERE',
      stat1Label: 'Combat Envelope',
      stat2Val: 'ANCHOR',
      stat2Label: 'Combat Stance',
      stat3Val: 'SUTURE',
      stat3Label: 'Rift Neutralization',
      heroTag: 'EXOSPHERIC ANCHOR FORM'
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
  const reticleTelemetryText = document.getElementById('reticle-telemetry-text');

  // Master Fullscreen Lightbox Controller
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxSubtag = document.getElementById('lightbox-subtag');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  function openLightbox(src, tag = 'KEI // CANON ARCHIVE', subtag = 'HIGH-RESOLUTION MASTER') {
    if (!lightboxModal || !lightboxImg) return;
    sound.playZoomIn();
    lightboxImg.src = src;
    if (lightboxTag) lightboxTag.textContent = tag;
    if (lightboxSubtag) lightboxSubtag.textContent = subtag;
    if (lightboxCaption) lightboxCaption.textContent = `${tag} // ${subtag}`;

    // Auto-detect Orientation for Optimal Lightbox Viewability
    const lightboxContent = lightboxModal.querySelector('.lightbox-content');
    const probe = new Image();
    function applyOrientation() {
      if (lightboxContent) {
        const isLandscape = probe.naturalWidth > probe.naturalHeight;
        lightboxContent.classList.toggle('is-landscape', isLandscape);
        lightboxContent.classList.toggle('is-portrait', !isLandscape);
      }
    }
    probe.onload = applyOrientation;
    probe.src = src;
    if (probe.complete && probe.naturalWidth > 0) {
      applyOrientation();
    }

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

    // 3D Holographic Parallax Tilt & Dynamic HUD Reticle
    let tiltRaf = null;

    heroImageFrame.addEventListener('mousemove', (e) => {
      const rect = heroImageFrame.getBoundingClientRect();
      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;
      const percentX = Math.max(0, Math.min(1, rawX / rect.width));
      const percentY = Math.max(0, Math.min(1, rawY / rect.height));
      const normX = percentX - 0.5;
      const normY = percentY - 0.5;

      // Realistic 3D tilt angles (up to +/- 16 degrees)
      const rotY = normX * 22;
      const rotX = -normY * 22;

      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(() => {
        heroImageFrame.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
        heroImageFrame.style.setProperty('--mx', `${(percentX * 100).toFixed(1)}%`);
        heroImageFrame.style.setProperty('--my', `${(percentY * 100).toFixed(1)}%`);
        heroImageFrame.style.setProperty('--raw-x', `${rawX.toFixed(1)}px`);
        heroImageFrame.style.setProperty('--raw-y', `${rawY.toFixed(1)}px`);
      });
    });

    heroImageFrame.addEventListener('mouseleave', () => {
      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      heroImageFrame.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease';
      heroImageFrame.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      heroImageFrame.style.setProperty('--mx', '50%');
      heroImageFrame.style.setProperty('--my', '50%');
      setTimeout(() => {
        heroImageFrame.style.transition = '';
      }, 650);
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

    // Dynamic Orientation Adaptation for Hero Artwork Frame
    const probe = new Image();
    function adaptHeroFrame() {
      const isLandscape = probe.naturalWidth > probe.naturalHeight;
      if (heroImageFrame) {
        heroImageFrame.classList.toggle('is-landscape', isLandscape);
        heroImageFrame.classList.toggle('is-portrait', !isLandscape);
      }
      const heroContainer = heroImageFrame ? heroImageFrame.closest('.hero-visual-container') : null;
      if (heroContainer) {
        heroContainer.classList.toggle('is-landscape', isLandscape);
        heroContainer.classList.toggle('is-portrait', !isLandscape);
      }
    }
    probe.onload = adaptHeroFrame;
    probe.src = v.src;
    if (probe.complete && probe.naturalWidth > 0) {
      adaptHeroFrame();
    }
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
    if (reticleTelemetryText) {
      reticleTelemetryText.textContent = modeKey === 'event-horizon' ? 'TGT: LOCK // 0.94c' : 'ORBIT: SUTURE // EXOSPHERE';
    }

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
  const weaponData = {
    'odachi': {
      title: 'THE COMPRESSED ODACHI',
      mode: 'BOUND TO: EVENT HORIZON MODE',
      views: {
        blade: {
          image: './assets/weapon-compressed-odachi.jpg',
          tag: 'WEAPON SPECIFICATION SHEET',
          mode: 'EVENT HORIZON ARSENAL',
          title: 'THE COMPRESSED ODACHI // RELATIVISTIC SPATIAL BLADE',
          desc: 'SLENDER OBSIDIAN SPATIAL BLADE // 160CM OVERALL',
          compLabel: 'SCABBARD MATRIX'
        },
        component: {
          image: './assets/weapon-scabbard-schematic.jpg',
          tag: 'COMPONENT SPECIFICATION MATRIX',
          mode: 'EVENT HORIZON CONTAINMENT',
          title: 'THE SPATIAL SCABBARD // 25T MAGNETIC SHEATH',
          desc: 'SUPERCONDUCTING VACUUM MATRIX & ACCELERATOR RAIL // 160CM SHEATH',
          compLabel: 'SCABBARD MATRIX'
        }
      },
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
      views: {
        blade: {
          image: './assets/weapon-nihil-veritas.jpg',
          tag: 'PLANETARY RELIC BLUEPRINT',
          mode: 'TRANSCENDENT ARSENAL',
          title: 'NIHIL VERITAS // THE COSMIC SPACE BLADE',
          desc: 'SOLIDIFIED EVENT HORIZON // 165CM EXTINCTION SCALE',
          compLabel: 'CORE & EMITTER'
        },
        component: {
          image: './assets/weapon-nihil-core-schematic.jpg',
          tag: 'SINGULARITY EMITTER BLUEPRINT',
          mode: 'TRANSCENDENT HARMONICS',
          title: 'COSMIC SINGULARITY CORE & EMITTER // HARD-LIGHT MATRIX',
          desc: 'DIMENSIONAL SUTURE RINGS & STELLAR CORONA DRIVER',
          compLabel: 'CORE & EMITTER'
        }
      },
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
  let currentWeaponSubView = 'blade';
  const bpSubPills = document.querySelectorAll('.bp-sub-pill');
  const bpCompLabel = document.getElementById('bp-comp-label');

  function updateWeaponStageView() {
    const w = weaponData[currentActiveWeapon];
    if (!w) return;
    const view = (w.views && w.views[currentWeaponSubView]) ? w.views[currentWeaponSubView] : {
      image: w.image,
      tag: w.frameTag,
      mode: w.frameMode,
      title: w.frameTitle,
      desc: w.frameDesc,
      compLabel: 'COMPONENT MATRIX'
    };

    if (armoryImg) armoryImg.src = view.image;
    if (armoryTag) armoryTag.textContent = view.tag;
    if (armoryMode) armoryMode.textContent = view.mode;
    if (armoryTitle) armoryTitle.textContent = view.title;
    if (armoryDesc) armoryDesc.textContent = view.desc;
    if (bpCompLabel && w.views && w.views.component) {
      bpCompLabel.textContent = w.views.component.compLabel;
    }

    bpSubPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.subview === currentWeaponSubView);
    });
  }

  bpSubPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sound.playHudChirp();
      currentWeaponSubView = pill.dataset.subview;
      updateWeaponStageView();
    });
  });

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

    // Refresh stage with current active subview
    updateWeaponStageView();

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
      const view = (w.views && w.views[currentWeaponSubView]) ? w.views[currentWeaponSubView] : {
        title: w.frameTitle,
        desc: w.frameDesc
      };
      openLightbox(armoryImg.src, view.title, view.desc);
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

  // 9. Lightbox Gallery Functionality for Vault Items & Armory Blueprint Cards
  document.querySelectorAll('.vault-item').forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.vault-caption');
      const tag = item.dataset.tag || (caption ? caption.querySelector('div:first-child')?.textContent.trim() : 'CLASSIFIED HOLO ARCHIVE');
      const subtag = item.dataset.subtag || (caption ? caption.querySelector('div:last-child')?.textContent.trim() : 'CANON ARTWORK ARCHIVE');
      if (img) {
        openLightbox(
          img.src,
          tag || 'CLASSIFIED HOLO ARCHIVE',
          subtag || 'CANON ARTWORK ARCHIVE'
        );
      }
    });
  });

  // Origin Phase Media Fullscreen Lightbox
  document.querySelectorAll('.origin-phase-media').forEach((media) => {
    media.addEventListener('click', () => {
      const img = media.querySelector('img');
      const card = media.closest('.origin-phase-card');
      const title = card ? card.querySelector('.origin-phase-title') : null;
      const step = card ? card.querySelector('.origin-phase-step-badge') : null;
      if (img) {
        openLightbox(
          img.src,
          step ? step.textContent.trim() : 'ORIGIN ARCHIVE // KEI (京)',
          title ? title.textContent.trim() : 'THE TRIPLE CONFLUENCE'
        );
      }
    });
  });

  // Vault Category Filtering (Supports both Curated Sections and Items)
  const vaultFilterBtns = document.querySelectorAll('.vault-filter-btn');
  const vaultSections = document.querySelectorAll('.vault-section');
  if (vaultFilterBtns.length > 0) {
    vaultFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playNavClick();
        vaultFilterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        if (vaultSections.length > 0) {
          vaultSections.forEach((sec) => {
            if (filter === 'all' || sec.dataset.section === filter) {
              sec.style.display = '';
            } else {
              sec.style.display = 'none';
            }
          });
        }

        document.querySelectorAll('.vault-item').forEach((item) => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
      btn.addEventListener('mouseenter', () => sound.playNavHover());
    });
  }

  // 10. Mobile Cyber Navigation Drawer Controller
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavClose = document.getElementById('mobile-nav-close');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileNav() {
    if (mobileNavDrawer && mobileNavToggle) {
      mobileNavDrawer.classList.add('is-open');
      mobileNavToggle.classList.add('is-active');
      mobileNavToggle.setAttribute('aria-expanded', 'true');
      mobileNavDrawer.setAttribute('aria-hidden', 'false');
      sound.playNavClick();
    }
  }

  function closeMobileNav() {
    if (mobileNavDrawer && mobileNavToggle) {
      mobileNavDrawer.classList.remove('is-open');
      mobileNavToggle.classList.remove('is-active');
      mobileNavToggle.setAttribute('aria-expanded', 'false');
      mobileNavDrawer.setAttribute('aria-hidden', 'true');
    }
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      if (mobileNavDrawer && mobileNavDrawer.classList.contains('is-open')) {
        closeMobileNav();
        sound.playNavClick();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => {
      closeMobileNav();
      sound.playNavClick();
    });
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', () => {
      closeMobileNav();
      sound.playNavClick();
    });
  }

  // Highlight active page link in mobile navigation
  const currentPath = window.location.pathname.toLowerCase();
  mobileNavLinks.forEach((link) => {
    const page = link.dataset.page;
    if (page) {
      const isHome = page === 'index' && (currentPath === '' || currentPath.endsWith('/') || currentPath.endsWith('index.html'));
      const isSub = currentPath.includes(page);
      if (isHome || isSub) {
        link.classList.add('active');
      }
    }

    link.addEventListener('click', (e) => {
      if (link.id === 'mobile-nav-comms-link' || link.classList.contains('btn-comms-call')) {
        e.preventDefault();
        closeMobileNav();
        sound.playNavClick();
        setTimeout(() => {
          chat.openDrawer();
        }, 120);
      } else {
        sound.playNavClick();
        closeMobileNav();
      }
    });
    link.addEventListener('mouseenter', () => sound.playNavHover());
  });

  // 11. Initialize Eclipse In-Character Holographic Comms Chatbot
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