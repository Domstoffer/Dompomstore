const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const indexFile = path.join(dirPath, 'index.html');
const cssPath = path.join(dirPath, 'mobile-luxury.css');

let content = fs.readFileSync(indexFile, 'utf8');

// 1. Remove the crashing legacy layout toggle script
const oldScriptRegex = /\/\/ LAYOUT TOGGLE[\s\S]*?applyLayout\(layoutMode\);\n\s*\n?\s*\}\);/g;
content = content.replace(oldScriptRegex, '');

// 2. Ensure main-container has grid-two class rather than grid-2
content = content.replace(/<div class="container grid-2" id="main-container">/, '<div class="container grid-two" id="productsGrid">');
content = content.replace(/<div class="container" id="main-container">/, '<div class="container grid-two" id="productsGrid">');

// 3. Update the new script to match user spec and use localStorage for persistence if we want, or just basic boolean
const newScriptRegex = /const toggle = document\.getElementById\("gridToggle"\);[\s\S]*?\}\);\n\s*\}/g;
content = content.replace(newScriptRegex, ''); // remove previous injection

// Inject the clean JS
const finalJS = `
    const toggleButton = document.getElementById("gridToggle");
    const productsGrid = document.getElementById("productsGrid");
    
    if (toggleButton && productsGrid) {
      let isSingleColumn = false;
      toggleButton.addEventListener("click", () => {
        if(isSingleColumn){
          productsGrid.classList.remove("grid-one");
          productsGrid.classList.add("grid-two");
        } else {
          productsGrid.classList.remove("grid-two");
          productsGrid.classList.add("grid-one");
        }
        isSingleColumn = !isSingleColumn;
      });
    }
`;
content = content.replace(/<\/script>\s*<\/body>/, finalJS + '\n  </script>\n</body>');

fs.writeFileSync(indexFile, content, 'utf8');
console.log('[BUGFIX] index.html patched');

// 4. Update CSS with user's specific classes 'grid-one' and 'grid-two'
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
/* FIXED GRID TOGGLE CLASSES */
@media (max-width: 768px) {
  .grid-two {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 16px !important;
      padding: 16px !important;
  }
  
  .grid-one {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 24px !important;
      padding: 16px !important;
  }
  
  .grid-one .product-box {
      width: 100% !important;
      padding-bottom: 20px !important;
  }

  .grid-one .image-wrapper {
      aspect-ratio: auto !important;
  }

  .grid-one img {
      width: 100% !important;
      height: auto !important;
      border-radius: 12px !important;
  }
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[BUGFIX] mobile-luxury.css patched');
