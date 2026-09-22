/**
 * ECLIPSE HERO DIRECT COMMS ENGINE
 * In-Character Superhero Interactive Terminal: Kaelen Mercer (ECLIPSE)
 * 
 * Provides an authentic, immersive, 1-on-1 direct conversation with Kaelen Mercer.
 * Naturally gathers citizen emergency telemetry (Name, Age, Location, Email, Grievance),
 * generates an official Incident Dossier, dispatches automated email alerts to headquarters,
 * and maintains continuous protective dialogue in first-person hero voice.
 */

import { sound } from './audio.js';
import { sendIncidentEmail } from './dispatch.js';

// Conversational State Machine Constants
export const STATES = {
  GREETING_NAME: 'GREETING_NAME',
  AGE: 'AGE',
  LOCATION: 'LOCATION',
  EMAIL: 'EMAIL',
  GRIEVANCE: 'GRIEVANCE',
  COMPLETE: 'COMPLETE',
  FREE_CHAT: 'FREE_CHAT'
};

const STORAGE_KEY = 'eclipse_direct_hero_comms_v2';

export class EclipseChatbot {
  constructor() {
    this.currentMode = 'event-horizon'; // 'event-horizon' | 'transcendent'
    this.state = STATES.GREETING_NAME;
    this.isOpen = false;
    this.isTyping = false;
    this.citizen = {
      name: '',
      age: null,
      location: '',
      email: '',
      grievance: '',
      incidentId: null,
      timestamp: null,
      status: 'AWAITING_INPUT'
    };
    this.messages = [];
    this.lastSubmittedGrievance = null; // Prevent duplicate submissions
    this.submissionInFlight = false;

    // DOM Elements
    this.fab = null;
    this.drawer = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendBtn = null;
    this.closeBtn = null;
    this.clearBtn = null;
    this.typingIndicator = null;
    this.quickRepliesContainer = null;
    this.unreadBadge = null;
    this.modeBadge = null;
    this.hasUnread = false;
  }

  init() {
    this.fullPageTerminal = document.getElementById('full-page-terminal');
    this.isFullPage = !!this.fullPageTerminal;
    this.fab = document.getElementById('holo-comm-fab');
    this.drawer = document.getElementById('holo-comm-drawer');
    this.messagesContainer = document.getElementById('comms-messages-wrap');
    this.inputField = document.getElementById('comms-input');
    this.sendBtn = document.getElementById('comms-send-btn');
    this.closeBtn = document.getElementById('comms-close-btn');
    this.clearBtn = document.getElementById('comms-reset-btn');
    this.typingIndicator = document.getElementById('comms-typing-indicator');
    this.quickRepliesContainer = document.getElementById('comms-quick-replies');
    this.unreadBadge = document.getElementById('comms-unread-badge');
    this.modeBadge = document.getElementById('comms-mode-pill');

    if (!this.messagesContainer || !this.inputField) {
      console.warn('[ECLIPSE COMMS] Chat DOM nodes not found.');
      return;
    }

    if (this.isFullPage) {
      this.isOpen = true;
    }

    // Always ensure fresh, interactive submission state on init
    this.isTyping = false;
    this.submissionInFlight = false;
    this.showTyping(false);
    if (this.sendBtn) {
      this.sendBtn.disabled = false;
      this.sendBtn.removeAttribute('aria-busy');
    }

    this.bindEvents();
    this.loadSession();

    // If no previous history exists, trigger initial superhero greeting
    if (this.messages.length === 0) {
      this.sendInitialGreeting();
    } else {
      this.renderAllMessages();
      this.updateQuickReplies();
      this.updatePlaceholder();
    }
  }

  setMode(modeKey) {
    this.currentMode = modeKey;
    if (this.drawer) {
      this.drawer.setAttribute('data-mode', modeKey);
    }
    if (this.fab) {
      this.fab.setAttribute('data-mode', modeKey);
    }
    if (this.fullPageTerminal) {
      this.fullPageTerminal.setAttribute('data-mode', modeKey);
    }
    const headerAvatar = document.getElementById('drawer-header-avatar-img');
    if (headerAvatar) {
      headerAvatar.src = modeKey === 'transcendent'
        ? './assets/mode-transcendent-action.jpg'
        : './assets/mode-event-horizon-focus.jpg';
    }
    const codecPortrait = document.getElementById('codec-operative-portrait');
    if (codecPortrait) {
      codecPortrait.src = modeKey === 'transcendent'
        ? './assets/mode-transcendent-action.jpg'
        : './assets/mode-event-horizon-focus.jpg';
    }
    const codecStance = document.getElementById('codec-stance-val');
    if (codecStance) {
      codecStance.textContent = modeKey === 'transcendent'
        ? 'MODE II // EXOSPHERIC ANCHOR (11.2 km/s)'
        : 'MODE I // RELATIVISTIC IAIDO (0.94c)';
    }
    const codecEta = document.getElementById('codec-eta-val');
    if (codecEta) {
      codecEta.textContent = modeKey === 'transcendent'
        ? '11.2 km/s ORBIT // 1.5 SEC'
        : '0.94c SLIPSTREAM // 4.5 SEC';
    }
    const codecWeapon = document.getElementById('codec-weapon-val');
    if (codecWeapon) {
      codecWeapon.textContent = modeKey === 'transcendent'
        ? 'NIHIL VERITAS (COSMIC SUTURE)'
        : 'THE COMPRESSED ODACHI (0.94c MONOFILAMENT)';
    }
    if (this.modeBadge) {
      if (modeKey === 'transcendent') {
        this.modeBadge.innerHTML = '<span class="status-pulse-dot" style="background:#ffd000; box-shadow:0 0 8px #ffd000;"></span> DIRECT HERO COMMS &bull; MODE 02';
      } else {
        this.modeBadge.innerHTML = '<span class="status-pulse-dot"></span> DIRECT HERO COMMS &bull; MODE 01';
      }
    }
  }

