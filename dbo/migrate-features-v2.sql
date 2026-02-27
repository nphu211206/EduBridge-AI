/*-----------------------------------------------------------------
 * migrate-features-v2.sql
 * EduBridge AI — Learning Path, Achievements, Teams
 *-----------------------------------------------------------------*/

-- ============================================================
-- AI LEARNING PATH
-- ============================================================
IF OBJECT_ID('dbo.LearningPaths', 'U') IS NULL
BEGIN
    CREATE TABLE LearningPaths (
        PathID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        CareerGoal NVARCHAR(500),
        FieldCategory NVARCHAR(50),
        DurationMonths INT DEFAULT 6,
        AiAnalysis NVARCHAR(MAX),
        CurrentPhase INT DEFAULT 1,
        TotalPhases INT DEFAULT 0,
        ProgressPercent INT DEFAULT 0,
        Status NVARCHAR(30) DEFAULT 'Active',
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
    CREATE INDEX IX_LearningPaths_UserID ON LearningPaths(UserID);
END;

IF OBJECT_ID('dbo.PathMilestones', 'U') IS NULL
BEGIN
    CREATE TABLE PathMilestones (
        MilestoneID BIGINT IDENTITY(1,1) PRIMARY KEY,
        PathID BIGINT NOT NULL,
        Phase INT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Description NTEXT,
        MilestoneType NVARCHAR(30) DEFAULT 'course',
        ResourceUrl NVARCHAR(MAX),
        ResourceId BIGINT,
        DurationWeeks INT DEFAULT 2,
        IsCompleted BIT DEFAULT 0,
        CompletedAt DATETIME2,
        SortOrder INT DEFAULT 0,
        FOREIGN KEY (PathID) REFERENCES LearningPaths(PathID) ON DELETE CASCADE
    );
END;

-- ============================================================
-- ACHIEVEMENTS & BADGES
-- ============================================================
IF OBJECT_ID('dbo.Badges', 'U') IS NULL
BEGIN
    CREATE TABLE Badges (
        BadgeID BIGINT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        Icon NVARCHAR(10),
        Category NVARCHAR(50),
        Rarity NVARCHAR(30) DEFAULT 'Common',
        TriggerType NVARCHAR(50) NOT NULL,
        TriggerValue INT DEFAULT 1,
        XpReward INT DEFAULT 10,
        IsActive BIT DEFAULT 1
    );

    INSERT INTO Badges (Name, Description, Icon, Category, Rarity, TriggerType, TriggerValue, XpReward) VALUES
    (N'First Blood', N'Pass bài quiz đầu tiên', N'🔥', N'General', N'Common', N'quiz_pass_count', 1, 10),
    (N'Quiz Master', N'Pass 10 bài quiz', N'🧠', N'General', N'Rare', N'quiz_pass_count', 10, 50),
    (N'Diamond Coder', N'Điểm code quiz ≥ 90', N'💎', N'Technical', N'Epic', N'quiz_score_min', 90, 100),
    (N'Design Master', N'10 design items score ≥ 80', N'🎨', N'Design', N'Epic', N'portfolio_items_score', 80, 100),
    (N'Data Wizard', N'Pass 5 quiz Business', N'📊', N'Business', N'Rare', N'field_quiz_pass', 5, 50),
    (N'Lab Hero', N'3 research papers evaluated', N'🔬', N'Science', N'Rare', N'portfolio_items_count', 3, 50),
    (N'All-Rounder', N'Skills ≥ 3 categories ≥ 70', N'👑', N'General', N'Legendary', N'multi_category_score', 3, 200),
    (N'7-Day Streak', N'7 ngày liên tục active', N'🔥', N'General', N'Uncommon', N'streak_days', 7, 30),
    (N'30-Day Warrior', N'30 ngày liên tục active', N'⚔️', N'General', N'Epic', N'streak_days', 30, 150),
    (N'Top 1%', N'Ranking top 1% ngành', N'🏆', N'General', N'Legendary', N'ranking_percentile', 1, 300),
    (N'Social Butterfly', N'Kết bạn 20 người', N'🦋', N'Social', N'Uncommon', N'friend_count', 20, 20),
    (N'Team Player', N'Tham gia 3 team projects', N'🤝', N'General', N'Rare', N'team_join_count', 3, 50),
    (N'Portfolio Pro', N'Portfolio score ≥ 85', N'📁', N'General', N'Epic', N'portfolio_score', 85, 100),
    (N'Career Hunter', N'Ứng tuyển 5 việc', N'💼', N'Career', N'Uncommon', N'application_count', 5, 30),
    (N'Path Finder', N'Hoàn thành 1 learning path', N'🧬', N'General', N'Epic', N'path_complete_count', 1, 150);
END;

IF OBJECT_ID('dbo.UserBadges', 'U') IS NULL
BEGIN
    CREATE TABLE UserBadges (
        UserBadgeID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID BIGINT NOT NULL,
        BadgeID BIGINT NOT NULL,
        EarnedAt DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_UserBadge UNIQUE (UserID, BadgeID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (BadgeID) REFERENCES Badges(BadgeID)
    );
END;

IF OBJECT_ID('dbo.UserStreaks', 'U') IS NULL
BEGIN
    CREATE TABLE UserStreaks (
        StreakID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID BIGINT NOT NULL UNIQUE,
        CurrentStreak INT DEFAULT 0,
        LongestStreak INT DEFAULT 0,
        LastActiveDate DATE,
        TotalXp INT DEFAULT 0,
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
END;

-- ============================================================
-- AI TEAM BUILDER
-- ============================================================
IF OBJECT_ID('dbo.TeamProjects', 'U') IS NULL
BEGIN
    CREATE TABLE TeamProjects (
        ProjectID BIGINT IDENTITY(1,1) PRIMARY KEY,
        CreatorID BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Description NTEXT,
        FieldCategory NVARCHAR(50),
        MaxMembers INT DEFAULT 5,
        Status NVARCHAR(30) DEFAULT 'Recruiting',
        Deadline DATETIME2,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (CreatorID) REFERENCES Users(UserID)
    );
END;

IF OBJECT_ID('dbo.ProjectRoles', 'U') IS NULL
BEGIN
    CREATE TABLE ProjectRoles (
        RoleID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ProjectID BIGINT NOT NULL,
        RoleName NVARCHAR(100) NOT NULL,
        RequiredSkills NVARCHAR(MAX),
        AssignedUserID BIGINT,
        Status NVARCHAR(30) DEFAULT 'Open',
        FOREIGN KEY (ProjectID) REFERENCES TeamProjects(ProjectID) ON DELETE CASCADE,
        FOREIGN KEY (AssignedUserID) REFERENCES Users(UserID)
    );
END;

IF OBJECT_ID('dbo.TeamInvites', 'U') IS NULL
BEGIN
    CREATE TABLE TeamInvites (
        InviteID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ProjectID BIGINT NOT NULL,
        RoleID BIGINT NOT NULL,
        InvitedUserID BIGINT NOT NULL,
        InvitedByID BIGINT NOT NULL,
        AiMatchScore INT,
        Status NVARCHAR(30) DEFAULT 'Pending',
        Message NVARCHAR(500),
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (ProjectID) REFERENCES TeamProjects(ProjectID),
        FOREIGN KEY (RoleID) REFERENCES ProjectRoles(RoleID),
        FOREIGN KEY (InvitedUserID) REFERENCES Users(UserID),
        FOREIGN KEY (InvitedByID) REFERENCES Users(UserID)
    );
END;

PRINT '✅ EduBridge AI v2 — Features migration complete!';
