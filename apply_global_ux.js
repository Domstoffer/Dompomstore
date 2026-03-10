const fs = require('fs');
const glob = require('glob');

const headInjection = `
  <!-- PWA & SEO Meta Tags -->
  <meta name="description" content="DompomStore - Exclusive Vanguard E-Commerce. Pay seamlessly with Web3 (Solana, Phantom, MetaMask) or traditional methods.">
  <meta name="theme-color" content="#ffffff">
  <link rel="icon" type="image/png" href="https://dompomshop.com/favicon.ico">
  <link rel="apple-touch-icon" href="https://dompomshop.com/favicon.ico">

  <style>
    /* Vanguard Global Preloader & Mobile Nav Fixes - SAFARI OPTIMIZED */
    :root {
      --vh: 1vh;
    }

    #global-preloader {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      height: 100dvh;
      background-color: #ffffff;
      z-index: 99999;
      display: -webkit-flex;
      display: flex;
      -webkit-justify-content: center;
      justify-content: center;
      -webkit-align-items: center;
      align-items: center;
      transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s ease;
      -webkit-transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s ease;
      pointer-events: none;
    }
    #global-preloader.fade-out {
      opacity: 0;
      visibility: hidden;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-top-color: #000000;
      border-radius: 50%;
      -webkit-border-radius: 50%;
      animation: spin 1s linear infinite;
      -webkit-animation: spin 1s linear infinite;
    }
    
    /* WebKit Momentum Scrolling */
    .scroll-container, #cart-items, .vanguard-right, .cart-drawer {
      -webkit-overflow-scrolling: touch;
    }

    /* iOS Safe Area Support */
    body {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }

    /* Premium Touch Interactions */
    button, a, .nav-item, .product-box, .v-btn {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      will-change: transform; /* Hint for hardware acceleration */
    }

    /* Safari Input Reset */
    input, select, textarea {
      -webkit-appearance: none;
      border-radius: 0;
    }

    html.dark-mode #global-preloader { background-color: #000000; }
    html.dark-mode .spinner { border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: #ffffff; }

    @keyframes spin { 100% { transform: rotate(360deg); } }
    @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .top {
        padding: 15px 20px !important;
        padding-top: calc(15px + env(safe-area-inset-top)) !important;
        display: -webkit-flex;
        display: flex;
        -webkit-justify-content: space-between;
        justify-content: space-between;
        -webkit-align-items: center;
        align-items: center;
      }
      .logo {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
        font-size: 20px !important;
      }
    }
  </style>
`;

const bodyInjection = `
  <!-- Preloader Element -->
  <div id="global-preloader">
    <div class="spinner"></div>
  </div>
  <script>
    // iOS vh fix
    function setVH() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
    }
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    setVH();

    window.addEventListener('load', () => {
      const p = document.getElementById('global-preloader');
      if(p) setTimeout(() => { p.classList.add('fade-out'); }, 150);
    });

    document.addEventListener('click', (e) => {
      const target = e.target.closest('a');
      if (target && target.href && target.target !== '_blank' && target.href.startsWith(window.location.origin) && !target.href.includes('#')) {
        e.preventDefault();
        const p = document.getElementById('global-preloader');
        if(p) {
          p.classList.remove('fade-out');
          p.style.pointerEvents = 'all';
          setTimeout(() => { window.location.href = target.href; }, 400);
        } else {
          window.location.href = target.href;
        }
      }
    });
  </script>
`;

const files = glob.sync('*.html');

files.forEach(file => {
  if (file === 'admin.html') return;

  let content = fs.readFileSync(file, 'utf8');

  // Clean up ANY existing Vanguard UX injections to avoid bloat and ensure update
  // Use string search and slice instead of regex to avoid escaping hell
  const startHead = content.indexOf('<!-- PWA & SEO Meta Tags -->');
  const endHead = content.indexOf('</style>', startHead);
  if (startHead !== -1 && endHead !== -1) {
    content = content.substring(0, startHead) + content.substring(endHead + 8);
  }

  const startBody = content.indexOf('<!-- Preloader Element -->');
  const endBody = content.indexOf('</script>', startBody);
  if (startBody !== -1 && endBody !== -1) {
    content = content.substring(0, startBody) + content.substring(endBody + 9);
  }

  // Inject fresh
  content = content.replace('</head>', headInjection + '\n</head>');
  content = content.replace('<body>', '<body>\n' + bodyInjection);

  if (file.includes('hidden') || file.includes('secret')) {
    if (!content.includes('class="dark-mode"')) {
      content = content.replace('<html lang="de">', '<html lang="de" class="dark-mode">');
      content = content.replace('<html>', '<html class="dark-mode">');
    }
  }

  fs.writeFileSync(file, content);
  console.log('✅ Safari/WebKit Refactor Applied: ' + file);
});
