const fs = require('fs');
const path = require('path');
const base_dir = 'c:/Users/Admin/.gemini/antigravity/scratch/EduBridge-AI/services';
const dirs = ['admin-service', 'career-service', 'portfolio-service', 'teacher-service', 'admin-sinhvienservice', 'user-sinhvienservice'];

for (let d of dirs) {
    let p = path.join(base_dir, d, 'config', 'db.js');
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(/database: process\.env\.DB_NAME \|\| '[^']+'/, "database: 'EduBridgeAI_Enterprise'");
        content = content.replace(/server: process\.env\.DB_SERVER \|\| '[^']+'/, "server: 'localhost'");
        if (!content.includes("port: 61654")) {
            content = content.replace(/options:/, "port: 61654,\n    options:");
        }
        fs.writeFileSync(p, content);
        console.log('Fixed:', p);
    }
}
