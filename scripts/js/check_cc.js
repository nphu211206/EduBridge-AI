const { poolPromise } = require('./services/teacher-service/config/database');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT definition 
            FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('Jobs')
        `);
        console.dir(res.recordset, { depth: null });
    } catch (e) { console.error(e); }
    process.exit(0);
})();
