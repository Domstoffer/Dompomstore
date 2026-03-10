const fs = require('fs');

const cleanHTML = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Private Access</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syncopate:wght@300;400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #ffffff;
      --text: #000000;
      --border: rgba(0,0,0,0.1);
      --accent: #f4f4f4;
      --glass: rgba(255,255,255,0.8);
      --input-border: rgba(0,0,0,0.2);
    }
    body.dark-mode {
      --bg: #000000;
      --text: #ffffff;
      --border: rgba(255,255,255,0.15);
      --accent: #111111;
      --glass: rgba(0,0,0,0.8);
      --input-border: rgba(255,255,255,0.2);
    }
    
    @keyframes slideRight { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes reveal { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    /* VANGUARD SPLIT SCREEN LAYOUT */
    .vanguard-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .vanguard-left {
      background: var(--bg);
      padding: 40px 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      border-right: 1px solid var(--border);
      z-index: 10;
    }

    .vanguard-left::after {
      content: 'DOMPOM';
      position: absolute;
      top: -5%;
      left: -20%;
      font-family: 'Syncopate', sans-serif;
      font-size: 28vw;
      font-weight: 700;
      color: var(--text);
      opacity: 0.02;
      pointer-events: none;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      z-index: 0;
    }

    .vanguard-right {
      padding: 60px 30px;
      display: flex;
      flex-direction: column;
      animation: slideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      background: var(--bg);
      position: relative;
      z-index: 1;
    }

    @media(min-width: 900px) {
      .vanguard-layout { flex-direction: row; }
      .vanguard-left {
        width: 30vw;
        height: 100vh;
        position: fixed;
        top: 0; left: 0;
        padding: 60px 40px;
      }
      .vanguard-right {
        width: 70vw;
        margin-left: 30vw;
        min-height: 100vh;
        padding: 80px 5%;
      }
    }

    /* BRANDING & NAV */
    .brand-logo {
      font-family: 'Syncopate', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--text);
      text-decoration: none;
      z-index: 10;
      position: relative;
      line-height: 1.2;
    }
    .brand-logo a { color: inherit; text-decoration: none; }
    .brand-logo a.p-link { opacity: 0.3; transition: opacity 0.3s; }
    .brand-logo a.p-link:hover { opacity: 1; text-shadow: 0 0 10px rgba(255,255,255,0.5); }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 20px;
      z-index: 10;
      position: relative;
      margin-top: 50px;
    }
    
    .nav-item {
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--text);
      text-decoration: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0.6;
      transition: opacity 0.3s, transform 0.3s;
    }
    .nav-item:hover {
      opacity: 1;
      transform: translateX(5px);
    }
    
    .huge-title {
      font-family: 'Syncopate', sans-serif;
      font-weight: 300;
      font-size: 3rem;
      line-height: 1.1;
      text-transform: uppercase;
      margin-bottom: 60px;
      letter-spacing: 0.05em;
      animation: reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
    }
    .huge-title i { font-style: italic; font-weight: 400; color: gray; }

    /* PRODUCT GRID */
    .container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      width: 100%;
    }
    @media(min-width: 1200px) {
      .container { grid-template-columns: repeat(3, 1fr); gap: 40px; }
    }
    .container.mode-3 { grid-template-columns: repeat(2, 1fr); gap: 60px; }
    
    .product-box {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .product-box:hover { transform: translateY(-5px); }
    
    .image-wrapper {
      width: 100%;
      aspect-ratio: 3/4;
      overflow: hidden;
      margin-bottom: 20px;
      background: var(--accent);
    }
    .product-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1), filter 1s;
      filter: grayscale(20%);
    }
    .product-box:hover img {
      transform: scale(1.05);
      filter: grayscale(0%);
    }
    
    .product-info-grid {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
    }
    .product-name {
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .product-price {
      font-size: 11px;
      color: gray;
      letter-spacing: 0.1em;
    }

    /* CART DRAWER */
    #cart-dropdown {
      position: fixed;
      top: 0; right: -100%;
      width: 400px; height: 100vh;
      background: var(--bg);
      border-left: 1px solid var(--border);
      padding: 60px 40px;
      transition: right 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }
    #cart-dropdown.show { right: 0; }
    
    .cart-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: var(--glass);
      backdrop-filter: blur(10px);
      opacity: 0; pointer-events: none;
      transition: opacity 0.6s;
      z-index: 999;
    }
    .cart-overlay.show { opacity: 1; pointer-events: all; }
    
    .cart-title {
      font-family: 'Syncopate', sans-serif;
      font-size: 1.2rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 40px;
      font-weight: 300;
    }
    #cart-items { flex: 1; overflow-y: auto; margin-bottom: 30px; }
    
    .cart-item {
      display: flex; justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding: 20px 0;
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
    }
    .remove-item { cursor: pointer; color: gray; transition: color 0.3s; }
    .remove-item:hover { color: red; }
    
    .cart-total { display: flex; justify-content: space-between; font-weight: 500; margin-bottom: 30px; font-size: 13px; letter-spacing: 0.1em;}
    
    .checkout-btn {
      width: 100%;
      padding: 24px;
      background: var(--text);
      color: var(--bg);
      border: none;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform 0.4s;
    }
    .checkout-btn:hover { transform: translateY(-3px); }

    /* LOCK SCREEN */
    #lockScreen {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: #000; color: #fff;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 9999; transition: opacity 0.8s;
    }
    .lock-title {
      font-family: 'Syncopate', sans-serif; font-size: 2rem;
      letter-spacing: 0.3em; margin-bottom: 40px; opacity: 0.5;
    }
    .lock-input {
      background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.2);
      color: #fff; font-size: 14px; padding: 15px; width: 300px; text-align: center;
      letter-spacing: 0.4em; outline: none; transition: border-color 0.4s;
    }
    .lock-input:focus { border-color: #fff; }
    .lock-error { margin-top: 20px; font-size: 10px; color: red; letter-spacing: 0.1em; opacity: 0; transition: opacity 0.3s; }

    /* LAYOUT TOGGLE ANIMATION */
    .container {
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
  </style>
</head>
<body class="dark-mode">
  
    <div id="lockScreen">
      <div class="lock-title">RESTRICTED</div>
      <input type="password" class="lock-input" id="passwordInput" placeholder="ENTER ACCESS KEY">
      <div class="lock-error" id="lockError">INVALID KEY</div>
    </div>

  <div id="shopContent" style="display:none;">
    <div class="vanguard-layout">
      <!-- FIXED LEFT MENU -->
      <div class="vanguard-left">
        <div>
          <div class="brand-logo">
            <a href="index.html">Dom</a><a href="hidden.html" class="p-link">p</a><a href="index.html">om<br>store</a>
          </div>
          <div class="nav-menu">
            <a class="nav-item" id="cart-icon">Cart (<span id="cart-count">0</span>)</a>
            <a class="nav-item" id="layout-toggle">Toggle Grid</a>
          </div>
        </div>
        <div style="font-size:10px; letter-spacing:0.1em; opacity:0.3; text-transform:uppercase;">
          © 2026 Dompomstore.<br>All rights reserved.
        </div>
      </div>

      <!-- SCROLLABLE RIGHT CONTENT -->
      <div class="vanguard-right">
        <h1 class="huge-title">Secret <i>Vault</i></h1>
        <div class="container" id="main-container">
          
          <div class="product-box" onclick="window.location.href='secret_produkt1.html'">
            <div class="image-wrapper">
              <img src="https://picsum.photos/seed/prv01/400/400" alt="EXCLUSIVE 01">
            </div>
            <div class="product-info-grid">
              <div class="product-name">EXCLUSIVE 01<div class="product-price">VIEW</div></div>
              <div class="product-price-display" style="display:block; margin-top:8px;">
                <span class="usdc-val" data-price="120" style="font-size: 13px; color: #777;">120 USDC</span>
              </div>
            </div>
          </div>

          <div class="product-box" onclick="window.location.href='secret_produkt2.html'">
            <div class="image-wrapper">
              <img src="https://picsum.photos/seed/prv02/400/400" alt="EXCLUSIVE 02">
            </div>
            <div class="product-info-grid">
              <div class="product-name">EXCLUSIVE 02<div class="product-price">VIEW</div></div>
              <div class="product-price-display" style="display:block; margin-top:8px;">
                <span class="usdc-val" data-price="90" style="font-size: 13px; color: #777;">90 USDC</span>
              </div>
            </div>
          </div>

          <div class="product-box" onclick="window.location.href='secret_produkt3.html'">
            <div class="image-wrapper">
              <img src="https://picsum.photos/seed/prv03/400/400" alt="EXCLUSIVE 03">
            </div>
            <div class="product-info-grid">
              <div class="product-name">EXCLUSIVE 03<div class="product-price">VIEW</div></div>
              <div class="product-price-display" style="display:block; margin-top:8px;">
                <span class="usdc-val" data-price="75" style="font-size: 13px; color: #777;">75 USDC</span>
              </div>
            </div>
          </div>

          <div class="product-box" onclick="window.location.href='secret_produkt4.html'">
            <div class="image-wrapper">
              <img src="https://picsum.photos/seed/prv04/400/400" alt="EXCLUSIVE 04">
            </div>
            <div class="product-info-grid">
              <div class="product-name">EXCLUSIVE 04<div class="product-price">VIEW</div></div>
              <div class="product-price-display" style="display:block; margin-top:8px;">
                <span class="usdc-val" data-price="200" style="font-size: 13px; color: #777;">200 USDC</span>
              </div>
            </div>
          </div>
        
        </div>
      </div>
    </div>
    
    <!-- CART DRAWER -->
    <div class="cart-overlay" id="cart-overlay"></div>
    <div id="cart-dropdown">
      <h2 class="cart-title">Cart</h2>
      <div id="cart-items"></div>
      <div class="cart-total">
        <span>Total</span>
        <span id="cart-total-price">0 USD</span>
      </div>
      <button class="checkout-btn" id="proceedCheckout">Proceed to Checkout</button>
    </div>
  </div>

  <script>
    const pwInput = document.getElementById('passwordInput');
    const lockError = document.getElementById('lockError');
    const lockScreen = document.getElementById('lockScreen');
    const shopContent = document.getElementById('shopContent');

    pwInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        if (pwInput.value === 'dompom') {
          sessionStorage.setItem('unlocked', 'true');
          unlockShop();
        } else {
          lockError.style.opacity = '1';
          setTimeout(() => lockError.style.opacity = '0', 2000);
        }
      }
    });

    if (sessionStorage.getItem('unlocked') === 'true') {
      unlockShop();
    }

    function unlockShop() {
      lockScreen.style.opacity = '0';
      setTimeout(() => {
        lockScreen.style.display = 'none';
        shopContent.style.display = 'block';
      }, 800);
    }

    let cart = [];
    const cartCount = document.getElementById("cart-count");
    const cartDrawer = document.getElementById("cart-dropdown");
    const overlay = document.getElementById("cart-overlay");
    const checkoutBtn = document.getElementById("proceedCheckout");

    function loadCart() {
      const stored = localStorage.getItem("cart");
      cart = stored ? JSON.parse(stored) : [];
      updateCart(false);
    }

    function updateCart(save = true) {
      const cartItems = document.getElementById("cart-items");
      const totalPriceEl = document.getElementById("cart-total-price");
      cartItems.innerHTML = "";
      let total = 0;

      if (cart.length === 0) {
        cartItems.innerHTML = "<p style='font-size:11px; opacity:0.5; letter-spacing:0.1em; text-transform:uppercase;'>Cart is empty</p>";
      } else {
        cart.forEach((item, index) => {
          total += item.price;
          const div = document.createElement("div");
          div.classList.add("cart-item");
          div.innerHTML = \`
            <div>
              <div style="font-size:12px; margin-bottom:5px;">\${item.name} (\${item.size || "OS"})</div>
              <div style="opacity:0.5;">\${item.price} USD</div>
            </div>
            <span class="remove-item" onclick="removeItem(\${index})">✕</span>
          \`;
          cartItems.appendChild(div);
        });
      }

      totalPriceEl.innerText = total + " USD";
      cartCount.innerText = cart.length;
      if (save) localStorage.setItem("cart", JSON.stringify(cart));
    }

    window.removeItem = function(index) {
      cart.splice(index, 1);
      updateCart();
    }

    document.getElementById("cart-icon").onclick = () => {
      cartDrawer.classList.add("show");
      overlay.classList.add("show");
    };

    overlay.onclick = () => {
      cartDrawer.classList.remove("show");
      overlay.classList.remove("show");
    };

    window.addEventListener("pageshow", loadCart);
    loadCart();

    // PRODUCT CLICKS (Support both data-link or onclick)
    document.querySelectorAll('.product-box').forEach(box => {
      if (!box.onclick) {
        box.addEventListener('click', () => {
          if (box.dataset.link) window.location.href = box.dataset.link;
        });
      }
    });

    // LAYOUT TOGGLE
    const container = document.getElementById('main-container');
    const layoutBtn = document.getElementById('layout-toggle');
    let layoutMode = localStorage.getItem('layoutMode') || "mode-2";
    
    function applyLayout(mode) {
      container.classList.remove("mode-2", "mode-3");
      container.classList.add(mode);
    }
    applyLayout(layoutMode);
    
    layoutBtn.addEventListener('click', () => {
      layoutMode = layoutMode === "mode-2" ? "mode-3" : "mode-2";
      localStorage.setItem('layoutMode', layoutMode);
      applyLayout(layoutMode);
    });

    // CHECKOUT
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
          alert('Cart is empty.');
          return;
        }
        localStorage.setItem('shopSource', 'private');
        window.location.href = 'secret_checkout.html';
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync('/Users/dompom/Desktop/Dompomstore /hidden.html', cleanHTML);
console.log('Cleaned hidden.html');
