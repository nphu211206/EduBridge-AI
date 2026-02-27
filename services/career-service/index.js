// File: services/career-service/index.js
// EduBridge AI — Career Service (Ported from EduLedger AI v3.1)
// Handles: Jobs, Applications, AI Interviews, Companies

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const { poolPromise } = require('./config/db.js');

// --- Import Routes ---
const authRoutes = require('./routes/auth.routes');
const publicApiRoutes = require('./routes/publicApi.routes');
const userApiRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const jobsApiRoutes = require('./routes/jobs.routes');
const companyManagementRoutes = require('./routes/company.management.routes');
const applicationsRoutes = require('./routes/applications.routes');
const interviewRoutes = require('./routes/interview.routes.js');

const app = express();
const PORT = process.env.CAREER_SERVICE_PORT || 3800;

// --- CORS (allow all EduBridge frontend apps) ---
const allowedOrigins = [
    'http://localhost:3001',  // user-app
    'http://localhost:3002',  // recruiter-app
    'http://localhost:3003',  // teacher-app
    'http://localhost:3004',  // admin-app
    process.env.CORS_ORIGIN
].filter(Boolean).flatMap(o => o.includes(',') ? o.split(',') : [o]);

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error(`Origin '${origin}' not allowed by CORS`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
app.use((req, res, next) => {
    console.log(`[Career] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        service: 'EduBridge AI — Career Service',
        version: '4.0',
        status: 'OK',
        timestamp: new Date().toISOString(),
    });
});

// --- Routes ---
app.use('/auth', authRoutes);
app.use('/api/public', publicApiRoutes);
app.use('/api/user', userApiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobsApiRoutes);
app.use('/api/company-management', companyManagementRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/interviews', interviewRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({ message: `Career Service: ${req.method} ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Career Service Error:', err.stack || err);
    if (err.message.includes('not allowed by CORS')) {
        return res.status(403).json({ message: err.message });
    }
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// --- Start ---
const startServer = async () => {
    try {
        await poolPromise;
        console.log('✅ Career Service: Database connected.');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 EduBridge AI Career Service running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Career Service startup failed:', error);
        process.exit(1);
    }
};

startServer();