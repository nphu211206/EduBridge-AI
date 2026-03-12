const { connectDB } = require('./config/db.js');
connectDB().then(async p => {
    try {
        const res = await p.request().query("SELECT STRING_AGG(name, ', ') as cols FROM sys.columns WHERE object_id = OBJECT_ID('Users')");
        console.log(res.recordset[0].cols);
    } catch (e) {
        console.error("ERR:", e.message);
    }
    process.exit(0);
});
