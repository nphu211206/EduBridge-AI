// File: services/portfolio-service/services/achievement.service.js
// EduBridge AI — Achievement & Badge System

const { sql, poolPromise } = require('../config/db');

// Check and grant badges for a user
const checkAndGrantBadges = async (userId) => {
    const pool = await poolPromise;
    const newBadges = [];

    // Get all badges not yet earned
    const badges = await pool.request().input('uid', sql.BigInt, userId).query(`
        SELECT b.* FROM Badges b WHERE b.IsActive = 1 AND b.BadgeID NOT IN (SELECT BadgeID FROM UserBadges WHERE UserID = @uid)
    `);

    for (const badge of badges.recordset) {
        let earned = false;

        switch (badge.TriggerType) {
            case 'quiz_pass_count': {
                const r = await pool.request().input('uid', sql.BigInt, userId)
                    .query(`SELECT COUNT(*) as c FROM QuizAttempts WHERE UserID = @uid AND Passed = 1`);
                earned = r.recordset[0].c >= badge.TriggerValue;
                break;
            }
            case 'quiz_score_min': {
                const r = await pool.request().input('uid', sql.BigInt, userId)
                    .query(`SELECT MAX(Percentage) as m FROM QuizAttempts WHERE UserID = @uid AND Passed = 1`);
                earned = (r.recordset[0].m || 0) >= badge.TriggerValue;
                break;
            }
            case 'portfolio_score': {
                const r = await pool.request().input('uid', sql.BigInt, userId)
                    .query(`SELECT OverallScore FROM Portfolios WHERE UserID = @uid`);
                earned = (r.recordset[0]?.OverallScore || 0) >= badge.TriggerValue;
                break;
            }
            case 'portfolio_items_count': {
                const r = await pool.request().input('uid', sql.BigInt, userId)
                    .query(`SELECT COUNT(*) as c FROM PortfolioItems pi JOIN Portfolios p ON pi.PortfolioID = p.PortfolioID WHERE p.UserID = @uid`);
                earned = r.recordset[0].c >= badge.TriggerValue;
                break;
            }
            case 'portfolio_items_score': {
                const r = await pool.request().input('uid', sql.BigInt, userId)
                    .query(`SELECT COUNT(*) as c FROM PortfolioItems pi JOIN Portfolios p ON pi.PortfolioID = p.PortfolioID WHERE p.UserID = @uid AND pi.AiScore >= ${badge.TriggerValue}`);
                earned = r.recordset[0].c >= 10;
                break;
            }
            case 'multi_category_score': {
                const r = await pool.request().input('uid', sql.BigInt, userId)
                    .query(`SELECT COUNT(DISTINCT s.Category) as c FROM UserSkills us JOIN Skills s ON us.SkillID = s.SkillID WHERE us.UserID = @uid AND us.Score >= 70`);
                earned = r.recordset[0].c >= badge.TriggerValue;
                break;
            }
            case 'streak_days': {
                const r = await pool.request().input('uid', sql.BigInt, userId)
                    .query(`SELECT CurrentStreak, LongestStreak FROM UserStreaks WHERE UserID = @uid`);
                const streak = r.recordset[0];
                earned = streak && (streak.CurrentStreak >= badge.TriggerValue || streak.LongestStreak >= badge.TriggerValue);
                break;
            }
            case 'friend_count': {
                try {
                    const r = await pool.request().input('uid', sql.BigInt, userId)
                        .query(`SELECT COUNT(*) as c FROM Friends WHERE (UserID = @uid OR FriendID = @uid) AND Status = 'accepted'`);
                    earned = r.recordset[0].c >= badge.TriggerValue;
                } catch { earned = false; }
                break;
            }
            case 'application_count': {
                try {
                    const r = await pool.request().input('uid', sql.BigInt, userId)
                        .query(`SELECT COUNT(*) as c FROM Applications WHERE UserID = @uid`);
                    earned = r.recordset[0].c >= badge.TriggerValue;
                } catch { earned = false; }
                break;
            }
            case 'team_join_count': {
                try {
                    const r = await pool.request().input('uid', sql.BigInt, userId)
                        .query(`SELECT COUNT(*) as c FROM ProjectRoles WHERE AssignedUserID = @uid`);
                    earned = r.recordset[0].c >= badge.TriggerValue;
                } catch { earned = false; }
                break;
            }
            case 'path_complete_count': {
                try {
                    const r = await pool.request().input('uid', sql.BigInt, userId)
                        .query(`SELECT COUNT(*) as c FROM LearningPaths WHERE UserID = @uid AND ProgressPercent >= 100`);
                    earned = r.recordset[0].c >= badge.TriggerValue;
                } catch { earned = false; }
                break;
            }
            case 'field_quiz_pass': {
                const r = await pool.request().input('uid', sql.BigInt, userId).input('cat', sql.NVarChar(50), badge.Category)
                    .query(`SELECT COUNT(*) as c FROM QuizAttempts qa JOIN SkillQuizzes sq ON qa.QuizID = sq.QuizID WHERE qa.UserID = @uid AND qa.Passed = 1 AND sq.FieldCategory = @cat`);
                earned = r.recordset[0].c >= badge.TriggerValue;
                break;
            }
        }

        if (earned) {
            await pool.request().input('uid', sql.BigInt, userId).input('bid', sql.BigInt, badge.BadgeID)
                .query(`INSERT INTO UserBadges (UserID, BadgeID) VALUES (@uid, @bid)`);

            // Add XP
            await pool.request().input('uid', sql.BigInt, userId).input('xp', sql.Int, badge.XpReward)
                .query(`UPDATE UserStreaks SET TotalXp = TotalXp + @xp WHERE UserID = @uid`);

            newBadges.push(badge);
        }
    }
    return newBadges;
};

