const { connectDB } = require('./config/db');
(async () => {
    try {
        const pool = await connectDB();
        const r = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='CourseEnrollments'");
        console.log("TABLE:", r.recordset);
        const c = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='CourseEnrollments'");
        console.log("COLUMNS:", c.recordset);
    } catch (e) {
        console.error("SQL ERROR:", e.message);
    }
    process.exit();
})();
