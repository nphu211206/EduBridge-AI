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
        const errors = {};
        let calls = 2;

        const checkDone = () => {
            calls--;
            if (calls === 0) fs.writeFileSync('error_target.json', JSON.stringify(errors, null, 2));
        };

        // Call /api/courses/enrolled
        const getEnrolled = http.request('http://127.0.0.1:5001/api/courses/enrolled', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + t }
        }, r1 => {
            let d1 = '';
            r1.on('data', c => d1 += c);
            r1.on('end', () => { errors['courses_enrolled'] = JSON.parse(d1); checkDone(); });
        });
        getEnrolled.end();

        // Call /api/posts/1/comments
        const getComments = http.request('http://127.0.0.1:5001/api/posts/1/comments', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + t }
        }, r2 => {
            let d2 = '';
            r2.on('data', c => d2 += c);
            r2.on('end', () => { errors['post_comments'] = JSON.parse(d2); checkDone(); });
        });
        getComments.end();
    });
});
req.write(JSON.stringify({ email: 'nam@gmail.com', password: 'Admin@123' }));
req.end();
