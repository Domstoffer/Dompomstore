const fs = require('fs');
const path = require('path');

const file = '/Users/dompom/Desktop/Dompomstore /index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove static products.js inclusion if it exists from earlier
content = content.replace(/<script\s+src="products\.js"><\/script>/gi, '');

// 2. Wrap shopContent style="display:none;"
// Replace <div id="shopContent"> or <div id="shopContent" ...> with <div id="shopContent" style="display:none;">
content = content.replace(/<div\s+id="shopContent"([^>]*)>/i, '<div id="shopContent" style="display:none;"$1>');

// 3. Clear the productsGrid of any hardcoded product-boxes
const gridRegex = /(<div\s+class="[^"]*"\s+id="productsGrid"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<!-- CART DRAWER)/i;
// We empty the middle part cleanly
content = content.replace(gridRegex, '$1\n$3');

// 4. Inject the lockScreen right after <body>
const lockScreenHTML = `
  <div id="lockScreen" style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #ffffff; color: #000; font-family: 'Syncopate', sans-serif;">
    <h1 style="letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 30px;">ACCESS</h1>
    <input type="password" id="passwordInput" placeholder="Enter password" style="padding: 15px; border: 1px solid #ddd; outline: none; text-align: center; font-family: 'Inter', sans-serif; letter-spacing: 0.1em; width: 300px; max-width: 80%; background: transparent; color: #000; font-size: 14px; border-radius: 0; margin-bottom: 20px;">
    <button onclick="unlockSite()" style="padding: 15px 40px; background: #000; color: #fff; border: none; cursor: pointer; text-transform: uppercase; letter-spacing: 0.15em; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px; transition: 0.3s; width: 300px; max-width: 80%;">Enter</button>
    <p id="errorMsg" style="color: red; margin-top: 20px; font-family: 'Inter', sans-serif; font-size: 12px; height: 15px;"></p>
  </div>
`;
content = content.replace(/(<body[^>]*>)/i, '$1\n' + lockScreenHTML);

// 5. Inject the unlockSite() function into a script tag before </body>
const scriptHTML = `
<script>
function unlockSite(){
  const password = "dompom2026";
  const input = document.getElementById("passwordInput").value;

  if(input === password){
    document.getElementById("lockScreen").style.display = "none";
    document.getElementById("shopContent").style.display = "block";

    const script = document.createElement("script");
    script.src = "products.js";
    document.body.appendChild(script);

  } else {
    document.getElementById("errorMsg").innerText = "Wrong password";
  }
}

document.getElementById("passwordInput").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    unlockSite();
  }
});
</script>
`;
content = content.replace(/<\/body>/i, scriptHTML + '\n</body>');

fs.writeFileSync(file, content, 'utf8');
console.log("Patched index.html for Secure Product Loading.");
