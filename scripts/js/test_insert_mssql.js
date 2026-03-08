const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        instanceName: 'SQLEXPRESS01'
    }
};

async function insertUser() {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const pwdHash = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0.jW2Z.6E3Kjg1u9A6W';

        console.log('Inserting user...');
        await request.query(`
            INSERT INTO [dbo].[Users] ([Username], [Email], [Password], [PasswordSalt], [FirstName], [LastName], [Role], [City], [AccountStatus], [ReferralCode], [IsEmailVerified], [IsPhoneVerified], [IsActive], [IsBanned], [OnlineStatus], [TotalPoints], [Level], [EduCoinsBalance]) 
            VALUES ('student_nam', 'nam@gmail.com', '${pwdHash}', 'somesalt', N'Hải', N'Nam', 'STUDENT', N'Hồ Chí Minh', 'ACTIVE', 'REF_NAM', 1, 0, 1, 0, 'Offline', 0, 1, 0);
        `);
        console.log('Success User');
    } catch (err) {
        console.error('SQL ERROR:', err.message);
    } finally {
        process.exit();
    }
}
insertUser();
