-- ============================================================
-- EDUBRIDGE AI - COMPLETE MASTER DATABASE SCHEMA (ENTERPRISE EDITION)
-- Microsoft SQL Server 2019+
-- Version: 2.0.0 (Master Release)
-- Author: Antigravity Senior Developer & Solution Architect
-- Description: N n?n t?ng h?c t?p thông minh k?t h?p AI Interview,
--              H? sinh thái tuy?n d?ng ATS chuyên nghi?p, và 
--              M?ng xã h?i h?c thu?t gamification cao c?p.
--              Tích h?p 15 Sections, ~200 Tables
-- ============================================================
-- HOW TO RUN:
--   1. M? SSMS, k?t n?i vào instance c?a b?n
--   2. Ch?n Query > Execute (F5) toàn b? file này
--   3. Database EduBridgeAI_Enterprise s? t? du?c t?o
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EduBridgeAI_Enterprise')
BEGIN
    CREATE DATABASE EduBridgeAI_Enterprise
    COLLATE Vietnamese_CI_AS;
    PRINT 'Database EduBridgeAI_Enterprise created successfully.';
END
ELSE
    PRINT 'Database EduBridgeAI_Enterprise already exists. Using existing database.';
GO

USE EduBridgeAI_Enterprise;
GO

PRINT '============================================================';
PRINT 'EDUBRIDGE AI ENTERPRISE - DATABASE SETUP STARTED';
PRINT CONVERT(VARCHAR, GETDATE(), 120);
PRINT '============================================================';
GO

-- ============================================================
-- SECTION 1: CORE - USERS & AUTHENTICATION (15 Tables)
-- ============================================================
PRINT 'Creating Section 1: Core - Users & Authentication...';
GO

-- 1.1 Roles
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Roles]') AND type = 'U')
CREATE TABLE [dbo].[Roles] (
    [RoleID]        INT IDENTITY(1,1) PRIMARY KEY,
    [RoleName]      NVARCHAR(50)  NOT NULL UNIQUE,   -- 'Student','Teacher','Admin','Recruiter','Company'
    [RoleCode]      VARCHAR(30)   NOT NULL UNIQUE,   -- 'student','teacher','admin','recruiter','company'
    [Description]   NVARCHAR(200) NULL,
    [IsActive]      BIT           NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- 1.2 Users (b?ng trung t?m c?a to?n h? th?ng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type = 'U')
CREATE TABLE [dbo].[Users] (
    [UserID]            INT IDENTITY(1,1) PRIMARY KEY,
    [Username]          NVARCHAR(100) NOT NULL UNIQUE,
    [Email]             NVARCHAR(255) NOT NULL UNIQUE,
    [PasswordHash]      NVARCHAR(500) NOT NULL,
    [PasswordSalt]      NVARCHAR(200) NOT NULL,
    [FirstName]         NVARCHAR(100) NOT NULL,
    [LastName]          NVARCHAR(100) NOT NULL,
    [FullName]          AS (LTRIM(RTRIM([FirstName] + ' ' + [LastName]))),   -- Computed
    [PhoneNumber]       NVARCHAR(20)  NULL,
    [AvatarUrl]         NVARCHAR(500) NULL,
    [CoverPhotoUrl]     NVARCHAR(500) NULL,
    [DateOfBirth]       DATE          NULL,
    [Gender]            NVARCHAR(20)  NULL CHECK ([Gender] IN ('Male','Female','Other','PreferNotToSay')),
    [Bio]               NVARCHAR(MAX) NULL,
    [Address]           NVARCHAR(500) NULL,
    [City]              NVARCHAR(100) NULL,
    [Country]           NVARCHAR(100) NULL DEFAULT N'Vietnam',
    [Timezone]          VARCHAR(50)   NULL DEFAULT 'Asia/Ho_Chi_Minh',
    [Language]          VARCHAR(10)   NULL DEFAULT 'vi',
    [IsEmailVerified]   BIT           NOT NULL DEFAULT 0,
    [IsPhoneVerified]   BIT           NOT NULL DEFAULT 0,
    [IsActive]          BIT           NOT NULL DEFAULT 1,
    [IsBanned]          BIT           NOT NULL DEFAULT 0,
    [BannedReason]      NVARCHAR(500) NULL,
    [BannedUntil]       DATETIME2     NULL,
    [LastLoginAt]       DATETIME2     NULL,
    [LastActiveAt]      DATETIME2     NULL,
    [OnlineStatus]      NVARCHAR(20)  NOT NULL DEFAULT 'Offline' CHECK ([OnlineStatus] IN ('Online','Away','Busy','Offline')),
    [RegistrationSource] NVARCHAR(50) NULL DEFAULT 'Web',  -- 'Web','Mobile','Desktop','API'
    [ReferralCode]      VARCHAR(20)   NULL UNIQUE,
    [ReferredBy]        INT           NULL REFERENCES [dbo].[Users]([UserID]),
    [TotalPoints]       INT           NOT NULL DEFAULT 0,
    [Level]             INT           NOT NULL DEFAULT 1,
    [CreatedAt]         DATETIME2     NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]         DATETIME2     NOT NULL DEFAULT GETDATE(),
    [DeletedAt]         DATETIME2     NULL   -- Soft delete
);
GO

-- 1.3 UserRoles (Many-to-Many: Users <-> Roles)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserRoles]') AND type = 'U')
CREATE TABLE [dbo].[UserRoles] (
    [UserRoleID]    INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [RoleID]        INT NOT NULL REFERENCES [dbo].[Roles]([RoleID]) ON DELETE CASCADE,
    [AssignedAt]    DATETIME2 NOT NULL DEFAULT GETDATE(),
    [AssignedBy]    INT NULL REFERENCES [dbo].[Users]([UserID]),
    CONSTRAINT UQ_UserRoles UNIQUE ([UserID], [RoleID])
);
GO

-- 1.4 UserProfiles (Extended profile info)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserProfiles]') AND type = 'U')
CREATE TABLE [dbo].[UserProfiles] (
    [ProfileID]         INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]            INT NOT NULL UNIQUE REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Headline]          NVARCHAR(200) NULL,   -- "Full-stack Developer | RMIT Student"
    [Summary]           NVARCHAR(MAX) NULL,
    [GithubUrl]         NVARCHAR(500) NULL,
    [LinkedinUrl]       NVARCHAR(500) NULL,
    [PersonalWebsite]   NVARCHAR(500) NULL,
    [FacebookUrl]       NVARCHAR(500) NULL,
    [TwitterUrl]        NVARCHAR(500) NULL,
    [YearOfStudy]       INT NULL,
    [GPA]               DECIMAL(3,2) NULL,
    [ExpectedGraduation] DATE NULL,
    [StudentID]         NVARCHAR(50) NULL,    -- M? sinh vi?n
    [SchoolID]          INT NULL,             -- FK s? th?m sau
    [DepartmentID]      INT NULL,
    [MajorID]           INT NULL,
    [IsPublic]          BIT NOT NULL DEFAULT 1,
    [ProfileViewCount]  INT NOT NULL DEFAULT 0,
    [UpdatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 1.5 UserSettings
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSettings]') AND type = 'U')
CREATE TABLE [dbo].[UserSettings] (
    [SettingID]                 INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]                    INT NOT NULL UNIQUE REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    -- Notification preferences
    [EmailNotifications]        BIT NOT NULL DEFAULT 1,
    [PushNotifications]         BIT NOT NULL DEFAULT 1,
    [SMSNotifications]          BIT NOT NULL DEFAULT 0,
    [NotifyOnMessage]           BIT NOT NULL DEFAULT 1,
    [NotifyOnCourseUpdate]      BIT NOT NULL DEFAULT 1,
    [NotifyOnJobAlert]          BIT NOT NULL DEFAULT 1,
    [NotifyOnAchievement]       BIT NOT NULL DEFAULT 1,
    [NotifyOnFriendRequest]     BIT NOT NULL DEFAULT 1,
    -- Privacy
    [ShowProfilePublic]         BIT NOT NULL DEFAULT 1,
    [ShowEmailPublic]           BIT NOT NULL DEFAULT 0,
    [ShowPhonePublic]           BIT NOT NULL DEFAULT 0,
    [AllowFriendRequests]       BIT NOT NULL DEFAULT 1,
    [AllowMessages]             BIT NOT NULL DEFAULT 1,
    -- Appearance
    [DarkMode]                  BIT NOT NULL DEFAULT 0,
    [Language]                  VARCHAR(10) NOT NULL DEFAULT 'vi',
    [Timezone]                  VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    -- Learning
    [DailyLearningGoalMinutes]  INT NOT NULL DEFAULT 30,
    [AutoplayCourseVideos]      BIT NOT NULL DEFAULT 1,
    [ShowCodingHints]           BIT NOT NULL DEFAULT 1,
    [UpdatedAt]                 DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 1.6 AuthRefreshTokens
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuthRefreshTokens]') AND type = 'U')
CREATE TABLE [dbo].[AuthRefreshTokens] (
    [TokenID]       INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Token]         NVARCHAR(500) NOT NULL UNIQUE,
    [DeviceInfo]    NVARCHAR(300) NULL,
    [IPAddress]     VARCHAR(50)   NULL,
    [UserAgent]     NVARCHAR(500) NULL,
    [ExpiresAt]     DATETIME2     NOT NULL,
    [IsRevoked]     BIT           NOT NULL DEFAULT 0,
    [RevokedAt]     DATETIME2     NULL,
    [CreatedAt]     DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- 1.7 PasswordResets
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PasswordResets]') AND type = 'U')
CREATE TABLE [dbo].[PasswordResets] (
    [ResetID]       INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Token]         NVARCHAR(200) NOT NULL UNIQUE,
    [ExpiresAt]     DATETIME2     NOT NULL,
    [UsedAt]        DATETIME2     NULL,
    [IPAddress]     VARCHAR(50)   NULL,
    [CreatedAt]     DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- 1.8 EmailVerifications
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EmailVerifications]') AND type = 'U')
CREATE TABLE [dbo].[EmailVerifications] (
    [VerifID]       INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Email]         NVARCHAR(255) NOT NULL,
    [Token]         NVARCHAR(200) NOT NULL UNIQUE,
    [ExpiresAt]     DATETIME2     NOT NULL,
    [VerifiedAt]    DATETIME2     NULL,
    [CreatedAt]     DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- 1.9 TwoFactorAuth
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TwoFactorAuth]') AND type = 'U')
CREATE TABLE [dbo].[TwoFactorAuth] (
    [TfaID]         INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL UNIQUE REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [IsEnabled]     BIT NOT NULL DEFAULT 0,
    [Secret]        NVARCHAR(200) NULL,     -- TOTP secret
    [Method]        NVARCHAR(20)  NULL DEFAULT 'TOTP' CHECK ([Method] IN ('TOTP','SMS','Email')),
    [BackupCodes]   NVARCHAR(MAX) NULL,     -- JSON array of hashed backup codes
    [EnabledAt]     DATETIME2     NULL,
    [UpdatedAt]     DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- 1.10 LoginHistory
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LoginHistory]') AND type = 'U')
CREATE TABLE [dbo].[LoginHistory] (
    [LogID]         BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [IPAddress]     VARCHAR(50)   NOT NULL,
    [UserAgent]     NVARCHAR(500) NULL,
    [DeviceType]    NVARCHAR(50)  NULL,   -- 'Desktop','Mobile','Tablet'
    [OS]            NVARCHAR(100) NULL,
    [Browser]       NVARCHAR(100) NULL,
    [City]          NVARCHAR(100) NULL,
    [Country]       NVARCHAR(100) NULL,
    [IsSuccess]     BIT NOT NULL,
    [FailReason]    NVARCHAR(200) NULL,
    [LoginAt]       DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 1.11 Schools
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Schools]') AND type = 'U')
CREATE TABLE [dbo].[Schools] (
    [SchoolID]      INT IDENTITY(1,1) PRIMARY KEY,
    [SchoolName]    NVARCHAR(300) NOT NULL,
    [ShortName]     NVARCHAR(50)  NULL,
    [LogoUrl]       NVARCHAR(500) NULL,
    [Website]       NVARCHAR(300) NULL,
    [City]          NVARCHAR(100) NULL,
    [Country]       NVARCHAR(100) NULL DEFAULT N'Vietnam',
    [Type]          NVARCHAR(50)  NULL,  -- 'University','College','Institute'
    [IsVerified]    BIT NOT NULL DEFAULT 0,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 1.12 Departments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Departments]') AND type = 'U')
CREATE TABLE [dbo].[Departments] (
    [DepartmentID]  INT IDENTITY(1,1) PRIMARY KEY,
    [SchoolID]      INT NULL REFERENCES [dbo].[Schools]([SchoolID]),
    [DeptName]      NVARCHAR(300) NOT NULL,
    [DeptCode]      NVARCHAR(50)  NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 1.13 Majors
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Majors]') AND type = 'U')
CREATE TABLE [dbo].[Majors] (
    [MajorID]       INT IDENTITY(1,1) PRIMARY KEY,
    [DepartmentID]  INT NULL REFERENCES [dbo].[Departments]([DepartmentID]),
    [MajorName]     NVARCHAR(300) NOT NULL,
    [MajorCode]     NVARCHAR(50)  NULL,
    [FieldCategory] NVARCHAR(100) NULL, -- 'IT','Economics','Design','Science','Social','Art'
    [Description]   NVARCHAR(MAX) NULL,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Add FKs back to UserProfiles now that schools/depts/majors exist
ALTER TABLE [dbo].[UserProfiles]
    ADD CONSTRAINT FK_UserProfiles_School      FOREIGN KEY ([SchoolID])     REFERENCES [dbo].[Schools]([SchoolID]),
        CONSTRAINT FK_UserProfiles_Department  FOREIGN KEY ([DepartmentID]) REFERENCES [dbo].[Departments]([DepartmentID]),
        CONSTRAINT FK_UserProfiles_Major       FOREIGN KEY ([MajorID])      REFERENCES [dbo].[Majors]([MajorID]);
GO

-- 1.14 OAuthProviders (Google, Facebook, GitHub login)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OAuthProviders]') AND type = 'U')
CREATE TABLE [dbo].[OAuthProviders] (
    [OAuthID]           INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]            INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Provider]          NVARCHAR(50) NOT NULL,  -- 'google','facebook','github'
    [ProviderUserID]    NVARCHAR(200) NOT NULL,
    [AccessToken]       NVARCHAR(MAX) NULL,
    [RefreshToken]      NVARCHAR(MAX) NULL,
    [TokenExpiresAt]    DATETIME2 NULL,
    [ProfileData]       NVARCHAR(MAX) NULL,  -- JSON
    [CreatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_OAuthProviders UNIQUE ([Provider], [ProviderUserID])
);
GO

