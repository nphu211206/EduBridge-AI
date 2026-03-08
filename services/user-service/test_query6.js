const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });

        try {
            const r2 = await pool.request()
                .input('courseId', sql.BigInt, 1)
                .query(`
                    SELECT ModuleID, CourseID, Title, Description, 
                           SortOrder, Duration,
                           CreatedAt, UpdatedAt
                    FROM CourseModules
                    WHERE CourseID = @courseId
                    ORDER BY SortOrder
                `);
            console.log("SUCCESS MODULES:", r2.recordset.length);
        } catch (e) { console.error("ERROR 2:", e.message); }

        try {
            const r3 = await pool.request()
                .input('courseId', sql.BigInt, 1)
                .query(`
                    SELECT l.LessonID, l.ModuleID, l.Title, l.Description, 
                           l.Type, l.Content, l.VideoUrl, 
                           l.VideoDuration as Duration, l.SortOrder, l.IsPreview,
                           l.CreatedAt, l.UpdatedAt
                    FROM Lessons l
                    JOIN CourseModules m ON l.ModuleID = m.ModuleID
                    WHERE m.CourseID = @courseId
                    ORDER BY m.SortOrder, l.SortOrder
                `);
            console.log("SUCCESS LESSONS:", r3.recordset.length);
        } catch (e) { console.error("ERROR 3:", e.message); }

    } catch (e) {
        console.error("CONN ERROR:", e.message);
    }
    process.exit();
})();
