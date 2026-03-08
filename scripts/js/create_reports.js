const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

const createReportsSql = `
CREATE TABLE [dbo].[Reports] (
    [ReportID]    BIGINT         IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    [Title]       NVARCHAR (255) NOT NULL,
    [Content]     NVARCHAR (MAX) NOT NULL,
    [Category]    VARCHAR (50)   NOT NULL,
    [ReporterID]  BIGINT         NULL,
    [TargetID]    BIGINT         NOT NULL,
    [TargetType]  VARCHAR (50)   NOT NULL,
    [Status]      VARCHAR (20)   DEFAULT ('PENDING') NULL,
    [Notes]       NVARCHAR (500) NULL,
    [CreatedAt]   DATETIME       DEFAULT (getdate()) NULL,
    [UpdatedAt]   DATETIME       DEFAULT (getdate()) NULL,
    [ResolvedAt]  DATETIME       NULL,
    [DeletedAt]   DATETIME       NULL,
    [ActionTaken] VARCHAR (50)   NULL
);
`;

async function patch() {
    try {
        const pool = await sql.connect(config);

        try { await pool.request().query("DROP TABLE Reports"); } catch (e) { }

        console.log("Running clean CREATE TABLE Reports...");
        try {
            await pool.request().query(createReportsSql);
            console.log("-> SUCCESS");
        } catch (e) {
            console.error("-> ERROR:", e.message);
        }

        console.log("\nVerifying Reports query...");
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
            console.log('Reports query OK');
        } catch (e) {
            console.log('Reports query STILL FAILS:', e.message);
        }

        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}

patch();
