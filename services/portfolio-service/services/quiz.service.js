// File: services/portfolio-service/services/quiz.service.js
// EduBridge AI — Skill Quiz Service (AI-Generated Multi-Discipline Quizzes)

const { sql, poolPromise } = require('../config/db');
const OpenAI = require('openai');

let openai;
const initOpenAI = () => {
    if (!openai && process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return !!openai;
};

const MODEL = 'gpt-3.5-turbo-1106';

// ====================================================================
// AI QUIZ GENERATION — Different prompts per field
// ====================================================================
const FIELD_QUIZ_PROMPTS = {
    Technical: (skillName, level, count) => `
You are a ${skillName} exam creator. Create ${count} quiz questions for ${level} level.
Mix question types: 70% multiple_choice, 20% short_answer, 10% code (if applicable).
Response must be JSON:
{
  "questions": [
    {
      "questionText": "(string) The question in Vietnamese",
      "questionType": "multiple_choice|short_answer|code",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],  // only for multiple_choice
      "correctAnswer": "(string) correct answer or option letter",
      "explanation": "(string) brief explanation in Vietnamese",
      "points": 10
    }
  ]
}`,

    Design: (skillName, level, count) => `
You are a ${skillName} design exam creator. Create ${count} quiz questions for ${level} level.
Include: design theory, color theory, typography, tool knowledge, real-world scenarios.
Use 60% multiple_choice, 30% short_answer, 10% scenario-based.
Response JSON: { "questions": [{ "questionText": "...", "questionType": "...", "options": [...], "correctAnswer": "...", "explanation": "...", "points": 10 }] }`,

    Business: (skillName, level, count) => `
You are a ${skillName} business exam creator. Create ${count} questions for ${level} level.
Include: concepts, case studies, calculation questions, strategy questions.
Use 50% multiple_choice, 30% short_answer, 20% case study.
Response JSON: { "questions": [{ "questionText": "...", "questionType": "...", "options": [...], "correctAnswer": "...", "explanation": "...", "points": 10 }] }`,

    Science: (skillName, level, count) => `
You are a ${skillName} science exam creator. Create ${count} questions for ${level} level.
Include: theory, methodology, data analysis, practical applications.
Response JSON: { "questions": [{ "questionText": "...", "questionType": "...", "options": [...], "correctAnswer": "...", "explanation": "...", "points": 10 }] }`,

    'Soft Skill': (skillName, level, count) => `
You are a ${skillName} soft skills assessor. Create ${count} scenario-based questions for ${level} level.
Focus on real workplace situations, communication, teamwork, problem-solving.
Use 40% multiple_choice, 60% short_answer (scenario-based).
Response JSON: { "questions": [{ "questionText": "...", "questionType": "...", "options": [...], "correctAnswer": "...", "explanation": "...", "points": 10 }] }`,
};

// ====================================================================
// GENERATE QUIZ
// ====================================================================
const generateQuiz = async (skillId, level, questionCount) => {
    const pool = await poolPromise;

    // Get skill info
    const skillResult = await pool.request()
        .input('skillId', sql.BigInt, skillId)
        .query(`SELECT * FROM Skills WHERE SkillID = @skillId`);
    if (skillResult.recordset.length === 0) throw new Error('Skill not found.');
    const skill = skillResult.recordset[0];

    const count = Math.min(Math.max(questionCount || 10, 5), 25);
    const lvl = level || 'Beginner';

    // Generate questions with AI
    const promptFn = FIELD_QUIZ_PROMPTS[skill.Category] || FIELD_QUIZ_PROMPTS.Technical;
    const prompt = promptFn(skill.Name, lvl, count);

    if (!initOpenAI()) throw new Error('OpenAI API key not configured.');

    const completion = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4096,
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);
    const questions = aiResult.questions || [];

    if (questions.length === 0) throw new Error('AI could not generate questions.');

    // Create quiz record
    const quizResult = await pool.request()
        .input('skillId', sql.BigInt, skillId)
        .input('title', sql.NVarChar(255), `${skill.Name} — ${lvl} Quiz`)
        .input('description', sql.NText, `Bài kiểm tra kỹ năng ${skill.Name} (${lvl})`)
        .input('level', sql.NVarChar(30), lvl)
        .input('questionCount', sql.Int, questions.length)
        .input('timeLimitMinutes', sql.Int, questions.length * 2)
        .input('fieldCategory', sql.NVarChar(50), skill.Category)
        .query(`
            INSERT INTO SkillQuizzes (SkillID, Title, Description, Level, QuestionCount, TimeLimitMinutes, FieldCategory)
            OUTPUT INSERTED.*
            VALUES (@skillId, @title, @description, @level, @questionCount, @timeLimitMinutes, @fieldCategory)
        `);
    const quiz = quizResult.recordset[0];

    // Insert questions
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.request()
            .input('quizId', sql.BigInt, quiz.QuizID)
            .input('questionOrder', sql.Int, i + 1)
            .input('questionText', sql.NVarChar(sql.MAX), q.questionText)
            .input('questionType', sql.NVarChar(30), q.questionType || 'multiple_choice')
            .input('options', sql.NVarChar(sql.MAX), q.options ? JSON.stringify(q.options) : null)
            .input('correctAnswer', sql.NVarChar(sql.MAX), q.correctAnswer)
            .input('explanation', sql.NVarChar(sql.MAX), q.explanation)
            .input('points', sql.Int, q.points || 10)
            .query(`
                INSERT INTO QuizQuestions (QuizID, QuestionOrder, QuestionText, QuestionType, Options, CorrectAnswer, Explanation, Points)
                VALUES (@quizId, @questionOrder, @questionText, @questionType, @options, @correctAnswer, @explanation, @points)
            `);
    }

    return { quiz, questionCount: questions.length };
};

