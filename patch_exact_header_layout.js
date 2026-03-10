const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const exactIndexHeader = `<header class="store-header">
  <button id="gridToggle" class="grid-toggle-btn" onclick="window.location.href='index.html'" style="background:none; border:none; font-size:24px; cursor:pointer;">+</button>

  <div class="logo" style="position:absolute; left:50%; transform:translateX(-50%);">
    <a href="index.html" style="text-decoration:none; color:inherit;">DOM</a><a href="hidden.html" class="secret-link" style="cursor:pointer; opacity:0.3; transition:0.3s; text-decoration:none; color:inherit;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3">P</a><a href="index.html" style="text-decoration:none; color:inherit;">OMSTORE</a>
  </div>

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

    // Rip out the buggy header
    const headerRegex = /<header class="store-header"[\s\S]*?<\/header>/g;
    content = content.replace(headerRegex, exactIndexHeader);

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[SYNC UX] Updated DOM on ${file}`);
    }
});

// Update the exact CSS rules required
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// I will just append the explicit header styles overriding the buggy ones
cssContent += `
/* EXACT HEADER LAYOUT FIX */
.store-header{
display:flex;
justify-content:space-between;
align-items:center;
padding:20px;
position:relative;
}

.logo{
position:absolute;
left:50%;
transform:translateX(-50%);
font-size:20px;
letter-spacing:4px;
font-weight:600;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[SYNC UX] Updated mobile-luxury.css');
