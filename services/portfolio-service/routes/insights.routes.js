// routes/insights.routes.js — Industry Insights Dashboard API
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');

// GET /api/insights/trending-skills
router.get('/trending-skills', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT TOP 10 s.SkillID, s.Name, s.Category, s.Icon,
                COUNT(us.UserSkillID) as UserCount,
                AVG(us.Score) as AvgScore
            FROM Skills s LEFT JOIN UserSkills us ON s.SkillID = us.SkillID
            GROUP BY s.SkillID, s.Name, s.Category, s.Icon
            ORDER BY UserCount DESC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/insights/skill-gap
router.get('/skill-gap', async (req, res) => {
    try {
        const pool = await poolPromise;
        // Compare job requirements vs available talent
        const result = await pool.request().query(`
            SELECT s.Category,
                COUNT(DISTINCT us.UserID) as TalentPool,
                (SELECT COUNT(*) FROM Skills s2 WHERE s2.Category = s.Category) as TotalSkills
            FROM Skills s
            LEFT JOIN UserSkills us ON s.SkillID = us.SkillID
            GROUP BY s.Category
            ORDER BY TalentPool ASC
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/insights/field-stats
router.get('/field-stats', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT s.Category as Field,
                COUNT(DISTINCT us.UserID) as ActiveUsers,
                AVG(us.Score) as AvgScore,
                (SELECT COUNT(*) FROM QuizAttempts qa JOIN SkillQuizzes sq ON qa.QuizID = sq.QuizID WHERE sq.FieldCategory = s.Category) as TotalQuizzes,
                (SELECT COUNT(*) FROM QuizAttempts qa2 JOIN SkillQuizzes sq2 ON qa2.QuizID = sq2.QuizID WHERE sq2.FieldCategory = s.Category AND qa2.Passed = 1) as PassedQuizzes
            FROM Skills s
            LEFT JOIN UserSkills us ON s.SkillID = us.SkillID
            GROUP BY s.Category
        `);
        res.json({ success: true, data: result.recordset });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/insights/platform-summary
router.get('/platform-summary', async (req, res) => {
    try {
        const pool = await poolPromise;
        const [users, skills, quizzes, portfolios, projects] = await Promise.all([
            pool.request().query(`SELECT COUNT(*) as c FROM Users`),
            pool.request().query(`SELECT COUNT(DISTINCT SkillID) as c FROM UserSkills`),
            pool.request().query(`SELECT COUNT(*) as c, SUM(CASE WHEN Passed = 1 THEN 1 ELSE 0 END) as passed FROM QuizAttempts`),
            pool.request().query(`SELECT COUNT(*) as c, AVG(OverallScore) as avg FROM Portfolios WHERE OverallScore > 0`),
            pool.request().query(`SELECT COUNT(*) as c FROM TeamProjects`).catch(() => ({ recordset: [{ c: 0 }] })),
        ]);
        res.json({
            success: true, data: {
                totalUsers: users.recordset[0].c,
                activeSkills: skills.recordset[0].c,
                totalQuizzes: quizzes.recordset[0].c,
                quizPassRate: quizzes.recordset[0].c > 0 ? Math.round((quizzes.recordset[0].passed / quizzes.recordset[0].c) * 100) : 0,
                totalPortfolios: portfolios.recordset[0].c,
                avgPortfolioScore: Math.round(portfolios.recordset[0].avg || 0),
                totalProjects: projects.recordset[0].c,
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
