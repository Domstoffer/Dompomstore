const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

// Global CSS to be injected right before </style> or </head>
const mobileCss = `
    /* --- MOBILE UX PREMIUM FIXES --- */
    /* CART RESPONSIVE FIX */
    #cart-dropdown {
      width: 100%;
      max-width: 100vw;
    }

    /* INPUT IOS FIX (Prevent Auto-Zoom) */
    input, select, textarea {
      font-size: 16px !important;
    }

    @media (max-width: 500px) {
      /* PRODUCT CAROUSEL FIX */
      .container {
        display: flex !important;
        flex-direction: row !important;
        overflow-x: auto !important;
        scroll-snap-type: x mandatory !important;
        gap: 15px !important;
        padding-bottom: 20px !important; /* scrollbar padding */
        -webkit-overflow-scrolling: touch;
      }
      
      .container::-webkit-scrollbar {
        display: none; /* Hide scrollbar for clean UI */
      }
      
      .product-box {
        min-width: 90% !important;
        scroll-snap-align: center !important;
        flex: 0 0 auto !important;
      }
      
      /* STICKY CTA Product Pages */
      .add-to-cart {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        width: 100% !important;
        margin-bottom: 0 !important;
        padding-bottom: calc(26px + env(safe-area-inset-bottom)) !important;
        z-index: 1000 !important;
      }
      
      /* Ensure info-side doesn't overlap the fixed CTA */
      .info-side {
        padding-bottom: 120px !important; 
      }
    }
`;

fs.readdir(directoryPath, (err, files) => {
    if (err) {
        console.error('Unable to scan directory: ' + err);
        return;
    }

    files.forEach((file) => {
        if (path.extname(file) === '.html') {
            const filePath = path.join(directoryPath, file);
            let html = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // 1. Inject CSS right before </style> in head, if a style block exists
            if (html.includes('</style>') && !html.includes('/* --- MOBILE UX PREMIUM FIXES --- */')) {
                // Find the last </style> tag in the head portion (or any style)
                html = html.replace(/<\/style>/, mobileCss + '\n</style>');
                modified = true;
            } else if (html.includes('</head>') && !html.includes('/* --- MOBILE UX PREMIUM FIXES --- */')) {
                // Fallback: inject a new style block before </head>
                html = html.replace('</head>', '<style>' + mobileCss + '</style>\n</head>');
                modified = true;
            }

            // 2. Add loading="lazy" to all img tags (except if already lazy or if it's the logo which we don't have but good practice)
            // Warning: simple regex replacement 
            const imgRegex = /<img(?![^>]*loading=["']lazy["'])([^>]+)>/g;
            if (imgRegex.test(html)) {
                html = html.replace(imgRegex, '<img loading="lazy"$1>');
                modified = true;
            }

            // 3. Script Defer (solana.js, ethers.js, paypal) in pay.html and secret_pay.html
            // Target specific scripts
            const scriptRegexWeb3 = /<script\s+src=["'](https:\/\/unpkg\.com\/@solana\/web3\.js[^"']+)["']\s*><\/script>/g;
            if (scriptRegexWeb3.test(html)) {
                html = html.replace(scriptRegexWeb3, '<script defer src="$1"></script>');
                modified = true;
            }
            const scriptRegexEthers = /<script\s+src=["'](https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/ethers[^"']+)["']\s*><\/script>/g;
            if (scriptRegexEthers.test(html)) {
                html = html.replace(scriptRegexEthers, '<script defer src="$1"></script>');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, html, 'utf8');
                console.log(`✅ Applied mobile UX fixes to: ${file}`);
            } else {
                console.log(`⚡ Already optimized or nothing to fix in: ${file}`);
            }
        }
    });

    console.log('\n🎉 All mobile UX optimizations applied successfully!');
});
