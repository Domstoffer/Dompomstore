const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => /^produkt\d+\.html$/.test(f) || /^secret_produkt\d+\.html$/.test(f));

const newCartIcon = `
<div class="cart-icon" id="cart-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:20px;height:20px;">
    <path d="M6 2l1 5h10l1-5z" />
    <path d="M2 7h20v14H2z" />
  </svg>
  <span class="cart-count" id="cart-count">0</span>
</div>
`.trim();

const newCartDrawer = `
<div class="cart-overlay" id="cart-overlay"></div>

<div id="cart-dropdown">
  <h2 class="cart-title">Cart</h2>
  <div id="cart-items"></div>

  <div class="cart-total">
    <span>Total</span>
    <span id="cart-total-price">0 USD</span>
  </div>

  <button class="checkout-btn" id="proceedCheckout">
    Proceed to Checkout
  </button>
</div>
`.trim();

const newCartJs = `
let cart = [];
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-dropdown");
const overlay = document.getElementById("cart-overlay");

function loadCart(){
  const stored = localStorage.getItem("cart");
  cart = stored ? JSON.parse(stored) : [];
  updateCart(false);
}

function updateCart(save=true){

  const cartItems = document.getElementById("cart-items");
  const totalPriceEl = document.getElementById("cart-total-price");

  cartItems.innerHTML="";
  let total=0;

  if(cart.length===0){

    cartItems.innerHTML="<p style='font-size:11px;opacity:0.5;'>Cart is empty</p>";

  } else {

    cart.forEach((item,index)=>{

      total+=item.price;

      const div=document.createElement("div");
      div.classList.add("cart-item");

      div.innerHTML=\`
      <div>
        <div style="font-size:12px;margin-bottom:5px;">
        \${item.name} (\${item.size||"OS"})
        </div>
        <div style="opacity:0.5;">\${item.price} USD</div>
      </div>
      <span onclick="removeItem(\${index})">✕</span>
      \`;

      cartItems.appendChild(div);

    });

  }

  totalPriceEl.innerText=total+" USD";
  cartCount.innerText=cart.length;

  if(save) localStorage.setItem("cart",JSON.stringify(cart));
}

function removeItem(index){
  cart.splice(index,1);
  updateCart();
}

document.getElementById("cart-icon").onclick=()=>{
  cartDrawer.classList.add("show");
  overlay.classList.add("show");
}

overlay.onclick=()=>{
  cartDrawer.classList.remove("show");
  overlay.classList.remove("show");
}

window.addEventListener("pageshow",loadCart);

loadCart();

function addToCart(name,price,size){

cart.push({
name:name,
price:price,
size:size
});

updateCart();

}
`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Replace Cart Icon
    // Finds <div class="cart-icon" ...> ... </div>
    content = content.replace(/<div class="cart-icon"[^>]*>[\s\S]*?<\/svg>\s*<span[^>]*>.*?<\/span>\s*<\/div>/i, newCartIcon);

    // 2. Replace Cart Drawer
    // Replace <div class="cart-overlay"... to the closing </div> of cart-dropdown
    content = content.replace(/<div class="cart-overlay"[^>]*><\/div>\s*<div id="cart-dropdown">[\s\S]*?<button class="checkout-btn"[^>]*>.*?<\/button>\s*<\/div>/i, newCartDrawer);

    // 3. Replace the old cart JS system logic inside <script>
    // We want to replace everything from `const cartCount = ` down to before `let selectedSize = null;` or `function toggleDescription()`
    // First, we find the old JS chunk
    const scriptContentRegex = /(const cartCount\s*=\s*document\.getElementById\("cart-count"\);[\s\S]*?)(let selectedSize\s*=|\/\/ Initialize UI silently|function toggleDescription\(\))/;
    const match = content.match(scriptContentRegex);

    if (match) {
        // We replace only the cart functionality
        content = content.replace(match[1], newCartJs + "\\n\\n  ");
    }

    // 4. Clean up any duplicated `addToCart` functions if they exist further down
    // Since we inject newCartJs that has `function addToCart`, let's remove the old one if it is there
    content = content.replace(/function addToCart\(\)\s*{[\s\S]*?openCartDrawer\(\);\s*}/g, '');

    // 5. Ensure button `<button class="add-to-cart"` exists. If it doesn't, add it back right before description-toggle!
    if (!content.includes('class="add-to-cart"')) {
        const btnHtml = `\n      <button class="add-to-cart" onclick="addToCart(PRODUCT_NAME, PRODUCT_PRICE, typeof selectedSize !== 'undefined' && selectedSize ? selectedSize : 'OS')">In den Warenkorb</button>\n`;
        // Insert before <div class="description-toggle"
        content = content.replace(/(<div class="description-toggle")/i, btnHtml + "\\n      $1");
    } else {
        // If it DOES exist, ensure its onclick passes the arguments
        content = content.replace(/<button class="add-to-cart"([^>]*)>/g, (m, p1) => {
            // remove old onclick
            let clean = p1.replace(/onclick="[^"]*"/g, '');
            return `<button class="add-to-cart"${clean} onclick="addToCart(PRODUCT_NAME, PRODUCT_PRICE, typeof selectedSize !== 'undefined' && selectedSize ? selectedSize : 'OS')">`;
        });
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
});

console.log('SUCCESS');
