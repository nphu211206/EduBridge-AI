const { poolPromise, sql } = require('./config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');

async function seedTestUsers() {
    try {
        const pool = await poolPromise;
        const hash = await bcrypt.hash('123456', 10);

        await pool.request().query(`
            DELETE FROM Users WHERE Email IN ('admin@edubridge.edu.vn', 'teacher@edubridge.edu.vn', 'nam@gmail.com');
            
            INSERT INTO Users ([Username], [Email], [Password], [PasswordSalt], [FirstName], [LastName], [Role], [AccountStatus], [Status], [IsEmailVerified], [IsPhoneVerified], [IsActive], [IsBanned], [PhoneNumber], [ReferralCode])
            VALUES ('admin', 'admin@edubridge.edu.vn', '${hash}', 'salt', 'System', 'Admin', 'ADMIN', 'ACTIVE', 'OFFLINE', 1, 0, 1, 0, '0999999999', 'REF_ADMINX');
            
            INSERT INTO Users ([Username], [Email], [Password], [PasswordSalt], [FirstName], [LastName], [Role], [AccountStatus], [Status], [IsEmailVerified], [IsPhoneVerified], [IsActive], [IsBanned], [PhoneNumber], [ReferralCode])
            VALUES ('teacher_hoang', 'teacher@edubridge.edu.vn', '${hash}', 'salt', 'Hoang', 'Teacher', 'TEACHER', 'ACTIVE', 'OFFLINE', 1, 0, 1, 0, '0888888888', 'REF_TEACHERX');
        `);

        console.log("SUCCESS!");
    } catch (err) {
        fs.writeFileSync('error.txt', err.message);
        console.log("Error written to error.txt");
    } finally {
        process.exit(0);
    }
}

seedTestUsers();