// ====================================================================
// SUBMIT & GRADE QUIZ
// ====================================================================
const submitQuiz = async (userId, quizId, answers) => {
    const pool = await poolPromise;

    // Get quiz and questions
    const quizResult = await pool.request()
        .input('quizId', sql.BigInt, quizId)
        .query(`SELECT * FROM SkillQuizzes WHERE QuizID = @quizId`);
    if (quizResult.recordset.length === 0) throw new Error('Quiz not found.');
    const quiz = quizResult.recordset[0];

    const questionsResult = await pool.request()
        .input('quizId', sql.BigInt, quizId)
        .query(`SELECT * FROM QuizQuestions WHERE QuizID = @quizId ORDER BY QuestionOrder`);
    const questions = questionsResult.recordset;

    // Grade each answer
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    for (const q of questions) {
        const userAnswer = answers.find(a => a.questionId == q.QuestionID);
        const userText = userAnswer?.answer || '';
        maxScore += q.Points;

        let isCorrect = false;
        let score = 0;

        if (q.QuestionType === 'multiple_choice') {
            // Simple match for MC
            isCorrect = userText.trim().toLowerCase() === q.CorrectAnswer.trim().toLowerCase()
                || userText.trim().charAt(0).toLowerCase() === q.CorrectAnswer.trim().charAt(0).toLowerCase();
            score = isCorrect ? q.Points : 0;
        } else {
            // For short_answer/code: use AI grading
            if (initOpenAI()) {
                try {
                    const gradePrompt = `Grade this answer. Question: "${q.QuestionText}" Correct answer: "${q.CorrectAnswer}" Student answer: "${userText}" Return JSON: {"score": (0-${q.Points}), "feedback": "(string)"}`;
                    const gradeResult = await openai.chat.completions.create({
                        model: MODEL,
                        messages: [{ role: 'user', content: gradePrompt }],
                        response_format: { type: 'json_object' },
                        temperature: 0.3, max_tokens: 256,
                    });
                    const grade = JSON.parse(gradeResult.choices[0].message.content);
                    score = Math.min(q.Points, Math.max(0, grade.score || 0));
                    isCorrect = score >= q.Points * 0.5;
                } catch (e) {
                    // Fallback: simple keyword match
                    const keywords = q.CorrectAnswer.toLowerCase().split(/\s+/);
                    const matched = keywords.filter(k => userText.toLowerCase().includes(k)).length;
                    score = Math.round((matched / keywords.length) * q.Points);
                    isCorrect = score >= q.Points * 0.5;
                }
            }
        }

        totalScore += score;
        gradedAnswers.push({
            questionId: q.QuestionID,
            userAnswer: userText,
            correctAnswer: q.CorrectAnswer,
            isCorrect,
            score,
            maxPoints: q.Points,
            explanation: q.Explanation,
        });
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= (quiz.PassScore || 60);

    // Save attempt
    const attemptResult = await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('quizId', sql.BigInt, quizId)
        .input('score', sql.Int, totalScore)
        .input('maxScore', sql.Int, maxScore)
        .input('percentage', sql.Decimal(5, 2), percentage)
        .input('passed', sql.Bit, passed)
        .input('answers', sql.NVarChar(sql.MAX), JSON.stringify(gradedAnswers))
        .query(`
            INSERT INTO QuizAttempts (UserID, QuizID, Score, MaxScore, Percentage, Passed, Answers, CompletedAt)
            OUTPUT INSERTED.*
            VALUES (@userId, @quizId, @score, @maxScore, @percentage, @passed, @answers, GETUTCDATE())
        `);

    // If passed, update UserSkills score
    if (passed) {
        await pool.request()
            .input('userId', sql.BigInt, userId)
            .input('skillId', sql.BigInt, quiz.SkillID)
            .input('score', sql.Int, percentage)
            .input('source', sql.NVarChar(50), 'Quiz')
            .query(`
                MERGE UserSkills AS target
                USING (SELECT @userId as UserID, @skillId as SkillID, @source as Source) AS source
                ON target.UserID = source.UserID AND target.SkillID = source.SkillID AND target.Source = source.Source
                WHEN MATCHED AND @score > target.Score THEN
                    UPDATE SET Score = @score, EvaluatedAt = GETUTCDATE()
                WHEN NOT MATCHED THEN
                    INSERT (UserID, SkillID, Score, Source) VALUES (@userId, @skillId, @score, @source);
            `);
    }

    return {
        attempt: attemptResult.recordset[0],
        totalScore,
        maxScore,
        percentage,
        passed,
        gradedAnswers,
    };
};

// ====================================================================
// GET QUIZ HISTORY
// ====================================================================
const getQuizHistory = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('userId', sql.BigInt, userId)
        .query(`
            SELECT 
                qa.*,
                sq.Title as QuizTitle,
                sq.Level,
                sq.FieldCategory,
                s.Name as SkillName,
                s.Icon as SkillIcon
            FROM QuizAttempts qa
            JOIN SkillQuizzes sq ON qa.QuizID = sq.QuizID
            JOIN Skills s ON sq.SkillID = s.SkillID
            WHERE qa.UserID = @userId
            ORDER BY qa.CompletedAt DESC
        `);
    return result.recordset;
};

// ====================================================================
// GET QUIZ WITH QUESTIONS (for taking the quiz)
// ====================================================================
const getQuizWithQuestions = async (quizId) => {
    const pool = await poolPromise;
    const quizResult = await pool.request()
        .input('quizId', sql.BigInt, quizId)
        .query(`
            SELECT sq.*, s.Name as SkillName, s.Category, s.Icon
            FROM SkillQuizzes sq
            JOIN Skills s ON sq.SkillID = s.SkillID
            WHERE sq.QuizID = @quizId
        `);
    if (quizResult.recordset.length === 0) throw new Error('Quiz not found.');

    const questionsResult = await pool.request()
        .input('quizId', sql.BigInt, quizId)
        .query(`
            SELECT QuestionID, QuestionOrder, QuestionText, QuestionType, Options, Points
            FROM QuizQuestions WHERE QuizID = @quizId ORDER BY QuestionOrder
        `);

    return {
        quiz: quizResult.recordset[0],
        questions: questionsResult.recordset.map(q => ({
            ...q,
            Options: q.Options ? JSON.parse(q.Options) : null,
        })),
    };
};

module.exports = {
    generateQuiz,
    submitQuiz,
    getQuizHistory,
    getQuizWithQuestions,
};
