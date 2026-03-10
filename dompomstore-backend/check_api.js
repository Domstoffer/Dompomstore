const fetch = require('node-fetch');

async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3001/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'domstoffer', password: '1Christoph1' })
        });

        const cookie = loginRes.headers.raw()['set-cookie'][0].split(';')[0];
        console.log('Cookie obtained:', cookie.substring(0, 20) + '...');

        console.log('Fetching orders...');
        const ordersRes = await fetch('http://localhost:3001/api/admin/orders', {
            headers: { 'Cookie': cookie }
        });

        console.log('Orders status:', ordersRes.status);
        const text = await ordersRes.text();
        console.log('Orders response length:', text.length);
        console.log('First 200 chars:', text.substring(0, 200));

        // Let's parse it precisely
        const orders = JSON.parse(text);
        console.log('Parsed orders array length:', orders.length);
    } catch (e) {
        console.error('Test script error:', e.message);
    }
}
test();
