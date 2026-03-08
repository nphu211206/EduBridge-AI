USE EduBridgeAI_Enterprise;
GO

IF OBJECT_ID('dbo.UserEmails', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[UserEmails] (
        [EmailID] INT IDENTITY(1,1) PRIMARY KEY,
        [UserID] INT NOT NULL,
        [Email] NVARCHAR(255) NOT NULL,
        [IsPrimary] BIT DEFAULT 0,
        [IsVerified] BIT DEFAULT 0,
        [Visibility] VARCHAR(50) DEFAULT 'Private',
        [VerificationToken] VARCHAR(255) NULL,
        [CreatedAt] DATETIME DEFAULT GETDATE(),
        CONSTRAINT FK_UserEmails_Users FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users]([UserID]) ON DELETE CASCADE
    );
END
GO

INSERT INTO [dbo].[UserEmails] (UserID, Email, IsPrimary, IsVerified, Visibility)
SELECT UserID, Email, 1, 1, 'Public'
FROM [dbo].[Users] u
WHERE NOT EXISTS (SELECT 1 FROM [dbo].[UserEmails] ue WHERE ue.Email = u.Email);
GO
