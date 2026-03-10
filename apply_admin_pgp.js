const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

const pgpHtml = `
    <div id="pgp-section" style="margin-bottom: 40px; background: #ffffff; padding: 24px; border: 1px solid rgba(0,0,0,0.1);">
      <h2 style="font-size: 14px; margin-bottom: 15px; color: #000; text-transform: uppercase; letter-spacing: 0.1em;">🔐 PGP End-to-End Encryption</h2>
      <div style="font-size: 12px; margin-bottom: 10px; color: #333;">System Status: <strong id="pgp-status" style="color: #1c7c3a;">Aktiv & Sicher</strong></div>
      <div style="font-size: 10px; margin-bottom: 20px; color: #777; letter-spacing: 0.05em; word-break: break-all;">Fingerprint: <span id="pgp-fingerprint" style="font-family: monospace;">Loading secure cryptographic layer...</span></div>
      <div style="display:flex; gap: 10px;">
        <button onclick="downloadPublicKey()" style="width: auto; padding: 10px 15px; font-size: 11px; letter-spacing: 0.1em; background: #000; color: #fff;">Download Public Key (.asc)</button>
        <button onclick="regeneratePGP()" style="width: auto; padding: 10px 15px; font-size: 11px; letter-spacing: 0.1em; background: #fff; color: #b42323; border: 1px solid #b42323;">Rotations-Regenerierung (Warnung)</button>
      </div>
    </div>
`;

// Insert after the top nav
adminHtml = adminHtml.replace('<div class="top" style="display:flex;">', '<div class="top" style="display:flex;">');
adminHtml = adminHtml.replace('</div>\n\n    <div id="paid-section"', '</div>\n\n' + pgpHtml + '\n    <div id="paid-section"');

const pgpJs = `
    let currentPublicKey = '';

    async function loadPGPStatus() {
      try {
        const res = await fetch(API_URL + '/admin/pgp/status', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          document.getElementById('pgp-fingerprint').innerText = data.fingerprint || 'Security Handshake Failed';
          currentPublicKey = data.publicKey;
        }
      } catch (e) { console.error('[PGP SEC] Status Sync Error', e); }
    }

    function downloadPublicKey() {
      if (!currentPublicKey) return alert('Kryptografische Schlüssel noch nicht initialisiert.');
      const blob = new Blob([currentPublicKey], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dompom_public_key.asc';
      a.click();
      URL.revokeObjectURL(url);
    }

    async function regeneratePGP() {
      if (!confirm('CRITICAL WARNING: Die Generierung eines neuen Schlüsselpaares macht den alten Public Key ungültig. Fortfahren?')) return;
      document.getElementById('pgp-fingerprint').innerText = 'Generiere (ECC Curve25519)... Das kann einen Moment dauern.';
      try {
        const res = await fetch(API_URL + '/admin/pgp/generate', { method: 'POST', credentials: 'include' });
        const data = await res.json();
        if (data.success) {
          alert('Ein neues PGP-Schlüsselpaar wurde sicher erzeugt und geladen.');
          loadPGPStatus();
        } else {
          alert('Systemfehler: ' + data.error);
        }
      } catch(e) { alert('Netzwerkfehler während der sicheren Übertragung.'); }
    }
`;

// Insert the JS functions right before the closing script tag
adminHtml = adminHtml.replace('checkAuth();\n  </script>', pgpJs + '\n    checkAuth();\n  </script>');

// Make sure loadOrders(); also calls loadPGPStatus();
adminHtml = adminHtml.replace('loadOrders();\n\n          if (!refreshInterval) {', 'loadOrders();\n          loadPGPStatus();\n\n          if (!refreshInterval) {');

fs.writeFileSync('admin.html', adminHtml);
console.log('PGP Module injected into Admin UI.');
