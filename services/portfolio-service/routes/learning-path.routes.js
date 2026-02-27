// routes/learning-path.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const lpService = require('../services/learning-path.service');

router.post('/generate', authenticate, async (req, res) => {
    try {
        const { careerGoal, fieldCategory } = req.body;
        if (!careerGoal) return res.status(400).json({ success: false, message: 'careerGoal required' });
        const result = await lpService.generatePath(req.user.id, careerGoal, fieldCategory);
        res.json({ success: true, data: result });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/me', authenticate, async (req, res) => {
    try {
        const paths = await lpService.getMyPaths(req.user.id);
        res.json({ success: true, data: paths });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/milestone/:milestoneId/complete', authenticate, async (req, res) => {
    try {
        await lpService.completeMilestone(req.user.id, req.params.milestoneId);
        res.json({ success: true, message: 'Milestone completed!' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
