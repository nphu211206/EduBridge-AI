import React, { useState, useEffect } from 'react';
import { PORTFOLIO_API_URL } from '../../config';
import './Achievements.css';

const Achievements = () => {
    const token = localStorage.getItem('token');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [newBadges, setNewBadges] = useState([]);

    useEffect(() => { fetchAchievements(); updateStreak(); }, []);

    const fetchAchievements = async () => {
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/achievements/me`, { headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            setData(d.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const updateStreak = async () => {
        try {
            await fetch(`${PORTFOLIO_API_URL}/api/achievements/streak`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) { console.error(err); }
    };

    const checkBadges = async () => {
        setChecking(true);
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/achievements/check`, {
                method: 'POST', headers: { Authorization: `Bearer ${token}` },
            });
            const d = await res.json();
            if (d.data?.newBadges?.length > 0) {
                setNewBadges(d.data.newBadges);
                fetchAchievements();
            }
        } catch (err) { console.error(err); }
        finally { setChecking(false); }
    };

    const rarityColors = { Common: '#94a3b8', Uncommon: '#22c55e', Rare: '#3b82f6', Epic: '#a855f7', Legendary: '#f59e0b' };

    if (loading) return <div className="ach-page"><div className="ach-loading"><div className="loading-spinner"></div></div></div>;

    return (
        <div className="ach-page">
            <div className="ach-hero">
                <h1>🏅 Thành tựu & Huy hiệu</h1>
                <p>Thu thập huy hiệu, duy trì streak, tích lũy XP</p>
            </div>

            {/* Stats */}
            <div className="ach-stats">
                <div className="ach-stat streak">
                    <span className="stat-big">🔥 {data?.streak?.CurrentStreak || 0}</span>
                    <span className="stat-sub">ngày streak</span>
                </div>
                <div className="ach-stat xp">
                    <span className="stat-big">⚡ {data?.streak?.TotalXp || 0}</span>
                    <span className="stat-sub">XP tổng</span>
                </div>
                <div className="ach-stat badges">
                    <span className="stat-big">🏅 {data?.earnedCount || 0}/{data?.totalBadges || 0}</span>
                    <span className="stat-sub">huy hiệu</span>
                </div>
                <div className="ach-stat longest">
                    <span className="stat-big">🏆 {data?.streak?.LongestStreak || 0}</span>
                    <span className="stat-sub">streak dài nhất</span>
                </div>
            </div>

            {/* Check button */}
            <div className="ach-check-section">
                <button onClick={checkBadges} disabled={checking} className="btn-check-badges">
                    {checking ? '⏳ Đang kiểm tra...' : '🔍 Kiểm tra huy hiệu mới'}
                </button>
                {newBadges.length > 0 && (
                    <div className="new-badges-alert">
                        🎉 Bạn vừa nhận {newBadges.length} huy hiệu mới!
                        {newBadges.map(b => <span key={b.BadgeID} className="new-badge">{b.Icon} {b.Name}</span>)}
                    </div>
                )}
            </div>

            {/* Badge Grid */}
            <div className="ach-grid-section">
                <h3>🏅 Tất cả huy hiệu ({data?.totalBadges || 0})</h3>
                <div className="badge-grid">
                    {(data?.allBadges || []).map(badge => {
                        const earned = data?.earned?.find(e => e.BadgeID === badge.BadgeID);
                        return (
                            <div key={badge.BadgeID} className={`badge-card ${earned ? 'earned' : 'locked'}`}>
                                <div className="badge-icon-large" style={{ borderColor: earned ? rarityColors[badge.Rarity] : '#333' }}>
                                    {earned ? badge.Icon : '🔒'}
                                </div>
                                <h4 className="badge-name">{badge.Name}</h4>
                                <p className="badge-desc">{badge.Description}</p>
                                <div className="badge-meta">
                                    <span className="badge-rarity" style={{ color: rarityColors[badge.Rarity] }}>{badge.Rarity}</span>
                                    <span className="badge-xp">+{badge.XpReward} XP</span>
                                </div>
                                {earned && <span className="badge-earned-date">✅ {new Date(earned.EarnedAt).toLocaleDateString('vi-VN')}</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Achievements;
