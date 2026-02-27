// File: services/portfolio-service/services/portfolio.service.js
// EduBridge AI — Portfolio CRUD Service

const { sql, poolPromise } = require('../config/db');

/**
 * Get portfolio by UserID (create if not exists)
 */
const getOrCreatePortfolio = async (userId) => {
    const pool = await poolPromise;

    // Check existing
    let result = await pool.request()
        .input('userId', sql.BigInt, userId)
        .query(`SELECT * FROM Portfolios WHERE UserID = @userId`);

    if (result.recordset.length > 0) return result.recordset[0];

    // Create new
    result = await pool.request()
        .input('userId', sql.BigInt, userId)
        .query(`
            INSERT INTO Portfolios (UserID) 
            OUTPUT INSERTED.*
            VALUES (@userId)
        `);
    return result.recordset[0];
};

/**
 * Get full portfolio with items, skills, external profiles
 */
const getFullPortfolio = async (userId) => {
    const pool = await poolPromise;
    const request = pool.request().input('userId', sql.BigInt, userId);

    // Portfolio
    const portfolioResult = await request.query(`SELECT * FROM Portfolios WHERE UserID = @userId`);
    if (portfolioResult.recordset.length === 0) return null;
    const portfolio = portfolioResult.recordset[0];

    // Items
    const itemsResult = await pool.request()
        .input('portfolioId', sql.BigInt, portfolio.PortfolioID)
        .query(`SELECT * FROM PortfolioItems WHERE PortfolioID = @portfolioId ORDER BY SortOrder, CreatedAt DESC`);

    // Skills
    const skillsResult = await pool.request()
        .input('userId', sql.BigInt, userId)
        .query(`
            SELECT us.*, s.Name, s.Category, s.Icon 
            FROM UserSkills us
            JOIN Skills s ON us.SkillID = s.SkillID
            WHERE us.UserID = @userId
            ORDER BY us.Score DESC
        `);

    // External profiles
    const externalResult = await pool.request()
        .input('userId', sql.BigInt, userId)
        .query(`SELECT * FROM ExternalProfiles WHERE UserID = @userId ORDER BY CreatedAt DESC`);

    // User info
    const userResult = await pool.request()
        .input('userId', sql.BigInt, userId)
        .query(`SELECT UserID, FullName, Email, Image, Bio, FieldCategory FROM Users WHERE UserID = @userId`);

    return {
        user: userResult.recordset[0] || null,
        portfolio,
        items: itemsResult.recordset,
        skills: skillsResult.recordset,
        externalProfiles: externalResult.recordset,
    };
};

/**
 * Update portfolio header (headline, bio, fieldCategory)
 */
const updatePortfolio = async (userId, data) => {
    const pool = await poolPromise;
    const { headline, bio, fieldCategory, isPublic } = data;

    const result = await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('headline', sql.NVarChar(255), headline)
        .input('bio', sql.NText, bio)
        .input('fieldCategory', sql.NVarChar(50), fieldCategory)
        .input('isPublic', sql.Bit, isPublic !== undefined ? isPublic : 1)
        .query(`
            UPDATE Portfolios 
            SET Headline = @headline,
                Bio = @bio,
                FieldCategory = @fieldCategory,
                IsPublic = @isPublic,
                UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE UserID = @userId
        `);
    return result.recordset[0];
};

/**
 * Update AI summary for portfolio
 */
const updateAiSummary = async (portfolioId, overallScore, aiSummary) => {
    const pool = await poolPromise;
    await pool.request()
        .input('portfolioId', sql.BigInt, portfolioId)
        .input('overallScore', sql.Int, overallScore)
        .input('aiSummary', sql.NVarChar(sql.MAX), aiSummary)
        .query(`
            UPDATE Portfolios 
            SET OverallScore = @overallScore,
                AiSummary = @aiSummary,
                LastEvaluatedAt = GETUTCDATE(),
                UpdatedAt = GETUTCDATE()
            WHERE PortfolioID = @portfolioId
        `);
};

module.exports = {
    getOrCreatePortfolio,
    getFullPortfolio,
    updatePortfolio,
    updateAiSummary,
};
