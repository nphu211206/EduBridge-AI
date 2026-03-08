const { connectDB } = require('./config/db');
const fs = require('fs');
(async () => {
    try {
        const pool = await connectDB();
        const r = await pool.request().query("SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Posts'");
        fs.writeFileSync('posts_schema.json', JSON.stringify(r.recordset, null, 2));
        console.log('Schema written to posts_schema.json');
    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
