const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // TASK 1: Restore secret P link in the header.
    // We need to carefully replace the solid "DOMPOMSTORE" text with the secret anchor.
    content = content.replace(/<a href="index\.html" class="logo">DOMPOMSTORE<\/a>/g, '<a href="index.html" class="logo">DOM<span onclick="window.location.href=\\\'hidden.html\\\'" style="cursor:pointer;" class="secret-link">P</span>OMSTORE</a>');
    content = content.replace(/<div class="brand-logo"><a href="index\.html">DOMPOMSTORE<\/a><\/div>/g, '<div class="brand-logo"><a href="index.html">DOM</a><a href="hidden.html" class="secret-link" style="cursor:pointer; opacity:0.3; transition:0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3">P</a><a href="index.html">OMSTORE</a></div>');

    // TASK 2: Remove "VIEW" from under product cards.
    // The structure is usually <div class="product-price">VIEW</div> or similar near the product-name.
    content = content.replace(/<div class="product-price">VIEW<\/div>/g, '');

    // TASK 5: Prevent Duplicate Items in Cart Rendering (Clear DOM before rendering).
    // The loadCart/updateCart function already has cartItems.innerHTML = ""; in the previous versions,
    // but let's ensure the JS inside `index.html` and `produktX.html` doesn't double-down on it.

    // Actually, wait, let's just make sure we are not pushing duplicates in addToCart() in produkt pages.
    if (file.includes('produkt') && !file.includes('secret')) {
        // Inject the addToCart logic that checks for existing sizes/names before pushing to prevent duplicates.
        const cartFixStr = `
    function addToCart() {
      const sizeList = document.querySelectorAll('.size-pill');
      let selectedSize = null;
      sizeList.forEach(p => { if (p.classList.contains('selected')) selectedSize = p.innerText; });
      if (!selectedSize) { alert('Bitte wähle eine Größe'); return; }
      
      const existingItem = cart.find(i => i.name === PRODUCT_NAME && i.size === selectedSize);
      if (existingItem) {
        // Just open the cart, it's already there
      } else {
        cart.push({ name: PRODUCT_NAME, price: PRODUCT_PRICE, size: selectedSize, qty: 1 });
      }
      
      updateCart();
      document.getElementById('cart-dropdown').classList.add('show');
      document.getElementById('cart-overlay').classList.add('show');
    }
    `;

        // Replace the old addToCart function with the deduplicated one.
        content = content.replace(/function addToCart\(\) \{[\s\S]*?updateCart\(\);[\s\S]*?\}/, cartFixStr);
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[UI FIXES] Updated ${file}`);
    }
});
