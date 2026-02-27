// File: services/portfolio-service/routes/quiz.routes.js
// EduBridge AI — Skill Quiz API Routes

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const quizService = require('../services/quiz.service');

// POST /api/quiz/generate — Generate a new quiz (AI)
router.post('/generate', authenticate, async (req, res) => {
    try {
        const { skillId, level, questionCount } = req.body;
        if (!skillId) return res.status(400).json({ success: false, message: 'skillId required.' });

        const result = await quizService.generateQuiz(skillId, level, questionCount);
        res.json({
            success: true,
            data: result,
            message: `Quiz created with ${result.questionCount} questions. Good luck!`,
        });
    } catch (err) {
        console.error('Generate quiz error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/quiz/:quizId — Get quiz with questions (for taking)
router.get('/:quizId', authenticate, async (req, res) => {
    try {
        const data = await quizService.getQuizWithQuestions(req.params.quizId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/quiz/:quizId/submit — Submit quiz answers
router.post('/:quizId/submit', authenticate, async (req, res) => {
    try {
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'answers array required.' });
        }

        const result = await quizService.submitQuiz(req.user.id, req.params.quizId, answers);
        res.json({
            success: true,
            data: result,
            message: result.passed
                ? `🎉 Chúc mừng! Bạn đạt ${result.percentage}% — PASS!`
                : `📝 Bạn đạt ${result.percentage}%. Cần ${result.quiz?.PassScore || 60}% để pass. Thử lại nhé!`,
        });
    } catch (err) {
        console.error('Submit quiz error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/quiz/history/me — Get my quiz history
router.get('/history/me', authenticate, async (req, res) => {
    try {
        const history = await quizService.getQuizHistory(req.user.id);
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
