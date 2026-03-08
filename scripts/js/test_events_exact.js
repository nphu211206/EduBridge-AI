const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function test() {
    try {
        const pool = await sql.connect(config);
        console.log("Testing exact getAllEvents query...");

        const q = `
            SELECT e.*, u.FullName as CreatorName,
                   (SELECT COUNT(*) FROM EventParticipants WHERE EventID = e.EventID) as ParticipantCount
            FROM Events e
            LEFT JOIN Users u ON e.CreatedBy = u.UserID
            WHERE e.DeletedAt IS NULL
            ORDER BY e.EventDate DESC, e.EventTime DESC
        `;

        try {
            const r = await pool.request().query(q);
            console.log("SUCCESS:", r.recordset.length, "events");
        } catch (e) {
            console.error("FAIL EXACT ERROR:", e.message);
        }
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
test();