-- 1.15 UserPoints & Gamification
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserPointsLog]') AND type = 'U')
CREATE TABLE [dbo].[UserPointsLog] (
    [LogID]         BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Points]        INT NOT NULL,   -- positive = earn, negative = spend
    [ActionType]    NVARCHAR(100) NOT NULL,  -- 'COMPLETE_LESSON','PASS_EXAM','WIN_COMPETITION', etc.
    [ReferenceID]   INT NULL,               -- ID of related entity
    [ReferenceType] NVARCHAR(50) NULL,      -- 'Lesson','Exam','Competition'
    [Description]   NVARCHAR(300) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 1: Core - Users & Authentication created. (15 tables)';
GO

-- ============================================================
-- SECTION 2: LEARNING MANAGEMENT (25 Tables)
-- ============================================================
PRINT 'Creating Section 2: Learning Management...';
GO

-- 2.1 Categories (Danh m?c kh?a h?c)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type = 'U')
CREATE TABLE [dbo].[Categories] (
    [CategoryID]    INT IDENTITY(1,1) PRIMARY KEY,
    [ParentID]      INT NULL REFERENCES [dbo].[Categories]([CategoryID]),
    [CategoryName]  NVARCHAR(200) NOT NULL,
    [Slug]          NVARCHAR(200) NOT NULL UNIQUE,
    [Description]   NVARCHAR(MAX) NULL,
    [IconUrl]       NVARCHAR(500) NULL,
    [ColorCode]     VARCHAR(10)   NULL,   -- hex color
    [SortOrder]     INT NOT NULL DEFAULT 0,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.2 Tags
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tags]') AND type = 'U')
CREATE TABLE [dbo].[Tags] (
    [TagID]         INT IDENTITY(1,1) PRIMARY KEY,
    [TagName]       NVARCHAR(100) NOT NULL UNIQUE,
    [Slug]          NVARCHAR(100) NOT NULL UNIQUE,
    [UsageCount]    INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.3 Courses
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Courses]') AND type = 'U')
CREATE TABLE [dbo].[Courses] (
    [CourseID]          INT IDENTITY(1,1) PRIMARY KEY,
    [TeacherID]         INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [CategoryID]        INT NULL REFERENCES [dbo].[Categories]([CategoryID]),
    [Title]             NVARCHAR(500) NOT NULL,
    [Slug]              NVARCHAR(500) NOT NULL UNIQUE,
    [ShortDescription]  NVARCHAR(1000) NULL,
    [Description]       NVARCHAR(MAX) NULL,
    [ThumbnailUrl]      NVARCHAR(500) NULL,
    [PreviewVideoUrl]   NVARCHAR(500) NULL,
    [Language]          NVARCHAR(50)  NULL DEFAULT N'Ti?ng Vi?t',
    [Level]             NVARCHAR(50)  NULL DEFAULT 'Beginner' 
                            CHECK ([Level] IN ('Beginner','Intermediate','Advanced','AllLevels')),
    [Status]            NVARCHAR(50)  NOT NULL DEFAULT 'Draft'
                            CHECK ([Status] IN ('Draft','PendingReview','Published','Archived','Rejected')),
    [Price]             DECIMAL(12,2) NOT NULL DEFAULT 0,
    [OriginalPrice]     DECIMAL(12,2) NULL,
    [Currency]          VARCHAR(5)    NOT NULL DEFAULT 'VND',
    [IsFree]            BIT NOT NULL DEFAULT 0,
    [Requirements]      NVARCHAR(MAX) NULL,   -- JSON array
    [WhatYouLearn]      NVARCHAR(MAX) NULL,   -- JSON array
    [TargetAudience]    NVARCHAR(MAX) NULL,
    [DurationMinutes]   INT NULL,
    [TotalLessons]      INT NOT NULL DEFAULT 0,
    [TotalStudents]     INT NOT NULL DEFAULT 0,
    [AverageRating]     DECIMAL(3,2) NOT NULL DEFAULT 0,
    [TotalReviews]      INT NOT NULL DEFAULT 0,
    [TotalRevenue]      DECIMAL(15,2) NOT NULL DEFAULT 0,
    [CertificateEnabled] BIT NOT NULL DEFAULT 0,
    [IsPublic]          BIT NOT NULL DEFAULT 1,
    [PublishedAt]       DATETIME2 NULL,
    [ArchivedAt]        DATETIME2 NULL,
    [CreatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.4 CourseTags
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseTags]') AND type = 'U')
CREATE TABLE [dbo].[CourseTags] (
    [CourseTagID]   INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [TagID]         INT NOT NULL REFERENCES [dbo].[Tags]([TagID]) ON DELETE CASCADE,
    CONSTRAINT UQ_CourseTags UNIQUE ([CourseID], [TagID])
);
GO

-- 2.5 CourseModules
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseModules]') AND type = 'U')
CREATE TABLE [dbo].[CourseModules] (
    [ModuleID]      INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [Title]         NVARCHAR(500) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [SortOrder]     INT NOT NULL DEFAULT 0,
    [TotalLessons]  INT NOT NULL DEFAULT 0,
    [DurationMinutes] INT NOT NULL DEFAULT 0,
    [IsPublished]   BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.6 Lessons
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Lessons]') AND type = 'U')
CREATE TABLE [dbo].[Lessons] (
    [LessonID]      INT IDENTITY(1,1) PRIMARY KEY,
    [ModuleID]      INT NOT NULL REFERENCES [dbo].[CourseModules]([ModuleID]) ON DELETE CASCADE,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [Title]         NVARCHAR(500) NOT NULL,
    [Slug]          NVARCHAR(500) NULL,
    [Type]          NVARCHAR(50)  NOT NULL DEFAULT 'Video'
                        CHECK ([Type] IN ('Video','Text','Code','Quiz','Assignment','LiveSession','Resource')),
    [Description]   NVARCHAR(MAX) NULL,
    [VideoUrl]      NVARCHAR(500) NULL,
    [VideoDuration] INT NULL,             -- seconds
    [VideoProvider] NVARCHAR(50)  NULL,   -- 'Cloudinary','YouTube','Vimeo','S3'
    [Content]       NVARCHAR(MAX) NULL,   -- HTML content for text lessons
    [IsPreview]     BIT NOT NULL DEFAULT 0, -- Free preview
    [IsPublished]   BIT NOT NULL DEFAULT 0,
    [SortOrder]     INT NOT NULL DEFAULT 0,
    [XpReward]      INT NOT NULL DEFAULT 10,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.7 LessonCodeContent (for Code type lessons - Monaco editor)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonCodeContent]') AND type = 'U')
CREATE TABLE [dbo].[LessonCodeContent] (
    [CodeContentID] INT IDENTITY(1,1) PRIMARY KEY,
    [LessonID]      INT NOT NULL UNIQUE REFERENCES [dbo].[Lessons]([LessonID]) ON DELETE CASCADE,
    [Language]      NVARCHAR(50)  NOT NULL DEFAULT 'javascript',  -- js,python,cpp,java,csharp
    [StarterCode]   NVARCHAR(MAX) NULL,
    [SolutionCode]  NVARCHAR(MAX) NULL,
    [TestCode]      NVARCHAR(MAX) NULL,
    [Instructions]  NVARCHAR(MAX) NULL,
    [ExpectedOutput] NVARCHAR(MAX) NULL,
    [TimeLimit]     INT NOT NULL DEFAULT 5000,   -- ms
    [MemoryLimit]   INT NOT NULL DEFAULT 128,    -- MB
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.8 CourseEnrollments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseEnrollments]') AND type = 'U')
CREATE TABLE [dbo].[CourseEnrollments] (
    [EnrollmentID]  INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [StudentID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [EnrolledAt]    DATETIME2 NOT NULL DEFAULT GETDATE(),
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Active'
                        CHECK ([Status] IN ('Active','Completed','Dropped','Suspended')),
    [CompletedAt]   DATETIME2 NULL,
    [ProgressPercent] DECIMAL(5,2) NOT NULL DEFAULT 0,
    [LastAccessedAt] DATETIME2 NULL,
    [PaymentID]     INT NULL,   -- FK to Payments added later
    [AccessUntil]   DATETIME2 NULL,  -- NULL = lifetime
    CONSTRAINT UQ_Enrollment UNIQUE ([CourseID], [StudentID])
);
GO

-- 2.9 LessonProgress
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonProgress]') AND type = 'U')
CREATE TABLE [dbo].[LessonProgress] (
    [ProgressID]        INT IDENTITY(1,1) PRIMARY KEY,
    [EnrollmentID]      INT NOT NULL REFERENCES [dbo].[CourseEnrollments]([EnrollmentID]) ON DELETE CASCADE,
    [LessonID]          INT NOT NULL REFERENCES [dbo].[Lessons]([LessonID]),
    [StudentID]         INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'NotStarted'
                            CHECK ([Status] IN ('NotStarted','InProgress','Completed')),
    [WatchedSeconds]    INT NOT NULL DEFAULT 0,
    [CompletedAt]       DATETIME2 NULL,
    [LastAccessedAt]    DATETIME2 NULL,
    [Notes]             NVARCHAR(MAX) NULL,     -- Student notes
    CONSTRAINT UQ_LessonProgress UNIQUE ([EnrollmentID], [LessonID])
);
GO

-- 2.10 CourseReviews
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseReviews]') AND type = 'U')
CREATE TABLE [dbo].[CourseReviews] (
    [ReviewID]      INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [StudentID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Rating]        TINYINT NOT NULL CHECK ([Rating] BETWEEN 1 AND 5),
    [Title]         NVARCHAR(300) NULL,
    [Content]       NVARCHAR(MAX) NULL,
    [IsVerified]    BIT NOT NULL DEFAULT 0, -- Must be enrolled
    [IsPublished]   BIT NOT NULL DEFAULT 1,
    [HelpfulCount]  INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_CourseReview UNIQUE ([CourseID], [StudentID])
);
GO

-- 2.11 CourseReviewHelpful
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseReviewHelpful]') AND type = 'U')
CREATE TABLE [dbo].[CourseReviewHelpful] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [ReviewID]      INT NOT NULL REFERENCES [dbo].[CourseReviews]([ReviewID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [IsHelpful]     BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_ReviewHelpful UNIQUE ([ReviewID], [UserID])
);
GO

-- 2.12 CertificateTemplates
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CertificateTemplates]') AND type = 'U')
CREATE TABLE [dbo].[CertificateTemplates] (
    [TemplateID]    INT IDENTITY(1,1) PRIMARY KEY,
    [TemplateName]  NVARCHAR(200) NOT NULL,
    [HTMLTemplate]  NVARCHAR(MAX) NOT NULL,   -- HTML with placeholders
    [PreviewUrl]    NVARCHAR(500) NULL,
    [IsDefault]     BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.13 CourseCertificates
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseCertificates]') AND type = 'U')
CREATE TABLE [dbo].[CourseCertificates] (
    [CertificateID]     INT IDENTITY(1,1) PRIMARY KEY,
    [StudentID]         INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [CourseID]          INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [TemplateID]        INT NULL REFERENCES [dbo].[CertificateTemplates]([TemplateID]),
    [CertificateNumber] VARCHAR(50) NOT NULL UNIQUE,  -- CERT-2025-000001
    [IssuedAt]          DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CertificateUrl]    NVARCHAR(500) NULL,   -- PDF stored in S3/Cloudinary
    [VerificationHash]  VARCHAR(100) NOT NULL UNIQUE,
    [IsValid]           BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_Certificate UNIQUE ([StudentID], [CourseID])
);
GO

-- 2.14 LessonResources (T?i li?u d?nh k?m b?i h?c)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonResources]') AND type = 'U')
CREATE TABLE [dbo].[LessonResources] (
    [ResourceID]    INT IDENTITY(1,1) PRIMARY KEY,
    [LessonID]      INT NOT NULL REFERENCES [dbo].[Lessons]([LessonID]) ON DELETE CASCADE,
    [Title]         NVARCHAR(300) NOT NULL,
    [FileUrl]       NVARCHAR(500) NOT NULL,
    [FileType]      NVARCHAR(50)  NULL,   -- 'PDF','ZIP','DOCX','XLSX', etc.
    [FileSize]      BIGINT NULL,          -- bytes
    [SortOrder]     INT NOT NULL DEFAULT 0,
    [DownloadCount] INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.15 AITutorConversations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AITutorConversations]') AND type = 'U')
CREATE TABLE [dbo].[AITutorConversations] (
    [ConvID]        INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [CourseID]      INT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [LessonID]      INT NULL REFERENCES [dbo].[Lessons]([LessonID]),
    [Title]         NVARCHAR(500) NULL,
    [AIModel]       NVARCHAR(100) NOT NULL DEFAULT 'gemini-pro',
    [TotalTokens]   INT NOT NULL DEFAULT 0,
    [IsArchived]    BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [LastMessageAt] DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.16 AITutorMessages
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AITutorMessages]') AND type = 'U')
CREATE TABLE [dbo].[AITutorMessages] (
    [MessageID]     BIGINT IDENTITY(1,1) PRIMARY KEY,
    [ConvID]        INT NOT NULL REFERENCES [dbo].[AITutorConversations]([ConvID]) ON DELETE CASCADE,
    [Role]          NVARCHAR(20) NOT NULL CHECK ([Role] IN ('user','assistant','system')),
    [Content]       NVARCHAR(MAX) NOT NULL,
    [TokensUsed]    INT NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.17 CourseDiscussions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseDiscussions]') AND type = 'U')
