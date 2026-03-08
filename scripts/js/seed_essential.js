const sql = require('mssql');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const config = {
    user: 'sa',
    password: '123456',
    server: 'localhost',
    database: 'EduBridgeAI_Enterprise',
    options: { encrypt: false, trustServerCertificate: true, instanceName: 'SQLEXPRESS01' }
};

async function seed() {
    const errors = [];
    try {
        const pool = await sql.connect(config);
        const pwdHash = await bcrypt.hash('Admin@123', 10);

        // ====== 1. USERS ======
        // Check if admin exists
        let adminCheck = await pool.request().query("SELECT UserID FROM Users WHERE Username = 'admin'");
        if (adminCheck.recordset.length === 0) {
            console.log("Creating admin user...");
            try {
                await pool.request().query(`
                    INSERT INTO Users (
                        Username, Email, Password, PasswordSalt, 
                        FirstName, LastName, Role, AccountStatus, Status,
                        IsEmailVerified, IsPhoneVerified, IsActive, IsBanned,
                        OnlineStatus, TotalPoints, Level, EduCoinsBalance,
                        CreatedAt, UpdatedAt, ReferralCode
                    ) VALUES (
                        'admin', 'admin@edubridge.edu.vn', '${pwdHash}', 'bcrypt_auto',
                        N'System', N'Admin', 'ADMIN', 'ACTIVE', 'ONLINE',
                        1, 0, 1, 0,
                        'online', 0, 1, 0,
                        GETDATE(), GETDATE(), 'REF_ADMIN'
                    )
                `);
                console.log("  -> Admin created OK");
            } catch (e) { errors.push('Admin: ' + e.message); console.log('  -> Admin FAIL:', e.message); }
        } else {
            console.log("Admin exists, updating password...");
            await pool.request().query(`UPDATE Users SET Password = '${pwdHash}' WHERE Username = 'admin'`);
        }

        // Create teacher user
        let teacherCheck = await pool.request().query("SELECT UserID FROM Users WHERE Username = 'teacher@edubridge.edu.vn' OR Username = 'teacher_hoang'");
        if (teacherCheck.recordset.length === 0) {
            console.log("Creating teacher user...");
            try {
                await pool.request().query(`
                    INSERT INTO Users (
                        Username, Email, Password, PasswordSalt,
                        FirstName, LastName, Role, AccountStatus, Status,
                        IsEmailVerified, IsPhoneVerified, IsActive, IsBanned,
                        OnlineStatus, TotalPoints, Level, EduCoinsBalance,
                        CreatedAt, UpdatedAt, ReferralCode
                    ) VALUES (
                        'teacher_hoang', 'teacher@edubridge.edu.vn', '${pwdHash}', 'bcrypt_auto',
                        N'Hoang', N'Teacher', 'TEACHER', 'ACTIVE', 'ONLINE',
                        1, 0, 1, 0,
                        'online', 0, 1, 0,
                        GETDATE(), GETDATE(), 'REF_TEACHER'
                    )
                `);
                console.log("  -> Teacher created OK");
            } catch (e) { errors.push('Teacher: ' + e.message); console.log('  -> Teacher FAIL:', e.message); }
        }

        // Create student users
        for (const [uname, email, fn, ln, ref] of [
            ['student_nam', 'nam@gmail.com', 'Hai', 'Nam', 'REF_NAM'],
            ['student_lan', 'lan@gmail.com', 'Huong', 'Lan', 'REF_LAN'],
            ['student_minh', 'minh@gmail.com', 'Duc', 'Minh', 'REF_MINH'],
        ]) {
            let check = await pool.request().query(`SELECT UserID FROM Users WHERE Username = '${uname}'`);
            if (check.recordset.length === 0) {
                try {
                    await pool.request().query(`
                        INSERT INTO Users (
                            Username, Email, Password, PasswordSalt,
                            FirstName, LastName, Role, AccountStatus, Status,
                            IsEmailVerified, IsPhoneVerified, IsActive, IsBanned,
                            OnlineStatus, TotalPoints, Level, EduCoinsBalance,
                            CreatedAt, UpdatedAt, ReferralCode
                        ) VALUES (
                            '${uname}', '${email}', '${pwdHash}', 'bcrypt_auto',
                            N'${fn}', N'${ln}', 'STUDENT', 'ACTIVE', 'ONLINE',
                            1, 0, 1, 0,
                            'online', 500, 2, 1000,
                            GETDATE(), GETDATE(), '${ref}'
                        )
                    `);
                    console.log(`  -> ${uname} created OK`);
                } catch (e) { errors.push(`${uname}: ${e.message}`); }
            }
        }

        // Get IDs
        const adminID = (await pool.request().query("SELECT UserID FROM Users WHERE Username = 'admin'")).recordset[0]?.UserID;
        const teacherID = (await pool.request().query("SELECT UserID FROM Users WHERE Username = 'teacher_hoang'")).recordset[0]?.UserID || adminID;
        console.log(`Admin ID: ${adminID}, Teacher ID: ${teacherID}`);

        // ====== 2. COURSES ======
        let courseCheck = await pool.request().query("SELECT COUNT(*) as c FROM Courses");
        if (courseCheck.recordset[0].c === 0) {
            console.log("Seeding courses...");
            try {
                await pool.request().query(`
                    INSERT INTO Courses (TeacherID, Title, Slug, Description, Status, Price, Currency, IsFree, TotalLessons, TotalStudents, AverageRating, TotalReviews, TotalRevenue, CertificateEnabled, IsPublic, CreatedAt, UpdatedAt)
                    VALUES 
                    (${teacherID}, N'React JS Mastery', 'react-mastery', N'Khoa hoc React tu co ban den nang cao', 'published', 1500000, 'VND', 0, 24, 350, 4.8, 15, 5000000, 1, 1, GETDATE(), GETDATE()),
                    (${teacherID}, N'Node.js Backend Pro', 'nodejs-backend', N'RESTful API voi Node.js va Express', 'published', 0, 'VND', 1, 18, 1200, 4.9, 42, 0, 1, 1, GETDATE(), GETDATE()),
                    (${teacherID}, N'Python Data Science', 'python-data', N'Phan tich du lieu voi Python', 'draft', 500000, 'VND', 0, 12, 0, 0, 0, 0, 0, 0, GETDATE(), GETDATE())
                `);
                console.log("  -> Courses seeded OK");
            } catch (e) { errors.push('Courses: ' + e.message); console.log('  -> Courses FAIL:', e.message); }
        }

        // ====== 3. EVENTS ======
        let eventCheck = await pool.request().query("SELECT COUNT(*) as c FROM Events");
        if (eventCheck.recordset[0].c === 0) {
            console.log("Seeding events...");
            try {
                await pool.request().query(`
                    INSERT INTO Events (OrganizerID, Title, Slug, Description, Category, LocationType, StartAt, EndAt, IsPublic, RequiresTicket, CreatedAt, EventDate, EventTime)
                    VALUES 
                    (${adminID}, N'Tech Meetup Ha Noi 2026', 'tech-meetup-2026', N'Gap go cong dong lap trinh Ha Noi', N'Technology', N'online', '2026-04-01 10:00:00', '2026-04-01 17:00:00', 1, 0, GETDATE(), '2026-04-01', '10:00:00'),
                    (${adminID}, N'AI Hackathon Vietnam', 'ai-hackathon-vn', N'Cuoc thi lap trinh AI lon nhat Viet Nam', N'Competition', N'offline', '2026-05-15 09:00:00', '2026-05-17 18:00:00', 1, 1, GETDATE(), '2026-05-15', '09:00:00'),
                    (${adminID}, N'Workshop Web Security', 'web-security-ws', N'Hoi thao bao mat ung dung web', N'Workshop', N'online', '2026-06-01 14:00:00', '2026-06-01 17:00:00', 1, 0, GETDATE(), '2026-06-01', '14:00:00')
                `);
                console.log("  -> Events seeded OK");
            } catch (e) { errors.push('Events: ' + e.message); console.log('  -> Events FAIL:', e.message); }
        }

        // ====== 4. REPORTS ======
        let reportCheck = await pool.request().query("SELECT COUNT(*) as c FROM Reports");
        if (reportCheck.recordset[0].c === 0) {
            console.log("Seeding reports...");
            try {
                await pool.request().query(`
                    INSERT INTO Reports (Title, Content, Category, ReporterID, TargetID, TargetType, Status)
                    VALUES 
                    (N'Spam binh luan', N'Nguoi dung dang link quang cao lien tuc', 'COMMENT', ${adminID}, 1, 'Comment', 'PENDING'),
                    (N'Noi dung khong phu hop', N'Bai viet co noi dung xuc pham', 'CONTENT', ${adminID}, 2, 'Post', 'PENDING'),
                    (N'Vi pham ban quyen', N'Khoa hoc copy noi dung khong xin phep', 'COURSE', ${adminID}, 1, 'Course', 'RESOLVED')
                `);
                console.log("  -> Reports seeded OK");
            } catch (e) { errors.push('Reports: ' + e.message); console.log('  -> Reports FAIL:', e.message); }
        }

        // ====== SUMMARY ======
        const userCnt = (await pool.request().query("SELECT COUNT(*) as c FROM Users")).recordset[0].c;
        const courseCnt = (await pool.request().query("SELECT COUNT(*) as c FROM Courses")).recordset[0].c;
        const eventCnt = (await pool.request().query("SELECT COUNT(*) as c FROM Events")).recordset[0].c;
        const reportCnt = (await pool.request().query("SELECT COUNT(*) as c FROM Reports")).recordset[0].c;

        console.log(`\n=== SEED SUMMARY ===`);
        console.log(`Users: ${userCnt} | Courses: ${courseCnt} | Events: ${eventCnt} | Reports: ${reportCnt}`);

        if (errors.length > 0) {
            fs.writeFileSync('seed_errors.txt', errors.join('\n'));
            console.log(`\nWarnings: ${errors.length} (see seed_errors.txt)`);
        } else {
            console.log('\nAll seeds completed successfully!');
        }

        process.exit(0);
    } catch (e) {
        console.error("Fatal:", e.message);
        process.exit(1);
    }
}
seed();
