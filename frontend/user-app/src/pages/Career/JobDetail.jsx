/*-----------------------------------------------------------------
 * Career/JobDetail.jsx — EduBridge AI Job Detail Page
 * Full job info + skill match + apply flow
 *-----------------------------------------------------------------*/
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CareerAPI } from '../../services/careerApi';
import { APP_CONFIG } from '../../config';
import './Career.css';

const JobDetail = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showApply, setShowApply] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);

    useEffect(() => { fetchJob(); }, [jobId]);

    const fetchJob = async () => {
        setLoading(true);
        try {
            const res = await CareerAPI.getJob(jobId);
            setJob(res.data || res.job || res);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            await CareerAPI.applyJob(jobId, { coverLetter });
            setApplied(true);
            setShowApply(false);
        } catch (err) { alert(err.message); }
        finally { setApplying(false); }
    };

    if (loading) return <div className="career-loading"><div className="loading-spinner"></div><p>Đang tải...</p></div>;
    if (!job) return <div className="career-loading"><p>❌ Không tìm thấy việc làm</p></div>;

    const getFieldIcon = (f) => {
        const cat = APP_CONFIG.fieldCategories.find(c => c.value === f);
        return cat ? cat.icon : '💼';
    };

    return (
        <div className="career-page">
            <div className="job-detail">
                {/* Back Button */}
                <button onClick={() => navigate('/career')} className="back-link">← Quay lại danh sách</button>

                {/* Header */}
                <div className="job-detail-header">
                    <div className="job-detail-logo">
                        {job.LogoUrl ? <img src={job.LogoUrl} alt={job.CompanyName} /> : <span className="logo-placeholder">{getFieldIcon(job.FieldCategory)}</span>}
                    </div>
                    <div className="job-detail-info">
                        <h1>{job.Title}</h1>
                        <p className="company-name">{job.CompanyName || 'Công ty ẩn danh'}</p>
                        <div className="job-detail-badges">
                            {job.FieldCategory && <span className="badge badge-field">{getFieldIcon(job.FieldCategory)} {job.FieldCategory}</span>}
                            {job.JobType && <span className="badge badge-type">{job.JobType}</span>}
                            {job.Location && <span className="badge badge-location">📍 {job.Location}</span>}
                        </div>
                    </div>
                    <div className="job-detail-salary">
                        {job.MinSalary && job.MaxSalary ? (
                            <>
                                <span className="salary-amount">{(job.MinSalary / 1000000).toFixed(0)}-{(job.MaxSalary / 1000000).toFixed(0)}M</span>
                                <span className="salary-currency">{job.SalaryCurrency || 'VND'}/tháng</span>
                            </>
                        ) : job.Salary ? (
                            <span className="salary-amount">{job.Salary}</span>
                        ) : (
                            <span className="salary-negotiate">Thỏa thuận</span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="job-detail-body">
                    <div className="job-detail-main">
                        {/* Description */}
                        <section className="detail-section">
                            <h3>📝 Mô tả công việc</h3>
                            <div className="section-content" dangerouslySetInnerHTML={{ __html: job.Description?.replace(/\n/g, '<br/>') || 'Chưa có mô tả.' }} />
                        </section>

                        {/* Requirements */}
                        {job.Requirements && (
                            <section className="detail-section">
                                <h3>📋 Yêu cầu ứng viên</h3>
                                <div className="section-content" dangerouslySetInnerHTML={{ __html: job.Requirements?.replace(/\n/g, '<br/>') }} />
                            </section>
                        )}

                        {/* Benefits */}
                        {job.Benefits && (
                            <section className="detail-section">
                                <h3>🎁 Quyền lợi</h3>
                                <div className="section-content" dangerouslySetInnerHTML={{ __html: job.Benefits?.replace(/\n/g, '<br/>') }} />
                            </section>
                        )}

                        {/* Skills */}
                        {job.Skills && job.Skills.length > 0 && (
                            <section className="detail-section">
                                <h3>⚡ Kỹ năng yêu cầu</h3>
                                <div className="required-skills">
                                    {job.Skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="job-detail-sidebar">
                        {/* Apply Card */}
                        <div className="apply-card">
                            {applied ? (
                                <div className="applied-success">
                                    <span className="success-icon">✅</span>
                                    <h4>Đã ứng tuyển thành công!</h4>
                                    <p>Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.</p>
                                    <button onClick={() => navigate('/career/my-applications')} className="btn-view-apps">📋 Xem đơn ứng tuyển</button>
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => setShowApply(!showApply)} className="btn-apply-main">
                                        💼 Ứng tuyển ngay
                                    </button>
                                    {showApply && (
                                        <div className="apply-form">
                                            <textarea
                                                value={coverLetter}
                                                onChange={e => setCoverLetter(e.target.value)}
                                                placeholder="Viết thư xin việc ngắn gọn... (không bắt buộc)"
                                                className="apply-textarea"
                                                rows={5}
                                            />
                                            <button onClick={handleApply} disabled={applying} className="btn-submit-apply">
                                                {applying ? '⏳ Đang gửi...' : '📤 Gửi đơn ứng tuyển'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Company Info */}
                        <div className="company-card">
                            <h4>🏢 Thông tin công ty</h4>
                            <p className="company-card-name">{job.CompanyName || 'Chưa cập nhật'}</p>
                            {job.CompanySize && <p className="company-meta">👥 {job.CompanySize} nhân viên</p>}
                            {job.CompanyWebsite && <a href={job.CompanyWebsite} target="_blank" rel="noopener noreferrer" className="company-link">🌐 Website</a>}
                        </div>

                        {/* Quick Links */}
                        <div className="quick-links-card">
                            <button onClick={() => navigate('/portfolio')} className="quick-link">📁 Cập nhật Portfolio</button>
                            <button onClick={() => navigate('/skill-quiz')} className="quick-link">📝 Kiểm tra kỹ năng</button>
                            <button onClick={() => navigate('/ranking')} className="quick-link">🏆 Xem xếp hạng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetail;
