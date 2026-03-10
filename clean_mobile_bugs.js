const fs = require('fs');
const path = require('path');

const dirPath = '/Users/dompom/Desktop/Dompomstore ';

const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dirPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Remove raw "\n" appearing above the header.
    // The \n resulted from appending raw strings to HTML earlier.
    // We'll look for literal '\n' text node in the HTML.
    content = content.replace(/\\n/g, '');

    content = content.replace(/>\\n</g, '><');
    content = content.replace(/>\\n/g, '>');
    content = content.replace(/\\n</g, '<');

    // also look for literal \n string that is placed awkwardly
    content = content.replace(/\n\s*\\n\s*\n/g, '\n');

    // 2. Fix Brand Logo.
    // We need to change any brand-logo text to DOMPOMSTORE.
    // Previously: <a href="index.html">Dom</a><a href="hidden.html" class="p-link">p</a><a href="index.html">om<br>store</a>
    // Now: DOMPOMSTORE

    content = content.replace(/<div class="brand-logo">[\s\S]*?<\/div>/, '<div class="brand-logo"><a href="index.html">DOMPOMSTORE</a></div>');
    content = content.replace(/<a href="index.html" class="logo">.*?<\/a>/, '<a href="index.html" class="logo">DOMPOMSTORE</a>');


    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[CLEANUP] Updated ${file}`);
    }
});
