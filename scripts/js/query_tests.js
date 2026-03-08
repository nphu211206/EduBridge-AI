const sql = require('mssql');
const fs = require('fs');
const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function check() {
    const pool = await sql.connect(config);
    let out = '';

    // Test the exact queries from the controllers
    // 1. Exams query (from exam.controller.js getAllExams)
    try {
        await pool.request().query(`
            SELECT e.*, u.FullName as CreatorName,
                   (SELECT COUNT(*) FROM ExamQuestions WHERE ExamID = e.ExamID) as QuestionCount
            FROM Exams e
            LEFT JOIN Users u ON e.CreatedBy = u.UserID
            ORDER BY e.CreatedAt DESC
        `);
        out += 'EXAMS QUERY: OK\n';
    } catch (e) { out += 'EXAMS QUERY ERROR: ' + e.message + '\n'; }

    // 2. Competitions query (need to find the actual query)
    try {
        await pool.request().query(`SELECT * FROM Competitions ORDER BY CreatedAt DESC`);
        out += 'COMPETITIONS QUERY: OK\n';
    } catch (e) { out += 'COMPETITIONS QUERY ERROR: ' + e.message + '\n'; }

    // 3. Check Exams columns
    const exCols = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Exams' 
        ORDER BY ORDINAL_POSITION
    `);
    out += '\n=== EXAMS COLUMNS ===\n';
    for (const r of exCols.recordset) out += `${r.COLUMN_NAME} | ${r.DATA_TYPE} | ${r.IS_NULLABLE}\n`;

    // 4. Check Competitions columns
    const compCols = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Competitions' 
        ORDER BY ORDINAL_POSITION
    `);
    out += '\n=== COMPETITIONS COLUMNS ===\n';
    for (const r of compCols.recordset) out += `${r.COLUMN_NAME} | ${r.DATA_TYPE} | ${r.IS_NULLABLE}\n`;

    fs.writeFileSync('query_tests.txt', out);
    console.log('Done');
    process.exit(0);
}
check();
