/*-----------------------------------------------------------------
 * File: SkillQuiz/index.jsx — EduBridge AI Skill Quiz Hub
 * Choose field → skill → level → start AI quiz
 *-----------------------------------------------------------------*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioAPI } from '../../services/careerApi';
import { PORTFOLIO_API_URL } from '../../config';
import { APP_CONFIG } from '../../config';
import './SkillQuiz.css';

const SkillQuiz = () => {
    const navigate = useNavigate();
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [level, setLevel] = useState('Beginner');
    const [questionCount, setQuestionCount] = useState(10);
    const [generating, setGenerating] = useState(false);
    const [history, setHistory] = useState([]);
    const [tab, setTab] = useState('create'); // create | history

    useEffect(() => {
        fetchCategories();
        fetchHistory();
    }, []);

    useEffect(() => {
        if (selectedCategory) fetchSkills(selectedCategory);
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await PortfolioAPI.getCategories();
            setCategories(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchSkills = async (category) => {
        try {
            const res = await PortfolioAPI.getSkills(category);
            setSkills(res.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${PORTFOLIO_API_URL}/api/quiz/history/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setHistory(data.data || []);
        } catch (err) { console.error(err); }
    };

    const handleGenerate = async () => {
        if (!selectedSkill) return alert('Hãy chọn kỹ năng!');
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${PORTFOLIO_API_URL}/api/quiz/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ skillId: selectedSkill.SkillID, level, questionCount }),
            });
            const data = await res.json();
            if (data.success) {
                navigate(`/skill-quiz/${data.data.quiz.QuizID}`);
            } else {
                alert(data.message);
            }
        } catch (err) { alert(err.message); }
        finally { setGenerating(false); }
    };

    return (
        <div className="quiz-page">
            {/* Header */}
            <div className="quiz-hero">
                <h1 className="quiz-hero-title">
                    <span>📝</span> Kiểm tra Kỹ năng Đa ngành
                </h1>
                <p className="quiz-hero-subtitle">
                    AI tạo đề theo ngành & trình độ — Thi xong tự động cập nhật điểm kỹ năng & bảng xếp hạng
                </p>
            </div>

            {/* Tabs */}
            <div className="quiz-tabs">
                <button className={`qtab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
                    🎯 Tạo bài kiểm tra
                </button>
                <button className={`qtab ${tab === 'history' ? 'active' : ''}`} onClick={() => { setTab('history'); fetchHistory(); }}>
                    📊 Lịch sử ({history?.length})
                </button>
            </div>

            {/* Create Tab */}
            {tab === 'create' && (
                <div className="quiz-create">
                    {/* Step 1: Choose Field */}
                    <div className="quiz-step">
                        <h3 className="step-label">1️⃣ Chọn lĩnh vực</h3>
                        <div className="field-chips">
                            {(categories?.length > 0 ? categories : [
                                { Category: 'Technical' }, { Category: 'Design' },
                                { Category: 'Business' }, { Category: 'Science' }, { Category: 'Soft Skill' }
                            ])?.map(cat => (
                                <button
                                    key={cat.Category}
                                    className={`field-chip ${selectedCategory === cat.Category ? 'active' : ''}`}
                                    onClick={() => { setSelectedCategory(cat.Category); setSelectedSkill(null); }}
                                >
                                    {getFieldIcon(cat.Category)} {cat.Category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Choose Skill */}
                    {selectedCategory && (
                        <div className="quiz-step">
                            <h3 className="step-label">2️⃣ Chọn kỹ năng</h3>
                            <div className="skill-select-grid">
                                {skills?.map(s => (
                                    <button
                                        key={s.SkillID}
                                        className={`skill-select-btn ${selectedSkill?.SkillID === s.SkillID ? 'active' : ''}`}
                                        onClick={() => setSelectedSkill(s)}
                                    >
                                        {s.Icon || '📌'} {s.Name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Level & Count */}
                    {selectedSkill && (
                        <div className="quiz-step">
                            <h3 className="step-label">3️⃣ Cấu hình bài kiểm tra</h3>
                            <div className="quiz-config">
                                <div className="config-group">
                                    <label>Trình độ:</label>
                                    <div className="level-buttons">
                                        {['Beginner', 'Intermediate', 'Advanced']?.map(l => (
                                            <button
                                                key={l}
                                                className={`level-btn ${level === l ? 'active' : ''}`}
                                                onClick={() => setLevel(l)}
                                            >
                                                {l === 'Beginner' ? '🟢 Cơ bản' : l === 'Intermediate' ? '🟡 Trung bình' : '🔴 Nâng cao'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="config-group">
                                    <label>Số câu hỏi:</label>
                                    <div className="count-buttons">
                                        {[5, 10, 15, 20]?.map(c => (
                                            <button
                                                key={c}
                                                className={`count-btn ${questionCount === c ? 'active' : ''}`}
                                                onClick={() => setQuestionCount(c)}
                                            >
                                                {c} câu
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="quiz-summary-card">
                                <p>📋 <strong>{selectedSkill.Name}</strong> — {level === 'Beginner' ? 'Cơ bản' : level === 'Intermediate' ? 'Trung bình' : 'Nâng cao'}</p>
                                <p>❓ {questionCount} câu hỏi — ⏱️ ~{questionCount * 2} phút</p>
                                <p>📊 Cần 60% để pass — Tự động cập nhật kỹ năng</p>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="btn-start-quiz"
                            >
                                {generating ? '⏳ AI đang tạo đề...' : '🚀 Bắt đầu kiểm tra'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* History Tab */}
            {tab === 'history' && (
                <div className="quiz-history">
                    {history?.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon-large">📊</span>
                            <h3>Chưa có lịch sử kiểm tra</h3>
                            <p>Tạo bài kiểm tra để bắt đầu!</p>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history?.map(h => (
                                <div key={h.AttemptID} className={`history-card ${h.Passed ? 'passed' : 'failed'}`}>
                                    <div className="history-left">
                                        <span className="history-icon">{h.SkillIcon || '📌'}</span>
                                        <div>
                                            <h4>{h.QuizTitle || h.SkillName}</h4>
                                            <span className="history-level">{h.Level} • {h.FieldCategory}</span>
                                        </div>
                                    </div>
                                    <div className="history-right">
                                        <span className={`history-score ${h.Passed ? 'pass' : 'fail'}`}>
                                            {h.Percentage}%
                                        </span>
                                        <span className="history-status">
                                            {h.Passed ? '✅ PASS' : '❌ FAIL'}
                                        </span>
                                        <span className="history-date">
                                            {h.CompletedAt ? new Date(h.CompletedAt).toLocaleDateString('vi-VN') : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const getFieldIcon = (cat) => {
    const icons = { Technical: '💻', Design: '🎨', Business: '📊', Science: '🔬', 'Soft Skill': '🤝' };
    return icons[cat] || '📌';
};

export default SkillQuiz;
