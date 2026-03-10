const fs = require('fs');
const files = ['pay.html', 'secret_pay.html'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Replace Phantom logo
    content = content.replace(/<img src="data:image\/svg\+xml;base64,PHN2ZyB[^>]+ alt="Phantom" \/>/, '<img src="https://raw.githubusercontent.com/phantom/brand/main/logo/phantom-icon-purple.svg" alt="Phantom" style="border-radius:20%;" />');

    // 2. Add ETH to Public Tokens and change PEPPE to PEPE
    content = content.replace(/else tokens = \['USDC', 'PEPPE'\];/, "else tokens = ['ETH', 'USDC', 'PEPE'];");

    // 3. Add updateTotalDisplay to selectNetwork token generator
    const tokenLoopTarget = `
        btn.onclick = () => {
          document.querySelectorAll('.token-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeToken = t;
        };`;
    const tokenLoopReplace = `
        btn.onclick = () => {
          document.querySelectorAll('.token-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeToken = t;
          updateTotalDisplay(t);
        };`;
    content = content.replace(tokenLoopTarget, tokenLoopReplace);

    // 4. Update total display dynamically
    const activeTokenSetTarget = `activeToken = tokens[0];\n    }`;
    const activeTokenSetReplace = `activeToken = tokens[0];\n      updateTotalDisplay(activeToken);\n    }\n\n    function updateTotalDisplay(token) {\n      const isDiscounted = ['PEPE', 'PEPPE', 'FARTCOIN'].includes(token);\n      const finalUsd = isDiscounted ? totalUsd * 0.90 : totalUsd;\n      \n      let totalHtml = \`\n      <div class="order-total-vanguard">\n        <span>TOTAL \${isDiscounted ? '<span style="color:#14F195; font-size:10px; margin-left:10px;">(10% OFF 💎)</span>' : ''}</span>\n        <span>\${isDiscounted ? \`<span style="text-decoration:line-through; opacity:0.5; font-size:11px; margin-right:5px;">\${totalUsd.toFixed(2)}</span>\` : ''}\${finalUsd.toFixed(2)} USD</span>\n      </div>\`;\n      \n      document.getElementById("summaryContent").innerHTML = itemsHTML + totalHtml;\n    }`;
    content = content.replace(activeTokenSetTarget, activeTokenSetReplace);

    fs.writeFileSync(file, content);
});
console.log("Updated pay.html and secret_pay.html with crypto updates");
