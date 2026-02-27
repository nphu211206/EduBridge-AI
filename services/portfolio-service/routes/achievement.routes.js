// routes/achievement.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const achievementService = require('../services/achievement.service');

router.get('/me', authenticate, async (req, res) => {
    try {
        const data = await achievementService.getUserAchievements(req.user.id);
        res.json({ success: true, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/check', authenticate, async (req, res) => {
    try {
        const newBadges = await achievementService.checkAndGrantBadges(req.user.id);
        res.json({ success: true, data: { newBadges, count: newBadges.length } });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/streak', authenticate, async (req, res) => {
    try {
        const streak = await achievementService.updateStreak(req.user.id);
        res.json({ success: true, data: streak });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
