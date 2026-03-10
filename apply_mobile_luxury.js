const fs = require('fs');
const path = require('path');

const cssFileName = 'mobile-luxury.css';
const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Inject CSS Link
    if (!content.includes(cssFileName)) {
        content = content.replace('</head>', `  <link rel="stylesheet" href="${cssFileName}">\n</head>`);
    }

    // 2. Checkout Keyboard/Input Types optimizations
    if (file.includes('checkout')) {
        content = content.replace(/<input type="email"/g, '<input type="email" inputmode="email" autocomplete="email"');
        content = content.replace(/name="zip"/g, 'name="zip" inputmode="numeric" pattern="[0-9]*" autocomplete="postal-code"');
        content = content.replace(/<input type="text" id="email"/g, '<input type="email" id="email" inputmode="email" autocomplete="email"');
        content = content.replace(/name="firstname"/g, 'name="firstname" autocomplete="given-name"');
        content = content.replace(/name="lastname"/g, 'name="lastname" autocomplete="family-name"');
    }

    // 3. Product Pages - Luxury Size Pill Injection
    if (file.includes('produkt') && content.includes('id="size"')) {
        if (!content.includes('mobile-size-pills')) {
            const pillsHTML = `
          <div class="mobile-size-pills" id="pill-container"></div>
          <script>
            document.addEventListener("DOMContentLoaded", () => {
              const select = document.getElementById("size");
              const container = document.getElementById("pill-container");
              if (!select || !container) return;
              
              Array.from(select.options).forEach((opt, i) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "size-pill" + (i === 0 ? " selected" : "");
                btn.innerText = opt.innerText;
                btn.onclick = () => {
                  select.value = opt.value;
                  select.dispatchEvent(new Event('change'));
                  document.querySelectorAll(".size-pill").forEach(b => b.classList.remove("selected"));
                  btn.classList.add("selected");
                };
                container.appendChild(btn);
              });
              select.style.display = "none";
            });
          </script>
      `;
            content = content.replace(/(<select [^>]*id="size"[^>]*>[\s\S]*?<\/select>)/, `$1\n${pillsHTML}`);
        }
    }

    // 4. Force Lazy Loading (Skip Hero if possible, but safe globally for grid items)
    content = content.replace(/<img (?!(?:[^>]*?loading="lazy"))(.*?)src="/g, '<img loading="lazy" $1src="');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[MOBILE-UX] Updated ${file}`);
    }
});

console.log('Mobile UX layout CSS attached to all pages.');
