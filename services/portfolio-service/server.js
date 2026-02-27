// File: services/portfolio-service/server.js
// EduBridge AI — Portfolio Service
// Handles: Portfolio CRUD, Item uploads, External profile sync, AI evaluation

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db');

const portfolioRoutes = require('./routes/portfolio.routes');
const itemsRoutes = require('./routes/items.routes');
const externalRoutes = require('./routes/external.routes');
const skillsRoutes = require('./routes/skills.routes');
const rankingRoutes = require('./routes/ranking.routes');
const quizRoutes = require('./routes/quiz.routes');
const learningPathRoutes = require('./routes/learning-path.routes');
const achievementRoutes = require('./routes/achievement.routes');
const teamRoutes = require('./routes/team.routes');
const skillDnaRoutes = require('./routes/skill-dna.routes');
const insightsRoutes = require('./routes/insights.routes');

const app = express();
const PORT = process.env.PORTFOLIO_SERVICE_PORT || 3900;

// CORS
const allowedOrigins = [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5004',
    'http://localhost:5173',
].filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error(`Origin '${origin}' blocked by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logger
app.use((req, res, next) => {
    console.log(`[Portfolio] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});

// Health check
app.get('/', (req, res) => {
    res.json({
        service: 'EduBridge AI — Portfolio Service',
        version: '1.0',
        status: 'OK',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/portfolio/items', itemsRoutes);
app.use('/api/portfolio/external', externalRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/skill-dna', skillDnaRoutes);
app.use('/api/insights', insightsRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({ message: `Portfolio Service: ${req.method} ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Portfolio Service Error:', err.stack || err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// Start
const startServer = async () => {
    try {
        await poolPromise;
        console.log('✅ Portfolio Service: Database connected.');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 EduBridge AI Portfolio Service running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Portfolio Service startup failed:', error);
        process.exit(1);
    }
};

startServer();
