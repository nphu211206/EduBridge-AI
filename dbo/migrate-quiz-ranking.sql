/*-----------------------------------------------------------------
 * migrate-quiz-ranking.sql
 * EduBridge AI — Quiz & Ranking Extension Tables
 * Run AFTER migrate-career.sql
 *-----------------------------------------------------------------*/

-- ============================================================
-- SKILL QUIZ MODULE
-- ============================================================

IF OBJECT_ID('dbo.SkillQuizzes', 'U') IS NULL
BEGIN
    CREATE TABLE SkillQuizzes (
        QuizID BIGINT IDENTITY(1,1) PRIMARY KEY,
        SkillID BIGINT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Description NTEXT,
        Level NVARCHAR(30) DEFAULT 'Beginner',  -- Beginner, Intermediate, Advanced
        QuestionCount INT DEFAULT 10,
        TimeLimitMinutes INT DEFAULT 15,
        PassScore INT DEFAULT 60,
        FieldCategory NVARCHAR(50),
        IsAIGenerated BIT DEFAULT 1,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
    );
    CREATE INDEX IX_SkillQuizzes_SkillID ON SkillQuizzes(SkillID);
    PRINT 'Created table: SkillQuizzes';
END;

IF OBJECT_ID('dbo.QuizQuestions', 'U') IS NULL
BEGIN
    CREATE TABLE QuizQuestions (
        QuestionID BIGINT IDENTITY(1,1) PRIMARY KEY,
        QuizID BIGINT NOT NULL,
        QuestionOrder INT NOT NULL,
        QuestionText NVARCHAR(MAX) NOT NULL,
        QuestionType NVARCHAR(30) DEFAULT 'multiple_choice',  -- multiple_choice, short_answer, code
        Options NVARCHAR(MAX),          -- JSON array for MC options
        CorrectAnswer NVARCHAR(MAX) NOT NULL,
        Explanation NVARCHAR(MAX),
        Points INT DEFAULT 10,
        FOREIGN KEY (QuizID) REFERENCES SkillQuizzes(QuizID) ON DELETE CASCADE
    );
    PRINT 'Created table: QuizQuestions';
END;

IF OBJECT_ID('dbo.QuizAttempts', 'U') IS NULL
BEGIN
    CREATE TABLE QuizAttempts (
        AttemptID BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserID BIGINT NOT NULL,
        QuizID BIGINT NOT NULL,
        Score INT,
        MaxScore INT,
        Percentage DECIMAL(5,2),
        Passed BIT DEFAULT 0,
        Answers NVARCHAR(MAX),          -- JSON array of user answers
        AiFeedback NVARCHAR(MAX),
        StartedAt DATETIME2 DEFAULT GETUTCDATE(),
        CompletedAt DATETIME2,
        FOREIGN KEY (UserID) REFERENCES Users(UserID),
        FOREIGN KEY (QuizID) REFERENCES SkillQuizzes(QuizID)
    );
    CREATE INDEX IX_QuizAttempts_UserID ON QuizAttempts(UserID);
    CREATE INDEX IX_QuizAttempts_QuizID ON QuizAttempts(QuizID);
    PRINT 'Created table: QuizAttempts';
END;


-- ============================================================
-- SKILL CHALLENGES MODULE
-- ============================================================

IF OBJECT_ID('dbo.SkillChallenges', 'U') IS NULL
BEGIN
    CREATE TABLE SkillChallenges (
        ChallengeID BIGINT IDENTITY(1,1) PRIMARY KEY,
        Title NVARCHAR(255) NOT NULL,
        Description NTEXT NOT NULL,
        FieldCategory NVARCHAR(50) NOT NULL,
        SkillID BIGINT,
        ChallengeType NVARCHAR(50) DEFAULT 'Weekly',   -- Weekly, Daily, Special
        Difficulty NVARCHAR(30) DEFAULT 'Medium',
        MaxParticipants INT,
        XpReward INT DEFAULT 50,
        BadgeReward NVARCHAR(100),
        StartsAt DATETIME2 NOT NULL,
        EndsAt DATETIME2 NOT NULL,
        Status NVARCHAR(30) DEFAULT 'Upcoming',         -- Upcoming, Active, Ended
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (SkillID) REFERENCES Skills(SkillID)
    );
    CREATE INDEX IX_SkillChallenges_Status ON SkillChallenges(Status);
    CREATE INDEX IX_SkillChallenges_Field ON SkillChallenges(FieldCategory);
    PRINT 'Created table: SkillChallenges';
END;

IF OBJECT_ID('dbo.ChallengeSubmissions', 'U') IS NULL
BEGIN
    CREATE TABLE ChallengeSubmissions (
        SubmissionID BIGINT IDENTITY(1,1) PRIMARY KEY,
        ChallengeID BIGINT NOT NULL,
        UserID BIGINT NOT NULL,
        SubmissionUrl NVARCHAR(MAX),
        SubmissionText NTEXT,
        FileUrl NVARCHAR(MAX),
        AiScore INT,
        AiEvaluation NVARCHAR(MAX),
        Rank INT,
        XpEarned INT DEFAULT 0,
        SubmittedAt DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_Challenge_User UNIQUE (ChallengeID, UserID),
        FOREIGN KEY (ChallengeID) REFERENCES SkillChallenges(ChallengeID),
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );
    PRINT 'Created table: ChallengeSubmissions';
END;

PRINT '============================================';
PRINT 'EduBridge AI — Quiz & Ranking migration complete!';
PRINT '============================================';
