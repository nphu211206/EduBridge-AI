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
    const r = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
    `);
    let out = 'ALL TABLES:\n';
    for (const row of r.recordset) {
        out += row.TABLE_NAME + '\n';
    }
    fs.writeFileSync('all_tables.txt', out);
    console.log('Saved to all_tables.txt');
    process.exit(0);
}
check();
