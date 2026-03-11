const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'produkt.html');
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

// Point to the secret products script instead
template = template.replace(/products\.js\?v=/g, 'secret_products.js?v=');

// Replace Back Link to hidden
template = template.replace(/href="index\.html"\s*class="back-link"/g, 'href="hidden.html" class="back-link"');

// Replace Logo Link just to be purely decorative
template = template.replace(/<a href="index\.html" class="logo">/g, '<a href="hidden.html" class="logo">');

// Ensure shopSource is set for checkout
template = template.replace(/function addToCart\(/, "function addToCart(name, price, size, event) {\n      localStorage.setItem('shopSource', 'private');\n");

fs.writeFileSync(path.join(__dirname, `secret_produkt.html`), template);
console.log("Secret dynamic product template generated.");
