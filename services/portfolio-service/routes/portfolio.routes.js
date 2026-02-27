// File: services/portfolio-service/routes/portfolio.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const portfolioService = require('../services/portfolio.service');
const aiEvaluator = require('../services/ai-evaluator.service');

// GET /api/portfolio/me — Get my portfolio (with items, skills, external profiles)
router.get('/me', authenticate, async (req, res) => {
    try {
        await portfolioService.getOrCreatePortfolio(req.user.id);
        const data = await portfolioService.getFullPortfolio(req.user.id);
        res.json({ success: true, data });
    } catch (err) {
        console.error('Get my portfolio error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/portfolio/user/:userId — Get public portfolio
router.get('/user/:userId', async (req, res) => {
    try {
        const data = await portfolioService.getFullPortfolio(req.params.userId);
        if (!data || !data.portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found.' });
        if (!data.portfolio.IsPublic) return res.status(403).json({ success: false, message: 'Portfolio is private.' });
        res.json({ success: true, data });
    } catch (err) {
        console.error('Get public portfolio error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/portfolio/me — Update my portfolio header
router.put('/me', authenticate, async (req, res) => {
    try {
        await portfolioService.getOrCreatePortfolio(req.user.id);
        const updated = await portfolioService.updatePortfolio(req.user.id, req.body);
        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('Update portfolio error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/portfolio/me/evaluate — Trigger full portfolio AI evaluation
router.post('/me/evaluate', authenticate, async (req, res) => {
    try {
        const data = await portfolioService.getFullPortfolio(req.user.id);
        if (!data) return res.status(404).json({ success: false, message: 'Portfolio not found.' });

        const fieldCategory = data.portfolio.FieldCategory || data.user?.FieldCategory || 'General';
        const summary = await aiEvaluator.generatePortfolioSummary(fieldCategory, data.items, data.skills);

        await portfolioService.updateAiSummary(
            data.portfolio.PortfolioID,
            summary.overallScore,
            JSON.stringify(summary)
        );

        res.json({ success: true, data: summary });
    } catch (err) {
        console.error('Evaluate portfolio error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
