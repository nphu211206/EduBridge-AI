const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connected via Sequelize.');

        const hash = await bcrypt.hash('password123', 10);

        // Overwrite or create Admin
        await sequelize.query(`
            DELETE FROM Users WHERE Email IN ('admin_test@edubridge.edu.vn', 'teacher_test@edubridge.edu.vn');
            
            INSERT INTO Users (Username, Email, Password, FullName, Role, AccountStatus, Status)
            VALUES ('admin_test', 'admin_test@edubridge.edu.vn', '${hash}', 'Test Admin', 'ADMIN', 'ACTIVE', 'OFFLINE');
            
            INSERT INTO Users (Username, Email, Password, FullName, Role, AccountStatus, Status)
            VALUES ('teacher_test', 'teacher_test@edubridge.edu.vn', '${hash}', 'Test Teacher', 'TEACHER', 'ACTIVE', 'OFFLINE');
        `);

        console.log("SUCCESS! Created admin_test@edubridge.edu.vn and teacher_test@edubridge.edu.vn with password 'password123'");

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}

checkUsers();
