const fs = require('fs');
const path = require('path');

const files = ['checkout.html', 'pay.html', 'thankyou.html'];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Convert to DARK MODE
  content = content.replace(/background:\s*#ffffff;/g, 'background: #000000;');
  content = content.replace(/background:\s*#fff;/g, 'background: #000;');
  content = content.replace(/color:\s*#000000;/g, 'color: #ffffff;');
  content = content.replace(/color:\s*#000;/g, 'color: #fff;');
  
  // Inputs & Borders
  content = content.replace(/border-bottom:\s*1px solid rgba\(0,\s*0,\s*0,\s*(0\.\d+)\)/g, 'border-bottom: 1px solid rgba(255, 255, 255, $1)');
  content = content.replace(/border:\s*1px solid rgba\(0,\s*0,\s*0,\s*(0\.\d+)\)/g, 'border: 1px solid rgba(255, 255, 255, $1)');
  
  // Specific backgrounds
  content = content.replace(/background:\s*#000;/g, 'background: #ffffff;');
  content = content.replace(/color:\s*#fff;/g, 'color: #000000;');
  
  // Fix button hover / backgrounds that were inverted too simply
  // The above replace might have changed black buttons to white buttons with black text.
  // We want buttons to remain white with black text in dark mode.
  // Wait, if original was background: #000 (black) and color: #fff (white), it becomes background: #fff, color: #000. That's correct for dark mode!
  
  // Navigation fixes
  if (file === 'checkout.html') {
    content = content.replace(/window\.location\.href\s*=\s*['"]pay\.html['"]/g, 'window.location.href = "secret_pay.html"');
    // Secret checkout needs logo back to hidden.html
    content = content.replace(/<a href="index.html" class="checkout-logo">/g, '<a href="hidden.html" class="checkout-logo">');
  }
  if (file === 'pay.html') {
    content = content.replace(/window\.location\.href\s*=\s*['"]thankyou\.html['"]/g, 'window.location.href = "secret_thankyou.html"');
    content = content.replace(/<a href="index.html" class="checkout-logo">/g, '<a href="hidden.html" class="checkout-logo">');
  }
  if (file === 'thankyou.html') {
    content = content.replace(/<a href="index.html" class="checkout-logo">/g, '<a href="hidden.html" class="checkout-logo">');
  }

  // Adjust SVGs
  content = content.replace(/stroke:\s*#000;/g, 'stroke: #ffffff;');
  
  // Replace references to index.html to hidden.html for the go-back links
  content = content.replace(/href="index\.html"/g, 'href="hidden.html"');

  const destPath = path.join(__dirname, 'secret_' + file);
  fs.writeFileSync(destPath, content);
}

// Now update the product pages and hidden.html to point to secret_checkout.html
const shopFiles = ['hidden.html', 'secret_produkt1.html', 'secret_produkt2.html', 'secret_produkt3.html', 'secret_produkt4.html'];
for (const sf of shopFiles) {
  const p = path.join(__dirname, sf);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/window\.location\.href\s*=\s*['"]checkout\.html['"]/g, 'window.location.href = "secret_checkout.html"');
    fs.writeFileSync(p, c);
  }
}

console.log("Secret flow generated and linked!");
