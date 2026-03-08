const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function patch() {
    try {
        const pool = await sql.connect(config);

        const alterQueries = [
            "ALTER TABLE Events ADD EventDate DATE NULL",
            "ALTER TABLE Events ADD EventTime TIME(7) NULL",
            "ALTER TABLE Events ADD CreatedBy BIGINT NULL",
            "ALTER TABLE Events ADD DeletedAt DATETIME NULL"
        ];

        for (const q of alterQueries) {
            try {
                await pool.request().query(q);
                console.log("SUCCESS:", q);
            } catch (e) {
                console.log("SKIPPED / ERROR:", q, "->", e.message);
            }
        }

        console.log("Patch complete. Testing exact getAllEvents query...");
        const selectQ = `
            SELECT e.*, u.FullName as CreatorName,
                   (SELECT COUNT(*) FROM EventParticipants WHERE EventID = e.EventID) as ParticipantCount
            FROM Events e
            LEFT JOIN Users u ON e.CreatedBy = u.UserID
            WHERE e.DeletedAt IS NULL
            ORDER BY e.EventDate DESC, e.EventTime DESC
        `;

        try {
            const r = await pool.request().query(selectQ);
            console.log("SUCCESS:", r.recordset.length, "events");
        } catch (e) {
            console.error("FAIL EXACT ERROR:", e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error('Fatal:', e.message);
        process.exit(1);
    }
}

patch();
