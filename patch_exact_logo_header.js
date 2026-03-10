const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const newHeaderStr = `<header class="store-header">
  <div class="logo">DOMPOMSTORE</div>

  <div class="cart-icon" onclick="toggleCart()">
    <svg viewBox="0 0 24 24" width="24" height="24">
<path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44C7.52 16.37 8.48 18 10 18h9v-2h-8.42c-.14 0-.25-.11-.25-.25l.03-.12L11.1 14h6.45c.75 0 1.41-.41 1.75-1.03L22 7H6"></path>
</svg>
    <span id="cart-count">0</span>
  </div>
</header>`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // STEP 1 - Remove the entire "IN DEN WARENKORB" button safely
    // <button class="add-to-cart" id="addBtn" onclick="addToCart()">In den Warenkorb</button>
    content = content.replace(/<button class="add-to-cart"[^>]*>In den Warenkorb<\/button>/gi, '');

    // STEP 2 & 3 - Replace the entire `store-header` with exact spec
    // Remember that previously we had <div id="cart-dropdown"> *outside* store-header thanks to our fix, so we just replace the header tag element
    content = content.replace(/<header class="store-header">[\s\S]*?<\/header>/g, newHeaderStr);

    // Wait, the prompt specified a global "toggleCart()" function in the HTML "onclick". But our logic uses openCartDrawer().
    // Step 4 specifies "Reuse the SAME JavaScript cart logic used on index.html ... open the same cart drawer"
    // So we will stick to the user's exact string `toggleCart()` and map that in the patching block, or change it to `openCartDrawer()`
    // I will replace `toggleCart()` with `openCartDrawer()` to strictly map exactly to the logic they want reused.
    content = content.replace(/onclick="toggleCart\(\)"/, 'onclick="openCartDrawer()"');

    // Also replace `id="cartCount"` to `id="cart-count"` in the JS payload because the user's new string has `<span id="cart-count">0</span>`
    content = content.replace(/document\.getElementById\(['"]cartCount['"]\)/g, 'document.getElementById("cart-count")');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[SYS] Updated DOM on ${file}`);
    }
});

// Update the exact CSS required
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
/* PRECISE HEADER FIX */
.store-header{
display:flex;
justify-content:space-between;
align-items:center;
padding:20px;
}

.cart-icon{
position:relative;
cursor:pointer;
}

#cart-count{
position:absolute;
top:-6px;
right:-8px;
background:black;
color:white;
font-size:12px;
padding:2px 6px;
border-radius:50%;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log(`[SYS] Updated CSS rules inside mobile-luxury.css`);
