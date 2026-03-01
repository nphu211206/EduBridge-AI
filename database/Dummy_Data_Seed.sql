-- ============================================================
-- EDUBRIDGE AI - DUMMY DATA SEED SCRIPT
-- Description: G?n d? li?u m?i (Mock Data) chu?n Vi?t Nam cho h? th?ng.
-- ============================================================

USE EduBridgeAI_Enterprise;
GO

PRINT '============================================================';
PRINT 'B?T ??U CH?N D? LI?U M?U (DUMMY DATA)';
PRINT CONVERT(VARCHAR, GETDATE(), 120);
PRINT '============================================================';
GO

-- ---------------------------------------------------------
-- 1. X?A V? RESET D? LI?U (?? TR?NH L?I UNIQUE CONSTRAINTS)
-- ---------------------------------------------------------
IF OBJECT_ID('dbo.UserRoles', 'U') IS NOT NULL DELETE FROM [dbo].[UserRoles];
IF OBJECT_ID('dbo.UserProfiles', 'U') IS NOT NULL DELETE FROM [dbo].[UserProfiles];
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DELETE FROM [dbo].[Users];

-- ---------------------------------------------------------
-- 2. CH?N ROLES (N?U CHUA C?)
-- ---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles])
BEGIN
    INSERT INTO [dbo].[Roles] ([RoleName], [RoleCode], [Description]) VALUES 
    ('Admin', 'admin', N'Qu?n tr? vi?n to?n h? th?ng'),
    ('Student', 'student', N'Ngu?i h?c / ?ng vi?n'),
    ('Teacher', 'teacher', N'Gi?ng vi?n / Ngu?i t?o kh?a h?c'),
    ('Recruiter', 'recruiter', N'Nh? tuy?n d?ng / HR'),
    ('Company', 'company', N'T?i kho?n d?nh danh Doanh nghi?p');
    PRINT '?? ch?n 5 Roles.';
END
GO

-- ---------------------------------------------------------
-- 2. CH?N TRU?NG ??I H?C V? KHOA
-- ---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Schools])
BEGIN
    INSERT INTO [dbo].[Schools] ([SchoolName], [ShortName], [City], [Type], [IsVerified]) VALUES 
    (N'??i h?c B?ch Khoa H? N?i', 'HUST', N'H? N?i', 'University', 1),
    (N'??i h?c C?ng ngh? th?ng tin TP.HCM', 'UIT', N'H? Ch? Minh', 'University', 1),
    (N'??i h?c Khoa h?c T? nhi?n TP.HCM', 'HCMUS', N'H? Ch? Minh', 'University', 1),
    (N'??i h?c RMIT Vi?t Nam', 'RMIT', N'H? Ch? Minh', 'University', 1);

    DECLARE @HUST_ID INT = (SELECT SchoolID FROM [dbo].[Schools] WHERE ShortName = 'HUST');
    DECLARE @UIT_ID INT = (SELECT SchoolID FROM [dbo].[Schools] WHERE ShortName = 'UIT');

    INSERT INTO [dbo].[Departments] ([SchoolID], [DeptName], [DeptCode]) VALUES
    (@HUST_ID, N'Vi?n C?ng ngh? Th?ng tin v? Truy?n th?ng', 'SoICT'),
    (@HUST_ID, N'Vi?n ?i?n t? Vi?n th?ng', 'SET'),
    (@UIT_ID, N'Khoa C?ng ngh? Ph?n m?m', 'SE'),
    (@UIT_ID, N'Khoa Khoa h?c M?y t?nh', 'CS');

    DECLARE @SoICT_ID INT = (SELECT DepartmentID FROM [dbo].[Departments] WHERE DeptCode = 'SoICT');
    DECLARE @SE_ID INT = (SELECT DepartmentID FROM [dbo].[Departments] WHERE DeptCode = 'SE');

    INSERT INTO [dbo].[Majors] ([DepartmentID], [MajorName], [MajorCode], [FieldCategory]) VALUES
    (@SoICT_ID, N'Khoa h?c M?y t?nh', 'IT1', 'IT'),
    (@SoICT_ID, N'K? thu?t M?y t?nh', 'IT2', 'IT'),
    (@SE_ID, N'K? thu?t Ph?n m?m', 'SE', 'IT'),
    (@SE_ID, N'Tr? tu? Nh?n t?o', 'AI', 'IT');

    PRINT '?? ch?n Schools, Departments, Majors.';
