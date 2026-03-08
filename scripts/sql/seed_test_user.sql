USE EduBridgeAI_Enterprise;
GO

DECLARE @PwdHash NVARCHAR(500) = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0.jW2Z.6E3Kjg1u9A6W';

IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE Email = 'nam@gmail.com')
BEGIN
    INSERT INTO [dbo].[Users] ([Username], [Email], [Password], [FirstName], [LastName], [Role], [City], [AccountStatus], [ReferralCode], [IsEmailVerified], [IsPhoneVerified], [IsActive], [IsBanned]) 
    VALUES ('student_nam', 'nam@gmail.com', @PwdHash, N'Hải', N'Nam', 'STUDENT', N'Hồ Chí Minh', 'ACTIVE', 'REF_NAM', 1, 0, 1, 0);

    DECLARE @NamID INT = SCOPE_IDENTITY();
    
    DECLARE @RoleStudent INT = (SELECT RoleID FROM [dbo].[Roles] WHERE RoleCode = 'student');
    IF @RoleStudent IS NOT NULL
    BEGIN
        INSERT INTO [dbo].[UserRoles] ([UserID], [RoleID]) VALUES (@NamID, @RoleStudent);
    END
    
    INSERT INTO [dbo].[UserEmails] (UserID, Email, IsPrimary, IsVerified, Visibility)
    VALUES (@NamID, 'nam@gmail.com', 1, 1, 'Public');
    
    PRINT 'Inserted test user student_nam';
END
ELSE
BEGIN
    PRINT 'Test user already exists';
END
GO
