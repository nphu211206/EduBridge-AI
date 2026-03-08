const http = require('http');
const fs = require('fs');

const req = http.request('http://127.0.0.1:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const t = JSON.parse(d).token;

        const pReq = http.request('http://127.0.0.1:5001/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t }
        }, r3 => {
            let d3 = '';
            r3.on('data', c => d3 += c);
            r3.on('end', () => {
                fs.writeFileSync('error_out.json', JSON.stringify(JSON.parse(d3), null, 2));
            });
        });
        pReq.write(JSON.stringify({ content: 'Fixed everything!', visibility: 'public' }));
        pReq.end();
    });
});
req.write(JSON.stringify({ email: 'nam@gmail.com', password: 'Admin@123' }));
req.end();