END
GO

-- ---------------------------------------------------------
-- 4. CH?N USERS V? USER ROLES
-- ---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Users] WHERE Username = 'admin')
BEGIN
    -- M?t kh?u m?c d?nh: Hash('123456') (Gi? l?p bcrypt)
    DECLARE @PwdHash NVARCHAR(500) = '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymY0.jW2Z.6E3Kjg1u9A6W';
    
    -- Admin
    INSERT INTO [dbo].[Users] ([Username], [Email], [Password], [FullName], [School], [Role], [City], [AccountStatus], [ReferralCode]) VALUES
    ('admin', 'admin@edubridge.ai', @PwdHash, N'H? Th?ng', N'HUST', 'ADMIN', N'H? N?i', 'ACTIVE', 'REF_ADMIN'),
    ('teacher_hoang', 'hoang@edubridge.ai', @PwdHash, N'Xu?n Ho?ng', N'HUST', 'TEACHER', N'H? N?i', 'ACTIVE', 'REF_HOANG'),
    ('student_nam', 'nam@gmail.com', @PwdHash, N'H?i Nam', N'UIT', 'STUDENT', N'H? Ch? Minh', 'ACTIVE', 'REF_NAM'),
    ('student_lan', 'lan@gmail.com', @PwdHash, N'Huong Lan', N'HCMUS', 'STUDENT', N'?? N?ng', 'ACTIVE', 'REF_LAN'),
    ('hr_fpt', 'tuyendung@fpt.com', @PwdHash, N'Th? Trang', N'FPT', 'STUDENT', N'H? N?i', 'ACTIVE', 'REF_FPT'),
    ('hr_vng', 'hr@vng.com', @PwdHash, N'Th?nh ??t', N'VNG', 'STUDENT', N'H? Ch? Minh', 'ACTIVE', 'REF_VNG');

    -- G?n Role
    DECLARE @RoleAdmin INT = (SELECT RoleID FROM [dbo].[Roles] WHERE RoleCode = 'admin');
    DECLARE @RoleTeacher INT = (SELECT RoleID FROM [dbo].[Roles] WHERE RoleCode = 'teacher');
    DECLARE @RoleStudent INT = (SELECT RoleID FROM [dbo].[Roles] WHERE RoleCode = 'student');
    DECLARE @RoleRecruiter INT = (SELECT RoleID FROM [dbo].[Roles] WHERE RoleCode = 'recruiter');

    INSERT INTO [dbo].[UserRoles] ([UserID], [RoleID]) VALUES
    ((SELECT UserID FROM [dbo].[Users] WHERE Username = 'admin'), @RoleAdmin),
    ((SELECT UserID FROM [dbo].[Users] WHERE Username = 'teacher_hoang'), @RoleTeacher),
    ((SELECT UserID FROM [dbo].[Users] WHERE Username = 'student_nam'), @RoleStudent),
    ((SELECT UserID FROM [dbo].[Users] WHERE Username = 'student_lan'), @RoleStudent),
    ((SELECT UserID FROM [dbo].[Users] WHERE Username = 'hr_fpt'), @RoleRecruiter),
    ((SELECT UserID FROM [dbo].[Users] WHERE Username = 'hr_vng'), @RoleRecruiter);

    -- User Profiles cho Sinh Vi?n
    DECLARE @UIT_ID INT = (SELECT SchoolID FROM [dbo].[Schools] WHERE ShortName = 'UIT');
    DECLARE @SE_ID INT = (SELECT DepartmentID FROM [dbo].[Departments] WHERE DeptCode = 'SE');
    DECLARE @StudentNamID INT = (SELECT UserID FROM [dbo].[Users] WHERE Username = 'student_nam');

    INSERT INTO [dbo].[UserProfiles] ([UserID], [Headline], [SchoolID], [DepartmentID], [GPA], [YearOfStudy], [GithubUrl]) VALUES
    (@StudentNamID, N'Passionate Frontend Developer', @UIT_ID, @SE_ID, 3.8, 3, 'https://github.com/studentnam');

    PRINT '?? ch?n 6 Users (Admin, Teacher, 2 Students, 2 HRs).';