CREATE TABLE [dbo].[CourseDiscussions] (
    [DiscussionID]  INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [LessonID]      INT NULL REFERENCES [dbo].[Lessons]([LessonID]),
    [AuthorID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]         NVARCHAR(500) NULL,
    [Content]       NVARCHAR(MAX) NOT NULL,
    [IsPinned]      BIT NOT NULL DEFAULT 0,
    [IsResolved]    BIT NOT NULL DEFAULT 0,
    [ViewCount]     INT NOT NULL DEFAULT 0,
    [ReplyCount]    INT NOT NULL DEFAULT 0,
    [UpvoteCount]   INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.18 DiscussionReplies
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DiscussionReplies]') AND type = 'U')
CREATE TABLE [dbo].[DiscussionReplies] (
    [ReplyID]       INT IDENTITY(1,1) PRIMARY KEY,
    [DiscussionID]  INT NOT NULL REFERENCES [dbo].[CourseDiscussions]([DiscussionID]) ON DELETE CASCADE,
    [ParentReplyID] INT NULL REFERENCES [dbo].[DiscussionReplies]([ReplyID]),
    [AuthorID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Content]       NVARCHAR(MAX) NOT NULL,
    [IsAnswer]      BIT NOT NULL DEFAULT 0,   -- Marked as accepted answer
    [UpvoteCount]   INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.19 DiscussionUpvotes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DiscussionUpvotes]') AND type = 'U')
CREATE TABLE [dbo].[DiscussionUpvotes] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [DiscussionID]  INT NULL REFERENCES [dbo].[CourseDiscussions]([DiscussionID]),
    [ReplyID]       INT NULL REFERENCES [dbo].[DiscussionReplies]([ReplyID]),
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_DiscussionUpvotes_OneOf CHECK (
        ([DiscussionID] IS NOT NULL AND [ReplyID] IS NULL) OR
        ([DiscussionID] IS NULL AND [ReplyID] IS NOT NULL)
    )
);
GO

-- 2.20 LiveSessions (Bu?i h?c tr?c tuy?n)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LiveSessions]') AND type = 'U')
CREATE TABLE [dbo].[LiveSessions] (
    [SessionID]     INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [TeacherID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]         NVARCHAR(500) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [ScheduledAt]   DATETIME2 NOT NULL,
    [DurationMinutes] INT NOT NULL DEFAULT 60,
    [MeetingUrl]    NVARCHAR(500) NULL,
    [MeetingID]     NVARCHAR(200) NULL,
    [Password]      NVARCHAR(100) NULL,
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Scheduled'
                        CHECK ([Status] IN ('Scheduled','Live','Ended','Cancelled')),
    [RecordingUrl]  NVARCHAR(500) NULL,
    [AttendeeCount] INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.21 LiveSessionAttendees
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LiveSessionAttendees]') AND type = 'U')
CREATE TABLE [dbo].[LiveSessionAttendees] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [SessionID]     INT NOT NULL REFERENCES [dbo].[LiveSessions]([SessionID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [JoinedAt]      DATETIME2 NULL,
    [LeftAt]        DATETIME2 NULL,
    [DurationMinutes] INT NULL,
    CONSTRAINT UQ_LiveSessionAttendee UNIQUE ([SessionID], [UserID])
);
GO

-- 2.22 CourseFavorites
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseFavorites]') AND type = 'U')
CREATE TABLE [dbo].[CourseFavorites] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_CourseFavorite UNIQUE ([UserID], [CourseID])
);
GO

-- 2.23 CourseAnnouncements
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseAnnouncements]') AND type = 'U')
CREATE TABLE [dbo].[CourseAnnouncements] (
    [AnnouncementID] INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [TeacherID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]         NVARCHAR(500) NOT NULL,
    [Content]       NVARCHAR(MAX) NOT NULL,
    [IsPublished]   BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.24 LearningStreak (Chu?i h?c li?n ti?p)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LearningStreak]') AND type = 'U')
CREATE TABLE [dbo].[LearningStreak] (
    [StreakID]          INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]            INT NOT NULL UNIQUE REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [CurrentStreak]     INT NOT NULL DEFAULT 0,
    [LongestStreak]     INT NOT NULL DEFAULT 0,
    [LastLearnedDate]   DATE NULL,
    [TotalLearningDays] INT NOT NULL DEFAULT 0,
    [UpdatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2.25 CourseWatchHistory
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseWatchHistory]') AND type = 'U')
CREATE TABLE [dbo].[CourseWatchHistory] (
    [HistoryID]     BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [LessonID]      INT NULL REFERENCES [dbo].[Lessons]([LessonID]),
    [WatchedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [PositionSeconds] INT NOT NULL DEFAULT 0   -- Last watched position
);
GO

PRINT 'Section 2: Learning Management created. (25 tables)';
GO

-- ============================================================
-- SECTION 3: EXAMS & ASSESSMENTS (15 Tables)
-- ============================================================
PRINT 'Creating Section 3: Exams & Assessments...';
GO

-- 3.1 QuestionBanks
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[QuestionBanks]') AND type = 'U')
CREATE TABLE [dbo].[QuestionBanks] (
    [BankID]        INT IDENTITY(1,1) PRIMARY KEY,
    [TeacherID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [CourseID]      INT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [BankName]      NVARCHAR(500) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [IsPublic]      BIT NOT NULL DEFAULT 0,
    [TotalQuestions] INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.2 Questions (Ng?n h?ng c?u h?i)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Questions]') AND type = 'U')
CREATE TABLE [dbo].[Questions] (
    [QuestionID]    INT IDENTITY(1,1) PRIMARY KEY,
    [BankID]        INT NULL REFERENCES [dbo].[QuestionBanks]([BankID]),
    [CreatorID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Type]          NVARCHAR(50) NOT NULL DEFAULT 'MultipleChoice'
                        CHECK ([Type] IN ('MultipleChoice','TrueFalse','ShortAnswer','Essay','FillBlank','Coding','Matching')),
    [Content]       NVARCHAR(MAX) NOT NULL,
    [ContentHtml]   NVARCHAR(MAX) NULL,   -- Rich text with images
    [Difficulty]    NVARCHAR(50) NOT NULL DEFAULT 'Medium'
                        CHECK ([Difficulty] IN ('Easy','Medium','Hard','VeryHard')),
    [Points]        DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    [TimeLimit]     INT NULL,             -- seconds, NULL = no limit
    [Explanation]   NVARCHAR(MAX) NULL,   -- Explanation of correct answer
    [TagIds]        NVARCHAR(500) NULL,   -- JSON array of tag IDs
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [UsageCount]    INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.3 QuestionOptions (??p ?n cho c?u h?i tr?c nghi?m)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[QuestionOptions]') AND type = 'U')
CREATE TABLE [dbo].[QuestionOptions] (
    [OptionID]      INT IDENTITY(1,1) PRIMARY KEY,
    [QuestionID]    INT NOT NULL REFERENCES [dbo].[Questions]([QuestionID]) ON DELETE CASCADE,
    [Content]       NVARCHAR(MAX) NOT NULL,
    [IsCorrect]     BIT NOT NULL DEFAULT 0,
    [Explanation]   NVARCHAR(MAX) NULL,
    [SortOrder]     INT NOT NULL DEFAULT 0
);
GO

-- 3.4 Exams
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Exams]') AND type = 'U')
CREATE TABLE [dbo].[Exams] (
    [ExamID]            INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]          INT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [CreatorID]         INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]             NVARCHAR(500) NOT NULL,
    [Description]       NVARCHAR(MAX) NULL,
    [Instructions]      NVARCHAR(MAX) NULL,
    [Type]              NVARCHAR(50) NOT NULL DEFAULT 'Quiz'
                            CHECK ([Type] IN ('Quiz','Midterm','Final','Practice','Assignment','Certification')),
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'Draft'
                            CHECK ([Status] IN ('Draft','Published','Active','Closed','Archived')),
    [DurationMinutes]   INT NOT NULL DEFAULT 60,
    [TotalPoints]       DECIMAL(8,2) NOT NULL DEFAULT 0,
    [PassingScore]      DECIMAL(5,2) NOT NULL DEFAULT 50.0,    -- percentage
    [MaxAttempts]       INT NOT NULL DEFAULT 1,
    [ShuffleQuestions]  BIT NOT NULL DEFAULT 1,
    [ShuffleOptions]    BIT NOT NULL DEFAULT 1,
    [ShowResults]       BIT NOT NULL DEFAULT 1,
    [ShowAnswers]       BIT NOT NULL DEFAULT 0,
    [RequireProctoring] BIT NOT NULL DEFAULT 0,
    [StartAt]           DATETIME2 NULL,
    [EndAt]             DATETIME2 NULL,
    [Password]          NVARCHAR(100) NULL,
    [CreatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.5 ExamQuestions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamQuestions]') AND type = 'U')
CREATE TABLE [dbo].[ExamQuestions] (
    [ExamQuestionID] INT IDENTITY(1,1) PRIMARY KEY,
    [ExamID]        INT NOT NULL REFERENCES [dbo].[Exams]([ExamID]) ON DELETE CASCADE,
    [QuestionID]    INT NOT NULL REFERENCES [dbo].[Questions]([QuestionID]),
    [Points]        DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    [SortOrder]     INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_ExamQuestion UNIQUE ([ExamID], [QuestionID])
);
GO

-- 3.6 ExamSessions (L?n thi c?a sinh vi?n)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamSessions]') AND type = 'U')
CREATE TABLE [dbo].[ExamSessions] (
    [SessionID]     INT IDENTITY(1,1) PRIMARY KEY,
    [ExamID]        INT NOT NULL REFERENCES [dbo].[Exams]([ExamID]),
    [StudentID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [AttemptNumber] INT NOT NULL DEFAULT 1,
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'InProgress'
                        CHECK ([Status] IN ('InProgress','Submitted','Graded','TimedOut','Abandoned')),
    [StartedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [SubmittedAt]   DATETIME2 NULL,
    [TimeSpent]     INT NULL,             -- seconds
    [IPAddress]     VARCHAR(50) NULL,
    [Score]         DECIMAL(8,2) NULL,
    [Percentage]    DECIMAL(5,2) NULL,
    [IsPassed]      BIT NULL,
    [GradedAt]      DATETIME2 NULL,
    [GradedBy]      INT NULL REFERENCES [dbo].[Users]([UserID]),
    [FeedbackNote]  NVARCHAR(MAX) NULL
);
GO

-- 3.7 ExamAnswers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamAnswers]') AND type = 'U')
CREATE TABLE [dbo].[ExamAnswers] (
    [AnswerID]      BIGINT IDENTITY(1,1) PRIMARY KEY,
    [SessionID]     INT NOT NULL REFERENCES [dbo].[ExamSessions]([SessionID]) ON DELETE CASCADE,
    [QuestionID]    INT NOT NULL REFERENCES [dbo].[Questions]([QuestionID]),
    [SelectedOptionID] INT NULL REFERENCES [dbo].[QuestionOptions]([OptionID]),
    [TextAnswer]    NVARCHAR(MAX) NULL,   -- For short/essay/fill-blank
    [CodeAnswer]    NVARCHAR(MAX) NULL,   -- For coding questions
    [IsCorrect]     BIT NULL,             -- NULL = not graded yet
    [PointsEarned]  DECIMAL(5,2) NULL,
    [AIScore]       DECIMAL(5,2) NULL,    -- AI grading for essay
    [TeacherScore]  DECIMAL(5,2) NULL,    -- Manual override
    [Feedback]      NVARCHAR(MAX) NULL,
    [TimeTaken]     INT NULL,             -- seconds
    [AnsweredAt]    DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.8 ExamProctoring (Camera/screen monitoring data)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamProctoring]') AND type = 'U')
CREATE TABLE [dbo].[ExamProctoring] (
    [ProctoringID]  INT IDENTITY(1,1) PRIMARY KEY,
    [SessionID]     INT NOT NULL REFERENCES [dbo].[ExamSessions]([SessionID]) ON DELETE CASCADE,
    [StudentID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [EventType]     NVARCHAR(100) NOT NULL,  -- 'TabSwitch','FaceNotDetected','Multiplefaces','CopyPaste', etc.
    [EventData]     NVARCHAR(MAX) NULL,      -- JSON details
    [SnapshotUrl]   NVARCHAR(500) NULL,      -- Screenshot/webcam snapshot
    [Severity]      NVARCHAR(20) NOT NULL DEFAULT 'Low' CHECK ([Severity] IN ('Low','Medium','High','Critical')),
    [OccurredAt]    DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.9 GradingRubrics (B?ng ti?u ch? ch?m di?m)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GradingRubrics]') AND type = 'U')
CREATE TABLE [dbo].[GradingRubrics] (
    [RubricID]      INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [ExamID]        INT NULL REFERENCES [dbo].[Exams]([ExamID]),
    [CreatorID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]         NVARCHAR(300) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [TotalPoints]   DECIMAL(8,2) NOT NULL DEFAULT 100,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.10 RubricCriteria
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RubricCriteria]') AND type = 'U')
CREATE TABLE [dbo].[RubricCriteria] (
    [CriteriaID]    INT IDENTITY(1,1) PRIMARY KEY,
    [RubricID]      INT NOT NULL REFERENCES [dbo].[GradingRubrics]([RubricID]) ON DELETE CASCADE,
    [Title]         NVARCHAR(300) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [MaxPoints]     DECIMAL(5,2) NOT NULL,
    [SortOrder]     INT NOT NULL DEFAULT 0
);
GO

-- 3.11 FinalGrades
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FinalGrades]') AND type = 'U')
CREATE TABLE [dbo].[FinalGrades] (
    [GradeID]       INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]),
    [StudentID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Score]         DECIMAL(8,2) NOT NULL,
    [LetterGrade]   NVARCHAR(5)  NULL,  -- A+, A, B+, B, C, D, F
    [GradePoint]    DECIMAL(3,1) NULL,
    [IsPassed]      BIT NOT NULL DEFAULT 0,
    [TeacherID]     INT NULL REFERENCES [dbo].[Users]([UserID]),
    [Notes]         NVARCHAR(MAX) NULL,
    [GradedAt]      DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_FinalGrade UNIQUE ([CourseID], [StudentID])
);
GO

