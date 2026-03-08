const { connectDB, sql } = require('./services/user-service/config/db');

async function getColumns() {
    const pool = await connectDB();
    const res = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Posts'");
    console.log("POST COLUMNS:", res.recordset.map(r => r.COLUMN_NAME).join(', '));
    process.exit(0);
}

getColumns().catch(console.error);
