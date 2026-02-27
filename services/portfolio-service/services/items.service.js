// File: services/portfolio-service/services/items.service.js
// EduBridge AI — Portfolio Items Service

const { sql, poolPromise } = require('../config/db');
const aiEvaluator = require('./ai-evaluator.service');

/**
 * Add a new portfolio item
 */
const addItem = async (portfolioId, itemData) => {
    const pool = await poolPromise;
    const { title, description, itemType, fileUrl, externalUrl, thumbnailUrl, tags } = itemData;
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;

    // Get current max sort order
    const orderResult = await pool.request()
        .input('portfolioId', sql.BigInt, portfolioId)
        .query(`SELECT ISNULL(MAX(SortOrder), 0) + 1 as NextOrder FROM PortfolioItems WHERE PortfolioID = @portfolioId`);
    const nextOrder = orderResult.recordset[0].NextOrder;

    const result = await pool.request()
        .input('portfolioId', sql.BigInt, portfolioId)
        .input('title', sql.NVarChar(255), title)
        .input('description', sql.NText, description)
        .input('itemType', sql.NVarChar(50), itemType)
        .input('fileUrl', sql.NVarChar(sql.MAX), fileUrl)
        .input('externalUrl', sql.NVarChar(sql.MAX), externalUrl)
        .input('thumbnailUrl', sql.NVarChar(sql.MAX), thumbnailUrl)
        .input('tags', sql.NVarChar(sql.MAX), tagsJson)
        .input('sortOrder', sql.Int, nextOrder)
        .query(`
            INSERT INTO PortfolioItems (PortfolioID, Title, Description, ItemType, FileUrl, ExternalUrl, ThumbnailUrl, Tags, SortOrder)
            OUTPUT INSERTED.*
            VALUES (@portfolioId, @title, @description, @itemType, @fileUrl, @externalUrl, @thumbnailUrl, @tags, @sortOrder)
        `);

    const item = result.recordset[0];

    // Trigger AI evaluation asynchronously
    evaluateItemAsync(item).catch(err => console.error('Async AI eval failed:', err.message));

    return item;
};

/**
 * Evaluate item with AI and update DB
 */
const evaluateItemAsync = async (item) => {
    const evaluation = await aiEvaluator.evaluatePortfolioItem({
        title: item.Title,
        description: item.Description,
        itemType: item.ItemType,
        externalUrl: item.ExternalUrl,
    });

    const pool = await poolPromise;
    await pool.request()
        .input('itemId', sql.BigInt, item.ItemID)
        .input('aiScore', sql.Int, evaluation.score)
        .input('aiEvaluation', sql.NVarChar(sql.MAX), JSON.stringify(evaluation))
        .query(`
            UPDATE PortfolioItems 
            SET AiScore = @aiScore, AiEvaluation = @aiEvaluation, UpdatedAt = GETUTCDATE()
            WHERE ItemID = @itemId
        `);

    // Auto-detect and add skills
    if (evaluation.detected_skills && evaluation.detected_skills.length > 0) {
        await syncDetectedSkills(item, evaluation);
    }

    return evaluation;
};

/**
 * Sync AI-detected skills to UserSkills table
 */
const syncDetectedSkills = async (item, evaluation) => {
    const pool = await poolPromise;

    // Get userId from portfolio
    const portResult = await pool.request()
        .input('portfolioId', sql.BigInt, item.PortfolioID)
        .query(`SELECT UserID FROM Portfolios WHERE PortfolioID = @portfolioId`);
    if (portResult.recordset.length === 0) return;
    const userId = portResult.recordset[0].UserID;

    for (const skillName of evaluation.detected_skills) {
        try {
            // Find or create skill
            let skillResult = await pool.request()
                .input('name', sql.NVarChar(100), skillName)
                .query(`SELECT SkillID FROM Skills WHERE Name = @name`);

            let skillId;
            if (skillResult.recordset.length > 0) {
                skillId = skillResult.recordset[0].SkillID;
            } else {
                // Auto-create skill
                const insertResult = await pool.request()
                    .input('name', sql.NVarChar(100), skillName)
                    .input('category', sql.NVarChar(50), detectSkillCategory(skillName))
                    .query(`INSERT INTO Skills (Name, Category) OUTPUT INSERTED.SkillID VALUES (@name, @category)`);
                skillId = insertResult.recordset[0].SkillID;
            }

            // Upsert user skill (keep highest score)
            await pool.request()
                .input('userId', sql.BigInt, userId)
                .input('skillId', sql.BigInt, skillId)
                .input('score', sql.Int, evaluation.score || 50)
                .input('source', sql.NVarChar(50), 'AI_Portfolio')
                .query(`
                    MERGE UserSkills AS target
                    USING (SELECT @userId as UserID, @skillId as SkillID, @source as Source) AS source
                    ON target.UserID = source.UserID AND target.SkillID = source.SkillID AND target.Source = source.Source
                    WHEN MATCHED AND @score > target.Score THEN
                        UPDATE SET Score = @score, EvaluatedAt = GETUTCDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (UserID, SkillID, Score, Source) VALUES (@userId, @skillId, @score, @source);
                `);
        } catch (err) {
            console.warn(`Skill sync warning for "${skillName}":`, err.message);
        }
    }
};

