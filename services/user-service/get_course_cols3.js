const { pool } = require('./config/db');
(async () => {
    try {
        const p = await pool;
        const r = await p.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Courses'");
        const cols = r.recordset.map(x => x.COLUMN_NAME);
        require('fs').writeFileSync('course_cols.json', JSON.stringify(cols, null, 2));
        console.log("OK");
    } catch (e) {
        console.log(e.message);
    }
    process.exit();
})();