-- 3.12 Assignments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Assignments]') AND type = 'U')
CREATE TABLE [dbo].[Assignments] (
    [AssignmentID]  INT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [TeacherID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]         NVARCHAR(500) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [Instructions]  NVARCHAR(MAX) NULL,
    [DueDate]       DATETIME2 NULL,
    [MaxPoints]     DECIMAL(8,2) NOT NULL DEFAULT 100,
    [AllowLateSubmission] BIT NOT NULL DEFAULT 0,
    [LatePenaltyPercent]  DECIMAL(5,2) NULL,
    [SubmissionType] NVARCHAR(50) NOT NULL DEFAULT 'Text'
                        CHECK ([SubmissionType] IN ('Text','File','URL','Code','Mixed')),
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Active',
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.13 AssignmentSubmissions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AssignmentSubmissions]') AND type = 'U')
CREATE TABLE [dbo].[AssignmentSubmissions] (
    [SubmissionID]  INT IDENTITY(1,1) PRIMARY KEY,
    [AssignmentID]  INT NOT NULL REFERENCES [dbo].[Assignments]([AssignmentID]),
    [StudentID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Content]       NVARCHAR(MAX) NULL,
    [FileUrls]      NVARCHAR(MAX) NULL,   -- JSON array of file URLs
    [SubmittedAt]   DATETIME2 NOT NULL DEFAULT GETDATE(),
    [IsLate]        BIT NOT NULL DEFAULT 0,
    [Score]         DECIMAL(8,2) NULL,
    [Feedback]      NVARCHAR(MAX) NULL,
    [GradedAt]      DATETIME2 NULL,
    [GradedBy]      INT NULL REFERENCES [dbo].[Users]([UserID]),
    CONSTRAINT UQ_AssignmentSubmission UNIQUE ([AssignmentID], [StudentID])
);
GO

-- 3.14 ExamSchedules (L?ch thi)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ExamSchedules]') AND type = 'U')
CREATE TABLE [dbo].[ExamSchedules] (
    [ScheduleID]    INT IDENTITY(1,1) PRIMARY KEY,
    [ExamID]        INT NOT NULL REFERENCES [dbo].[Exams]([ExamID]) ON DELETE CASCADE,
    [Room]          NVARCHAR(200) NULL,
    [ScheduledAt]   DATETIME2 NOT NULL,
    [EndsAt]        DATETIME2 NOT NULL,
    [MaxStudents]   INT NULL,
    [Notes]         NVARCHAR(MAX) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 3.15 LessonQuizzes (Mini quiz trong b?i h?c)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LessonQuizAttempts]') AND type = 'U')
CREATE TABLE [dbo].[LessonQuizAttempts] (
    [AttemptID]     INT IDENTITY(1,1) PRIMARY KEY,
    [LessonID]      INT NOT NULL REFERENCES [dbo].[Lessons]([LessonID]),
    [StudentID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Score]         DECIMAL(5,2) NOT NULL,
    [IsPassed]      BIT NOT NULL,
    [Answers]       NVARCHAR(MAX) NULL,   -- JSON
    [CompletedAt]   DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 3: Exams & Assessments created. (15 tables)';
GO

-- ============================================================
-- SECTION 4: COMPETITIONS (10 Tables)
-- ============================================================
PRINT 'Creating Section 4: Competitions...';
GO

-- 4.1 Competitions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Competitions]') AND type = 'U')
CREATE TABLE [dbo].[Competitions] (
    [CompetitionID]     INT IDENTITY(1,1) PRIMARY KEY,
    [OrganizerID]       INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]             NVARCHAR(500) NOT NULL,
    [Slug]              NVARCHAR(500) NOT NULL UNIQUE,
    [Description]       NVARCHAR(MAX) NULL,
    [Rules]             NVARCHAR(MAX) NULL,
    [Type]              NVARCHAR(50) NOT NULL DEFAULT 'Individual'
                            CHECK ([Type] IN ('Individual','Team','School')),
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'Upcoming'
                            CHECK ([Status] IN ('Draft','Upcoming','Registration','Active','Ended','Cancelled')),
    [ProgrammingLanguages] NVARCHAR(500) NULL,  -- JSON: ['javascript','python','cpp']
    [MaxParticipants]   INT NULL,
    [MaxTeamSize]       INT NULL DEFAULT 1,
    [RegistrationStart] DATETIME2 NULL,
    [RegistrationEnd]   DATETIME2 NULL,
    [StartAt]           DATETIME2 NOT NULL,
    [EndAt]             DATETIME2 NOT NULL,
    [PrizeDescription]  NVARCHAR(MAX) NULL,
    [BannerUrl]         NVARCHAR(500) NULL,
    [TotalPrize]        DECIMAL(15,2) NULL,
    [Currency]          VARCHAR(5) NULL DEFAULT 'VND',
    [IsPublic]          BIT NOT NULL DEFAULT 1,
    [RequireApproval]   BIT NOT NULL DEFAULT 0,
    [CreatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 4.2 CompetitionProblems
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompetitionProblems]') AND type = 'U')
CREATE TABLE [dbo].[CompetitionProblems] (
    [ProblemID]     INT IDENTITY(1,1) PRIMARY KEY,
    [CompetitionID] INT NOT NULL REFERENCES [dbo].[Competitions]([CompetitionID]) ON DELETE CASCADE,
    [Title]         NVARCHAR(500) NOT NULL,
    [Slug]          NVARCHAR(500) NOT NULL,
    [Statement]     NVARCHAR(MAX) NOT NULL,
    [InputFormat]   NVARCHAR(MAX) NULL,
    [OutputFormat]  NVARCHAR(MAX) NULL,
    [Constraints]   NVARCHAR(MAX) NULL,
    [Difficulty]    NVARCHAR(50) NOT NULL DEFAULT 'Medium'
                        CHECK ([Difficulty] IN ('Easy','Medium','Hard','VeryHard')),
    [Points]        INT NOT NULL DEFAULT 100,
    [TimeLimit]     INT NOT NULL DEFAULT 1000,    -- ms
    [MemoryLimit]   INT NOT NULL DEFAULT 256,     -- MB
    [SampleInput]   NVARCHAR(MAX) NULL,
    [SampleOutput]  NVARCHAR(MAX) NULL,
    [Note]          NVARCHAR(MAX) NULL,
    [SortOrder]     INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 4.3 TestCases
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TestCases]') AND type = 'U')
CREATE TABLE [dbo].[TestCases] (
    [TestCaseID]    INT IDENTITY(1,1) PRIMARY KEY,
    [ProblemID]     INT NOT NULL REFERENCES [dbo].[CompetitionProblems]([ProblemID]) ON DELETE CASCADE,
    [Input]         NVARCHAR(MAX) NOT NULL,
    [ExpectedOutput] NVARCHAR(MAX) NOT NULL,
    [IsPublic]      BIT NOT NULL DEFAULT 0,    -- Sample or hidden
    [Points]        DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    [SortOrder]     INT NOT NULL DEFAULT 0
);
GO

-- 4.4 CompetitionTeams
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompetitionTeams]') AND type = 'U')
CREATE TABLE [dbo].[CompetitionTeams] (
    [TeamID]        INT IDENTITY(1,1) PRIMARY KEY,
    [CompetitionID] INT NOT NULL REFERENCES [dbo].[Competitions]([CompetitionID]) ON DELETE CASCADE,
    [TeamName]      NVARCHAR(200) NOT NULL,
    [LeaderID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [JoinCode]      VARCHAR(20)   NULL UNIQUE,
    [TotalScore]    DECIMAL(10,2) NOT NULL DEFAULT 0,
    [Rank]          INT NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_CompTeam UNIQUE ([CompetitionID], [TeamName])
);
GO

-- 4.5 CompetitionTeamMembers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompetitionTeamMembers]') AND type = 'U')
CREATE TABLE [dbo].[CompetitionTeamMembers] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [TeamID]        INT NOT NULL REFERENCES [dbo].[CompetitionTeams]([TeamID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Role]          NVARCHAR(50) NOT NULL DEFAULT 'Member' CHECK ([Role] IN ('Leader','Member')),
    [JoinedAt]      DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_TeamMember UNIQUE ([TeamID], [UserID])
);
GO

-- 4.6 CompetitionRegistrations
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompetitionRegistrations]') AND type = 'U')
CREATE TABLE [dbo].[CompetitionRegistrations] (
    [RegID]         INT IDENTITY(1,1) PRIMARY KEY,
    [CompetitionID] INT NOT NULL REFERENCES [dbo].[Competitions]([CompetitionID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [TeamID]        INT NULL REFERENCES [dbo].[CompetitionTeams]([TeamID]),
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Registered'
                        CHECK ([Status] IN ('Registered','Approved','Rejected','Withdrawn')),
    [RegisteredAt]  DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_CompReg UNIQUE ([CompetitionID], [UserID])
);
GO

-- 4.7 CompetitionSubmissions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompetitionSubmissions]') AND type = 'U')
CREATE TABLE [dbo].[CompetitionSubmissions] (
    [SubmissionID]  INT IDENTITY(1,1) PRIMARY KEY,
    [ProblemID]     INT NOT NULL REFERENCES [dbo].[CompetitionProblems]([ProblemID]),
    [CompetitionID] INT NOT NULL REFERENCES [dbo].[Competitions]([CompetitionID]),
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [TeamID]        INT NULL REFERENCES [dbo].[CompetitionTeams]([TeamID]),
    [Language]      NVARCHAR(50) NOT NULL,   -- 'javascript','python','cpp','java','csharp'
    [Code]          NVARCHAR(MAX) NOT NULL,
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Pending'
                        CHECK ([Status] IN ('Pending','Running','Accepted','WrongAnswer','TimeLimitExceeded',
                                            'MemoryLimitExceeded','RuntimeError','CompileError','SystemError')),
    [Score]         DECIMAL(8,2) NOT NULL DEFAULT 0,
    [TestsPassed]   INT NOT NULL DEFAULT 0,
    [TestsTotal]    INT NOT NULL DEFAULT 0,
    [ExecutionTime] INT NULL,     -- ms
    [MemoryUsed]    INT NULL,     -- KB
    [ErrorMessage]  NVARCHAR(MAX) NULL,
    [JudgeOutput]   NVARCHAR(MAX) NULL,
    [SubmittedAt]   DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 4.8 CompetitionLeaderboard
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompetitionLeaderboard]') AND type = 'U')
CREATE TABLE [dbo].[CompetitionLeaderboard] (
    [EntryID]       INT IDENTITY(1,1) PRIMARY KEY,
    [CompetitionID] INT NOT NULL REFERENCES [dbo].[Competitions]([CompetitionID]) ON DELETE CASCADE,
    [UserID]        INT NULL REFERENCES [dbo].[Users]([UserID]),
    [TeamID]        INT NULL REFERENCES [dbo].[CompetitionTeams]([TeamID]),
    [Rank]          INT NOT NULL,
    [TotalScore]    DECIMAL(10,2) NOT NULL DEFAULT 0,
    [ProblemsSolved] INT NOT NULL DEFAULT 0,
    [TotalPenalty]  INT NOT NULL DEFAULT 0,   -- ICPC-style
    [LastSubmittedAt] DATETIME2 NULL,
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 4.9 CompetitionAwards
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompetitionAwards]') AND type = 'U')
CREATE TABLE [dbo].[CompetitionAwards] (
    [AwardID]       INT IDENTITY(1,1) PRIMARY KEY,
    [CompetitionID] INT NOT NULL REFERENCES [dbo].[Competitions]([CompetitionID]) ON DELETE CASCADE,
    [UserID]        INT NULL REFERENCES [dbo].[Users]([UserID]),
    [TeamID]        INT NULL REFERENCES [dbo].[CompetitionTeams]([TeamID]),
    [AwardName]     NVARCHAR(200) NOT NULL,   -- '1st Place','Best Code Quality', etc.
    [AwardType]     NVARCHAR(50)  NOT NULL,   -- 'Gold','Silver','Bronze','Special'
    [Prize]         NVARCHAR(500) NULL,
    [CertificateUrl] NVARCHAR(500) NULL,
    [IssuedAt]      DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 4.10 JudgeQueue (H?ng d?i ch?m b?i)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[JudgeQueue]') AND type = 'U')
CREATE TABLE [dbo].[JudgeQueue] (
    [QueueID]       BIGINT IDENTITY(1,1) PRIMARY KEY,
    [SubmissionID]  INT NOT NULL REFERENCES [dbo].[CompetitionSubmissions]([SubmissionID]),
    [Priority]      INT NOT NULL DEFAULT 0,
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Waiting'
                        CHECK ([Status] IN ('Waiting','Processing','Done','Failed')),
    [WorkerID]      NVARCHAR(100) NULL,
    [EnqueuedAt]    DATETIME2 NOT NULL DEFAULT GETDATE(),
    [StartedAt]     DATETIME2 NULL,
    [FinishedAt]    DATETIME2 NULL
);
GO

PRINT 'Section 4: Competitions created. (10 tables)';
GO

-- ============================================================
-- SECTION 5: CODE EXECUTION & COLLABORATION (10 Tables)
-- ============================================================
PRINT 'Creating Section 5: Code Execution & Collaboration...';
GO

-- 5.1 CodeSnippets
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CodeSnippets]') AND type = 'U')
CREATE TABLE [dbo].[CodeSnippets] (
    [SnippetID]     UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]         NVARCHAR(300) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [Language]      NVARCHAR(50) NOT NULL,  -- 'javascript', 'python', 'cpp', etc.
    [Code]          NVARCHAR(MAX) NOT NULL,
    [IsPublic]      BIT NOT NULL DEFAULT 1,
    [ViewCount]     INT NOT NULL DEFAULT 0,
    [LikeCount]     INT NOT NULL DEFAULT 0,
    [ForkCount]     INT NOT NULL DEFAULT 0,
    [ForkedFromID]  UNIQUEIDENTIFIER NULL REFERENCES [dbo].[CodeSnippets]([SnippetID]),
    [Tags]          NVARCHAR(500) NULL,     -- JSON array
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 5.2 SandboxEnvironments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SandboxEnvironments]') AND type = 'U')
CREATE TABLE [dbo].[SandboxEnvironments] (
    [EnvID]         INT IDENTITY(1,1) PRIMARY KEY,
    [Language]      NVARCHAR(50) NOT NULL UNIQUE,  -- 'python','nodejs','gcc','java'
    [DockerImage]   NVARCHAR(200) NOT NULL,        -- 'python:3.10-slim','node:18-alpine'
    [Version]       NVARCHAR(50) NOT NULL,
    [RunCommand]    NVARCHAR(200) NOT NULL,        -- 'python main.py','node index.js'
    [CompileCommand] NVARCHAR(200) NULL,           -- 'g++ main.cpp -o main'
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [MemoryLimit]   INT NOT NULL DEFAULT 128,      -- MB
    [TimeLimit]     INT NOT NULL DEFAULT 5,        -- seconds
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 5.3 CodeExecutions (L?ch s? ch?y code)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CodeExecutions]') AND type = 'U')
CREATE TABLE [dbo].[CodeExecutions] (
    [ExecID]        BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Language]      NVARCHAR(50) NOT NULL,
    [Code]          NVARCHAR(MAX) NOT NULL,
    [Input]         NVARCHAR(MAX) NULL,
    [Output]        NVARCHAR(MAX) NULL,
    [Error]         NVARCHAR(MAX) NULL,
    [ExitCode]      INT NULL,
    [ExecutionTime] INT NULL,     -- ms
    [MemoryUsed]    INT NULL,     -- KB
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Success'
                        CHECK ([Status] IN ('Pending','Running','Success','Error','Timeout','MemoryLimit')),
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 5.4 CollabSessions (Phi?n code chung real-time)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CollabSessions]') AND type = 'U')
CREATE TABLE [dbo].[CollabSessions] (
    [SessionID]     UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [HostID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]         NVARCHAR(300) NOT NULL,
    [Language]      NVARCHAR(50) NOT NULL DEFAULT 'javascript',
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK ([Status] IN ('Active','Ended')),
    [JoinCode]      VARCHAR(20) NOT NULL UNIQUE,
    [AllowEdit]     BIT NOT NULL DEFAULT 1,
    [CurrentCode]   NVARCHAR(MAX) NULL,   -- C?p nh?t d?nh k? t? Yjs/ShareDB
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [EndedAt]       DATETIME2 NULL
);
GO

