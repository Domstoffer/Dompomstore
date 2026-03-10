const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const newCartIconSVG = `
      <div class="cart-icon" id="cart-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:20px;height:20px;">
          <path d="M6 2l1 5h10l1-5z" />
          <path d="M2 7h20v14H2z" />
        </svg>
        <span class="cart-count" id="cart-count">0</span>
      </div>
`.trim();

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // TASK 1: Remove "Zurück" button
    content = content.replace(/<div class="header-left">[\s\S]*?<\/div>/, '');

    // TASK 2: Use the same cart icon logic (remove style="display:none;" from the bubble)
    content = content.replace(/<div class="cart-icon" id="cart-icon">[\s\S]*?<\/div>\s*<\/div>/, newCartIconSVG + '\n    </div>');

    // TASK 3 & 4: Add collapsible product description
    // First, completely remove the existing messy accordion
    content = content.replace(/<div class="info-accordion">[\s\S]*?<\/div>\s*<\/div>/, '');

    // Inject the new description UI block right under the Add to Cart button
    const newDescBlock = `
      <div class="product-description" style="margin-top: 24px; border-top: 1px solid var(--border);">
        <button class="desc-toggle" style="width: 100%; text-align: left; padding: 20px 0; background: none; border: none; font-size: 11px; font-weight: 600; font-family: 'Syncopate', sans-serif; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text); cursor: pointer;">
          Beschreibung +
        </button>
        <div class="desc-content" style="display: none; padding-bottom: 24px; font-size: 14px; color: #777; line-height: 1.6;">
          <p>
            Premium fit product. Crafted with precision layout styling and minimalist attention to detail. Designed for comfort and high-end streetwear utility.
          </p>
        </div>
      </div>
  `;
    content = content.replace(/(<button class="add-to-cart"[^>]*>In den Warenkorb<\/button>)/, '$1\n' + newDescBlock);

    // Install the new JS Toggle Script right before the end of the script block
    if (!content.includes('const toggle = document.querySelector(".desc-toggle");')) {
        const jsToggleContent = `
    const descToggle = document.querySelector(".desc-toggle");
    const descContent = document.querySelector(".desc-content");
    if (descToggle && descContent) {
      descToggle.onclick = function(){
        if(descContent.style.display === "block"){
          descContent.style.display = "none";
          descToggle.textContent = "Beschreibung +";
        } else {
          descContent.style.display = "block";
          descToggle.textContent = "Beschreibung −";
        }
      }
    }
    `;
        content = content.replace(/<\/script>\s*<\/body>/, jsToggleContent + '\n  </script>\n</body>');
    }

    // Final cleanup: remove residual empty <div class="info-accordion"> wrappers if any
    content = content.replace(/<div class="info-accordion">\s*<\/div>/g, '');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[SYS UPDATE] Product UI patched on ${file}`);
    }
});
