const fs = require('fs');
const files = ['pay.html', 'secret_pay.html'];

const phantomLogoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4NCA4NCIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTQyIDg0QzY1LjE5NiA4NCA4NCA2NS4xOTYgODQgNDJDODQgMTguODA0IDY1LjE5NiAwIDQyIDBDMTguODA0IDAgMCAxOC44MDQgMCA0MkMwIDY1LjE5NiAxOC44MDQgODQgNDIgODRaIiBmaWxsPSIjQUI5RkYyIi8+PHBhdGggZD0iTTYyLjY2MjUgMzEuNUgzOC43MTg4QzM1LjA0MzcgMzEuNSAzMi4yODc1IDM0LjY1IDMyLjI4NzUgMzcuOEMzMi4yODc1IDQwLjk1IDM0LjkxMjUgNDMuNTc1IDM4LjMyNSA0My41NzVDNDEuNzM3NSA0My41NzUgNDQuMzYyNSA0MC45NSA0NC4zNjI1IDM3LjhWMzUuN0g0Ni40NjI1VjQyLjUyNUM0Ni40NjI1IDQ1LjQxMjUgNDQuODg3NSA0OC4wMzc1IDQyLjUyNSA0OS4zNUMzOC4zMjUgNTEuNzEyNSAzMi44MTI1IDUyLjc2MjUgMjcuMDM3NSA1Mi43NjI1QzIyLjA1IDUyLjc2MjUgMTcuNTg3NSA1MS45NzUgMTMuOTEyNSA1MC40VjcyLjQ1QzEzLjkxMjUgNzYuNjUgMTcuMzI1IDgwLjA2MjUgMjEuNTI1IDgwLjA2MjVINjIuNDc1QzY2LjY3NSA4MC4wNjI1IDcwLjA4NzUgNzYuNjUgNzAuMDg3NSA3Mi40NVYzOC44NUM3MC4wODc1IDM0LjY1IDY2LjgwNjIgMzEuNSA2Mi42NjI1IDMxLjVaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik00OC4wMzc0IDQyLjUyNTFDNDcuNzc0OSA0My4zMTI2IDQ3LjExODcgNDQuMTAwMSA0Ni41OTM3IDQ0Ljc1NjNDNDUuMjgxMiA0Ni40NjI2IDQzLjE4MTIgNDcuNzc1MSA0MC44MTg3IDQ4LjMwMDFDMzguNTg3NCA0OC44MjUxIDM2LjM1NjIgNDguODI1MSAzNC4zODc0IDQ4LjMwMDFDMzAuNzEyNCA0Ny4yNTAxIDI3LjU2MjQgNDQuMjMxMyAyNi42NDM3IDQwLjQyNTFDMjYuMTE4NyAzOC4zMjUxIDI2LjExODcgMzYuMDkzOCAyNi42NDM3IDM0LjEyNTFDMjcuNTYyNCAzMC4zMTg4IDMwLjcxMjQgMjcuMzAwMSAzNC4zODc0IDI2LjI1MDFDMzYuNjE4NyAyNS43MjUxIDM4Ljg1IDI1LjcyNTEgNDAuOTUgMjYuMjUwMUM0My4zMTI1IDI2LjkwNjMgNDUuNDEyNSAyOC4yMTg4IDQ2LjcyNSAzMC4wNTYzQzQ3LjI1IDMwLjcxMjUgNDcuNzc1IDMxLjUgNDguMTY4NyAzMi4yODc1QzQ4LjU2MjUgMzMuMzM3NSA0OS4zNSAzNC4zODc1IDUwLjQgMzQuNjUxM0M1Mi4yMzc1IDM1LjE3NjMgNTMuNjgxMiAzMy44NjM4IDU0LjA3NSAzMi4wMjYzQzU0LjQ2ODcgMzAuMzIwMSA1NC4wNzUgMjguNjEzOCA1My4wMjUgMjcuMTcwMUM1MS41ODEyIDI1LjIwMTMgNDkuNjEyNSAyMy42MjYzIDQ3LjM4MTIgMjIuNTc2M0M0NC43NTYyIDIxLjAwMTMgNDEuNjA2MiAyMC4yMTM4IDM4LjMyNSAxOS45NTEzQzM0Ljc4MTIgMTkuODIwMSAzMS4yMzc1IDIwLjM0NTEgMjcuOTU2MiAyMS42NTc2QzIzLjYyNSAyMy40OTUxIDE5LjgxODcgMjYuMzgyNiAxNi45MzEyIDMwLjE4ODhDMTQuMDQzNyAzMy45OTUxIDEyLjMzNzUgMzguNDU3NiAxMS45NDM3IDQzLjE4MjZWNDQuMjMyNkgxMi4wNzVDMTIuNDY4NyA1MC41MzI2IDE0LjgzMTIgNTYuNDM4OCAxOC43Njg3IDYxLjI5NTFDMjIuNzA2MiA2Ni4xNTEzIDI3Ljk1NjIgNjkuODI2MyAzMy44NjI1IDcxLjc5NUMzOC40NTYyIDczLjIzODggNDMuMzEyNSA3My41MDEzIDQ4LjAzNzUgNzIuNzEzOFY0Mi41MjUxSDQ4LjAzNzRaIiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==";

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Restore the base64 phantom logo 
    content = content.replace(/<img src="https:\/\/raw.githubusercontent.com\/phantom\/brand\/main\/logo\/phantom-icon-purple.svg" alt="Phantom"[^>]*\/>/g,
        `<img src="${phantomLogoBase64}" alt="Phantom" />`);

    // 2. Add crypto prices fetch script if not exists
    if (!content.includes('let cryptoRates = {};')) {
        const fetchScript = `
    let cryptoRates = {};
    async function fetchCryptoRates() {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,binancecoin,pepe,fartcoin&vs_currencies=usd');
        const data = await res.json();
        cryptoRates = {
          ETH: data?.ethereum?.usd || 3001,
          SOL: data?.solana?.usd || 150,
          BNB: data?.binancecoin?.usd || 400,
          PEPE: data?.pepe?.usd || 0.00001,
          FARTCOIN: data?.fartcoin?.usd || 0.005,
          USDC: 1,
          BNB_USDC: 1,
          LINEA_USDC: 1
        };
        if (activeToken) updateTotalDisplay(activeToken);
      } catch(e) { console.error('Error fetching crypto rates', e); }
    }
    fetchCryptoRates(); // Fetch immediately on load
        `;
        content = content.replace('let activeNetwork = null;', fetchScript + '\n    let activeNetwork = null;');
    }

    // 3. Update the updateTotalDisplay function to show estimated crypto tokens
    const oldUpdateDisplay = /function updateTotalDisplay\(token\) {[\s\S]*?document\.getElementById\("summaryContent"\)\.innerHTML = itemsHTML \+ totalHtml;\n    }/g;

    const newUpdateDisplay = `function updateTotalDisplay(token) {
      const isDiscounted = ['PEPE', 'PEPPE', 'FARTCOIN'].includes(token);
      const finalUsd = isDiscounted ? totalUsd * 0.90 : totalUsd;
      
      let cryptoAmountHtml = '';
      if (cryptoRates[token]) {
        const amount = finalUsd / cryptoRates[token];
        const decimals = token.includes('USDC') ? 2 : (['PEPE', 'FARTCOIN'].includes(token) ? 0 : 5);
        const formattedAmount = ['PEPE', 'FARTCOIN'].includes(token) ? Math.ceil(amount).toLocaleString() : amount.toFixed(decimals);
        cryptoAmountHtml = \`<div style="font-size:12px; font-weight:400; font-family:'Inter',sans-serif; letter-spacing:0.1em; color:var(--text); opacity:0.6; margin-top:8px; text-transform:none;">≈ \${formattedAmount} \${token}</div>\`;
      } else {
        cryptoAmountHtml = \`<div style="font-size:10px; opacity:0.3; margin-top:5px; text-transform:uppercase;">Fetching live market rates...</div>\`;
      }

      let totalHtml = \`
      <div class="order-total-vanguard" style="flex-direction: column; align-items: flex-end; padding:20px 0;">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
            <span>TOTAL \${isDiscounted ? '<span style="color:#14F195; font-size:10px; margin-left:10px;">(10% OFF 💎)</span>' : ''}</span>
            <span>\${isDiscounted ? \`<span style="text-decoration:line-through; opacity:0.5; font-size:11px; margin-right:5px;">\${totalUsd.toFixed(2)}</span>\` : ''}\${finalUsd.toFixed(2)} USD</span>
        </div>
        \${cryptoAmountHtml}
      </div>\`;
      
      document.getElementById("summaryContent").innerHTML = itemsHTML + totalHtml;
    }`;

    content = content.replace(oldUpdateDisplay, newUpdateDisplay);

    fs.writeFileSync(file, content);
});
console.log("Updated pay.html and secret_pay.html with crypto rates and phantom logo.")
