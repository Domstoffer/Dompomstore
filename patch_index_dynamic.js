const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const indexPath = path.join(dirPath, 'index.html');

let content = fs.readFileSync(indexPath, 'utf8');
let orig = content;

// Inject scripts right before closing body
if (!content.includes('src="products.js"')) {
    content = content.replace(/<\/body>/i, `
<script src="products.js"></script>
<script src="cart.js"></script>
</body>`);
}

// Remove the old inline cart logic from index.html (since we are now using cart.js)
const scriptRegex = /<script>\s*let cart = \[\];[\s\S]*?\/\/ CHECKOUT[\s\S]*?\}\s*<\/script>/;
content = content.replace(scriptRegex, '<script>\n    // CART LOGIC MOVED TO cart.js\n</script>');

// Update data-link attributes to use dynamic routing via produkt.html?id=ID
content = content.replace(/data-link="produkt1.html"/g, 'data-link="produkt.html?id=DB-01"');
content = content.replace(/data-link="produkt2.html"/g, 'data-link="produkt.html?id=PS-01"');
content = content.replace(/data-link="produkt3.html"/g, 'data-link="produkt.html?id=TESTCY"');
content = content.replace(/data-link="produkt4.html"/g, 'data-link="produkt.html?id=ZYN"');
content = content.replace(/data-link="produkt5.html"/g, 'data-link="produkt.html?id=PROD-05"'); // Even though there was no produkt5.html, it's defined in index.html

if (content !== orig) {
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log("Updated index.html successfully with dynamic links and externalized scripts.");
} else {
    console.log("No changes detected or scripts already injected.");
}
