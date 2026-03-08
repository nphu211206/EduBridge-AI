const { connectDB, pool, sql } = require('./services/user-service/config/db');
const bcrypt = require('bcryptjs');

async function create() {
    await connectDB();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123', salt);

    // Check if user exists
    let res = await pool.request().query("SELECT * FROM Users WHERE Username='student_nam'");
    if (res.recordset.length > 0) {
        console.log("ALREADY EXISTS:", res.recordset[0].Email);
        process.exit();
    }

    await pool.request()
        .input('Username', sql.VarChar, 'student_nam')
        .input('Email', sql.VarChar, 'nam.nguyen@example.com')
        .input('PasswordHash', sql.VarChar, passwordHash)
        .input('PasswordSalt', sql.VarChar, salt)
        .input('Role', sql.VarChar, 'STUDENT')
        .input('Status', sql.VarChar, 'active')
        .query(`
            INSERT INTO Users (Username, Email, Password, PasswordSalt, Role, Status)
            VALUES (@Username, @Email, @PasswordHash, @PasswordSalt, @Role, @Status)
        `);
    console.log("SUCCESS CREATED nam.nguyen@example.com / Admin@123");
    process.exit();
}

create().catch(console.error);
