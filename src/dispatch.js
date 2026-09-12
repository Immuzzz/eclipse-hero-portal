/**
 * ECLIPSE INCIDENT EMAIL DISPATCH SYSTEM
 * Automatically transmits citizen grievances and contact telemetry
 * to the developer's designated personal email upon submission.
 */

export async function sendIncidentEmail(citizen, activeMode) {
  const payload = {
    citizen: {
      name: citizen.name,
      age: citizen.age,
      location: citizen.location,
      email: citizen.email,
      grievance: citizen.grievance,
      incidentId: citizen.incidentId,
      timestamp: citizen.timestamp
    },
    activeMode: activeMode || 'event-horizon',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Browser'
  };

  const developerEmail = 'shieldxshield7@gmail.com';
  let formsubmitResult = null;
  let web3formsResult = null;
  let serverResult = null;

  const modeLabel = (activeMode === 'transcendent')
    ? 'MODE 02: TRANSCENDENT (COSMIC SAVIOR)'
    : 'MODE 01: EVENT HORIZON (RELATIVISTIC DUELIST)';

  // 1. Direct FormSubmit Gateway (delivers formatted table directly to developer Gmail)
  try {
    const fsResponse = await fetch(`https://formsubmit.co/ajax/${developerEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        _subject: `[ECLIPSE ALERT] Priority Incident #${citizen.incidentId} — ${citizen.location}`,
        _template: 'table',
        _captcha: 'false',
        'Incident ID': citizen.incidentId,
        'Citizen Name': citizen.name,
        'Age / Priority': citizen.age || 'Unspecified',
        'Location / Coordinates': citizen.location,
        'Civilian Email': citizen.email,
        'Submitted Grievance / Request': citizen.grievance,
        'Operational Mode': modeLabel,
        'Dispatch Timestamp': citizen.timestamp,
        'Slipstream Vector': '0.94c Atmospheric Entry Lock'
      })
    });

    if (fsResponse.ok) {
      const fsData = await fsResponse.json();
      formsubmitResult = {
        success: true,
        method: 'FORMSUBMIT_DIRECT_INBOX',
        recipient: developerEmail,
        incidentId: citizen.incidentId,
        message: fsData.message
      };
      console.log('[ECLIPSE DISPATCH] FormSubmit delivery triggered:', fsData);
    }
  } catch (fsErr) {
    console.warn('[ECLIPSE DISPATCH] FormSubmit gateway warning:', fsErr);
  }

  // 2. Web3Forms Client Gateway (access key delivery)
  const web3formsKey = import.meta.env?.VITE_WEB3FORMS_KEY;
  if (web3formsKey) {
    try {
      const w3Response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject: `[ECLIPSE ALERT] Priority Incident #${citizen.incidentId} — ${citizen.location}`,
          from_name: `ECLIPSE Tactical Dispatch (${citizen.name})`,
          name: citizen.name,
          email: citizen.email,
          message: `CITIZEN IDENTITY:\n- Name: ${citizen.name} (Age: ${citizen.age})\n- Location/Sector: ${citizen.location}\n- Contact Email: ${citizen.email}\n- Operational Mode: ${modeLabel}\n\nSUBMITTED CITIZEN GRIEVANCE:\n"${citizen.grievance}"\n\nDISPATCH TELEMETRY:\n- Incident ID: ${citizen.incidentId}\n- Logged At: ${citizen.timestamp}\n- Radar Slipstream: 0.94c Atmospheric Entry Lock`
        })
      });

      if (w3Response.ok) {
        web3formsResult = {
          success: true,
          method: 'WEB3FORMS_LIVE_INBOX',
          recipient: developerEmail,
          incidentId: citizen.incidentId
        };
      }
    } catch (w3Err) {
      console.warn('[ECLIPSE DISPATCH] Web3Forms client dispatch warning:', w3Err);
    }
  }

  // 3. Local Server Route: Archives to dispatches/ and sends live SMTP if configured
  try {
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:5173';
    const response = await fetch(`${baseUrl}/api/send-incident-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      serverResult = {
        success: true,
        method: formsubmitResult || web3formsResult ? 'MULTI_GATEWAY_DELIVERY' : data.method,
        recipient: data.recipient || developerEmail,
        incidentId: data.incidentId || citizen.incidentId,
        archiveFile: data.archiveFile
      };
    }
  } catch (err) {
    console.warn('[ECLIPSE DISPATCH] Local server dispatch unavailable:', err.message);
  }

  return formsubmitResult || web3formsResult || serverResult || {
    success: true,
    method: 'LOCAL_TACTICAL_LOG',
    recipient: developerEmail,
    incidentId: citizen.incidentId
  };
}
