const sql = require('mssql');
const fs = require('fs');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function runStatements(pool, content) {
    // Split by GO and run each statement
    const statements = content.split(/GO\r?\n|GO\s*$/i)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const stmt of statements) {
        try {
            await pool.request().query(stmt);
            // Print the first line of the query to show what ran
            console.log('SUCCESS:', stmt.split('\n')[0].substring(0, 100));
        } catch (e) {
            console.log('ERROR on:', stmt.split('\n')[0].substring(0, 100));
            console.log('  ->', e.message);
        }
    }
}

async function run() {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to DB');

        // Run extracted tables
        const missingContent = fs.readFileSync('missing_tables.sql', 'utf8');
        console.log('\n--- Running missing_tables.sql ---');
        await runStatements(pool, missingContent);

        // Run Reports.sql
        const reportsContent = fs.readFileSync('dbo/Reports.sql', 'utf8');
        console.log('\n--- Running dbo/Reports.sql ---');
        await runStatements(pool, reportsContent);

        console.log('\nPatch complete!');
        process.exit(0);
    } catch (e) {
        console.error('Connection error:', e.message);
        process.exit(1);
    }
}

run();
