const fs = require('fs');
const { connectDB } = require('./config/db.js');
connectDB().then(async p => {
    try {
        const res = await p.request().query("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('Users')");
        fs.writeFileSync('cols.txt', JSON.stringify(res.recordset.map(r => r.name), null, 2));
    } catch (e) {
        console.error("ERR:", e.message);
    }
    process.exit(0);
});
