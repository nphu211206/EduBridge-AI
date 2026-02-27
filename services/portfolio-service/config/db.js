// File: services/portfolio-service/config/db.js
const sql = require('mssql');

const connectionString = process.env.SQL_CONN_STRING;
if (!connectionString) {
    console.error('CRITICAL: SQL_CONN_STRING not set!');
    process.exit(1);
}

const poolPromise = new sql.ConnectionPool(connectionString)
    .connect()
    .then(pool => { console.log('✅ Portfolio Service: DB connected'); return pool; })
    .catch(err => { console.error('❌ Portfolio DB Error:', err.message); process.exit(1); });

module.exports = { sql, poolPromise };
