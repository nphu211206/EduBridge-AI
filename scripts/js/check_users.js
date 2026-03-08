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
    try {
        const pool = await sql.connect(config);
        const r = await pool.request().query(`
            SELECT COLUMN_NAME, IS_COMPUTED 
            FROM INFORMATION_SCHEMA.COLUMNS c
            LEFT JOIN sys.columns sc ON sc.name = c.COLUMN_NAME AND sc.object_id = OBJECT_ID('Users')
            WHERE TABLE_NAME = 'Users'
        `);
        fs.writeFileSync('users_schema.json', JSON.stringify(r.recordset, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
