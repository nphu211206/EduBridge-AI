const { poolPromise, sql } = require('./config/database');

async function fixDbSchema() {
    try {
        const pool = await poolPromise;

        console.log("Fixing Courses table...");
        try {
            await pool.request().query(`
                IF COL_LENGTH('Courses', 'DeletedAt') IS NULL
                BEGIN
                    ALTER TABLE Courses ADD DeletedAt DATETIME NULL;
                END
            `);
            console.log("Added DeletedAt to Courses.");
        } catch (e) {
            console.error("Courses fix error:", e.message);
        }

        console.log("Fixing Events table...");
        try {
            await pool.request().query(`
                IF COL_LENGTH('Events', 'DeletedAt') IS NULL
                BEGIN
                    ALTER TABLE Events ADD DeletedAt DATETIME NULL;
                END
            `);
            console.log("Added DeletedAt to Events.");
        } catch (e) {
            console.error("Events fix error:", e.message);
        }

        console.log("Creating Reports table...");
        try {
            await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reports' and xtype='U')
                BEGIN
                    CREATE TABLE Reports (
                        ReportID BIGINT IDENTITY(1,1) PRIMARY KEY,
                        ReporterID BIGINT NOT NULL,
                        ReportedType VARCHAR(50) NOT NULL, -- e.g. 'COURSE', 'USER', 'COMMENT'
                        ReportedEntityID BIGINT NOT NULL,
                        Category VARCHAR(50) NOT NULL,
                        Reason NVARCHAR(MAX) NOT NULL,
                        Status VARCHAR(20) DEFAULT 'PENDING',
                        AdminNotes NVARCHAR(MAX),
                        CreatedAt DATETIME DEFAULT GETDATE(),
                        UpdatedAt DATETIME,
                        ResolvedAt DATETIME,
                        ResolvedByID BIGINT
                    );
                END
            `);
            console.log("Created Reports table.");
        } catch (e) {
            console.error("Reports creation error:", e.message);
        }

    } catch (err) {
        console.error("DB Error:", err);
    } finally {
        process.exit(0);
    }
}

fixDbSchema();
