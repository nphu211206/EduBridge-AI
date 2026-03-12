const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const sql = require('mssql');
const fs = require('fs');

const config = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'EduBridgeAI_Enterprise',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  options: { encrypt: false, trustServerCertificate: true, instanceName: process.env.DB_INSTANCE_NAME || 'SQLEXPRESS01' }
};

(async () => {
  try {
    const pool = await sql.connect(config);

    // Get ALL triggers on Users
    const r = await pool.request().query(`
      SELECT t.name, t.is_disabled, OBJECT_DEFINITION(t.object_id) AS def
      FROM sys.triggers t
      JOIN sys.tables tab ON t.parent_id = tab.object_id
      WHERE tab.name = 'Users'
    `);
    
    let output = '';
    for (const row of r.recordset) {
      output += `TRIGGER: ${row.name} (disabled: ${row.is_disabled})\n`;
      output += `DEFINITION:\n${row.def}\n\n===END===\n\n`;
    }
    
    if (r.recordset.length === 0) {
      output = 'NO TRIGGERS FOUND ON Users TABLE';
    }
    
    const outPath = path.resolve(__dirname, 'trigger_dump.txt');
    fs.writeFileSync(outPath, output, 'utf8');
    console.log('Written to: ' + outPath);
    console.log('Triggers found: ' + r.recordset.length);
    console.log('Names: ' + r.recordset.map(x => x.name).join(', '));

    // Also try: DISABLE all triggers and test INSERT
    console.log('\n--- Disabling triggers and testing ---');
    await pool.request().query(`DISABLE TRIGGER ALL ON Users`);
    console.log('All triggers disabled');

    try {
      const insertR = await pool.request()
        .input('u', sql.NVarChar, 'notrigtest')
        .input('e', sql.NVarChar, 'notrigtest@t.com')
        .input('p', sql.NVarChar, 'hash123hash123hash123hash123hash123hash123hash123hash')
        .input('fn', sql.NVarChar, 'No Trig Test')
        .input('dob', sql.Date, new Date('2004-01-15'))
        .input('sch', sql.NVarChar, 'TestSchool')
        .query(`
          INSERT INTO Users (Username, Email, Password, FullName, DateOfBirth, School, Role, OnlineStatus, AccountStatus, RegistrationSource, IsEmailVerified, CreatedAt, UpdatedAt)
          OUTPUT INSERTED.UserID
          VALUES (@u, @e, @p, @fn, @dob, @sch, 'STUDENT', 'OFFLINE', 'ACTIVE', 'local', 0, GETDATE(), GETDATE())
        `);
      console.log('INSERT SUCCESS! UserID: ' + insertR.recordset[0].UserID);
    } catch(e) {
      console.log('INSERT STILL FAILED: ' + e.message);
    }

    // Keep triggers disabled for now so registration works
    console.log('Triggers remain DISABLED for now');

    await pool.close();
  } catch(e) {
    console.error('ERR:', e.message);
  }
  process.exit(0);
})();
