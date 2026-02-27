// File: frontend/user-app/src/services/careerApi.js
// EduBridge AI — Career & Portfolio API Service

import { CAREER_API_URL, PORTFOLIO_API_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
};

// ====================================================================
// CAREER API (Jobs, Applications, Interviews)
// ====================================================================
export const CareerAPI = {
    // Jobs
    getJobs: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return fetch(`${CAREER_API_URL}/api/jobs?${qs}`, { headers: getHeaders() }).then(handleResponse);
    },
    getJob: (jobId) => fetch(`${CAREER_API_URL}/api/jobs/${jobId}`, { headers: getHeaders() }).then(handleResponse),
    applyJob: (jobId, data) => fetch(`${CAREER_API_URL}/api/jobs/${jobId}/apply`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
    }).then(handleResponse),
    getMyApplications: () => fetch(`${CAREER_API_URL}/api/user/applications`, { headers: getHeaders() }).then(handleResponse),

    // Interviews
    getInterview: (id) => fetch(`${CAREER_API_URL}/api/interviews/${id}`, { headers: getHeaders() }).then(handleResponse),
    startInterview: (id) => fetch(`${CAREER_API_URL}/api/interviews/${id}/start`, {
        method: 'POST', headers: getHeaders(),
    }).then(handleResponse),
    submitInterview: (id, answers) => fetch(`${CAREER_API_URL}/api/interviews/${id}/submit`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ answers }),
    }).then(handleResponse),
};

// ====================================================================
// PORTFOLIO API
// ====================================================================
export const PortfolioAPI = {
    // Portfolio
    getMyPortfolio: () => fetch(`${PORTFOLIO_API_URL}/api/portfolio/me`, { headers: getHeaders() }).then(handleResponse),
    getPublicPortfolio: (userId) => fetch(`${PORTFOLIO_API_URL}/api/portfolio/user/${userId}`).then(handleResponse),
    updatePortfolio: (data) => fetch(`${PORTFOLIO_API_URL}/api/portfolio/me`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(data),
    }).then(handleResponse),
    evaluatePortfolio: () => fetch(`${PORTFOLIO_API_URL}/api/portfolio/me/evaluate`, {
        method: 'POST', headers: getHeaders(),
    }).then(handleResponse),

    // Items
    addItem: (formData) => {
        const token = localStorage.getItem('token');
        return fetch(`${PORTFOLIO_API_URL}/api/portfolio/items`, {
            method: 'POST',
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
            body: formData, // FormData for file upload
        }).then(handleResponse);
    },
    updateItem: (itemId, formData) => {
        const token = localStorage.getItem('token');
        return fetch(`${PORTFOLIO_API_URL}/api/portfolio/items/${itemId}`, {
            method: 'PUT',
            headers: { ...(token && { Authorization: `Bearer ${token}` }) },
            body: formData,
        }).then(handleResponse);
    },
    deleteItem: (itemId) => fetch(`${PORTFOLIO_API_URL}/api/portfolio/items/${itemId}`, {
        method: 'DELETE', headers: getHeaders(),
    }).then(handleResponse),
    reEvaluateItem: (itemId) => fetch(`${PORTFOLIO_API_URL}/api/portfolio/items/${itemId}/evaluate`, {
        method: 'POST', headers: getHeaders(),
    }).then(handleResponse),

    // External profiles
    getPlatforms: () => fetch(`${PORTFOLIO_API_URL}/api/portfolio/external/platforms`).then(handleResponse),
    connectPlatform: (platform, profileUrl) => fetch(`${PORTFOLIO_API_URL}/api/portfolio/external/connect`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ platform, profileUrl }),
    }).then(handleResponse),
    resyncPlatform: (platform) => fetch(`${PORTFOLIO_API_URL}/api/portfolio/external/resync/${platform}`, {
        method: 'POST', headers: getHeaders(),
    }).then(handleResponse),
    disconnectPlatform: (platform) => fetch(`${PORTFOLIO_API_URL}/api/portfolio/external/${platform}`, {
        method: 'DELETE', headers: getHeaders(),
    }).then(handleResponse),

    // Skills
    getSkills: (category) => fetch(`${PORTFOLIO_API_URL}/api/skills${category ? `?category=${category}` : ''}`).then(handleResponse),
    getCategories: () => fetch(`${PORTFOLIO_API_URL}/api/skills/categories`).then(handleResponse),
    getMySkills: () => fetch(`${PORTFOLIO_API_URL}/api/skills/my`, { headers: getHeaders() }).then(handleResponse),
    addSkill: (skillId, score) => fetch(`${PORTFOLIO_API_URL}/api/skills/my`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ skillId, score }),
    }).then(handleResponse),
    removeSkill: (userSkillId) => fetch(`${PORTFOLIO_API_URL}/api/skills/my/${userSkillId}`, {
        method: 'DELETE', headers: getHeaders(),
    }).then(handleResponse),
};

// ====================================================================
// RANKING API
// ====================================================================
export const RankingAPI = {
    getOverall: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return fetch(`${PORTFOLIO_API_URL}/api/ranking?${qs}`, { headers: getHeaders() }).then(handleResponse);
    },
    getBySkill: (skillId) => fetch(`${PORTFOLIO_API_URL}/api/ranking/by-skill/${skillId}`, { headers: getHeaders() }).then(handleResponse),
    getFieldStats: () => fetch(`${PORTFOLIO_API_URL}/api/ranking/fields`).then(handleResponse),
    getTopSkills: (category) => fetch(`${PORTFOLIO_API_URL}/api/ranking/top-skills${category ? `?category=${category}` : ''}`).then(handleResponse),
};
