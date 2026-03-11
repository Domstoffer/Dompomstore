const fs = require('fs');
const path = require('path');

const indexFile = '/Users/dompom/Desktop/Dompomstore /index.html';
let content = fs.readFileSync(indexFile, 'utf8');

// 1. In CSS section, we need .grid-three, .grid-two, .grid-one
// Currently there is .grid-two { grid-template-columns: repeat(2, 1fr); gap: 20px; }
// We'll just define the specific ones globally if they don't exist.
const flexGridCSS = `
    .grid-three { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .grid-two { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .grid-one { display: grid; grid-template-columns: 1fr; gap: 20px; }
    
    @media(max-width: 900px) {
        /* Mobile overrides usually force everything to 1 or 2 columns, but we'll let the user toggle if they want or let css rule */
        .grid-three { grid-template-columns: repeat(2, 1fr); }
    }
    @media(max-width: 600px) {
        .grid-three { grid-template-columns: 1fr; }
        .grid-two { grid-template-columns: 1fr; }
    }
`;

if (!content.includes('.grid-three {')) {
    content = content.replace('</style>', flexGridCSS + '\n</style>');
}

// 2. We need to replace or add the toggle logic.
// The toggle button is: <button id="gridToggle" class="grid-toggle-btn">+</button>
// Look for existing toggle logic and strip it.
content = content.replace(/const\s+toggle\s*=\s*document\.getElementById\("gridToggle"\);[\s\S]*?(?=(<\/script>|\/\/ CHECKOUT|<\/body>|<!--))/i, '');

// The old toggle logic was lost when we deleted inline products, so let's add it cleanly at the bottom.
const toggleScript = `
<script>
    const toggle = document.getElementById("gridToggle");
    const grid = document.getElementById("productsGrid");
    
    if(toggle && grid) {
        // Initialize to grid-three by default if we want to start at 3er
        // The user asked "kannst du bilder in 3er reihe machen" meaning start at 3?
        // Wait, current HTML is "container grid-two". We'll change the HTML below.
        
        toggle.onclick = function() {
            if(grid.classList.contains("grid-three")) {
                grid.classList.remove("grid-three");
                grid.classList.add("grid-two");
                toggle.innerText = "++";
            } else if(grid.classList.contains("grid-two")) {
                grid.classList.remove("grid-two");
                grid.classList.add("grid-one");
                toggle.innerText = "+++";
            } else {
                grid.classList.remove("grid-one");
                grid.classList.add("grid-three");
                toggle.innerText = "+";
            }
        };
    }
</script>
`;

content = content.replace(/<\/body>/i, toggleScript + '\n</body>');

// Let's set the initial grid class in the HTML to grid-three
content = content.replace(/class="container grid-two"/, 'class="container grid-three"');

fs.writeFileSync(indexFile, content, 'utf8');
console.log("Injected 3-tier grid toggle logic successfully.");
