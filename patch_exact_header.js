const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const exactHeaderStr = `<header class="store-header">

<h1 class="logo">
DOM<span class="secret-link" onclick="window.location.href='hidden.html'" style="cursor:pointer; opacity:0.3; transition:0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.3">P</span>OMSTORE
</h1>

<div class="cart-icon" id="cartButton">

<svg viewBox="0 0 24 24" width="24" height="24">
<path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.44C7.52 16.37 8.48 18 10 18h9v-2h-8.42c-.14 0-.25-.11-.25-.25l.03-.12L11.1 14h6.45c.75 0 1.41-.41 1.75-1.03L22 7H6"></path>
</svg>

<span class="cart-count" id="cartCount">0</span>

</div>

</header>`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // STEP 1 - Remove "Zurück"
    content = content.replace(/<button class="back-button"[^>]*>Zurück<\/button>/g, '');

    // STEP 2 - Replace Header
    // We need to match the previous injected block and replace up to cart-dropdown if necessary
    // To be robust, let's just replace the exact <header class="store-header"> ... </header> we built

    // A clean robust regex to find the store-header injected previously 
    const oldHeaderBlock = /<header class="store-header">[\s\S]*?<\/header>/g;

    // If we can't cleanly regex out the old exact block, we'll need to be careful.
    // Wait, our previous injection had <div id="cart-dropdown"> *inside* the <header class="store-header"> tag!
    // The user prompt expects `<header class="store-header">...</header>` to completely close, independently of the cart dropdown.
    // So we must fix that structural bug too.

    const badStructureRegex = /<header class="store-header">[\s\S]*?<div id="cart-dropdown">([\s\S]*?)<\/header>/;

    if (badStructureRegex.test(content)) {
        // It has the nested cart dropdown.
        content = content.replace(badStructureRegex, exactHeaderStr + '\n\n<div id="cart-dropdown">$1');
    }

    // Also replace any old instances of `updateCart()` where `cart-count` was used, to `cartCount` to make it work
    content = content.replace(/document\.getElementById\(['"]cart-count['"]\)/g, 'document.getElementById("cartCount")');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[EXACT HEADER] Updated ${file}`);
    }
});

// Update CSS
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// Scrub our previous .store-header styling just in case it conflicts, though it was mostly additive
// We'll just enforce the exact rules user provided at the bottom of the file
cssContent += `
/* EXACT HOMEPAGE HEADER ALIGNMENT */
.store-header{
display:flex;
justify-content:space-between;
align-items:center;
padding:16px;
}

.logo{
font-size:18px;
letter-spacing:4px;
}

.cart-icon{
position:relative;
cursor:pointer;
}

.cart-count{
position:absolute;
top:-6px;
right:-6px;
background:black;
color:white;
font-size:11px;
width:18px;
height:18px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[EXACT HEADER] Updated mobile-luxury.css');
