/*-----------------------------------------------------------------
 * File: SkillQuiz/QuizSession.jsx — EduBridge AI Quiz Session
 * Take quiz: timer, questions, submit, AI grading results
 *-----------------------------------------------------------------*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PORTFOLIO_API_URL } from '../../config';
import './SkillQuiz.css';

const QuizSession = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [results, setResults] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchQuiz();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${PORTFOLIO_API_URL}/api/quiz/${quizId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setQuiz(data.data.quiz);
                setQuestions(data.data.questions);
                const totalSeconds = (data.data.quiz.TimeLimitMinutes || 20) * 60;
                setTimeLeft(totalSeconds);
                // Start timer
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && questions?.length > 0 && !results) {
            handleSubmit();
        }
    }, [timeLeft]);

    const handleAnswer = (questionId, answer) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = async () => {
        if (submitting) return;
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitting(true);

        try {
            const answerArray = questions?.map(q => ({
                questionId: q.QuestionID,
                answer: answers[q.QuestionID] || '',
            }));

            const token = localStorage.getItem('token');
            const res = await fetch(`${PORTFOLIO_API_URL}/api/quiz/${quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ answers: answerArray }),
            });
            const data = await res.json();
            if (data.success) {
                setResults(data.data);
            } else {
                alert(data.message);
            }
        } catch (err) { alert(err.message); }
        finally { setSubmitting(false); }
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="quiz-loading"><div className="loading-spinner"></div><p>Đang tải bài kiểm tra...</p></div>;
    if (!quiz) return <div className="quiz-loading"><p>❌ Không tìm thấy bài kiểm tra</p></div>;

    // RESULTS VIEW
    if (results) {
        return (
            <div className="quiz-page">
                <div className="quiz-results">
                    <div className={`results-header ${results.passed ? 'passed' : 'failed'}`}>
                        <span className="results-emoji">{results.passed ? '🎉' : '📝'}</span>
                        <h1>{results.passed ? 'Chúc mừng! Bạn đã PASS!' : 'Chưa đạt — Thử lại nhé!'}</h1>
                        <div className="results-score-big">
                            <span className="score-number">{results.percentage}%</span>
                            <span className="score-detail">{results.totalScore}/{results.maxScore} điểm</span>
                        </div>
                        {results.passed && <p className="results-badge">✅ Kỹ năng đã được cập nhật trên portfolio!</p>}
                    </div>

                    <div className="results-answers">
                        <h3>Chi tiết đáp án:</h3>
                        {results.gradedAnswers?.map((ga, idx) => (
                            <div key={idx} className={`answer-card ${ga.isCorrect ? 'correct' : 'wrong'}`}>
                                <div className="answer-header">
                                    <span className="answer-status">{ga.isCorrect ? '✅' : '❌'}</span>
                                    <span className="answer-points">{ga.score}/{ga.maxPoints} điểm</span>
                                </div>
                                <p className="answer-question">Câu {idx + 1}: {questions[idx]?.QuestionText}</p>
                                <div className="answer-details">
                                    <p><strong>Đáp án của bạn:</strong> {ga.userAnswer || '(Không trả lời)'}</p>
                                    <p><strong>Đáp án đúng:</strong> {ga.correctAnswer}</p>
                                    {ga.explanation && <p className="answer-explain">💡 {ga.explanation}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="results-actions">
                        <button onClick={() => navigate('/skill-quiz')} className="btn-back">← Quay lại</button>
                        <button onClick={() => navigate('/portfolio')} className="btn-portfolio">📁 Xem Portfolio</button>
                        <button onClick={() => navigate('/ranking')} className="btn-ranking">🏆 Bảng xếp hạng</button>
                    </div>
                </div>
            </div>
        );
    }

    // QUIZ-TAKING VIEW
    const q = questions[currentQ];
    const answeredCount = Object.keys(answers)?.length;

    return (
        <div className="quiz-page">
            <div className="quiz-session">
                {/* Top Bar */}
                <div className="session-topbar">
                    <div className="topbar-info">
                        <span className="topbar-skill">{quiz.SkillName} — {quiz.Level}</span>
                        <span className="topbar-progress">Câu {currentQ + 1}/{questions?.length}</span>
                    </div>
                    <div className={`topbar-timer ${timeLeft < 60 ? 'urgent' : ''}`}>
                        ⏱️ {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="session-progress">
                    <div className="progress-bar" style={{ width: `${((currentQ + 1) / questions?.length) * 100}%` }}></div>
                </div>

                {/* Question */}
                <div className="question-card">
                    <div className="question-number">Câu {currentQ + 1}</div>
                    <div className="question-type-badge">{q.QuestionType === 'multiple_choice' ? '📋 Trắc nghiệm' : q.QuestionType === 'code' ? '💻 Code' : '✏️ Tự luận'}</div>
                    <p className="question-text">{q.QuestionText}</p>

                    {/* Answer Input */}
                    {q.QuestionType === 'multiple_choice' && q.Options ? (
                        <div className="mc-options">
                            {q.Options?.map((opt, i) => (
                                <button
                                    key={i}
                                    className={`mc-option ${answers[q.QuestionID] === opt ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(q.QuestionID, opt)}
                                >
                                    <span className="mc-letter">{String.fromCharCode(65 + i)}</span>
                                    <span className="mc-text">{opt.replace(/^[A-D]\)\s*/, '')}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <textarea
                            className="answer-textarea"
                            placeholder={q.QuestionType === 'code' ? 'Viết code ở đây...' : 'Nhập câu trả lời...'}
                            value={answers[q.QuestionID] || ''}
                            onChange={e => handleAnswer(q.QuestionID, e.target.value)}
                            rows={q.QuestionType === 'code' ? 8 : 4}
                        />
                    )}
                </div>

                {/* Question Nav */}
                <div className="question-dots">
                    {questions?.map((_, i) => (
                        <button
                            key={i}
                            className={`q-dot ${i === currentQ ? 'current' : ''} ${answers[questions[i].QuestionID] ? 'answered' : ''}`}
                            onClick={() => setCurrentQ(i)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                {/* Bottom Nav */}
                <div className="session-nav">
                    <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn-nav">← Trước</button>
                    <span className="nav-answered">{answeredCount}/{questions?.length} đã trả lời</span>
                    {currentQ < questions?.length - 1 ? (
                        <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-nav btn-next">Tiếp →</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={submitting} className="btn-submit-quiz">
                            {submitting ? '⏳ Đang chấm...' : '📤 Nộp bài'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizSession;
