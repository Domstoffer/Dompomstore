const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // REMOVE EXTRA CHECKOUT BUTTONS
    // In `produktX.html`, the cart-footer has a checkout-btn but there might be an extraneous one overlapping the add to cart.
    // Wait, the user complaint is: The "IN DEN WARENKORB" button must not appear inside the cart overlay.
    // Let's check if the Add to Cart button accidentally got placed inside the #cart-dropdown.
    // Product templates have it properly outside.

    // Actually, the user concern:
    // "The "IN DEN WARENKORB" button must not appear inside the cart overlay."
    // Because it's "position: fixed; bottom: 0; z-index: 100", when the cart overlay opens (z-index 999), 
    // the Add to Cart button might still show up if its z-index is higher or not handled.
    // Fix: Make z-index of cart drawer 1000 and Cart Overlay 999. Add to cart is 100.

    // We can do this in the CSS!

    // Fix cart duplicates. Update loadCart/updateCart function if it's flawed.
    // The cart items append block:
    const oldCartLoop = `cart.forEach((item, index) => {`;
    if (content.includes(oldCartLoop)) {
        // Ensure we clear first
        if (!content.includes('cartItems.innerHTML = "";')) {
            content = content.replace('let total = 0;', 'cartItems.innerHTML = "";\n      let total = 0;');
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[CART UI FIX] Updated ${file}`);
    }
});

// Update the CSS file to strictly enforce Z-indexes and fix Product Page layout.
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
/* CRITICAL FIXES FOR Z-INDEX AND MOBILE PRODUCT VIEW */
@media (max-width: 768px) {
  .add-to-cart {
    z-index: 90 !important; /* Must be lower than cart overlay (998) and drawer (999) */
  }
  .cart-overlay {
    z-index: 998 !important;
  }
  #cart-dropdown, .cart-drawer {
    z-index: 999 !important;
  }

  /* Force Product page to fit one screen without massive scroll */
  .info-side {
    padding: 0 16px 80px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
  }
  .product-title { margin-bottom: 0 !important; }
  .product-price { margin-bottom: 0 !important; }
  .size-label { margin-bottom: 0 !important; margin-top: 10px !important; }
  .size-row, .mobile-size-pills { margin-bottom: 10px !important; }
  .info-accordion { display: none !important; /* Hide accordion on mobile to save space */ }
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[CART UI FIX] Updated mobile-luxury.css');
