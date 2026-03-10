const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const newCartLogic = `
    const cartDrawer = document.getElementById("cart-dropdown");
    const overlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart");

    function updateCartCounter() {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const cc = document.getElementById("cartCount");
      if (cc) {
        cc.textContent = cart.length;
        cc.style.display = cart.length > 0 ? "flex" : "none";
      }
    }

    function openCartDrawer() {
      updateCartUI();
      if(cartDrawer) cartDrawer.classList.add("show");
      if(overlay) overlay.classList.add("show");
    }

    document.getElementById("cartButton").onclick = function() {
      openCartDrawer();
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

    document.addEventListener("DOMContentLoaded", function() {
      updateCartCounter();
    });

    window.addEventListener("pageshow", function () {
      updateCartCounter();
    });

    // The user's exact specification merged with size selection
    function addToCart() {
      const sizeList = document.querySelectorAll('.size-pill');
      let selectedSize = null;
      if (sizeList.length > 0) {
        sizeList.forEach(p => { if (p.classList.contains('selected')) selectedSize = p.innerText; });
        if (!selectedSize) { alert('Bitte wähle eine Größe'); return; }
      } else {
        const legacySizes = document.querySelectorAll('.size-btn');
        legacySizes.forEach(p => { if (p.classList.contains('selected')) selectedSize = p.innerText; });
      }

      let product = { name: PRODUCT_NAME, price: PRODUCT_PRICE, size: selectedSize || "One Size", qty: 1 };
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      
      const existingItem = cart.find(i => i.name === PRODUCT_NAME && i.size === (selectedSize || "One Size"));
      if (!existingItem) {
        cart.push(product);
        localStorage.setItem("cart", JSON.stringify(cart));
      }
      
      updateCartCounter();
      openCartDrawer();
    }

    function updateCartUI() {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      const cartItems = document.getElementById("cart-items");
      const totalPriceEl = document.getElementById("cart-total-price");

      if(!cartItems || !totalPriceEl) return;

      cartItems.innerHTML = "";
      let total = 0;

      if (cart.length === 0) {
        cartItems.innerHTML = "<p style='font-size:14px; padding: 24px;'>Warenkorb leer</p>";
      } else {
        cart.forEach((item, index) => {
          total += item.price;
          const div = document.createElement("div");
          div.classList.add("cart-item");
          div.innerHTML = \`
            <div class="cart-left">
              <span class="cart-item-name">\${item.name}</span>
              <span class="cart-item-size">Size: \${item.size || "One Size"}</span>
            </div>
            <div style="display:flex; align-items:center;">
              <span style="font-weight: 500;">\${item.price} USDC</span>
              <span class="remove-item" onclick="removeItem(\${index})" style="cursor:pointer; margin-left:10px;">×</span>
            </div>
          \`;
          cartItems.appendChild(div);
        });
      }

      totalPriceEl.innerText = total + " USDC";
    }

    function removeItem(index) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartUI();
      updateCartCounter();
    }

    let selectedSize = null;
    function selectSize(size, el) {
      selectedSize = size;
      document.querySelectorAll('.size-btn, .size-pill').forEach(btn => btn.classList.remove('selected'));
      el.classList.add('selected');
    }

    const checkoutBtn = document.getElementById('goToCheckoutBtn');
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
    updateCartUI();
`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // We need to replace everything starting from `let cart = [];` down to right before `const descToggle = ...`
    // We can use a regex to match the old JS block
    const jsBlockRegex = /let cart = \[\];[\s\S]*?(?=const descToggle|\/\/ The user's exact specification)/;

    if (jsBlockRegex.test(content)) {
        content = content.replace(jsBlockRegex, newCartLogic + '\n\n    ');
    } else {
        // fallback if it was already modified or regex failed
        console.log("[WARN] Could not find legacy JS block in " + file);
    }

    // Also fix checkout button ids in HTML if needed
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("[SYNC CART SYSTEM]" + file + " updated");
    }
});
