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


