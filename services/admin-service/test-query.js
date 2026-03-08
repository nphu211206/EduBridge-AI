const { poolPromise, sql } = require('./config/database');

async function testQuery() {
    try {
        const pool = await poolPromise;
        console.log("Running Course query...");
        const result = await pool.request()
            .query(`
                SELECT c.*, u.FullName as InstructorName,
                (SELECT COUNT(*) FROM CourseEnrollments WHERE CourseID = c.CourseID) as EnrollmentCount,
                (SELECT COUNT(*) FROM CourseModules WHERE CourseID = c.CourseID) as ModuleCount
                FROM Courses c
                LEFT JOIN Users u ON c.InstructorID = u.UserID
                WHERE c.DeletedAt IS NULL
                ORDER BY c.CreatedAt DESC
            `);

        console.log("Success! Found rows:", result.recordset.length);
    } catch (err) {
        console.error("EXACT SQL ERROR:", err.message);
    } finally {
        process.exit(0);
    }
}

testQuery();
