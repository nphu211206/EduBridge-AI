const { poolPromise, sql } = require('./config/db');
const http = require('http');

(async () => {
    try {
        const pool = await poolPromise;
        const r = await pool.request().query("SELECT TOP 1 Email FROM Users");
        const email = r.recordset[0].Email;
        console.log('EMAIL:', email);

        const req = http.request('http://127.0.0.1:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                const t = JSON.parse(d).token;
                if (!t) return console.log('LOGIN ERROR:', d);
                console.log('TOKEN:', t.substring(0, 20) + '...');

                http.get('http://127.0.0.1:5001/api/courses/1', {
                    headers: { 'Authorization': 'Bearer ' + t }
                }, r2 => {
                    let d2 = '';
                    r2.on('data', c => d2 += c);
                    r2.on('end', () => console.log('COURSE:', d2.substring(0, 250)));
                });

                const pReq = http.request('http://127.0.0.1:5001/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + t }
                }, r3 => {
                    let d3 = '';
                    r3.on('data', c => d3 += c);
                    r3.on('end', () => console.log('POST:', d3.substring(0, 250)));
                });
                pReq.write(JSON.stringify({ content: 'hello world', visibility: 'public' }));
                pReq.end();
            });
        });
        req.write(JSON.stringify({ email, password: 'Admin@123' }));
        req.end();
    } catch (e) {
        console.error(e);
    }
})();
