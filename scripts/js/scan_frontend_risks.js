const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'frontend');

// Common risky patterns in React
const patterns = [
    { regex: /(?<!\?)\.map\(/g, name: 'Unsafe .map() (missing ?.)' },
    { regex: /(?<!\?)\.length/g, name: 'Unsafe .length (missing ?.)' },
    { regex: /(?<!\?)\.filter\(/g, name: 'Unsafe .filter() (missing ?.)' },
    { regex: /localhost:500/g, name: 'Hardcoded localhost API' }
];

let issuesFound = 0;
let fileCount = 0;

function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== 'build' && file !== '.git') {
                scanDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            fileCount++;
            const content = fs.readFileSync(fullPath, 'utf8');

            // Skip large generated files completely
            if (content.length > 500000) continue;

            const lines = content.split('\n');
            let fileIssues = [];

            lines.forEach((line, index) => {
                // Ignore comments
                if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;

                patterns.forEach(pattern => {
                    if (pattern.regex.test(line)) {
                        // For .length and .map, we want to ignore things like string.length or array literal [].map
                        // This is a rough heuristic, but helps flag potentially crash-prone code
                        // We will filter out obvious safe ones (e.g., e.target.value.length)
                        if (pattern.name.includes('.length') && (line.includes('.trim().length') || line.includes('target.value.length'))) return;

                        fileIssues.push(`  Line ${index + 1}: [${pattern.name}] -> ${line.trim().substring(0, 100)}`);
                    }
                });
            });

            if (fileIssues.length > 0) {
                // To avoid overwhelming output, only log if it's a true high risk (we'll just count them for now)
                issuesFound += fileIssues.length;
                // console.log(`\n📄 ${fullPath.replace(projectRoot, '')}`);
                // console.log(fileIssues.join('\n'));
            }
        }
    }
}

console.log('🔍 BẮT ĐẦU QUÉT MÃ NGUỒN FRONTEND (TÌM RỦI RO CRASH UI)...');
scanDirectory(projectRoot);
console.log(`\n✅ Đã quét ${fileCount} files.`);
console.log(`⚠️ Tìm thấy ${issuesFound} vị trí có mã nguy hiểm (Unsafe array operations hoặc hardcoded API).`);
console.log('Code JS trong React thường xuyên crash nếu gọi .map() hoặc .length trên biến undefined. Việc thêm dấu (?.) sẽ an toàn 100%.');

// We will write the full report to a file so we can inspect the worst offenders
let detailedReport = '';
function generateDetailedReport(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', 'dist', 'build', '.git'].includes(file)) generateDetailedReport(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            let fileIssues = [];
            lines.forEach((line, index) => {
                if (line.trim().startsWith('//')) return;
                patterns.forEach(pattern => {
                    if (pattern.regex.test(line)) {
                        if (pattern.name.includes('.length') && (line.includes('.trim().length') || line.includes('value.length'))) return;
                        fileIssues.push(`L${index + 1}: [${pattern.name}] ${line.trim()}`);
                    }
                });
            });
            if (fileIssues.length > 0) {
                detailedReport += `\nFile: ${fullPath.replace(__dirname, '')}\n` + fileIssues.join('\n') + '\n';
            }
        }
    }
}
generateDetailedReport(projectRoot);
fs.writeFileSync('frontend_risk_report.txt', detailedReport);
console.log(`Đã xuất báo cáo chi tiết ra frontend_risk_report.txt`);
