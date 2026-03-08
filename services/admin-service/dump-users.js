const { poolPromise, sql } = require('./config/database');
const fs = require('fs');

async function getUsers() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`SELECT UserID, Username, Email, Role, AccountStatus, Status FROM Users;`);

        fs.writeFileSync('all-users.json', JSON.stringify(result.recordset, null, 2), 'utf8');
        console.log("Saved all-users.json");
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}

getUsers();
