const CourseEnrollment = require('./models/CourseEnrollment');

(async () => {
    try {
        const res = await CourseEnrollment.findAll({ limit: 1 });
        console.log('Success:', res.length);
    } catch (e) {
        console.error('SEQUELIZE ERROR:', e);
    }
    process.exit();
})();
