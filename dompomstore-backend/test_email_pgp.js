const fs = require('fs');

const runTest = async () => {
    console.log('1. Starting Mock Checkout Flow...');

    // Mock a cart and shipping payload
    const payload = {
        cart: [
            { name: 'DB-01', price: 49.00, quantity: 1 },
            { name: 'ZYN', price: 22.00, quantity: 2 }
        ],
        shipping: {
            firstname: 'DomPom',
            lastname: 'Tester',
            email: 'domimadlindl258@icloud.com', // Should be encrypted in the end
            street: 'Kryptostraße 42',
            zip: '10115',
            city: 'Berlin',
            country: 'Germany'
        },
        source: 'public'
    };

    try {
        // Step 1: Create Order
        console.log('2. Sending Create Order Request to API...');
        const createRes = await fetch('http://localhost:3001/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!createRes.ok) throw new Error('Create Order Failed: ' + await createRes.text());
        const orderData = await createRes.json();
        console.log('✅ Order Created Successfully!', orderData);

        const orderId = orderData.orderId;

        // Step 2: Manually Trigger Paid Status in DB (Simulating Web3 On-Chain Verification)
        // Normally, the frontend submits the txHash to /api/verify-payment. We'll directly hit the DB to bypass the actual Solana/EVM live RPC check logic for this email test.
        console.log('3. Simulating Web3 On-Chain Verification (Direct DB Injection for email test)...');

        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'store.db');
        const db = new sqlite3.Database(dbPath);

        // Mock a confirmed transaction hash
        const mockTxHash = '5x' + Math.random().toString(36).substring(2, 15) + '...SOLANA_MOCK';

        db.run("UPDATE orders SET status = 'paid', reference = ?, txHash = ?, network = 'Solana', token = 'USDC', walletSender = 'MockWallet123' WHERE id = ?",
            ["USDC:" + mockTxHash, mockTxHash, orderId],
            async (err) => {
                if (err) {
                    console.error('Failed to mock DB update:', err);
                    return;
                }
                console.log('✅ Order forcefully marked as PAID in Database.');

                // Step 3: Trigger the PGP encryption and Mail dispatch manually as we bypassed the /verify-payment endpoint 
                // (which normally calls these services).

                console.log('4. Triggering PGP Crypto Engine and SMTP Mail Dispatcher...');
                const pgpService = require('./pgpService');
                const mailService = require('./mailService');

                await pgpService.init();

                db.get('SELECT * FROM orders WHERE id = ?', [orderId], async (err, fullOrder) => {
                    if (fullOrder) {
                        const orderPayload = { ...fullOrder, items: JSON.parse(fullOrder.items || '[]'), shipping: JSON.parse(fullOrder.shipping || '{}') };
                        console.log('   -> Encrypting Order Data...');
                        const encryptedAscii = await pgpService.encryptOrderData(orderPayload);
                        console.log('   -> Dispatching Email via Nodemailer...');
                        await mailService.sendSecureOrderEmail(orderId, encryptedAscii);
                        console.log('\\n\\n🎉 MOCK CHECKOUT FULLY COMPLETE! Check your iCloud Email for the PGP payload.');

                        // Keep the process alive for a moment to let the async mailer finish
                        setTimeout(() => process.exit(0), 5000);
                    }
                });
            });

    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
};

runTest();
