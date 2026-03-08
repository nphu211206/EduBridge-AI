const { poolPromise, sql } = require('./services/teacher-service/config/database');
(async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            SELECT TOP 1
              a.AssignmentID, a.Title, a.Description, a.CourseID, a.TotalPoints, a.DueDate, 
              a.CreatedAt, a.UpdatedAt,
              c.Title as CourseName,
              (SELECT COUNT(*) FROM AssignmentSubmissions WHERE AssignmentID = a.AssignmentID) as SubmissionsCount,
              (SELECT COUNT(*) FROM CourseEnrollments WHERE CourseID = a.CourseID AND Status = 'active') as StudentsCount
            FROM Assignments a
            JOIN Courses c ON a.CourseID = c.CourseID
        `);
        console.log("Teacher Assignments Query OK");
    } catch (e) {
        console.log("Teacher Assignments Query ERROR:", e.message);
    }
    process.exit(0);
})();
