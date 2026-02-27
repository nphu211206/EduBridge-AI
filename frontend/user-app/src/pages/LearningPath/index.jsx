import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTFOLIO_API_URL } from '../../config';
import './LearningPath.css';

const LearningPath = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [careerGoal, setCareerGoal] = useState('');
    const [field, setField] = useState('');
    const [generating, setGenerating] = useState(false);
    const [expandedPath, setExpandedPath] = useState(null);

    useEffect(() => { fetchPaths(); }, []);

    const fetchPaths = async () => {
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/learning-path/me`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setPaths(data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleGenerate = async () => {
        if (!careerGoal.trim()) return;
        setGenerating(true);
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/learning-path/generate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ careerGoal, fieldCategory: field }),
            });
            const data = await res.json();
            if (data.success) { fetchPaths(); setShowCreate(false); setCareerGoal(''); }
            else alert(data.message);
        } catch (err) { alert(err.message); }
        finally { setGenerating(false); }
    };

    const completeMilestone = async (milestoneId) => {
        try {
            await fetch(`${PORTFOLIO_API_URL}/api/learning-path/milestone/${milestoneId}/complete`, {
                method: 'PUT', headers: { Authorization: `Bearer ${token}` },
            });
            fetchPaths();
        } catch (err) { console.error(err); }
    };

    const fields = ['Technical', 'Design', 'Business', 'Science', 'Soft Skill'];
    const typeIcons = { course: '📚', project: '🛠️', quiz: '📝', certificate: '🏅', reading: '📖' };

    return (
        <div className="lp-page">
            <div className="lp-hero">
                <h1>🧬 Lộ trình Học Cá nhân hóa</h1>
                <p>AI phân tích kỹ năng & mục tiêu → Tạo roadmap riêng cho bạn</p>
                <button onClick={() => setShowCreate(!showCreate)} className="btn-create-path">
                    {showCreate ? '✕ Đóng' : '✨ Tạo lộ trình mới'}
                </button>
            </div>

            {showCreate && (
                <div className="lp-create">
                    <h3>Mục tiêu nghề nghiệp của bạn là gì?</h3>
                    <input type="text" value={careerGoal} onChange={e => setCareerGoal(e.target.value)}
                        placeholder='VD: "Trở thành UX Designer", "Fullstack Developer", "Marketing Manager"...'
                        className="lp-goal-input" />
                    <div className="lp-field-chips">
                        {fields.map(f => (
                            <button key={f} className={`field-chip ${field === f ? 'active' : ''}`} onClick={() => setField(f)}>
                                {f === 'Technical' ? '💻' : f === 'Design' ? '🎨' : f === 'Business' ? '📊' : f === 'Science' ? '🔬' : '🤝'} {f}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleGenerate} disabled={generating || !careerGoal.trim()} className="btn-generate-path">
                        {generating ? '⏳ AI đang phân tích & tạo lộ trình...' : '🚀 AI tạo lộ trình'}
                    </button>
                </div>
            )}

            <div className="lp-content">
                {loading ? <div className="lp-loading"><div className="loading-spinner"></div></div>
                    : paths.length === 0 ? (
                        <div className="lp-empty"><span>🧬</span><h3>Chưa có lộ trình</h3><p>Tạo lộ trình đầu tiên để bắt đầu!</p></div>
                    ) : (
                        paths.map(path => (
                            <div key={path.PathID} className="path-card" onClick={() => setExpandedPath(expandedPath === path.PathID ? null : path.PathID)}>
                                <div className="path-header">
                                    <div className="path-info">
                                        <h3>{path.Title}</h3>
                                        <span className="path-goal">{path.CareerGoal}</span>
                                        <span className="path-field">{path.FieldCategory}</span>
                                    </div>
                                    <div className="path-progress-ring">
                                        <svg viewBox="0 0 36 36" className="circular-chart">
                                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className="circle" strokeDasharray={`${path.progress || 0}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <text x="18" y="20.35" className="percentage">{path.progress || 0}%</text>
                                        </svg>
                                    </div>
                                </div>
                                {path.AiAnalysis && <p className="path-analysis">🤖 {path.AiAnalysis}</p>}

                                {expandedPath === path.PathID && path.milestones && (
                                    <div className="path-timeline">
                                        {path.milestones.map((m, i) => (
                                            <div key={m.MilestoneID} className={`timeline-item ${m.IsCompleted ? 'completed' : ''}`}>
                                                <div className="timeline-dot">{m.IsCompleted ? '✅' : typeIcons[m.MilestoneType] || '📌'}</div>
                                                <div className="timeline-content">
                                                    <div className="timeline-header">
                                                        <span className="phase-badge">Phase {m.Phase}</span>
                                                        <span className="duration">{m.DurationWeeks} tuần</span>
                                                    </div>
                                                    <h4>{m.Title}</h4>
                                                    <p>{m.Description}</p>
                                                    {!m.IsCompleted && (
                                                        <button onClick={(e) => { e.stopPropagation(); completeMilestone(m.MilestoneID); }} className="btn-complete-ms">
                                                            ✅ Đánh dấu hoàn thành
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
            </div>
        </div>
    );
};

export default LearningPath;
