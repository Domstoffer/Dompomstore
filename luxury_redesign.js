const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

const luxuryCss = `
    /* --- LUXURY MOBILE REDESIGN --- */
    
    /* BOTTOM SHEET CART */
    #cart-dropdown {
      top: auto !important;
      bottom: -100% !important;
      right: 0 !important;
      left: 0 !important;
      width: 100% !important;
      max-width: 100vw !important;
      height: 80vh !important;
      border-radius: 25px 25px 0 0 !important;
      border-top: 1px solid var(--border) !important;
      border-left: none !important;
      transition: bottom 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
      box-shadow: 0 -10px 40px rgba(0,0,0,0.1) !important;
    }
    #cart-dropdown.show {
      bottom: 0 !important;
    }

    /* LUXURY TYPOGRAPHY */
    body {
      font-family: 'Inter', sans-serif !important;
    }
    h1, h2, h3, .brand-logo, .huge-title, .cart-title, .step-indicator {
      font-family: 'Syncopate', sans-serif !important;
    }

    @media (max-width: 768px) {
      /* FULLSCREEN HERO (Index only) */
      .mobile-hero {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        height: 100vh;
        width: 100vw;
        position: relative;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg);
        z-index: 5;
        border-bottom: 1px solid var(--border);
        margin-bottom: 40px;
      }
      .mobile-hero-title {
        font-family: 'Syncopate', sans-serif;
        font-size: 2.5rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      .mobile-hero-subtitle {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        opacity: 0.5;
        margin-bottom: 40px;
      }
      .mobile-hero-btn {
        padding: 18px 40px;
        background: var(--text);
        color: var(--bg);
        font-size: 10px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        text-decoration: none;
        border-radius: 50px;
      }

      /* LUXURY PRODUCT CARDS */
      .product-box {
        background: var(--accent) !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        padding-bottom: 20px !important;
      }
      .image-wrapper {
        border-radius: 16px 16px 0 0 !important;
        margin-bottom: 15px !important;
      }
      .product-info-grid {
        padding: 0 20px !important;
        align-items: center !important;
        text-align: center !important;
      }
      .product-name {
        font-size: 14px !important;
        font-weight: 600 !important;
      }
      .product-price {
        font-size: 13px !important;
        font-weight: 400 !important;
        color: var(--text) !important;
        opacity: 0.7 !important;
        margin-top: 5px !important;
      }
    }
`;

fs.readdir(directoryPath, (err, files) => {
    if (err) return;

    files.forEach((file) => {
        if (path.extname(file) === '.html') {
            const filePath = path.join(directoryPath, file);
            let html = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // 1. Inject Luxury CSS
            if (html.includes('</style>') && !html.includes('/* --- LUXURY MOBILE REDESIGN --- */')) {
                html = html.replace(/<\/style>/, luxuryCss + '\n</style>');
                modified = true;
            } else if (html.includes('</head>') && !html.includes('/* --- LUXURY MOBILE REDESIGN --- */')) {
                html = html.replace('</head>', '<style>' + luxuryCss + '</style>\n</head>');
                modified = true;
            }

            // 2. Remove blocking preloader HTML and script mapping
            const preloaderRegex = /<div id="global-preloader">[\s\S]*?<\/div>[\s\S]*?<script>[\s\S]*?global-preloader[\s\S]*?<\/script>/;
            if (preloaderRegex.test(html)) {
                html = html.replace(preloaderRegex, '');
                modified = true;
            }

            // Also aggressively strip just the div if the script regex fails
            const preloaderDivRegex = /<div id="global-preloader">\s*<div class="spinner"><\/div>\s*<\/div>/g;
            if (preloaderDivRegex.test(html)) {
                html = html.replace(preloaderDivRegex, '');
                modified = true;
            }

            // 3. Inject Mobile Hero into index.html
            if (file === 'index.html' && !html.includes('mobile-hero')) {
                const heroHtml = `
      <!-- MOBILE LUXURY HERO -->
      <div class="mobile-hero">
        <div class="mobile-hero-title">Dompom</div>
        <div class="mobile-hero-subtitle">Redefining Vanguard Apparel</div>
        <a href="#main-container" class="mobile-hero-btn" onclick="document.getElementById('main-container').scrollIntoView({behavior: 'smooth'})">Shop Collection</a>
      </div>
              `;
                // Insert hero right at the start of vanguard-right
                html = html.replace('<div class="vanguard-right">', '<div class="vanguard-right">\\n' + heroHtml);
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, html, 'utf8');
                console.log(`💎 Luxury update applied to: ${file}`);
            }
        }
    });
    console.log('\n✨ Automated Luxury Injector Complete!');
});
