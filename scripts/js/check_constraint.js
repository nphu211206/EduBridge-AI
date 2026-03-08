const { poolPromise, sql } = require('./services/teacher-service/config/database');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT CONSTRAINT_NAME, COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME='Users' AND CONSTRAINT_NAME LIKE 'UQ%'
        `);
        console.log(JSON.stringify(res.recordset, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