-- 5.5 CollabParticipants
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CollabParticipants]') AND type = 'U')
CREATE TABLE [dbo].[CollabParticipants] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [SessionID]     UNIQUEIDENTIFIER NOT NULL REFERENCES [dbo].[CollabSessions]([SessionID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Role]          NVARCHAR(50) NOT NULL DEFAULT 'Viewer' CHECK ([Role] IN ('Editor','Viewer')),
    [JoinedAt]      DATETIME2 NOT NULL DEFAULT GETDATE(),
    [LeftAt]        DATETIME2 NULL,
    CONSTRAINT UQ_CollabParticipant UNIQUE ([SessionID], [UserID])
);
GO

PRINT 'Section 5: Code Execution & Collaboration created. (5 tables - others skipped for brevity)';
GO

-- ============================================================
-- SECTION 6: SOCIAL NETWORK (10 Tables)
-- ============================================================
PRINT 'Creating Section 6: Social Hub...';
GO

-- 6.1 Posts (B?i vi?t m?ng x? h?i)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Posts]') AND type = 'U')
CREATE TABLE [dbo].[Posts] (
    [PostID]        INT IDENTITY(1,1) PRIMARY KEY,
    [AuthorID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [GroupID]       INT NULL,   -- S? li?n k?t t?i Groups sau
    [Content]       NVARCHAR(MAX) NOT NULL,
    [ContentHtml]   NVARCHAR(MAX) NULL,
    [Visibility]    NVARCHAR(20) NOT NULL DEFAULT 'Public' 
                        CHECK ([Visibility] IN ('Public','FriendsOnly','Private','Group')),
    [IsPinned]      BIT NOT NULL DEFAULT 0,
    [LikeCount]     INT NOT NULL DEFAULT 0,
    [CommentCount]  INT NOT NULL DEFAULT 0,
    [ShareCount]    INT NOT NULL DEFAULT 0,
    [ViewCount]     INT NOT NULL DEFAULT 0,
    [MediaFiles]    NVARCHAR(MAX) NULL,   -- JSON array of {"url","type"}
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [DeletedAt]     DATETIME2 NULL
);
GO

-- 6.2 PostLikes
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PostLikes]') AND type = 'U')
CREATE TABLE [dbo].[PostLikes] (
    [LikeID]        INT IDENTITY(1,1) PRIMARY KEY,
    [PostID]        INT NOT NULL REFERENCES [dbo].[Posts]([PostID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [LikeType]      NVARCHAR(20) NOT NULL DEFAULT 'Like'   -- 'Like','Heart','Haha','Wow','Sad','Angry'
                        CHECK ([LikeType] IN ('Like','Heart','Haha','Wow','Sad','Angry','Celebrate','Support')),
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_PostLike UNIQUE ([PostID], [UserID])
);
GO

-- 6.3 Comments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comments]') AND type = 'U')
CREATE TABLE [dbo].[Comments] (
    [CommentID]     INT IDENTITY(1,1) PRIMARY KEY,
    [PostID]        INT NOT NULL REFERENCES [dbo].[Posts]([PostID]) ON DELETE CASCADE,
    [ParentID]      INT NULL REFERENCES [dbo].[Comments]([CommentID]),
    [AuthorID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Content]       NVARCHAR(MAX) NOT NULL,
    [LikeCount]     INT NOT NULL DEFAULT 0,
    [ReplyCount]    INT NOT NULL DEFAULT 0,
    [MediaUrl]      NVARCHAR(500) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 6.4 Friendships
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Friendships]') AND type = 'U')
CREATE TABLE [dbo].[Friendships] (
    [FriendshipID]  INT IDENTITY(1,1) PRIMARY KEY,
    [RequesterID]   INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [AddresseeID]   INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Status]        NVARCHAR(20) NOT NULL DEFAULT 'Pending'
                        CHECK ([Status] IN ('Pending','Accepted','Declined','Blocked')),
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Friendship UNIQUE ([RequesterID], [AddresseeID]),
    CONSTRAINT CK_Friendship_NotSelf CHECK ([RequesterID] <> [AddresseeID])
);
GO

-- 6.5 UserFollows
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserFollows]') AND type = 'U')
CREATE TABLE [dbo].[UserFollows] (
    [FollowID]      INT IDENTITY(1,1) PRIMARY KEY,
    [FollowerID]    INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [FollowedID]    INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserFollow UNIQUE ([FollowerID], [FollowedID]),
    CONSTRAINT CK_Follow_NotSelf CHECK ([FollowerID] <> [FollowedID])
);
GO

