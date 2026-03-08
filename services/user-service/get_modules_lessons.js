const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const r2 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='CourseModules'");
        const r3 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Lessons'");
        require('fs').writeFileSync('modules_lessons.json', JSON.stringify({
            modules: r2.recordset.map(x => x.COLUMN_NAME),
            lessons: r3.recordset.map(x => x.COLUMN_NAME)
        }, null, 2));
        console.log("OK");
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
})();
