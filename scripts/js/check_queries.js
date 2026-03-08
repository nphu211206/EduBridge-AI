const sql = require('mssql');
const fs = require('fs');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

let logOutput = "";
function log(msg) {
    console.log(msg);
    logOutput += msg + "\n";
}

async function check() {
    try {
        const pool = await sql.connect(config);

        log('=== 1. Courses ===');
        try {
            const r = await pool.request().query(`
                SELECT c.*, u.FullName as InstructorName,
                (SELECT COUNT(*) FROM CourseEnrollments WHERE CourseID = c.CourseID) as EnrollmentCount,
                (SELECT COUNT(*) FROM CourseModules WHERE CourseID = c.CourseID) as ModuleCount
                FROM Courses c
                LEFT JOIN Users u ON c.InstructorID = u.UserID
                WHERE c.DeletedAt IS NULL
                ORDER BY c.CreatedAt DESC
            `);
            log('OK: ' + r.recordset.length + ' courses');
        } catch (e) {
            log('FAIL: ' + e.message);
        }

        log('\n=== 2. Events ===');
        try {
            const r = await pool.request().query(`
                SELECT * FROM Events WHERE DeletedAt IS NULL ORDER BY CreatedAt DESC
            `);
            log('OK: ' + r.recordset.length + ' events');
        } catch (e) {
            log('FAIL: ' + e.message);
        }

        log('\n=== 3. Reports ===');
        try {
            const r = await pool.request().query(`
                SELECT r.ReportID as id, r.Title as title, r.Content as content,
                    r.Category as category, r.ReporterID as reporterId,
                    u.Username as reporterName, r.TargetID as targetId,
                    r.TargetType as targetType, r.Status as status,
                    r.Notes as notes, r.CreatedAt as createdAt,
                    r.UpdatedAt as updatedAt, r.ResolvedAt as resolvedAt,
                    r.ActionTaken as actionTaken
                FROM Reports r
                LEFT JOIN Users u ON r.ReporterID = u.UserID
                WHERE r.DeletedAt IS NULL
                ORDER BY r.CreatedAt DESC
            `);
            log('OK: ' + r.recordset.length + ' reports');
        } catch (e) {
            log('FAIL: ' + e.message);
        }

        fs.writeFileSync('query_errors.log', logOutput, 'utf8');
        process.exit(0);
    } catch (e) {
        log('Connection error: ' + e.message);
        fs.writeFileSync('query_errors.log', logOutput, 'utf8');
        process.exit(1);
    }
}
check();
