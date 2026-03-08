/*-----------------------------------------------------------------
 * File: Portfolio/index.jsx — EduBridge AI Multi-Discipline Portfolio
 * View and manage portfolio with items, skills, external profiles
 *-----------------------------------------------------------------*/
import React, { useState, useEffect, useCallback } from 'react';
import { PortfolioAPI } from '../../services/careerApi';
import { APP_CONFIG } from '../../config';
import './Portfolio.css';

const Portfolio = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('items');
    const [showAddItem, setShowAddItem] = useState(false);
    const [showConnectPlatform, setShowConnectPlatform] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [evaluating, setEvaluating] = useState(false);

    // Edit portfolio header state
    const [editData, setEditData] = useState({ headline: '', bio: '', fieldCategory: '', isPublic: true });

    // Add item form state
    const [newItem, setNewItem] = useState({ title: '', description: '', itemType: 'code_project', externalUrl: '', tags: '' });
    const [itemFile, setItemFile] = useState(null);
    const [addingItem, setAddingItem] = useState(false);

    // Connect platform state
    const [platforms, setPlatforms] = useState([]);
    const [connectForm, setConnectForm] = useState({ platform: '', profileUrl: '' });
    const [connecting, setConnecting] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        setLoading(true);
        try {
            const res = await PortfolioAPI.getMyPortfolio();
            setData(res.data);
            setEditData({
                headline: res.data.portfolio?.Headline || '',
                bio: res.data.portfolio?.Bio || '',
                fieldCategory: res.data.portfolio?.FieldCategory || '',
                isPublic: res.data.portfolio?.IsPublic !== false,
            });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

    const fetchPlatforms = async () => {
        try {
            const res = await PortfolioAPI.getPlatforms();
            setPlatforms(res.data || []);
        } catch (err) { console.error(err); }
    };

    // ---- HANDLERS ----
    const handleSaveProfile = async () => {
        try {
            await PortfolioAPI.updatePortfolio(editData);
            setEditMode(false);
            fetchPortfolio();
        } catch (err) { alert(err.message); }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.title || !newItem.itemType) return alert('Tiêu đề và loại tác phẩm bắt buộc!');
        setAddingItem(true);
        try {
            const formData = new FormData();
            formData.append('title', newItem.title);
            formData.append('description', newItem.description);
            formData.append('itemType', newItem.itemType);
            formData.append('externalUrl', newItem.externalUrl);
            formData.append('tags', JSON.stringify(newItem.tags.split(',')?.map(t => t.trim())?.filter(Boolean)));
            if (itemFile) formData.append('file', itemFile);

            await PortfolioAPI.addItem(formData);
            setShowAddItem(false);
            setNewItem({ title: '', description: '', itemType: 'code_project', externalUrl: '', tags: '' });
            setItemFile(null);
            fetchPortfolio();
        } catch (err) { alert(err.message); }
        finally { setAddingItem(false); }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Xóa tác phẩm này?')) return;
        try { await PortfolioAPI.deleteItem(itemId); fetchPortfolio(); }
        catch (err) { alert(err.message); }
    };

    const handleReEvaluate = async (itemId) => {
        try {
            await PortfolioAPI.reEvaluateItem(itemId);
            alert('Đang đánh giá lại... Kiểm tra sau vài giây.');
            setTimeout(fetchPortfolio, 3000);
        } catch (err) { alert(err.message); }
    };

    const handleConnectPlatform = async () => {
        if (!connectForm.platform || !connectForm.profileUrl) return alert('Chọn nền tảng và nhập URL!');
        setConnecting(true);
        try {
            await PortfolioAPI.connectPlatform(connectForm.platform, connectForm.profileUrl);
            setShowConnectPlatform(false);
            setConnectForm({ platform: '', profileUrl: '' });
            fetchPortfolio();
        } catch (err) { alert(err.message); }
        finally { setConnecting(false); }
    };

    const handleDisconnectPlatform = async (platform) => {
        if (!window.confirm(`Ngắt kết nối ${platform}?`)) return;
        try { await PortfolioAPI.disconnectPlatform(platform); fetchPortfolio(); }
        catch (err) { alert(err.message); }
    };

    const handleEvaluateAll = async () => {
        setEvaluating(true);
        try {
            const res = await PortfolioAPI.evaluatePortfolio();
            alert(`Điểm tổng: ${res.data?.overallScore || 'N/A'}/100`);
            fetchPortfolio();
        } catch (err) { alert(err.message); }
        finally { setEvaluating(false); }
    };

    // ---- RENDER ----
    if (loading) return <div className="portfolio-loading"><div className="loading-spinner"></div><p>Đang tải portfolio...</p></div>;

    const { user, portfolio, items, skills, externalProfiles } = data || {};
    const aiSummary = portfolio?.AiSummary ? JSON.parse(portfolio.AiSummary) : null;

    return (
        <div className="portfolio-page">
            {/* Header */}
            <div className="portfolio-header">
                <div className="portfolio-header-content">
                    <div className="portfolio-avatar">
                        {user?.Image ? <img src={user.Image} alt={user.FullName} /> : <span className="avatar-placeholder">👤</span>}
                    </div>
                    <div className="portfolio-info">
                        {editMode ? (
                            <div className="edit-form">
                                <input value={editData.headline} onChange={e => setEditData(p => ({ ...p, headline: e.target.value }))} placeholder="Headline (VD: UI Designer | 3 năm KN)" className="edit-input" />
                                <textarea value={editData.bio} onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))} placeholder="Giới thiệu bản thân..." className="edit-textarea" rows={3} />
                                <select value={editData.fieldCategory} onChange={e => setEditData(p => ({ ...p, fieldCategory: e.target.value }))} className="edit-select">
                                    <option value="">Chọn lĩnh vực...</option>
                                    {APP_CONFIG.fieldCategories?.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                                <div className="edit-actions">
                                    <button onClick={handleSaveProfile} className="btn-save">Lưu</button>
                                    <button onClick={() => setEditMode(false)} className="btn-cancel">Hủy</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h1 className="portfolio-name">{user?.FullName || 'Người dùng'}</h1>
                                <p className="portfolio-headline">{portfolio?.Headline || 'Chưa có headline'}</p>
                                {portfolio?.FieldCategory && (
                                    <span className="portfolio-field-badge">
                                        {APP_CONFIG.fieldCategories.find(c => c.value === portfolio.FieldCategory)?.label || portfolio.FieldCategory}
                                    </span>
                                )}
                                <p className="portfolio-bio">{portfolio?.Bio || ''}</p>
                                <button onClick={() => setEditMode(true)} className="btn-edit-profile">✏️ Chỉnh sửa</button>
                            </>
                        )}
                    </div>
                    <div className="portfolio-score-card">
                        <div className="score-circle">
                            <span className="score-value">{portfolio?.OverallScore || '—'}</span>
                            <span className="score-label">/100</span>
                        </div>
                        <p className="score-text">Điểm tổng AI</p>
                        <button onClick={handleEvaluateAll} disabled={evaluating} className="btn-evaluate">
                            {evaluating ? '⏳ Đang đánh giá...' : '🤖 AI Đánh giá tổng'}
                        </button>
                    </div>
                </div>

                {/* AI Summary */}
                {aiSummary && (
                    <div className="ai-summary-card">
                        <h4>🤖 Nhận xét AI</h4>
                        <p>{aiSummary.summary}</p>
                        {aiSummary.careerSuggestions && (
                            <div className="career-suggestions">
                                <strong>💡 Gợi ý nghề nghiệp:</strong>
                                {aiSummary.careerSuggestions?.map((s, i) => <span key={i} className="suggestion-tag">{s}</span>)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="portfolio-tabs">
                <button className={`tab ${tab === 'items' ? 'active' : ''}`} onClick={() => setTab('items')}>
                    📁 Tác phẩm ({items?.length || 0})
                </button>
                <button className={`tab ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}>
                    ⚡ Kỹ năng ({skills?.length || 0})
                </button>
                <button className={`tab ${tab === 'external' ? 'active' : ''}`} onClick={() => { setTab('external'); fetchPlatforms(); }}>
                    🔗 Liên kết ({externalProfiles?.length || 0})
                </button>
            </div>

            {/* Tab Content */}
            <div className="portfolio-content">
                {/* Items Tab */}
                {tab === 'items' && (
                    <div className="items-tab">
                        <div className="tab-actions">
                            <button onClick={() => setShowAddItem(true)} className="btn-add">+ Thêm tác phẩm</button>
                        </div>

                        {showAddItem && (
                            <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
                                <div className="modal" onClick={e => e.stopPropagation()}>
                                    <h3>➕ Thêm tác phẩm mới</h3>
                                    <form onSubmit={handleAddItem}>
                                        <input value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} placeholder="Tiêu đề *" className="modal-input" required />
                                        <textarea value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} placeholder="Mô tả..." className="modal-input" rows={3} />
                                        <select value={newItem.itemType} onChange={e => setNewItem(p => ({ ...p, itemType: e.target.value }))} className="modal-input">
                                            {APP_CONFIG.portfolioItemTypes?.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                        <input value={newItem.externalUrl} onChange={e => setNewItem(p => ({ ...p, externalUrl: e.target.value }))} placeholder="URL (GitHub, Behance, link khác...)" className="modal-input" />
                                        <input value={newItem.tags} onChange={e => setNewItem(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (phân cách bằng dấu phẩy)" className="modal-input" />
                                        <input type="file" onChange={e => setItemFile(e.target.files[0])} className="modal-input" />
                                        <div className="modal-actions">
                                            <button type="submit" disabled={addingItem} className="btn-save">{addingItem ? '⏳ Đang thêm...' : 'Thêm & AI Đánh giá'}</button>
                                            <button type="button" onClick={() => setShowAddItem(false)} className="btn-cancel">Hủy</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {(!items || items?.length === 0) ? (
                            <div className="empty-state">
                                <span className="empty-icon-large">📁</span>
                                <h3>Chưa có tác phẩm nào</h3>
                                <p>Thêm tác phẩm, dự án hoặc sản phẩm của bạn để AI đánh giá kỹ năng</p>
                            </div>
                        ) : (
                            <div className="items-grid">
                                {items?.map(item => {
                                    const evaluation = item.AiEvaluation ? JSON.parse(item.AiEvaluation) : null;
                                    const typeConfig = APP_CONFIG.portfolioItemTypes.find(t => t.value === item.ItemType);
                                    return (
                                        <div key={item.ItemID} className="item-card">
                                            {item.ThumbnailUrl && <div className="item-thumbnail"><img src={item.ThumbnailUrl} alt={item.Title} /></div>}
                                            <div className="item-body">
                                                <div className="item-header">
                                                    <span className="item-type-badge">{typeConfig?.label || item.ItemType}</span>
                                                    {item.AiScore != null && (
                                                        <span className={`item-score score-${item.AiScore >= 70 ? 'high' : item.AiScore >= 40 ? 'mid' : 'low'}`}>
                                                            {item.AiScore}/100
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="item-title">{item.Title}</h4>
                                                <p className="item-desc">{item.Description}</p>
                                                {evaluation?.evaluation && <p className="item-ai-eval">🤖 {typeof evaluation.evaluation === 'string' ? evaluation.evaluation : ''}</p>}
                                                {item.ExternalUrl && <a href={item.ExternalUrl} target="_blank" rel="noopener noreferrer" className="item-link">🔗 Xem liên kết</a>}
                                                {item.Tags && (
                                                    <div className="item-tags">
                                                        {JSON.parse(item.Tags || '[]')?.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
                                                    </div>
                                                )}
                                                <div className="item-actions">
                                                    <button onClick={() => handleReEvaluate(item.ItemID)} className="btn-sm">🤖 Đánh giá lại</button>
                                                    <button onClick={() => handleDeleteItem(item.ItemID)} className="btn-sm btn-danger">🗑️ Xóa</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Skills Tab */}
                {tab === 'skills' && (
                    <div className="skills-tab">
                        {(!skills || skills?.length === 0) ? (
                            <div className="empty-state">
                                <span className="empty-icon-large">⚡</span>
                                <h3>Chưa có kỹ năng</h3>
                                <p>Thêm tác phẩm hoặc kết nối nền tảng — AI sẽ tự phát hiện kỹ năng của bạn</p>
                            </div>
                        ) : (
                            <div className="skills-grid">
                                {skills?.map(skill => (
                                    <div key={skill.UserSkillID} className="skill-card">
                                        <div className="skill-icon">{skill.Icon || '📌'}</div>
                                        <div className="skill-info">
                                            <h4 className="skill-name">{skill.Name}</h4>
                                            <span className="skill-category">{skill.Category}</span>
                                        </div>
                                        <div className="skill-score-bar">
                                            <div className="skill-bar-fill" style={{ width: `${skill.Score}%` }}></div>
                                        </div>
                                        <span className="skill-score-text">{skill.Score}/100</span>
                                        <span className="skill-source">{skill.Source === 'AI_Portfolio' ? '🤖 AI' : '✋ Thủ công'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* External Profiles Tab */}
                {tab === 'external' && (
                    <div className="external-tab">
                        <div className="tab-actions">
                            <button onClick={() => { setShowConnectPlatform(true); fetchPlatforms(); }} className="btn-add">+ Kết nối nền tảng</button>
                        </div>

                        {showConnectPlatform && (
                            <div className="modal-overlay" onClick={() => setShowConnectPlatform(false)}>
                                <div className="modal" onClick={e => e.stopPropagation()}>
                                    <h3>🔗 Kết nối nền tảng bên ngoài</h3>
                                    <select value={connectForm.platform} onChange={e => setConnectForm(p => ({ ...p, platform: e.target.value }))} className="modal-input">
                                        <option value="">Chọn nền tảng...</option>
                                        {platforms?.map(p => <option key={p.name} value={p.name}>{p.icon} {p.name} — {p.description}</option>)}
                                    </select>
                                    <input value={connectForm.profileUrl} onChange={e => setConnectForm(p => ({ ...p, profileUrl: e.target.value }))} placeholder="URL profile (VD: https://github.com/username)" className="modal-input" />
                                    <div className="modal-actions">
                                        <button onClick={handleConnectPlatform} disabled={connecting} className="btn-save">{connecting ? '⏳ Đang kết nối...' : '🔗 Kết nối & AI Đánh giá'}</button>
                                        <button onClick={() => setShowConnectPlatform(false)} className="btn-cancel">Hủy</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(!externalProfiles || externalProfiles?.length === 0) ? (
                            <div className="empty-state">
                                <span className="empty-icon-large">🔗</span>
                                <h3>Chưa kết nối nền tảng nào</h3>
                                <p>Kết nối GitHub, Behance, Dribbble, LinkedIn... để AI đánh giá profile của bạn</p>
                            </div>
                        ) : (
                            <div className="external-grid">
                                {externalProfiles?.map(ep => (
                                    <div key={ep.ProfileID} className="external-card">
                                        <div className="external-header">
                                            <span className="platform-icon">{getPlatformIcon(ep.Platform)}</span>
                                            <h4>{ep.Platform}</h4>
                                            {ep.AiScore != null && <span className="external-score">{ep.AiScore}/100</span>}
                                        </div>
                                        <p className="external-username">@{ep.Username}</p>
                                        <a href={ep.ProfileUrl} target="_blank" rel="noopener noreferrer" className="external-link">🔗 Xem profile</a>
                                        {ep.AiEvaluation && (() => {
                                            const eval_ = JSON.parse(ep.AiEvaluation);
                                            return <p className="external-eval">🤖 {eval_.evaluation || ''}</p>;
                                        })()}
                                        <div className="external-actions">
                                            <button onClick={() => handleDisconnectPlatform(ep.Platform)} className="btn-sm btn-danger">Ngắt kết nối</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const getPlatformIcon = (platform) => {
    const icons = { GitHub: '💻', Behance: '🎨', Dribbble: '🏀', LinkedIn: '💼', Kaggle: '📊', DeviantArt: '🖌️', ArtStation: '🎭', Medium: '📝' };
    return icons[platform] || '🔗';
};

export default Portfolio;
