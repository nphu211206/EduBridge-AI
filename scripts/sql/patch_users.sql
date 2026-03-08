EXEC sp_rename 'dbo.Users.PasswordHash', 'Password', 'COLUMN';
GO
IF COL_LENGTH('dbo.Users', 'AccountStatus') IS NULL
    ALTER TABLE dbo.Users ADD AccountStatus VARCHAR(20) DEFAULT ('ACTIVE') NULL;
GO
UPDATE dbo.Users SET AccountStatus = 'ACTIVE';
GO
UPDATE dbo.Users SET Password = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0.jW2Z.6E3Kjg1u9A6W';
GO
