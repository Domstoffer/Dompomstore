const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

const doubleTapJs = `
<!-- ANTI-ZOOM SCRIPT -->
<script>
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);
</script>
</body>
`.trim();

const extraCss = `
    /* PREVENT DOUBLE TAP ZOOM */
    html, body {
      touch-action: manipulation !important;
    }
</style>
`.trim();


files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Viewport Meta Tag Update
    content = content.replace(/<meta name="viewport" content="[^"]*">/g, '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');

    // 2. Add CSS to global stylesheet (if there's a style tag)
    if (!content.includes('touch-action: manipulation')) {
        content = content.replace(/<\/style>/, '\\n' + extraCss);
    }

    // 3. Add JS Protection before </body>
    if (!content.includes('lastTouchEnd = 0;')) {
        content = content.replace(/<\/body>/i, doubleTapJs);
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + file);
    }
});

console.log('SUCCESS');
