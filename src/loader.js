// High-Tech Cyberpunk Sector Preloader & Network Lag Compensator
// Coordinates seamless, cinematic page transitions and dynamic latency shields.

class SectorLoaderController {
  constructor() {
    this.preloaderEl = null;
    this.progressBarEl = null;
    this.statusTextEl = null;
    this.percentTextEl = null;
    this.sectorTitleEl = null;
    this.modeBadgeEl = null;
    this.lagBannerEl = null;
    this.lagTextEl = null;
    this.packetsTickerEl = null;

    this.lagTimer = null;
    this.progressInterval = null;
    this.currentPercent = 0;
    this.isTransitioning = false;

    this.sectorMap = {
      'index': {
        num: '00',
        code: 'SECTOR 00 // COMMAND OVERVIEW',
        sub: 'TACTICAL OVERVIEW & COMBAT DECK',
        color: 'var(--theme-primary)'
      },
      'armory': {
        num: '01',
        code: 'SECTOR 01 // ARSENAL & BLUEPRINTS',
        sub: 'WEAPON SPECIFICATIONS & METALLURGY',
        color: 'var(--theme-primary)'
      },
      'origin': {
        num: '02',
        code: 'SECTOR 02 // OPERATIVE DOSSIER',
        sub: 'THE TRIPLE CONFLUENCE ORIGIN',
        color: '#a0ff90'
      },
      'simulator': {
        num: '03',
        code: 'SECTOR 03 // RIFT SIMULATOR',
        sub: 'PLANETARY DEFENSE CONSOLE',
        color: '#ffd000'
      },
      'vault': {
        num: '04',
        code: 'SECTOR 04 // CANON ARCHIVE',
        sub: 'CLASSIFIED 4K MASTER VAULT',
        color: '#00e5ff'
      },
      'comms': {
        num: '05',
        code: 'SECTOR 05 // NEURAL COMMS UPLINK',
        sub: 'DIRECT HERO CODEC & CITIZEN INTAKE',
        color: '#ff2d55'
      }
    };
  }

  getSectorInfo(pathOrHref) {
    const raw = (pathOrHref || window.location.pathname).toLowerCase();
    if (raw.includes('armory')) return this.sectorMap.armory;
    if (raw.includes('origin')) return this.sectorMap.origin;
    if (raw.includes('simulator')) return this.sectorMap.simulator;
    if (raw.includes('vault')) return this.sectorMap.vault;
    if (raw.includes('comms')) return this.sectorMap.comms;
    return this.sectorMap.index;
  }

  getActiveMode() {
    try {
      const m = localStorage.getItem('kei_active_combat_mode');
      return (m === 'transcendent' || m === 'event-horizon') ? m : 'event-horizon';
    } catch {
      return 'event-horizon';
    }
  }