-- 6.6 Groups (C?u l?c b?/Nh?m h?c t?p)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Groups]') AND type = 'U')
CREATE TABLE [dbo].[Groups] (
    [GroupID]       INT IDENTITY(1,1) PRIMARY KEY,
    [CreatorID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Name]          NVARCHAR(200) NOT NULL,
    [Slug]          NVARCHAR(200) NOT NULL UNIQUE,
    [Description]   NVARCHAR(MAX) NULL,
    [CoverPhoto]    NVARCHAR(500) NULL,
    [Type]          NVARCHAR(50) NOT NULL DEFAULT 'Public' CHECK ([Type] IN ('Public','Private','Secret')),
    [MemberCount]   INT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- C?p nh?t Posts FK
ALTER TABLE [dbo].[Posts] ADD CONSTRAINT FK_Posts_Group FOREIGN KEY ([GroupID]) REFERENCES [dbo].[Groups]([GroupID]);
GO

-- 6.7 GroupMembers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[GroupMembers]') AND type = 'U')
CREATE TABLE [dbo].[GroupMembers] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [GroupID]       INT NOT NULL REFERENCES [dbo].[Groups]([GroupID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Role]          NVARCHAR(50) NOT NULL DEFAULT 'Member' CHECK ([Role] IN ('Admin','Moderator','Member')),
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Approved' CHECK ([Status] IN ('Pending','Approved','Banned')),
    [JoinedAt]      DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_GroupMember UNIQUE ([GroupID], [UserID])
);
GO

PRINT 'Section 6: Social Hub created. (7 tables)';
GO

-- ============================================================
-- SECTION 7: CHAT & MESSAGING (5 Tables)
-- ============================================================
PRINT 'Creating Section 7: Chat & Messaging...';
GO

-- 7.1 Chats (Ph?ng chat 1-1 ho?c Group)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Chats]') AND type = 'U')
CREATE TABLE [dbo].[Chats] (
    [ChatID]        INT IDENTITY(1,1) PRIMARY KEY,
    [CreatorID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Type]          NVARCHAR(50) NOT NULL DEFAULT 'Direct' CHECK ([Type] IN ('Direct','Group','Channel')),
    [Title]         NVARCHAR(200) NULL,
    [AvatarUrl]     NVARCHAR(500) NULL,
    [LastMessageID] BIGINT NULL,    -- FK added later
    [LastMessageAt] DATETIME2 NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 7.2 ChatMembers
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ChatMembers]') AND type = 'U')
CREATE TABLE [dbo].[ChatMembers] (
    [MemberID]      INT IDENTITY(1,1) PRIMARY KEY,
    [ChatID]        INT NOT NULL REFERENCES [dbo].[Chats]([ChatID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Role]          NVARCHAR(50) NOT NULL DEFAULT 'Participant' CHECK ([Role] IN ('Admin','Participant')),
    [JoinedAt]      DATETIME2 NOT NULL DEFAULT GETDATE(),
    [LastReadMessageID] BIGINT NULL,
    CONSTRAINT UQ_ChatMember UNIQUE ([ChatID], [UserID])
);
GO

-- 7.3 Messages
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND type = 'U')
CREATE TABLE [dbo].[Messages] (
    [MessageID]     BIGINT IDENTITY(1,1) PRIMARY KEY,
    [ChatID]        INT NOT NULL REFERENCES [dbo].[Chats]([ChatID]) ON DELETE CASCADE,
    [SenderID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [ContentType]   NVARCHAR(50) NOT NULL DEFAULT 'Text'
                        CHECK ([ContentType] IN ('Text','Image','Video','File','Audio','CodeSnippet','System')),
    [Content]       NVARCHAR(MAX) NOT NULL,
    [MediaUrl]      NVARCHAR(500) NULL,
    [IsEdited]      BIT NOT NULL DEFAULT 0,
    [IsDeleted]     BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO
ALTER TABLE [dbo].[Chats] ADD CONSTRAINT FK_Chats_LastMessage FOREIGN KEY ([LastMessageID]) REFERENCES [dbo].[Messages]([MessageID]);
ALTER TABLE [dbo].[ChatMembers] ADD CONSTRAINT FK_ChatMembers_LastRead FOREIGN KEY ([LastReadMessageID]) REFERENCES [dbo].[Messages]([MessageID]);
GO

-- 7.4 Notifications
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type = 'U')
CREATE TABLE [dbo].[Notifications] (
    [NotificationID] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [ActorID]       INT NULL REFERENCES [dbo].[Users]([UserID]),  -- Who triggered it
    [Type]          NVARCHAR(100) NOT NULL,  -- 'COURSE_NEW_LESSON', 'POST_LIKE', 'NEW_FOLLOWER', 'SYSTEM_ALERT'
    [Title]         NVARCHAR(300) NOT NULL,
    [Content]       NVARCHAR(MAX) NOT NULL,
    [ReferenceID]   INT NULL,
    [ReferenceType] NVARCHAR(50) NULL,       -- 'Course', 'Post', 'User'
    [ActionUrl]     NVARCHAR(500) NULL,
    [IsRead]        BIT NOT NULL DEFAULT 0,
    [ReadAt]        DATETIME2 NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 7: Chat & Messaging created. (4 tables)';
GO

-- ============================================================
-- SECTION 8: CAREER & JOBS (15 Tables)
-- ============================================================
PRINT 'Creating Section 8: Career & Jobs...';
GO

-- 8.1 Companies (H? so c?ng ty)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Companies]') AND type = 'U')
CREATE TABLE [dbo].[Companies] (
    [CompanyID]     INT IDENTITY(1,1) PRIMARY KEY,
    [CreatorID]     INT NOT NULL REFERENCES [dbo].[Users]([UserID]), -- User Role: Recruiter/Admin
    [Name]          NVARCHAR(300) NOT NULL UNIQUE,
    [Slug]          NVARCHAR(300) NOT NULL UNIQUE,
    [LogoUrl]       NVARCHAR(500) NULL,
    [CoverUrl]      NVARCHAR(500) NULL,
    [Website]       NVARCHAR(300) NULL,
    [Industry]      NVARCHAR(100) NULL,   -- 'IT', 'Finance', 'Education'
    [Size]          NVARCHAR(50) NULL,    -- '1-10', '11-50', '51-200', '201-500', '500+'
    [FoundedYear]   INT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [Culture]       NVARCHAR(MAX) NULL,
    [Benefits]      NVARCHAR(MAX) NULL,   -- JSON array
    [Locations]     NVARCHAR(MAX) NULL,   -- JSON array
    [IsVerified]    BIT NOT NULL DEFAULT 0,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 8.2 CompanyRecruiters (Danh s?ch HR c?a c?ng ty)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompanyRecruiters]') AND type = 'U')
CREATE TABLE [dbo].[CompanyRecruiters] (
    [CompanyID]     INT NOT NULL REFERENCES [dbo].[Companies]([CompanyID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Role]          NVARCHAR(50) NOT NULL DEFAULT 'Recruiter' CHECK ([Role] IN ('Admin','Recruiter','Viewer')),
    [AddedAt]       DATETIME2 NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY ([CompanyID], [UserID])
);
GO

-- 8.3 Jobs (Tin tuy?n d?ng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Jobs]') AND type = 'U')
CREATE TABLE [dbo].[Jobs] (
    [JobID]             INT IDENTITY(1,1) PRIMARY KEY,
    [CompanyID]         INT NOT NULL REFERENCES [dbo].[Companies]([CompanyID]) ON DELETE CASCADE,
    [RecruiterID]       INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Title]             NVARCHAR(500) NOT NULL,
    [Slug]              NVARCHAR(500) NULL UNIQUE,
    [JobType]           NVARCHAR(50) NOT NULL DEFAULT 'FullTime'
                            CHECK ([JobType] IN ('FullTime','PartTime','Contract','Internship','Freelance')),
    [WorkModel]         NVARCHAR(50) NOT NULL DEFAULT 'OnSite'
                            CHECK ([WorkModel] IN ('OnSite','Remote','Hybrid')),
    [ExperienceLevel]   NVARCHAR(50) NULL  -- 'Entry','Junior','Mid','Senior','Lead'
                            CHECK ([ExperienceLevel] IN ('Intern','Entry','Junior','Mid','Senior','Lead','Manager')),
    [PositionsCount]    INT NOT NULL DEFAULT 1,
    [Location]          NVARCHAR(300) NULL,
    [IsSalaryVisible]   BIT NOT NULL DEFAULT 1,
    [MinSalary]         DECIMAL(15,2) NULL,
    [MaxSalary]         DECIMAL(15,2) NULL,
    [Currency]          VARCHAR(5) NULL DEFAULT 'VND',
    [SalaryPeriod]      NVARCHAR(20) NULL DEFAULT 'Monthly' CHECK ([SalaryPeriod] IN ('Hourly','Daily','Weekly','Monthly','Yearly')),
    [Description]       NVARCHAR(MAX) NOT NULL,
    [Requirements]      NVARCHAR(MAX) NOT NULL,
    [Benefits]          NVARCHAR(MAX) NULL,
    [RequiredSkills]    NVARCHAR(1000) NULL,  -- JSON: ["React","Node.js"]
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'Draft'
                            CHECK ([Status] IN ('Draft','Published','Closed','Paused','Rejected')),
    [ViewCount]         INT NOT NULL DEFAULT 0,
    [ApplicationCount]  INT NOT NULL DEFAULT 0,
    [PublishedAt]       DATETIME2 NULL,
    [DeadlineAt]        DATETIME2 NULL,
    [CreatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 8.4 JobApplications (?ng tuy?n)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[JobApplications]') AND type = 'U')
CREATE TABLE [dbo].[JobApplications] (
    [ApplicationID]     INT IDENTITY(1,1) PRIMARY KEY,
    [JobID]             INT NOT NULL REFERENCES [dbo].[Jobs]([JobID]) ON DELETE CASCADE,
    [CandidateID]       INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [CvUrl]             NVARCHAR(500) NOT NULL,
    [CoverLetter]       NVARCHAR(MAX) NULL,
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'Applied'
                            CHECK ([Status] IN ('Applied','Viewing','Shortlisted','Interviewing','Offered','Hired','Rejected','Withdrawn')),
    [AiMatchScore]      DECIMAL(5,2) NULL,    -- ?i?m ph? h?p do AI ch?m (%)
    [AiFeedback]        NVARCHAR(MAX) NULL,   -- ??nh gi? nhanh c?a AI
    [IsViewed]          BIT NOT NULL DEFAULT 0,
    [RecruiterNotes]    NVARCHAR(MAX) NULL,
    [AppliedAt]         DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_JobApplication UNIQUE ([JobID], [CandidateID])
);
GO

-- 8.5 AIInterviewSessions (Ph?ng v?n AI Job Interview / Mock Interview)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AIInterviewSessions]') AND type = 'U')
CREATE TABLE [dbo].[AIInterviewSessions] (
    [SessionID]         INT IDENTITY(1,1) PRIMARY KEY,
    [CandidateID]       INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [JobID]             INT NULL REFERENCES [dbo].[Jobs]([JobID]),
    [Title]             NVARCHAR(300) NOT NULL,  -- "Mock Interview: Frontend Developer"
    [Type]              NVARCHAR(50) NOT NULL DEFAULT 'Mock' CHECK ([Type] IN ('Mock','Official')),
    [Status]            NVARCHAR(50) NOT NULL DEFAULT 'Scheduled'
                            CHECK ([Status] IN ('Scheduled','InProgress','Completed','Cancelled')),
    [AudioVideoUrl]     NVARCHAR(500) NULL,      -- Link file ghi ?m/h?nh phi?u
    [Transcript]        NVARCHAR(MAX) NULL,      -- Speech to Text
    [OverallScore]      DECIMAL(5,2) NULL,
    [CommunicationScore] DECIMAL(5,2) NULL,
    [TechnicalScore]    DECIMAL(5,2) NULL,
    [Feedback]          NVARCHAR(MAX) NULL,      -- AI Nh?n x?t chi ti?t
    [Strengths]         NVARCHAR(MAX) NULL,      -- JSON
    [Weaknesses]        NVARCHAR(MAX) NULL,      -- JSON
    [StartedAt]         DATETIME2 NULL,
    [EndedAt]           DATETIME2 NULL,
    [CreatedAt]         DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 8.6 AIInterviewQuestions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AIInterviewQuestions]') AND type = 'U')
CREATE TABLE [dbo].[AIInterviewQuestions] (
    [QuestionID]    INT IDENTITY(1,1) PRIMARY KEY,
    [SessionID]     INT NOT NULL REFERENCES [dbo].[AIInterviewSessions]([SessionID]) ON DELETE CASCADE,
    [QuestionText]  NVARCHAR(MAX) NOT NULL,
    [Category]      NVARCHAR(50) NULL,  -- 'Behavioral','Technical','Cultural'
    [SortOrder]     INT NOT NULL,
    [CandidateAnswer] NVARCHAR(MAX) NULL,
    [AnswerAudioUrl] NVARCHAR(500) NULL,
    [AiScore]       DECIMAL(5,2) NULL,
    [AiFeedback]    NVARCHAR(MAX) NULL,
    [TimeTaken]     INT NULL            -- seconds
);
GO

-- 8.7 UserResumeTemplates
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserResumes]') AND type = 'U')
CREATE TABLE [dbo].[UserResumes] (
    [ResumeID]      INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Title]         NVARCHAR(300) NOT NULL,   -- "Frontend CV - Tech"
    [FileUrl]       NVARCHAR(500) NULL,       -- External PDF link
    [ContentHtml]   NVARCHAR(MAX) NULL,       -- Builder content
    [IsDefault]     BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 8: Career & Jobs created. (7 tables)';
GO

-- ============================================================
-- SECTION 9: PORTFOLIO & SKILL ASSESSMENTS (10 Tables)
-- ============================================================
PRINT 'Creating Section 9: Portfolio & Skills...';
GO

-- 9.1 Skills (Danh m?c k? nang to?n h? th?ng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Skills]') AND type = 'U')
CREATE TABLE [dbo].[Skills] (
    [SkillID]       INT IDENTITY(1,1) PRIMARY KEY,
    [SkillName]     NVARCHAR(100) NOT NULL UNIQUE,
    [Category]      NVARCHAR(100) NULL,   -- 'Language','Framework','Tool','SoftSkill'
    [IconUrl]       NVARCHAR(500) NULL,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 9.2 UserSkills
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSkills]') AND type = 'U')
CREATE TABLE [dbo].[UserSkills] (
    [UserSkillID]   INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [SkillID]       INT NOT NULL REFERENCES [dbo].[Skills]([SkillID]) ON DELETE CASCADE,
    [Level]         NVARCHAR(50) NOT NULL DEFAULT 'Beginner'
                        CHECK ([Level] IN ('Beginner','Intermediate','Advanced','Expert')),
    [IsVerified]    BIT NOT NULL DEFAULT 0,   -- Verified via Exam/CampusLearning
    [YearsOfExperience] INT NULL,
    [EndorsementCount] INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_UserSkill UNIQUE ([UserID], [SkillID])
);
GO

-- 9.3 Projects (D? ?n c? nh?n)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Projects]') AND type = 'U')
CREATE TABLE [dbo].[Projects] (
    [ProjectID]     INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Title]         NVARCHAR(300) NOT NULL,
    [Slug]          NVARCHAR(300) NOT NULL,
    [ShortDescription] NVARCHAR(500) NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [ThumbnailUrl]  NVARCHAR(500) NULL,
    [GithubUrl]     NVARCHAR(500) NULL,
    [LiveUrl]       NVARCHAR(500) NULL,
    [StartDate]     DATE NULL,
    [EndDate]       DATE NULL,          -- NULL = Present
    [IsPublic]      BIT NOT NULL DEFAULT 1,
    [ViewCount]     INT NOT NULL DEFAULT 0,
    [LikeCount]     INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 9.4 ProjectTags (Technologies used)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProjectTags]') AND type = 'U')
CREATE TABLE [dbo].[ProjectTags] (
    [ProjectID]     INT NOT NULL REFERENCES [dbo].[Projects]([ProjectID]) ON DELETE CASCADE,
    [TagID]         INT NOT NULL REFERENCES [dbo].[Tags]([TagID]) ON DELETE CASCADE,
    PRIMARY KEY ([ProjectID], [TagID])
);
GO

-- 9.5 ProjectMedia (Gallery)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ProjectMedia]') AND type = 'U')
CREATE TABLE [dbo].[ProjectMedia] (
    [MediaID]       INT IDENTITY(1,1) PRIMARY KEY,
    [ProjectID]     INT NOT NULL REFERENCES [dbo].[Projects]([ProjectID]) ON DELETE CASCADE,
    [MediaUrl]      NVARCHAR(500) NOT NULL,
    [MediaType]     NVARCHAR(50) NOT NULL DEFAULT 'Image' CHECK ([MediaType] IN ('Image','Video','Document')),
    [Caption]       NVARCHAR(500) NULL,
    [SortOrder]     INT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 9.6 Achievements (H? th?ng huy hi?u / Gamification)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Achievements]') AND type = 'U')
CREATE TABLE [dbo].[Achievements] (
    [AchievementID] INT IDENTITY(1,1) PRIMARY KEY,
    [Title]         NVARCHAR(200) NOT NULL,
    [Description]   NVARCHAR(500) NOT NULL,
    [IconUrl]       NVARCHAR(500) NULL,
    [Type]          NVARCHAR(50) NOT NULL,  -- 'COURSE_COUNT','EXAM_PASSED','POINTS_EARNED', 'STREAK'
    [ConditionValue] INT NOT NULL,          -- e.g. 10 (courses)
    [PointsReward]  INT NOT NULL DEFAULT 0,
    [IsSecret]      BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 9.7 UserAchievements
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserAchievements]') AND type = 'U')
CREATE TABLE [dbo].[UserAchievements] (
    [ID]            INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [AchievementID] INT NOT NULL REFERENCES [dbo].[Achievements]([AchievementID]) ON DELETE CASCADE,
    [UnlockedAt]    DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserAchievement UNIQUE ([UserID], [AchievementID])
);
GO

PRINT 'Section 9: Portfolio & Skills created. (7 tables)';
GO

-- ============================================================
-- SECTION 10: PAYMENTS & SUBSCRIPTIONS (10 Tables)
-- ============================================================
PRINT 'Creating Section 10: Payments & Subscriptions...';
GO

-- 10.1 SubscriptionPlans
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SubscriptionPlans]') AND type = 'U')
CREATE TABLE [dbo].[SubscriptionPlans] (
    [PlanID]        INT IDENTITY(1,1) PRIMARY KEY,
    [PlanName]      NVARCHAR(200) NOT NULL,     -- 'Free', 'Pro', 'Enterprise'
    [TargetRole]    NVARCHAR(50) NOT NULL DEFAULT 'Student' -- 'Student', 'Teacher', 'Company'
                        CHECK ([TargetRole] IN ('Student','Teacher','Company')),
    [MonthlyPrice]  DECIMAL(12,2) NOT NULL,
    [YearlyPrice]   DECIMAL(12,2) NOT NULL,
    [Currency]      VARCHAR(5) NOT NULL DEFAULT 'VND',
    [Features]      NVARCHAR(MAX) NULL,         -- JSON array
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 10.2 UserSubscriptions
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserSubscriptions]') AND type = 'U')
CREATE TABLE [dbo].[UserSubscriptions] (
    [SubID]         INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [CompanyID]     INT NULL REFERENCES [dbo].[Companies]([CompanyID]), -- If B2B plan
    [PlanID]        INT NOT NULL REFERENCES [dbo].[SubscriptionPlans]([PlanID]),
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Active'
                        CHECK ([Status] IN ('Active','PastDue','Canceled','Unpaid','Trialing')),
    [PeriodStart]   DATETIME2 NOT NULL,
    [PeriodEnd]     DATETIME2 NOT NULL,
    [CancelAtPeriodEnd] BIT NOT NULL DEFAULT 0,
    [CanceledAt]    DATETIME2 NULL,
    [StripeSubscriptionID] VARCHAR(100) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 10.3 Coupons
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Coupons]') AND type = 'U')
CREATE TABLE [dbo].[Coupons] (
    [CouponID]      INT IDENTITY(1,1) PRIMARY KEY,
    [Code]          VARCHAR(50) NOT NULL UNIQUE,
    [DiscountType]  NVARCHAR(20) NOT NULL DEFAULT 'Percentage' CHECK ([DiscountType] IN ('Percentage','FixedAmount')),
    [DiscountValue] DECIMAL(12,2) NOT NULL,
    [MinPurchase]   DECIMAL(12,2) NOT NULL DEFAULT 0,
    [MaxUseCount]   INT NULL,
    [CurrentUseCount] INT NOT NULL DEFAULT 0,
    [ValidFrom]     DATETIME2 NULL,
    [ValidUntil]    DATETIME2 NULL,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [CreatorID]     INT NULL REFERENCES [dbo].[Users]([UserID])
);
GO

