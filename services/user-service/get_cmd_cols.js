const { connectDB } = require('./config/db');
const fs = require('fs');

(async () => {
    try {
        const pool = await connectDB();
        const r = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Comments'");
        fs.writeFileSync('comments_cols.json', JSON.stringify(r.recordset, null, 2));
    } catch (e) { }
    process.exit();
})();
