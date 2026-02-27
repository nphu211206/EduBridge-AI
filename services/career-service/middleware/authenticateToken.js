// File: services/career-service/middleware/authenticateToken.js
// EduBridge AI — Shared JWT Authentication
// Uses the SAME JWT_SECRET as user-service for cross-service auth

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token xác thực không được cung cấp.' });
    }

    try {
        // Use shared JWT_SECRET (same as user-service)
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret);

        // Attach user info to request
        req.user = {
            id: decoded.id || decoded.userId || decoded.UserID,
            role: decoded.role || decoded.Role || 'student',
            email: decoded.email || decoded.Email,
            name: decoded.name || decoded.FullName
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.' });
        }
        return res.status(403).json({ message: 'Token không hợp lệ.' });
    }
};

// Middleware for recruiter-only routes
const requireRecruiter = (req, res, next) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403).json({ message: 'Chỉ nhà tuyển dụng mới có quyền truy cập.' });
    }
    next();
};

// Middleware for student-only routes
const requireStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Chỉ sinh viên mới có quyền truy cập.' });
    }
    next();
};

module.exports = { authenticateToken, requireRecruiter, requireStudent };