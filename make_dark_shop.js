const fs = require('fs');

// 1. HIDDEN.HTML - INVERT TO DARK MODE
let hiddenPath = '/Users/dompom/Desktop/Dompomstore /hidden.html';
let hidden = fs.readFileSync(hiddenPath, 'utf8');

hidden = hidden.replace(/background:\s*#ffffff;/g, 'background: #000000;');
hidden = hidden.replace(/color:\s*#000000;/g, 'color: #ffffff;');
hidden = hidden.replace(/color:\s*#000;/g, 'color: #fff;');
hidden = hidden.replace(/background:\s*#000;/g, 'background: #fff;');
hidden = hidden.replace(/color:\s*#fff;/g, 'color: #000;');
// fix cart count background that was inverted
hidden = hidden.replace(/\.cart-count\s*{\s*[\s\S]*?background:\s*#fff;\s*color:\s*#000;/g, 
  (match) => match.replace('background: #fff;', 'background: #ffffff;').replace('color: #000;', 'color: #000000;')
);

// fix rgba(0,0,0,x) to rgba(255,255,255,x)
hidden = hidden.replace(/rgba\(0,\s*0,\s*0,\s*(0\.\d+)\)/g, 'rgba(255, 255, 255, $1)');

// specific text colors
hidden = hidden.replace(/stroke:\s*#000;/g, 'stroke: #ffffff;');

// Add specific dark styling to the logo link
hidden = hidden.replace(/<a href="index.html" style="text-decoration:none; color:#000;">/g, '<a href="index.html" style="text-decoration:none; color:#fff;">');
hidden = hidden.replace(/style="font-weight: 500;"/g, 'style="font-weight: 500; color: #fff;"');

fs.writeFileSync(hiddenPath, hidden);


// 2. PAY.HTML - RESTRICT TOKENS BASED ON SOURCE
let payPath = '/Users/dompom/Desktop/Dompomstore /pay.html';
let pay = fs.readFileSync(payPath, 'utf8');

const payLogicOld = `      let tokens = [];
      if (network === 'solana') {
        tokens = ['USDC', 'SOL', 'FARTCOIN'];
      } else {
        tokens = ['USDC', 'PEPPE'];
      }`;

const payLogicNew = `      let tokens = [];
      const source = localStorage.getItem('shopSource') || 'public';
      
      if (source === 'private') {
        if (network === 'solana') {
          tokens = ['USDC'];
        } else {
          tokens = ['USDC', 'ETH', 'BNB_USDC', 'BNB', 'LINEA_USDC'];
        }
      } else {
        if (network === 'solana') {
          tokens = ['USDC', 'SOL', 'FARTCOIN'];
        } else {
          tokens = ['USDC', 'PEPPE'];
        }
      }`;

pay = pay.replace(payLogicOld, payLogicNew);
fs.writeFileSync(payPath, pay);


// 3. ETHEREUM.JS - ADD BNB NATIVE AND BNB_USDC
let ethPath = '/Users/dompom/Desktop/Dompomstore /dompomstore-backend/ethereum.js';
let eth = fs.readFileSync(ethPath, 'utf8');

const bnbTokens = `    BNB_USDC: {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // BSC USDC
        decimals: 18,
        symbol: 'BNB_USDC',
        provider: bscProvider,
        discount: 0,
        getRate: async () => 1.0
    },
    BNB: {
        address: null, // native BNB on BSC
        decimals: 18,
        symbol: 'BNB',
        provider: bscProvider,
        discount: 0,
        getRate: async () => {
            try {
                const fetch = require('node-fetch');
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
                const data = await res.json();
                return data?.binancecoin?.usd ?? null;
            } catch (e) { return null; }
        }
    }`;

eth = eth.replace(/BNB_DAI:\s*{[\s\S]*?}[,}]/, bnbTokens + ',');
fs.writeFileSync(ethPath, eth);

console.log("Updated everything!");
