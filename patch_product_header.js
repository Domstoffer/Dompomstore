const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const newHeaderInner = `
<a href="index.html" class="logo" style="text-decoration:none; color:inherit;">
DOM<span class="secret-link" onclick="window.location.href='hidden.html'" style="cursor:pointer; opacity:0.3; transition:0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3">P</span>OMSTORE
</a>

<div class="cart-icon" id="cart-icon">
  <svg class="cart-svg" viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;">
    <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44C7.52 16.37 8.48 18 10 18h9v-2h-8.42c-.14 0-.25-.11-.25-.25l.03-.12L11.1 14h6.45c.75 0 1.41-.41 1.75-1.03L22 7H6"></path>
  </svg>
  <span class="cart-count" id="cart-count">0</span>
</div>
`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace the entire beginning of <header> up to <div id="cart-dropdown">
    const headerRegex = /<header>[\s\S]*?<div id="cart-dropdown">/;
    if (headerRegex.test(content)) {
        content = content.replace(headerRegex, '<header class="store-header">\n' + newHeaderInner + '\n\n    <div id="cart-dropdown">');
    }

    // Double check removal of "Zurück" button
    content = content.replace(/<button class="back-button"[^>]*>Zurück<\/button>/g, '');
    content = content.replace(/<a[^>]*>← Zurück<\/a>/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[HEADER RESTRUCTURE] Updated ${file}`);
    }
});

// Update mobile-luxury.css to properly style .store-header
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.store-header')) {
    cssContent += `
/* PRODUCT PAGE SPECIFIC HEADER */
.store-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 16px !important;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  border-bottom: 1px solid var(--border) !important;
}

body.dark-mode .store-header {
  background: rgba(0, 0, 0, 0.95) !important;
}
`;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('[HEADER RESTRUCTURE] Updated mobile-luxury.css');
}
