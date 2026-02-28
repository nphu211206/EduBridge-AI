const sql = require('mssql');

const config = {
    user: 'sa',
    password: '123456aA@$',
    server: 'localhost\\SQLEXPRESS01',
    database: 'CampusLearning',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    try {
        console.log("Attempting to connect to the database...");
        await sql.connect(config);
        console.log("Connected to database successfully!");

        // Count users if connected
        const result = await sql.query`SELECT count(*) as count FROM Users`;
        console.log("Users count:", result.recordset[0].count);

    } catch (err) {
        console.error("Database connection failed:");
        console.error(err.message);
    } finally {
        process.exit();
    }
}

testConnection();
