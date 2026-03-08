const courseController = require('./controllers/courseController');
const { connectDB } = require('./config/db');

(async () => {
    try {
        await connectDB();
        await courseController.getUserEnrollments({ user: { id: 4 } }, {
            status: (code) => {
                console.log('STATUS CODE:', code);
                return { json: (data) => console.log('DATA:', data) };
            }
        });
    } catch (e) {
        console.error('CRASH:', e);
    }
    process.exit();
})();
