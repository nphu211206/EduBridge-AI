const { pool, sql, connectDB } = require('./config/db.js');

connectDB().then(async p => {
    try {
        const res = await p.request()
            .input('username', sql.VarChar, 'testuser_insert')
            .input('email', sql.VarChar, 'test_insert@gmail.com')
            .input('password', sql.VarChar, 'hashpwd')
            .input('fullName', sql.NVarChar, 'T User')
            .input('dateOfBirth', sql.Date, null)
            .input('school', sql.NVarChar, null)
            .query(`
        INSERT INTO Users (
          Username, Email, Password, FullName,
          DateOfBirth, School, Role, Status,
          AccountStatus, Provider, EmailVerified,
          CreatedAt, UpdatedAt
        )
        OUTPUT INSERTED.UserID
        VALUES (
          @username, @email, @password, @fullName,
          @dateOfBirth, @school, 'STUDENT', 'OFFLINE',
          'ACTIVE', 'local', 0,
          GETDATE(), GETDATE()
        )
      `);
        console.dir(res.recordset);
    } catch (e) {
        console.error("INSERT FAILED:", e.message);
    }
    process.exit(0);
});
