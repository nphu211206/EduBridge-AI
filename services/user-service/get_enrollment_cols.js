const { connectDB } = require('./config/db');
(async () => {
    try {
        const pool = await connectDB();
        const r = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='CourseEnrollments'");
        console.log(JSON.stringify(r.recordset.map(x => x.COLUMN_NAME)));
    } catch (e) { }
    process.exit();
})();
