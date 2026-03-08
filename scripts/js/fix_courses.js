const fs = require('fs');
const path = require('path');

const filesToFix = [
    './services/user-service/controllers/courseController.js',
    './services/user-service/server.js'
];

for (const file of filesToFix) {
    const fullPath = path.resolve(__dirname, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Fix c.IsPublished = 1 -> c.Status = 'published'
        content = content.replace(/c\.IsPublished\s*=\s*1/g, "c.Status = 'published'");

        // Fix IsPublished = 1 -> Status = 'published' 
        content = content.replace(/IsPublished\s*=\s*1/g, "Status = 'published'");

        // Fix IsPublished: true -> Status: 'published'
        content = content.replace(/IsPublished:\s*true/g, "Status: 'published'");

        // Fix COALESCE(c.IsPublished, 0) -> c.Status
        content = content.replace(/COALESCE\(c\.IsPublished,\s*0\)\s*as\s*IsPublished/g, "c.Status");

        fs.writeFileSync(fullPath, content);
        console.log('Fixed:', file);
    }
}
