const sql = require('mssql');
const fs = require('fs');
const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function check() {
    const pool = await sql.connect(config);
    // Get CHECK constraint definition for Events.Category
    const r = await pool.request().query(`
        SELECT cc.name, cc.definition 
        FROM sys.check_constraints cc
        WHERE cc.parent_object_id = OBJECT_ID('Events')
    `);
    let out = '=== Events CHECK constraints ===\n';
    for (const row of r.recordset) {
        out += `${row.name}: ${row.definition}\n`;
    }

    // Also get the LocationType constraint
    const r2 = await pool.request().query(`
        SELECT cc.name, cc.definition 
        FROM sys.check_constraints cc
        WHERE cc.parent_object_id = OBJECT_ID('Courses')
    `);
    out += '\n=== Courses CHECK constraints ===\n';
    for (const row of r2.recordset) {
        out += `${row.name}: ${row.definition}\n`;
    }

    // Current counts
    const cnt = await pool.request().query(`
        SELECT 
            (SELECT COUNT(*) FROM Users) as users,
            (SELECT COUNT(*) FROM Courses) as courses,
            (SELECT COUNT(*) FROM Events) as events,
            (SELECT COUNT(*) FROM Reports) as reports
    `);
    out += '\n=== COUNTS ===\n';
    out += JSON.stringify(cnt.recordset[0]);

    fs.writeFileSync('check_constraints.txt', out);
    console.log('Done');
    process.exit(0);
}
check();
