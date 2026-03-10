const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

// Preserving the secret inner 'P' routing while matching exactly the layout requested:
const exactHeaderStr = `<header class="store-header">

<div class="logo">
<a href="index.html" style="text-decoration:none; color:inherit;">DOM</a><a href="hidden.html" class="secret-link" style="cursor:pointer; opacity:0.3; transition:0.3s; text-decoration:none; color:inherit;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3">P</a><a href="index.html" style="text-decoration:none; color:inherit;">OMSTORE</a>
</div>

<div class="cart-icon" onclick="openCartDrawer()">
<svg class="cart-svg" viewBox="0 0 24 24">
<path d="M7 4h-2l-1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2h-11.42c-.14 0-.25-.11-.25-.25l.03-.12 1.1-1.98h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49-1.74-1-3.58 6.49h-8.11l-.94-2h10.05v-2h-11z"/>
</svg>

<span id="cart-count">0</span>

</div>

</header>`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Wipe the older header out
    const headerRegex = /<header class="store-header"[\s\S]*?<\/header>/g;
    content = content.replace(headerRegex, exactHeaderStr);

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[DEDICATED HEADER] Updated DOM on ${file}`);
    }
});

// Update the CSS rules explicitly replacing the previous overlapping layout
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
/* ISOLATED PRODUCT HEADER ALIGNMENT */
header{
display:flex !important;
align-items:center !important;
justify-content:space-between !important;
padding:20px !important;
position:relative !important;
}

.logo{
position:absolute !important;
left:50% !important;
transform:translateX(-50%) !important;
font-size:20px;
letter-spacing:4px;
font-weight:600;
}

.cart-icon{
position:absolute !important;
right:20px !important;
top:50% !important;
transform:translateY(-50%) !important;
cursor:pointer !important;
}

.cart-svg{
width:22px !important;
height:22px !important;
stroke:black !important;
fill:none !important;
stroke-width:2 !important;
}

#cart-count{
position:absolute !important;
top:-6px !important;
right:-6px !important;
background:black !important;
color:white !important;
font-size:10px !important;
padding:2px 5px !important;
border-radius:50% !important;
display:flex !important;
justify-content:center !important;
align-items:center !important;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[DEDICATED HEADER] Updated css styles');
