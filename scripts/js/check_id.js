const { poolPromise } = require('./services/teacher-service/config/database');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT OBJECT_NAME(object_id) as TableName, name, is_identity 
            FROM sys.columns 
            WHERE object_id IN (OBJECT_ID('Courses'), OBJECT_ID('CourseEnrollments'), OBJECT_ID('Categories'), OBJECT_ID('Users'))
              And name like '%ID%'
        `);
        console.log(JSON.stringify(res.recordset, null, 2));
    } catch (e) { console.error(e); }
    process.exit(0);
})();
