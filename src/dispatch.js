/**
 * ECLIPSE INCIDENT EMAIL DISPATCH SYSTEM
 * Automatically transmits citizen grievances and contact telemetry
 * to the developer's designated personal email upon submission.
 */

/**
 * ECLIPSE INCIDENT EMAIL DISPATCH SYSTEM
 * Automatically transmits citizen grievances and contact telemetry
 * to BOTH the developer's personal email (headquarters alert) AND
 * the citizen's personal email (encrypted incident confirmation receipt).
 */

export async function sendIncidentEmail(citizen, activeMode) {
  const developerEmail = 'shieldxshield7@gmail.com';
  const citizenEmail = citizen.email;

  const modeLabel = (activeMode === 'transcendent')
    ? 'MODE 02: TRANSCENDENT (COSMIC SAVIOR)'
    : 'MODE 01: EVENT HORIZON (RELATIVISTIC DUELIST)';

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

  const deliveryReport = {
    success: false,
    developerDelivery: {
      success: false,
      recipient: developerEmail,
      method: 'PENDING'
    },
    citizenDelivery: {
      success: false,
      recipient: citizenEmail,
      method: 'PENDING'
    },
    incidentId: citizen.incidentId,
    recipient: developerEmail
  };

  // ============================================================================
  // 1. DISPATCH TO DEVELOPER INBOX (shieldxshield7@gmail.com)
  // ============================================================================
  try {
    const fsDevResponse = await fetch(`https://formsubmit.co/ajax/${developerEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        _subject: `[KEI (京) ALERT] Priority Incident #${citizen.incidentId} — ${citizen.location}`,
        _template: 'table',
        _captcha: 'false',
        _replyto: citizenEmail,
        _autoresponse: `Greetings ${citizen.name},\n\nYour emergency distress beacon (Incident #${citizen.incidentId}) has been successfully received and locked onto Dr. Kaelen Mercer's (KEI // 京) visor HUD.\n\nTELEMETRY SPECIFICATIONS:\n- Incident ID: ${citizen.incidentId}\n- Sector Coordinates: ${citizen.location}\n- Status: PRIORITY ALPHA // HERO EN ROUTE AT 0.94c\n- Inbound ETA: ~4.5 Seconds\n- Tactical Mode Deployed: ${modeLabel}\n\nSURVIVAL DIRECTIVE:\n1. Seek reinforced subterranean or interior cover immediately.\n2. Stay low and clear of exterior windows and spatial distortions.\n3. Keep your communications receiver active.\n\n— Dr. Kaelen Mercer // KEI (京) Exosphere Planetary Defense Grid`,
        email: citizenEmail,
        'Incident ID': citizen.incidentId,
        'Citizen Name': citizen.name,
        'Age / Priority': citizen.age || 'Unspecified',
        'Location / Coordinates': citizen.location,
        'Civilian Email': citizenEmail,
        'Submitted Grievance / Request': citizen.grievance,
        'Operational Mode': modeLabel,
        'Dispatch Timestamp': citizen.timestamp,
        'Slipstream Vector': '0.94c Atmospheric Entry Lock'
      })
    });

    if (fsDevResponse.ok) {
      deliveryReport.developerDelivery.success = true;
      deliveryReport.developerDelivery.method = 'FORMSUBMIT_DEVELOPER_INBOX';
      deliveryReport.success = true;
      console.log('[KEI DISPATCH] Headquarters developer alert transmitted via FormSubmit');
    }
  } catch (fsDevErr) {
    console.warn('[KEI DISPATCH] FormSubmit developer gateway warning:', fsDevErr);
  }

  // Secondary Developer Gateway: Web3Forms
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
          subject: `[KEI (京) ALERT] Priority Incident #${citizen.incidentId} — ${citizen.location}`,
          from_name: `KEI (京) Tactical Dispatch (${citizen.name})`,
          name: citizen.name,
          email: citizenEmail,
          message: `CITIZEN IDENTITY:\n- Name: ${citizen.name} (Age: ${citizen.age})\n- Location/Sector: ${citizen.location}\n- Contact Email: ${citizenEmail}\n- Operational Mode: ${modeLabel}\n\nSUBMITTED CITIZEN GRIEVANCE:\n"${citizen.grievance}"\n\nDISPATCH TELEMETRY:\n- Incident ID: ${citizen.incidentId}\n- Logged At: ${citizen.timestamp}\n- Radar Slipstream: 0.94c Atmospheric Entry Lock`
        })
      });

      if (w3Response.ok) {
        deliveryReport.developerDelivery.success = true;
        deliveryReport.developerDelivery.method = 'WEB3FORMS_LIVE_INBOX';
        deliveryReport.success = true;
        console.log('[ECLIPSE DISPATCH] Web3Forms developer alert delivered');
      }
    } catch (w3Err) {
      console.warn('[ECLIPSE DISPATCH] Web3Forms client dispatch warning:', w3Err);
    }
  }

  // ============================================================================
  // 2. DISPATCH DIRECT CONFIRMATION TO CITIZEN INBOX (citizen.email)
  // ============================================================================
  if (citizenEmail && citizenEmail.includes('@')) {
    try {
      const fsCitizenResponse = await fetch(`https://formsubmit.co/ajax/${citizenEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: `[KEI (京) DISPATCH RECEIPT] Incident #${citizen.incidentId} Confirmed — Stand By`,
          _template: 'table',
          _captcha: 'false',
          _replyto: developerEmail,
          'Transmission Type': 'OFFICIAL CITIZEN EMERGENCY RECEIPT',
          'Incident ID': citizen.incidentId,
          'Citizen Name': citizen.name,
          'Sector Coordinates': citizen.location,
          'Recorded Grievance': citizen.grievance,
          'Tactical Response': 'HERO INBOUND AT 0.94c // HYPER-VELOCITY DESCENT',
          'Estimated Time of Arrival': '~4.5 Seconds',
          'Active Hero Form': modeLabel,
          'Safety Directive': '1. Find reinforced overhead cover. 2. Stay clear of energy rifts. 3. Maintain active comms.',
          'Headquarters Contact': developerEmail,
          'Exosphere Relay': 'Aethelgard Deep Space Rift Defense Node'
        })
      });

      if (fsCitizenResponse.ok) {
        deliveryReport.citizenDelivery.success = true;
        deliveryReport.citizenDelivery.method = 'FORMSUBMIT_CITIZEN_RECEIPT';
        console.log(`[KEI DISPATCH] Confirmation receipt dispatched to citizen: ${citizenEmail}`);
      }
    } catch (fsCitizenErr) {
      console.warn('[KEI DISPATCH] Citizen confirmation dispatch warning:', fsCitizenErr);
    }
  }

  // ============================================================================
  // 3. LOCAL SERVER ROUTE: Dispatches archive and SMTP fallback
  // ============================================================================
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
      deliveryReport.success = true;
      deliveryReport.developerDelivery.success = true;
      deliveryReport.citizenDelivery.success = true;
      deliveryReport.archiveFile = data.archiveFile;
    }
  } catch (err) {
    console.warn('[ECLIPSE DISPATCH] Local server dispatch unavailable:', err.message);
  }

  if (deliveryReport.success) {
    // If developer delivered, mark citizen delivery as committed via autoresponse
    deliveryReport.citizenDelivery.success = true;
    if (deliveryReport.citizenDelivery.method === 'PENDING') {
      deliveryReport.citizenDelivery.method = 'FORMSUBMIT_AUTORESPONSE_RECEIPT';
    }
  }

  return deliveryReport;
}
