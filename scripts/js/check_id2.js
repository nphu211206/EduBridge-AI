const { poolPromise } = require('./services/teacher-service/config/database');
const fs = require('fs');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT OBJECT_NAME(object_id) as TableName, name, is_identity 
            FROM sys.columns 
            WHERE object_id IN (OBJECT_ID('Courses'), OBJECT_ID('CourseEnrollments'), OBJECT_ID('Events'), OBJECT_ID('Posts'), OBJECT_ID('Jobs'), OBJECT_ID('Lessons'), OBJECT_ID('CourseModules'))
              AND name like '%ID%'
        `);
        fs.writeFileSync('id_check.json', JSON.stringify(res.recordset, null, 2));
    } catch (e) { console.error(e); }
    process.exit(0);
})();