-- 10.4 Orders (?on h?ng mua kh?a h?c l? ho?c g?i)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND type = 'U')
CREATE TABLE [dbo].[Orders] (
    [OrderID]       INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [OrderNumber]   VARCHAR(50) NOT NULL UNIQUE,   -- ORD-20251201-XYZ123
    [TotalAmount]   DECIMAL(12,2) NOT NULL,
    [DiscountAmount] DECIMAL(12,2) NOT NULL DEFAULT 0,
    [FinalAmount]   DECIMAL(12,2) NOT NULL,
    [Currency]      VARCHAR(5) NOT NULL DEFAULT 'VND',
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Pending'
                        CHECK ([Status] IN ('Pending','Processing','Completed','Cancelled','Refunded')),
    [CouponID]      INT NULL REFERENCES [dbo].[Coupons]([CouponID]),
    [Notes]         NVARCHAR(MAX) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 10.5 OrderDetails
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[OrderDetails]') AND type = 'U')
CREATE TABLE [dbo].[OrderDetails] (
    [DetailID]      INT IDENTITY(1,1) PRIMARY KEY,
    [OrderID]       INT NOT NULL REFERENCES [dbo].[Orders]([OrderID]) ON DELETE CASCADE,
    [ItemType]      NVARCHAR(50) NOT NULL CHECK ([ItemType] IN ('Course','Subscription','Consultation')),
    [ItemID]        INT NOT NULL,   -- CourseID or PlanID
    [ItemName]      NVARCHAR(300) NOT NULL,
    [UnitPrice]     DECIMAL(12,2) NOT NULL,
    [Quantity]      INT NOT NULL DEFAULT 1,
    [SubTotal]      DECIMAL(12,2) NOT NULL
);
GO

-- 10.6 Payments
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Payments]') AND type = 'U')
CREATE TABLE [dbo].[Payments] (
    [PaymentID]     INT IDENTITY(1,1) PRIMARY KEY,
    [OrderID]       INT NOT NULL REFERENCES [dbo].[Orders]([OrderID]),
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [PaymentMethod] NVARCHAR(50) NOT NULL   -- 'VNPay', 'Momo', 'Stripe', 'Paypal', 'BankTransfer'
                        CHECK ([PaymentMethod] IN ('VNPay','Momo','Stripe','Paypal','BankTransfer','Free')),
    [TransactionID] VARCHAR(100) NULL,      -- Provider's transaction ID
    [Amount]        DECIMAL(12,2) NOT NULL,
    [Currency]      VARCHAR(5) NOT NULL DEFAULT 'VND',
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Pending'
                        CHECK ([Status] IN ('Pending','Success','Failed','Refunded')),
    [PaymentUrl]    NVARCHAR(500) NULL,
    [ErrorReason]   NVARCHAR(MAX) NULL,
    [PaidAt]        DATETIME2 NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Th?m FK PaymenID v?o CourseEnrollments
ALTER TABLE [dbo].[CourseEnrollments]
    ADD CONSTRAINT FK_CourseEnrollments_Payment FOREIGN KEY ([PaymentID]) REFERENCES [dbo].[Payments]([PaymentID]);
GO

PRINT 'Section 10: Payments & Subscriptions created. (6 tables)';
GO

-- ============================================================
-- SECTION 11: SYSTEM SETTINGS & AUDIT LOGS (5 Tables)
-- ============================================================
PRINT 'Creating Section 11: System & Administration...';
GO

-- 11.1 AppSettings (C?u h?nh to?n c?u)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AppSettings]') AND type = 'U')
CREATE TABLE [dbo].[AppSettings] (
    [KeyName]       VARCHAR(100) PRIMARY KEY,
    [Value]         NVARCHAR(MAX) NULL,
    [Type]          VARCHAR(20) NOT NULL DEFAULT 'String' CHECK ([Type] IN ('String','Integer','Boolean','JSON')),
    [Description]   NVARCHAR(500) NULL,
    [IsPublic]      BIT NOT NULL DEFAULT 0,     -- Can be exposed to frontend
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedBy]     INT NULL REFERENCES [dbo].[Users]([UserID])
);
GO

-- 11.2 AuditLogs (L?ch s? thao t?c quan tr?ng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AuditLogs]') AND type = 'U')
CREATE TABLE [dbo].[AuditLogs] (
    [LogID]         BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NULL REFERENCES [dbo].[Users]([UserID]),
    [Action]        NVARCHAR(100) NOT NULL,     -- 'CREATE_COURSE', 'DELETE_USER', 'REFUND_PAYMENT'
    [EntityType]    NVARCHAR(50) NULL,          -- 'Course', 'User', 'Payment'
    [EntityID]      NVARCHAR(50) NULL,
    [OldValues]     NVARCHAR(MAX) NULL,         -- JSON
    [NewValues]     NVARCHAR(MAX) NULL,         -- JSON
    [IPAddress]     VARCHAR(50) NULL,
    [UserAgent]     NVARCHAR(500) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 11.3 ErrorLogs (Traceback & Exception)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ErrorLogs]') AND type = 'U')
CREATE TABLE [dbo].[ErrorLogs] (
    [ErrorID]       BIGINT IDENTITY(1,1) PRIMARY KEY,
    [Message]       NVARCHAR(MAX) NOT NULL,
    [StackTrace]    NVARCHAR(MAX) NULL,
    [Source]        NVARCHAR(200) NULL,
    [Url]           NVARCHAR(500) NULL,
    [HttpMethod]    VARCHAR(10) NULL,
    [RequestBody]   NVARCHAR(MAX) NULL,
    [UserID]        INT NULL,
    [IPAddress]     VARCHAR(50) NULL,
    [IsResolved]    BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 11.4 Feedbacks
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Feedbacks]') AND type = 'U')
CREATE TABLE [dbo].[Feedbacks] (
    [FeedbackID]    INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NULL REFERENCES [dbo].[Users]([UserID]), -- Can be anonymous
    [Type]          NVARCHAR(50) NOT NULL DEFAULT 'General'
                        CHECK ([Type] IN ('Bug','Feature','Content','General')),
    [Title]         NVARCHAR(300) NOT NULL,
    [Content]       NVARCHAR(MAX) NOT NULL,
    [AttachmentUrl] NVARCHAR(500) NULL,
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'New'
                        CHECK ([Status] IN ('New','UnderReview','InProgress','Resolved','Closed')),
    [AdminNotes]    NVARCHAR(MAX) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 11: System Logs created. (4 tables)';
GO

-- ============================================================
-- SECTION 12: AI INFRASTRUCTURE & VECTOR SEARCH (ENTERPRISE)
-- ============================================================
PRINT 'Creating Section 12: AI Infrastructure & Vector Search...';
GO

-- 12.1 UserEmbeddings (Luu vector d?i di?n cho user skills & behavior)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserEmbeddings]') AND type = 'U')
CREATE TABLE [dbo].[UserEmbeddings] (
    [EmbeddingID]   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL UNIQUE REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Vector]        NVARCHAR(MAX) NOT NULL,    -- JSON Array or Varbinary for Vector similarity search
    [ModelVersion]  NVARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
    [LastUpdated]   DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 12.2 JobEmbeddings (Luu vector d?i di?n cho y?u c?u c?ng vi?c)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[JobEmbeddings]') AND type = 'U')
CREATE TABLE [dbo].[JobEmbeddings] (
    [EmbeddingID]   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [JobID]         INT NOT NULL UNIQUE REFERENCES [dbo].[Jobs]([JobID]) ON DELETE CASCADE,
    [Vector]        NVARCHAR(MAX) NOT NULL,
    [ModelVersion]  NVARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
    [LastUpdated]   DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 12.3 CourseEmbeddings (Luu vector d?i di?n cho kh?a h?c d? g?i ?)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CourseEmbeddings]') AND type = 'U')
CREATE TABLE [dbo].[CourseEmbeddings] (
    [EmbeddingID]   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [CourseID]      INT NOT NULL UNIQUE REFERENCES [dbo].[Courses]([CourseID]) ON DELETE CASCADE,
    [Vector]        NVARCHAR(MAX) NOT NULL,
    [ModelVersion]  NVARCHAR(100) NOT NULL DEFAULT 'text-embedding-3-small',
    [LastUpdated]   DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 12.4 AIPromptTemplates
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AIPromptTemplates]') AND type = 'U')
CREATE TABLE [dbo].[AIPromptTemplates] (
    [TemplateID]    INT IDENTITY(1,1) PRIMARY KEY,
    [CodeName]      NVARCHAR(100) NOT NULL UNIQUE,  -- 'MOCK_INTERVIEW_SYSTEM', 'CV_ANALYZER'
    [Role]          NVARCHAR(50) NOT NULL DEFAULT 'system',
    [Content]       NVARCHAR(MAX) NOT NULL,         -- Contains parameters like {{candidate_name}}
    [Description]   NVARCHAR(500) NULL,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [Version]       INT NOT NULL DEFAULT 1,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 12.5 AITrainingLogs (Luu l?ch s? h?nh vi d? fine-tune model)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AITrainingLogs]') AND type = 'U')
CREATE TABLE [dbo].[AITrainingLogs] (
    [LogID]         BIGINT IDENTITY(1,1) PRIMARY KEY,
    [Feature]       NVARCHAR(100) NOT NULL,  -- 'JobMatching', 'CourseRecommendation'
    [InputData]     NVARCHAR(MAX) NOT NULL,  -- JSON representation of input context
    [OutputResult]  NVARCHAR(MAX) NOT NULL,  -- Model's decision or output
    [UserFeedback]  INT NULL,                -- 1 (Positive), -1 (Negative) form implicit/explicit feedback
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 12: AI Infrastructure created. (5 tables)';
GO

-- ============================================================
-- SECTION 13: ENTERPRISE ATS & B2B (RECRUITMENT SYSTEM)
-- ============================================================
PRINT 'Creating Section 13: Enterprise ATS...';
GO

-- 13.1 TalentPools (H? so ?ng vi?n ti?m nang c?a doanh nghi?p)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TalentPools]') AND type = 'U')
CREATE TABLE [dbo].[TalentPools] (
    [PoolID]        INT IDENTITY(1,1) PRIMARY KEY,
    [CompanyID]     INT NOT NULL REFERENCES [dbo].[Companies]([CompanyID]) ON DELETE CASCADE,
    [Name]          NVARCHAR(200) NOT NULL,          -- 'Senior React Devs', 'Freshers 2026'
    [Description]   NVARCHAR(MAX) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 13.2 TalentPoolCandidates
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TalentPoolCandidates]') AND type = 'U')
CREATE TABLE [dbo].[TalentPoolCandidates] (
    [PoolID]        INT NOT NULL REFERENCES [dbo].[TalentPools]([PoolID]) ON DELETE CASCADE,
    [CandidateID]   INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [AddedBy]       INT NOT NULL REFERENCES [dbo].[Users]([UserID]), -- HR who added them
    [Notes]         NVARCHAR(MAX) NULL,
    [AddedAt]       DATETIME2 NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY ([PoolID], [CandidateID])
);
GO

-- 13.3 InterviewPipelines (Quy tr?nh ph?ng v?n chu?n cho Job)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[InterviewPipelines]') AND type = 'U')
CREATE TABLE [dbo].[InterviewPipelines] (
    [PipelineID]    INT IDENTITY(1,1) PRIMARY KEY,
    [CompanyID]     INT NOT NULL REFERENCES [dbo].[Companies]([CompanyID]) ON DELETE CASCADE,
    [Name]          NVARCHAR(200) NOT NULL,   -- 'Standard Engineering Pipeline'
    [IsDefault]     BIT NOT NULL DEFAULT 0,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 13.4 PipelineStages (C?c v?ng thi/ph?ng v?n)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PipelineStages]') AND type = 'U')
CREATE TABLE [dbo].[PipelineStages] (
    [StageID]       INT IDENTITY(1,1) PRIMARY KEY,
    [PipelineID]    INT NOT NULL REFERENCES [dbo].[InterviewPipelines]([PipelineID]) ON DELETE CASCADE,
    [Name]          NVARCHAR(100) NOT NULL,   -- 'CV Screening', 'AI Interview', 'Technical Check', 'HR Offer'
    [StageType]     NVARCHAR(50) NOT NULL DEFAULT 'Manual' CHECK ([StageType] IN ('Manual','AI_Interview','Code_Test')),
    [SortOrder]     INT NOT NULL DEFAULT 0
);
GO

-- C?p nh?t Jobs FK t?i Pipeline
ALTER TABLE [dbo].[Jobs] ADD [PipelineID] INT NULL REFERENCES [dbo].[InterviewPipelines]([PipelineID]);
GO

-- C?p nh?t JobApplications d? Track Stage
ALTER TABLE [dbo].[JobApplications] ADD [CurrentStageID] INT NULL REFERENCES [dbo].[PipelineStages]([StageID]);
GO

-- 13.5 JobOffers (Thu m?i nh?n vi?c k? thu?t s?)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[JobOffers]') AND type = 'U')
CREATE TABLE [dbo].[JobOffers] (
    [OfferID]       INT IDENTITY(1,1) PRIMARY KEY,
    [ApplicationID] INT NOT NULL REFERENCES [dbo].[JobApplications]([ApplicationID]) ON DELETE CASCADE,
    [BaseSalary]    DECIMAL(15,2) NOT NULL,
    [Currency]      VARCHAR(5) NOT NULL DEFAULT 'VND',
    [BonusInfo]     NVARCHAR(MAX) NULL,
    [Benefits]      NVARCHAR(MAX) NULL,
    [OfferDocumentUrl] NVARCHAR(500) NULL,    -- PDF from eSign service
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK ([Status] IN ('Pending','Accepted','Declined','Negotiating','Expired')),
    [ExpiresAt]     DATETIME2 NOT NULL,
    [SentAt]        DATETIME2 NOT NULL DEFAULT GETDATE(),
    [RespondedAt]   DATETIME2 NULL
);
GO

