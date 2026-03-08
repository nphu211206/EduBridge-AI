const { poolPromise, sql } = require('./config/database');

async function checkMoreQueries() {
    try {
        const pool = await poolPromise;

        console.log("Checking Events query...");
        try {
            await pool.request().query(`SELECT * FROM Events WHERE DeletedAt IS NULL`);
            console.log("Events query SUCCESS");
        } catch (e) {
            console.error("Events error:", e.message);
        }

        console.log("Checking Reports query...");
        try {
            await pool.request().query(`SELECT * FROM Reports`);
            console.log("Reports query SUCCESS");
        } catch (e) {
            console.error("Reports error:", e.message);
        }

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}

checkMoreQueries();
