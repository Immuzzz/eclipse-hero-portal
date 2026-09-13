import { defineConfig } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config();

function incidentEmailDispatcherPlugin() {
  return {
    name: 'incident-email-dispatcher',
    configureServer(server) {
      server.middlewares.use('/api/send-incident-email', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next();
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const { citizen, activeMode, userAgent } = payload;

            if (!citizen || !citizen.name || !citizen.grievance) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Missing required citizen intake details' }));
            }

            dotenv.config({ override: true });
            const developerEmail = process.env.DEVELOPER_EMAIL || 'shieldxshield7@gmail.com';
            const incidentId = citizen.incidentId || `INC-KEI-${Math.floor(1000 + Math.random() * 9000)}`;
            const timestamp = citizen.timestamp || new Date().toLocaleString();
            const modeLabel = (activeMode === 'transcendent')
              ? 'MODE 02: TRANSCENDENT (COSMIC SAVIOR)'
              : 'MODE 01: EVENT HORIZON (RELATIVISTIC DUELIST)';

            // 1. Compose Plaintext Email
            const textContent = `
================================================================================
KEI (京) TACTICAL ALERT // CITIZEN INCIDENT DOSSIER
================================================================================

INCIDENT ID: ${incidentId}
PRIORITY:    PRIORITY ALPHA // TACTICAL DISPATCH COMMITTED
LOGGED AT:   ${timestamp}
ACTIVE MODE: ${modeLabel}

--------------------------------------------------------------------------------
CITIZEN IDENTITY:
--------------------------------------------------------------------------------
Name:             ${citizen.name}
Age:              ${citizen.age || 'Unspecified'}
Location/Coords:  ${citizen.location}
Contact Email:    ${citizen.email}

--------------------------------------------------------------------------------
RECORDED GRIEVANCE / THREAT:
--------------------------------------------------------------------------------
"${citizen.grievance}"

--------------------------------------------------------------------------------
TELEMETRY DISPATCH:
--------------------------------------------------------------------------------
Radar Vector:     0.94c Slipstream Atmospheric Entry
Client Agent:     ${userAgent || req.headers['user-agent'] || 'Unknown Terminal'}
Target Recipient: ${developerEmail}

================================================================================
Automatic dispatch triggered by KEI (京) Tactical Comms Subsystem.
================================================================================
            `.trim();

            // 2. Compose High-Impact Cyberpunk HTML Email
            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>[KEI (京) ALERT] Incident ${incidentId}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #06050b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #eceff4; }
    .wrapper { max-width: 640px; margin: 24px auto; background-color: #0d0b18; border: 2px solid #00e5ff; box-shadow: 0 0 30px rgba(0, 229, 255, 0.25); border-radius: 4px; overflow: hidden; }
    .header { background: linear-gradient(90deg, #ff2a6d, #9d00ff, #00e5ff); padding: 3px 0 0 0; }
    .header-inner { background: #080612; padding: 20px 24px; border-bottom: 1px solid rgba(0, 229, 255, 0.3); }
    .badge { display: inline-block; padding: 4px 10px; background: rgba(255, 42, 109, 0.2); border: 1px solid #ff2a6d; color: #ff2a6d; font-family: monospace; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; border-radius: 2px; }
    .title { margin: 12px 0 4px 0; font-size: 22px; font-weight: 800; letter-spacing: 0.05em; color: #ffffff; }
    .subtitle { margin: 0; font-family: monospace; font-size: 13px; color: #00e5ff; letter-spacing: 0.08em; }
    .body-content { padding: 24px; }
    .section-label { font-family: monospace; font-size: 11px; font-weight: bold; color: #8892b0; letter-spacing: 0.1em; margin-bottom: 10px; text-transform: uppercase; }
    .grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); }
    .grid td { padding: 10px 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; }
    .grid-label { color: #8892b0; font-family: monospace; width: 35%; }
    .grid-val { color: #ffffff; font-weight: 600; }
    .grievance-box { background: rgba(255, 42, 109, 0.08); border-left: 4px solid #ff2a6d; border-top: 1px solid rgba(255, 42, 109, 0.2); border-bottom: 1px solid rgba(255, 42, 109, 0.2); border-right: 1px solid rgba(255, 42, 109, 0.2); padding: 16px; margin: 16px 0 24px 0; border-radius: 0 4px 4px 0; }
    .grievance-text { margin: 0; font-size: 15px; line-height: 1.5; color: #ffffff; font-style: italic; }
    .status-bar { background: rgba(0, 255, 102, 0.1); border: 1px solid #00ff66; padding: 10px 14px; border-radius: 2px; font-family: monospace; font-size: 12px; color: #00ff66; font-weight: bold; display: flex; justify-content: space-between; }
    .footer { background: #06050b; padding: 16px 24px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-family: monospace; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-inner">
        <span class="badge">PRIORITY ALPHA DISPATCH</span>
        <h1 class="title">KEI (京) TACTICAL ALERT // CITIZEN GRIEVANCE</h1>
        <p class="subtitle">INCIDENT ID: ${incidentId} &bull; ${modeLabel}</p>
      </div>
    </div>

    <div class="body-content">
      <div class="section-label">// CITIZEN PROFILE & COORDINATES</div>
      <table class="grid">
        <tr>
          <td class="grid-label">CITIZEN NAME</td>
          <td class="grid-val">${escapeHtml(citizen.name)}</td>
        </tr>
        <tr>
          <td class="grid-label">AGE / TRIAGE INDEX</td>
          <td class="grid-val">${citizen.age || 'Unspecified'}</td>
        </tr>
        <tr>
          <td class="grid-label">SECTOR / COORDINATES</td>
          <td class="grid-val" style="color:#00e5ff;">${escapeHtml(citizen.location)}</td>
        </tr>
        <tr>
          <td class="grid-label">CONTACT EMAIL</td>
          <td class="grid-val"><a href="mailto:${escapeHtml(citizen.email)}" style="color:#ffd000; text-decoration:none;">${escapeHtml(citizen.email)}</a></td>
        </tr>
        <tr>
          <td class="grid-label">DISPATCH TIMESTAMP</td>
          <td class="grid-val">${timestamp}</td>
        </tr>
      </table>

      <div class="section-label">// SUBMITTED THREAT / GRIEVANCE</div>
      <div class="grievance-box">
        <p class="grievance-text">"${escapeHtml(citizen.grievance)}"</p>
      </div>

      <div class="status-bar">
        <span>STATUS: DISPATCH COMMITTED</span>
        <span>RADAR: 0.94c SLIPSTREAM LOCK</span>
      </div>
    </div>

    <div class="footer">
      <div>DISPATCH RECIPIENT: ${developerEmail}</div>
      <div style="margin-top:4px;">AUTOMATIC TRANSMISSION // ECLIPSE EXOSPHERE RADAR RELAY</div>
    </div>
  </div>
</body>
</html>
            `.trim();

            // 3. Save local copy in dispatches/ archive for auditing and local preview
            const dispatchesDir = path.resolve(process.cwd(), 'dispatches');
            if (!fs.existsSync(dispatchesDir)) {
              fs.mkdirSync(dispatchesDir, { recursive: true });
            }

            const jsonFile = path.join(dispatchesDir, `incident-${incidentId}.json`);
            const htmlFile = path.join(dispatchesDir, `incident-${incidentId}.html`);

            fs.writeFileSync(
              jsonFile,
              JSON.stringify(
                {
                  incidentId,
                  developerEmail,
                  timestamp,
                  activeMode,
                  citizen,
                  userAgent: userAgent || req.headers['user-agent']
                },
                null,
                2
              ),
              'utf-8'
            );

            fs.writeFileSync(htmlFile, htmlContent, 'utf-8');

            console.log(`\n================================================================================`);
            console.log(`[ECLIPSE DISPATCH] NEW CITIZEN GRIEVANCE RECEIVED & TRANSMITTED`);
            console.log(`================================================================================`);
            console.log(`>> Incident ID:     ${incidentId}`);
            console.log(`>> Citizen:         ${citizen.name} (Age: ${citizen.age})`);
            console.log(`>> Sector/Grid:     ${citizen.location}`);
            console.log(`>> Citizen Email:   ${citizen.email}`);
            console.log(`>> Target Dev Mail: ${developerEmail}`);
            console.log(`>> Grievance:       "${citizen.grievance}"`);
            console.log(`>> Local Archive:   ${htmlFile}`);
            console.log(`================================================================================\n`);

            let sendMethod = 'LOCAL_ARCHIVE_PREVIEW';

            // 4. If SMTP credentials are provided in .env, send real email via nodemailer
            if (process.env.SMTP_USER && process.env.SMTP_PASS) {
              try {
                const transporter = nodemailer.createTransport({
                  host: process.env.SMTP_HOST || 'smtp.gmail.com',
                  port: Number(process.env.SMTP_PORT) || 465,
                  secure: process.env.SMTP_SECURE === 'true',
                  auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                  }
                });

                const info = await transporter.sendMail({
                  from: `"KEI (京) Tactical Dispatch" <${process.env.SMTP_USER}>`,
                  to: developerEmail,
                  replyTo: citizen.email,
                  subject: `[KEI (京) ALERT] Priority Incident #${incidentId} Logged — ${citizen.location}`,
                  text: textContent,
                  html: htmlContent
                });

                // Send confirmation receipt to citizen
                if (citizen.email && citizen.email.includes('@')) {
                  try {
                    await transporter.sendMail({
                      from: `"Dr. Kaelen Mercer (KEI // 京)" <${process.env.SMTP_USER}>`,
                      to: citizen.email,
                      replyTo: developerEmail,
                      subject: `[KEI (京) CONFIRMATION] Incident #${incidentId} Logged — Stand By`,
                      text: `Greetings ${citizen.name},\n\nYour emergency distress beacon (Incident #${incidentId}) has been successfully received by Dr. Kaelen Mercer (KEI // 京).\n\nStatus: PRIORITY ALPHA // HERO INBOUND AT 0.94c\nETA: ~4.5 seconds\n\nStay low, take reinforced cover, and await contact.\n\n— KEI (京) Tactical Dispatch`,
                      html: htmlContent
                    });
                    console.log(`[KEI DISPATCH] SMTP confirmation dispatched to citizen: ${citizen.email}`);
                  } catch (citErr) {
                    console.warn(`[KEI DISPATCH] Citizen SMTP send note:`, citErr.message);
                  }
                }

                console.log(`[KEI DISPATCH] SMTP Email dispatched successfully: ${info.messageId}`);
                sendMethod = 'LIVE_SMTP_DUAL_TARGET';
              } catch (smtpErr) {
                console.error(`[KEI DISPATCH] SMTP send failed, fell back to local archive:`, smtpErr.message);
                sendMethod = 'FALLBACK_LOCAL_ARCHIVE';
              }
            } else {
              // Also relay to developer email and citizen confirmation via FormSubmit gateway
              try {
                const fsRes = await fetch(`https://formsubmit.co/ajax/${developerEmail}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Referer: 'http://localhost:5173/'
                  },
                  body: JSON.stringify({
                    _subject: `[KEI (京) ALERT] Priority Incident #${incidentId} — ${citizen.location}`,
                    _template: 'table',
                    _captcha: 'false',
                    _replyto: citizen.email,
                    _autoresponse: `Greetings ${citizen.name},\n\nYour distress beacon (Incident #${incidentId}) has been locked onto Dr. Kaelen Mercer's (KEI // 京) visor. Emergency response protocols have been activated for ${citizen.location}.\n\nSTATUS: HERO INBOUND AT 0.94c\nETA: ~4.5 SECONDS\n\n— Dr. Kaelen Mercer // KEI (京) Planetary Defense`,
                    email: citizen.email,
                    'Incident ID': incidentId,
                    'Citizen Name': citizen.name,
                    'Age / Priority': citizen.age || 'Unspecified',
                    'Location / Coordinates': citizen.location,
                    'Civilian Email': citizen.email,
                    'Submitted Grievance / Request': citizen.grievance,
                    'Operational Mode': modeLabel,
                    'Logged At': timestamp,
                    'Radar Vector': '0.94c Slipstream Atmospheric Entry Lock'
                  })
                });
                if (fsRes.ok) {
                  const fsData = await fsRes.json();
                  if (fsData.success === 'true' || fsData.message?.includes('Activation') || fsData.success === true) {
                    sendMethod = 'FORMSUBMIT_RELAY_DUAL';
                    console.log(`[KEI DISPATCH] FormSubmit relay triggered for: ${developerEmail} and autoresponse to ${citizen.email}`);
                  }
                }
              } catch (fsErr) {
                console.warn('[KEI DISPATCH] FormSubmit relay attempt:', fsErr.message);
              }

              // Relay direct citizen confirmation receipt
              if (citizen.email && citizen.email.includes('@')) {
                try {
                  await fetch(`https://formsubmit.co/ajax/${citizen.email}`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Accept: 'application/json',
                      Referer: 'http://localhost:5173/'
                    },
                    body: JSON.stringify({
                      _subject: `[KEI (京) RECEIPT] Incident #${incidentId} Verified — Hold Your Position`,
                      _template: 'table',
                      _captcha: 'false',
                      _replyto: developerEmail,
                      'Incident ID': incidentId,
                      'Citizen Name': citizen.name,
                      'Sector Coordinates': citizen.location,
                      'Your Grievance': citizen.grievance,
                      'Hero Status': 'INBOUND AT 0.94c',
                      'ETA': '~4.5s',
                      'Directives': 'Take interior overhead cover. Avoid windows. Maintain comms open.',
                      'Headquarters': developerEmail
                    })
                  });
                } catch (citFsErr) {
                  console.warn('[ECLIPSE DISPATCH] Citizen FormSubmit relay note:', citFsErr.message);
                }
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                incidentId,
                recipient: developerEmail,
                method: sendMethod,
                archiveFile: `dispatches/incident-${incidentId}.html`,
                timestamp
              })
            );
          } catch (err) {
            console.error('[ECLIPSE DISPATCH] Error handling incident dispatch:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default defineConfig({
  base: './',
  plugins: [incidentEmailDispatcherPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        modes: path.resolve(__dirname, 'modes.html'),
        armory: path.resolve(__dirname, 'armory.html'),
        origin: path.resolve(__dirname, 'origin.html'),
        simulator: path.resolve(__dirname, 'simulator.html'),
        vault: path.resolve(__dirname, 'vault.html'),
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    cors: true,
    watch: {
      ignored: ['**/dispatches/**', '**/.env*']
    }
  }
});
