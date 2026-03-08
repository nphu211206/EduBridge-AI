const { poolPromise, sql } = require('./services/teacher-service/config/database');
(async () => {
    try {
        const pool = await poolPromise;
        const res = await pool.request()
            .input('TeacherID', sql.Int, 1)
            .input('CategoryID', sql.Int, 1)
            .input('Title', sql.NVarChar(255), 'Test Course')
            .input('Slug', sql.VarChar(255), 'test-course-slug')
            .input('Description', sql.NVarChar(sql.MAX), 'desc')
            .input('ThumbnailUrl', sql.VarChar(255), 'url')
            .input('Price', sql.Decimal(18, 2), 10)
            .input('Status', sql.VarChar(20), 'published')
            .input('InstructorID', sql.Int, 1)
            .query(`
                INSERT INTO Courses (TeacherID, CategoryID, Title, Slug, Description, ThumbnailUrl, Price, Status, InstructorID, CreatedAt)
                OUTPUT INSERTED.CourseID
                VALUES (@TeacherID, @CategoryID, @Title, @Slug, @Description, @ThumbnailUrl, @Price, @Status, @InstructorID, GETDATE())
            `);
        console.log("SUCCESS:", res.recordset);
    } catch (err) {
        console.error("ERROR:");
        console.error(err.message);
    }
    process.exit(0);
})();
