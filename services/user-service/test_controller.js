const courseController = require('./controllers/courseController');
courseController.getUserEnrollments({ user: { id: 4 } }, {
    status: (code) => ({
        json: (data) => console.log('STATUS:', code, 'DATA:', data)
    })
}).catch(e => console.error('CRASH:', e));