/**
 * Detect skill category heuristic
 */
const detectSkillCategory = (skillName) => {
    const lower = skillName.toLowerCase();
    const techKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'api', 'docker', 'git', 'html', 'css', 'java', 'c++', 'c#'];
    const designKeywords = ['figma', 'photoshop', 'illustrator', 'ui', 'ux', 'design', 'typography', 'branding', '3d', 'animation'];
    const businessKeywords = ['marketing', 'finance', 'excel', 'management', 'accounting', 'business', 'strategy', 'hr'];
    const scienceKeywords = ['research', 'statistics', 'machine learning', 'data', 'lab', 'matlab', 'cad'];

    if (techKeywords.some(k => lower.includes(k))) return 'Technical';
    if (designKeywords.some(k => lower.includes(k))) return 'Design';
    if (businessKeywords.some(k => lower.includes(k))) return 'Business';
    if (scienceKeywords.some(k => lower.includes(k))) return 'Science';
    return 'Soft Skill';
};

/**
 * Update a portfolio item
 */
const updateItem = async (itemId, userId, data) => {
    const pool = await poolPromise;

    // Verify ownership
    const check = await pool.request()
        .input('itemId', sql.BigInt, itemId)
        .input('userId', sql.BigInt, userId)
        .query(`
            SELECT pi.ItemID FROM PortfolioItems pi
            JOIN Portfolios p ON pi.PortfolioID = p.PortfolioID
            WHERE pi.ItemID = @itemId AND p.UserID = @userId
        `);
    if (check.recordset.length === 0) throw new Error('Item not found or unauthorized.');

    const { title, description, itemType, fileUrl, externalUrl, thumbnailUrl, tags, sortOrder } = data;
    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : tags;

    const result = await pool.request()
        .input('itemId', sql.BigInt, itemId)
        .input('title', sql.NVarChar(255), title)
        .input('description', sql.NText, description)
        .input('itemType', sql.NVarChar(50), itemType)
        .input('fileUrl', sql.NVarChar(sql.MAX), fileUrl)
        .input('externalUrl', sql.NVarChar(sql.MAX), externalUrl)
        .input('thumbnailUrl', sql.NVarChar(sql.MAX), thumbnailUrl)
        .input('tags', sql.NVarChar(sql.MAX), tagsJson)
        .input('sortOrder', sql.Int, sortOrder)
        .query(`
            UPDATE PortfolioItems 
            SET Title = COALESCE(@title, Title),
                Description = COALESCE(@description, Description),
                ItemType = COALESCE(@itemType, ItemType),
                FileUrl = COALESCE(@fileUrl, FileUrl),
                ExternalUrl = COALESCE(@externalUrl, ExternalUrl),
                ThumbnailUrl = COALESCE(@thumbnailUrl, ThumbnailUrl),
                Tags = COALESCE(@tags, Tags),
                SortOrder = COALESCE(@sortOrder, SortOrder),
                UpdatedAt = GETUTCDATE()
            OUTPUT INSERTED.*
            WHERE ItemID = @itemId
        `);
    return result.recordset[0];
};

/**
 * Delete a portfolio item
 */
const deleteItem = async (itemId, userId) => {
    const pool = await poolPromise;

    const check = await pool.request()
        .input('itemId', sql.BigInt, itemId)
        .input('userId', sql.BigInt, userId)
        .query(`
            SELECT pi.ItemID FROM PortfolioItems pi
            JOIN Portfolios p ON pi.PortfolioID = p.PortfolioID
            WHERE pi.ItemID = @itemId AND p.UserID = @userId
        `);
    if (check.recordset.length === 0) throw new Error('Item not found or unauthorized.');

    await pool.request()
        .input('itemId', sql.BigInt, itemId)
        .query(`DELETE FROM PortfolioItems WHERE ItemID = @itemId`);
    return true;
};

/**
 * Re-evaluate a portfolio item
 */
const reEvaluateItem = async (itemId, userId) => {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('itemId', sql.BigInt, itemId)
        .input('userId', sql.BigInt, userId)
        .query(`
            SELECT pi.* FROM PortfolioItems pi
            JOIN Portfolios p ON pi.PortfolioID = p.PortfolioID
            WHERE pi.ItemID = @itemId AND p.UserID = @userId
        `);
    if (result.recordset.length === 0) throw new Error('Item not found or unauthorized.');

    const item = result.recordset[0];
    return await evaluateItemAsync(item);
};

module.exports = {
    addItem,
    updateItem,
    deleteItem,
    reEvaluateItem,
    evaluateItemAsync,
};
