const { poolPromise, sql } = require('./services/teacher-service/config/database');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('--- BẮT ĐẦU QUÁ TRÌNH NẠP DỮ LIỆU SIÊU KHỔNG LỒ (FULL SYSTEM SEED) ---');
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    try {
        console.log('1. Đang tạo Users (Học sinh, Giáo viên, Doanh nghiệp, Tuyển dụng)...');
        const users = [];
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Admin@123', salt);

        // Tạo 20 Users
        for (let i = 0; i < 20; i++) {
            const role = i < 2 ? 'ADMIN' : (i < 5 ? 'TEACHER' : (i < 13 ? 'STUDENT' : (i < 16 ? 'RECRUITER' : 'ENTERPRISE')));
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const email = faker.internet.email({ firstName, lastName }).toLowerCase() + faker.string.uuid().substring(0, 8) + '@example.com';
            const username = `user_${i}_${faker.string.uuid().substring(0, 8)}`;
            const refCode = faker.string.alphanumeric(10).toUpperCase();
            const phone = faker.phone.number({ style: 'international' }) + i;

            const req = new sql.Request(transaction);
            const res = await req
                .input('Username', sql.VarChar(50), username)
                .input('Email', sql.VarChar(255), email)
                .input('PasswordHash', sql.VarChar(255), passwordHash)
                .input('PasswordSalt', sql.VarChar(255), salt)
                .input('FirstName', sql.NVarChar(50), firstName)
                .input('LastName', sql.NVarChar(50), lastName)
                .input('PhoneNumber', sql.VarChar(20), phone)
                .input('ReferralCode', sql.VarChar(50), refCode)
                .input('Role', sql.VarChar(20), role)
                .input('AccountStatus', sql.VarChar(20), 'ACTIVE')
                .input('Status', sql.VarChar(20), 'active')
                .input('AvatarUrl', sql.VarChar(255), faker.image.avatar())
                .input('Bio', sql.NVarChar(500), faker.person.bio())
                .input('CreatedAt', sql.DateTime2, new Date())
                .query(`
                    INSERT INTO Users (
                        Username, Email, Password, PasswordSalt,
                        FirstName, LastName, PhoneNumber, ReferralCode, 
                        Role, AccountStatus, Status,
                        AvatarUrl, Bio, CreatedAt
                    )
                    OUTPUT INSERTED.UserID, INSERTED.Role
                    VALUES (
                        @Username, @Email, @PasswordHash, @PasswordSalt,
                        @FirstName, @LastName, @PhoneNumber, @ReferralCode, 
                        @Role, @AccountStatus, @Status,
                        @AvatarUrl, @Bio, @CreatedAt
                    )
                `);
            users.push({ id: res.recordset[0].UserID, role: res.recordset[0].Role });
        }

        const adminIds = users.filter(u => u.role === 'ADMIN').map(u => u.id);
        const teacherIds = users.filter(u => u.role === 'TEACHER').map(u => u.id);
        const studentIds = users.filter(u => u.role === 'STUDENT').map(u => u.id);
        const recruiterIds = users.filter(u => u.role === 'RECRUITER').map(u => u.id);

        console.log('2. Đang tạo Categories & Skills...');
        const categories = [];
        for (let i = 0; i < 5; i++) {
            const req = new sql.Request(transaction);
            const deptName = faker.commerce.department() + i;
            const res = await req
                .input('CategoryName', sql.NVarChar(100), deptName)
                .input('Slug', sql.VarChar(100), faker.helpers.slugify(deptName).toLowerCase())
                .query(`INSERT INTO Categories (CategoryName, Slug, IsActive) OUTPUT INSERTED.CategoryID VALUES (@CategoryName, @Slug, 1)`);
            categories.push(res.recordset[0].CategoryID);
        }

        console.log('3. Đang tạo Companies (Doanh nghiệp)...');
        const companies = [];
        for (let recruiterId of recruiterIds) {
            const req = new sql.Request(transaction);
            const res = await req
                .input('CreatorID', sql.Int, recruiterId)
                .input('Name', sql.NVarChar(255), faker.company.name())
                .input('Industry', sql.NVarChar(100), faker.company.catchPhraseAdjective())
                .input('Size', sql.VarChar(50), '100-500')
                .input('Website', sql.VarChar(255), faker.internet.url())
                .input('LogoUrl', sql.VarChar(255), faker.image.urlPicsumPhotos())
                .input('Description', sql.NVarChar(sql.MAX), faker.company.catchPhrase())
                .input('Slug', sql.VarChar(255), faker.helpers.slugify(faker.company.name()).toLowerCase() + faker.string.uuid().substring(0, 8))
                .query(`
                    INSERT INTO Companies (CreatorID, Name, Slug, Industry, Size, Website, LogoUrl, Description, CreatedAt)
                    OUTPUT INSERTED.CompanyID
                    VALUES (@CreatorID, @Name, @Slug, @Industry, @Size, @Website, @LogoUrl, @Description, GETDATE())
                `);
            companies.push(res.recordset[0].CompanyID);
        }

        console.log('4. Đang tạo Courses (Bởi Teachers)...');
        const courses = [];
        for (let i = 0; i < 10; i++) {
            const teacherId = faker.helpers.arrayElement(teacherIds);
            const categoryId = faker.helpers.arrayElement(categories);
            const req = new sql.Request(transaction);
            const res = await req
                .input('TeacherID', sql.Int, teacherId)
                .input('CategoryID', sql.Int, categoryId)
                .input('Title', sql.NVarChar(255), `${faker.hacker.adjective()} ${faker.hacker.noun()} Course`)
                .input('Slug', sql.VarChar(255), faker.lorem.slug())
                .input('Description', sql.NVarChar(sql.MAX), faker.lorem.paragraphs(2))
                .input('ThumbnailUrl', sql.VarChar(255), faker.image.url({ width: 640, height: 480, category: 'education' }))
                .input('Price', sql.Decimal(18, 2), faker.commerce.price({ min: 10, max: 200 }))
                .input('Status', sql.VarChar(20), 'published')
                .input('InstructorID', sql.Int, teacherId)
                .query(`
                    INSERT INTO Courses (TeacherID, CategoryID, Title, Slug, Description, ThumbnailUrl, Price, Status, InstructorID, CreatedAt)
                    OUTPUT INSERTED.CourseID
                    VALUES (@TeacherID, @CategoryID, @Title, @Slug, @Description, @ThumbnailUrl, @Price, @Status, @InstructorID, GETDATE())
                `);
            courses.push(res.recordset[0].CourseID);

            // Create Modules for Course
            for (let m = 0; m < 3; m++) {
                const reqM = new sql.Request(transaction);
                const resM = await reqM
                    .input('CourseID', sql.Int, res.recordset[0].CourseID)
                    .input('Title', sql.NVarChar(255), `Module ${m + 1}: ${faker.hacker.verb()}`)
                    .input('SortOrder', sql.Int, m)
                    .query(`INSERT INTO CourseModules (CourseID, Title, SortOrder) OUTPUT INSERTED.ModuleID VALUES (@CourseID, @Title, @SortOrder)`);

                // Create Lessons for Module
                for (let l = 0; l < 4; l++) {
                    const reqL = new sql.Request(transaction);
                    await reqL
                        .input('ModuleID', sql.Int, resM.recordset[0].ModuleID)
                        .input('CourseID', sql.Int, res.recordset[0].CourseID)
                        .input('Title', sql.NVarChar(255), `Lesson ${l + 1}`)
                        .input('VideoUrl', sql.VarChar(255), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                        .input('SortOrder', sql.Int, l)
                        .query(`INSERT INTO Lessons (ModuleID, CourseID, Title, VideoUrl, SortOrder, CreatedAt) VALUES (@ModuleID, @CourseID, @Title, @VideoUrl, @SortOrder, GETDATE())`);
                }
            }
        }

        console.log('5. Đang tạo CourseEnrollments (Học sinh mua khóa học)...');
        console.log('--- DEBUG COURSES ARRAY:', courses);
        const enrollments = [];
        for (let studentId of studentIds) {
            // Each student enrolls in 2-4 random courses
            const enrolledCourses = faker.helpers.arrayElements(courses, faker.number.int({ min: 2, max: 4 }));
            for (let courseId of enrolledCourses) {
                const req = new sql.Request(transaction);
                const res = await req
                    .input('CourseID', sql.Int, courseId)
                    .input('StudentID', sql.Int, studentId)
                    .input('ProgressPercent', sql.Int, faker.number.int({ min: 0, max: 100 }))
                    .input('Status', sql.VarChar(50), 'active')
                    .query(`
                        INSERT INTO CourseEnrollments (CourseID, StudentID, ProgressPercent, Status, EnrolledAt, LastAccessedAt)
                        OUTPUT INSERTED.EnrollmentID
                        VALUES (@CourseID, @StudentID, @ProgressPercent, @Status, GETDATE(), GETDATE())
                    `);
                enrollments.push(res.recordset[0].EnrollmentID);
            }
        }

        console.log('6. Đang tạo Events & EventParticipants...');
        const events = [];
        for (let i = 0; i < 5; i++) {
            const organizerId = faker.helpers.arrayElement(adminIds.concat(teacherIds));
            const req = new sql.Request(transaction);
            const res = await req
                .input('OrganizerID', sql.Int, organizerId)
                .input('CreatedBy', sql.Int, organizerId)
                .input('Title', sql.NVarChar(255), `${faker.company.name()} Tech Event`)
                .input('Slug', sql.VarChar(255), faker.lorem.slug())
                .input('Description', sql.NVarChar(sql.MAX), faker.lorem.paragraph())
                .input('BannerUrl', sql.VarChar(255), faker.image.url({ width: 800, height: 400, category: 'tech' }))
                .input('EventDate', sql.Date, faker.date.future())
                .input('EventTime', sql.VarChar(20), '14:00:00')
                .input('StartAt', sql.DateTime2, faker.date.future())
                .input('EndAt', sql.DateTime2, faker.date.future())
                .input('LocationType', sql.VarChar(50), 'online')
                .input('LocationAddress', sql.NVarChar(255), faker.location.streetAddress())
                .input('IsPublic', sql.Bit, 1)
                .query(`
                    INSERT INTO Events (OrganizerID, CreatedBy, Title, Slug, Description, BannerUrl, StartAt, EndAt, EventDate, EventTime, LocationType, LocationAddress, IsPublic, CreatedAt)
                    OUTPUT INSERTED.EventID
                    VALUES (@OrganizerID, @CreatedBy, @Title, @Slug, @Description, @BannerUrl, @StartAt, @EndAt, @EventDate, @EventTime, @LocationType, @LocationAddress, @IsPublic, GETDATE())
                `);
            events.push(res.recordset[0].EventID);

            // Join students to event
            const joinedStudents = faker.helpers.arrayElements(studentIds, faker.number.int({ min: 1, max: 5 }));
            for (let sId of joinedStudents) {
                const pReq = new sql.Request(transaction);
                await pReq
                    .input('EventID', sql.Int, res.recordset[0].EventID)
                    .input('UserID', sql.Int, sId)
                    .input('Status', sql.VarChar(50), 'registered')
                    .query(`INSERT INTO EventParticipants (EventID, UserID, AttendanceStatus, RegistrationDate) VALUES (@EventID, @UserID, @Status, GETDATE())`);
            }
        }

        console.log('7. Đang tạo Posts (Mạng xã hội)...');
        const posts = [];
        for (let i = 0; i < 15; i++) {
            const authorId = faker.helpers.arrayElement(studentIds.concat(teacherIds));
            const req = new sql.Request(transaction);
            const res = await req
                .input('AuthorID', sql.Int, authorId)
                .input('Content', sql.NVarChar(sql.MAX), faker.lorem.sentences(3))
                .input('Visibility', sql.VarChar(50), 'public')
                .input('LikeCount', sql.Int, faker.number.int({ min: 0, max: 100 }))
                .input('CommentCount', sql.Int, faker.number.int({ min: 0, max: 20 }))
                .query(`
                    INSERT INTO Posts (AuthorID, Content, Visibility, LikeCount, CommentCount, CreatedAt, UpdatedAt)
                    OUTPUT INSERTED.PostID
                    VALUES (@AuthorID, @Content, @Visibility, @LikeCount, @CommentCount, GETDATE(), GETDATE())
                `);
            posts.push(res.recordset[0].PostID);

            // Add some comments
            for (let c = 0; c < 3; c++) {
                const commenterId = faker.helpers.arrayElement(studentIds);
                const cReq = new sql.Request(transaction);
                await cReq
                    .input('PostID', sql.Int, res.recordset[0].PostID)
                    .input('AuthorID', sql.Int, commenterId)
                    .input('Content', sql.NVarChar(sql.MAX), faker.lorem.sentence())
                    .query(`INSERT INTO Comments (PostID, AuthorID, Content, CreatedAt, UpdatedAt) VALUES (@PostID, @AuthorID, @Content, GETDATE(), GETDATE())`);
            }
        }

        console.log('8. Đang tạo Jobs (Tuyển dụng)...');
        for (let companyId of companies) {
            const recruiterId = faker.helpers.arrayElement(recruiterIds);
            const req = new sql.Request(transaction);
            await req
                .input('CompanyID', sql.Int, companyId)
                .input('RecruiterID', sql.Int, recruiterId)
                .input('Title', sql.NVarChar(255), faker.person.jobTitle())
                .input('Slug', sql.VarChar(255), faker.helpers.slugify(faker.person.jobTitle()).toLowerCase() + faker.string.uuid().substring(0, 8))
                .input('Description', sql.NVarChar(sql.MAX), faker.lorem.paragraphs(2))
                .input('Requirements', sql.NVarChar(sql.MAX), faker.lorem.paragraph())
                .input('JobType', sql.VarChar(50), faker.helpers.arrayElement(['FullTime', 'PartTime', 'Internship', 'Contract', 'Freelance']))
                .input('WorkModel', sql.VarChar(50), faker.helpers.arrayElement(['Remote', 'Hybrid', 'OnSite']))
                .input('ExperienceLevel', sql.VarChar(50), faker.helpers.arrayElement(['Entry', 'Mid', 'Senior', 'Lead']))
                .input('PositionsCount', sql.Int, faker.number.int({ min: 1, max: 10 }))
                .input('Location', sql.NVarChar(255), faker.location.city())
                .input('MinSalary', sql.Decimal(18, 2), faker.number.int({ min: 500, max: 1000 }))
                .input('MaxSalary', sql.Decimal(18, 2), faker.number.int({ min: 1000, max: 3000 }))
                .input('Currency', sql.VarChar(10), 'USD')
                .input('SalaryPeriod', sql.VarChar(50), 'Monthly')
                .input('Status', sql.VarChar(50), 'Published')
                .input('DeadlineAt', sql.DateTime2, faker.date.future())
                .query(`
                    INSERT INTO Jobs (CompanyID, RecruiterID, Title, Slug, Description, Requirements, JobType, WorkModel, ExperienceLevel, PositionsCount, Location, MinSalary, MaxSalary, Currency, SalaryPeriod, Status, DeadlineAt, CreatedAt, UpdatedAt)
                    VALUES (@CompanyID, @RecruiterID, @Title, @Slug, @Description, @Requirements, @JobType, @WorkModel, @ExperienceLevel, @PositionsCount, @Location, @MinSalary, @MaxSalary, @Currency, @SalaryPeriod, @Status, @DeadlineAt, GETDATE(), GETDATE())
                `);
        }

        await transaction.commit();
        console.log('✅ TRẠNG THÁI: THÀNH CÔNG! Đã nạp xong vô số data Mock được cấu trúc Foreign Key siêu việt!');

    } catch (err) {
        await transaction.rollback();
        require('fs').writeFileSync('final_err.json', JSON.stringify({ message: err.message, stack: err.stack }));
    }
    process.exit(0);
}

seed();
