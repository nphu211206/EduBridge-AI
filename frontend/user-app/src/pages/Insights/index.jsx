import React, { useState, useEffect } from 'react';
import { PORTFOLIO_API_URL } from '../../config';
import './Insights.css';

const Insights = () => {
    const [trending, setTrending] = useState([]);
    const [gap, setGap] = useState([]);
    const [fields, setFields] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [t, g, f, s] = await Promise.all([
                fetch(`${PORTFOLIO_API_URL}/api/insights/trending-skills`).then(r => r.json()),
                fetch(`${PORTFOLIO_API_URL}/api/insights/skill-gap`).then(r => r.json()),
                fetch(`${PORTFOLIO_API_URL}/api/insights/field-stats`).then(r => r.json()),
                fetch(`${PORTFOLIO_API_URL}/api/insights/platform-summary`).then(r => r.json()),
            ]);
            setTrending(t.data || []); setGap(g.data || []); setFields(f.data || []); setSummary(s.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fieldIcons = { Technical: '💻', Design: '🎨', Business: '📊', Science: '🔬', 'Soft Skill': '🤝' };

    if (loading) return <div className="ins-page"><div className="ins-loading"><div className="loading-spinner"></div></div></div>;

    return (
        <div className="ins-page">
            <div className="ins-hero">
                <h1>📈 Industry Insights</h1>
                <p>Xu hướng ngành nghề, skills hot, và gap analysis trên nền tảng</p>
            </div>

            {/* Platform Summary */}
            {summary && (
                <div className="ins-summary">
                    {[
                        { icon: '👥', value: summary.totalUsers, label: 'Người dùng' },
                        { icon: '⚡', value: summary.activeSkills, label: 'Kỹ năng active' },
                        { icon: '📝', value: summary.totalQuizzes, label: 'Bài thi' },
                        { icon: '✅', value: `${summary.quizPassRate}%`, label: 'Tỷ lệ pass' },
                        { icon: '📁', value: summary.totalPortfolios, label: 'Portfolios' },
                        { icon: '🏆', value: summary.avgPortfolioScore, label: 'TB portfolio' },
                    ].map((s, i) => (
                        <div key={i} className="summary-card">
                            <span className="s-icon">{s.icon}</span>
                            <span className="s-value">{s.value}</span>
                            <span className="s-label">{s.label}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="ins-grid">
                {/* Trending Skills */}
                <div className="ins-section">
                    <h3>🔥 Top Skills được học nhiều nhất</h3>
                    <div className="trending-list">
                        {trending.map((s, i) => (
                            <div key={s.SkillID} className="trending-item">
                                <span className="trending-rank">#{i + 1}</span>
                                <span className="trending-icon">{s.Icon || fieldIcons[s.Category] || '📌'}</span>
                                <div className="trending-info">
                                    <span className="trending-name">{s.Name}</span>
                                    <span className="trending-cat">{s.Category}</span>
                                </div>
                                <div className="trending-stats">
                                    <span className="trending-users">👥 {s.UserCount}</span>
                                    <span className="trending-avg">TB: {Math.round(s.AvgScore || 0)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skill Gap */}
                <div className="ins-section">
                    <h3>🎯 Skill Gap Analysis</h3>
                    <p className="ins-section-sub">Ngành nào thiếu người? → Cơ hội cho bạn!</p>
                    <div className="gap-list">
                        {gap.map(g => (
                            <div key={g.Category} className="gap-item">
                                <span className="gap-icon">{fieldIcons[g.Category] || '📌'}</span>
                                <div className="gap-info">
                                    <span className="gap-name">{g.Category}</span>
                                    <div className="gap-bar-bg">
                                        <div className="gap-bar-fill" style={{ width: `${Math.min(100, (g.TalentPool / Math.max(...gap.map(x => x.TalentPool), 1)) * 100)}%` }} />
                                    </div>
                                </div>
                                <span className="gap-count">👥 {g.TalentPool}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Field Performance */}
                <div className="ins-section full">
                    <h3>📊 Hiệu suất theo ngành</h3>
                    <div className="field-perf-grid">
                        {fields.map(f => (
                            <div key={f.Field} className="field-perf-card">
                                <span className="fp-icon">{fieldIcons[f.Field] || '📌'}</span>
                                <h4>{f.Field}</h4>
                                <div className="fp-stats">
                                    <span>👥 {f.ActiveUsers || 0} users</span>
                                    <span>📝 {f.TotalQuizzes || 0} quizzes</span>
                                    <span>✅ {f.TotalQuizzes > 0 ? Math.round(((f.PassedQuizzes || 0) / f.TotalQuizzes) * 100) : 0}% pass</span>
                                    <span>📊 TB: {Math.round(f.AvgScore || 0)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;
