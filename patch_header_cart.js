const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

const svgCartHTML = `
      <div class="cart-icon" id="cart-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:20px;height:20px;">
          <path d="M6 2l1 5h10l1-5z" />
          <path d="M2 7h20v14H2z" />
        </svg>
        <span class="cart-count" id="cart-count">0</span>
      </div>
`.trim();

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace text-based CART (0) with the new modular SVG icon component.
    content = content.replace(/<a class="nav-item" id="cart-icon">Cart \(<span id="cart-count">\d+<\/span>\)<\/a>/g, svgCartHTML);

    // In index.html, we need to make sure the JS updating cart count doesn't hide/show differently.
    // The product page hides it with style="display:none;" when 0, but the standard script might just change the innerText.
    // The user prompt expects: "Homepage header now shows the same cart icon... Ensure counter updates dynamically."
    // The current JS updates document.getElementById("cart-count").innerText = cart.length; This should work globally.

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[HEADER UX] Updated ${file}`);
    }
});

// Now append the required CSS mapping for the icon to mobile-luxury.css
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
/* GLOBAL EXACT CART ICON PORTING */
.cart-icon {
  position: relative !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
}

.cart-icon svg {
  width: 20px !important;
  height: 20px !important;
  stroke: var(--text) !important;
  fill: none !important;
  transition: transform 0.2s !important;
}

body.dark-mode .cart-icon svg {
  stroke: #ffffff !important;
}

.cart-count {
  position: absolute !important;
  top: -6px !important;
  right: -6px !important;
  background: var(--text) !important;
  color: var(--bg) !important;
  font-size: 11px !important;
  width: 18px !important;
  height: 18px !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: bold !important;
}

body.dark-mode .cart-count {
  background: #ffffff !important;
  color: #000000 !important;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[HEADER UX] Updated CSS styling for dynamic SVG cart UI.');
