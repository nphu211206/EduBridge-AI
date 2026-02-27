// File: services/portfolio-service/services/team-builder.service.js
// EduBridge AI — AI Team Builder (Multi-Discipline Team Matching)

const { sql, poolPromise } = require('../config/db');
const OpenAI = require('openai');
let openai;
const init = () => { if (!openai && process.env.OPENAI_API_KEY) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); return !!openai; };

const createProject = async (userId, { title, description, fieldCategory, maxMembers, deadline, roles }) => {
    const pool = await poolPromise;
    const projRes = await pool.request()
        .input('creatorId', sql.BigInt, userId)
        .input('title', sql.NVarChar(255), title)
        .input('desc', sql.NText, description)
        .input('field', sql.NVarChar(50), fieldCategory)
        .input('max', sql.Int, maxMembers || 5)
        .input('deadline', sql.DateTime2, deadline || null)
        .query(`INSERT INTO TeamProjects (CreatorID, Title, Description, FieldCategory, MaxMembers, Deadline)
                OUTPUT INSERTED.* VALUES (@creatorId, @title, @desc, @field, @max, @deadline)`);
    const project = projRes.recordset[0];

    // Create roles
    for (const role of (roles || [])) {
        await pool.request()
            .input('pid', sql.BigInt, project.ProjectID)
            .input('name', sql.NVarChar(100), role.name)
            .input('skills', sql.NVarChar(sql.MAX), JSON.stringify(role.requiredSkills || []))
            .query(`INSERT INTO ProjectRoles (ProjectID, RoleName, RequiredSkills) VALUES (@pid, @name, @skills)`);
    }
    return project;
};

const findCandidates = async (projectId, roleId) => {
    const pool = await poolPromise;

    const roleRes = await pool.request().input('rid', sql.BigInt, roleId)
        .query(`SELECT * FROM ProjectRoles WHERE RoleID = @rid`);
    if (roleRes.recordset.length === 0) throw new Error('Role not found');
    const role = roleRes.recordset[0];
    const requiredSkills = JSON.parse(role.RequiredSkills || '[]');

    // Find users with matching skills
    const skillNames = requiredSkills.map((_, i) => `@skill${i}`).join(',');
    const request = pool.request();
    requiredSkills.forEach((s, i) => request.input(`skill${i}`, sql.NVarChar(100), s));
    request.input('pid', sql.BigInt, projectId);

    let query = `
        SELECT DISTINCT u.UserID, u.FullName, u.Image,
            (SELECT STRING_AGG(s2.Name, ', ') FROM UserSkills us2 JOIN Skills s2 ON us2.SkillID = s2.SkillID WHERE us2.UserID = u.UserID) as AllSkills,
            (SELECT AVG(us3.Score) FROM UserSkills us3 JOIN Skills s3 ON us3.SkillID = s3.SkillID WHERE us3.UserID = u.UserID ${requiredSkills.length > 0 ? `AND s3.Name IN (${skillNames})` : ''}) as MatchScore,
            (SELECT COUNT(*) FROM UserSkills us4 JOIN Skills s4 ON us4.SkillID = s4.SkillID WHERE us4.UserID = u.UserID ${requiredSkills.length > 0 ? `AND s4.Name IN (${skillNames})` : ''}) as MatchedSkillCount,
            ISNULL(p.OverallScore, 0) as PortfolioScore
        FROM Users u
        LEFT JOIN Portfolios p ON u.UserID = p.UserID
        LEFT JOIN UserSkills us ON u.UserID = us.UserID
        LEFT JOIN Skills s ON us.SkillID = s.SkillID
        WHERE u.UserID NOT IN (SELECT AssignedUserID FROM ProjectRoles WHERE ProjectID = @pid AND AssignedUserID IS NOT NULL)
          AND u.UserID NOT IN (SELECT CreatorID FROM TeamProjects WHERE ProjectID = @pid)
    `;
    if (requiredSkills.length > 0) query += ` AND s.Name IN (${skillNames})`;
    query += ` ORDER BY MatchScore DESC, PortfolioScore DESC`;

    const result = await request.query(query);

    return result.recordset.slice(0, 10).map(u => ({
        ...u,
        MatchScore: Math.round(u.MatchScore || 0),
        MatchedSkillCount: u.MatchedSkillCount || 0,
        TotalRequired: requiredSkills.length,
    }));
};

const inviteUser = async (projectId, roleId, invitedUserId, invitedById, message) => {
    const pool = await poolPromise;
    await pool.request()
        .input('pid', sql.BigInt, projectId).input('rid', sql.BigInt, roleId)
        .input('invited', sql.BigInt, invitedUserId).input('by', sql.BigInt, invitedById)
        .input('msg', sql.NVarChar(500), message || '')
        .query(`INSERT INTO TeamInvites (ProjectID, RoleID, InvitedUserID, InvitedByID, Message) VALUES (@pid, @rid, @invited, @by, @msg)`);
    return { success: true };
};

const respondInvite = async (inviteId, userId, accept) => {
    const pool = await poolPromise;
    const status = accept ? 'Accepted' : 'Declined';
    await pool.request().input('id', sql.BigInt, inviteId).input('uid', sql.BigInt, userId).input('status', sql.NVarChar(30), status)
        .query(`UPDATE TeamInvites SET Status = @status WHERE InviteID = @id AND InvitedUserID = @uid`);

    if (accept) {
        const invite = await pool.request().input('id', sql.BigInt, inviteId).query(`SELECT * FROM TeamInvites WHERE InviteID = @id`);
        if (invite.recordset.length > 0) {
            const inv = invite.recordset[0];
            await pool.request().input('rid', sql.BigInt, inv.RoleID).input('uid', sql.BigInt, userId)
                .query(`UPDATE ProjectRoles SET AssignedUserID = @uid, Status = 'Filled' WHERE RoleID = @rid`);
        }
    }
    return { success: true, status };
};

const getMyProjects = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request().input('uid', sql.BigInt, userId).query(`
        SELECT tp.*, (SELECT COUNT(*) FROM ProjectRoles pr WHERE pr.ProjectID = tp.ProjectID AND pr.AssignedUserID IS NOT NULL) as FilledRoles,
            (SELECT COUNT(*) FROM ProjectRoles pr2 WHERE pr2.ProjectID = tp.ProjectID) as TotalRoles
        FROM TeamProjects tp
        WHERE tp.CreatorID = @uid OR tp.ProjectID IN (SELECT ProjectID FROM ProjectRoles WHERE AssignedUserID = @uid)
        ORDER BY tp.CreatedAt DESC
    `);
    return result.recordset;
};

const getMyInvites = async (userId) => {
    const pool = await poolPromise;
    const result = await pool.request().input('uid', sql.BigInt, userId).query(`
        SELECT ti.*, tp.Title as ProjectTitle, tp.Description as ProjectDesc, pr.RoleName, u.FullName as InviterName
        FROM TeamInvites ti
        JOIN TeamProjects tp ON ti.ProjectID = tp.ProjectID
        JOIN ProjectRoles pr ON ti.RoleID = pr.RoleID
        JOIN Users u ON ti.InvitedByID = u.UserID
        WHERE ti.InvitedUserID = @uid AND ti.Status = 'Pending'
        ORDER BY ti.CreatedAt DESC
    `);
    return result.recordset;
};

module.exports = { createProject, findCandidates, inviteUser, respondInvite, getMyProjects, getMyInvites };