// Update daily streak
const updateStreak = async (userId) => {
    const pool = await poolPromise;
    const today = new Date().toISOString().split('T')[0];

    const existing = await pool.request().input('uid', sql.BigInt, userId)
        .query(`SELECT * FROM UserStreaks WHERE UserID = @uid`);

    if (existing.recordset.length === 0) {
        await pool.request().input('uid', sql.BigInt, userId).input('today', sql.Date, today)
            .query(`INSERT INTO UserStreaks (UserID, CurrentStreak, LongestStreak, LastActiveDate, TotalXp) VALUES (@uid, 1, 1, @today, 0)`);
        return { currentStreak: 1, isNew: true };
    }

    const streak = existing.recordset[0];
    if (streak.LastActiveDate && streak.LastActiveDate.toISOString().split('T')[0] === today) {
        return { currentStreak: streak.CurrentStreak, alreadyActive: true };
    }

    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = streak.LastActiveDate && streak.LastActiveDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];

    const newStreak = isConsecutive ? streak.CurrentStreak + 1 : 1;
    const longest = Math.max(newStreak, streak.LongestStreak);

    await pool.request().input('uid', sql.BigInt, userId)
        .input('streak', sql.Int, newStreak).input('longest', sql.Int, longest).input('today', sql.Date, today)
        .query(`UPDATE UserStreaks SET CurrentStreak = @streak, LongestStreak = @longest, LastActiveDate = @today WHERE UserID = @uid`);

    return { currentStreak: newStreak, longestStreak: longest };
};

// Get user achievements
const getUserAchievements = async (userId) => {
    const pool = await poolPromise;
    const [badgesRes, streakRes, allBadgesRes] = await Promise.all([
        pool.request().input('uid', sql.BigInt, userId).query(`
            SELECT b.*, ub.EarnedAt FROM UserBadges ub JOIN Badges b ON ub.BadgeID = b.BadgeID WHERE ub.UserID = @uid ORDER BY ub.EarnedAt DESC
        `),
        pool.request().input('uid', sql.BigInt, userId).query(`SELECT * FROM UserStreaks WHERE UserID = @uid`),
        pool.request().query(`SELECT * FROM Badges WHERE IsActive = 1 ORDER BY Rarity, Name`),
    ]);

    return {
        earned: badgesRes.recordset,
        streak: streakRes.recordset[0] || { CurrentStreak: 0, LongestStreak: 0, TotalXp: 0 },
        allBadges: allBadgesRes.recordset,
        earnedCount: badgesRes.recordset.length,
        totalBadges: allBadgesRes.recordset.length,
    };
};

module.exports = { checkAndGrantBadges, updateStreak, getUserAchievements };
