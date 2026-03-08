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

        // Check Users table columns
        const cols = await pool.request().query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Users' ORDER BY ORDINAL_POSITION"
        );
        console.log('=== Users Table Columns ===');
        console.log(cols.recordset.map(c => c.COLUMN_NAME).join(', '));

        // Check if specific columns exist
        const checkCols = ['Bio', 'School', 'Status', 'AccountStatus', 'LockDuration', 'LockReason', 'LockedUntil', 'DeletedAt'];
        for (const col of checkCols) {
            const exists = cols.recordset.some(c => c.COLUMN_NAME === col);
            console.log(`  ${col}: ${exists ? 'EXISTS' : 'MISSING !!!'}`);
        }

        // Check Reports table columns
        const reportCols = await pool.request().query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Reports' ORDER BY ORDINAL_POSITION"
        );
        console.log('\n=== Reports Table Columns ===');
        console.log(reportCols.recordset.map(c => c.COLUMN_NAME).join(', '));

        // Check Events table columns
        const eventCols = await pool.request().query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Events' ORDER BY ORDINAL_POSITION"
        );
        console.log('\n=== Events Table Columns ===');
        console.log(eventCols.recordset.map(c => c.COLUMN_NAME).join(', '));

        // Check Courses table
        const courseCols = await pool.request().query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Courses' ORDER BY ORDINAL_POSITION"
        );
        console.log('\n=== Courses Table Columns ===');
        console.log(courseCols.recordset.map(c => c.COLUMN_NAME).join(', '));

        // Try the exact getAllUsers query
        console.log('\n=== Testing getAllUsers Query ===');
        try {
            const result = await pool.request().query(`
                SELECT UserID, Username, Email, FullName,
                       Role, Status, AccountStatus, School, Bio,
                       CreatedAt, LastLoginAt
                FROM Users
                WHERE DeletedAt IS NULL
                ORDER BY CreatedAt DESC
            `);
            console.log('OK - Found', result.recordset.length, 'users');
        } catch (e) {
            console.log('FAILED:', e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error('Connection error:', e.message);
        process.exit(1);
    }
}
check();
