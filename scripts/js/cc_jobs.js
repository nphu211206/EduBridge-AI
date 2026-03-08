const { poolPromise } = require('./services/teacher-service/config/database');
const fs = require('fs');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT definition 
            FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('Jobs')
        `);
        fs.writeFileSync('cc_check.json', JSON.stringify(res.recordset, null, 2));
    } catch (e) { console.error(e); }
    process.exit(0);
})();
