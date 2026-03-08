const fs = require('fs');

function findTables(file) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const regex = /CREATE TABLE \[(?:dbo\]\.\[)?([^\]]+)\]|CREATE TABLE ([A-Za-z0-9_]+)/gi;
    let match;
    const tables = [];
    while ((match = regex.exec(content)) !== null) {
        tables.push(match[1] || match[2]);
    }
    console.log(`\n=== Tables in ${file} ===`);
    console.log(tables.join(', ') || 'None found');
}

findTables('EduBridgeAI_Master_Database.sql');
findTables('dbo/eduledger-original-schema.sql');
findTables('dbo/data.sql');
findTables('Dummy_Data_Seed.sql');
