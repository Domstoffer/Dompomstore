const http = require('http');

const runLoadTest = async () => {
    const concurrentUsers = 25;
    const testPayload = {
        cart: [{ name: "DB-01", quantity: 1 }],
        shipping: {
            firstname: "Stress",
            lastname: "Test",
            email: "stresstest@example.com",
            street: "Load Testing Ave",
            city: "Server City",
            zip: "10101",
            country: "DE"
        },
        source: "public"
    };

    console.log(`[START] Stress Test with ${concurrentUsers} concurrent users.`);
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    const makeRequest = () => {
        return new Promise((resolve) => {
            const reqTime = Date.now();
            const req = http.request(
                {
                    hostname: 'localhost',
                    port: 3001,
                    path: '/api/create-order',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                },
                (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        const latency = Date.now() - reqTime;
                        if (res.statusCode === 200) {
                            successCount++;
                            resolve({ success: true, latency });
                        } else {
                            failCount++;
                            errors.push(data);
                            resolve({ success: false, latency, response: data });
                        }
                    });
                }
            );

            req.on('error', (e) => {
                failCount++;
                errors.push(e.message);
                resolve({ success: false, latency: Date.now() - reqTime, error: e.message });
            });

            req.write(JSON.stringify(testPayload));
            req.end();
        });
    };

    const promises = [];
    for (let i = 0; i < concurrentUsers; i++) {
        promises.push(makeRequest());
    }

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    const maxLatency = Math.max(...results.map(r => r.latency));
    const minLatency = Math.min(...results.map(r => r.latency));
    const avgLatency = results.reduce((a, b) => a + b.latency, 0) / results.length;

    console.log(`[END] Stress Test complete in ${totalTime}ms.`);
    console.log(`- Success: ${successCount}`);
    console.log(`- Failed: ${failCount}`);
    console.log(`- Avg Latency: ${avgLatency.toFixed(2)}ms (Min: ${minLatency}ms, Max: ${maxLatency}ms)`);
    if (errors.length > 0) {
        console.log(`- Unique Errors:`, [...new Set(errors)]);
    }
};

runLoadTest();
