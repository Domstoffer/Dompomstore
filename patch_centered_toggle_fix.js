const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';
const files = fs.readdirSync(dirPath).filter(f => f.startsWith('produkt') || f.startsWith('secret_produkt'));

const newDescriptionHTML = `<div class="description-toggle" onclick="toggleDescription()">
<span id="toggle-icon">+</span>
</div>

<div id="product-description" class="description-content">
High quality Dompom shorts. Premium fabric. Comfortable fit. Limited release.
</div>`;

const newJSToggle = `function toggleDescription(){
const desc = document.getElementById("product-description");
const icon = document.getElementById("toggle-icon");

if(desc) desc.classList.toggle("open");

if(desc && desc.classList.contains("open")){
if(icon) icon.innerText = "-";
}else{
if(icon) icon.innerText = "+";
}
}`;

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Replace the old HTML block
    const oldHTMLRegex = /<div class="description-toggle" onclick="toggleDescription\(\)">[\s\S]*?<\/div>[\s\S]*?<div id="product-description" class="description-content">[\s\S]*?<\/div>/;
    content = content.replace(oldHTMLRegex, newDescriptionHTML);

    // 2. Replace the old JS block
    const oldJSRegex = /function toggleDescription\(\)\{\s*const desc = document\.getElementById\("product-description"\);\s*if \(desc\) desc\.classList\.toggle\("open"\);\s*\}/;
    content = content.replace(oldJSRegex, newJSToggle);

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[DESC FIX] Updated DOM and JS on ${file}`);
    } else {
        console.log(`[DESC FIX] No changes made to ${file}`);
    }
});

// Update the exact CSS rules required
const cssPath = path.join(dirPath, 'mobile-luxury.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

// The best way to enforce the new CSS is to append it. Since CSS cascades, the later rules override previous ones.
cssContent += `
/* EXACT DESCRIPTION TOGGLE CENTER FIX */
.description-toggle{
display:flex;
justify-content:center;
align-items:center;
margin:40px 0;
font-size:32px;
cursor:pointer;
}

.description-content{
max-height:0;
overflow:hidden;
transition:max-height 0.35s ease;
text-align:center;
padding:0 25px;
color:#444;
}

.description-content.open{
max-height:200px;
margin-top:20px;
}
`;

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('[DESC FIX] Updated mobile-luxury.css');
