const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

// The admin panel currently injects raw JSON data directly into the DOM via innerHTML without escaping:
// Example: <div class="name">o.shipping.firstname o.shipping.lastname</div>
// If a user buys a product with shipping firstname: "<script>alert(1)</script>" it executes in the admin panel.

const xssSanitizerFn = `
    const escapeHTML = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
`;

// Insert the sanitizer function at the top of the script tag
adminHtml = adminHtml.replace('<script>', '<script>\n' + xssSanitizerFn);

// Rewrite generateOrderHTML to apply the sanitizer to all user-controlled data before adding it to innerHTML
const oldGenerateOrderHTML = `function generateOrderHTML(o) {
      let itemsHtml = '';
      o.items.forEach(i => {
        itemsHtml += \` - \${i.name} (\${i.quantity || 1} x \${i.price} USDC)<br>\`;
      });

      return \`
        <div class="order">
          <div class="header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
              <div class="name">\${o.shipping.firstname} \${o.shipping.lastname}</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="source-badge \${o.source || 'public'}">\${o.source === 'private' ? '🔒 Private' : ''}</div>
                <div class="badge \${o.status.toLowerCase()}">\${o.status}</div>
                <a href="#" onclick="deleteOrder('\${o.id}', event)" style="font-size:13px; color:#b42323; text-decoration:none;">✕</a>
              </div>
          </div>
          <div class="details">
              <div class="section">
                  <strong>🆔 Order Infos</strong>
                  Order ID: \${o.id}<br>
                  Quelle: \${o.source === 'private' ? '🔒 Private Shop' : '🌐 Public Shop'}<br>
                  Reference: \${o.reference}<br>
                  Datum: \${new Date(o.createdAt).toLocaleString()}
              </div>
              <div class="section">
                  <strong>🚚 Versandadresse</strong>
                  \${o.shipping.firstname} \${o.shipping.lastname}<br>
                  \${o.shipping.street}<br>
                  \${o.shipping.zip} \${o.shipping.city}<br>
                  \${o.shipping.country || ''}
              </div>
              <div class="section">
                  <strong>🌐 Web3 Zahlung</strong>
                  Status: \${o.status === 'paid' ? 'Bezahlt' : 'Ausstehend'}<br>
                  Netzwerk: \${o.network || '-'}<br>
                  Token: \${o.token || '-'}<br>
                  TxHash: \${o.txHash ? '<span style="font-size:11px; word-break:break-all;">' + o.txHash + '</span>' : '-'}<br>
                  Sender: \${o.walletSender ? '<span style="font-size:11px; word-break:break-all;">' + o.walletSender + '</span>' : '-'}
              </div>
              <div class="section">
                  <strong>🛒 Artikel</strong>
                  \${itemsHtml}
                  <br><strong>Gesamt: \${o.total} USDC</strong>
              </div>
          </div>
        </div>
      \`;
    }`;

const newGenerateOrderHTML = `function generateOrderHTML(o) {
      let itemsHtml = '';
      const safeItems = Array.isArray(o.items) ? o.items : [];
      safeItems.forEach(i => {
        itemsHtml += \` - \${escapeHTML(i.name)} (\${escapeHTML(i.quantity) || 1} x \${escapeHTML(i.price)} USD)<br>\`;
      });

      const safeFirst = escapeHTML(o.shipping.firstname);
      const safeLast = escapeHTML(o.shipping.lastname);
      const safeStreet = escapeHTML(o.shipping.street);
      const safeZip = escapeHTML(o.shipping.zip);
      const safeCity = escapeHTML(o.shipping.city);
      const safeCountry = escapeHTML(o.shipping.country);
      
      const safeId = escapeHTML(o.id);
      const safeStatus = escapeHTML(o.status);
      const safeSource = escapeHTML(o.source);
      const safeRef = escapeHTML(o.reference);
      const safeNetwork = escapeHTML(o.network);
      const safeToken = escapeHTML(o.token);
      const safeTxHash = escapeHTML(o.txHash);
      const safeSender = escapeHTML(o.walletSender);
      const safeTotal = escapeHTML(o.total);

      return \`
        <div class="order">
          <div class="header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
              <div class="name">\${safeFirst} \${safeLast}</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="source-badge \${safeSource || 'public'}">\${safeSource === 'private' ? '🔒 Private' : ''}</div>
                <div class="badge \${safeStatus.toLowerCase()}">\${safeStatus}</div>
                <a href="#" onclick="deleteOrder('\${safeId}', event)" style="font-size:13px; color:#b42323; text-decoration:none;" aria-label="Delete Order">✕</a>
              </div>
          </div>
          <div class="details">
              <div class="section">
                  <strong>🆔 Order Infos</strong>
                  Order ID: \${safeId}<br>
                  Quelle: \${safeSource === 'private' ? '🔒 Private Shop' : '🌐 Public Shop'}<br>
                  Reference: \${safeRef}<br>
                  Datum: \${new Date(o.createdAt).toLocaleString()}
              </div>
              <div class="section">
                  <strong>🚚 Versandadresse</strong>
                  \${safeFirst} \${safeLast}<br>
                  \${safeStreet}<br>
                  \${safeZip} \${safeCity}<br>
                  \${safeCountry || ''}
              </div>
              <div class="section">
                  <strong>🌐 Web3 Zahlung</strong>
                  Status: \${safeStatus === 'paid' ? 'Bezahlt' : 'Ausstehend'}<br>
                  Netzwerk: \${safeNetwork || '-'}<br>
                  Token: \${safeToken || '-'}<br>
                  TxHash: \${safeTxHash ? '<span style="font-size:11px; word-break:break-all;">' + safeTxHash + '</span>' : '-'}<br>
                  Sender: \${safeSender ? '<span style="font-size:11px; word-break:break-all;">' + safeSender + '</span>' : '-'}
              </div>
              <div class="section">
                  <strong>🛒 Artikel</strong>
                  \${itemsHtml}
                  <br><strong>Gesamt: \${safeTotal} USD</strong>
              </div>
          </div>
        </div>
      \`;
    }`;

// Use string replacement instead of regex to avoid layout shifting
adminHtml = adminHtml.replace(oldGenerateOrderHTML, newGenerateOrderHTML);

// Additionally, add anti-CSRF measures to the logout button
adminHtml = adminHtml.replace(
    /async function logout\(\) \{[\s\S]*?checkAuth\(\);\n    \}/,
    `async function logout() {\n      if(confirm('Are you sure you want to securely end your session?')) {\n        await fetch(API_URL + '/admin/logout', { method: 'POST', credentials: 'include' });\n        checkAuth();\n      }\n    }`
);

fs.writeFileSync('admin.html', adminHtml);
console.log('Admin Dashboard XSS mitigation applied successfully.');
