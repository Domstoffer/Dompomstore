const fs = require('fs');
const path = require('path');

// 1. Redesign pay.html and secret_pay.html
const payFiles = ['pay.html', 'secret_pay.html'];
for (let file of payFiles) {
    let content = fs.readFileSync(path.join(__dirname, file), 'utf8');

    // Move the wallet drawer contents into the payment-container instead of the action button
    const walletDrawerMatch = content.match(/<div id="wallet-drawer">([\s\S]*?)<\/div>\s*<script>/);
    if (walletDrawerMatch) {
        let walletDrawerContent = walletDrawerMatch[1];
        // Remove the Title and Drawer Close buttons
        walletDrawerContent = walletDrawerContent.replace(/<div class="drawer-title">.*?<\/div>/, '');
        walletDrawerContent = walletDrawerContent.replace(/<div class="drawer-close".*?<\/div>/, '');

        // Replace the specific tokensContainer and button part to add styles
        walletDrawerContent = walletDrawerContent.replace(/<div id="tokenSelectionArea".*?>/, '<div id="tokenSelectionArea" style="display:none; margin-bottom: 20px; margin-top: 20px;">');
        walletDrawerContent = walletDrawerContent.replace(/<div class="drawer-title" style=".*?>/, '<div style="font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:#777; margin-bottom:15px; text-align:center;">');

        // Replace the action-btn in the container with the actual wallet options
        content = content.replace(/<button class="action-btn" onclick="openDrawer\(\)">Wallet Verbinden<\/button>/, walletDrawerContent);

        // Remove the overlay and drawer wrapper entirely
        content = content.replace(/<div class="overlay" id="overlay" onclick="closeDrawer\(\)"><\/div>\s*<div id="wallet-drawer">[\s\S]*?<\/div>/, '');
    }

    // Remove the media query that restricted the drawer size
    content = content.replace(/#wallet-drawer\s*{[\s\S]*?border-right: 1px solid rgba\(0, 0, 0, 0\.1\);\s*}/, '');

    fs.writeFileSync(path.join(__dirname, file), content);
}

// 2. Redesign checkout.html and secret_checkout.html
const checkoutFiles = ['checkout.html', 'secret_checkout.html'];
for (let file of checkoutFiles) {
    let content = fs.readFileSync(path.join(__dirname, file), 'utf8');

    // Input styling
    if (file === 'checkout.html') {
        content = content.replace(/input\s*{\s*border: none;/g, "input { border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; padding: 20px;");
        content = content.replace(/border-bottom: 1px solid rgba\(0, 0, 0, 0\.08\);/g, "");
        content = content.replace(/input:focus\s*{\s*border-bottom: 1px solid #000;/g, "input:focus { border: 1px solid #000; box-shadow: 0 5px 15px rgba(0,0,0,0.05);");
    } else {
        content = content.replace(/input\s*{\s*border: none;/g, "input { border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 20px;");
        content = content.replace(/border-bottom: 1px solid rgba\(255, 255, 255, 0\.08\);/g, "");
        content = content.replace(/input:focus\s*{\s*border-bottom: 1px solid #000;/g, "input:focus { border: 1px solid #fff; box-shadow: 0 5px 15px rgba(255,255,255,0.05);");
    }

    // Form gap and button
    content = content.replace(/gap: 28px;/g, "gap: 20px;");
    content = content.replace(/margin-top: 60px;/g, "margin-top: 20px; border-radius: 4px;");

    fs.writeFileSync(path.join(__dirname, file), content);
}

console.log("Done redesigning!");
