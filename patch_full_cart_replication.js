const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

// B) CART ICON (Explicit replication requested by user)
const exactCartIconHTML = `<div class="cart-icon" onclick="openCartDrawer()">
  <svg viewBox="0 0 24 24" class="cart-svg">
    <path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2h-11.42c-.14 0-.25-.11-.25-.25l.03-.12 1.1-1.98h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49-1.74-1-3.58 6.49h-8.11l-.94-2h10.05v-2h-11z"/>
  </svg>
  <span id="cart-count">0</span>
</div>`;

// A) CART HTML (Explicit drawer overlay structure)
const exactCartDrawerHTML = `
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
  </div>`;

// C) JAVASCRIPT (Explicit extraction from index.html)
const exactJavaScriptHTML = `
    const cartCount = document.getElementById("cart-count");
    const cartDrawer = document.getElementById("cart-dropdown");
    const overlay = document.getElementById("cart-overlay");
    const checkoutBtn = document.getElementById("proceedCheckout");

    function loadCart() {
      const stored = localStorage.getItem("cart");
      let cart = stored ? JSON.parse(stored) : [];
      updateCart(cart, false);
    }

    function updateCart(cart, save = true) {
      if(!cart) {
          cart = JSON.parse(localStorage.getItem("cart")) || [];
      }
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
      if(cartCount) cartCount.innerText = cart.length;
      if (save) localStorage.setItem("cart", JSON.stringify(cart));
    }

    window.removeItem = function(index) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCart(cart);
    }

    function openCartDrawer() {
      const stored = localStorage.getItem("cart");
      let cart = stored ? JSON.parse(stored) : [];
      updateCart(cart, false);
      if(cartDrawer) cartDrawer.classList.add("show");
      if(overlay) overlay.classList.add("show");
    }

    const cartIconNode = document.querySelector(".cart-icon");
    if(cartIconNode) {
        cartIconNode.onclick = () => {
          openCartDrawer();
        };
    }

    if(overlay) {
        overlay.onclick = () => {
          cartDrawer.classList.remove("show");
          overlay.classList.remove("show");
        };
    }

    window.addEventListener("pageshow", loadCart);
    document.addEventListener("DOMContentLoaded", function() {
      loadCart();
    });

    // The user's exact specification merged with size selection
    function addToCart() {
      const sizeList = document.querySelectorAll('.size-pill');
      let selectedSize = null;
      if (sizeList.length > 0) {
        sizeList.forEach(p => { if (p.classList.contains('selected')) selectedSize = p.innerText; });
      } else {
        const legacySizes = document.querySelectorAll('.size-btn');
        legacySizes.forEach(p => { if (p.classList.contains('selected')) selectedSize = p.innerText; });
      }

      if (!selectedSize && document.querySelector('.size-row')) { 
         // There are sizes but they selected nothing
         alert('Bitte wähle eine Größe'); 
         return; 
      }

      let product = { name: PRODUCT_NAME, price: PRODUCT_PRICE, size: selectedSize || "One Size", qty: 1 };
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      
      const existingItem = cart.find(i => i.name === PRODUCT_NAME && i.size === (selectedSize || "One Size"));
      if (!existingItem) {
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
      }
      
      openCartDrawer();
    }

    let selectedSize = null;
    function selectSize(size, el) {
      selectedSize = size;
      document.querySelectorAll('.size-btn, .size-pill').forEach(btn => btn.classList.remove('selected'));
      el.classList.add('selected');
    }

    if(checkoutBtn){
      checkoutBtn.addEventListener('click', () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        if (cart.length === 0) {
          alert('Cart is empty.');
          return;
        }
        window.location.href = 'checkout.html';
      });
    }

    // Initialize UI silently
    loadCart();

`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Swap Cart Navigation Icon identically
    const navCartRegex = /<div class="cart-icon" onclick="openCartDrawer\(\)">[\s\S]*?<\/div>\s*<\/header>/;
    if (navCartRegex.test(content)) {
        content = content.replace(navCartRegex, exactCartIconHTML + '\n\n</header>');
    }

    // 2. Wipe Cart Drawer markup and replace
    // It looks like we already enforced this heavily in previous steps, but we must guarantee "Cart" layout match:
    const drawerRegex = /<div id="cart-dropdown">[\s\S]*?<\/div>\s*<\/div>\s*<div class="cart-overlay" id="cart-overlay"><\/div>/;
    const tightDrawerRegex = /<div id="cart-dropdown">[\s\S]*?<\/div>[\s]*<div class="cart-overlay" id="cart-overlay"><\/div>/;
    const standardObj = /<div id="cart-dropdown">[\s\S]*?<\/div>\s*<\/div>/;

    // Let's grab whatever <div id="cart-dropdown"> ... checkout-btn ... </div> pattern exists + overlay
    const catchAllDrawer = /<!-- CART DRAWER -->[\s\S]*?proceedCheckout">Proceed to Checkout<\/button>\s*<\/div>\s*<\/div>/;
    const basicOverlay = /<div class="cart-overlay" id="cart-overlay"><\/div>/;

    if (catchAllDrawer.test(content)) {
        content = content.replace(catchAllDrawer, exactCartDrawerHTML);
    } else if (content.includes('id="cart-dropdown"')) {
        const manualSplitRegex = /<div id="cart-dropdown">[\s\S]*?proceedCheckout.*?<\/button>\s*<\/div>/;
        content = content.replace(manualSplitRegex, exactCartDrawerHTML.replace('<!-- CART DRAWER -->\n    <div class="cart-overlay" id="cart-overlay"></div>\n    ', ''));
    }

    // 3. Clear completely all prior logic block inside script tags related to dropdown manually:
    const jsClearPattern = /const cartCount[\s\S]*?(?=function toggleDescription)/;
    if (jsClearPattern.test(content)) {
        content = content.replace(jsClearPattern, exactJavaScriptHTML + '\n\n    ');
    } else {
        // A slightly older syntax might be lingering
        const jsAltClearPattern = /const cartCount[\s\S]*?(?=<\/script>)/;
        if (jsAltClearPattern.test(content)) {
            content = content.replace(jsAltClearPattern, exactJavaScriptHTML + '\n\n  ');
        }
    }


    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[MASTER SYNC] Transplanted root index UI and JS to ${file}`);
    }
});

const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// The CSS cart variables requested:
cssContent += `
/* EXPLICIT INDEX CART CSS SYNC */
.cart-icon{
position:absolute !important;
right:20px !important;
top:50% !important;
transform:translateY(-50%) !important;
cursor:pointer !important;
}

.cart-svg{
width:22px !important;
height:22px !important;
stroke:black !important;
fill:none !important;
stroke-width:2 !important;
}

#cart-count{
position:absolute !important;
top:-6px !important;
right:-6px !important;
background:black !important;
color:white !important;
font-size:10px !important;
padding:2px 5px !important;
border-radius:50% !important;
display:flex !important;
justify-content:center !important;
align-items:center !important;
}
`;
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log(`[MASTER SYNC] Synced absolute positioning CSS rules strictly`);
