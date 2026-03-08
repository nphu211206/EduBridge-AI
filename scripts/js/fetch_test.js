const http = require('http');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', err => reject(err));
    });
}

(async () => {
    try {
        const res1 = await fetchUrl('http://127.0.0.1:5001/api/courses');
        console.log('--- GET /api/courses ---');
        console.log('Status:', res1.status);
        let j1 = JSON.parse(res1.body);
        console.log('Success:', j1.success);
        console.log('Data type:', Array.isArray(j1.data) ? 'Array' : typeof j1.data);
        if (Array.isArray(j1.data)) console.log('Length:', j1.data.length);

    } catch (e) {
        console.log(e);
    }
})();
