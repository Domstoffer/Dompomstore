const fs = require('fs');
const glob = require('glob');

const files = glob.sync('**/*.{html,js}', { ignore: ['node_modules/**', 'dompomstore-backend/node_modules/**'] });

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('3000')) {
        let updated = content.replace(/(?<=:|port\s*:\s*|PORT\s*=\s*process\.env\.PORT\s*\|\|\s*|ETH:\s*data\?\.ethereum\?\.usd\s*\|\|\s*)3000/g, '3001');

        // Custom hack for the frontend URLs
        updated = updated.replace(/http:\/\/localhost:3001/g, 'http://localhost:3001');
        updated = updated.replace(/\${window.location.hostname}:3001/g, '${window.location.hostname}:3001');

        if (content !== updated) {
            fs.writeFileSync(file, updated);
            console.log('Updated ' + file);
        }
    }
});
