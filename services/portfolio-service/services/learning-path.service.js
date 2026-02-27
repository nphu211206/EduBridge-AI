// File: services/portfolio-service/services/learning-path.service.js
// EduBridge AI — AI Learning Path Generator

const { sql, poolPromise } = require('../config/db');
const OpenAI = require('openai');
let openai;
const init = () => { if (!openai && process.env.OPENAI_API_KEY) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return !!openai; };

const generatePath = async (userId, careerGoal, fieldCategory) => {
    const pool = await poolPromise;

    // Gather user data: skills, quiz results, portfolio
    const [skillsRes, quizRes, portfolioRes] = await Promise.all([
        pool.request().input('uid', sql.BigInt, userId).query(`
            SELECT s.Name, s.Category, us.Score FROM UserSkills us JOIN Skills s ON us.SkillID = s.SkillID WHERE us.UserID = @uid
        `),
        pool.request().input('uid', sql.BigInt, userId).query(`
            SELECT sq.Title, sq.Level, sq.FieldCategory, qa.Percentage, qa.Passed
            FROM QuizAttempts qa JOIN SkillQuizzes sq ON qa.QuizID = sq.QuizID WHERE qa.UserID = @uid ORDER BY qa.CompletedAt DESC
        `),
        pool.request().input('uid', sql.BigInt, userId).query(`
            SELECT OverallScore, AiSummary, FieldCategory FROM Portfolios WHERE UserID = @uid
        `)
    ]);

    const userProfile = {
        skills: skillsRes.recordset,
        quizzes: quizRes.recordset.slice(0, 10),
        portfolio: portfolioRes.recordset[0] || null,
    };

    if (!init()) throw new Error('OpenAI not configured');

    const prompt = `You are an AI career advisor. Based on this student's profile, create a personalized learning path.

CAREER GOAL: "${careerGoal}"
FIELD: "${fieldCategory || 'General'}"

CURRENT SKILLS:
${userProfile.skills.map(s => `- ${s.Name} (${s.Category}): ${s.Score}/100`).join('\n') || 'No skills recorded yet'}

QUIZ RESULTS:
${userProfile.quizzes.map(q => `- ${q.Title} (${q.Level}): ${q.Percentage}% ${q.Passed ? 'PASS' : 'FAIL'}`).join('\n') || 'No quizzes taken'}

PORTFOLIO SCORE: ${userProfile.portfolio?.OverallScore || 'N/A'}

Create a 6-month learning path with 4-6 phases. Response MUST be JSON:
{
  "analysis": "Brief analysis of current level and gaps (Vietnamese)",
  "phases": [
    {
      "phase": 1,
      "title": "Phase title (Vietnamese)",
      "description": "What to learn and why (Vietnamese)",
      "milestones": [
        {
          "title": "Milestone name (Vietnamese)",
          "type": "course|project|quiz|certificate|reading",
          "description": "Specific action (Vietnamese)",
          "durationWeeks": 2
        }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7, max_tokens: 3000,
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    // Save to DB
    const pathRes = await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('title', sql.NVarChar(255), `Lộ trình: ${careerGoal}`)
        .input('careerGoal', sql.NVarChar(500), careerGoal)
        .input('fieldCategory', sql.NVarChar(50), fieldCategory)
        .input('aiAnalysis', sql.NVarChar(sql.MAX), aiResult.analysis)
        .input('totalPhases', sql.Int, aiResult.phases?.length || 0)
        .query(`INSERT INTO LearningPaths (UserID, Title, CareerGoal, FieldCategory, AiAnalysis, TotalPhases)
                OUTPUT INSERTED.* VALUES (@userId, @title, @careerGoal, @fieldCategory, @aiAnalysis, @totalPhases)`);
    const path = pathRes.recordset[0];

    // Save milestones
    let sortOrder = 0;
    for (const phase of (aiResult.phases || [])) {
        for (const m of (phase.milestones || [])) {
            await pool.request()
                .input('pathId', sql.BigInt, path.PathID)
                .input('phase', sql.Int, phase.phase)
                .input('title', sql.NVarChar(255), m.title)
                .input('desc', sql.NText, m.description)
                .input('type', sql.NVarChar(30), m.type || 'course')
                .input('weeks', sql.Int, m.durationWeeks || 2)
                .input('sort', sql.Int, sortOrder++)
                .query(`INSERT INTO PathMilestones (PathID, Phase, Title, Description, MilestoneType, DurationWeeks, SortOrder)
                        VALUES (@pathId, @phase, @title, @desc, @type, @weeks, @sort)`);
        }
    }

    return { path, phases: aiResult.phases, analysis: aiResult.analysis };
};

const getMyPaths = async (userId) => {
    const pool = await poolPromise;
    const pathsRes = await pool.request().input('uid', sql.BigInt, userId)
        .query(`SELECT * FROM LearningPaths WHERE UserID = @uid ORDER BY CreatedAt DESC`);

    const paths = [];
    for (const p of pathsRes.recordset) {
        const milestonesRes = await pool.request().input('pid', sql.BigInt, p.PathID)
            .query(`SELECT * FROM PathMilestones WHERE PathID = @pid ORDER BY SortOrder`);
        const total = milestonesRes.recordset.length;
        const done = milestonesRes.recordset.filter(m => m.IsCompleted).length;
        paths.push({ ...p, milestones: milestonesRes.recordset, progress: total > 0 ? Math.round((done / total) * 100) : 0 });
    }
    return paths;
};

const completeMilestone = async (userId, milestoneId) => {
    const pool = await poolPromise;
    await pool.request()
        .input('mid', sql.BigInt, milestoneId)
        .input('uid', sql.BigInt, userId)
        .query(`UPDATE PathMilestones SET IsCompleted = 1, CompletedAt = GETUTCDATE()
                WHERE MilestoneID = @mid AND PathID IN (SELECT PathID FROM LearningPaths WHERE UserID = @uid)`);

    // Update path progress
    await pool.request().input('uid', sql.BigInt, userId).query(`
        UPDATE LearningPaths SET
            ProgressPercent = (SELECT CAST(SUM(CASE WHEN pm.IsCompleted = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS INT)
                                FROM PathMilestones pm WHERE pm.PathID = LearningPaths.PathID),
            UpdatedAt = GETUTCDATE()
        WHERE UserID = @uid
    `);
    return { success: true };
};

module.exports = { generatePath, getMyPaths, completeMilestone };
