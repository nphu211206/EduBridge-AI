/*-----------------------------------------------------------------
 * Career/InterviewSession.jsx — AI Interview Session
 * Answer questions from recruiter/AI, timed, with scoring
 *-----------------------------------------------------------------*/
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CareerAPI } from '../../services/careerApi';
import './Career.css';

const InterviewSession = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null);
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchInterview();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [interviewId]);

    const fetchInterview = async () => {
        try {
            const res = await CareerAPI.getInterview(interviewId);
            setInterview(res.data || res.interview || res);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleStart = async () => {
        try {
            await CareerAPI.startInterview(interviewId);
            setStarted(true);
            const totalSeconds = (interview.TimeLimitMinutes || 30) * 60;
            setTimeLeft(totalSeconds);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) { alert(err.message); }
    };

    useEffect(() => {
        if (timeLeft === 0 && started && !results) handleSubmit();
    }, [timeLeft]);

    const handleSubmit = async () => {
        if (submitting) return;
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitting(true);
        try {
            const answerArray = (interview.Questions || []).map((q, i) => ({
                questionId: q.QuestionID || i,
                answer: answers[i] || '',
            }));
            const res = await CareerAPI.submitInterview(interviewId, answerArray);
            setResults(res.data || res);
        } catch (err) { alert(err.message); }
        finally { setSubmitting(false); }
    };

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    if (loading) return <div className="career-loading"><div className="loading-spinner"></div></div>;
    if (!interview) return <div className="career-loading"><p>❌ Không tìm thấy phỏng vấn</p></div>;

    // RESULTS
    if (results) {
        return (
            <div className="career-page">
                <div className="interview-results">
                    <div className="interview-results-header">
                        <span className="results-emoji">🎤</span>
                        <h1>Kết quả phỏng vấn AI</h1>
                        <div className="results-score-big">
                            <span className="score-number">{results.score || results.overallScore || '—'}</span>
                            <span className="score-detail">/100</span>
                        </div>
                        {results.feedback && <p className="results-feedback">🤖 {results.feedback}</p>}
                    </div>
                    <div className="results-actions">
                        <button onClick={() => navigate('/career/my-applications')} className="btn-back">📋 Xem đơn ứng tuyển</button>
                        <button onClick={() => navigate('/career')} className="btn-ranking">💼 Tìm việc khác</button>
                    </div>
                </div>
            </div>
        );
    }

    // NOT STARTED
    if (!started) {
        return (
            <div className="career-page">
                <div className="interview-intro">
                    <span className="intro-icon">🎤</span>
                    <h1>Phỏng vấn AI</h1>
                    <p className="intro-job">{interview.JobTitle || 'Vị trí ứng tuyển'}</p>
                    <div className="intro-info">
                        <p>❓ {interview.Questions?.length || 0} câu hỏi</p>
                        <p>⏱️ {interview.TimeLimitMinutes || 30} phút</p>
                        <p>🤖 AI sẽ tạo câu hỏi và chấm điểm</p>
                    </div>
                    <button onClick={handleStart} className="btn-start-interview">🚀 Bắt đầu phỏng vấn</button>
                </div>
            </div>
        );
    }

    // IN-PROGRESS
    const questions = interview.Questions || [];
    const q = questions[currentQ];

    return (
        <div className="career-page">
            <div className="interview-session">
                <div className="session-topbar">
                    <span className="topbar-skill">🎤 Phỏng vấn — Câu {currentQ + 1}/{questions.length}</span>
                    <span className={`topbar-timer ${timeLeft < 60 ? 'urgent' : ''}`}>⏱️ {formatTime(timeLeft)}</span>
                </div>
                <div className="session-progress">
                    <div className="progress-bar" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
                </div>

                <div className="question-card">
                    <div className="question-number">Câu {currentQ + 1}</div>
                    <p className="question-text">{q?.Question || q?.QuestionText || q}</p>
                    <textarea
                        className="answer-textarea"
                        placeholder="Nhập câu trả lời của bạn..."
                        value={answers[currentQ] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [currentQ]: e.target.value }))}
                        rows={6}
                    />
                </div>

                <div className="session-nav">
                    <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn-nav">← Trước</button>
                    <span className="nav-answered">{Object.keys(answers).length}/{questions.length} đã trả lời</span>
                    {currentQ < questions.length - 1 ? (
                        <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-nav btn-next">Tiếp →</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={submitting} className="btn-submit-quiz">
                            {submitting ? '⏳ AI đang chấm...' : '📤 Nộp phỏng vấn'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewSession;
