const fs = require('fs');

function extractTables() {
    const file = 'EduBridgeAI_Master_Database.sql';
    // The master file might be utf16le or utf8
    let content = fs.readFileSync(file, 'utf16le');
    if (!content.includes('CREATE TABLE')) {
        content = fs.readFileSync(file, 'utf8');
    }

    const targets = ['courses', 'events', 'reports', 'coursemodules', 'courselessons', 'courseenrollments'];

    let extractedSQL = '';

    for (const target of targets) {
        const regex = new RegExp(`CREATE\\s+TABLE\\s+(?:\\[dbo\\]\\.)?\\[?${target}\\]?[\\s\\S]*?(?:GO(?:\\r?\\n|\\s*$))`, 'gi');
        let match = regex.exec(content);

        // If not found with GO, try just ending before next CREATE TABLE
        if (!match) {
            const fallbackRegex = new RegExp(`CREATE\\s+TABLE\\s+(?:\\[dbo\\]\\.)?\\[?${target}\\]?[\\s\\S]*?(?=CREATE\\s+TABLE|$)`, 'gi');
            match = fallbackRegex.exec(content);
        }

        if (match) {
            extractedSQL += match[0] + '\n\n';
            console.log(`Extracted ${target}`);
        } else {
            console.log(`NOT FOUND: ${target}`);
        }
    }

    fs.writeFileSync('missing_tables.sql', extractedSQL, 'utf8');
    console.log('Saved to missing_tables.sql');
}
extractTables();
