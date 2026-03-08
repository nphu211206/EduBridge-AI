const sql = require('mssql');
const fs = require('fs');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function seed() {
    let errLog = "";
    try {
        const pool = await sql.connect(config);
        const content = fs.readFileSync('Dummy_Data_Seed.sql', 'utf8');
        const statements = content.split(/GO\r?\n|GO\s*$/i).map(s => s.trim()).filter(s => s.length > 0);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                await pool.request().query(stmt);
                console.log(`[SUCCESS] Block ${i + 1}`);
            } catch (e) {
                console.log(`[ERROR] Block ${i + 1}`);
                errLog += `BLOCK ${i + 1} ERROR:\n${e.message}\n${stmt}\n\n`;
            }
        }

    } catch (e) {
        errLog += "Connection failed: " + e.message;
    }

    fs.writeFileSync('seed_err.txt', errLog);
    process.exit(0);
}

seed();
