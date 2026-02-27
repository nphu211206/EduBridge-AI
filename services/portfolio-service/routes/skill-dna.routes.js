// routes/skill-dna.routes.js + insights.routes.js combined
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sql, poolPromise } = require('../config/db');

// ========== SKILL DNA ==========

// GET /api/skill-dna/me — Get my skill DNA radar data
router.get('/me', authenticate, async (req, res) => {
    try {
        const pool = await poolPromise;
        const userId = req.user.id;

        // Get skills grouped by dimension
        const result = await pool.request().input('uid', sql.BigInt, userId).query(`
            SELECT s.Category,
                AVG(us.Score) as AvgScore,
                COUNT(*) as SkillCount,
                MAX(us.Score) as TopScore
            FROM UserSkills us
            JOIN Skills s ON us.SkillID = s.SkillID
            WHERE us.UserID = @uid
            GROUP BY s.Category
        `);

        // Map to 6 radar dimensions
        const dimensions = {
            Technical: 0, Creative: 0, Analytical: 0,
            Communication: 0, Leadership: 0, 'Problem-Solving': 0
        };
        const categoryMap = {
            'Technical': 'Technical', 'Design': 'Creative', 'Business': 'Analytical',
            'Science': 'Problem-Solving', 'Soft Skill': 'Communication'
        };

        for (const row of result.recordset) {
            const dim = categoryMap[row.Category] || 'Technical';
            dimensions[dim] = Math.max(dimensions[dim], Math.round(row.AvgScore));
        }

        // Get platform averages for comparison
        const avgResult = await pool.request().query(`
            SELECT s.Category, AVG(us.Score) as AvgScore
            FROM UserSkills us JOIN Skills s ON us.SkillID = s.SkillID
            GROUP BY s.Category
        `);
        const platformAvg = { Technical: 0, Creative: 0, Analytical: 0, Communication: 0, Leadership: 0, 'Problem-Solving': 0 };
        for (const row of avgResult.recordset) {
            const dim = categoryMap[row.Category] || 'Technical';
            platformAvg[dim] = Math.round(row.AvgScore);
        }

        // Get top 10% scores
        const topResult = await pool.request().query(`
            SELECT s.Category, AVG(us.Score) as AvgScore
            FROM UserSkills us JOIN Skills s ON us.SkillID = s.SkillID
            WHERE us.Score >= (SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY Score) OVER () FROM UserSkills)
            GROUP BY s.Category
        `);
        const top10 = { ...platformAvg };
        for (const row of (topResult.recordset || [])) {
            const dim = categoryMap[row.Category] || 'Technical';
            top10[dim] = Math.round(row.AvgScore);
        }

        // Growth over time
        const growthResult = await pool.request().input('uid', sql.BigInt, userId).query(`
            SELECT CAST(qa.CompletedAt AS DATE) as Day, AVG(qa.Percentage) as AvgScore
            FROM QuizAttempts qa WHERE qa.UserID = @uid AND qa.CompletedAt IS NOT NULL
            GROUP BY CAST(qa.CompletedAt AS DATE) ORDER BY Day
        `);

        res.json({
            success: true, data: {
                dimensions, platformAvg, top10,
                growth: growthResult.recordset,
                totalSkills: result.recordset.reduce((a, r) => a + r.SkillCount, 0)
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
