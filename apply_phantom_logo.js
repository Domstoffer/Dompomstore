const fs = require('fs');

const correctPhantomSvg = `<svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M117.9 31C117.9 31 106 14.3 84.1 6.5C62.1 -1.4 39.5 0.5 39.5 0.5C39.5 0.5 45.4 7.6 42.1 19C38.8 30.4 23.6 29 23.6 29C23.6 29 26 38.5 22.2 46.1C18.4 53.7 9.80005 55.6 9.80005 55.6C9.80005 55.6 15 63.6 12.6 72.2C10.2 80.8 1.6 83.1 1.6 83.1C-3.2 104.9 5.39999 127.4 5.39999 127.4C5.39999 127.4 30.6 116 48.1 118.9C65.6 121.8 81.3 127.5 81.3 127.5C81.3 127.5 106.8 102.3 117.3 75.2C127.8 48.1 117.9 31 117.9 31ZM40 91.8C35.5 91.8 31.8 88.1 31.8 83.6C31.8 79.1 35.5 75.4 40 75.4C44.5 75.4 48.2 79.1 48.2 83.6C48.2 88.1 44.5 91.8 40 91.8ZM81.6 77.2C72.8 77.2 65.7 70.1 65.7 61.3C65.7 52.5 72.8 45.4 81.6 45.4C90.4 45.4 97.5 52.5 97.5 61.3C97.5 70.1 90.4 77.2 81.6 77.2Z" fill="#AB9FF2"/></svg>`;

const files = ['pay.html', 'secret_pay.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');

        // Replace the old SVG image tag (using a Regex to match the data:image/svg base64 block gracefully)
        // The previous logo is inside <img src="data:image/svg+xml;base64,PHN...=" alt="Phantom" />
        html = html.replace(/<img src="data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+" alt="Phantom" \/>/g, correctPhantomSvg);

        fs.writeFileSync(file, html);
        console.log('Updated Phantom Ghost Logo in ' + file);
    }
});
