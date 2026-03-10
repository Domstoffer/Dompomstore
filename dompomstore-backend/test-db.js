const sqlite3 = require('sqlite3').verbose();
const pgpService = require('./pgpService');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'store.db'));

async function test() {
    await pgpService.init();
    db.all(`SELECT * FROM orders ORDER BY createdAt DESC LIMIT 5`, async (err, rows) => {
        if (err) return console.error("Database error");
        console.log(`[TEST] Found ${rows.length} rows`);
        try {
            const ordersPromises = rows.map(async (r, i) => {
                let parsedShipping = {};
                if (typeof r.shipping === 'string' && r.shipping.includes('BEGIN PGP MESSAGE')) {
                    console.log(`[TEST] Decrypting row index ${i}, id ${r.id}...`);
                    try {
                        const decryptedStr = await pgpService.decryptOrderData(r.shipping);
                        console.log(`[TEST] Decrypted row index ${i}, id ${r.id} successfully!`);
                    } catch (decErr) {
                        console.error(`[TEST] Failed to decrypt ${r.id}:`, decErr.message);
                    }
                } else {
                    console.log(`[TEST] Row ${i} is not encrypted.`);
                }
            });
            console.log(`[TEST] Awaiting Promise.all for ${ordersPromises.length} promises...`);
            await Promise.all(ordersPromises);
            console.log(`[TEST] Done!`);
        } catch (e) {
            console.error("[TEST] Error:", e);
        }
    });
}

test();
