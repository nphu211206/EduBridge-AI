const fs = require('fs');
const s = JSON.parse(fs.readFileSync('schema-full.json', 'utf8'));
const cols = s['Jobs'].map(c => c.name);
fs.writeFileSync('jobs_cols.txt', cols.join(', '));
console.log('Saved columns to jobs_cols.txt');