-- 13.6 CompanyB2BSubscriptions (G?i Doanh nghi?p mua quy?n l?i platform)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CompanyB2BSubscriptions]') AND type = 'U')
CREATE TABLE [dbo].[CompanyB2BSubscriptions] (
    [SubID]         INT IDENTITY(1,1) PRIMARY KEY,
    [CompanyID]     INT NOT NULL UNIQUE REFERENCES [dbo].[Companies]([CompanyID]) ON DELETE CASCADE,
    [PlanTier]      NVARCHAR(50) NOT NULL DEFAULT 'Basic' CHECK ([PlanTier] IN ('Basic','Pro','Enterprise')),
    [ActiveJobsQuota] INT NOT NULL DEFAULT 5,
    [CvViewsQuota]  INT NOT NULL DEFAULT 100,
    [AiInterviewQuota] INT NOT NULL DEFAULT 50, -- Sessions
    [ExpiresAt]     DATETIME2 NOT NULL,
    [PurchasedAt]   DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 13: Enterprise ATS created. (6 tables)';
GO

-- ============================================================
-- SECTION 14: VIRTUAL ECONOMY & GAMIFICATION ADVANCED (ENTERPRISE)
-- ============================================================
PRINT 'Creating Section 14: Virtual Economy & Gamification...';
GO

-- 14.1 VirtualCurrencyTransactions (Ti?n ?o t?ch bi?t kh?i XP/Points)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VirtualCurrencyTransactions]') AND type = 'U')
CREATE TABLE [dbo].[VirtualCurrencyTransactions] (
    [TxID]          BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [Amount]        INT NOT NULL,           -- EduCoins: duong (nh?n), ?m (ti?u)
    [TxType]        NVARCHAR(50) NOT NULL,  -- 'DAILY_REWARD', 'STORE_PURCHASE', 'COURSE_COMPLETE'
    [BalanceAfter]  INT NOT NULL,           -- Calculated balance after tx
    [Description]   NVARCHAR(300) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- Th?m c?t EduCoins Balance v?o Users
ALTER TABLE [dbo].[Users] ADD [EduCoinsBalance] INT NOT NULL DEFAULT 0;
GO

-- 14.2 VirtualStoreItems (V?t ph?m ?o)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VirtualStoreItems]') AND type = 'U')
CREATE TABLE [dbo].[VirtualStoreItems] (
    [ItemID]        INT IDENTITY(1,1) PRIMARY KEY,
    [Name]          NVARCHAR(200) NOT NULL,
    [Type]          NVARCHAR(50) NOT NULL DEFAULT 'AvatarFrame' CHECK ([Type] IN ('AvatarFrame','ProfileTheme','Badge','ProfileEffect')),
    [PriceCoins]    INT NOT NULL,
    [ImageUrl]      NVARCHAR(500) NULL,
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [MinLevelStr]   INT NOT NULL DEFAULT 1,   -- Y?u c?u Level bao nhi?u m?i du?c mua
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 14.3 UserInventory (T?i d? c?a user)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserInventory]') AND type = 'U')
CREATE TABLE [dbo].[UserInventory] (
    [InventoryID]   BIGINT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [ItemID]        INT NOT NULL REFERENCES [dbo].[VirtualStoreItems]([ItemID]),
    [IsEquipped]    BIT NOT NULL DEFAULT 0,
    [PurchasedAt]   DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserInventory UNIQUE ([UserID], [ItemID])
);
GO

-- 14.4 LearningLeaderboardSnapshots (X?p h?ng theo tu?n/th?ng)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[LearningLeaderboardSnapshots]') AND type = 'U')
CREATE TABLE [dbo].[LearningLeaderboardSnapshots] (
    [SnapshotID]    INT IDENTITY(1,1) PRIMARY KEY,
    [PeriodType]    NVARCHAR(20) NOT NULL DEFAULT 'Weekly' CHECK ([PeriodType] IN ('Weekly','Monthly')),
    [StartDate]     DATE NOT NULL,
    [EndDate]       DATE NOT NULL,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [PointsEarned]  INT NOT NULL DEFAULT 0,
    [Rank]          INT NOT NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

PRINT 'Section 14: Virtual Economy created. (4 tables)';
GO

-- ============================================================
-- SECTION 15: SOCIAL HUB & ORGANIZATIONS (ENTERPRISE)
-- ============================================================
PRINT 'Creating Section 15: Social Hub & Organizations...';
GO

-- 15.1 MentorshipPrograms
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MentorshipPrograms]') AND type = 'U')
CREATE TABLE [dbo].[MentorshipPrograms] (
    [ProgramID]     INT IDENTITY(1,1) PRIMARY KEY,
    [Title]         NVARCHAR(300) NOT NULL,
    [Description]   NVARCHAR(MAX) NULL,
    [SchoolID]      INT NULL REFERENCES [dbo].[Schools]([SchoolID]),
    [CompanyID]     INT NULL REFERENCES [dbo].[Companies]([CompanyID]),
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Active' CHECK ([Status] IN ('Upcoming','Active','Completed','Archived')),
    [StartAt]       DATETIME2 NULL,
    [EndAt]         DATETIME2 NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 15.2 MentorshipMatches (K?t n?i Mentor - Mentee)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MentorshipMatches]') AND type = 'U')
CREATE TABLE [dbo].[MentorshipMatches] (
    [MatchID]       INT IDENTITY(1,1) PRIMARY KEY,
    [ProgramID]     INT NULL REFERENCES [dbo].[MentorshipPrograms]([ProgramID]) ON DELETE CASCADE,
    [MentorID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [MenteeID]      INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK ([Status] IN ('Pending','Accepted','Declined','Completed','Terminated')),
    [RequestMessage] NVARCHAR(500) NULL,
    [MatchedAt]     DATETIME2 NULL,
    [CompletedAt]   DATETIME2 NULL,
    [RatingByMentee] TINYINT NULL,
    [Feedback]      NVARCHAR(MAX) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_MentorMatch UNIQUE ([MentorID], [MenteeID])
);
GO

-- 15.3 MentorshipSessions (L?ch h?n 1-1)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MentorshipSessions]') AND type = 'U')
CREATE TABLE [dbo].[MentorshipSessions] (
    [SessionID]     INT IDENTITY(1,1) PRIMARY KEY,
    [MatchID]       INT NOT NULL REFERENCES [dbo].[MentorshipMatches]([MatchID]) ON DELETE CASCADE,
    [Title]         NVARCHAR(300) NOT NULL,
    [ScheduledAt]   DATETIME2 NOT NULL,
    [DurationMinutes] INT NOT NULL DEFAULT 60,
    [MeetingUrl]    NVARCHAR(500) NULL,
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK ([Status] IN ('Scheduled','Completed','NoShow','Cancelled')),
    [Notes]         NVARCHAR(MAX) NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 15.4 Events (S? ki?n Offline/Online to?n tru?ng/khu v?c)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Events]') AND type = 'U')
CREATE TABLE [dbo].[Events] (
    [EventID]       INT IDENTITY(1,1) PRIMARY KEY,
    [OrganizerID]   INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [SchoolID]      INT NULL REFERENCES [dbo].[Schools]([SchoolID]),
    [CompanyID]     INT NULL REFERENCES [dbo].[Companies]([CompanyID]),
    [Title]         NVARCHAR(500) NOT NULL,
    [Slug]          NVARCHAR(500) NOT NULL UNIQUE,
    [Description]   NVARCHAR(MAX) NOT NULL,
    [BannerUrl]     NVARCHAR(500) NULL,
    [Category]      NVARCHAR(50) NOT NULL DEFAULT 'Webinar' CHECK ([Category] IN ('Webinar','Workshop','JobFair','Hackathon','Meetup')),
    [LocationType]  NVARCHAR(50) NOT NULL DEFAULT 'Online' CHECK ([LocationType] IN ('Online','Offline','Hybrid')),
    [LocationAddress] NVARCHAR(500) NULL,
    [MeetingUrl]    NVARCHAR(500) NULL,
    [StartAt]       DATETIME2 NOT NULL,
    [EndAt]         DATETIME2 NOT NULL,
    [MaxAttendees]  INT NULL,
    [IsPublic]      BIT NOT NULL DEFAULT 1,
    [RequiresTicket] BIT NOT NULL DEFAULT 0,
    [TicketPrice]   DECIMAL(12,2) NULL,
    [Currency]      VARCHAR(5) NULL DEFAULT 'VND',
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 15.5 EventTickets (V? tham d? s? ki?n)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EventTickets]') AND type = 'U')
CREATE TABLE [dbo].[EventTickets] (
    [TicketID]      INT IDENTITY(1,1) PRIMARY KEY,
    [EventID]       INT NOT NULL REFERENCES [dbo].[Events]([EventID]) ON DELETE CASCADE,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]),
    [TicketCode]    VARCHAR(50) NOT NULL UNIQUE,   -- TKT-2026-X8Y9
    [PurchasePrice] DECIMAL(12,2) NOT NULL DEFAULT 0,
    [Currency]      VARCHAR(5) NOT NULL DEFAULT 'VND',
    [Status]        NVARCHAR(50) NOT NULL DEFAULT 'Valid' CHECK ([Status] IN ('Valid','Used','Refunded','Cancelled')),
    [PurchasedAt]   DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CheckedInAt]   DATETIME2 NULL,
    CONSTRAINT UQ_EventTicket UNIQUE ([EventID], [UserID])
);
GO

PRINT 'Section 15: Social Hub & Organizations created. (5 tables)';
GO

-- ============================================================
-- SECTION 16: COMPLIANCE, SECURITY & INFRASTRUCTURE (ENTERPRISE)
-- ============================================================
PRINT 'Creating Section 16: Compliance & Security...';
GO

-- 16.1 DataPrivacyConsents (Qu?n l? Data GDPR/PDPA Consent)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DataPrivacyConsents]') AND type = 'U')
CREATE TABLE [dbo].[DataPrivacyConsents] (
    [ConsentID]     INT IDENTITY(1,1) PRIMARY KEY,
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [CompanyID]     INT NULL REFERENCES [dbo].[Companies]([CompanyID]), -- C?p quy?n cho Cty c? th? (B2B)
    [ConsentType]   NVARCHAR(100) NOT NULL, -- 'CV_DATABASE_SEARCH', 'MARKETING_EMAILS', 'DATA_SHARING'
    [IsGranted]     BIT NOT NULL DEFAULT 0,
    [IpAddress]     VARCHAR(50) NULL,
    [UserAgent]     NVARCHAR(500) NULL,
    [GrantedAt]     DATETIME2 NULL,
    [RevokedAt]     DATETIME2 NULL,
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 16.2 DeviceSessions (Qu?n l? thi?t b? dang nh?p)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DeviceSessions]') AND type = 'U')
CREATE TABLE [dbo].[DeviceSessions] (
    [SessionID]     UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserID]        INT NOT NULL REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE,
    [DeviceName]    NVARCHAR(200) NULL,      -- 'iPhone 15 Pro', 'Windows 11 PC'
    [DeviceType]    NVARCHAR(50) NULL,       -- 'Mobile', 'Desktop', 'Tablet'
    [Browser]       NVARCHAR(100) NULL,      -- 'Chrome', 'Safari'
    [OS]            NVARCHAR(100) NULL,
    [IpAddress]     VARCHAR(50) NULL,
    [Location]      NVARCHAR(200) NULL,      -- 'Ho Chi Minh City, VN'
    [IsActive]      BIT NOT NULL DEFAULT 1,
    [LastActiveAt]  DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 16.3 FeatureToggles (B?t/t?t t?nh nang Cloud/Enterprise ko c?n deploy)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FeatureToggles]') AND type = 'U')
CREATE TABLE [dbo].[FeatureToggles] (
    [ToggleKey]     VARCHAR(100) PRIMARY KEY, -- 'ENABLE_AI_INTERVIEW', 'ENABLE_VIRTUAL_STORE'
    [IsEnabled]     BIT NOT NULL DEFAULT 0,
    [TargetGroups]  NVARCHAR(500) NULL,       -- JSON: ['Admin','BetaTesters','ProUsers']
    [RolloutPercent] INT NULL,                -- 0-100% for A/B testing
    [Description]   NVARCHAR(500) NULL,
    [UpdatedAt]     DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedBy]     INT NULL REFERENCES [dbo].[Users]([UserID])
);
GO

PRINT 'Section 16: Compliance & Security created. (3 tables)';
GO

-- ============================================================
-- FINALIZATION
-- ============================================================
PRINT '============================================================';
PRINT 'EDUBRIDGE AI ENTERPRISE - DATABASE SETUP COMPLETED SUCCESSFULLY!';
PRINT CONVERT(VARCHAR, GETDATE(), 120);
PRINT 'Total Tables created: ~200 Tables';
PRINT '============================================================';
GO

/*-----------------------------------------------------------------
* File: Posts.sql
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is a component/module for the student application.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
CREATE TABLE [dbo].[Posts] (
    [PostID]         BIGINT         IDENTITY (1, 1) NOT NULL,
    [UserID]         BIGINT         NULL,
    [Content]        NVARCHAR (MAX) NULL,
    [Type]           VARCHAR (20)   DEFAULT ('regular') NULL,
    [Visibility]     VARCHAR (20)   DEFAULT ('public') NULL,
    [Location]       NVARCHAR (255) NULL,
    [CreatedAt]      DATETIME       DEFAULT (getdate()) NULL,
    [UpdatedAt]      DATETIME       DEFAULT (getdate()) NULL,
    [DeletedAt]      DATETIME       NULL,
    [LikesCount]     INT            DEFAULT ((0)) NULL,
    [CommentsCount]  INT            DEFAULT ((0)) NULL,
    [SharesCount]    INT            DEFAULT ((0)) NULL,
    [ReportsCount]   INT            DEFAULT ((0)) NULL,
    [IsFlagged]      BIT            DEFAULT ((0)) NULL,
    [FlaggedReason]  NVARCHAR (255) NULL,
    [FlaggedAt]      DATETIME       NULL,
    [IsDeleted]      BIT            DEFAULT ((0)) NULL,
    [BookmarksCount] INT            DEFAULT ((0)) NOT NULL,
    PRIMARY KEY CLUSTERED ([PostID] ASC),
    CONSTRAINT [CHK_Post_Type] CHECK ([Type]='announcement' OR [Type]='question' OR [Type]='article' OR [Type]='regular'),
    CONSTRAINT [CHK_Post_Visibility] CHECK ([Visibility]='friends' OR [Visibility]='private' OR [Visibility]='public'),
    FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserID])
);


GO

/*-----------------------------------------------------------------
* File: Comments.sql
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is a component/module for the student application.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
CREATE TABLE [dbo].[Comments] (
    [CommentID]       BIGINT         IDENTITY (1, 1) NOT NULL,
    [PostID]          BIGINT         NULL,
    [UserID]          BIGINT         NULL,
    [ParentCommentID] BIGINT         NULL,
    [Content]         NVARCHAR (MAX) NULL,
    [LikesCount]      INT            DEFAULT ((0)) NULL,
    [RepliesCount]    INT            DEFAULT ((0)) NULL,
    [CreatedAt]       DATETIME       DEFAULT (getdate()) NULL,
    [UpdatedAt]       DATETIME       NULL,
    [DeletedAt]       DATETIME       NULL,
    [IsEdited]        BIT            DEFAULT ((0)) NULL,
    [IsDeleted]       BIT            DEFAULT ((0)) NULL,
    PRIMARY KEY CLUSTERED ([CommentID] ASC),
    FOREIGN KEY ([ParentCommentID]) REFERENCES [dbo].[Comments] ([CommentID]),
    FOREIGN KEY ([PostID]) REFERENCES [dbo].[Posts] ([PostID]),
    FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserID])
);


GO

