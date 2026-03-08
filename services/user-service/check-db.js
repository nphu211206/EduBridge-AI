const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connected via Sequelize.');

        const [results] = await sequelize.query(`
            SELECT UserID, Username, Email, Role, AccountStatus 
            FROM Users 
            WHERE Role IN ('ADMIN', 'TEACHER')
        `);
        console.log("Found Users:", results);

        if (results.length === 0) {
            console.log("No ADMIN or TEACHER users found! Creating defaults...");
            const hash = await bcrypt.hash('password123', 10);

            // Create Admin
            await sequelize.query(`
                INSERT INTO Users (Username, Email, Password, FullName, Role, AccountStatus, Status)
                VALUES ('admin', 'admin@edubridge.edu.vn', '${hash}', 'System Admin', 'ADMIN', 'ACTIVE', 'OFFLINE')
            `);

            // Create Teacher
            await sequelize.query(`
                INSERT INTO Users (Username, Email, Password, FullName, Role, AccountStatus, Status)
                VALUES ('teacher', 'teacher@edubridge.edu.vn', '${hash}', 'Sample Teacher', 'TEACHER', 'ACTIVE', 'OFFLINE')
            `);

            console.log("Created admin@edubridge.edu.vn and teacher@edubridge.edu.vn with password 'password123'");
        }
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}

checkUsers();
