const fs = require('fs');

function findTables(file) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf16le'); // Try utf16le just in case
    const contentUtf8 = fs.readFileSync(file, 'utf8');

    // Check both encodings
    for (const text of [content, contentUtf8]) {
        const regex = /CREATE TABLE \[(?:dbo\]\.\[)?([^\]]+)\]|CREATE TABLE ([A-Za-z0-9_]+)/gi;
        let match;
        const tables = [];
        while ((match = regex.exec(text)) !== null) {
            tables.push((match[1] || match[2]).toLowerCase());
        }

        const targets = ['courses', 'events', 'reports', 'coursemodules', 'courselessons'];
        const found = tables.filter(t => targets.some(target => t.includes(target)));
        if (found.length > 0) {
            console.log(`\n=== Found in ${file} ===`);
            console.log([...new Set(found)].join(', '));
            return;
        }
    }
}

['EduBridgeAI_Master_Database.sql', 'dbo/eduledger-original-schema.sql', 'dbo/data.sql'].forEach(findTables);
