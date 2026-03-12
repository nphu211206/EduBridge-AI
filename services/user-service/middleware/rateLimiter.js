/*-----------------------------------------------------------------
* File: rateLimiter.js
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: Rate limiter middleware for registration attempts
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
const { pool, sql } = require('../config/db');

const MAX_ATTEMPTS = 5; // Số lần thử tối đa
const BLOCK_DURATION = 30; // Thời gian block (phút)

const registrationLimiter = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;

    // Use raw SQL instead of Sequelize to avoid date format issues
    const result = await pool.request()
      .input('ip', sql.VarChar(45), clientIP)
      .query(`SELECT AttemptID, IPAddress, AttemptCount, BlockedUntil, LastAttemptAt, CreatedAt
              FROM RegistrationAttempts WHERE IPAddress = @ip`);

    const attempt = result.recordset[0];

    if (attempt) {
      // Nếu đã hết thời gian block
      if (attempt.BlockedUntil && new Date() > new Date(attempt.BlockedUntil)) {
        await pool.request()
          .input('ip', sql.VarChar(45), clientIP)
          .query(`UPDATE RegistrationAttempts SET AttemptCount = 1, BlockedUntil = NULL, LastAttemptAt = GETDATE() WHERE IPAddress = @ip`);
        return next();
      }

      // Nếu đang bị block
      if (attempt.BlockedUntil) {
        const minutesLeft = Math.ceil((new Date(attempt.BlockedUntil) - new Date()) / (1000 * 60));
        return res.status(429).json({
          error: 'TOO_MANY_ATTEMPTS',
          message: `Quá nhiều lần thử đăng ký. Vui lòng thử lại sau ${minutesLeft} phút.`
        });
      }

      const newCount = attempt.AttemptCount + 1;
      const blockedUntil = newCount >= MAX_ATTEMPTS
        ? `DATEADD(MINUTE, ${BLOCK_DURATION}, GETDATE())`
        : 'NULL';

      // Tăng số lần thử - use GETDATE() for dates to avoid format issues
      await pool.request()
        .input('ip', sql.VarChar(45), clientIP)
        .input('count', sql.Int, newCount)
        .query(`UPDATE RegistrationAttempts SET AttemptCount = @count, BlockedUntil = ${blockedUntil}, LastAttemptAt = GETDATE() WHERE IPAddress = @ip`);

      // Nếu vượt quá số lần thử
      if (newCount >= MAX_ATTEMPTS) {
        return res.status(429).json({
          error: 'TOO_MANY_ATTEMPTS',
          message: `Quá nhiều lần thử đăng ký. Vui lòng thử lại sau ${BLOCK_DURATION} phút.`
        });
      }
    } else {
      // Tạo record mới cho IP
      await pool.request()
        .input('ip', sql.VarChar(45), clientIP)
        .query(`INSERT INTO RegistrationAttempts (IPAddress, AttemptCount, LastAttemptAt, CreatedAt) VALUES (@ip, 1, GETDATE(), GETDATE())`);
    }

    next();
  } catch (error) {
    // If rate limiter fails, let registration proceed anyway
    console.error('Registration rate limiter error (non-blocking):', error.message);
    next();
  }
};

module.exports = registrationLimiter; 