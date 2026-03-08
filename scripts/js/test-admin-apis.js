const fs = require('fs');
async function testApis() {
    try {
        console.log("Logging in as Admin...");
        const loginRes = await fetch('http://localhost:5002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin@edubridge.edu.vn', password: '123456' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };

        console.log("\nTesting /api/reports...");
        const res3 = await fetch('http://localhost:5002/api/reports?page=1&limit=10', { headers });
        const text3 = await res3.text();
        fs.writeFileSync('debug.txt', text3);
        console.log("Reports Status:", res3.status);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}
testApis();
