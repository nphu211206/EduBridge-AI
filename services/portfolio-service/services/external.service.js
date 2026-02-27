// File: services/portfolio-service/services/external.service.js
// EduBridge AI — External Profile Connector (GitHub, Behance, Dribbble, LinkedIn, Kaggle)

const axios = require('axios');
const { sql, poolPromise } = require('../config/db');
const aiEvaluator = require('./ai-evaluator.service');

// ====================================================================
// PLATFORM CONNECTORS
// ====================================================================
const CONNECTORS = {
    GitHub: {
        validate: (url) => /github\.com\/([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/github\.com\/([^\/]+)/i)?.[1],
        fetch: async (username) => {
            const headers = {};
            if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;

            const [userRes, reposRes] = await Promise.all([
                axios.get(`https://api.github.com/users/${username}`, { headers }),
                axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`, { headers }),
            ]);

            const repos = reposRes.data.map(r => ({
                name: r.name,
                description: r.description,
                language: r.language,
                stars: r.stargazers_count,
                forks: r.forks_count,
                url: r.html_url,
                updatedAt: r.updated_at,
            }));

            const languages = {};
            repos.forEach(r => { if (r.language) languages[r.language] = (languages[r.language] || 0) + 1; });

            return {
                username: userRes.data.login,
                name: userRes.data.name,
                bio: userRes.data.bio,
                avatar: userRes.data.avatar_url,
                publicRepos: userRes.data.public_repos,
                followers: userRes.data.followers,
                following: userRes.data.following,
                repos,
                topLanguages: Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([lang]) => lang),
                profileUrl: userRes.data.html_url,
            };
        },
    },

    Behance: {
        validate: (url) => /behance\.net\/([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/behance\.net\/([^\/]+)/i)?.[1],
        fetch: async (username) => {
            // Behance API requires a key, fallback to basic scraping
            return {
                username,
                platform: 'Behance',
                profileUrl: `https://www.behance.net/${username}`,
                note: 'Behance API requires API key. Profile data based on URL only.',
                projects: [],
            };
        },
    },

    Dribbble: {
        validate: (url) => /dribbble\.com\/([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/dribbble\.com\/([^\/]+)/i)?.[1],
        fetch: async (username) => {
            return {
                username,
                platform: 'Dribbble',
                profileUrl: `https://dribbble.com/${username}`,
                note: 'Dribbble API requires OAuth. Profile based on URL only.',
                shots: [],
            };
        },
    },

    LinkedIn: {
        validate: (url) => /linkedin\.com\/in\/([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/linkedin\.com\/in\/([^\/]+)/i)?.[1],
        fetch: async (username) => {
            return {
                username,
                platform: 'LinkedIn',
                profileUrl: `https://www.linkedin.com/in/${username}`,
                note: 'LinkedIn requires OAuth2. Profile based on URL only.',
            };
        },
    },

    Kaggle: {
        validate: (url) => /kaggle\.com\/([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/kaggle\.com\/([^\/]+)/i)?.[1],
        fetch: async (username) => {
            return {
                username,
                platform: 'Kaggle',
                profileUrl: `https://www.kaggle.com/${username}`,
                note: 'Kaggle API access limited. Profile based on URL only.',
            };
        },
    },

    DeviantArt: {
        validate: (url) => /deviantart\.com\/([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/deviantart\.com\/([^\/]+)/i)?.[1],
        fetch: async (username) => {
            return {
                username,
                platform: 'DeviantArt',
                profileUrl: `https://www.deviantart.com/${username}`,
            };
        },
    },

    ArtStation: {
        validate: (url) => /artstation\.com\/([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/artstation\.com\/([^\/]+)/i)?.[1],
        fetch: async (username) => {
            return {
                username,
                platform: 'ArtStation',
                profileUrl: `https://www.artstation.com/${username}`,
            };
        },
    },

    Medium: {
        validate: (url) => /medium\.com\/@?([^\/]+)/i.test(url),
        extractUsername: (url) => url.match(/medium\.com\/@?([^\/]+)/i)?.[1],
        fetch: async (username) => {
            return {
                username,
                platform: 'Medium',
                profileUrl: `https://medium.com/@${username}`,
            };
        },
    },
};

// ====================================================================
// PUBLIC API
// ====================================================================

/**
 * Connect an external profile
 */
const connectProfile = async (userId, platform, profileUrl) => {
    const connector = CONNECTORS[platform];
    if (!connector) throw new Error(`Platform "${platform}" is not supported.`);
    if (!connector.validate(profileUrl)) throw new Error(`Invalid ${platform} URL.`);

    const username = connector.extractUsername(profileUrl);
    if (!username) throw new Error(`Could not extract username from URL.`);

    // Fetch profile data
    let profileData;
    try {
        profileData = await connector.fetch(username);
    } catch (err) {
        console.error(`Failed to fetch ${platform} profile:`, err.message);
        profileData = { username, platform, error: err.message };
    }

    const profileDataJson = JSON.stringify(profileData);

    // Upsert into DB
    const pool = await poolPromise;
    const result = await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('platform', sql.NVarChar(50), platform)
        .input('profileUrl', sql.NVarChar(sql.MAX), profileUrl)
        .input('username', sql.NVarChar(255), username)
        .input('profileData', sql.NVarChar(sql.MAX), profileDataJson)
        .query(`
            MERGE ExternalProfiles AS target
            USING (SELECT @userId as UserID, @platform as Platform) AS source
            ON target.UserID = source.UserID AND target.Platform = source.Platform
            WHEN MATCHED THEN
                UPDATE SET ProfileUrl = @profileUrl, Username = @username, ProfileData = @profileData, LastSyncedAt = GETUTCDATE()
            WHEN NOT MATCHED THEN
                INSERT (UserID, Platform, ProfileUrl, Username, ProfileData, LastSyncedAt)
                VALUES (@userId, @platform, @profileUrl, @username, @profileData, GETUTCDATE())
            OUTPUT INSERTED.*;
        `);

    const profile = result.recordset[0];

    // AI evaluate asynchronously
    evaluateProfileAsync(profile.ProfileID, platform, profileData).catch(err =>
        console.error('Async profile eval error:', err.message)
    );

    return { ...profile, profileData };
};

/**
 * Evaluate external profile with AI
 */
const evaluateProfileAsync = async (profileId, platform, profileData) => {
    const evaluation = await aiEvaluator.evaluateExternalProfile(platform, profileData);

    const pool = await poolPromise;
    await pool.request()
        .input('profileId', sql.BigInt, profileId)
        .input('aiScore', sql.Int, evaluation.score)
        .input('aiEvaluation', sql.NVarChar(sql.MAX), JSON.stringify(evaluation))
        .query(`
            UPDATE ExternalProfiles 
            SET AiScore = @aiScore, AiEvaluation = @aiEvaluation
            WHERE ProfileID = @profileId
        `);
    return evaluation;
};

/**
 * Re-sync an external profile
 */
const resyncProfile = async (userId, platform) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('platform', sql.NVarChar(50), platform)
        .query(`SELECT * FROM ExternalProfiles WHERE UserID = @userId AND Platform = @platform`);

    if (result.recordset.length === 0) throw new Error('Profile not found.');
    const profile = result.recordset[0];
    return await connectProfile(userId, platform, profile.ProfileUrl);
};

/**
 * Disconnect an external profile
 */
const disconnectProfile = async (userId, platform) => {
    const pool = await poolPromise;
    await pool.request()
        .input('userId', sql.BigInt, userId)
        .input('platform', sql.NVarChar(50), platform)
        .query(`DELETE FROM ExternalProfiles WHERE UserID = @userId AND Platform = @platform`);
    return true;
};

/**
 * Get supported platforms list
 */
const getSupportedPlatforms = () => {
    return Object.keys(CONNECTORS).map(key => ({
        name: key,
        icon: getPlatformIcon(key),
        description: getPlatformDescription(key),
    }));
};

const getPlatformIcon = (platform) => {
    const icons = {
        GitHub: '💻', Behance: '🎨', Dribbble: '🏀', LinkedIn: '💼',
        Kaggle: '📊', DeviantArt: '🖌️', ArtStation: '🎭', Medium: '📝',
    };
    return icons[platform] || '🔗';
};

const getPlatformDescription = (platform) => {
    const desc = {
        GitHub: 'Repositories, code projects, contributions',
        Behance: 'Design portfolios, creative projects',
        Dribbble: 'Design shots, UI/UX work',
        LinkedIn: 'Professional experience, network',
        Kaggle: 'Data science competitions, notebooks',
        DeviantArt: 'Digital art, illustrations',
        ArtStation: '3D art, concept art, game art',
        Medium: 'Articles, blog posts, writing',
    };
    return desc[platform] || 'External profile';
};

module.exports = {
    connectProfile,
    resyncProfile,
    disconnectProfile,
    getSupportedPlatforms,
};
