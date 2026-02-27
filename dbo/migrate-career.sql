/*-----------------------------------------------------------------
 * File: migrate-career.sql
 * EduBridge AI — Career & Portfolio Module Database Schema
 * Run this AFTER the Campus-Learning base schema is set up.
 * This adds career (jobs, interviews) and portfolio (multi-field) tables.
 *-----------------------------------------------------------------*/

-- ============================================================
-- CAREER MODULE (ported from EduLedger AI, adapted for shared Users table)
-- ============================================================

-- Companies (Employers)
IF OBJECT_ID('dbo.Companies', 'U') IS NULL
BEGIN
    CREATE TABLE Companies (
        CompanyID BIGINT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Slug NVARCHAR(255) UNIQUE,
        Tagline NVARCHAR(255),
        Description NTEXT,
        LogoUrl NVARCHAR(MAX),
        BannerUrl NVARCHAR(MAX),
        Website NVARCHAR(255),
        Industry NVARCHAR(100),
        CompanySize NVARCHAR(50),
        Country NVARCHAR(100) DEFAULT N'Việt Nam',
        MainLocation NVARCHAR(255),
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
    );
    PRINT 'Created table: Companies';
END;

-- Skills (Multi-discipline)
IF OBJECT_ID('dbo.Skills', 'U') IS NULL
BEGIN
    CREATE TABLE Skills (
        SkillID BIGINT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Category NVARCHAR(50) DEFAULT 'Technical',  -- Technical, Business, Design, Science, Soft Skill
        Icon NVARCHAR(50)
    );
    PRINT 'Created table: Skills';
END;

-- Add career columns to Users (if not exist)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'CompanyID')
BEGIN
    ALTER TABLE Users ADD CompanyID BIGINT NULL;
    PRINT 'Added CompanyID to Users';
END;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'FieldCategory')
BEGIN
    ALTER TABLE Users ADD FieldCategory NVARCHAR(50) NULL;
    PRINT 'Added FieldCategory to Users';
END;

-- Jobs (Multi-discipline)
IF OBJECT_ID('dbo.Jobs', 'U') IS NULL
BEGIN
    CREATE TABLE Jobs (
        JobID BIGINT IDENTITY(1,1) PRIMARY KEY,
        RecruiterID BIGINT NOT NULL,
        CompanyID BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Description NTEXT NOT NULL,
        Location NVARCHAR(255),
        Salary NVARCHAR(100),
        JobType NVARCHAR(50) DEFAULT 'Full-time',
        ExperienceLevel NVARCHAR(50),
        RemotePolicy NVARCHAR(50),
        FieldCategory NVARCHAR(50) DEFAULT 'IT',
        MinSalary DECIMAL(18,2),
        MaxSalary DECIMAL(18,2),
        SalaryCurrency NVARCHAR(10) DEFAULT 'VND',
        IsSalaryNegotiable BIT DEFAULT 0,
        Status NVARCHAR(50) DEFAULT 'Active',
        ExpiresAt DATETIME2,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (RecruiterID) REFERENCES Users(UserID),
        FOREIGN KEY (CompanyID) REFERENCES Companies(CompanyID)
    );
    CREATE INDEX IX_Jobs_Status ON Jobs(Status);
    CREATE INDEX IX_Jobs_FieldCategory ON Jobs(FieldCategory);
    CREATE INDEX IX_Jobs_RecruiterID ON Jobs(RecruiterID);
    PRINT 'Created table: Jobs';
END;

-- JobSkills
IF OBJECT_ID('dbo.JobSkills', 'U') IS NULL
BEGIN
    CREATE TABLE JobSkills (
        JobID BIGINT NOT NULL,
        SkillID BIGINT NOT NULL,
        PRIMARY KEY (JobID, SkillID),
        FOREIGN KEY (JobID) REFERENCES Jobs(JobID) ON DELETE CASCADE,
        FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
    );
    PRINT 'Created table: JobSkills';
END;

