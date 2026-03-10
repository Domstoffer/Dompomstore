const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // We are searching for the exact sequence: 
    // <h1 class="product-title">DB-01</h1>
    // <div class="product-price">49 USDC</div>
    // and wrapping it inside <div class="product-info"> ... </div>

    const titlePriceRegex = /<h1 class="product-title">(.*?)<\/h1>\s*<div class="product-price">(.*?)<\/div>/g;

    if (titlePriceRegex.test(content) && !content.includes('<div class="product-info-centered">')) {
        content = content.replace(titlePriceRegex, '<div class="product-info-centered">\n<h1 class="product-title">$1</h1>\n<div class="product-price">$2</div>\n</div>');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[CENTER ALIGN] Wrapped title/price on ${file}`);
    }
});

// Update the CSS file with the centering styles
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
/* EXPLICIT PRODUCT TITLE OVERRIDES */
.product-info-centered {
text-align:center;
margin-top:20px;
width:100%;
}

.product-title{
text-align:center !important;
width:100% !important;
margin-top:20px !important;
}

.product-price{
text-align:center !important;
width:100% !important;
margin-top:8px !important;
color:#888 !important;
font-size:18px !important;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[CENTER ALIGN] Injected centering CSS into mobile-luxury.css');
