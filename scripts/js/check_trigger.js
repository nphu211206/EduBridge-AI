const { poolPromise } = require('./services/teacher-service/config/database');
const fs = require('fs');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT name, is_instead_of_trigger 
            FROM sys.triggers 
            WHERE parent_id = OBJECT_ID('Courses')
        `);
        fs.writeFileSync('trigger_check.json', JSON.stringify(res.recordset, null, 2));
    } catch (e) { console.error(e); }
    process.exit(0);
})();
