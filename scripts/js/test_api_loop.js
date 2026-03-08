const http = require('http');

const req = http.request('http://127.0.0.1:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
}, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        const t = JSON.parse(d).token;
        if (!t) return console.log('LOGIN ERROR', d);
        console.log('TOKEN OK');

        for (let i = 1; i <= 10; i++) {
            http.get(`http://127.0.0.1:5001/api/courses/${i}`, {
                headers: { 'Authorization': 'Bearer ' + t }
            }, r2 => {
                let d2 = '';
                r2.on('data', c => d2 += c);
                r2.on('end', () => {
                    if (r2.statusCode === 200) {
                        console.log(`COURSE ${i} OK!`);
                    }
                });
            });
        }

        const pReq = http.request('http://127.0.0.1:5001/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t }
        }, r3 => {
            let d3 = '';
            r3.on('data', c => d3 += c);
            r3.on('end', () => console.log('POST CREATE STATUS:', r3.statusCode, 'BODY:', d3.substring(0, 300)));
        });
        pReq.write(JSON.stringify({ content: 'Fixed everything!', visibility: 'public' }));
        pReq.end();
    });
});
req.write(JSON.stringify({ email: 'nam@gmail.com', password: 'Admin@123' }));
req.end();
