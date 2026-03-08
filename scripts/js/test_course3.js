const h = require('http');
h.get('http://127.0.0.1:5001/api/courses/3', r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => console.log('COURSE 3:', r.statusCode, d.substring(0, 150)));
});
