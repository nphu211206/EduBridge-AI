// File: scripts/quick-test-api.js
const http = require('http');

const PORT = 5001; // user-service port

function testEndpoint(path, method = 'GET') {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Accept': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    success: res.statusCode >= 200 && res.statusCode < 300,
                    data: data.slice(0, 100) + (data.length > 100 ? '...' : '')
                });
            });
        });

        req.on('error', (e) => {
            resolve({
                statusCode: 0,
                success: false,
                error: e.message
            });
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Bắt đầu Quick Test các API chính (user-service)...\n');

    const endpoints = [
        { name: 'Khóa học mẫu', path: '/api/test-course/1' },
        { name: 'Trạng thái Server', path: '/' }, // Tùy thuộc xem server.js có '/' không, đây chỉ là ping
    ];

    let passed = 0;
    for (const ep of endpoints) {
        process.stdout.write(`Đang test ${ep.name} (${ep.path})... `);
        const result = await testEndpoint(ep.path);
        if (result.success) {
            console.log(`✅ ĐẠT (Status: ${result.statusCode})`);
            passed++;
        } else {
            console.log(`❌ KHÔNG ĐẠT (Status: ${result.statusCode}, Error: ${result.error || 'N/A'})`);
            console.log(`   Dữ liệu: ${result.data}`);
        }
    }

    console.log(`\n📊 Kết quả: ${passed}/${endpoints.length} tests đạt.`);
    if (passed === endpoints.length) {
        console.log('Tất cả kết nối máy chủ hoạt động tốt! Bạn có thể sử dụng UI ngay lúc này.');
    }
}

runTests();
