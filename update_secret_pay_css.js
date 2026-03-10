const fs = require('fs');
const path = require('path');

const secretPayPath = path.join(__dirname, 'secret_pay.html');
let content = fs.readFileSync(secretPayPath, 'utf8');

const oldButtonCss = `    /* BUTTONS */
    .action-btn {
      width: 100%;
      padding: 24px;
      border: none;
      background: #ffffff;
      color: #000000;
      letter-spacing: 0.25em;
      font-size: 11px;
      font-family: 'Inter', sans-serif;
      font-weight: 400;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      margin-bottom: 20px;
    }

    .action-btn:hover {
      background: #111;
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(255, 255, 255, 0.1);
    }`;

const newButtonCss = `    /* BUTTONS */
    .action-btn {
      width: 100%;
      padding: 24px;
      border: 1px solid #ffffff;
      background: #ffffff;
      color: #000000;
      letter-spacing: 0.25em;
      font-size: 11px;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      text-transform: uppercase;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      margin-bottom: 20px;
    }

    .action-btn::after {
      content: '';
      position: absolute;
      top: 0; left: -100%;
      width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
      transition: left 0.7s ease;
    }

    .action-btn:hover {
      background: #000000;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(255, 255, 255, 0.05);
    }
    .action-btn:hover::after {
      left: 100%;
    }`;

const oldDrawerCss = `    /* WALLET DRAWER */
    #wallet-drawer {
      position: fixed;
      bottom: -100%;
      left: 0;
      width: 100%;
      background: #000000;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 -10px 40px rgba(255, 255, 255, 0.05);
      padding: 30px 24px 40px 24px;
      transition: bottom 0.4s cubic-bezier(0.25, 1, 0.5, 1);
      z-index: 1000;
      text-align: center;
    }

    #wallet-drawer.show {
      bottom: 0;
    }

    .drawer-title {
      font-family: 'Syncopate', sans-serif;
      font-size: 14px;
      letter-spacing: 0.15em;
      margin-bottom: 30px;
    }`;

const newDrawerCss = `    /* WALLET DRAWER */
    #wallet-drawer {
      position: fixed;
      bottom: -100%;
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
      padding: 40px 24px 50px 24px;
      transition: bottom 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
      text-align: center;
    }

    #wallet-drawer.show {
      bottom: 0;
    }

    .drawer-title {
      font-family: 'Syncopate', sans-serif;
      font-size: 13px;
      color: #ffffff;
      letter-spacing: 0.20em;
      margin-bottom: 35px;
    }`;

const oldOptionsCss = `    .wallet-option {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 15px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px;
      margin-bottom: 15px;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.15em;
      transition: all 0.3s ease;
      background: #000;
    }

    .wallet-option img, .wallet-option svg {
      width: 24px;
      height: 24px;
      transition: transform 0.3s ease;
    }

    .wallet-option:hover {
      border-color: #ffffff;
      box-shadow: 0 5px 15px rgba(255, 255, 255, 0.05);
      transform: translateY(-2px);
    }

    .wallet-option:hover img, .wallet-option:hover svg {
      transform: scale(1.1);
    }`;

const newOptionsCss = `    .wallet-option {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 18px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 24px 20px;
      margin-bottom: 12px;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.15em;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      background: #000000;
      border-radius: 4px;
    }

    .wallet-option img, .wallet-option svg {
      width: 26px;
      height: 26px;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .wallet-option:hover {
      border-color: #ffffff;
      background: #111111;
      box-shadow: 0 10px 25px rgba(255, 255, 255, 0.05);
      transform: translateY(-2px);
    }

    .wallet-option:hover img, .wallet-option:hover svg {
      transform: scale(1.15) rotate(2deg);
    }`;

content = content.replace(oldButtonCss, newButtonCss);
content = content.replace(oldDrawerCss, newDrawerCss);
content = content.replace(oldOptionsCss, newOptionsCss);

fs.writeFileSync(secretPayPath, content);
console.log("secret_pay updated");
