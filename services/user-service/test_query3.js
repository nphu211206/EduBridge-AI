const { connectDB } = require('./config/db');
const sql = require('mssql');

(async () => {
    try {
        const pool = await connectDB();
        const r = await pool.request()
            .input('userId', sql.BigInt, 4)
            .query(`
                SELECT 
                  e.EnrollmentID, e.CourseID, e.Status as EnrollmentStatus, e.Progress, e.EnrolledAt, e.LastAccessedAt,
                  c.Title, c.ShortDescription, c.Slug, c.ThumbnailUrl as Thumbnail, c.Level, c.DurationMinutes as Duration, c.OriginalPrice as Price, c.Price as DiscountPrice
                FROM CourseEnrollments e
                INNER JOIN Courses c ON e.CourseID = c.CourseID
                WHERE e.UserID = @userId AND e.Status = 'active' AND c.Status = 'published'
            `);
        console.log("SUCCESS");
    } catch (e) {
        console.error("ERROR:", e.message);
    }
    process.exit();
})();
