const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const targetHTML = `
<div id="cart-dropdown">
  <div class="cart-header">
    <h2 class="cart-title">Cart</h2>
    <span class="close-cart" id="close-cart" style="cursor:pointer; font-size:20px; font-weight:300;">✕</span>
  </div>
  <div id="cart-items"></div>
  <div class="cart-footer">
    <div class="cart-total">
      <span>Total</span>
      <span id="cart-total-price">0 USD</span>
    </div>
    <button class="checkout-btn" id="proceedCheckout">Proceed to Checkout</button>
  </div>
</div>
`;

const targetJS = `
    const cartCount = document.getElementById("cart-count");
    const cartDrawer = document.getElementById("cart-dropdown");
    const overlay = document.getElementById("cart-overlay");
    const checkoutBtn = document.getElementById("proceedCheckout");
    const closeCartBtn = document.getElementById("close-cart");

    let cart = [];

    function loadCart() {
      const stored = localStorage.getItem("cart");
      cart = stored ? JSON.parse(stored) : [];
      updateCart(false);
    }

    function updateCart(save = true) {
      if(!cart) {
          cart = JSON.parse(localStorage.getItem("cart")) || [];
      }
      const cartItems = document.getElementById("cart-items");
      const totalPriceEl = document.getElementById("cart-total-price");
      if(!cartItems || !totalPriceEl) return;
      
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
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
              <div>
                <div style="font-size:12px; margin-bottom:5px;">\${item.name} (\${item.size || "OS"})</div>
                <div style="opacity:0.5;">\${item.price} USD</div>
              </div>
              <span class="remove-item" onclick="removeItem(\${index})" style="cursor:pointer; padding:5px;">✕</span>
            </div>
          \`;
          cartItems.appendChild(div);
        });
      }

      totalPriceEl.innerText = total + " USD";
      if(cartCount) cartCount.innerText = cart.length;
      if (save) localStorage.setItem("cart", JSON.stringify(cart));
    }

    window.removeItem = function(index) {
      cart.splice(index, 1);
      updateCart();
    }

    function openCartDrawer() {
      loadCart();
      if(cartDrawer) cartDrawer.classList.add("show");
      if(overlay) overlay.classList.add("show");
    }

    const cartIconNode = document.querySelector(".cart-icon");
    if(cartIconNode) {
        cartIconNode.onclick = () => {
          openCartDrawer();
        };
    }

    if(closeCartBtn) {
       closeCartBtn.onclick = () => {
          cartDrawer.classList.remove("show");
          overlay.classList.remove("show");
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
      
      const existingItem = cart.find(i => i.name === PRODUCT_NAME && i.size === (selectedSize || "One Size"));
      if (!existingItem) {
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCart();
      }
      
      openCartDrawer();
    }
`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Wipe the old HTML Cart Drawer markup entirely and swap it
    const tightDrawerRegex = /<div id="cart-dropdown">[\s\S]*?<\/div>[\s]*<\/div>[\s]*<\/div>[\s]*<div class="cart-overlay"/;
    const legacyDrawerRegex = /<div id="cart-dropdown">[\s\S]*?<\/div>[\s]*<div class="cart-overlay" id="cart-overlay"><\/div>/;
    const anyDrawerRegex = /<div id="cart-dropdown">[\s\S]*?<\/div>\s*<div class="cart-overlay" id="cart-overlay">\s*<\/div>/;

    if (anyDrawerRegex.test(content)) {
        content = content.replace(anyDrawerRegex, targetHTML + '\n  <div class="cart-overlay" id="cart-overlay"></div>');
    }

    // 2. Erase the buggy/duplicate legacy logic
    const legacyJsStartRegex = /const cartCount[\s\S]*?(?=let selectedSize = null)/;
    if (legacyJsStartRegex.test(content)) {
        content = content.replace(legacyJsStartRegex, targetJS + '\n    ');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[EXACT CART MATCH] Updated DOM and JS on ${file}`);
    } else {
        console.log(`[EXACT CART MATCH] Warning - failed to match regex on ${file}`);
    }
});
