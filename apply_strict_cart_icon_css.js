const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // The previous injected correct CSS:
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
`;

    // 1. Remove ANY existing `.cart-icon` or `.cart-count` css blocks so they don't fight.
    // We'll wipe them entirely and inject just the correct payload right before </style>.
    content = content.replace(/\.cart-icon\s*{[\s\S]*?}/g, '');
    content = content.replace(/\.cart-icon\s+svg\s*{[\s\S]*?}/g, '');
    content = content.replace(/\.cart-icon:hover\s+svg\s*{[\s\S]*?}/g, '');
    content = content.replace(/\.cart-count\s*{[\s\S]*?}/g, '');

    // Wipe the previous injector's extra CSS blocks to avoid duplication if running script over and over
    // Since we just wiped all `.cart-icon { ... }`, the one we added previously is also gone.
    // Let's now cleanly place exactly what the user wants before the final `</style>` tags.

    // Inject exact properties:
    if (content.match(/<\/style>/)) {
        // Find the LAST </style> tag in the file to inject global CSS cleanly
        const lastStyleIndex = content.lastIndexOf('</style>');
        content = content.slice(0, lastStyleIndex) + extraCartCSS + '\n' + content.slice(lastStyleIndex);
    }

    // 2. We also noticed the user said it was missing. Let's make sure the SVG isn't stripped.
    // We'll replace the header icon *again* strictly.
    const correctCartIconHTML = `
<div class="cart-icon" id="cart-icon">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:22px;height:22px;">
    <path d="M6 2l1 5h10l1-5z"/>
    <path d="M2 7h20v14H2z"/>
  </svg>

  <span class="cart-count" id="cart-count">0</span>
</div>
  `.trim();

    // Wipe whatever is there strictly:
    content = content.replace(/<div class="cart-icon"[^>]*>[\s\S]*?<\/div>/i, correctCartIconHTML);

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed CSS & Icon on ' + file);
    }
});

console.log('SUCCESS');
