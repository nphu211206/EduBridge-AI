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

    // Fix Courses status casing (Published not published)
    try {
        await pool.request().query("UPDATE Courses SET Status = 'Published' WHERE LOWER(Status) = 'published'");
        await pool.request().query("UPDATE Courses SET Status = 'Draft' WHERE LOWER(Status) = 'draft'");
        console.log("Courses status fixed.");
    } catch (e) { console.log("Courses fix:", e.message); }

    // Insert Events with correct CHECK values
    const adminRes = await pool.request().query("SELECT TOP 1 UserID FROM Users WHERE Role = 'ADMIN'");
    const adminID = adminRes.recordset[0].UserID;

    try {
        await pool.request().query(`
            INSERT INTO Events (OrganizerID, Title, Slug, Description, Category, LocationType, StartAt, EndAt, IsPublic, RequiresTicket, CreatedAt, EventDate, EventTime)
            VALUES 
            (${adminID}, N'Tech Meetup Ha Noi 2026', 'tech-meetup-2026', N'Gap go cong dong lap trinh Ha Noi', N'Meetup', N'Online', '2026-04-01 10:00:00', '2026-04-01 17:00:00', 1, 0, GETDATE(), '2026-04-01', '10:00:00'),
            (${adminID}, N'AI Hackathon Vietnam', 'ai-hackathon-vn', N'Cuoc thi lap trinh AI lon nhat Viet Nam', N'Hackathon', N'Offline', '2026-05-15 09:00:00', '2026-05-17 18:00:00', 1, 1, GETDATE(), '2026-05-15', '09:00:00'),
            (${adminID}, N'Workshop Web Security', 'web-security-ws', N'Hoi thao bao mat ung dung web', N'Workshop', N'Online', '2026-06-01 14:00:00', '2026-06-01 17:00:00', 1, 0, GETDATE(), '2026-06-01', '14:00:00')
        `);
        console.log("Events seeded OK!");
    } catch (e) { console.log("Events error:", e.message); }

    // Final counts
    const cnt = await pool.request().query(`
        SELECT 
            (SELECT COUNT(*) FROM Users) as users,
            (SELECT COUNT(*) FROM Courses) as courses,
            (SELECT COUNT(*) FROM Events) as events,
            (SELECT COUNT(*) FROM Reports) as reports
    `);
    console.log("FINAL:", JSON.stringify(cnt.recordset[0]));
    process.exit(0);
}
fix();
