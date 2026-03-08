const { poolPromise, sql } = require('./config/database');

async function checkUser() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar(50), 'admin@edubridge.edu.vn')
            .query(`SELECT UserID, Username, Email, Role, Status, AccountStatus, DeletedAt FROM Users WHERE Email = @email`);

        console.log("DB EXACT ROW:", result.recordset);
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}

checkUser();