  init() {
    this.bindDomElements();
    this.initIncomingTransition();
    this.bindLinkInterceptors();

    // bfcache handler: prevent frozen loader when user navigates with Back/Forward buttons
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        this.hide(true);
      }
    });
  }

  bindDomElements() {
    this.preloaderEl = document.getElementById('sector-preloader');
    this.progressBarEl = document.getElementById('preloader-progress-bar');
    this.statusTextEl = document.getElementById('preloader-status-text');
    this.percentTextEl = document.getElementById('preloader-percent-text');
    this.sectorTitleEl = document.getElementById('preloader-sector-title');
    this.modeBadgeEl = document.getElementById('preloader-mode-badge');
    this.lagBannerEl = document.getElementById('preloader-lag-banner');
    this.lagTextEl = document.getElementById('preloader-lag-text');
    this.packetsTickerEl = document.getElementById('preloader-packets-ticker');
  }

  // Incoming Page Load Sequence
  initIncomingTransition() {
    this.bindDomElements();
    if (!this.preloaderEl) return;

    const mode = this.getActiveMode();
    const sector = this.getSectorInfo();

    // Apply active mode badge & sector title
    if (this.modeBadgeEl) {
      this.modeBadgeEl.textContent = mode === 'transcendent' ? 'MODE II: TRANSCENDENT' : 'MODE I: EVENT HORIZON';
    }
    if (this.sectorTitleEl) {
      this.sectorTitleEl.textContent = sector.code;
    }

    // Step 1: Initial load handshake
    this.setProgress(25, 'ESTABLISHING CARRIER FREQUENCY...');

    // If initial loading takes longer than 350ms, trigger network lag indicator
    this.armLagDetector();

    // Step 2: Once DOM is ready
    const handleReady = () => {
      this.setProgress(70, 'CALIBRATING QUANTUM ANCHOR...');
    };

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      handleReady();
    } else {
      document.addEventListener('DOMContentLoaded', handleReady, { once: true });
    }

    // Step 3: Once window is fully loaded (or maximum safety timeout)
    const handleComplete = () => {
      this.setProgress(100, 'SECTOR DECK ONLINE // READY');
      setTimeout(() => {
        this.hide();
      }, 220);
    };

    if (document.readyState === 'complete') {
      setTimeout(handleComplete, 160);
    } else {
      window.addEventListener('load', () => setTimeout(handleComplete, 140), { once: true });
    }

    // Safety fallback timeout: never hang indefinitely under poor network conditions
    setTimeout(() => {
      if (this.preloaderEl && this.preloaderEl.classList.contains('active')) {
        this.hide();
      }
    }, 2800);
  }

  // Outgoing Transition (User clicks a link to another page)
  show(targetHref) {
    this.bindDomElements();
    if (!this.preloaderEl) return;

    this.isTransitioning = true;
    const mode = this.getActiveMode();
    const sector = this.getSectorInfo(targetHref);

    if (this.modeBadgeEl) {
      this.modeBadgeEl.textContent = mode === 'transcendent' ? 'MODE II: TRANSCENDENT' : 'MODE I: EVENT HORIZON';
    }
    if (this.sectorTitleEl) {
      this.sectorTitleEl.textContent = sector.code;
    }
    if (this.lagBannerEl) {
      this.lagBannerEl.style.display = 'none';
    }

    this.preloaderEl.classList.add('active');
    this.setProgress(15, 'INITIATING SECTOR HANDOFF...');

    // Smooth ramp-up progress bar while browser loads destination
    let p = 15;
    if (this.progressInterval) clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (p < 85) {
        p += Math.floor(Math.random() * 12 + 6);
        if (p > 85) p = 85;
        this.setProgress(p, p > 50 ? 'BUFFERING CANON ASSETS...' : 'STREAMING SLIPSTREAM DATA...');
      }
    }, 70);

    // Arm lag detector in case network latency slows down navigation response
    this.armLagDetector();
  }

  hide(immediate = false) {
    if (this.lagTimer) clearTimeout(this.lagTimer);
    if (this.progressInterval) clearInterval(this.progressInterval);

    if (!this.preloaderEl) return;

    if (immediate) {
      this.preloaderEl.classList.remove('active');
      this.isTransitioning = false;
      return;
    }

    this.setProgress(100, 'SECTOR DECK ONLINE // READY');
    setTimeout(() => {
      if (this.preloaderEl) {
        this.preloaderEl.classList.remove('active');
      }
      this.isTransitioning = false;
    }, 200);
  }

  setProgress(percent, statusText) {
    this.currentPercent = Math.min(100, Math.max(0, percent));

    if (this.progressBarEl) {
      this.progressBarEl.style.width = `${this.currentPercent}%`;
    }
    if (this.percentTextEl) {
      this.percentTextEl.textContent = `${this.currentPercent}%`;
    }
    if (this.statusTextEl && statusText) {
      this.statusTextEl.textContent = statusText;
    }
  }

  // Network Lag Compensator
  armLagDetector() {
    if (this.lagTimer) clearTimeout(this.lagTimer);

    // If transition takes longer than 360ms, display the latency compensator
    this.lagTimer = setTimeout(() => {
      if (this.lagBannerEl && (this.preloaderEl && this.preloaderEl.classList.contains('active'))) {
        this.lagBannerEl.style.display = 'flex';
        if (this.lagTextEl) {
          this.lagTextEl.textContent = 'NETWORK LATENCY DETECTED // STREAMING ASSETS @ 0.94c SLIPSTREAM';
        }
        this.startPacketTicker();
      }
    }, 360);
  }

  startPacketTicker() {
    if (!this.packetsTickerEl) return;
    let kb = 1024;
    const tickerInterval = setInterval(() => {
      if (!this.preloaderEl || !this.preloaderEl.classList.contains('active')) {
        clearInterval(tickerInterval);
        return;
      }
      kb += Math.floor(Math.random() * 240 + 80);
      this.packetsTickerEl.textContent = `${kb.toLocaleString()} KB`;
    }, 180);
  }

  // Intercept local page navigation links
  bindLinkInterceptors() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      // Ignore modified clicks (new tab / window)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore anchor links, tel, mailto, javascript, external links
      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        link.target === '_blank'
      ) {
        return;
      }

      // Ignore chat/comms drawer openers
      if (link.id === 'nav-comms-link' || link.id === 'mobile-nav-comms-link' || link.classList.contains('btn-comms-call')) {
        return;
      }

      // Detect if link points to an internal HTML page or root
      const isInternal = href.endsWith('.html') || href === './' || href === '/' || href.startsWith('./');
      if (isInternal) {
        // Prevent default navigation to display seamless loading handoff
        e.preventDefault();

        // Trigger loading screen with destination sector
        this.show(href);

        // Perform navigation after a micro-delay so the exit animation begins cleanly
        setTimeout(() => {
          window.location.href = href;
        }, 110);
      }
    });
  }
}

export const loader = new SectorLoaderController();