END
GO

-- ---------------------------------------------------------
-- 5. CH?N CATEGORIES, COURSES, MODULES, LESSONS
-- ---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Categories])
BEGIN
    INSERT INTO [dbo].[Categories] ([CategoryName], [Slug], [Description], [SortOrder]) VALUES
    (N'L?p tr?nh Web', 'web-development', N'Frontend, Backend, Fullstack', 1),
    (N'L?p tr?nh Mobile', 'mobile-development', N'iOS, Android, React Native', 2),
    (N'Khoa h?c D? li?u', 'data-science', N'AI, Machine Learning, Data Analytics', 3);
    
    DECLARE @CatWeb INT = (SELECT CategoryID FROM [dbo].[Categories] WHERE Slug = 'web-development');
    DECLARE @TeacherHoangID INT = (SELECT UserID FROM [dbo].[Users] WHERE Username = 'teacher_hoang');

    INSERT INTO [dbo].[Courses] ([TeacherID], [CategoryID], [Title], [Slug], [ShortDescription], [Description], [Level], [Status], [Price], [IsFree], [DurationMinutes], [TotalStudents], [AverageRating], [IsPublic]) VALUES
    (@TeacherHoangID, @CatWeb, N'React JS Co B?n ??n N?ng Cao', 'reactjs-masterclass', N'H?c ReactJS t? zero d?n hero.', N'Kh?a h?c th?c chi?n x?y d?ng c?c d? ?n web v?i React 18, Hooks, Redux Toolkit.', 'Beginner', 'Published', 1500000, 0, 1200, 350, 4.8, 1),
    (@TeacherHoangID, @CatWeb, N'L?m ch? Node.js & Express API', 'nodejs-express-api', N'Backend v?ng ch?c cho Web v? App.', N'RESTful API, Authenticate, MongoDB v? t?i uu hi?u su?t Node.js', 'Intermediate', 'Published', 0, 1, 600, 1200, 4.9, 1);

    DECLARE @CourseReact INT = (SELECT CourseID FROM [dbo].[Courses] WHERE Slug = 'reactjs-masterclass');

    INSERT INTO [dbo].[CourseModules] ([CourseID], [Title], [SortOrder], [IsPublished]) VALUES
    (@CourseReact, N'Ph?n 1: Gi?i thi?u React', 1, 1),
    (@CourseReact, N'Ph?n 2: React Hooks', 2, 1);

    DECLARE @Mod1 INT = (SELECT ModuleID FROM [dbo].[CourseModules] WHERE Title = N'Ph?n 1: Gi?i thi?u React');
    DECLARE @Mod2 INT = (SELECT ModuleID FROM [dbo].[CourseModules] WHERE Title = N'Ph?n 2: React Hooks');

    INSERT INTO [dbo].[Lessons] ([ModuleID], [CourseID], [Title], [Slug], [Type], [VideoUrl], [IsPreview], [IsPublished], [SortOrder]) VALUES
    (@Mod1, @CourseReact, N'B?i 1: React l? g??', 'lesson-1-react-intro', 'Video', 'https://vimeo.com/123456', 1, 1, 1),
    (@Mod1, @CourseReact, N'B?i 2: C?i d?t m?i tru?ng', 'lesson-2-setup', 'Video', 'https://youtube.com/123456', 0, 1, 2),
    (@Mod2, @CourseReact, N'B?i 3: useState th?c chi?n', 'lesson-3-usestate', 'Code', NULL, 0, 1, 1);

    DECLARE @LessonCode INT = (SELECT LessonID FROM [dbo].[Lessons] WHERE Slug = 'lesson-3-usestate');

    -- Fix Invalid columns and Constraint overrides
    -- Create lesson code
    INSERT INTO [dbo].[LessonCodeContent] ([LessonID], [Language], [StarterCode], [ExpectedOutput], [Instructions]) VALUES
    (@LessonCode, 'javascript', 'function Counter() { return 0; }', '1', N'Vi?t m?t component d?m s? d?ng useState.');

    PRINT '?? ch?n Categories, Courses, Modules, Lessons.';
