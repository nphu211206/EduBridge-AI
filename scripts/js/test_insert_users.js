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
    try {
        const pool = await sql.connect(config);

        try {
            await pool.request().query(`
                INSERT INTO Users (Username, Email, Password, PasswordSalt, FirstName, LastName, Role, AccountStatus, Status) 
                VALUES ('admin2', 'admin2@edubridge.ai', '123456', 'DFSDFDFDS', 'System', 'Admin', 'ADMIN', 'ACTIVE', 'ONLINE')
            `);
            console.log("Insert success");
        } catch (e) {
            fs.writeFileSync('test_err2.txt', e.message);
            console.log("Error written to test_err2.txt");
        }

        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
seed();
