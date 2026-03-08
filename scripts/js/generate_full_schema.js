const { poolPromise, sql } = require('./services/teacher-service/config/database');
const fs = require('fs');

(async () => {
    try {
        const pool = await poolPromise;
        const tablesReq = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
        const tables = tablesReq.recordset.map(t => t.TABLE_NAME);
        const result = {};

        for (const t of tables) {
            const req = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t}'`);
            result[t] = req.recordset.map(r => ({ name: r.COLUMN_NAME, type: r.DATA_TYPE }));
        }

        fs.writeFileSync('schema-full.json', JSON.stringify(result, null, 2));
        console.log('Schema dumped to schema-full.json');
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
})();