END
GO

-- ---------------------------------------------------------
-- 6. CH?N COMPANIES, JOBS, B2B SUBSCRIPTIONS
-- ---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Companies])
BEGIN
    DECLARE @HrFptID INT = (SELECT UserID FROM [dbo].[Users] WHERE Username = 'hr_fpt');
    DECLARE @HrVngID INT = (SELECT UserID FROM [dbo].[Users] WHERE Username = 'hr_vng');

    INSERT INTO [dbo].[Companies] ([CreatorID], [Name], [Slug], [Industry], [Size], [FoundedYear], [Description], [IsVerified], [Website]) VALUES
    (@HrFptID, N'FPT Software', 'fpt-software', 'IT', '500+', 1999, N'C?ng ty ph?n m?m quy m? l?n nh?t Vi?t Nam, top doanh nghi?p c?ng ngh?.', 1, 'https://fptsoftware.com'),
    (@HrVngID, N'VNG Corporation', 'vng-corp', 'Technology / Gaming', '500+', 2004, N'K? l?n c?ng ngh? d?u ti?n t?i Vi?t Nam, s? h?u Zalo, Zing MP3.', 1, 'https://vng.com.vn');

    DECLARE @FptID INT = (SELECT CompanyID FROM [dbo].[Companies] WHERE Slug = 'fpt-software');
    DECLARE @VngID INT = (SELECT CompanyID FROM [dbo].[Companies] WHERE Slug = 'vng-corp');

    INSERT INTO [dbo].[CompanyRecruiters] ([CompanyID], [UserID], [Role]) VALUES
    (@FptID, @HrFptID, 'Admin'),
    (@VngID, @HrVngID, 'Admin');

    INSERT INTO [dbo].[Jobs] ([CompanyID], [RecruiterID], [Title], [Slug], [JobType], [WorkModel], [ExperienceLevel], [MinSalary], [MaxSalary], [Currency], [Location], [Description], [Requirements], [RequiredSkills], [Status], [PublishedAt]) VALUES
    (@FptID, @HrFptID, N'Frontend Developer (ReactJS) - KMA', 'fpt-frontend-reactjs', 'FullTime', 'Hybrid', 'Junior', 12000000, 20000000, 'VND', N'H? N?i', N'Ph?t tri?n ?ng d?ng Web app quy m? Enterprise.', N'?t nh?t 1 nam kinh nghi?m ReactJS, hi?u Redux, Axios.', '["React","JavaScript","CSS"]', 'Published', GETDATE()),
    (@VngID, @HrVngID, N'Zalo Software Engineer (Backend Node.js)', 'vng-backend-nodejs', 'FullTime', 'OnSite', 'Mid', 20000000, 45000000, 'VND', N'Qu?n 7, TP.HCM', N'Tham gia core team Zalo Chat, x? l? h?ng t? tin nh?n.', N'N?m v?ng Microservices, Node.js s?u s?c, c? ki?n th?c Redis, Kafka.', '["Node.js","Kafka","Redis"]', 'Published', GETDATE()),
    (@VngID, @HrVngID, N'Th?c t?p sinh Game Developer', 'vng-intern-game', 'Internship', 'OnSite', 'Intern', 3000000, 5000000, 'VND', N'Qu?n 7, TP.HCM', N'Co h?i v?o VNG Fresher Program.', N'?am m? l?m game, bi?t Unity ho?c C++.', '["C++","Unity"]', 'Published', GETDATE());

    -- Enterprise AST: Pipeline & B2B Sub
    INSERT INTO [dbo].[CompanyB2BSubscriptions] ([CompanyID], [PlanTier], [ActiveJobsQuota], [CvViewsQuota], [ExpiresAt]) VALUES
    (@FptID, 'Enterprise', 100, 5000, DATEADD(YEAR, 1, GETDATE())),
    (@VngID, 'Pro', 20, 1000, DATEADD(MONTH, 6, GETDATE()));

    INSERT INTO [dbo].[InterviewPipelines] ([CompanyID], [Name], [IsDefault]) VALUES
    (@VngID, 'VNG Standard Engineering', 1);

    DECLARE @PipeVng INT = (SELECT PipelineID FROM [dbo].[InterviewPipelines] WHERE CompanyID = @VngID);

    INSERT INTO [dbo].[PipelineStages] ([PipelineID], [Name], [StageType], [SortOrder]) VALUES
    (@PipeVng, 'CV Screening', 'Manual', 1),
    (@PipeVng, 'Technical Check (AI)', 'Code_Test', 2),
    (@PipeVng, 'Culture Fit Interview', 'Manual', 3),
    (@PipeVng, 'Offer', 'Manual', 4);

    -- C?p nh?t Job theo Pipeline
    UPDATE [dbo].[Jobs] SET [PipelineID] = @PipeVng WHERE CompanyID = @VngID;

    PRINT '?? ch?n Companies, Jobs, ATS Pipeline.';
