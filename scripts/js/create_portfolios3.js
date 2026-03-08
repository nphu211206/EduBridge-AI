const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const query = `
    CREATE TABLE Portfolios (
        PortfolioID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID BIGINT NOT NULL UNIQUE,
        Headline NVARCHAR(255),
        Bio NTEXT,
        FieldCategory NVARCHAR(50),
        OverallScore INT,
        AiSummary NVARCHAR(MAX),
        LastEvaluatedAt DATETIME2,
        IsPublic BIT DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
    );
`;
        await pool.request().query(query);
        console.log("Success Portfolios!");
    } catch (e) {
        console.error("ERROR:", e.message);
    }

    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const query2 = `
    CREATE TABLE PortfolioItems (
        ItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
        PortfolioID BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Description NTEXT,
        ItemType NVARCHAR(50) NOT NULL,
        FileUrl NVARCHAR(MAX),
        ExternalUrl NVARCHAR(MAX),
        ThumbnailUrl NVARCHAR(MAX),
        AiScore INT,
        AiEvaluation NVARCHAR(MAX),
        Tags NVARCHAR(MAX),
        SortOrder INT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
    );
`;
        await pool.request().query(query2);
        console.log("Success ITEMS!");
    } catch (e) {
        console.error("ERROR 2:", e.message);
    }
    process.exit();
})();
