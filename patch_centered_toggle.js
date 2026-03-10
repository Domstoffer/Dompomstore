const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const newDescriptionHTML = `<div class="description-toggle" onclick="toggleDescription()">
+
</div>

<div id="product-description" class="description-content">
High quality Dompom shorts.
Premium fabric.
Comfortable fit.
Limited release.
</div>`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Remove the old description block completely
    const oldDescRegex = /<div class="product-description"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
    // Actually, the old block ends with </div>\n  </div>. Let's make it robust against exact characters.
    const oldDescBlock = /<div class="product-description" style="margin-top: 24px; border-top: 1px solid var\(--border\);">[\s\S]*?<\/div>[\s]*<\/div>/g;

    content = content.replace(oldDescBlock, newDescriptionHTML);

    // 2. Remove the old Javascript matching logic for descToggle
    const oldJSRegex = /const descToggle = document\.querySelector\("\.desc-toggle"\);[\s\S]*?\}\s*\}/g;

    const newJSToggle = `function toggleDescription(){
const desc = document.getElementById("product-description");
if (desc) desc.classList.toggle("open");
}`;

    if (oldJSRegex.test(content)) {
        content = content.replace(oldJSRegex, newJSToggle);
    } else if (!content.includes('function toggleDescription()')) {
        // Failsafe injection
        content = content.replace(/<\/script>\s*<\/body>/, newJSToggle + '\n  </script>\n</body>');
    }

    // To perfectly match user's explicit JS if possible (though I added if(desc) check above for safety)

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[DESC TOGGLE] Updated DOM on ${file}`);
    }
});

// Update the exact CSS rules required
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent += `
/* EXACT DESCRIPTION TOGGLE */
.description-toggle{
font-size:32px;
text-align:center;
margin:40px 0;
cursor:pointer;
font-weight:300;
}

.description-content{
max-height:0;
overflow:hidden;
transition:max-height 0.3s ease;
text-align:center;
padding:0 20px;
color:#444;
}

.description-content.open{
max-height:200px;
margin-top:20px;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[DESC TOGGLE] Updated mobile-luxury.css');
