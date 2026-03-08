const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const r = await pool.request()
            .input('courseId', sql.BigInt, 1)
            .query(`
                SELECT c.*, u.FullName as InstructorName, u.FullName as InstructorTitle, u.Bio as InstructorBio, u.Avatar as InstructorAvatar
                FROM Courses c
                LEFT JOIN Users u ON c.InstructorID = u.UserID
                WHERE c.CourseID = @courseId AND c.Status = 'published' AND c.DeletedAt IS NULL
            `);
        console.log("SUCCESS:", r.recordset.length);
    } catch (e) {
        console.error("ERROR 1:", e.message);
    }

    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const r2 = await pool.request()
            .input('courseId', sql.BigInt, 1)
            .query(`
                SELECT ModuleID, CourseID, Title, Description, 
                       OrderIndex, Duration,
                       CreatedAt, UpdatedAt
                FROM CourseModules
                WHERE CourseID = @courseId
                ORDER BY OrderIndex
            `);
        console.log("SUCCESS MODULES:", r2.recordset.length);
    } catch (e) { console.error("ERROR 2:", e.message); }

    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const r3 = await pool.request()
            .input('courseId', sql.BigInt, 1)
            .query(`
                SELECT l.LessonID, l.ModuleID, l.Title, l.Description, 
                       l.Type, l.Content, l.VideoUrl, 
                       l.Duration, l.OrderIndex, l.IsPreview,
                       l.CreatedAt, l.UpdatedAt
                FROM CourseLessons l
                JOIN CourseModules m ON l.ModuleID = m.ModuleID
                WHERE m.CourseID = @courseId
                ORDER BY m.OrderIndex, l.OrderIndex
            `);
        console.log("SUCCESS LESSONS:", r3.recordset.length);
    } catch (e) { console.error("ERROR 3:", e.message); }

    process.exit();
})();
