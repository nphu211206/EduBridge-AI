const { pool } = require('./config/db');

(async () => {
    try {
        const p = await pool;
        const r = await p.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Courses'");
        const cols = r.recordset.map(x => x.COLUMN_NAME);
        console.log(JSON.stringify(cols));
    } catch (e) {
        console.error(e);
    }
    process.exit();
})();
