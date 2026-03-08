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
    PRINT 'Created table: Portfolios';
END;

-- UserSkills
IF OBJECT_ID('dbo.UserSkills', 'U') IS NULL
BEGIN
    CREATE TABLE UserSkills (
        UserSkillID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID BIGINT NOT NULL,
        SkillID BIGINT NOT NULL,
        Score INT DEFAULT 0,
        Source NVARCHAR(50) DEFAULT 'Manual',
        EvidenceUrl NVARCHAR(MAX),
        EvaluatedAt DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_UserSkill UNIQUE (UserID, SkillID, Source),
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
    );
    CREATE INDEX IX_UserSkills_UserID ON UserSkills(UserID);
    PRINT 'Created table: UserSkills';
END;

-- PortfolioItems (multi-format)
IF OBJECT_ID('dbo.PortfolioItems', 'U') IS NULL
BEGIN
    CREATE TABLE PortfolioItems (
        ItemID BIGINT IDENTITY(1,1) PRIMARY KEY,
        PortfolioID BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Description NTEXT,
        ItemType NVARCHAR(50) NOT NULL,     -- code_project, design_work, business_report, etc.
        FileUrl NVARCHAR(MAX),
        ExternalUrl NVARCHAR(MAX),
        ThumbnailUrl NVARCHAR(MAX),
        AiScore INT,
        AiEvaluation NVARCHAR(MAX),
        Tags NVARCHAR(MAX),                 -- JSON array
        SortOrder INT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (PortfolioID) REFERENCES Portfolios(PortfolioID) ON DELETE CASCADE
    );
    CREATE INDEX IX_PortfolioItems_PortfolioID ON PortfolioItems(PortfolioID);
    CREATE INDEX IX_PortfolioItems_ItemType ON PortfolioItems(ItemType);
    PRINT 'Created table: PortfolioItems';
END;

-- ExternalProfiles (GitHub, Behance, Dribbble, LinkedIn, Kaggle, etc.)
IF OBJECT_ID('dbo.ExternalProfiles', 'U') IS NULL
BEGIN
    CREATE TABLE ExternalProfiles (
        ProfileID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID BIGINT NOT NULL,
        Platform NVARCHAR(50) NOT NULL,
        ProfileUrl NVARCHAR(MAX) NOT NULL,
        Username NVARCHAR(255),
        ProfileData NVARCHAR(MAX),          -- JSON cache
        AiScore INT,
        AiEvaluation NVARCHAR(MAX),
        LastSyncedAt DATETIME2,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_ExternalProfile UNIQUE (UserID, Platform),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
    PRINT 'Created table: ExternalProfiles';
END;
`;
        await pool.request().query(query);
        console.log("Success creating tables!");
    } catch (e) {
        console.error(e.message);
    }
    process.exit();
})();
