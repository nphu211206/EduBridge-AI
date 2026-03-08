const { poolPromise, sql } = require('./config/database');

async function checkTables() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`);

        const tables = result.recordset.map(r => r.TABLE_NAME);
        console.log("Has Courses:", tables.includes('Courses'));
        console.log("Has Events:", tables.includes('Events'));
        console.log("Has Reports:", tables.includes('Reports'));
    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}

checkTables();
