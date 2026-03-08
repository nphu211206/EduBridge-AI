const bcrypt = require('bcryptjs');
const sql = require('mssql');

async function resetAdminPassword() {
    const config = {
        user: 'sa',
        password: '123456',
        server: 'localhost',
        database: 'EduBridgeAI_Enterprise',
        options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
    };

    try {
        await sql.connect(config);

        // Check current admin user
        const adminResult = await sql.query`SELECT UserID, Username, Email, Role, AccountStatus FROM Users WHERE Role = 'ADMIN'`;
        console.log('Admin users found:', adminResult.recordset.length);
        adminResult.recordset.forEach(u => {
            console.log(`  - ID: ${u.UserID}, Username: ${u.Username}, Email: ${u.Email}, Status: ${u.AccountStatus}`);
        });

        // Hash the new password
        const newPassword = 'Admin@123';
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(newPassword, salt);
        console.log('\nNew hash for Admin@123:', hash);

        // Update ALL admin users' passwords
        const result = await sql.query`UPDATE Users SET Password = ${hash} WHERE Role = 'ADMIN'`;
        console.log('Rows affected:', result.rowsAffected[0]);

        // Verify the hash works  
        const isMatch = await bcrypt.compare(newPassword, hash);
        console.log('Verification - Password matches hash:', isMatch);

        console.log('\nAdmin password reset to: Admin@123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();
