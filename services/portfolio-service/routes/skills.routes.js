// File: services/portfolio-service/routes/skills.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { sql, poolPromise } = require('../config/db');

// GET /api/skills — List all skills (optionally filter by category)
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const { category } = req.query;
        let query = 'SELECT * FROM Skills ORDER BY Category, Name';
        const request = pool.request();

        if (category) {
            query = 'SELECT * FROM Skills WHERE Category = @category ORDER BY Name';
            request.input('category', sql.NVarChar(50), category);
        }

        const result = await request.query(query);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        console.error('Get skills error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/skills/categories — Get all skill categories
router.get('/categories', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(
            `SELECT DISTINCT Category, COUNT(*) as Count FROM Skills GROUP BY Category ORDER BY Category`
        );
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/skills/my — Get my skills with scores
router.get('/my', authenticate, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.BigInt, req.user.id)
            .query(`
                SELECT us.*, s.Name, s.Category, s.Icon
                FROM UserSkills us
                JOIN Skills s ON us.SkillID = s.SkillID
                WHERE us.UserID = @userId
                ORDER BY us.Score DESC
            `);
        res.json({ success: true, data: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/skills/my — Add a skill manually
router.post('/my', authenticate, async (req, res) => {
    try {
        const { skillId, score } = req.body;
        if (!skillId) return res.status(400).json({ success: false, message: 'skillId required.' });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.BigInt, req.user.id)
            .input('skillId', sql.BigInt, skillId)
            .input('score', sql.Int, Math.min(100, Math.max(0, score || 50)))
            .input('source', sql.NVarChar(50), 'Manual')
            .query(`
                MERGE UserSkills AS target
                USING (SELECT @userId as UserID, @skillId as SkillID, @source as Source) AS source
                ON target.UserID = source.UserID AND target.SkillID = source.SkillID AND target.Source = source.Source
                WHEN MATCHED THEN
                    UPDATE SET Score = @score, EvaluatedAt = GETUTCDATE()
                WHEN NOT MATCHED THEN
                    INSERT (UserID, SkillID, Score, Source) VALUES (@userId, @skillId, @score, @source)
                OUTPUT INSERTED.*;
            `);
        res.json({ success: true, data: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/skills/my/:userSkillId — Remove a skill
router.delete('/my/:userSkillId', authenticate, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('userSkillId', sql.BigInt, req.params.userSkillId)
            .input('userId', sql.BigInt, req.user.id)
            .query(`DELETE FROM UserSkills WHERE UserSkillID = @userSkillId AND UserID = @userId`);
        res.json({ success: true, message: 'Skill removed.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
