const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const r = await pool.request().query("SELECT CourseID, Title FROM Courses WHERE Status = 'published' AND DeletedAt IS NULL");
        console.log(JSON.stringify(r.recordset));
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
})();
