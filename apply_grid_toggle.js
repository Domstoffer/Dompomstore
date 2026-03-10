const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const indexFile = path.join(dirPath, 'index.html');
const cssPath = path.join(dirPath, 'mobile-luxury.css');

// 1. Update index.html
let content = fs.readFileSync(indexFile, 'utf8');

// Inject the button
content = content.replace(/<div class="brand-logo">/g, '<button id="gridToggle" class="grid-toggle-btn">+</button>\n          <div class="brand-logo">');

// Remove old layout-toggle
content = content.replace(/<a class="nav-item" id="layout-toggle">Toggle Grid<\/a>/g, '');

// Ensure default container has grid-2 class
content = content.replace(/<div class="container" id="main-container">/g, '<div class="container grid-2" id="main-container">');

// Append script to handle the toggle
if (!content.includes('gridToggle.addEventListener')) {
    const scriptInject = `
    const toggle = document.getElementById("gridToggle");
    const grid = document.getElementById("main-container");
    if (toggle && grid) {
      toggle.addEventListener("click", () => {
        if(grid.classList.contains("grid-2")) {
          grid.classList.remove("grid-2");
          grid.classList.add("grid-1");
        } else {
          grid.classList.remove("grid-1");
          grid.classList.add("grid-2");
        }
      });
    }
  </script>
</body>
`;
    content = content.replace(/<\/script>\s*<\/body>/, scriptInject);
}

fs.writeFileSync(indexFile, content, 'utf8');
console.log('[GRID TOGGLE] Updated index.html');

let cssContent = fs.readFileSync(cssPath, 'utf8');

// Only inject if it doesn't already exist
if (!cssContent.includes('.grid-toggle-btn')) {
    cssContent += `
/* GRID TOGGLE SYSTEM */
.grid-toggle-btn {
  background: transparent !important;
  border: none !important;
  color: var(--text) !important;
  font-size: 28px !important;
  font-weight: 300 !important;
  font-family: inherit !important;
  cursor: pointer !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 30px !important;
  height: 30px !important;
  z-index: 10 !important;
}

body.dark-mode .grid-toggle-btn {
  color: #fff !important;
}

@media (max-width: 768px) {
  .vanguard-left > div:first-child {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
  }

  .container.grid-1, .products-grid.grid-1 {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
  }

  .container.grid-1 .image-wrapper {
      border-radius: 10px !important;
      aspect-ratio: auto !important;
  }

  .container.grid-1 img {
      width: 100% !important;
      height: auto !important;
  }

  .container.grid-1 .product-box {
      padding-bottom: 20px !important;
  }
}
`;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('[GRID TOGGLE] Updated mobile-luxury.css');
}
