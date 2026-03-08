const bcrypt = require('bcryptjs');

async function test() {
    const password = '123456';
    const hash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0.jW2Z.6E3Kjg1u9A6W';

    const isValid = await bcrypt.compare(password, hash);
    console.log('Is valid hash?', isValid);

    if (!isValid) {
        const newHash = await bcrypt.hash(password, 12);
        console.log('New hash for 123456:', newHash);

        // Update DB
        const sql = require('mssql');
        const config = {
            user: 'sa',
            password: '123456',
            server: 'localhost',
            database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
        };
        await sql.connect(config);
        await sql.query(`UPDATE Users SET Password = '${newHash}' WHERE Email = 'nam@gmail.com'`);
        console.log('Password updated in DB!');
        process.exit(0);
    }
}
test();
