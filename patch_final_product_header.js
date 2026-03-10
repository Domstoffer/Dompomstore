const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const exactIndexHeader = `<header class="store-header" style="display:flex; justify-content:flex-end; align-items:center; padding:16px; position:relative;">
  <div class="brand-logo" style="position:absolute; left:50%; top:50%; transform:translate(-50%, -50%);"><a href="index.html" style="text-decoration:none; color:inherit;">DOM</a><a href="hidden.html" class="secret-link" style="cursor:pointer; opacity:0.3; transition:0.3s; text-decoration:none; color:inherit;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3">P</a><a href="index.html" style="text-decoration:none; color:inherit;">OMSTORE</a></div>

  <div class="cart-icon" id="cart-icon" onclick="openCartDrawer()" style="position:relative; cursor:pointer;">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:20px;height:20px;">
      <path d="M6 2l1 5h10l1-5z" />
      <path d="M2 7h20v14H2z" />
    </svg>
    <span class="cart-count" id="cart-count">0</span>
  </div>
</header>`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Rip out the buggy header we inserted in the last turn
    const headerRegex = /<header class="store-header">[\s\S]*?<\/header>/g;
    content = content.replace(headerRegex, exactIndexHeader);

    // Also fix any updateCartCounter discrepancies in the JS, ensuring it targets 'cart-count' and not 'cartCount'
    content = content.replace(/document\.getElementById\(['"]cartCount['"]\)/g, 'document.getElementById("cart-count")');
    // Just in case I missed it
    content = content.replace(/const cc = document.getElementById\("cartCount"\);/g, 'const cc = document.getElementById("cart-count");');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[SYNC UX] Updated DOM on ${file}`);
    }
});
