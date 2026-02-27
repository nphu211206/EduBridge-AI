/*-----------------------------------------------------------------
 * Career/MyApplications.jsx — Track job applications
 *-----------------------------------------------------------------*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CareerAPI } from '../../services/careerApi';
import './Career.css';

const MyApplications = () => {
    const navigate = useNavigate();
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchApps(); }, []);

    const fetchApps = async () => {
        try {
            const res = await CareerAPI.getMyApplications();
            setApps(res.data || res.applications || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const getStatusBadge = (status) => {
        const map = {
            Pending: { label: '⏳ Đang xem xét', cls: 'status-pending' },
            Reviewed: { label: '👀 Đã xem', cls: 'status-reviewed' },
            Shortlisted: { label: '⭐ Vào vòng tiếp', cls: 'status-shortlisted' },
            Interview: { label: '🎤 Mời phỏng vấn', cls: 'status-interview' },
            Offered: { label: '🎉 Nhận offer', cls: 'status-offered' },
            Rejected: { label: '❌ Từ chối', cls: 'status-rejected' },
        };
        return map[status] || { label: status, cls: 'status-pending' };
    };

    return (
        <div className="career-page">
            <div className="apps-container">
                <div className="apps-header">
                    <button onClick={() => navigate('/career')} className="back-link">← Quay lại</button>
                    <h1>📋 Đơn ứng tuyển của tôi</h1>
                    <p className="apps-count">{apps.length} đơn</p>
                </div>

                {loading ? (
                    <div className="career-loading"><div className="loading-spinner"></div></div>
                ) : apps.length === 0 ? (
                    <div className="career-empty">
                        <span className="empty-icon">📭</span>
                        <h3>Chưa ứng tuyển việc nào</h3>
                        <button onClick={() => navigate('/career')} className="retry-btn">🔍 Tìm việc ngay</button>
                    </div>
                ) : (
                    <div className="apps-list">
                        {apps.map(app => {
                            const statusInfo = getStatusBadge(app.Status);
                            return (
                                <div key={app.ApplicationID} className="app-card" onClick={() => navigate(`/career/${app.JobID}`)}>
                                    <div className="app-left">
                                        <h3>{app.JobTitle || app.Title}</h3>
                                        <p className="app-company">{app.CompanyName || 'Công ty'}</p>
                                        <span className="app-date">
                                            Ứng tuyển: {app.AppliedAt ? new Date(app.AppliedAt).toLocaleDateString('vi-VN') : ''}
                                        </span>
                                    </div>
                                    <div className="app-right">
                                        <span className={`app-status ${statusInfo.cls}`}>{statusInfo.label}</span>
                                        {app.Status === 'Interview' && app.InterviewID && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/career/interview/${app.InterviewID}`); }}
                                                className="btn-interview"
                                            >
                                                🎤 Vào phỏng vấn AI
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;
