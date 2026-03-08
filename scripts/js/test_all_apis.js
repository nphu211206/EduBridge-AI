const fs = require('fs');
let out = '';
function log(msg) { out += msg + '\n'; console.log(msg); }

async function testAllApis() {
    log("=== BẮT ĐẦU TEST API TOÀN DIỆN ===");

    // 1. ADMIN API
    try {
        log("\n[1. ADMIN SERVICE]");
        const adminLogin = await fetch('http://127.0.0.1:5002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'Admin@123', role: 'ADMIN' })
        }).then(r => r.json());

        if (!adminLogin.token) throw new Error("No token returned");
        const adminToken = adminLogin.token;
        log("✅ Admin Login OK");

        const adminHeaders = { Authorization: `Bearer ${adminToken}` };
        const adminEps = ['exams', 'competitions'];
        for (const ep of adminEps) {
            try {
                const res = await fetch(`http://127.0.0.1:5002/api/${ep}`, { headers: adminHeaders });
                log(res.ok ? `✅ Admin /api/${ep} OK` : `❌ Admin /api/${ep} FAIL: ${res.status}`);
            } catch (e) {
                log(`❌ Admin /api/${ep} FAIL: ${e.message}`);
            }
        }
    } catch (e) { log("❌ Admin Login FAIL: " + e.message); }

    // 2. USER API
    try {
        log("\n[2. USER SERVICE (Học sinh)]");
        const userLogin = await fetch('http://127.0.0.1:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nam@gmail.com', password: 'Admin@123' })
        }).then(r => r.json());

        if (!userLogin.token) throw new Error("No token returned: " + JSON.stringify(userLogin));
        const userToken = userLogin.token;
        log("✅ User Login OK");

        const userHeaders = { Authorization: `Bearer ${userToken}` };
        const userEps = ['courses', 'events', 'posts', 'notifications'];
        for (const ep of userEps) {
            try {
                const res = await fetch(`http://127.0.0.1:5001/api/${ep}`, { headers: userHeaders });
                const text = await res.text();
                log(res.ok ? `✅ User /api/${ep} OK` : `❌ User /api/${ep} FAIL: ${res.status} Body: ${text}`);
            } catch (e) {
                log(`❌ User /api/${ep} FAIL: ${e.message}`);
            }
        }
    } catch (e) { log("❌ User Login FAIL: " + e.message); }

    // 3. TEACHER API
    try {
        log("\n[3. TEACHER SERVICE]");
        const teacherLogin = await fetch('http://127.0.0.1:5003/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'teacher@edubridge.edu.vn', password: 'Admin@123' })
        }).then(r => r.json());

        if (!teacherLogin.token) {
            log("Teacher response: " + JSON.stringify(teacherLogin));
            throw new Error("No token returned");
        }
        const teacherToken = teacherLogin.token;
        log("✅ Teacher Login OK");

        const teacherHeaders = { Authorization: `Bearer ${teacherToken}` };
        const teacherEps = ['courses', 'students', 'assignments'];
        for (const ep of teacherEps) {
            try {
                const res = await fetch(`http://127.0.0.1:5003/api/${ep}`, { headers: teacherHeaders });
                const text = await res.text();
                log(res.ok ? `✅ Teacher /api/${ep} OK` : `❌ Teacher /api/${ep} FAIL: ${res.status} Body: ${text}`);
            } catch (e) {
                log(`❌ Teacher /api/${ep} FAIL: ${e.message}`);
            }
        }
    } catch (e) { log("❌ Teacher Login FAIL: " + e.message); }

    fs.writeFileSync('api_report.txt', out, 'utf8');
}

testAllApis();
