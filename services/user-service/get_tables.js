const { connectDB } = require('./config/db');
const fs = require('fs');
(async () => {
    try {
        const pool = await connectDB();
        const r = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES");
        fs.writeFileSync('tables.json', JSON.stringify(r.recordset, null, 2));
    } catch (e) { }
    process.exit();
})();
