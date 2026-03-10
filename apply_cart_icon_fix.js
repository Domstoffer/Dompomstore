const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

const correctCartIconHTML = `
<div class="cart-icon" id="cart-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:22px;height:22px;">
    <path d="M6 2l1 5h10l1-5z"/>
    <path d="M2 7h20v14H2z"/>
  </svg>

  <span class="cart-count" id="cart-count">0</span>
</div>
`.trim();

const extraCartCSS = `
    .cart-icon {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }

    .cart-count {
      position: absolute;
      top: -6px;
      right: -6px;
      background: black;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 50%;
    }
`.trim();


files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Replace the Cart Icon HTML
    // First attempt to match our previous specific injection or any generic form of `<div class="cart-icon"` that isn't the *exact* new string
    const arbitraryCartIconBlock = /<div class="cart-icon"[^>]*>[\s\S]*?<\/div>/i;

    // Need to be careful. The cart drawer is NOT within this block; it's just the header icon.
    // A safer regex captures up to the closing `</div>` correctly by ensuring there's a `<svg` inside it
    content = content.replace(/<div class="cart-icon"[^>]*>\s*<svg[\s\S]*?<\/svg>\s*<span[^>]*>.*?<\/span>\s*<\/div>/i, correctCartIconHTML);

    // If the above matching doesn't hit because it's malformed or empty, fallback replacement logic
    // e.g., if there's no svg but there IS a cart-icon with a counter:
    if (content.match(/<div class="cart-icon"/i) && !content.includes('<path d="M6 2l1 5h10l1-5z"/>')) {
        // Manual string replacement based on what we injected prior
        content = content.replace(/<div class="cart-icon"\s*(id="cart-icon")?>[\s\S]*?<span class="cart-count"[^>]*>.*?<\/span>\s*<\/div>/i, correctCartIconHTML);
    }

    // 2. Add the requested CSS if it is missing
    if (!content.includes('.cart-icon') && content.includes('</style>')) {
        content = content.replace(/<\/style>/, '\\n' + extraCartCSS + '\\n</style>');
    } else if (content.includes('</style>')) {
        // If `.cart-icon` exists but styles are wrong/missing absolute positioning, we might inject or replace
        // Let's just enforce the specified CSS if their values aren't present.
        if (!content.includes('transform: translateY(-50%);')) {
            content = content.replace(/<\/style>/, '\\n' + extraCartCSS + '\\n</style>');
        }
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + file);
    }
});

console.log('SUCCESS');
