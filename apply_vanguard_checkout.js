const fs = require('fs');
const path = require('path');

// Base CSS for the new Vanguard Theme
const baseCss = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #ffffff;
      --text: #000000;
      --border: rgba(0,0,0,0.1);
      --accent: #f4f4f4;
      --glass: rgba(255,255,255,0.8);
    }
    .dark-mode {
      --bg: #000000;
      --text: #ffffff;
      --border: rgba(255,255,255,0.15);
      --accent: #111111;
      --glass: rgba(0,0,0,0.8);
    }
    
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes reveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
    @keyframes fadeMask { from { mask-position: 200% center; -webkit-mask-position: 200% center; } to { mask-position: 0% center; -webkit-mask-position: 0% center; } }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* SPLIT SCREEN LAYOUT */
    .vanguard-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .vanguard-left {
      background: var(--accent);
      padding: 60px 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .vanguard-left::after {
      content: 'DOMPOM';
      position: absolute;
      top: -5%;
      left: -5%;
      font-family: 'Syncopate', sans-serif;
      font-size: 25vw;
      font-weight: 700;
      color: var(--text);
      opacity: 0.03;
      pointer-events: none;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      z-index: 0;
    }

    .vanguard-right {
      padding: 60px 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      animation: slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @media(min-width: 900px) {
      .vanguard-layout {
        flex-direction: row;
      }
      .vanguard-left {
        width: 45vw;
        height: 100vh;
        position: fixed;
        top: 0; left: 0;
        padding: 80px 60px;
      }
      .vanguard-right {
        width: 55vw;
        margin-left: 45vw;
        min-height: 100vh;
        padding: 80px 10%;
      }
    }

    .back-nav {
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-decoration: none;
      color: var(--text);
      opacity: 0.5;
      transition: opacity 0.4s;
      z-index: 10;
      position: relative;
    }
    .back-nav:hover { opacity: 1; }

    .step-indicator {
      font-family: 'Syncopate', sans-serif;
      font-size: 10px;
      letter-spacing: 0.4em;
      opacity: 0.4;
      margin-bottom: 20px;
      z-index: 10;
      position: relative;
    }

    .huge-title {
      font-family: 'Syncopate', sans-serif;
      font-weight: 400;
      font-size: 2.5rem;
      line-height: 1.1;
      text-transform: uppercase;
      margin-bottom: 50px;
      letter-spacing: 0.05em;
      animation: reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
    }
    
    .huge-title i {
      font-style: italic;
      font-weight: 300;
      color: gray;
    }

    /* ORDER REVIEW LIST */
    .order-review {
      z-index: 10;
      position: relative;
    }
    .order-item-vanguard {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .order-total-vanguard {
      display: flex;
      justify-content: space-between;
      padding: 30px 0;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.15em;
    }

    /* FORMS */
    .v-form {
      display: flex;
      flex-direction: column;
      gap: 35px;
    }
    .v-input-group {
      position: relative;
    }
    .v-input {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--border);
      padding: 10px 0;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: var(--text);
      outline: none;
      transition: border-color 0.4s;
    }
    .v-input:focus {
      border-bottom-color: var(--text);
    }
    .v-label {
      position: absolute;
      top: 10px;
      left: 0;
      font-size: 10px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--text);
      opacity: 0.4;
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .v-input:focus ~ .v-label, .v-input:valid ~ .v-label {
      top: -20px;
      font-size: 9px;
      opacity: 1;
    }

    /* BUTTONS */
    .v-btn {
      display: inline-block;
      width: 100%;
      background: var(--text);
      color: var(--bg);
      border: none;
      padding: 24px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      margin-top: 20px;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .v-btn::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: var(--bg);
      transform: scaleY(0);
      transform-origin: bottom;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1;
    }
    .v-btn span {
      position: relative;
      z-index: 2;
      transition: color 0.6s;
    }
    .v-btn:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .v-btn:hover::before {
      transform: scaleY(1);
    }
    .v-btn:hover span {
      color: var(--text);
    }
    .dark-mode .v-btn:hover {
      box-shadow: 0 20px 40px rgba(255,255,255,0.05);
    }

    /* WALLET BOXES */
    .wallet-box {
      border: 1px solid var(--border);
      padding: 30px 25px;
      display: flex;
      align-items: center;
      gap: 20px;
      cursor: pointer;
      margin-bottom: 20px;
      background: transparent;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .wallet-box img {
      width: 32px; height: 32px;
      transition: transform 0.5s;
    }
    .wallet-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .wallet-name {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .wallet-chain {
      font-size: 9px;
      opacity: 0.5;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }
    .wallet-box:hover {
      background: var(--accent);
      border-color: var(--text);
    }
    .wallet-box:hover img {
      transform: scale(1.1) rotate(5deg);
    }

    .payment-area {
      display:none; 
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      margin-top: 40px;
      padding-top: 40px;
      border-top: 1px solid var(--border);
    }
    
    .token-pill {
      display: inline-block;
      padding: 12px 24px;
      border: 1px solid var(--border);
      border-radius: 50px;
      font-size: 10px;
      letter-spacing: 0.15em;
      margin: 0 10px 10px 0;
      cursor: pointer;
      transition: all 0.3s;
    }
    .token-pill.active {
      background: var(--text);
      color: var(--bg);
      border-color: var(--text);
    }
`;

function buildCheckout(isSecret) {
    const themeClass = isSecret ? 'dark-mode' : '';
    const backLink = isSecret ? 'hidden.html' : 'index.html';
    const payLink = isSecret ? 'secret_pay.html' : 'pay.html';

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout – Dompomstore</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syncopate:wght@300;400;700&display=swap" rel="stylesheet">
  <style>${baseCss}</style>
</head>
<body class="${themeClass}">

  <div class="vanguard-layout">
    
    <!-- LEFT PANE: BRAND & SUMMARY -->
    <div class="vanguard-left">
      <div>
        <a href="${backLink}" class="back-nav">← Return</a>
      </div>
      
      <div class="order-review">
        <div class="step-indicator">01 / CHECKOUT</div>
        <div id="summaryContent"></div>
      </div>
    </div>

    <!-- RIGHT PANE: FORM -->
    <div class="vanguard-right">
      <h1 class="huge-title">Shipping <i>Details</i></h1>
      
      <form id="checkoutForm" class="v-form">
        
        <div style="display:flex; gap:20px; width:100%;">
          <div class="v-input-group" style="flex:1;">
            <input required type="text" class="v-input" name="firstname">
            <span class="v-label">First Name</span>
          </div>
          <div class="v-input-group" style="flex:1;">
            <input required type="text" class="v-input" name="lastname">
            <span class="v-label">Last Name</span>
          </div>
        </div>

        <div class="v-input-group">
          <input required type="email" class="v-input" name="email">
          <span class="v-label">Email Address</span>
        </div>

        <div class="v-input-group">
          <input required type="text" class="v-input" name="street">
          <span class="v-label">Street & House Number</span>
        </div>

        <div style="display:flex; gap:20px; width:100%;">
          <div class="v-input-group" style="flex:1;">
            <input required type="text" class="v-input" name="zip">
            <span class="v-label">Postal Code</span>
          </div>
          <div class="v-input-group" style="flex:1;">
            <input required type="text" class="v-input" name="city">
            <span class="v-label">City</span>
          </div>
        </div>

        <div class="v-input-group">
          <input required type="text" class="v-input" name="country">
          <span class="v-label">Country</span>
        </div>

        <button type="submit" class="v-btn"><span>Continue to Payment</span></button>
      </form>

    </div>
  </div>

  <script>
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) window.location.href = "${backLink}";

    let total = 0;
    let itemsHTML = "";

    cart.forEach(item => {
      total += item.price;
      itemsHTML += \`<div class="order-item-vanguard"><span>\${item.name} (\${item.size || 'OS'})</span><span>\${item.price} USDC</span></div>\`;
    });

    document.getElementById("summaryContent").innerHTML = itemsHTML + \`<div class="order-total-vanguard"><span>TOTAL</span><span>\${total} USDC</span></div>\`;

    document.getElementById("checkoutForm").addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target).entries());
      localStorage.setItem("shipping", JSON.stringify(data));
      const source = localStorage.getItem('shopSource') || 'public';

      try {
        const response = await fetch("http://localhost:3001/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart, shipping: data, source: source })
        });
        const order = await response.json();
        localStorage.setItem("currentOrder", JSON.stringify(order));
        window.location.href = "${payLink}";
      } catch (err) {
        alert("Server communication error");
      }
    });

    // Handle input labels dynamically so they float correctly if filled by browser autofill
    document.querySelectorAll('.v-input').forEach(input => {
        input.addEventListener('change', () => { input.setAttribute('value', input.value); });
        // Trigger initial check
        if(input.value) input.setAttribute('value', input.value);
    });
  </script>
</body>
</html>`;
}

function buildPay(isSecret) {
    const themeClass = isSecret ? 'dark-mode' : '';
    const backLink = isSecret ? 'secret_checkout.html' : 'checkout.html';
    const tyLink = isSecret ? 'secret_thankyou.html' : 'thankyou.html';

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment – Dompomstore</title>
  <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"></script>
  <script src="https://www.paypal.com/sdk/js?client-id=test&currency=USD&disable-funding=card,sepa,giropay,sofort,bancontact,eps,ideal,mybank,p24,blik"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syncopate:wght@300;400;700&display=swap" rel="stylesheet">
  <style>${baseCss}</style>
</head>
<body class="${themeClass}">

  <div class="vanguard-layout">
    
    <!-- LEFT PANE: BRAND & SUMMARY -->
    <div class="vanguard-left">
      <div>
        <a href="${backLink}" class="back-nav">← Return</a>
      </div>
      
      <div class="order-review">
        <div class="step-indicator">02 / PAYMENT</div>
        <div id="summaryContent"></div>
        <div style="font-size:10px; opacity:0.3; letter-spacing:0.1em; margin-top:20px;">ORDER ID: <span id="orderIdDisplay"></span></div>
      </div>
    </div>

    <!-- RIGHT PANE: WALLETS -->
    <div class="vanguard-right">
      <h1 class="huge-title">Select <i>Vault</i></h1>
      
      <div class="wallet-box" onclick="selectNetwork('solana')">
        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4NCA4NCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQyIDg0QzY1LjE5NiA4NCA4NCA2NS4xOTYgODQgNDJDODQgMTguODA0IDY1LjE5NiAw NDIgMEMxOC44MDQgMCAwIDE4LjgwNCAwIDQyQzAgNjUuMTk2IDE4LjgwNCA4NCA0MiA4NFoiIGZpbGw9IiNBQjlGRjIiLz48cGF0aCBkPSJNNjIuNjYyNSAzMS41SDM4LjcxODhDMzUuMDQzNyAzMS41IDMyLjI4NzUgMzQuNjUgMzIuMjg3NSAzNy44QzMyLjI4NzUgNDAuOTUgMzQuOTEyNSA0My41NzUgMzguMzI1IDQzLjU3NUM0MS43Mzc1IDQzLjU3NSA0NC4zNjI1IDQwLjk1 NDQuMzYyNSAzNy44VjM1LjdINDYuNDYyNVY0Mi41MjVDNDYuNDYyNSA0NS40MTI1IDQ0Ljg4NzUgNDguMDM3NSA0Mi41MjUgNDkuMzVDMzguMzI1IDUxLjcxMjUgMzIuODEyNSA1Mi43NjI1IDI3LjAzNzUgNTIuNzYyNUMyMi4wNSA1Mi43NjI1IDE3LjU4NzUgNTEuOTc1IDEzLjkxMjUgNTAuNFY3Mi40NUMxMy45MTI1IDc2LjY1IDE3LjMyNSA4MC4wNjI1IDIxLjUyNSA4MC4wNjI1SDYyLjQ3NUM2Ni42NzUgODAuMDYyNSA3MC4wODc1IDc2LjY1IDcwLjA4NzUgNzIuNDVWMzguODVDNzAuMDg3NSAzNC42NSA2Ni44MDYyIDMxLjUgNjIuNjYyNSAzMS41WiIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNNDguMDM3NCA0Mi41MjUxQzQ3Ljc3NDkgNDMuMzEyNiA0Ny4xMTg3IDQ0LjEwMDEgNDYuNTkzNyA0NC43NTYzQzQ1LjI4MTIgNDYuNDYyNiA0My4xODEyIDQ3Ljc3NTEgNDAuODE4NyA0OC4zMDAxQzM4LjU4NzQgNDguODI1MSAzNi4zNTYyIDQ4LjgyNTEgMzQuMzg3NCA0OC4zMDAxQzMwLjcxMjQgNDcuMjUwMSAyNy41NjI0 NDQuMjMxMyAyNi42NDM3IDQwLjQyNTFDMjYuMTE4NyAzOC4zMjUxIDI2LjExODcgMzYuMDkzOCAyNi42NDM3IDM0LjEyNTFDMjcuNTYyNCAzMC4zMTg4IDMwLjcxMjQgMjcuMzAwMSAzNC4zODc0IDI2LjI1MDFDMzYuNjE4NyAyNS43MjUxIDM4Ljg1IDI1LjcyNTEgNDAuOTUgMjYuMjUwMUM0My4zMTI1IDI2LjkwNjMgNDUuNDEyNSAyOC4yMTg4IDQ2LjcyNSAzMC4wNTYzQzQ3LjI1IDMwLjcxMjUgNDcuNzc1IDMxLjUgNDguMTY4NyAzMi4yODc1QzQ4LjU2MjUgMzMuMzM3NSA0OS4zNSAzNC4zODc1IDUwLjQgMzQuNjUxM0M1Mi4yMzc1IDM1LjE3NjMgNTMuNjgxMiAzMy44NjM4IDU0LjA3NSAzMi4wMjYzQzU0LjQ2ODcgMzAuMzIwMSA1NC4wNzUgMjguNjEzOCA1My4wMjUgMjcuMTcwMUM1MS41ODEyIDI1LjIwMTMgNDkuNjEyNSAyMy42MjYzIDQ3LjM4MTIgMjIuNTc2M0M0NC43NTYyIDIxLjAwMTMgNDEuNjA2MiAyMC4yMTM4IDM4LjMyNSAxOS45NTEzQzM0Ljc4MTIgMTkuODIwMSAzMS4yMzc1IDIwLjM0NTEgMjcuOTU2MiAyMS42NTc2QzIzLjYyNSAyMy40OTUxIDE5LjgxODcgMjYuMzgyNiAxNi45MzEy MzAuMTg4OEMxNC4wNDM3IDMzLjk5NTEgMTIuMzM3NSAzOC40NTc2IDExLjk0MzcgNDMuMTgyNlY0NC4yMzI2SDEyLjA3NUMxMi40Njg3IDUwLjUzMjYgMTQuODMxMiA1Ni40Mzg4IDE4Ljc2ODcgNjEuMjk1MUMyMi43MDYy NjYuMTUxMyAyNy45NTYyIDY5LjgyNjMgMzMuODYyNSA3MS43OTVDMzguNDU2MiA3My4yMzg4IDQzLjMxMjUgNzMuNTAxMyA0OC4wMzc1IDcyLjcxMzhWNDIuNTI1MUg0OC4wMzc0WiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=" alt="Phantom" />
        <div class="wallet-info">
          <span class="wallet-name">Phantom</span>
          <span class="wallet-chain">Solana Network</span>
        </div>
      </div>

      <div class="wallet-box" onclick="selectNetwork('ethereum')">
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" />
        <div class="wallet-info">
          <span class="wallet-name">MetaMask</span>
          <span class="wallet-chain">EVM Network</span>
        </div>
      </div>

      <div id="paymentArea" class="payment-area">
        <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.2em; opacity:0.5; margin-bottom:20px;">Select Token Currency</div>
        <div id="tokensContainer"></div>
        <button class="v-btn" id="payFinalBtn" onclick="executePayment()"><span>Execute Transfer</span></button>
      </div>

      <div id="paypal-button-container" style="margin-top:40px; border-top: 1px solid var(--border); padding-top:40px;"></div>
      <div id="statusMsg" style="margin-top:20px; font-size:11px; color:gray; text-transform:uppercase; letter-spacing:0.1em;"></div>

    </div>
  </div>

  <script>
    const order = JSON.parse(localStorage.getItem("currentOrder"));
    if (!order) {
      window.location.href = "${backLink}";
    }

    let totalUsd = 0;
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let itemsHTML = "";
    cart.forEach(item => {
      const qty = Number(item.quantity) || 1;
      const sum = item.price * qty;
      totalUsd += sum;
      itemsHTML += \`<div class="order-item-vanguard"><span>\${item.name} × \${qty}</span><span>\${sum.toFixed(2)} USD</span></div>\`;
    });

    document.getElementById("summaryContent").innerHTML = itemsHTML + \`<div class="order-total-vanguard"><span>TOTAL</span><span>\${totalUsd.toFixed(2)} USD</span></div>\`;
    document.getElementById("orderIdDisplay").innerText = order.id;

    let activeNetwork = null;
    let activeToken = null;

    function selectNetwork(network) {
      activeNetwork = network;
      document.getElementById('paymentArea').style.display = 'block';
      const container = document.getElementById('tokensContainer');
      container.innerHTML = '';

      let tokens = [];
      const source = localStorage.getItem('shopSource') || 'public';

      if (source === 'private') {
        if (network === 'solana') tokens = ['USDC'];
        else tokens = ['USDC', 'ETH', 'BNB_USDC', 'BNB', 'LINEA_USDC'];
      } else {
        if (network === 'solana') tokens = ['USDC', 'SOL', 'FARTCOIN'];
        else tokens = ['USDC', 'PEPPE'];
      }

      tokens.forEach((t, index) => {
        const btn = document.createElement('div');
        btn.className = \`token-pill \${index === 0 ? 'active' : ''}\`;
        btn.innerText = t;
        btn.onclick = () => {
          document.querySelectorAll('.token-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeToken = t;
        };
        container.appendChild(btn);
      });
      activeToken = tokens[0];
    }

    async function executePayment() {
      const btn = document.getElementById('payFinalBtn');
      btn.innerHTML = "<span>Processing...</span>";
      btn.style.pointerEvents = 'none';

      try {
        if (activeNetwork === 'solana') await payWithPhantom();
        else if (activeNetwork === 'ethereum') await payWithMetaMask();
      } catch (e) {
        console.error(e);
        alert("Payment Failed: " + e.message);
      } finally {
        btn.innerHTML = "<span>Execute Transfer</span>";
        btn.style.pointerEvents = 'all';
      }
    }

    paypal.Buttons({
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{ amount: { value: totalUsd.toFixed(2) } }]
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          fetch("http://localhost:3001/api/verify-paypal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id, paypalOrderId: details.id })
          }).then(res => res.json()).then(res => {
            if (res.success) window.location.href = "${tyLink}";
            else alert("PayPal Verification Error");
          });
        });
      }
    }).render('#paypal-button-container');

    async function payWithPhantom() {
      const provider = window.solana;
      if (!provider || !provider.isPhantom) throw new Error("Phantom not found.");
      await provider.connect();
      const sender = provider.publicKey;
      const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");

      const blockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
      const tx = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: new solanaWeb3.PublicKey("Cx2TAKyUxVZ3xtWZoTpqmnGcnvkUvoghoKafpsK3KuCp"),
          lamports: 10000 
        })
      );
      tx.feePayer = sender;
      tx.recentBlockhash = blockhash;

      const { signature } = await provider.signAndSendTransaction(tx);
      const req = await fetch("http://localhost:3001/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, signature: signature, token: activeToken })
      });
      const res = await req.json();
      if (res.success) window.location.href = "${tyLink}";
      else throw new Error("Server verification failed.");
    }

    async function payWithMetaMask() {
      if (!window.ethereum) throw new Error("MetaMask not found.");
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: "0x8fc73bf2168af15395037efb692eda6375f54a1e", 
        value: ethers.parseEther("0.0001") 
      });
      const receipt = await tx.wait();

      const req = await fetch("http://localhost:3001/api/verify-evm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, txHash: receipt.hash, sender: signer.address, token: activeToken })
      });
      const res = await req.json();
      if (res.success) window.location.href = "${tyLink}";
      else throw new Error("Server verification failed.");
    }
  </script>
</body>
</html>`;
}

function buildThankYou(isSecret) {
    const themeClass = isSecret ? 'dark-mode' : '';
    const homeLink = isSecret ? 'hidden.html' : 'index.html';

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt – Dompomstore</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syncopate:wght@300;400;700&display=swap" rel="stylesheet">
  <style>${baseCss}
    .ty-center {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      width: 100%; maxWidth: 600px;
    }
  </style>
</head>
<body class="${themeClass}">

  <div class="ty-center">
    <div class="step-indicator" style="animation: slideUp 1s ease forwards;">03 / COMPLETE</div>
    <h1 class="huge-title" style="margin-bottom: 20px;">Receipt <i>Generated</i></h1>
    <p style="font-size:12px; letter-spacing:0.1em; opacity:0.6; margin-bottom: 50px; line-height: 1.8;">
      Thank you for purchasing.<br>Your order is cryptographically secured.
    </p>

    <a href="https://t.me/deingrappletgramlink" target="_blank" style="text-decoration:none;">
      <button class="v-btn" style="max-width:300px; margin:0 auto; display:block;"><span>Join Telegram Priority</span></button>
    </a>
    
    <div style="margin-top:40px;">
      <a href="${homeLink}" class="back-nav">← Return to Store</a>
    </div>
  </div>

</body>
</html>`;
}

// Generate the 6 files:
fs.writeFileSync(path.join(__dirname, 'checkout.html'), buildCheckout(false));
fs.writeFileSync(path.join(__dirname, 'secret_checkout.html'), buildCheckout(true));

fs.writeFileSync(path.join(__dirname, 'pay.html'), buildPay(false));
fs.writeFileSync(path.join(__dirname, 'secret_pay.html'), buildPay(true));

fs.writeFileSync(path.join(__dirname, 'thankyou.html'), buildThankYou(false));
fs.writeFileSync(path.join(__dirname, 'secret_thankyou.html'), buildThankYou(true));

console.log("Vanguard Design Successfully Deployed.");
