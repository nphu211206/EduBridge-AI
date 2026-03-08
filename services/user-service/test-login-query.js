const { pool, sql } = require('./config/db');

async function testQuery() {
    try {
        await pool.connect();
        console.log("Connected to DB");

        const result = await pool.request()
            .input('email', sql.VarChar, 'admin@example.com')
            .query(`
                SELECT UserID, Username, Email, Password, FullName, Role, Status, AccountStatus, HasPasskey, TwoFAEnabled
                FROM Users
                WHERE Email = @email
                AND DeletedAt IS NULL
            `);

        console.log("Query success:", result.recordset);
    } catch (err) {
        console.error("SQL Error:");
        console.error(err.message);
    } finally {
        process.exit();
    }
}

testQuery();
