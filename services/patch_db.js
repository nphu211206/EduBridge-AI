const fs = require('fs');
const files = [
    'career-service/config/db.js',
    'portfolio-service/config/db.js',
    'user-service/config/db.js',
    'teacher-service/config/database.js',
    'teacher-service/config/db.js',
    'admin-sinhvienservice/src/config/db.js'
];

files.forEach(f => {
    try {
        const fullPath = 'C:/Users/Admin/.gemini/antigravity/scratch/edubridge-ai-frontend/services/' + f;
        if (!fs.existsSync(fullPath)) return;
        let content = fs.readFileSync(fullPath, 'utf8');

        if (content.includes('instanceName')) return;

        // Replace server
        content = content.replace(/server:\s*process\.env\.DB_SERVER\s*\|\|\s*['"]localhost['"]/g, "server: (process.env.DB_SERVER || 'localhost').split('\\\\')[0]");

        // Inject instanceName
        content = content.replace(/options:\s*\{/g, "options: {\n    instanceName: (process.env.DB_SERVER || 'localhost').split('\\\\')[1],");

        fs.writeFileSync(fullPath, content);
        console.log('Patched', f);
    } catch (e) { console.error(e) }
});
