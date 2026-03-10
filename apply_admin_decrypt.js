const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

const decryptHtml = `
    <div id="decrypt-section" style="margin-bottom: 40px; background: #ffffff; padding: 24px; border: 1px solid rgba(0,0,0,0.1);">
      <h2 style="font-size: 14px; margin-bottom: 15px; color: #000; text-transform: uppercase; letter-spacing: 0.1em;">🔓 PGP Decryption Tool</h2>
      <div style="font-size: 11px; margin-bottom: 15px; color: #555;">Kopiere den Inhalt der erhaltenen .pgp Datei (inklusive -----BEGIN PGP MESSAGE-----) hier hinein, um die Bestellung zu entschlüsseln.</div>
      <textarea id="pgp-input" style="width: 100%; height: 120px; padding: 10px; font-family: monospace; font-size: 10px; border: 1px solid #ccc; margin-bottom: 15px;" placeholder="-----BEGIN PGP MESSAGE-----\\n...\\n-----END PGP MESSAGE-----"></textarea>
      <button onclick="decryptPayload()" style="width: 100%; padding: 12px; font-size: 11px; letter-spacing: 0.1em; background: #111; color: #fff;">Payload entschlüsseln</button>
      
      <div id="decrypt-result" style="margin-top: 20px; display: none; padding: 15px; background: #f9f9f9; border: 1px dashed #ccc; font-family: monospace; font-size: 11px; white-space: pre-wrap; word-break: break-all;"></div>
    </div>
`;

// Insert after the PGP Management section
adminHtml = adminHtml.replace('<div id="paid-section"', decryptHtml + '\n    <div id="paid-section"');

const decryptJs = `
    async function decryptPayload() {
      const payload = document.getElementById('pgp-input').value.trim();
      const resultDiv = document.getElementById('decrypt-result');
      
      if (!payload) {
        alert('Bitte füge erst einen PGP Payload ein.');
        return;
      }
      
      resultDiv.style.display = 'block';
      resultDiv.innerText = 'Entschlüssele... Bitte warten.';
      resultDiv.style.color = '#000';

      try {
        const res = await fetch(API_URL + '/admin/pgp/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encryptedPayload: payload }),
          credentials: 'include'
        });
        
        const data = await res.json();
        
        if (data.success) {
           resultDiv.style.color = '#1c7c3a';
           resultDiv.innerText = '✅ ERFOLGREICH ENTSCHLÜSSELT:\\n\\n' + JSON.stringify(data.decryptedData, null, 2);
        } else {
           resultDiv.style.color = '#b42323';
           resultDiv.innerText = '❌ FEHLER: ' + (data.error || 'Ungültiger PGP Text oder falscher Schlüssel.');
        }
      } catch(e) {
         resultDiv.style.color = '#b42323';
         resultDiv.innerText = 'Netzwerkfehler beim Entschlüsseln.';
      }
    }
`;

// Insert the JS function right before the closing script tag
adminHtml = adminHtml.replace('checkAuth();\n  </script>', decryptJs + '\n    checkAuth();\n  </script>');

fs.writeFileSync('admin.html', adminHtml);
console.log('Decryption tool injected into Admin UI.');
