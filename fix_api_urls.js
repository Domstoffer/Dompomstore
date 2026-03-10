const fs = require('fs');
const glob = require('glob');

const files = glob.sync('*.html');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Replace fetch instances
    if (content.includes('"http://localhost:3001/api/create-order"')) {
        content = content.replace(/"http:\/\/localhost:3001\/api\/create-order"/g, "\`http://\${window.location.hostname}:3001/api/create-order\`");
        modified = true;
    }

    if (content.includes('"http://localhost:3001/api/verify-paypal"')) {
        content = content.replace(/"http:\/\/localhost:3001\/api\/verify-paypal"/g, "\`http://\${window.location.hostname}:3001/api/verify-paypal\`");
        modified = true;
    }

    if (content.includes('"http://localhost:3001/api/verify-payment"')) {
        content = content.replace(/"http:\/\/localhost:3001\/api\/verify-payment"/g, "\`http://\${window.location.hostname}:3001/api/verify-payment\`");
        modified = true;
    }

    if (content.includes('"http://localhost:3001/api/verify-evm-payment"')) {
        content = content.replace(/"http:\/\/localhost:3001\/api\/verify-evm-payment"/g, "\`http://\${window.location.hostname}:3001/api/verify-evm-payment\`");
        modified = true;
    }

    // Admin Dashboard base URL fix
    if (content.includes("const API_URL = 'http://localhost:3001/api';")) {
        content = content.replace("const API_URL = 'http://localhost:3001/api';", "const API_URL = \`http://\${window.location.hostname}:3001/api\`;");
        modified = true;
    }

    // CORS fix in backend
    if (file === 'dompomstore-backend/server.js') {
        // Needs to happen in the backend script, skipping here
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log('Fixed API URLs in ' + file);
    }
});