-- JobApplications
IF OBJECT_ID('dbo.JobApplications', 'U') IS NULL
BEGIN
    CREATE TABLE JobApplications (
        ApplicationID BIGINT IDENTITY(1,1) PRIMARY KEY,
        JobID BIGINT NOT NULL,
        StudentID BIGINT NOT NULL,
        CoverLetter NTEXT,
        Status NVARCHAR(50) DEFAULT 'Pending',
        RecruiterNotes NTEXT,
        AppliedAt DATETIME2 DEFAULT GETUTCDATE(),
        StatusChangedAt DATETIME2 DEFAULT GETUTCDATE(),
        ChangedByUserID BIGINT,
        CONSTRAINT UQ_JobApp_Job_Student UNIQUE (JobID, StudentID),
        FOREIGN KEY (JobID) REFERENCES Jobs(JobID),
        FOREIGN KEY (StudentID) REFERENCES Users(UserID)
    );
    CREATE INDEX IX_JobApplications_Status ON JobApplications(Status);
    PRINT 'Created table: JobApplications';
END;

-- InterviewTemplates
IF OBJECT_ID('dbo.InterviewTemplates', 'U') IS NULL
BEGIN
    CREATE TABLE InterviewTemplates (
        TemplateID BIGINT IDENTITY(1,1) PRIMARY KEY,
        RecruiterID BIGINT NOT NULL,
        JobID BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        TimeLimitMinutes INT DEFAULT 30,
        AiPromptSettings NVARCHAR(MAX),
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (RecruiterID) REFERENCES Users(UserID),
        FOREIGN KEY (JobID) REFERENCES Jobs(JobID)
    );
    PRINT 'Created table: InterviewTemplates';
END;

-- InterviewQuestions
IF OBJECT_ID('dbo.InterviewQuestions', 'U') IS NULL
BEGIN
    CREATE TABLE InterviewQuestions (
        QuestionID BIGINT IDENTITY(1,1) PRIMARY KEY,
        TemplateID BIGINT NOT NULL,
        QuestionOrder INT NOT NULL,
        QuestionText NVARCHAR(MAX) NOT NULL,
        IdealAnswer NVARCHAR(MAX) NOT NULL,
        QuestionType NVARCHAR(50),
        FOREIGN KEY (TemplateID) REFERENCES InterviewTemplates(TemplateID) ON DELETE CASCADE
    );
    PRINT 'Created table: InterviewQuestions';
END;

-- StudentInterviews
IF OBJECT_ID('dbo.StudentInterviews', 'U') IS NULL
BEGIN
    CREATE TABLE StudentInterviews (
        InterviewID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ApplicationID BIGINT NOT NULL UNIQUE,
        TemplateID BIGINT NOT NULL,
        Status NVARCHAR(50) DEFAULT 'Sent',
        RecruiterMessage NVARCHAR(MAX),
        TimeStarted DATETIME2,
        TimeSubmitted DATETIME2,
        OverallScore INT,
        AiOverallEvaluation NVARCHAR(MAX),
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (ApplicationID) REFERENCES JobApplications(ApplicationID),
        FOREIGN KEY (TemplateID) REFERENCES InterviewTemplates(TemplateID)
    );
    CREATE INDEX IX_StudentInterviews_Status ON StudentInterviews(Status);
    PRINT 'Created table: StudentInterviews';
END;

-- StudentAnswers
IF OBJECT_ID('dbo.StudentAnswers', 'U') IS NULL
BEGIN
    CREATE TABLE StudentAnswers (
        AnswerID BIGINT IDENTITY(1,1) PRIMARY KEY,
        InterviewID BIGINT NOT NULL,
        QuestionID BIGINT NOT NULL,
        AnswerText NVARCHAR(MAX),
        AiScore INT,
        AiEvaluation NVARCHAR(MAX),
        FOREIGN KEY (InterviewID) REFERENCES StudentInterviews(InterviewID) ON DELETE CASCADE,
        FOREIGN KEY (QuestionID) REFERENCES InterviewQuestions(QuestionID)
    );
    PRINT 'Created table: StudentAnswers';
END;


-- ============================================================
-- PORTFOLIO MODULE (NEW — Multi-discipline)
-- ============================================================

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


-- ============================================================
-- SEED DATA — Sample Skills (multi-discipline)
-- ============================================================

