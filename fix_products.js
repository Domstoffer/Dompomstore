const fs = require('fs');

const files = [
    '/Users/dompom/Desktop/Dompomstore /produkt1.html',
    '/Users/dompom/Desktop/Dompomstore /produkt2.html',
    '/Users/dompom/Desktop/Dompomstore /produkt3.html',
    '/Users/dompom/Desktop/Dompomstore /produkt4.html',
    '/Users/dompom/Desktop/Dompomstore /produkt5.html'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        content = content.replace(
            /<a href="index\.html" class="logo">Dom<span style="opacity:0\.3">p<\/span>omstore<\/a>/g,
            '<span class="logo">Dom<span style="opacity:0.3">p</span>omstore</span>'
        );

        content = content.replace(
            /<a href="index\.html" class="logo">DOM<span style="opacity:0\.3">P<\/span>OMSTORE<\/a>/gi,
            '<span class="logo">DOM<span style="opacity:0.3">P</span>OMSTORE</span>'
        );

        content = content.replace(
            /border-right:\s*1px\s*solid\s*rgba\(0,\s*0,\s*0,\s*0\.05\);/g,
            ''
        );

        content = content.replace(
            /padding:\s*40px;/g,
            'padding: 80px;'
        );

        content = content.replace(
            /padding:\s*120px\s*80px\s*80px\s*80px;/g,
            'padding: 100px;\n      justify-content: center;'
        );

        content = content.replace(
            /font-size:\s*2\.2rem;/g,
            'font-size: 2.8rem;'
        );

        content = content.replace(
            /font-size:\s*1\.2rem;\n\s*font-weight:\s*400;\n\s*color:\s*#777;/g,
            'font-size: 1.4rem;\n      font-weight: 300;\n      color: #000;'
        );

        content = content.replace(
            /padding:\s*22px\s*0;/g,
            'padding: 26px 0;'
        );

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
