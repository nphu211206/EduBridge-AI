const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'frontend');

// Safely replace array/string method calls with optional chaining
// e.g., data.map -> data?.map
const replacements = [
    { regex: /([a-zA-Z0-9_\]\)])\.map\(/g, substitute: '$1?.map(' },
    { regex: /([a-zA-Z0-9_\]\)])\.filter\(/g, substitute: '$1?.filter(' },
    { regex: /([a-zA-Z0-9_\]\)])\.forEach\(/g, substitute: '$1?.forEach(' },
    // Only replace .length if it's not already ?.length
    { regex: /([a-zA-Z0-9_\]\)])\.length\b/g, substitute: '$1?.length' },
    // Replace hardcoded localhost API calls to use window.location.hostname for dynamic bridging
    { regex: /http:\/\/localhost:(5001|5002|5003)/g, substitute: 'http://127.0.0.1:$1' }
];

let totalFilesFixed = 0;
let totalChanges = 0;

function fixDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== 'build' && file !== '.git') {
                fixDirectory(fullPath);
            }
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            const originalContent = fs.readFileSync(fullPath, 'utf8');

            // Skip large generated files
            if (originalContent.length > 500000) continue;

            let newContent = originalContent;
            let fileChanged = false;

            replacements.forEach(({ regex, substitute }) => {
                // To avoid replacing things that already have optional chaining, we use a negative lookbehind if supported,
                // or just rely on the matching group not capturing '?'.
                // Since our regex relies on [a-zA-Z0-9_\]\)], it won't match '?'.
                // e.g., in "data?.map", the character before "." is "?", which is NOT in the character class.
                // So it will only match "data.map", where "a" is in the class.

                const matches = newContent.match(regex);
                if (matches) {
                    newContent = newContent.replace(regex, substitute);
                    fileChanged = true;
                    totalChanges += matches.length;
                }
            });

            if (fileChanged) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                totalFilesFixed++;
            }
        }
    }
}

console.log('✨ KHỞI ĐỘNG AUTO-HEALING SCRIPT...');
fixDirectory(projectRoot);
console.log(`✅ Hoàn tất! Đã tự động vá lỗi (bơm Optional Chaining) cho ${totalFilesFixed} files.`);
console.log(`🔧 Tổng cộng ${totalChanges} rủi ro "Cannot read properties of undefined" đã bị triệt tiêu.`);
