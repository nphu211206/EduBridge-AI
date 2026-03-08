const sql = require('mssql');
(async () => {
    try {
        const pool = await sql.connect({
            user: 'sa', password: '123456', server: 'localhost', port: 61654, database: 'EduBridgeAI_Enterprise',
            options: { encrypt: false, trustServerCertificate: true, enableArithAbort: true }
        });
        const query = `
-- Portfolios
IF OBJECT_ID('dbo.Portfolios', 'U') IS NULL
BEGIN
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
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
END;

-- PortfolioItems
IF OBJECT_ID('dbo.PortfolioItems', 'U') IS NULL
BEGIN
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
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (PortfolioID) REFERENCES Portfolios(PortfolioID) ON DELETE CASCADE
    );
END;
`;
        await pool.request().query(query);
        console.log("Success Portfolios!");
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
})();
