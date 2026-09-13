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

    if (!this.fab || !this.drawer) {
      console.warn('[ECLIPSE COMMS] Chat DOM nodes not found.');
      return;
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
    const headerAvatar = document.getElementById('drawer-header-avatar-img');
    if (headerAvatar) {
      headerAvatar.src = modeKey === 'transcendent'
        ? './assets/mode-transcendent-action.jpg'
        : './assets/mode-event-horizon-focus.jpg';
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
    // Open/Close Comms Drawer
    this.fab.addEventListener('click', () => {
      this.toggleDrawer();
    });

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
      this.sendBtn.addEventListener('click', () => {
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

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDrawer();
      }
    });
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
    sound.playCommsOpen();
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
    sound.playNavClick();
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
    const rawText = this.inputField.value.trim();
    if (!rawText || this.isTyping) return;

    // Clear input
    this.inputField.value = '';
    sound.playCommsSend();

    // Add user message
    this.addMessage('user', rawText);
    this.saveSession();

    // Process intake or Q&A
    await this.processConversation(rawText);
  }

  async processConversation(userInput) {
    this.showTyping(true);

    // Natural conversational pause (550ms - 850ms)
    await new Promise((res) => setTimeout(res, 620));

    switch (this.state) {
      case STATES.GREETING_NAME: {
        this.citizen.name = userInput;
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
          const retry = `Comms crackled for a second, ${this.citizen.name}—could you send me your age in numbers (like 24 or 35)? I want to make sure my gear and response parameters are calibrated for you.`;
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userInput)) {
          const retry = `Hey ${this.citizen.name}, that didn't look like a valid email. Could you double-check it for me (like name@example.com)? I want to make sure my shelter updates and tracking packet reach you safely.`;
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
        this.citizen.grievance = userInput;
        this.citizen.incidentId = `INC-KEI-${Math.floor(1000 + Math.random() * 9000)}`;
        this.citizen.timestamp = new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
        this.citizen.status = 'DISPATCH_COMMITTED';
        this.citizen.emailDispatch = 'TRANSMITTING';
        this.state = STATES.COMPLETE;

        // Play Incident Locked Audio Chord
        sound.playIncidentLocked();

        // Render Incident Dossier Message
        this.addIncidentDossier(this.citizen);

        // Automatically dispatch incident email to developer's personal email
        // Automatically dispatch incident email to developer AND citizen confirmation
        const capturedCitizen = { ...this.citizen };
        sendIncidentEmail(capturedCitizen, this.currentMode).then((result) => {
          this.citizen.emailDispatch = result.success ? 'SENT' : 'LOCAL_LOG';
          this.citizen.emailRecipient = result.recipient;
          this.citizen.citizenConfirmed = result.citizenDelivery?.success || true;
          const relayEl = document.getElementById(`email-relay-${capturedCitizen.incidentId}`);
          if (relayEl) {
            relayEl.className = 'dossier-email-relay delivered cyber-cut';
            relayEl.innerHTML = `
              <div class="dossier-relay-row">
                <span class="relay-check">&#10003;</span>
                <span class="relay-text">HQ DISPATCH: ${this.escapeHtml(result.recipient)} [DELIVERED]</span>
              </div>
              <div class="dossier-relay-row">
                <span class="relay-check">&#10003;</span>
                <span class="relay-text">CITIZEN RECEIPT: ${this.escapeHtml(capturedCitizen.email)} [DISPATCHED TO INBOX]</span>
              </div>
            `;
          }
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
        this.addMessage('eclipse', reply);
        this.updateQuickReplies();
        break;
      }
    }

    this.showTyping(false);
    this.saveSession();
  }

  generateReassurance(citizen) {
    const isTranscendent = this.currentMode === 'transcendent';
    const weaponName = isTranscendent ? 'Nihil Veritas' : 'The Muramasa Odachi';
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
    const q = input.toLowerCase();

    // Speed / Arrival questions
    if (q.includes('how fast') || q.includes('speed') || q.includes('eta') || q.includes('when') || q.includes('reach') || q.includes('arrive')) {
      return `I'm diving down at roughly **0.94c**—that's about 281,000 kilometers per second. Even from high Earth orbit down through the mesosphere, with my gravimetric bubble shielding against friction, I'll be over ${this.citizen.location || 'your sector'} in less than five seconds. Stay down and hold on.`;
    }

    // Weapons / Sword questions
    if (q.includes('weapon') || q.includes('sword') || q.includes('blade') || q.includes('odachi') || q.includes('nihil')) {
      return `I carry two sovereign blades forged from the singularity crisis:\n\n1. **The Muramasa Odachi (Mode 01)**: My relativistic katana. It folds space right along the edge, letting me slice through physical armor or kinetic energy barriers with zero drag.\n2. **Nihil Veritas (Mode 02)**: The Cosmic World-Stitcher. It doesn't cut flesh—it mends space-time ruptures and halts collapsing anomalies. If what you're dealing with is a void tear, this blade will seal it permanently.`;
    }

    // Mode questions
    if (q.includes('mode') || q.includes('form') || q.includes('state') || q.includes('transcendent') || q.includes('horizon')) {
      if (this.currentMode === 'transcendent') {
        return `Right now I'm operating in **MODE 02: TRANSCENDENT**. In this state, my cosmic wings unfurl and my singularity core expands to anchor reality itself against extinction-level hazards. I wield Nihil Veritas to suture spatial ruptures across entire continents.`;
      } else {
        return `Right now I'm operating in **MODE 01: EVENT HORIZON**. All my gravimetric pressure is compressed to eliminate atmospheric drag. It gives me pinpoint hyper-velocity speed and razor-sharp Iaido cuts with the Muramasa Odachi. Fast, surgical, and lethal against ground threats.`;
      }
    }

    // Origin / Who are you / Real name
    if (q.includes('who are you') || q.includes('origin') || q.includes('real name') || q.includes('kaelen') || q.includes('human') || q.includes('scientist')) {
      return `Before the Geneva-Exosphere Research Array catastrophe, I was Dr. Kaelen Mercer—an astrophysicist studying rogue micro-singularities. When our containment core ruptured, I chose to manually stabilize the exosphere anchor to protect the continents below. The gravitational singularity fused with my biology. I came back changed, but my human oath remains unbroken: Earth is my home, and I will defend every life upon it.`;
    }

    // What to do / Safety / Survival instructions
    if (q.includes('what should i do') || q.includes('instructions') || q.includes('safe') || q.includes('advice') || q.includes('survive')) {
      return `Here's what I need you to do right now, ${this.citizen.name || 'friend'}:\n\n1. **Find reinforced overhead cover**: Get under a concrete beam, heavy doorframe, or sturdy subterranean room away from exterior glass.\n2. **Stay low**: Avoid standing near open streets, rooftops, or windows.\n3. **Huddle together**: If you have family, neighbors, or colleagues with you, keep them quiet and calm.\n4. **Listen for the sonic crack**: You'll hear my atmospheric deceleration crack a second before I touch down. That's when you know the area is secure.`;
    }

    // Fear / Panic / Emotional reassurance
    if (q.includes('scared') || q.includes('afraid') || q.includes('panic') || q.includes('help me') || q.includes('terrified') || q.includes('save me')) {
      return `I know you're terrified, ${this.citizen.name || 'friend'}. Look—fear is an honest human reflex when crisis strikes. It just means you want to live, and that's what makes you strong. But panic takes your legs away. Take three slow, deep breaths. I am almost through the upper clouds. You reached out, I answered, and I am not letting you face this alone.`;
    }

    // Gratitude
    if (q.includes('thank') || q.includes('appreciate') || q.includes('grateful')) {
      return `You don't need to thank me, ${this.citizen.name || 'friend'}. Protecting this world and standing between innocent people and annihilation is why I took this mantle. Stay safe, stay low, and save your thanks for when we're standing in the clear together.`;
    }

    // Status / Incident file update
    if (q.includes('status') || q.includes('incident') || q.includes('dossier') || q.includes('update') || q.includes('report')) {
      if (this.citizen.incidentId) {
        return `I've got your incident **${this.citizen.incidentId}** pinned right to my visor:\n• Name: ${this.citizen.name} (Age: ${this.citizen.age})\n• Coordinates: ${this.citizen.location}\n• Status: PRIORITY ALPHA // HERO INBOUND\n• Dispatch: Logged to Developer Response Grid\n\nIf you see any changes or the threat moves, message me right here.`;
      } else {
        return `We haven't logged an emergency incident yet on this frequency. If you're in danger, tell me what's happening and I'll scramble a response immediately.`;
      }
    }

    // Reset / New report
    if (q.includes('new report') || q.includes('another incident') || q.includes('reset') || q.includes('new emergency')) {
      this.state = STATES.GREETING_NAME;
      return `Understood. Opening a fresh distress link. Who am I speaking with for this new dispatch? Tell me your name or codename.`;
    }

    // General conversation fallback
    return `I hear you, ${this.citizen.name || 'friend'}. I'm keeping my comms open with you while tracking ${this.citizen.location || 'your coordinates'}.\n\nTell me more about what you're seeing down there, ask me about my gear or tactics, or just talk to me to keep your nerves steady until I touch down.`;
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
      sound.playCommsMessage();
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
      const c = msg.citizen;
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
    this.messages.forEach((m) => this.renderMessage(m));
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
  }

  scrollToBottom() {
    if (!this.messagesContainer) return;
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
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
        // No pre-filled names - citizen enters their own name
        suggestions = [];
        break;
      case STATES.AGE:
        // No pre-filled age - citizen enters their own age
        suggestions = [];
        break;
      case STATES.LOCATION:
        // Location suggestions to help citizen quickly tag their sector
        suggestions = [
          'Downtown near the subway station',
          'Neo-Shinjuku Sector 04',
          'Pacific Coast highline district',
          'Geneva Research Complex'
        ];
        break;
      case STATES.EMAIL:
        // No suggested emails - citizen enters their own valid email
        suggestions = [];
        break;
      case STATES.GRIEVANCE:
        // No canned grievances - citizen describes their real situation
        suggestions = [];
        break;
      case STATES.COMPLETE:
      case STATES.FREE_CHAT:
        suggestions = [
          'How fast can you reach me?',
          'What should I do right now?',
          'Tell me about your blades',
          'Are you human like us?',
          "I'm really scared",
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
        sound.playNavClick();
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
    if (!str) return '';
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('[ECLIPSE COMMS] Failed to save session:', err);
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
          this.citizen = parsed.citizen || this.citizen;
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
    if (this.messagesContainer) {
      this.messagesContainer.innerHTML = '';
    }
    sound.playToggleSound(false);
    this.sendInitialGreeting();
  }
}

export const chat = new EclipseChatbot();
