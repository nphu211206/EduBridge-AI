USE EduBridgeAI_Enterprise;
GO

DECLARE @NamID INT = (SELECT UserID FROM [dbo].[Users] WHERE Email = 'nam@gmail.com');
DECLARE @RoleStudent INT = (SELECT RoleID FROM [dbo].[Roles] WHERE RoleCode = 'student');

IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRoles] WHERE UserID = @NamID)
BEGIN
    INSERT INTO [dbo].[UserRoles] ([UserID], [RoleID]) VALUES (@NamID, @RoleStudent);
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[UserEmails] WHERE UserID = @NamID)
BEGIN
    INSERT INTO [dbo].[UserEmails] (UserID, Email, IsPrimary, IsVerified, Visibility)
    VALUES (@NamID, 'nam@gmail.com', 1, 1, 'Public');
END
GO
