const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'produkt1.html');
let template = fs.readFileSync(templatePath, 'utf8');

// Convert template to DARK MODE
template = template.replace(/body\s*{\s*font-family:\s*'Inter',\s*sans-serif;\s*background:\s*#ffffff;\s*color:\s*#000000;/g,
    "body { font-family: 'Inter', sans-serif; background: #000000; color: #ffffff;");
template = template.replace(/header\s*{[^}]+background:\s*#ffffff;/g, (match) => match.replace('background: #ffffff;', 'background: #000000;'));
template = template.replace(/\.logo\s*{[^}]+color:\s*#000;/g, (match) => match.replace('color: #000;', 'color: #fff;'));
template = template.replace(/\.back-link\s*{[^}]+color:\s*#000;/g, (match) => match.replace('color: #000;', 'color: #fff;'));
template = template.replace(/\.cart-icon\ssvg\s*{[^}]+stroke:\s*#000;/g, (match) => match.replace('stroke: #000;', 'stroke: #fff;'));
template = template.replace(/\.cart-count\s*{[^}]+background:\s*#000;[^}]+color:\s*#fff;/g, (match) => match.replace('background: #000;', 'background: #fff;').replace('color: #fff;', 'color: #000;'));

// Drawer Dark Mode
template = template.replace(/#cart-dropdown\s*{[^}]+background:\s*#ffffff;[^}]+color:\s*#111;/g, (match) => match.replace('background: #ffffff;', 'background: #000000;').replace('color: #111;', 'color: #fff;'));
template = template.replace(/\.close-cart\s*{[^}]+color:\s*#000;/g, (match) => match.replace('color: #000;', 'color: #fff;'));
template = template.replace(/\.checkout-btn\s*{[^}]+background:\s*#000;[^}]+color:\s*#fff;/g, (match) => match.replace('background: #000;', 'background: #fff;').replace('color: #fff;', 'color: #000;'));
template = template.replace(/\.checkout-btn:hover\s*{\s*background:\s*#222;/g, ".checkout-btn:hover { background: #eee;");
template = template.replace(/rgba\(0, 0, 0, 0\.05\)/g, 'rgba(255, 255, 255, 0.1)');
template = template.replace(/rgba\(0, 0, 0, 0\.1\)/g, 'rgba(255, 255, 255, 0.2)');

// Product Layout Dark Mode
template = template.replace(/\.image-side\s*{[^}]+background:\s*#ffffff;/g, (match) => match.replace('background: #ffffff;', 'background: #000000;'));
template = template.replace(/\.product-title\s*{[^}]+color:\s*#000;/g, (match) => match.replace('color: #000;', 'color: #fff;'));
template = template.replace(/\.product-price\s*{[^}]+color:\s*#000;/g, (match) => match.replace('color: #000;', 'color: #fff;'));
template = template.replace(/\.size-btn\s*{[^}]+color:\s*#000;/g, (match) => match.replace('color: #000;', 'color: #fff;'));
template = template.replace(/\.size-btn:hover\s*{\s*border-color:\s*#000;/g, ".size-btn:hover { border-color: #fff;");
template = template.replace(/\.size-btn\.selected\s*{[^}]+background:\s*#000;[^}]+color:\s*#fff;[^}]+border-color:\s*#000;/g,
    (match) => match.replace('background: #000;', 'background: #fff;').replace('color: #fff;', 'color: #000;').replace('border-color: #000;', 'border-color: #fff;'));
template = template.replace(/\.add-to-cart\s*{[^}]+background:\s*#000;[^}]+color:\s*#fff;/g,
    (match) => match.replace('background: #000;', 'background: #fff;').replace('color: #fff;', 'color: #000;'));
template = template.replace(/\.add-to-cart:hover\s*{\s*background:\s*#222;/g, ".add-to-cart:hover { background: #eee;");

// Fix specific text color for generic things that might have been hardcoded
let products = [
    { id: 1, name: "EXCLUSIVE 01", price: "120", img: "https://picsum.photos/seed/prv01/800/800" },
    { id: 2, name: "EXCLUSIVE 02", price: "90", img: "https://picsum.photos/seed/prv02/800/800" },
    { id: 3, name: "EXCLUSIVE 03", price: "75", img: "https://picsum.photos/seed/prv03/800/800" },
    { id: 4, name: "EXCLUSIVE 04", price: "200", img: "https://picsum.photos/seed/prv04/800/800" },
];

for (const p of products) {
    let phtml = template;

    // Replace Back Link to hidden
    phtml = phtml.replace(/href="index\.html"\s*class="back-link"/g, 'href="hidden.html" class="back-link"');

    // Replace Logo Link just to be purely decorative
    phtml = phtml.replace(/<a href="index\.html" class="logo">/g, '<a href="hidden.html" class="logo">');

    // Replace Content
    phtml = phtml.replace(/<div class="product-title">DB-01<\/div>/, `<div class="product-title">${p.name}</div>`);
    phtml = phtml.replace(/id="product-price">49 USDC<\/span>/, `id="product-price">${p.price} USDC</span>`);
    phtml = phtml.replace(/const productData = \{[\s\S]*?\};/, `const productData = {\n      name: "${p.name}",\n      price: ${p.price}\n    };`);
    phtml = phtml.replace(/<img id="mainImage" src="images\/DB-01\.jpg" alt="Product Image">/, `<img id="mainImage" src="${p.img}" alt="${p.name}">`);

    // Ensure shopSource is set
    phtml = phtml.replace(/function addToCart\(\) \{/, "function addToCart() {\n      localStorage.setItem('shopSource', 'private');");

    fs.writeFileSync(path.join(__dirname, `secret_produkt${p.id}.html`), phtml);
}
console.log("Secret product pages generated.");
