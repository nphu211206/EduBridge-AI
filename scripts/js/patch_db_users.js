const sql = require('mssql');
const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function patchDB() {
    try {
        const pool = await sql.connect(config);

        // Get current Users columns
        const cols = await pool.request().query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Users'"
        );
        const existingCols = cols.recordset.map(c => c.COLUMN_NAME);
        console.log('Current Users columns:', existingCols.join(', '));

        // Columns to add if missing (from dbo/Users.sql DDL)
        const columnsToAdd = [
            { name: 'School', type: 'NVARCHAR(255)', defaultVal: 'NULL' },
            { name: 'Bio', type: 'NVARCHAR(500)', defaultVal: 'NULL' },
            { name: 'LockDuration', type: 'INT', defaultVal: 'NULL' },
            { name: 'LockReason', type: 'NVARCHAR(255)', defaultVal: 'NULL' },
            { name: 'LockedUntil', type: 'DATETIME', defaultVal: 'NULL' },
            { name: 'Avatar', type: 'NVARCHAR(255)', defaultVal: 'NULL' },
            { name: 'TwoFASecret', type: 'VARCHAR(255)', defaultVal: 'NULL' },
            { name: 'TwoFAEnabled', type: 'BIT', defaultVal: '0' },
            { name: 'HasPasskey', type: 'BIT', defaultVal: '0' },
            { name: 'RequireTwoFA', type: 'BIT', defaultVal: '0' },
        ];

        for (const col of columnsToAdd) {
            if (!existingCols.includes(col.name)) {
                try {
                    const alterQuery = `ALTER TABLE Users ADD [${col.name}] ${col.type} ${col.defaultVal === 'NULL' ? 'NULL' : 'DEFAULT ' + col.defaultVal}`;
                    await pool.request().query(alterQuery);
                    console.log(`  ADDED column: ${col.name} (${col.type})`);
                } catch (e) {
                    console.log(`  SKIP ${col.name}: ${e.message}`);
                }
            } else {
                console.log(`  OK: ${col.name} already exists`);
            }
        }

        // Now verify by running the exact query that was failing
        console.log('\n=== Testing getAllUsers Query After Patch ===');
        try {
            const result = await pool.request().query(`
                SELECT UserID, Username, Email, FullName,
                       Role, Status, AccountStatus, School, Bio,
                       CreatedAt, LastLoginAt
                FROM Users
                WHERE DeletedAt IS NULL
                ORDER BY CreatedAt DESC
            `);
            console.log('SUCCESS! Found', result.recordset.length, 'users');
        } catch (e) {
            console.log('STILL FAILING:', e.message);
        }

        // Also check Courses, Events, Reports tables for any similar issues
        const tables = ['Courses', 'Events', 'Reports', 'Exams', 'CourseEnrollments', 'EventParticipants', 'ExamParticipants', 'CourseModules', 'CourseLessons'];
        console.log('\n=== Table Existence Check ===');
        for (const table of tables) {
            try {
                const r = await pool.request().query(`SELECT COUNT(*) as cnt FROM [${table}]`);
                console.log(`  ${table}: EXISTS (${r.recordset[0].cnt} rows)`);
            } catch (e) {
                console.log(`  ${table}: MISSING or ERROR - ${e.message}`);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}
patchDB();
