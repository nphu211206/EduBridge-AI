const { poolPromise } = require('./services/teacher-service/config/database');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`SELECT name, is_identity FROM sys.columns WHERE object_id = OBJECT_ID('Courses') OR object_id = OBJECT_ID('CourseEnrollments')`);
        console.table(res.recordset);
    } catch (e) { console.error(e); }
    process.exit(0);
})();
