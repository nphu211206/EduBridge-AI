// File: services/career-service/config/db.js
// EduBridge AI — Career Service Database Config
// Uses shared MSSQL connection string from .env

const sql = require('mssql');

const connectionString = process.env.SQL_CONN_STRING;

if (!connectionString) {
    console.error('CRITICAL: SQL_CONN_STRING is not set in .env!');
    process.exit(1);
}

const poolPromise = new sql.ConnectionPool(connectionString)
    .connect()
    .then(pool => {
        console.log('✅ Career Service: Connected to EduBridgeDB');
        return pool;
    })
    .catch(err => {
        console.error('❌ Career Service DB Error:', err.message);
        process.exit(1);
    });

module.exports = { sql, poolPromise };