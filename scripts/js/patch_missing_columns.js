const sql = require('mssql');
const fs = require('fs');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function patch() {
    try {
        const pool = await sql.connect(config);

        try { await pool.request().query("DROP TABLE Reports"); } catch (e) { }

        const content = fs.readFileSync('dbo/Reports.sql', 'utf8');
        // Simple manual split because regex might break on line endings
        const statements = content.split('GO').map(s => s.trim()).filter(s => s.length > 0);

        for (const stmt of statements) {
            console.log("Running statement:\n" + stmt.substring(0, 100) + "...");
            try {
                await pool.request().query(stmt);
                console.log("-> SUCCESS\n");
            } catch (e) {
                console.error("-> ERROR:", e.message, "\n");
                throw e; // Crash script to see the exact error
            }
        }

        console.log("Reports created.");
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}

patch();
