const sql = require('mssql');
const fs = require('fs');
const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function diagnose() {
    const pool = await sql.connect(config);
    let out = '';

    // 1. All columns with nullable info
    const cols = await pool.request().query(`
        SELECT c.COLUMN_NAME, c.IS_NULLABLE, c.DATA_TYPE, c.CHARACTER_MAXIMUM_LENGTH,
               sc.is_computed, sc.is_identity
        FROM INFORMATION_SCHEMA.COLUMNS c
        JOIN sys.columns sc ON sc.name = c.COLUMN_NAME AND sc.object_id = OBJECT_ID('Users')
        WHERE c.TABLE_NAME = 'Users'
        ORDER BY c.ORDINAL_POSITION
    `);
    out += '=== USERS COLUMNS ===\n';
    for (const r of cols.recordset) {
        out += `${r.COLUMN_NAME} | ${r.DATA_TYPE}(${r.CHARACTER_MAXIMUM_LENGTH || ''}) | nullable=${r.IS_NULLABLE} | computed=${r.is_computed} | identity=${r.is_identity}\n`;
    }

    // 2. Unique constraints
    const uqs = await pool.request().query(`
        SELECT kcu.CONSTRAINT_NAME, kcu.COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc 
            ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
        WHERE tc.TABLE_NAME = 'Users' AND tc.CONSTRAINT_TYPE IN ('UNIQUE', 'PRIMARY KEY')
    `);
    out += '\n=== UNIQUE/PK CONSTRAINTS ===\n';
    for (const r of uqs.recordset) {
        out += `${r.CONSTRAINT_NAME} -> ${r.COLUMN_NAME}\n`;
    }

    // 3. Current user count
    const cnt = await pool.request().query('SELECT COUNT(*) as c FROM Users');
    out += `\n=== CURRENT USER COUNT: ${cnt.recordset[0].c} ===\n`;

    // 4. Events columns
    const evCols = await pool.request().query(`
        SELECT c.COLUMN_NAME, c.IS_NULLABLE, c.DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS c
        WHERE c.TABLE_NAME = 'Events'
        ORDER BY c.ORDINAL_POSITION
    `);
    out += '\n=== EVENTS COLUMNS ===\n';
    for (const r of evCols.recordset) {
        out += `${r.COLUMN_NAME} | ${r.DATA_TYPE} | nullable=${r.IS_NULLABLE}\n`;
    }

    // 5. Courses columns
    const crCols = await pool.request().query(`
        SELECT c.COLUMN_NAME, c.IS_NULLABLE, c.DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS c
        WHERE c.TABLE_NAME = 'Courses'
        ORDER BY c.ORDINAL_POSITION
    `);
    out += '\n=== COURSES COLUMNS ===\n';
    for (const r of crCols.recordset) {
        out += `${r.COLUMN_NAME} | ${r.DATA_TYPE} | nullable=${r.IS_NULLABLE}\n`;
    }

    fs.writeFileSync('schema_dump.txt', out);
    console.log('Schema dump saved to schema_dump.txt');
    process.exit(0);
}
diagnose();
