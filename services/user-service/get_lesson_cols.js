const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const r2 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='CourseModules'");
        const r3 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Lessons'");
        console.log("MODULES:", JSON.stringify(r2.recordset.map(x => x.COLUMN_NAME)));
        console.log("LESSONS:", JSON.stringify(r3.recordset.map(x => x.COLUMN_NAME)));
    } catch (e) { console.error(e.message); }
    process.exit();
})();
