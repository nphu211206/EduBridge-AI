const { poolPromise, sql } = require('./services/teacher-service/config/database');
const fs = require('fs');
(async () => {
    try {
        const pool = await poolPromise;
        const tables = ['Courses', 'Events', 'Posts', 'Notifications', 'Users', 'CourseEnrollments'];
        const result = {};
        for (const t of tables) {
            const req = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t}'`);
            result[t] = req.recordset.map(r => r.COLUMN_NAME);
        }
        fs.writeFileSync('schema-dump.json', JSON.stringify(result, null, 2));
        console.log("Schema dumped to schema-dump.json");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
