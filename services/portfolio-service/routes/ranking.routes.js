// File: services/portfolio-service/routes/ranking.routes.js
// EduBridge AI — Multi-Discipline Ranking API

const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// GET /api/ranking — Overall ranking with field filter
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { field, sort, timeRange, page, limit } = req.query;
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 20;
        const offset = (pageNum - 1) * pageSize;

        let query = `
            SELECT 
                u.UserID,
                u.FullName,
                u.Image,
                u.FieldCategory,
                p.OverallScore as PortfolioScore,
                (SELECT COUNT(*) FROM UserSkills WHERE UserID = u.UserID) as SkillCount,
                (SELECT ISNULL(AVG(us2.Score), 0) FROM UserSkills us2 WHERE us2.UserID = u.UserID) as AvgSkillScore,
                (SELECT COUNT(*) FROM QuizAttempts qa WHERE qa.UserID = u.UserID AND qa.Passed = 1) as QuizzesPassed,
                ISNULL(p.OverallScore, 0) + 
                    ISNULL((SELECT AVG(us3.Score) FROM UserSkills us3 WHERE us3.UserID = u.UserID), 0) +
                    (SELECT COUNT(*) * 5 FROM QuizAttempts qa2 WHERE qa2.UserID = u.UserID AND qa2.Passed = 1)
                as TotalScore
            FROM Users u
            LEFT JOIN Portfolios p ON u.UserID = p.UserID
            WHERE 1=1
        `;
        const request = pool.request();

        if (field && field !== 'all') {
            query += ` AND (u.FieldCategory = @field OR p.FieldCategory = @field)`;
            request.input('field', sql.NVarChar(50), field);
        }

        const sortCol = sort === 'portfolioScore' ? 'PortfolioScore'
            : sort === 'skillScore' ? 'AvgSkillScore'
                : 'TotalScore';
        query += ` ORDER BY ${sortCol} DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;
        request.input('offset', sql.Int, offset);
        request.input('limit', sql.Int, pageSize);

        const result = await request.query(query);

        // Add rank numbers
        const rankings = result.recordset.map((item, idx) => ({
            ...item,
            Rank: offset + idx + 1,
        }));

        res.json({ success: true, data: rankings, page: pageNum, limit: pageSize });
    } catch (err) {
        console.error('Ranking error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/ranking/by-skill/:skillId — Ranking by specific skill
router.get('/by-skill/:skillId', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('skillId', sql.BigInt, req.params.skillId)
            .query(`
                SELECT TOP 50
                    us.UserSkillID,
                    us.UserID,
                    us.Score,
                    us.Source,
                    us.EvaluatedAt,
                    u.FullName,
                    u.Image,
                    s.Name as SkillName,
                    s.Category,
                    s.Icon,
                    ROW_NUMBER() OVER (ORDER BY us.Score DESC) as Rank
                FROM UserSkills us
                JOIN Users u ON us.UserID = u.UserID
                JOIN Skills s ON us.SkillID = s.SkillID
                WHERE us.SkillID = @skillId
                ORDER BY us.Score DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/ranking/fields — Field statistics
router.get('/fields', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                ISNULL(p.FieldCategory, 'Other') as FieldCategory,
                COUNT(DISTINCT p.UserID) as UserCount,
                AVG(p.OverallScore) as AvgScore,
                MAX(p.OverallScore) as TopScore
            FROM Portfolios p
            WHERE p.FieldCategory IS NOT NULL
            GROUP BY p.FieldCategory
            ORDER BY UserCount DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/ranking/top-skills — Top skills by usage
router.get('/top-skills', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { category } = req.query;
        let query = `
            SELECT TOP 20
                s.SkillID, s.Name, s.Category, s.Icon,
                COUNT(us.UserSkillID) as UserCount,
                AVG(us.Score) as AvgScore,
                MAX(us.Score) as TopScore
            FROM Skills s
            LEFT JOIN UserSkills us ON s.SkillID = us.SkillID
        `;
        const request = pool.request();
        if (category) {
            query += ` WHERE s.Category = @category`;
            request.input('category', sql.NVarChar(50), category);
        }
        query += ` GROUP BY s.SkillID, s.Name, s.Category, s.Icon ORDER BY UserCount DESC`;

        const result = await request.query(query);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
