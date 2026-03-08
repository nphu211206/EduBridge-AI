const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

const createEventParticipantsSql = `
CREATE TABLE [dbo].[EventParticipants] (
    [ParticipantID]    BIGINT         IDENTITY (1, 1) NOT NULL,
    [EventID]          BIGINT         NOT NULL,
    [UserID]           BIGINT         NOT NULL,
    [RegistrationDate] DATETIME       DEFAULT (getdate()) NULL,
    [Status]           VARCHAR (20)   DEFAULT ('registered') NULL,
    [TeamName]         NVARCHAR (100) NULL,
    [PaymentStatus]    VARCHAR (20)   NULL,
    [AttendanceStatus] VARCHAR (20)   NULL,
    PRIMARY KEY CLUSTERED ([ParticipantID] ASC)
);
`;

async function patch() {
    try {
        const pool = await sql.connect(config);

        try { await pool.request().query("DROP TABLE EventParticipants"); } catch (e) { }

        console.log("Running clean CREATE TABLE EventParticipants...");
        try {
            await pool.request().query(createEventParticipantsSql);
            console.log("-> SUCCESS");
        } catch (e) {
            console.error("-> ERROR:", e.message);
        }

        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}

patch();
