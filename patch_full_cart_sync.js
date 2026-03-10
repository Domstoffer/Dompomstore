const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const targetHTML = `
    <!-- CART DRAWER -->
    <div class="cart-overlay" id="cart-overlay"></div>
    <div id="cart-dropdown">
      <h2 class="cart-title">Cart</h2>
      <div id="cart-items"></div>
      <div class="cart-total">
        <span>Total</span>
        <span id="cart-total-price">0 USDC</span>
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
              <div style="opacity:0.5;">\${item.price} USDC</div>
            </div>
            <span class="remove-item" onclick="removeItem(\${index})">✕</span>
          \`;
          cartItems.appendChild(div);
        });
      }

      totalPriceEl.innerText = total + " USDC";
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
          alert('Dein Warenkorb ist leer!');
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

    // 1. Wipe the old HTML Cart Drawer markup entirely and swap it
    const drawerRegex = /<div id="cart-dropdown">[\s\S]*?<\/div>\s*<\/div>\s*<div class="cart-overlay" id="cart-overlay"><\/div>/;

    // Actually, look closely. Our file has:
    // <div id="cart-dropdown">
    //     <div class="cart-header">...</div>
    //     ...
    //     <button class="checkout-btn" ...>
    // </div>
    // <div class="cart-overlay" id="cart-overlay"></div>
    // Let's use robust string replacing or tighter regex
    const tightDrawerRegex = /<div id="cart-dropdown">[\s\S]*?<\/div>[\s]*<div class="cart-overlay" id="cart-overlay"><\/div>/;
    if (tightDrawerRegex.test(content)) {
        content = content.replace(tightDrawerRegex, targetHTML);
    }

    // 2. Erase the buggy/duplicate legacy logic
    const legacyJsStartRegex = /const cartDrawer = document\.getElementById\("cart-dropdown"\);[\s\S]*?(?=function toggleDescription)/;
    if (legacyJsStartRegex.test(content)) {
        content = content.replace(legacyJsStartRegex, targetJS + '\n    ');
    }

    // Double check missing cart button hook
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[FULL CART SYNC] Updated DOM and JS on ${file}`);
    } else {
        console.log(`[FULL CART SYNC] Warning - failed to match regex on ${file}`);
    }
});
