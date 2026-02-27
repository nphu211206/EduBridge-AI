// File: services/portfolio-service/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token required.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = {
            id: decoded.id || decoded.userId || decoded.UserID,
            role: decoded.role || decoded.Role || 'student',
            email: decoded.email || decoded.Email,
            name: decoded.name || decoded.FullName,
        };
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired.' });
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

module.exports = { authenticate };
