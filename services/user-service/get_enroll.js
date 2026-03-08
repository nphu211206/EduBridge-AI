const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const r = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='CourseEnrollments'");
        const cols = r.recordset.map(x => x.COLUMN_NAME);
        require('fs').writeFileSync('enroll_cols.json', JSON.stringify(cols, null, 2));
        console.log("OK");
    } catch (e) {
        console.log(e.message);
    }
    process.exit();
})();
