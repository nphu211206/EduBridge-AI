const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sql = require('mssql');

(async () => {
  const pool = await sql.connect({
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: { encrypt: false, trustServerCertificate: true, instanceName: process.env.DB_INSTANCE_NAME || 'SQLEXPRESS01' }
  });

  // Get all NOT NULL columns without defaults
  const r = await pool.request().query(`
    SELECT c.COLUMN_NAME, c.DATA_TYPE, c.IS_NULLABLE, c.COLUMN_DEFAULT,
           cc.is_computed
    FROM INFORMATION_SCHEMA.COLUMNS c
    LEFT JOIN sys.computed_columns cc ON cc.name = c.COLUMN_NAME AND cc.object_id = OBJECT_ID('Users')
    WHERE c.TABLE_NAME = 'Users' AND c.IS_NULLABLE = 'NO'
    ORDER BY c.ORDINAL_POSITION
  `);
  
  console.log('=== NOT NULL columns ===');
  r.recordset.forEach(c => {
    console.log(c.COLUMN_NAME, ':', c.DATA_TYPE, 
      c.COLUMN_DEFAULT ? '(default: ' + c.COLUMN_DEFAULT + ')' : '(NO DEFAULT)',
      c.is_computed ? '[COMPUTED]' : '');
  });

  // Try INSERT with explicit FirstName/LastName
  console.log('\n=== INSERT TEST ===');
  try {
    const result = await pool.request()
      .input('u', sql.NVarChar, 'insertfix1')
      .input('e', sql.NVarChar, 'insertfix1@t.com')
      .input('p', sql.NVarChar, '$2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
      .input('fn', sql.NVarChar, 'Insert')
      .input('ln', sql.NVarChar, 'Fix')
      .input('dob', sql.Date, new Date('2004-01-15'))
      .input('sch', sql.NVarChar, 'TestSchool')
      .query(`
        INSERT INTO Users (
          Username, Email, Password, FirstName, LastName,
          DateOfBirth, School, Role, OnlineStatus,
          AccountStatus, RegistrationSource, IsEmailVerified,
          CreatedAt, UpdatedAt
        )
        OUTPUT INSERTED.UserID
        VALUES (
          @u, @e, @p, @fn, @ln,
          @dob, @sch, 'STUDENT', 'OFFLINE',
          'ACTIVE', 'local', 0,
          GETDATE(), GETDATE()
        )
      `);
    console.log('SUCCESS! UserID:', result.recordset[0].UserID);
  } catch(e) {
    console.log('FAILED:', e.message);
    console.log('Number:', e.number);
  }

  await pool.close();
  process.exit(0);
})();