  bindEvents() {
    // Open/Close Comms Drawer (when present)
    if (this.fab) {
      this.fab.addEventListener('click', () => {
        this.toggleDrawer();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Clear session & reset
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        if (confirm('Close this direct conversation with Kaelen and start a fresh session?')) {
          this.resetSession();
        }
      });
    }

    // Send on button click
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleUserSubmit();
      });
    }

    // Send on Enter
    if (this.inputField) {
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleUserSubmit();
        }
      });
    }

    // Close on Escape (only for floating drawer)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && !this.isFullPage) {
        this.closeDrawer();
      }
    });

    // Preset frequency buttons (on full-page terminal)
    document.querySelectorAll('.preset-freq-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        if (query) {
          this.submitQueryText(query);
        }
      });
    });
  }

  submitQueryText(text) {
    if (this.isTyping || this.submissionInFlight) return;
    if (this.inputField) {
      this.inputField.value = text;
      try {
        sound.playNavClick();
      } catch (_) {}
      this.handleUserSubmit();
    }
  }

  toggleDrawer() {
    if (this.isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.isOpen = true;
    this.drawer.classList.add('active');
    this.fab.classList.add('drawer-open');
    this.hasUnread = false;
    if (this.unreadBadge) {
      this.unreadBadge.style.display = 'none';
    }
    try {
      sound.playCommsOpen();
    } catch (_) {}
    setTimeout(() => {
      if (this.inputField) {
        this.inputField.focus();
      }
      this.scrollToBottom();
    }, 200);
  }

  closeDrawer() {
    this.isOpen = false;
    this.drawer.classList.remove('active');
    this.fab.classList.remove('drawer-open');
    try {
      sound.playNavClick();
    } catch (_) {}
  }

  sendInitialGreeting() {
    this.state = STATES.GREETING_NAME;
    const greetingText =
      "Hey! I hear you loud and clear. It's Kaelen—Kei.\n\nI just picked up your signal pinging my orbital link from down on the surface. Are you somewhere safe right now?\n\nTalk to me—who am I speaking with? What's your name?";

    setTimeout(() => {
      this.addMessage('eclipse', greetingText);
      this.updateQuickReplies();
      this.updatePlaceholder();
    }, 550);
  }

  async handleUserSubmit() {
    if (!this.inputField) return;
    const rawText = this.inputField.value.trim();
    if (!rawText || this.isTyping || this.submissionInFlight) return;

    this.submissionInFlight = true;
    if (this.sendBtn) {
      this.sendBtn.disabled = true;
      this.sendBtn.setAttribute('aria-busy', 'true');
    }

    try {
      // Clear input
      this.inputField.value = '';
      try {
        sound.playCommsSend();
      } catch (_) {}

      // Add user message
      this.addMessage('user', rawText);
      this.saveSession();

      // Process intake or Q&A
      await this.processConversation(rawText);
    } catch (err) {
      console.error('[ECLIPSE COMMS] Submit error:', err);
      this.showErrorBanner('Communication glitch detected. Please try again.');
    } finally {
      this.submissionInFlight = false;
      this.showTyping(false);
      if (this.sendBtn) {
        this.sendBtn.disabled = false;
        this.sendBtn.removeAttribute('aria-busy');
      }
      if (this.inputField) {
        this.inputField.focus();
      }
    }
  }

  /**
   * ECLIPSE HERO DIRECT COMMS ENGINE
   * 
   * DESIGN CHALLENGE SOLVED HERE:
   * Citizens often ask questions DURING intake ("Who are you?", "Why do you need my age?").
   * 
   * FAILED ATTEMPT 1: Flag-based interruption
   * - Problem: If citizen types fast, flags got out of sync with actual state
   * - Example: User sends Q1 + Answer1 simultaneously → flag logic broke
   * 
   * FAILED ATTEMPT 2: Queue everything
   * - Problem: Over-engineered. Added latency, made code harder to debug
   * 
   * SOLUTION (Current): Parse at intake level
   * - Check if input looks like a question BEFORE state transition
   * - Generate hero response + bridge back to current state
   * - No flags, no queues, no race conditions
   * - Took ~4 hours to arrive at this simple design
   */
  async processConversation(userInput) {
    this.showTyping(true);

    try {
      // Natural conversational pacing (550ms - 800ms)
      await new Promise((res) => setTimeout(res, 620));

      const q = userInput.trim().toLowerCase();

      // 1. Check for Mid-Intake Questions or Inquiries
      if (this.state !== STATES.COMPLETE && this.state !== STATES.FREE_CHAT) {
        // Check for Skip commands first for AGE or EMAIL
        if (this.state === STATES.AGE && this.isSkipCommand(userInput)) {
          this.citizen.age = 'Undisclosed';
          this.state = STATES.LOCATION;
          const reply = `No problem at all, ${this.citizen.name || 'friend'}—I'll calibrate my medical sensors for standard civilian baseline telemetry.\n\nNow, tell me where you are right now. Which city, district, street, or landmark are you at? Give me your exact spot so I can calculate my atmospheric entry vector and drop right to you.`;
          this.addMessage('eclipse', reply);
          this.updateQuickReplies();
          this.updatePlaceholder();
          return;
        }

        if (this.state === STATES.EMAIL && this.isSkipCommand(userInput)) {
          this.citizen.email = 'civilian-priority@sector-grid.local';
          this.state = STATES.GRIEVANCE;
          const reply = `Understood, ${this.citizen.name || 'citizen'}—we won't waste time on email. I've routed your connection through an anonymous priority channel (\`civilian-priority@sector-grid.local\`) so our comms remain encrypted.\n\nNow tell me what's happening. What danger or crisis are you facing down in ${this.citizen.location || 'your sector'}?\n\nWhether it's a cosmic anomaly, syndicate violence, trapped civilians, or anything threatening your safety—don't hold back. Tell me everything. I'm listening.`;
          this.addMessage('eclipse', reply);
          this.updateQuickReplies();
          this.updatePlaceholder();
          return;
        }

        // Check if this is an in-between inquiry or question
        if (this.isQuestionOrInquiry(userInput, this.state)) {
          const heroReply = this.handleFreeChat(userInput);
          if (heroReply) {
            const resumeBridge = this.getIntakeResumePrompt(this.state);
            this.addMessage('eclipse', `${heroReply}\n\n${resumeBridge}`);
            this.updateQuickReplies();
            this.updatePlaceholder();
          }
          return;
        }
      }

      // 2. Normal State Progression
      switch (this.state) {
        case STATES.GREETING_NAME: {
          this.citizen.name = this.extractName(userInput);
          this.state = STATES.AGE;
          const reply = `Good to meet you, ${this.citizen.name}. I've got your signal locked onto my visor.\n\nQuick question: how old are you? I ask so I know who I'm looking out for down there and what kind of evacuation or medical support to prep when I touch down.`;
          this.addMessage('eclipse', reply);
          this.updateQuickReplies();
          this.updatePlaceholder();
          break;
        }

        case STATES.AGE: {
          const parsedAge = parseInt(userInput.replace(/[^0-9]/g, ''), 10);
          if (isNaN(parsedAge) || parsedAge < 3 || parsedAge > 125) {
            const retry = `Comms crackled for a second, ${this.citizen.name || 'friend'}—could you send me your age in numbers (like 24 or 35), or just say 'skip'? I want to make sure my gear and response parameters are calibrated for you.`;
            this.addMessage('eclipse', retry);
            this.updateQuickReplies();
            break;
          }

          this.citizen.age = parsedAge;
          this.state = STATES.LOCATION;
          const reply = `Got it, ${this.citizen.name}—noted.\n\nNow, tell me where you are right now. Which city, district, street, or landmark are you at? Give me your exact spot so I can calculate my atmospheric entry vector and drop right to you.`;
          this.addMessage('eclipse', reply);
          this.updateQuickReplies();
          this.updatePlaceholder();
          break;
        }

        case STATES.LOCATION: {
          this.citizen.location = userInput;
          this.state = STATES.EMAIL;
          const reply = `Locking onto [${this.citizen.location}] now. My telemetry is scanning your grid.\n\nWhat's your email address? I'll send you an encrypted incident tracking link and local shelter coordinates right to your inbox, and make sure my backup team logs your contact in case our comms cut out.`;
          this.addMessage('eclipse', reply);
          this.updateQuickReplies();
          this.updatePlaceholder();
          break;
        }

        case STATES.EMAIL: {
          const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(userInput)) {
            const retry = `Hey ${this.citizen.name || 'friend'}, that didn't look like a valid email. Could you double-check it for me (like name@example.com), or say 'skip' if you don't have one? I want to make sure my shelter updates and tracking packet reach you safely.`;
            this.addMessage('eclipse', retry);
            this.updateQuickReplies();
            break;
          }

          this.citizen.email = userInput;
          this.state = STATES.GRIEVANCE;
          const reply = `Got your email saved, ${this.citizen.name}. You're registered in my active emergency queue.\n\nNow tell me what's happening. What danger or crisis are you facing down in ${this.citizen.location}?\n\nWhether it's a cosmic anomaly, syndicate violence, trapped civilians, or anything threatening your safety—don't hold back. Tell me everything. I'm listening.`;
          this.addMessage('eclipse', reply);
          this.updateQuickReplies();
          this.updatePlaceholder();
          break;
        }

        case STATES.GRIEVANCE: {
          // Prevent accidental double-submit
          if (this.lastSubmittedGrievance === userInput) {
            this.addMessage('eclipse', `I already have this incident logged, ${this.citizen.name || 'citizen'}. Hold tight while I route the deployment.`);
            break;
          }
          this.lastSubmittedGrievance = userInput;

          this.citizen.grievance = userInput;
          this.citizen.incidentId = `INC-KEI-${Math.floor(1000 + Math.random() * 9000)}`;
          this.citizen.timestamp = new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
          });
          this.citizen.status = 'DISPATCH_COMMITTED';
          this.citizen.emailDispatch = 'TRANSMITTING';
          this.state = STATES.COMPLETE;

          // Play Incident Locked Audio Chord safely
          try {
            sound.playIncidentLocked();
          } catch (_) {}

          // Render Incident Dossier Message
          this.addIncidentDossier(this.citizen);

          // Automatically dispatch incident email to developer AND citizen confirmation
          const capturedCitizen = { ...this.citizen };
          sendIncidentEmail(capturedCitizen, this.currentMode).then((result) => {
            this.citizen.emailDispatch = result.success ? 'SENT' : 'LOCAL_LOG';
            this.citizen.emailRecipient = result.recipient;
            this.citizen.citizenConfirmed = result.citizenDelivery?.success === true;
            const relayEl = document.getElementById(`email-relay-${capturedCitizen.incidentId}`);
            if (relayEl) {
              relayEl.className = `dossier-email-relay ${result.success ? 'delivered' : 'failed'} cyber-cut`;
              relayEl.innerHTML = `
                <div class="dossier-relay-row">
                  <span class="relay-check">${result.success ? '&#10003;' : '&#9888;'}</span>
                  <span class="relay-text">HQ DISPATCH: ${this.escapeHtml(result.recipient || 'LOCAL LOG')} [${result.success ? 'DELIVERED' : 'COMMITTED'}]</span>
                </div>
                <div class="dossier-relay-row">
                  <span class="relay-check">${result.citizenDelivery?.success ? '&#10003;' : '&#9888;'}</span>
                  <span class="relay-text">CITIZEN RECEIPT: ${this.escapeHtml(capturedCitizen.email || 'LOCAL CACHE')} [${result.citizenDelivery?.success ? 'DISPATCHED TO INBOX' : 'STORED'}]</span>
                </div>
              `;
            }
            this.saveSession();
          }).catch((error) => {
            this.citizen.emailDispatch = 'LOCAL_LOG';
            console.warn('[ECLIPSE COMMS] Incident dispatch fallback to local log:', error);
            this.saveSession();
          });

          // Immediate Superhero Personal Reassurance
          const reassurance = this.generateReassurance(this.citizen);
          await new Promise((res) => setTimeout(res, 500));
          this.addMessage('eclipse', reassurance);

          this.state = STATES.FREE_CHAT;
          this.updateQuickReplies();
          this.updatePlaceholder();
          break;
        }

        case STATES.COMPLETE:
        case STATES.FREE_CHAT: {
          const reply = this.handleFreeChat(userInput);
          if (reply) {
            this.addMessage('eclipse', reply);
            this.updateQuickReplies();
          }
          break;
        }
      }
    } catch (err) {
      console.error('[ECLIPSE COMMS] Conversation processing error:', err);
      this.addMessage('eclipse', "Comms telemetry encountered momentary interference, citizen. I've stabilized the channel. What's your status?");
    } finally {
      this.showTyping(false);
      this.saveSession();
    }
  }

  isSkipCommand(input) {
    if (!input) return false;
    const q = input.trim().toLowerCase();
    if (q === 'no' || q === 'none') return true;
    const skipTerms = [
      'skip', 'pass', "don't have", "dont have", "don't want", "dont want",
      'prefer not', 'private', 'secret', 'no email', 'no age', 'leave blank'
    ];
    return skipTerms.some((term) => q.includes(term));
  }

  extractName(input) {
    if (!input) return 'Citizen';
    const cleaned = input.trim();
    const match = cleaned.match(/(?:my name is|i am called|i am|i'm|call me|this is|it's|it is)\s+([A-Za-z0-9_\-\.\s]{1,30})/i);
    if (match && match[1]) {
      const extracted = match[1].trim().replace(/[!,;?]+$/, '');
      if (extracted.length > 0) return extracted;
    }
    const simple = cleaned.replace(/[!,;?]+$/, '').trim();
    return simple.slice(0, 30) || 'Citizen';
  }

  isQuestionOrInquiry(input, state) {
    if (!input) return false;
    const q = input.trim().toLowerCase();

    // In GRIEVANCE state, almost anything the user enters is their emergency report/grievance,
    // even if it contains questions (e.g. "Help! Can you save us? There's an anomaly outside!").
    // We only intercept explicit off-topic meta inquiries about hero lore or bot identity.
    if (state === STATES.GRIEVANCE) {
      const grievanceInquiryTerms = [
        'what weapons do you fight with',
        'what weapon',
        'what blade',
        'what sword',
        'who are you',
        'are you real',
        'are you an ai',
        'are you ai',
        'is this an ai',
        'is this a bot',
        'who is this'
      ];
      return grievanceInquiryTerms.some((term) => q.includes(term));
    }

    // 1. Explicit question mark
    if (input.includes('?')) {
      return true;
    }

    // 2. Interrogative or question starters
    const questionStarters = [
      'who', 'what', 'where', 'when', 'why', 'how',
      'can you', 'could you', 'will you', 'would you',
      'are you', 'is it', 'is that', 'do you', 'did you', 'have you',
      'tell me', 'explain', "what's", 'whats', "who's", 'whos', "how's", 'hows'
    ];

    for (const starter of questionStarters) {
      if (q === starter || q.startsWith(starter + ' ') || q.startsWith(starter + '?')) {
        // Exclude statements like "where I am is Shibuya" in LOCATION
        if (state === STATES.LOCATION && (q.startsWith('where i am') || q.startsWith('where we are'))) {
          return false;
        }
        return true;
      }
    }

    // 3. Conversational triggers & meta inquiries
    const conversationalTriggers = [
      'hello', 'hi', 'hey', 'yo', 'sup', 'wait', 'hold on', 'one sec', 'hang on',
      'are you real', 'are you ai', 'is this an ai', 'is this a bot', 'who is this',
      'what is happening', 'what is this', 'what happened', 'whats going on', "what's going on",
      'why do you need', 'why do you want', 'why ask', 'why email', 'why age', 'why location',
      "i don't know", 'idk', 'not sure', 'who am i speaking with', 'what can you do',
      'are you human', 'tell me about yourself'
    ];

    for (const trigger of conversationalTriggers) {
      if (q === trigger || q.startsWith(trigger + ' ') || q.startsWith(trigger + ',') || q.startsWith(trigger + '!')) {
        return true;
      }
    }

    // 4. State-specific non-answer heuristics
    if (state === STATES.AGE) {
      const hasDigits = /\d+/.test(q);
      if (!hasDigits) {
        return true;
      }
    }

    if (state === STATES.EMAIL) {
      if (!q.includes('@')) {
        const queryTerms = ['why', 'safe', 'privacy', 'spam', 'send', 'happen', 'developer', 'who', 'what', 'no email', "don't have"];
        if (queryTerms.some((t) => q.includes(t))) {
          return true;
        }
      }
    }

    return false;
  }

  getIntakeResumePrompt(state) {
    switch (state) {
      case STATES.GREETING_NAME:
        return "By the way, you haven't told me your name yet—who am I speaking with down on the surface?";
      case STATES.AGE:
        return `Now back to you, ${this.citizen.name || 'friend'}—roughly how old are you? Send me your age in numbers (or tell me to skip) so my medical telemetry is calibrated when I land.`;
      case STATES.LOCATION:
        return `To make sure I drop directly onto your coordinates, ${this.citizen.name || 'friend'}: where are you right now? Give me your city, district, or nearest landmark.`;
      case STATES.EMAIL:
        return `Whenever you're ready, ${this.citizen.name || 'friend'}, what email address should I send your encrypted tracking dossier and safe shelter beacons to? (Or say 'skip' if you don't have one).`;
      case STATES.GRIEVANCE:
        return `I'm fully armed and locked onto ${this.citizen.location || 'your sector'}. Now tell me: what danger or crisis are you facing down there? Give me the details so I know what we're up against.`;
      default:
        return "I'm right here with you. What else is on your mind?";
    }
  }

  generateReassurance(citizen) {
    const isTranscendent = this.currentMode === 'transcendent';
    const weaponName = isTranscendent ? 'Nihil Veritas' : 'The Compressed Odachi';
    const eta = citizen.location.toLowerCase().includes('orbit') ? '1.5 seconds' : '4.5 seconds';

    return `Take a deep breath, ${citizen.name}. You are not alone in this fight anymore. I'm on my way.

I've locked your coordinates in ${citizen.location}. 

📡 **Dual Dispatch Verified:**
• **Headquarters Alert:** Transmitted directly to developer headquarters (\`shieldxshield7@gmail.com\`).
• **Citizen Confirmation:** An official incident docket with your tracking number (**${citizen.incidentId}**) and emergency safety instructions has been dispatched directly to your email (**${citizen.email}**). Check your inbox!

My ${weaponName} is primed, and I'm initiating atmospheric entry right now at 0.94c. Estimated time until I breach the cloud layer: ~${eta}.

While I'm closing the distance:
1. Stay low, find reinforced overhead cover, and keep clear of exterior windows.
2. Keep this comms line open. If the situation shifts, message me right here—I see every word on my visor.
3. Hang on. I won't let anything happen to you on my watch.

I'm right here with you. What does it look like around you right now? Or ask me anything if you need to keep calm.`;
  }

  handleFreeChat(input) {
    const q = input.toLowerCase().trim();

    // 0. Reset / New Emergency Report (Must take precedence before generic keywords like 'report' or 'status')
    const isResetQuery = [
      'new report', 'another incident', 'reset', 'start over', 'new emergency',
      'clear', 'another emergency', 'report emergency', 'report another', 'fresh session'
    ].some((t) => q.includes(t));

    if (isResetQuery) {
      this.resetSession();
      return null;
    }

    const name = this.citizen.name || 'friend';
    const loc = this.citizen.location || 'your sector';
    const isTranscendent = this.currentMode === 'transcendent';

    // 1. Why information is needed (Email / Age / Location / Name)
    if (q.includes('why') && (q.includes('email') || q.includes('mail') || q.includes('address'))) {
      return `I ask for your email so my orbital uplink can transmit two critical items directly to your device:\n\n1. **Encrypted Incident Docket**: An official incident record (${this.citizen.incidentId || 'INC-KEI-XXXX'}) with direct dispatch verification.\n2. **Civil Defense Shelter Beacons**: Real-time GPS vectors to hardened subterranean shelters in case ground cellular towers go dark.\n\nYour data stays strictly between us and our emergency response network—no trackers, no spam. And if you prefer not to share it, just say **'skip'** and I'll route you through an anonymous priority channel.`;
    }

    if (q.includes('why') && (q.includes('age') || q.includes('old') || q.includes('years'))) {
      return `I ask for your age because human bodies handle gravimetric pressure and sonic shockwaves very differently, ${name}.\n\nWhen I decelerate from 0.94c, my kinetic dampeners need to form a micro-pressure envelope around civilians. Calibrating that field for an 8-year-old child or a 75-year-old elder requires a much softer deceleration curve than a 25-year-old athlete. If you prefer to keep it private, just say **'skip'** and I'll default to standard civilian safety parameters.`;
    }

    if ((q.includes('why') && (q.includes('location') || q.includes('where') || q.includes('coords'))) || q.includes('track me') || q.includes('track my signal') || q.includes('track my phone')) {
      return `My orbital radar can scan macroscopic thermal blooms and dimensional tears across whole continents, ${name}. But when you're trapped inside a reinforced concrete high-rise, a basement, or a crowded subway station, signal reflection can scatter passive radio pings.\n\nGiving me your exact street, district, or nearest landmark lets me calculate a surgical 0.94c re-entry vector straight to your doorway instead of searching a 20-kilometer radius.`;
    }

    if (q.includes('why') && (q.includes('name') || q.includes('call you') || q.includes('call me'))) {
      return `Because you're a living, breathing person in danger—not an anonymous distress blip on a radar screen, ${name}. When I break through the clouds and land, I want to know who I'm pulling out of the rubble. But if you prefer to use a handle or callsign, that works just as well.`;
    }

    // 2. Hero Station & Drop Location ("Where are you coming from?")
    if (q.includes('where are you') || q.includes('where you coming') || q.includes('where are you coming') || q.includes('where are you dropping') || q.includes('where are you now') || q.includes('where do you drop')) {
      return `Right now I'm stationed in high Earth orbit (exosphere altitude ~420 km), locked into a geosynchronous standby anchor. My orbital radar sweeps the surface grid for gravimetric anomalies and void tears.\n\nWhen a distress ping comes in from ${loc}, I disengage orbital stabilizers and initiate a 0.94c atmospheric dive directly down to your sector.`;
    }

    // 3. Name & Callsign Lore ("Why Eclipse?" / "What does Kei mean?")
    if (q.includes('why eclipse') || q.includes('name eclipse') || q.includes('why are you called eclipse') || q.includes('called eclipse')) {
      return `They started calling me Eclipse because of what happens when I re-enter the atmosphere at 0.94c. My suit's compressed gravimetric bubble bends ambient starlight and sunlight around my chassis—casting a momentary shadow, like a total solar eclipse, right before I touch down.\n\nTo the people on the ground, the sky darkens for a single heartbeat, followed by the sonic crack of deceleration. It means the shadow has arrived to push back the dark.`;
    }

    if (q.includes('what does kei mean') || q.includes('callsign') || q.includes('meaning of kei') || q.includes('why kei')) {
      return `'Kei' (京) is the Japanese kanji for 10 quadrillion—ten to the sixteenth power. In quantum singularity mechanics, that's the magnitude of gravimetric compression required to stabilize an event horizon without collapsing into total entropy.\n\nBack in Sector 04, the divers in my crew started calling me Kei when I was calibrating deep-submersible salvage rigs. After Ground Zero, it became my official tactical callsign.`;
    }

    // 4. AI vs Real Human ("Are you an AI?")
    if (q.includes('are you ai') || q.includes('are you an ai') || q.includes('is this an ai') || q.includes('are you a bot') || q.includes('is this a bot') || q.includes('are you real') || q.includes('are you human') || q.includes('real person') || q.includes('robot')) {
      return `I'm flesh, blood, and stubborn human will, ${name}. Every word you're reading is coming directly from me—Kaelen Mercer—transmitting through a neural comms transceiver from high orbit.\n\nMy tactical codec uses automated diagnostic ciphers to keep our channel encrypted and alert headquarters, but I am very real. I spent years working salvage in the flooded substructures of Neo-Tokyo before the singularity crisis tore the sky open. You're not talking to a synthetic chat algorithm—you're talking to a guy in an orbital flight chassis who is dropping through the atmosphere to make sure you get home safe.`;
    }

    // 3. Speed / Velocity / ETA / Arrival
    if (q.includes('how fast') || q.includes('speed') || q.includes('velocity') || q.includes('eta') || q.includes('when will you') || q.includes('how long') || q.includes('reach me') || q.includes('arrive') || q.includes('drop time') || q.includes('0.94c') || q.includes('light speed')) {
      const dropTime = loc.toLowerCase().includes('orbit') ? '1.5 seconds' : '4.5 seconds';
      return `I'm diving down at roughly **0.94c**—that's about 281,000 kilometers per second. Even from high Earth orbit down through the mesosphere, with my gravimetric bubble shielding against friction, I'll be over ${loc} in about **${dropTime}**.\n\nYou'll hear a double sonic crack when my deceleration thrusters pop through the cloud layer. That's your signal that the perimeter is secured. Hold your position until you hear it.`;
    }

    // 4. Weapons & Armory (Odachi & Nihil Veritas)
    if (q.includes('weapon') || q.includes('sword') || q.includes('blade') || q.includes('odachi') || q.includes('nihil') || q.includes('veritas') || q.includes('scabbard') || q.includes('monofilament') || q.includes('armory') || q.includes('gear')) {
      return `I carry two sovereign blades forged from the singularity crisis:\n\n1. **The Compressed Odachi (Mode 01)**: My relativistic iaido blade. Its monofilament edge folds spacetime along a microscopic boundary, slicing through physical armor, armored mechs, or kinetic energy barriers with zero drag.\n2. **Nihil Veritas (Mode 02)**: The Cosmic World-Stitcher. This blade doesn't draw blood—it mends space-time ruptures and halts collapsing singularities. When dimensional tears threaten to consume a city, Nihil Veritas sutures the fabric of reality back together permanently.`;
    }

    // 5. Modes & Stances (Event Horizon vs Transcendent)
    if (q.includes('mode') || q.includes('form') || q.includes('transcendent') || q.includes('horizon') || q.includes('state') || q.includes('stance') || q.includes('switch') || q.includes('powers') || q.includes('abilities')) {
      if (isTranscendent) {
        return `Right now my systems are locked in **MODE 02: TRANSCENDENT**.\n\nIn this form, my singularity core expands outward, manifesting wings of collapsed starlight. I operate at orbital velocity (11.2 km/s orbital anchoring), wielding **Nihil Veritas** to suture planetary-scale dimensional fractures before they tear the continental crust apart.`;
      } else {
        return `Right now I'm configured in **MODE 01: EVENT HORIZON**.\n\nAll my gravimetric pressure is tightly compressed around my flight chassis, eliminating atmospheric friction and allowing surgical 0.94c relativistic Iaido cuts with the **Compressed Odachi**. It's engineered for rapid-response ground skirmishes, close-quarters combat, and surgical civilian extraction.`;
      }
    }

    // 6. Origin / Backstory / Real Name / Human Past
    if (q.includes('who are you') || q.includes('real name') || q.includes('kaelen') || q.includes('mercer') || q.includes('salvage') || q.includes('diver') || q.includes('backstory') || q.includes('origin') || q.includes('history') || q.includes('human oath') || q.includes('tell me about yourself') || q.includes('past')) {
      return `Before the sky cracked over Neo-Tokyo, I was Kaelen Mercer—an urban salvage diver who knew every alley, submerged conduit, and rooftop in Sector 04.\n\nWhen the dimensional rift tore open at Ground Zero, I threw myself into the collapsing singularity chamber to manually anchor the failing containment seals before the core swallowed the city. I survived, bonded to the event horizon itself. But my human oath remains unbroken: Earth is my home, and I will defend every life upon it with everything I have.`;
    }

    // 7. Rifts / Void / Dimensional Anomalies / Ground Zero
    if (q.includes('rift') || q.includes('void') || q.includes('ground zero') || q.includes('anomaly') || q.includes('anomalies') || q.includes('singularity') || q.includes('monster') || q.includes('creature') || q.includes('tear') || q.includes('portal') || q.includes('what happened')) {
      return `The rifts started when high-energy experiments at Ground Zero ruptured the quantum membrane between dimensions. What's spilling through are entropic void entities and gravimetric tears that consume surrounding matter.\n\nIf you see violet, magenta, or cyan gravitational distortions in the air, **do NOT approach them**. Stay at least 50 meters back and get behind dense concrete or subterranean walls. I can suture those fractures closed with Nihil Veritas once I'm on the scene.`;
    }

    // 8. Suit Technology / Visor / Armor
    if (q.includes('suit') || q.includes('armor') || q.includes('visor') || q.includes('helm') || q.includes('cybernetic') || q.includes('tech') || q.includes('nanotech') || q.includes('wings') || q.includes('gravimetric')) {
      return `My armor is a composite of singularity-crystallized carbon weave and relativistic inertia-dampening mesh.\n\nThe neural visor gives me full-spectrum quantum telemetry—I can see gravitational stress fractures, thermal body heat through six feet of reinforced concrete, and encrypted radio frequencies in real time. The internal gravimetric field ensures that accelerating to 0.94c doesn't crush my human organs into paste.`;
    }

    // 9. Humanity / Pain / Sleep / Food / Daily Life
    if (q.includes('pain') || q.includes('hurt') || q.includes('bleed') || q.includes('die') || q.includes('invincible') || q.includes('immortal')) {
      return `I'm definitely not invincible, ${name}. I feel every kinetic impact, every gravimetric recoil, and every burn from atmospheric entry.\n\nThat pain is essential—it's what reminds me that I'm still human, and it keeps me grounded so I never lose sight of why I'm fighting. I bleed, I bruise, and I push forward anyway.`;
    }

    if (q.includes('sleep') || q.includes('eat') || q.includes('food') || q.includes('ramen') || q.includes('coffee') || q.includes('tired') || q.includes('rest')) {
      return `When you're tearing through the upper atmosphere at 0.94c, you burn through an obscene amount of calories. Nothing hits better after an orbital drop than a steaming bowl of black garlic tonkotsu ramen from a back-alley shop in Neo-Tokyo.\n\nAnd yeah, I sleep—though usually in short 90-minute REM cycles with my comms link locked onto the planetary seismic alarm.`;
    }

    // 10. Survival Instructions & Civilian Advice ("What should I do?")
    if (q.includes('what should i do') || q.includes('what do i do') || q.includes('instruction') || q.includes('advice') || q.includes('survive') || q.includes('safe') || q.includes('shelter') || q.includes('hide') || q.includes('evacuate') || q.includes('escape')) {
      return `Here's what I need you to do right now, ${name}:\n\n1. **Find Reinforced Overhead Cover**: Get beneath an interior concrete beam, a heavy structural doorframe, or a subterranean basement away from exterior glass.\n2. **Stay Low & Stay Silent**: Avoid standing near open streets, rooftops, or windows where gravitational shear or void shrapnel can strike.\n3. **Huddle Together**: If you have family, friends, or coworkers with you, keep them calm and close. Conserve your mobile device battery.\n4. **Listen for the Sonic Pop**: You'll hear my atmospheric deceleration crack right before I hit the ground. When you hear that, know help is already there.`;
    }

    // 11. Fear / Panic / Emotional Reassurance
    if (q.includes('scared') || q.includes('afraid') || q.includes('panic') || q.includes('terrified') || q.includes('help me') || q.includes('save me') || q.includes('please hurry') || q.includes('going to die') || q.includes('crying') || q.includes('shaking')) {
      return `I hear you, ${name}. Take a slow, deep breath with me. In through your nose, hold for two seconds, and breathe out.\n\nFear is an honest human reflex when catastrophe strikes. It means you love life, and that love is what keeps you fighting. But panic clouds your judgment. You reached out, I locked onto your signal, and I am not leaving you to face this alone. I am already descending through the clouds. Hold on just a little longer.`;
    }

    // 12. Allies, Team & Headquarters
    if (q.includes('alone') || q.includes('team') || q.includes('allies') || q.includes('friends') || q.includes('who helps') || q.includes('headquarters') || q.includes('hq') || q.includes('developer') || q.includes('shield')) {
      return `I'm the one who drops into the fire, but I'm never truly alone. Developer headquarters monitors our encrypted relay channel (\`shieldxshield7@gmail.com\`), logging every distress beacon, civil defense alert, and emergency dossier so local emergency medical and shelter teams can mobilize immediately behind me.`;
    }

    // 13. Combat & Enemies ("Can you beat them?")
    if (q.includes('can you beat') || q.includes('can you win') || q.includes('fight') || q.includes('strong enough') || q.includes('enemy') || q.includes('enemies') || q.includes('villain') || q.includes('kill')) {
      return `Whatever is crawling out of that breach obeys the laws of physics—and where conventional physics breaks down, that's where I operate best.\n\nI survived falling into a collapsing black hole and pulled myself out. I have the relativistic speed to outflank them and the blade to cut clean through their defenses. Stay low and stay behind cover, ${name}. I will handle the rest.`;
    }

    // 14. Jokes & Humor
    if (q.includes('joke') || q.includes('funny') || q.includes('laugh') || q.includes('humor')) {
      return `A joke? Alright, here's one from the orbital salvage docks:\n\n*Why did the singularity anomaly refuse to play hide-and-seek?*\n*Because whenever it hid, it took the whole hiding spot with it into the event horizon.*\n\n...Look, I'm an orbital defender, not a stand-up comedian! But if it took your mind off the sirens for three seconds, that's a tactical win in my book.`;
    }

    // 15. Incident Status / Dossier Update
    if (q.includes('status') || q.includes('incident') || q.includes('dossier') || q.includes('update') || q.includes('report') || q.includes('tracking')) {
      if (this.citizen.incidentId) {
        return `I have your incident docket **${this.citizen.incidentId}** pinned right to my visor:\n\n• **Protected Citizen**: ${this.citizen.name} (Age: ${this.citizen.age || 'Logged'})\n• **Target Grid**: ${this.citizen.location}\n• **Status**: PRIORITY ALPHA // HERO INBOUND (0.94c)\n• **Headquarters Alert**: Dispatched to \`shieldxshield7@gmail.com\`\n• **Citizen Confirmation**: Sent to ${this.citizen.email}\n\nComms line is secure. Keep me updated on any changes around you.`;
      } else {
        return `We haven't logged an emergency incident docket yet on this channel, ${name}. If you're in danger, send me your situation and I'll scramble response vectors immediately.`;
      }
    }


    // 17. Gratitude & Goodbyes
    if (q.includes('thank') || q.includes('appreciate') || q.includes('grateful')) {
      return `You don't need to thank me, ${name}. Protecting this city and standing between innocent people and annihilation is why I took this mantle.\n\nStay alert, stay safe, and save your thanks for when we're standing together in the clear.`;
    }

    if (q.includes('bye') || q.includes('goodbye') || q.includes('see ya') || q.includes('signing off')) {
      return `Keep this frequency bookmarked, ${name}. My telemetry will keep scanning your sector. If you hear anything shift or see anomaly spikes, ping me immediately. Stay safe down there.`;
    }

    // 18. Casual Greetings & Check-ins
    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('sup') || q.includes('yo') || q.includes('how are you') || q.includes('good morning') || q.includes('good evening') || q.includes('whats up') || q.includes("what's up")) {
      return `Hey ${name}! Reading your signal loud and clear over the orbital link. Telemetry on ${loc} is active.\n\nHow are things holding up where you are? Let me know if you see any anomalies, or ask me whatever you need to know while I monitor the grid.`;
    }

    // 19. Contextual Smart Fallback (No canned AI error!)
    return `I hear you loud and clear, ${name}. Reading your signal cleanly from ${loc}.\n\nTell me more about what you're seeing down there, ask me about my drop vector, gear, or tactics, or just talk to me to keep steady while I monitor your sector. I'm right here.`;
  }

  addMessage(sender, text) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgObj = {
      type: 'text',
      sender, // 'eclipse' | 'user'
      text,
      time: timestamp
    };
    this.messages.push(msgObj);
    this.renderMessage(msgObj);
    this.scrollToBottom();

    if (sender === 'eclipse') {
      try {
        sound.playCommsMessage();
      } catch (_) {}
      if (!this.isOpen) {
        this.hasUnread = true;
        if (this.unreadBadge) {
          this.unreadBadge.style.display = 'flex';
          this.unreadBadge.textContent = '!';
        }
      }
    }
  }

  addIncidentDossier(citizen) {
    const msgObj = {
      type: 'dossier',
      sender: 'eclipse',
      citizen: { ...citizen },
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.messages.push(msgObj);
    this.renderMessage(msgObj);
    this.scrollToBottom();
  }

  renderMessage(msg) {
    if (!this.messagesContainer) return;

    const row = document.createElement('div');
    row.className = `comms-message-row comms-msg-${msg.sender}`;

    if (msg.type === 'dossier') {
      const rawC = msg.citizen || this.citizen || {};
      const c = {
        incidentId: rawC.incidentId || 'INC-KEI-ARCHIVED',
        name: rawC.name || 'Citizen',
        age: rawC.age != null ? rawC.age : 'Undisclosed',
        location: rawC.location || 'Sector Grid',
        email: rawC.email || 'civilian-priority@sector-grid.local',
        timestamp: rawC.timestamp || msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        grievance: rawC.grievance || 'Priority distress report logged.',
        emailDispatch: rawC.emailDispatch || 'SENT',
        emailRecipient: rawC.emailRecipient || 'shieldxshield7@gmail.com'
      };
      row.innerHTML = `
        <div class="comms-dossier-card cyber-cut">
          <div class="dossier-card-header">
            <div class="dossier-badge-wrap">
              <span class="dossier-live-dot"></span>
              <span class="dossier-title">EMERGENCY INCIDENT DOSSIER</span>
            </div>
            <span class="dossier-id">${c.incidentId}</span>
          </div>

          <div class="dossier-grid">
            <div class="dossier-field">
              <span class="field-label">PROTECTED CITIZEN:</span>
              <span class="field-value">${this.escapeHtml(c.name)} (Age: ${c.age})</span>
            </div>
            <div class="dossier-field">
              <span class="field-label">TARGET SECTOR / COORDS:</span>
              <span class="field-value">${this.escapeHtml(c.location)}</span>
            </div>
            <div class="dossier-field">
              <span class="field-label">CIVILIAN FEED:</span>
              <span class="field-value">${this.escapeHtml(c.email)}</span>
            </div>
            <div class="dossier-field">
              <span class="field-label">TIMESTAMP OF LOG:</span>
              <span class="field-value">${c.timestamp}</span>
            </div>
          </div>

          <div class="dossier-grievance-box">
            <div class="field-label">RECORDED CRISIS / GRIEVANCE:</div>
            <p class="grievance-text">"${this.escapeHtml(c.grievance)}"</p>
          </div>

          <div class="dossier-email-relay ${c.emailDispatch === 'SENT' ? 'delivered' : 'transmitting'} cyber-cut" id="email-relay-${c.incidentId}">
            ${c.emailDispatch === 'SENT' ? `
              <div class="dossier-relay-row">
                <span class="relay-check">&#10003;</span>
                <span class="relay-text">HQ DISPATCH: ${this.escapeHtml(c.emailRecipient || 'DEVELOPER')} [DELIVERED]</span>
              </div>
              <div class="dossier-relay-row">
                <span class="relay-check">&#10003;</span>
                <span class="relay-text">CITIZEN RECEIPT: ${this.escapeHtml(c.email)} [DISPATCHED TO INBOX]</span>
              </div>
            ` : `
              <div class="dossier-relay-row">
                <span class="relay-pulse-dot"></span>
                <span class="relay-text">HQ DISPATCH: TRANSMITTING TO DEVELOPER EMAIL...</span>
              </div>
              <div class="dossier-relay-row">
                <span class="relay-pulse-dot"></span>
                <span class="relay-text">CITIZEN RECEIPT: TRANSMITTING ENCRYPTED DOCKET...</span>
              </div>
            `}
          </div>

          <div class="dossier-footer">
            <div class="dossier-status-pill">
              <span class="dossier-pulse"></span> PRIORITY ALPHA // HERO INBOUND
            </div>
            <div class="dossier-watermark">KAELEN MERCER // 0.94c RADAR LOCK</div>
          </div>
        </div>
      `;
    } else {
      const isHero = msg.sender === 'eclipse';
      const senderLabel = isHero ? 'KAELEN MERCER (KEI // 京)' : (this.citizen.name ? this.citizen.name.toUpperCase() : 'YOU');
      const avatarSrc = this.currentMode === 'transcendent'
        ? './assets/mode-transcendent-action.jpg'
        : './assets/mode-event-horizon-focus.jpg';

      row.innerHTML = `
        ${isHero ? `
          <div class="comms-avatar-badge">
            <img src="${avatarSrc}" alt="Kaelen Mercer" />
          </div>
        ` : ''}
        <div class="comms-bubble cyber-cut">
          <div class="comms-bubble-meta">
            <span class="comms-speaker">${senderLabel}</span>
            <span class="comms-timestamp">${msg.time}</span>
          </div>
          <div class="comms-bubble-text">${this.formatText(msg.text)}</div>
        </div>
      `;
    }

    this.messagesContainer.appendChild(row);
  }

  renderAllMessages() {
    if (!this.messagesContainer) return;
    this.messagesContainer.innerHTML = '';
    
    // Render only last 50 messages for performance
    const toRender = this.messages.slice(-50);
    
    // Show "load more" button if there are older messages
    if (this.messages.length > 50) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'comms-load-more-btn';
      loadMoreBtn.style.cssText = `
        background: transparent;
        border: 1px dashed #8e95a5;
        color: #8e95a5;
        padding: 8px 12px;
        margin: 12px auto;
        display: block;
        font-size: 11px;
        font-family: 'Rajdhani', monospace;
        cursor: pointer;
        border-radius: 2px;
        transition: all 0.2s ease;
      `;
      loadMoreBtn.textContent = `↑ Load ${this.messages.length - 50} earlier messages`;
      loadMoreBtn.addEventListener('mouseenter', () => {
        loadMoreBtn.style.borderColor = '#00e5ff';
        loadMoreBtn.style.color = '#00e5ff';
      });
      loadMoreBtn.addEventListener('mouseleave', () => {
        loadMoreBtn.style.borderColor = '#8e95a5';
        loadMoreBtn.style.color = '#8e95a5';
      });
      loadMoreBtn.addEventListener('click', () => {
        // Render all messages
        this.messagesContainer.innerHTML = '';
        this.messages.forEach((m) => this.renderMessage(m));
        loadMoreBtn.remove();
      });
      this.messagesContainer.appendChild(loadMoreBtn);
    }
    
    toRender.forEach((m) => this.renderMessage(m));
    this.scrollToBottom();
  }

  showTyping(isTyping) {
    this.isTyping = isTyping;
    if (this.typingIndicator) {
      this.typingIndicator.style.display = isTyping ? 'flex' : 'none';
      if (isTyping) {
        this.scrollToBottom();
      }
    }
    const visualizers = document.querySelectorAll('.voice-freq-visualizer, .codec-waveform');
    visualizers.forEach((v) => {
      v.classList.toggle('is-transmitting', isTyping);
    });
  }

  scrollToBottom() {
    if (!this.messagesContainer) return;
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }

  showErrorBanner(message) {
    if (!this.messagesContainer) return;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'comms-error-banner cyber-cut';
    errorDiv.style.cssText = `
      background: rgba(255, 68, 102, 0.15);
      border: 1px solid #ff4466;
      color: #ff4466;
      padding: 10px 12px;
      margin: 8px;
      border-radius: 2px;
      font-size: 12px;
      font-family: 'Rajdhani', monospace;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    errorDiv.innerHTML = `<span>⚠️</span><span>${this.escapeHtml(message)}</span>`;
    this.messagesContainer.appendChild(errorDiv);
    this.scrollToBottom();
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
  }

  updatePlaceholder() {
    if (!this.inputField) return;

    switch (this.state) {
      case STATES.GREETING_NAME:
        this.inputField.placeholder = 'Tell Kaelen your name...';
        break;
      case STATES.AGE:
        this.inputField.placeholder = 'Tell Kaelen your age (e.g. 24)...';
        break;
      case STATES.LOCATION:
        this.inputField.placeholder = 'Tell Kaelen where you are right now...';
        break;
      case STATES.EMAIL:
        this.inputField.placeholder = 'Enter your email so Kaelen can send updates...';
        break;
      case STATES.GRIEVANCE:
        this.inputField.placeholder = "Tell Kaelen what danger you're facing...";
        break;
      case STATES.COMPLETE:
      case STATES.FREE_CHAT:
        this.inputField.placeholder = 'Talk directly with Kaelen...';
        break;
      default:
        this.inputField.placeholder = 'Talk directly with Kaelen...';
    }
  }

  updateQuickReplies() {
    if (!this.quickRepliesContainer) return;
    this.quickRepliesContainer.innerHTML = '';

    let suggestions = [];

    switch (this.state) {
      case STATES.GREETING_NAME:
        suggestions = [
          'Who are you, Kei?',
          'Are you real or an AI?',
          'How fast can you get here?'
        ];
        break;
      case STATES.AGE:
        suggestions = [
          'Why do you need my age?',
          'I prefer to skip',
          '24',
          '35'
        ];
        break;
      case STATES.LOCATION:
        suggestions = [
          'Downtown near Central Station',
          'Neo-Shinjuku Sector 04',
          'Why do you need my location?',
          'Can you track my signal?'
        ];
        break;
      case STATES.EMAIL:
        suggestions = [
          'Why do you need my email?',
          'Is my email secure?',
          'Skip email for now'
        ];
        break;
      case STATES.GRIEVANCE:
        suggestions = [
          'What weapons do you fight with?',
          'Dimensional rift opened in our sector',
          'Monsters attacking civilian shelter',
          'Can you really stop them?'
        ];
        break;
      case STATES.COMPLETE:
      case STATES.FREE_CHAT:
        suggestions = [
          'How fast can you reach me?',
          'Tell me about your blades',
          'Are you human like us?',
          'What should I do right now?',
          'Do you feel pain?',
          'Report another emergency'
        ];
        break;
    }

    if (suggestions.length === 0) {
      this.quickRepliesContainer.style.display = 'none';
      return;
    }

    this.quickRepliesContainer.style.display = 'flex';
    suggestions.forEach((text) => {
      const chip = document.createElement('button');
      chip.className = 'comms-quick-chip cyber-cut';
      chip.textContent = text;
      chip.addEventListener('click', () => {
        try {
          sound.playNavClick();
        } catch (_) {}
        this.inputField.value = text;
        this.handleUserSubmit();
      });
      this.quickRepliesContainer.appendChild(chip);
    });
  }

  formatText(raw) {
    if (!raw) return '';
    let formatted = this.escapeHtml(raw);
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  saveSession() {
    try {
      const data = {
        state: this.state,
        citizen: this.citizen,
        messages: this.messages
      };
      const serialized = JSON.stringify(data);
      
      // Check size before saving (2 chars ≈ 1 byte, 5MB ≈ 5,000,000 chars)
      if (serialized.length > 5000000) {
        console.warn('[ECLIPSE COMMS] Session storage nearing limit, pruning old messages');
        // Keep only latest 50 messages to recover space
        this.messages = this.messages.slice(-50);
        data.messages = this.messages;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('[ECLIPSE COMMS] Storage error:', err.message);
      this.showErrorBanner('Failed to save session: Storage may be full');
    }
  }

  loadSession() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          this.messages = parsed.messages;
          this.state = parsed.state || STATES.GREETING_NAME;
          this.citizen = Object.assign({
            name: '',
            age: null,
            location: '',
            email: '',
            grievance: '',
            incidentId: null,
            timestamp: null,
            status: 'AWAITING_INPUT'
          }, parsed.citizen || {});
        }
      }
    } catch (err) {
      console.warn('[ECLIPSE COMMS] Failed to load session:', err);
    }
  }

  resetSession() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = STATES.GREETING_NAME;
    this.citizen = {
      name: '',
      age: null,
      location: '',
      email: '',
      grievance: '',
      incidentId: null,
      timestamp: null,
      status: 'AWAITING_INPUT'
    };
    this.messages = [];
    this.lastSubmittedGrievance = null;
    this.submissionInFlight = false;
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
    try {
      sound.playToggleSound(false);
    } catch (_) {}
    this.sendInitialGreeting();
  }
}

export const chat = new EclipseChatbot();
