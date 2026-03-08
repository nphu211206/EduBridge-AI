const s = require('./schema-full.json');
const checks = {
    Categories: ['CategoryName', 'Slug', 'IsActive'],
    Companies: ['CreatorID', 'Name', 'Industry', 'Size', 'Website', 'LogoUrl', 'Description', 'CreatedAt'],
    Courses: ['TeacherID', 'CategoryID', 'Title', 'Slug', 'Description', 'ThumbnailUrl', 'Price', 'Status', 'InstructorID', 'CreatedAt'],
    CourseModules: ['CourseID', 'Title', 'SortOrder'],
    CourseLessons: ['ModuleID', 'Title', 'Type', 'VideoUrl', 'SortOrder'],
    CourseEnrollments: ['CourseID', 'StudentID', 'ProgressPercent', 'Status', 'EnrolledAt', 'LastAccessedAt'],
    Events: ['OrganizerID', 'CreatedBy', 'Title', 'Slug', 'Description', 'BannerUrl', 'EventDate', 'EventTime', 'LocationType', 'LocationAddress', 'IsPublic', 'CreatedAt'],
    EventParticipants: ['EventID', 'UserID', 'Status', 'RegisteredAt'],
    Posts: ['AuthorID', 'Content', 'Visibility', 'LikeCount', 'CommentCount', 'CreatedAt', 'UpdatedAt'],
    Comments: ['PostID', 'AuthorID', 'Content', 'CreatedAt', 'UpdatedAt'],
    Jobs: ['CompanyID', 'RecruiterID', 'Title', 'Description', 'Requirements', 'JobType', 'Location', 'SalaryMin', 'SalaryMax', 'Currency', 'Status', 'ExpiresAt', 'CreatedAt']
};

for (const t in checks) {
    if (!s[t]) {
        console.log(`[ERROR] TABLE NOT FOUND: ${t}`);
        continue;
    }
    const cols = s[t].map(c => c.name);
    const invalid = checks[t].filter(c => !cols.includes(c));
    if (invalid.length > 0) {
        console.log(`[INVALID COLUMNS] ${t}: ${invalid.join(', ')}`);
    } else {
        console.log(`[OK] ${t}`);
    }
}