END
GO

-- ---------------------------------------------------------
-- 7. CH?N POSTS, COMMENTS, VIRTUAL ECONOMY
-- ---------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM [dbo].[Posts])
BEGIN
    DECLARE @StudentNamID INT = (SELECT UserID FROM [dbo].[Users] WHERE Username = 'student_nam');
    DECLARE @StudentLanID INT = (SELECT UserID FROM [dbo].[Users] WHERE Username = 'student_lan');
    DECLARE @TeacherHoangID INT = (SELECT UserID FROM [dbo].[Users] WHERE Username = 'teacher_hoang');

    INSERT INTO [dbo].[Posts] ([UserID], [Content], [Visibility], [LikesCount], [CommentsCount]) VALUES
    (@StudentNamID, N'D?o n?y code React ?o ma qu?, c? b?c n?o b? k?t useEffect loop kh?ng? ', 'Public', 15, 2),
    (@TeacherHoangID, N'Ch?o tu?n m?i c?c sinh vi?n! Kh?a h?c Node.js v?a du?c update th?m module Microservices nh?. ', 'Public', 45, 1);

    DECLARE @Post1 INT = (SELECT PostID FROM [dbo].[Posts] WHERE Content LIKE N'%D?o n?y code React%');
    DECLARE @Post2 INT = (SELECT PostID FROM [dbo].[Posts] WHERE Content LIKE N'%Ch?o tu?n m?i%');

    INSERT INTO [dbo].[Comments] ([PostID], [UserID], [Content]) VALUES
    (@Post1, @StudentLanID, N'B?c b? dependency array ?? Th?m [] v?o cu?i l? h?t nh? =))'),
    (@Post1, @TeacherHoangID, N'C?n th?n kh?ng s?p RAM browser em nh?. Debug di.'),
    (@Post2, @StudentNamID, N'Tuy?t qu? th?y oi, em h?ng m?i!');

    -- Virtual Store Items
    INSERT INTO [dbo].[VirtualStoreItems] ([Name], [Type], [PriceCoins], [MinLevelStr]) VALUES
    (N'Khung Avatar R?ng L?a', 'AvatarFrame', 5000, 5),
    (N'Theme Kh?ng Gian (Dark Mode Pro)', 'ProfileTheme', 10000, 10),
    (N'Huy hi?u "Tr?m Code D?o"', 'Badge', 2000, 2);

    -- C?ng di?m v? EduCoins m?i
    UPDATE [dbo].[Users] SET [TotalPoints] = 1500, [Level] = 3, [EduCoinsBalance] = 8000 WHERE UserID = @StudentNamID;
    UPDATE [dbo].[Users] SET [TotalPoints] = 800, [Level] = 2, [EduCoinsBalance] = 3000 WHERE UserID = @StudentLanID;

    PRINT '?? ch?n Posts, Comments, Virtual Store & Economy.';
END
GO
-- ============================================================
-- K?T TH?C DUMMY DATA SEEDING
-- ============================================================
PRINT '============================================================';
PRINT 'EDUBRIDGE AI - CH?N D? LI?U TH?NH C?NG!';
PRINT 'B?y gi? anh h?y dang nh?p test h? th?ng nh?!';
PRINT '============================================================';
GO

