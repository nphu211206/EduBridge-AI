/*-----------------------------------------------------------------
 * File: Career/index.jsx — EduBridge AI Career Page
 * Multi-discipline job listings with field category filter
 *-----------------------------------------------------------------*/
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CareerAPI } from '../../services/careerApi';
import { APP_CONFIG } from '../../config';
import './Career.css';

const Career = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        keyword: '',
        fieldCategory: '',
        jobType: '',
        location: '',
        page: 1,
    });

    useEffect(() => {
        fetchJobs();
    }, [filters.fieldCategory, filters.jobType, filters.page]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.keyword) params.keyword = filters.keyword;
            if (filters.fieldCategory) params.fieldCategory = filters.fieldCategory;
            if (filters.jobType) params.jobType = filters.jobType;
            if (filters.location) params.location = filters.location;
            params.page = filters.page;
            params.limit = 12;

            const res = await CareerAPI.getJobs(params);
            setJobs(res.data || res.jobs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    const getFieldIcon = (field) => {
        const cat = APP_CONFIG.fieldCategories.find(f => f.value === field);
        return cat ? cat.icon : '💼';
    };

    return (
        <div className="career-page">
            {/* Header Section */}
            <div className="career-hero">
                <div className="career-hero-content">
                    <h1 className="career-hero-title">
                        <span className="hero-icon">💼</span>
                        Tuyển dụng đa ngành
                    </h1>
                    <p className="career-hero-subtitle">
                        Kết nối sinh viên mọi ngành với cơ hội việc làm phù hợp — AI đánh giá năng lực, matching thông minh
                    </p>

                    {/* Search Bar */}
                    <form className="career-search-form" onSubmit={handleSearch}>
                        <div className="search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
                                value={filters.keyword}
                                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                                className="career-search-input"
                            />
                        </div>
                        <button type="submit" className="career-search-btn">Tìm kiếm</button>
                    </form>
                </div>
            </div>

            {/* Field Category Filter */}
            <div className="career-filters">
                <div className="field-filter-row">
                    <button
                        className={`field-chip ${!filters.fieldCategory ? 'active' : ''}`}
                        onClick={() => setFilters(prev => ({ ...prev, fieldCategory: '', page: 1 }))}
                    >
                        🌐 Tất cả ngành
                    </button>
                    {APP_CONFIG.fieldCategories.map(cat => (
                        <button
                            key={cat.value}
                            className={`field-chip ${filters.fieldCategory === cat.value ? 'active' : ''}`}
                            onClick={() => setFilters(prev => ({ ...prev, fieldCategory: cat.value, page: 1 }))}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="extra-filters">
                    <select
                        value={filters.jobType}
                        onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value, page: 1 }))}
                        className="filter-select"
                    >
                        <option value="">Tất cả loại hình</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Thực tập</option>
                        <option value="Freelance">Freelance</option>
                    </select>
                    <input
                        type="text"
                        placeholder="📍 Khu vực..."
                        value={filters.location}
                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                        className="filter-input"
                    />
                </div>
            </div>

            {/* Job Grid */}
            <div className="career-content">
                {loading ? (
                    <div className="career-loading">
                        <div className="loading-spinner"></div>
                        <p>Đang tải việc làm...</p>
                    </div>
                ) : error ? (
                    <div className="career-error">
                        <p>❌ {error}</p>
                        <button onClick={fetchJobs} className="retry-btn">Thử lại</button>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="career-empty">
                        <span className="empty-icon">📭</span>
                        <h3>Chưa có việc làm phù hợp</h3>
                        <p>Hãy thử thay đổi bộ lọc hoặc quay lại sau</p>
                    </div>
                ) : (
                    <div className="jobs-grid">
                        {jobs.map(job => (
                            <div
                                key={job.JobID}
                                className="job-card"
                                onClick={() => navigate(`/career/${job.JobID}`)}
                            >
                                <div className="job-card-header">
                                    <div className="job-company-logo">
                                        {job.LogoUrl ? (
                                            <img src={job.LogoUrl} alt={job.CompanyName} />
                                        ) : (
                                            <span className="logo-placeholder">{getFieldIcon(job.FieldCategory)}</span>
                                        )}
                                    </div>
                                    <div className="job-badges">
                                        <span className={`badge badge-field badge-${(job.FieldCategory || 'other').toLowerCase()}`}>
                                            {getFieldIcon(job.FieldCategory)} {job.FieldCategory || 'Khác'}
                                        </span>
                                        {job.JobType && <span className="badge badge-type">{job.JobType}</span>}
                                    </div>
                                </div>

                                <h3 className="job-title">{job.Title}</h3>
                                <p className="job-company">{job.CompanyName || 'Công ty ẩn danh'}</p>

                                <div className="job-meta">
                                    {job.Location && <span className="meta-item">📍 {job.Location}</span>}
                                    {job.Salary && <span className="meta-item">💰 {job.Salary}</span>}
                                    {job.MinSalary && job.MaxSalary && (
                                        <span className="meta-item">
                                            💰 {(job.MinSalary / 1000000).toFixed(0)}-{(job.MaxSalary / 1000000).toFixed(0)}M {job.SalaryCurrency || 'VND'}
                                        </span>
                                    )}
                                </div>

                                <p className="job-description">
                                    {job.Description ? job.Description.substring(0, 120) + '...' : 'Không có mô tả'}
                                </p>

                                <div className="job-skills">
                                    {(job.Skills || []).slice(0, 4).map((skill, i) => (
                                        <span key={i} className="skill-tag">{skill}</span>
                                    ))}
                                    {(job.Skills || []).length > 4 && (
                                        <span className="skill-tag more">+{job.Skills.length - 4}</span>
                                    )}
                                </div>

                                <div className="job-footer">
                                    <span className="job-date">
                                        {job.CreatedAt ? new Date(job.CreatedAt).toLocaleDateString('vi-VN') : ''}
                                    </span>
                                    <button className="apply-btn-small">Xem chi tiết →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Career;
