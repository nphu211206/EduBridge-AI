const CourseEnrollment = require('./models/CourseEnrollment');

(async () => {
    try {
        const res = await CourseEnrollment.findAll({ limit: 1 });
        console.log('Success:', res.length);
    } catch (e) {
        console.error('SEQUELIZE ERROR NAME:', e.name);
        console.error('SEQUELIZE ERROR MESSAGE:', e.message);
        if (e.original) {
            console.error('ORIGINAL MESSAGE:', e.original.message);
        }
    }
    process.exit();
})();
