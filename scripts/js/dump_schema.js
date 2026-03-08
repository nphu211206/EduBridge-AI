const sql = require('mssql');

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
        const tables = ['Users', 'Posts', 'Comments', 'PipelineStages'];

        for (const t of tables) {
            console.log(`\n--- TABLE: ${t} ---`);
            const r = await pool.request().query(`
                SELECT COLUMN_NAME, DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '${t}'
            `);
            const isComputed = await pool.request().query(`
                SELECT name, is_computed 
                FROM sys.columns 
                WHERE object_id = OBJECT_ID('${t}')
            `);
            const cols = r.recordset.map(col => {
                const computed = isComputed.recordset.find(c => c.name === col.COLUMN_NAME)?.is_computed ? ' (COMPUTED)' : '';
                return `${col.COLUMN_NAME} [${col.DATA_TYPE}]${computed}`;
            });
            console.log(cols.join('\n'));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
