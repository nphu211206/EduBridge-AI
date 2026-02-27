// File: services/portfolio-service/routes/external.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const externalService = require('../services/external.service');

// GET /api/portfolio/external/platforms — Get supported platforms
router.get('/platforms', (req, res) => {
    const platforms = externalService.getSupportedPlatforms();
    res.json({ success: true, data: platforms });
});

// POST /api/portfolio/external/connect — Connect a platform
router.post('/connect', authenticate, async (req, res) => {
    try {
        const { platform, profileUrl } = req.body;
        if (!platform || !profileUrl) {
            return res.status(400).json({ success: false, message: 'platform and profileUrl required.' });
        }
        const result = await externalService.connectProfile(req.user.id, platform, profileUrl);
        res.json({ success: true, data: result, message: `${platform} connected. AI evaluation in progress...` });
    } catch (err) {
        console.error('Connect profile error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// POST /api/portfolio/external/resync/:platform — Re-sync profile data
router.post('/resync/:platform', authenticate, async (req, res) => {
    try {
        const result = await externalService.resyncProfile(req.user.id, req.params.platform);
        res.json({ success: true, data: result, message: 'Profile re-synced.' });
    } catch (err) {
        console.error('Resync profile error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/portfolio/external/:platform — Disconnect
router.delete('/:platform', authenticate, async (req, res) => {
    try {
        await externalService.disconnectProfile(req.user.id, req.params.platform);
        res.json({ success: true, message: `${req.params.platform} disconnected.` });
    } catch (err) {
        console.error('Disconnect profile error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
