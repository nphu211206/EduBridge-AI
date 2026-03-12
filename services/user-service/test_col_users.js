const { connectDB } = require('./config/db.js');
connectDB().then(async p => {
    try {
        const res = await p.request().query("SELECT name, system_type_id FROM sys.columns WHERE object_id = OBJECT_ID('Users')");
        console.dir(res.recordset);
    } catch (e) {
        console.error("ERR:", e.message);
    }
    process.exit(0);
});
