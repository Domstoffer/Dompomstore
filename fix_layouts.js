const fs = require('fs');
const path = require('path');

function fixPayFiles(file) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');

  // Fix button styles that got corrupted
  content = content.replace(/margin-top: 20px; border-radius: 4px; border-radius: 4px;/g, 'margin-top: 20px; border-radius: 4px;');

  // The major issue in pay.html: the drawer HTML is still at the bottom, and the container has extra things.
  // We need to completely rewrite the body from <div class="payment-container"> down to <script>
  
  // 1. Remove everything between payment-container and <script>
  const scriptIndex = content.indexOf('<script>');
  const startIdx = content.indexOf('<div class="payment-container">');
  
  if (startIdx !== -1 && scriptIndex !== -1) {
    const bodyBefore = content.substring(0, startIdx);
    const scriptAfter = content.substring(scriptIndex);
    
    // We rebuild the payment container
    const newUI = `  <div class="payment-container">
    <div class="payment-title">Web3 Zahlung</div>

    <div class="summary" id="summary"></div>
    <div class="total" id="total"></div>

    <div style="text-align:center; font-size:12px; color:#777; margin-bottom: 30px; line-height:1.6;">
      Wähle dein Wallet, um sicher auf der Blockchain zu bezahlen. <br>
      Order ID: <span id="orderIdDisplay"></span>
    </div>

    <!-- Direct Wallet Option Buttons -->
    <div class="wallet-option" onclick="selectNetwork('solana')">
      <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4NCA4NCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQyIDg0QzY1LjE5NiA4NCA4NCA2NS4xOTYgODQgNDJDODQgMTguODA0IDY1LjE5NiAw NDIgMEMxOC44MDQgMCAwIDE4LjgwNCAwIDQyQzAgNjUuMTk2IDE4LjgwNCA4NCA0MiA4NFoiIGZpbGw9IiNBQjlGRjIiLz48cGF0aCBkPSJNNjIuNjYyNSAzMS41SDM4LjcxODhDMzUuMDQzNyAzMS41IDMyLjI4NzUgMzQuNjUgMzIuMjg3NSAzNy44QzMyLjI4NzUgNDAuOTUgMzQuOTEyNSA0My41NzUgMzguMzI1IDQzLjU3NUM0MS43Mzc1IDQzLjU3NSA0NC4zNjI1IDQwLjk1 NDQuMzYyNSAzNy44VjM1LjdINDYuNDYyNVY0Mi41MjVDNDYuNDYyNSA0NS40MTI1IDQ0Ljg4NzUgNDguMDM3NSA0Mi41MjUgNDkuMzVDMzguMzI1IDUxLjcxMjUgMzIuODEyNSA1Mi43NjI1IDI3LjAzNzUgNTIuNzYyNUMyMi4wNSA1Mi43NjI1IDE3LjU4NzUgNTEuOTc1IDEzLjkxMjUgNTAuNFY3Mi40NUMxMy45MTI1IDc2LjY1IDE3LjMyNSA4MC4wNjI1IDIxLjUyNSA4MC4wNjI1SDYyLjQ3NUM2Ni42NzUgODAuMDYyNSA3MC4wODc1IDc2LjY1IDcwLjA4NzUgNzIuNDVWMzguODVDNzAuMDg3NSAzNC42NSA2Ni44MDYyIDMxLjUgNjIuNjYyNSAzMS41WiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNDguMDM3NCA0Mi41MjUxQzQ3Ljc3NDkgNDMuMzEyNiA0Ny4xMTg3IDQ0LjEwMDEgNDYuNTkzNyA0NC43NTYzQzQ1LjI4MTIgNDYuNDYyNiA0My4xODEyIDQ3Ljc3NTEgNDAuODE4NyA0OC4zMDAxQzM4LjU4NzQgNDguODI1MSAzNi4zNTYyIDQ4LjgyNTEgMzQuMzg3NCA0OC4zMDAxQzMwLjcxMjQgNDcuMjUwMSAyNy41NjI0 NDQuMjMxMyAyNi42NDM3IDQwLjQyNTFDMjYuMTE4NyAzOC4zMjUxIDI2LjExODcgMzYuMDkzOCAyNi42NDM3IDM0LjEyNTFDMjcuNTYyNCAzMC4zMTg4IDMwLjcxMjQgMjcuMzAwMSAzNC4zODc0IDI2LjI1MDFDMzYuNjE4NyAyNS43MjUxIDM4Ljg1IDI1LjcyNTEgNDAuOTUgMjYuMjUwMUM0My4zMTI1IDI2LjkwNjMgNDUuNDEyNSAyOC4yMTg4IDQ2LjcyNSAzMC4wNTYzQzQ3LjI1IDMwLjcxMjUgNDcuNzc1IDMxLjUgNDguMTY4NyAzMi4yODc1QzQ4LjU2MjUgMzMuMzM3NSA0OS4zNSAzNC4zODc1IDUwLjQgMzQuNjUxM0M1Mi4yMzc1IDM1LjE3NjMgNTMuNjgxMiAzMy44NjM4IDU0LjA3NSAzMi4wMjYzQzU0LjQ2ODcgMzAuMzIwMSA1NC4wNzUgMjguNjEzOCA1My4wMjUgMjcuMTcwMUM1MS41ODEyIDI1LjIwMTMgNDkuNjEyNSAyMy42MjYzIDQ3LjM4MTIgMjIuNTc2M0M0NC43NTYyIDIxLjAwMTMgNDEuNjA2MiAyMC4yMTM4IDM4LjMyNSAxOS45NTEzQzM0Ljc4MTIgMTkuODIwMSAzMS4yMzc1IDIwLjM0NTEgMjcuOTU2MiAyMS42NTc2QzIzLjYyNSAyMy40OTUxIDE5LjgxODcgMjYuMzgyNiAxNi45MzEy MzAuMTg4OEMxNC4wNDM3IDMzLjk5NTEgMTIuMzM3NSAzOC40NTc2IDExLjk0MzcgNDMuMTgyNlY0NC4yMzI2SDEyLjA3NUMxMi40Njg3IDUwLjUzMjYgMTQuODMxMiA1Ni40Mzg4IDE4Ljc2ODcgNjEuMjk1MUMyMi43MDYy NjYuMTUxMyAyNy45NTYyIDY5LjgyNjMgMzMuODYyNSA3MS43OTVDMzguNDU2MiA3My4yMzg4IDQzLjMxMjUgNzMuNTAxMyA0OC4wMzc1IDcyLjcxMzhWNDIuNTI1MUg0OC4wMzc0WiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=" alt="Phantom" />
      Phantom (Solana)
    </div>
    
    <div class="wallet-option" onclick="selectNetwork('ethereum')">
      <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" />
      MetaMask (Ethereum)
    </div>

    <!-- Dynamic Token Area -->
    <div id="tokenSelectionArea" style="display:none; margin: 25px 0 15px 0;">
      <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#777; margin-bottom:15px; text-align:center;">Token Wählen</div>
      <div class="token-selector" id="tokensContainer"></div>
      <button class="action-btn" id="payFinalBtn" style="margin-top:10px;" onclick="executePayment()">Jetzt Bezahlen</button>
    </div>

    <div id="paypal-button-container" style="margin-top: 30px;"></div>
    <div id="statusMsg"></div>
  </div>

  `;
    
    // Drop the useless functions in JS since we don't have drawer
    let newScriptAfter = scriptAfter.replace(/function openDrawer\(\) \{[\s\S]*?\}/, '');
    newScriptAfter = newScriptAfter.replace(/function closeDrawer\(\) \{[\s\S]*?\}/, '');

    content = bodyBefore + newUI + newScriptAfter;

    // Fix the CSS to ensure buttons display well inside the white container and dark container natively
    content = content.replace(/#wallet-drawer {[\s\S]*?}/, '');
    content = content.replace(/#wallet-drawer\.show {[\s\S]*?}/, '');
    content = content.replace(/\.overlay {[\s\S]*?}/, '');
    content = content.replace(/\.overlay\.show {[\s\S]*?}/, '');
    content = content.replace(/\.drawer-close {[\s\S]*?}/, '');

  }

  // Also fix action btn missing border issue
  content = content.replace(/border: none;\s*border: 1px solid #000;/g, 'border: 1px solid #000;');

  fs.writeFileSync(p, content);
}

['pay.html', 'secret_pay.html'].forEach(fixPayFiles);

// Fix checkout margin issue
function fixCheckout(file) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');

  // Find the button style in CSS and restore it clearly
  const searchInput = "gap: 20px;";
  content = content.replace(/gap: 20px;/g, 'gap: 28px;');
  
  content = content.replace(/margin-top: 20px; border-radius: 4px;\s*border-radius: 4px;/g, "margin-top: 50px; border-radius: 4px;");

  fs.writeFileSync(p, content);
}

['checkout.html', 'secret_checkout.html'].forEach(fixCheckout);
console.log("Fixed DOM tree locally");
