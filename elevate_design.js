const fs = require('fs');

const checkoutPath = '/Users/dompom/Desktop/Dompomstore /checkout.html';
let checkoutContent = fs.readFileSync(checkoutPath, 'utf8');

checkoutContent = checkoutContent.replace(
  /body\s*{\s*font-family:\s*'Inter',\s*sans-serif;\s*background:\s*#ffffff;\s*color:\s*#000000;\s*-webkit-font-smoothing:\s*antialiased;\s*}/,
  `@keyframes smoothFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }\n    body {\n      font-family: 'Inter', sans-serif;\n      background: #ffffff;\n      color: #000000;\n      -webkit-font-smoothing: antialiased;\n      animation: smoothFade 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n    }`
);

checkoutContent = checkoutContent.replace(
  /\.checkout-title\s*{\s*font-family:\s*'Syncopate',\s*sans-serif;\s*text-align:\s*center;\s*font-size:\s*16px;/,
  `.checkout-title {\n      font-family: 'Syncopate', sans-serif;\n      text-align: center;\n      font-size: 14px;\n      font-weight: 400;`
);

checkoutContent = checkoutContent.replace(
  /\/\*\s*BUTTON\s*\*\/\s*button\s*{[\s\S]*?}\s*button:hover\s*{[\s\S]*?}/,
  `/* BUTTON */\n    button {\n      margin-top: 60px;\n      padding: 24px;\n      border: none;\n      background: #000;\n      color: #fff;\n      letter-spacing: 0.25em;\n      font-weight: 400;\n      font-family: 'Inter', sans-serif;\n      font-size: 11px;\n      text-transform: uppercase;\n      cursor: pointer;\n      transition: background 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n    }\n\n    button:hover {\n      background: #111;\n      transform: translateY(-4px);\n      box-shadow: 0 15px 35px rgba(0,0,0,0.1);\n    }`
);

checkoutContent = checkoutContent.replace(
  /input\s*{\s*border:\s*none;\s*border-bottom:\s*1px\s*solid\s*rgba\(0,\s*0,\s*0,\s*0\.1\);\s*padding:\s*24px\s*0;\s*font-family:\s*'Inter',\s*sans-serif;\s*font-size:\s*13px;\s*letter-spacing:\s*0\.1em;\s*outline:\s*none;\s*background:\s*transparent;\s*transition:\s*border-color\s*0\.4s\s*ease;\s*}/,
  `input {\n      border: none;\n      border-bottom: 1px solid rgba(0, 0, 0, 0.08);\n      padding: 28px 0 12px 0;\n      font-family: 'Inter', sans-serif;\n      font-size: 13px;\n      letter-spacing: 0.15em;\n      outline: none;\n      background: transparent;\n      transition: border-color 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n    }`
);

fs.writeFileSync(checkoutPath, checkoutContent);

const payPath = '/Users/dompom/Desktop/Dompomstore /pay.html';
let payContent = fs.readFileSync(payPath, 'utf8');

payContent = payContent.replace(
  /body\s*{\s*font-family:\s*'Inter',\s*sans-serif;\s*background:\s*#ffffff;\s*color:\s*#000000;\s*-webkit-font-smoothing:\s*antialiased;\s*}/,
  `@keyframes smoothFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }\n    body {\n      font-family: 'Inter', sans-serif;\n      background: #ffffff;\n      color: #000000;\n      -webkit-font-smoothing: antialiased;\n      animation: smoothFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n    }`
);

payContent = payContent.replace(
  /\.payment-title\s*{\s*font-family:\s*'Syncopate',\s*sans-serif;\s*text-align:\s*center;\s*font-size:\s*16px;/,
  `.payment-title {\n      font-family: 'Syncopate', sans-serif;\n      text-align: center;\n      font-size: 14px;\n      font-weight: 400;`
);

payContent = payContent.replace(
  /\.action-btn\s*{[\s\S]*?}\s*\.action-btn:hover\s*{[\s\S]*?}/,
  `.action-btn {\n      width: 100%;\n      padding: 24px;\n      border: none;\n      background: #000;\n      color: #fff;\n      letter-spacing: 0.25em;\n      font-size: 11px;\n      font-family: 'Inter', sans-serif;\n      font-weight: 400;\n      text-transform: uppercase;\n      cursor: pointer;\n      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n      margin-bottom: 20px;\n    }\n\n    .action-btn:hover {\n      background: #111;\n      transform: translateY(-4px);\n      box-shadow: 0 15px 35px rgba(0,0,0,0.1);\n    }`
);

fs.writeFileSync(payPath, payContent);

const thankPath = '/Users/dompom/Desktop/Dompomstore /thankyou.html';
let thankContent = fs.readFileSync(thankPath, 'utf8');

thankContent = thankContent.replace(
  /body\s*{\s*font-family:\s*'Inter',\s*sans-serif;\s*background:\s*#ffffff;\s*color:\s*#000000;\s*-webkit-font-smoothing:\s*antialiased;\s*}/,
  `@keyframes smoothFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }\n    body {\n      font-family: 'Inter', sans-serif;\n      background: #ffffff;\n      color: #000000;\n      -webkit-font-smoothing: antialiased;\n      animation: smoothFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;\n    }`
);

thankContent = thankContent.replace(
  /\.title\s*{\s*font-family:\s*'Syncopate',\s*sans-serif;\s*font-size:\s*16px;/,
  `.title {\n      font-family: 'Syncopate', sans-serif;\n      font-size: 14px;\n      font-weight: 400;`
);

thankContent = thankContent.replace(
  /\.btn\s*{\s*display:\s*block;[\s\S]*?}\s*\.btn:hover\s*{[\s\S]*?}/,
  `.btn {\n      display: block;\n      width: 100%;\n      padding: 24px;\n      border: none;\n      background: #000;\n      color: #fff;\n      letter-spacing: 0.25em;\n      font-size: 11px;\n      font-family: 'Inter', sans-serif;\n      font-weight: 400;\n      text-transform: uppercase;\n      cursor: pointer;\n      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);\n      text-decoration: none;\n      margin-bottom: 20px;\n    }\n\n    .btn:hover {\n      background: #111;\n      transform: translateY(-4px);\n      box-shadow: 0 15px 35px rgba(0,0,0,0.1);\n    }`
);

thankContent = thankContent.replace(
  /\.check\s*{\s*font-size:\s*4rem;\s*font-weight:\s*200;\s*margin-bottom:\s*40px;\s*color:\s*#000;\s*}/,
  `.check {\n      font-size: 4.5rem;\n      font-weight: 100;\n      margin-bottom: 50px;\n      color: #000;\n    }`
);

fs.writeFileSync(thankPath, thankContent);

console.log("Updated styles successfully!");
