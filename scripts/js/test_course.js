const h = require('http');
h.get('http://127.0.0.1:5001/api/courses/1', r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => console.log('COURSE 1:', r.statusCode));
});