-- IT Skills
IF NOT EXISTS (SELECT 1 FROM Skills WHERE Name = 'JavaScript')
BEGIN
    INSERT INTO Skills (Name, Category, Icon) VALUES
    (N'JavaScript', N'Technical', N'💻'),
    (N'Python', N'Technical', N'🐍'),
    (N'React', N'Technical', N'⚛️'),
    (N'Node.js', N'Technical', N'🟢'),
    (N'SQL', N'Technical', N'🗄️'),
    (N'TypeScript', N'Technical', N'📘'),
    (N'Git', N'Technical', N'🔀'),
    (N'Docker', N'Technical', N'🐳'),
    (N'Java', N'Technical', N'☕'),
    (N'C++', N'Technical', N'⚙️');
    PRINT 'Seeded IT Skills';
END;

-- Design Skills
IF NOT EXISTS (SELECT 1 FROM Skills WHERE Name = 'UI/UX Design')
BEGIN
    INSERT INTO Skills (Name, Category, Icon) VALUES
    (N'UI/UX Design', N'Design', N'🎨'),
    (N'Figma', N'Design', N'🖌️'),
    (N'Adobe Photoshop', N'Design', N'📸'),
    (N'Adobe Illustrator', N'Design', N'✏️'),
    (N'Graphic Design', N'Design', N'🖼️'),
    (N'Motion Graphics', N'Design', N'🎬'),
    (N'3D Modeling', N'Design', N'🧊'),
    (N'Typography', N'Design', N'🔤'),
    (N'Branding', N'Design', N'™️'),
    (N'Video Editing', N'Design', N'🎥');
    PRINT 'Seeded Design Skills';
END;

-- Business Skills
IF NOT EXISTS (SELECT 1 FROM Skills WHERE Name = N'Phân tích tài chính')
BEGIN
    INSERT INTO Skills (Name, Category, Icon) VALUES
    (N'Phân tích tài chính', N'Business', N'📊'),
    (N'Marketing', N'Business', N'📣'),
    (N'Quản lý dự án', N'Business', N'📋'),
    (N'Excel nâng cao', N'Business', N'📗'),
    (N'Thuyết trình', N'Business', N'🎤'),
    (N'Phân tích dữ liệu', N'Business', N'📈'),
    (N'Khởi nghiệp', N'Business', N'🚀'),
    (N'Kế toán', N'Business', N'🧮'),
    (N'Đàm phán', N'Business', N'🤝'),
    (N'Quản lý nhân sự', N'Business', N'👥');
    PRINT 'Seeded Business Skills';
END;

-- Science Skills
IF NOT EXISTS (SELECT 1 FROM Skills WHERE Name = N'Nghiên cứu khoa học')
BEGIN
    INSERT INTO Skills (Name, Category, Icon) VALUES
    (N'Nghiên cứu khoa học', N'Science', N'🔬'),
    (N'Thống kê', N'Science', N'📉'),
    (N'Machine Learning', N'Science', N'🤖'),
    (N'Lab Techniques', N'Science', N'🧪'),
    (N'Technical Writing', N'Science', N'📝'),
    (N'CAD/CAM', N'Science', N'📐'),
    (N'Data Science', N'Science', N'🧠'),
    (N'MATLAB', N'Science', N'🔢');
    PRINT 'Seeded Science Skills';
END;

-- Soft Skills
IF NOT EXISTS (SELECT 1 FROM Skills WHERE Name = N'Giao tiếp')
BEGIN
    INSERT INTO Skills (Name, Category, Icon) VALUES
    (N'Giao tiếp', N'Soft Skill', N'💬'),
    (N'Làm việc nhóm', N'Soft Skill', N'🤝'),
    (N'Tư duy phản biện', N'Soft Skill', N'🧐'),
    (N'Sáng tạo', N'Soft Skill', N'💡'),
    (N'Quản lý thời gian', N'Soft Skill', N'⏰'),
    (N'Lãnh đạo', N'Soft Skill', N'👑');
    PRINT 'Seeded Soft Skills';
END;

PRINT '============================================';
PRINT 'EduBridge AI — Career & Portfolio migration complete!';
PRINT '============================================';
