const sql = require('mssql');
const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function fix() {
    const pool = await sql.connect(config);

    // 1. Add DeletedAt to Competitions if missing
    try {
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Competitions' AND COLUMN_NAME='DeletedAt')
            ALTER TABLE Competitions ADD DeletedAt datetime2 NULL
        `);
        console.log("Competitions.DeletedAt: added/already exists");
    } catch (e) { console.log("DeletedAt error:", e.message); }

    // 2. Add UpdatedAt to Competitions if missing
    try {
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Competitions' AND COLUMN_NAME='UpdatedAt')
            ALTER TABLE Competitions ADD UpdatedAt datetime2 NULL DEFAULT GETDATE()
        `);
        console.log("Competitions.UpdatedAt: added/already exists");
    } catch (e) { console.log("UpdatedAt error:", e.message); }

    // 3. Check if CompetitionParticipants table exists (controller references it)
    const cpCheck = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CompetitionParticipants'
    `);
    if (cpCheck.recordset.length === 0) {
        // Check CompetitionRegistrations exists (might be the actual table)
        const crCheck = await pool.request().query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CompetitionRegistrations'
        `);
        if (crCheck.recordset.length > 0) {
            // Create view as alias
            try {
                await pool.request().query(`
                    IF NOT EXISTS (SELECT 1 FROM sys.views WHERE name = 'CompetitionParticipants')
                    EXEC('CREATE VIEW CompetitionParticipants AS SELECT *, UserID as UserID FROM CompetitionRegistrations')
                `);
                console.log("Created CompetitionParticipants view from CompetitionRegistrations");
            } catch (e) { console.log("View error:", e.message); }
        }
    } else {
        console.log("CompetitionParticipants table exists");
    }

    // 4. Check ExamParticipants table
    const epCheck = await pool.request().query(`
        SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ExamParticipants'
    `);
    if (epCheck.recordset.length === 0) {
        console.log("ExamParticipants: MISSING - checking ExamSessions");
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ExamParticipants')
                CREATE TABLE ExamParticipants (
                    ParticipantID int IDENTITY(1,1) PRIMARY KEY,
                    ExamID int NOT NULL,
                    UserID int NOT NULL,
                    Score decimal(10,2) NULL,
                    Status nvarchar(20) DEFAULT 'pending',
                    StartedAt datetime2 NULL,
                    SubmittedAt datetime2 NULL,
                    ReviewedBy int NULL,
                    ReviewedAt datetime2 NULL,
                    CreatedAt datetime2 DEFAULT GETDATE()
                )
            `);
            console.log("ExamParticipants: created");
        } catch (e) { console.log("ExamParticipants create error:", e.message); }
    } else {
        console.log("ExamParticipants: exists");
    }

    // 5. Test both queries now
    try {
        const r1 = await pool.request().query(`
            SELECT e.*, u.FullName as CreatorName,
                   (SELECT COUNT(*) FROM ExamQuestions WHERE ExamID = e.ExamID) as QuestionCount
            FROM Exams e
            LEFT JOIN Users u ON e.CreatorID = u.UserID
            ORDER BY e.CreatedAt DESC
        `);
        console.log(`EXAMS QUERY: OK (${r1.recordset.length} rows)`);
    } catch (e) { console.log("EXAMS QUERY STILL FAILS:", e.message); }

    try {
        const r2 = await pool.request().query(`
            SELECT * FROM Competitions WHERE DeletedAt IS NULL ORDER BY CreatedAt DESC
        `);
        console.log(`COMPETITIONS QUERY: OK (${r2.recordset.length} rows)`);
    } catch (e) { console.log("COMPETITIONS QUERY STILL FAILS:", e.message); }

    process.exit(0);
}
fix();
