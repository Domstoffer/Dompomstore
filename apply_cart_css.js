const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

const correctDesktopCartCSS = `
    /* CART DRAWER */
    #cart-dropdown {
      position: fixed;
      top: 0;
      right: -100%;
      width: 400px;
      height: 100vh;
      background: var(--bg);
      border-left: 1px solid var(--border);
      padding: 60px 40px;
      transition: right 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }

    #cart-dropdown.show {
      right: 0;
    }
`.trim();

const messyMobileBottomSheetCSSRegex = /#cart-dropdown\s*{\s*top: auto !important;\s*bottom: -100% !important;[\s\S]*?box-shadow: 0 -10px 40px rgba\(0,\s*0,\s*0,\s*0\.1\) !important;\s*}\s*#cart-dropdown\.show\s*{\s*bottom: 0 !important;\s*}/i;
const incorrectDesktopCartCSSRegex = /#cart-dropdown\s*{[\s\S]*?width:\s*320px;[\s\S]*?transition:\s*right\s*0\.4s[\s\S]*?}\s*#cart-dropdown\.show\s*{\s*right:\s*0;\s*}/i;


files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Remove the mobile bottom sheet completely
    content = content.replace(messyMobileBottomSheetCSSRegex, '');

    content = content.replace(/#cart-dropdown\s*{\s*width:\s*100%;\s*max-width:\s*100vw;\s*}/g, '');

    // Find the existing cart-dropdown CSS block on product pages (like width 320px) and replace it
    if (incorrectDesktopCartCSSRegex.test(content)) {
        content = content.replace(incorrectDesktopCartCSSRegex, correctDesktopCartCSS);
    }

    // Fallback: If the user manually wrote the new requested CSS literally without backticks for a different file, just do standard regex removal of `#cart-dropdown` variants
    // This ensures a clean swap across the entire Dompom store files.

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + file);
    }
});

console.log('SUCCESS');
