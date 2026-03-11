const fs = require('fs');
const path = require('path');

const file = '/Users/dompom/Desktop/Dompomstore /produkt.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Update CSS for toggle and content
const newCSS = `
        .desc-toggle {
            width: 100%;
            text-align: center;
            padding: 20px 0;
            background: none;
            border: none;
            font-size: 24px;
            font-weight: 300;
            color: #000;
            cursor: pointer;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
            opacity: 0.5;
        }

        .desc-toggle:hover {
            opacity: 1;
        }

        .desc-toggle.open {
            transform: rotate(45deg);
        }

        .desc-content-wrapper {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .desc-content-wrapper.open {
            grid-template-rows: 1fr;
        }

        .desc-content {
            overflow: hidden;
            font-size: 14px;
            color: #777;
            line-height: 1.6;
            text-align: center;
        }
        
        .desc-content-inner {
            padding-bottom: 24px;
        }
`;

// remove old css
content = content.replace(/\.desc-toggle[\s\S]*?\}\s*\.desc-content\s*\{[\s\S]*?\}/, newCSS);

// 2. Wrap product-description appropriately in HTML
content = content.replace(
    /(<div class="product-description">)[\s\S]*?(<\/div> <!-- info-side -->|<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/i,
    `$1
                <button class="desc-toggle" id="desc-toggle">+</button>
                <div class="desc-content-wrapper" id="desc-wrapper">
                    <div class="desc-content">
                        <div class="desc-content-inner" id="product-description"></div>
                    </div>
                </div>
            </div>`
);

// 3. Update the JavaScript binding inside the DOMContentLoaded
const oldScriptLogic = `
            // 6. Description Toggle
            const descToggle = document.getElementById("desc-toggle");
            const descContent = document.getElementById("product-description");
            if (descToggle && descContent) {
                descToggle.onclick = function () {
                    if (descContent.style.display === "block") {
                        descContent.style.display = "none";
                        descToggle.textContent = "Beschreibung +";
                    } else {
                        descContent.style.display = "block";
                        descToggle.textContent = "Beschreibung −";
                    }
                }
            }
`;

const newScriptLogic = `
            // 6. Description Toggle
            const descToggle = document.getElementById("desc-toggle");
            const descWrapper = document.getElementById("desc-wrapper");
            if (descToggle && descWrapper) {
                descToggle.onclick = function () {
                    descToggle.classList.toggle("open");
                    descWrapper.classList.toggle("open");
                }
            }
`;

content = content.replace(oldScriptLogic, newScriptLogic);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched sliding centered toggle.");
