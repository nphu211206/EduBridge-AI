import React, { useState, useEffect } from 'react';
import { PORTFOLIO_API_URL } from '../../config';
import './TeamBuilder.css';

const TeamBuilder = () => {
    const token = localStorage.getItem('token');
    const [tab, setTab] = useState('browse'); // browse | create | invites
    const [projects, setProjects] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', fieldCategory: '', maxMembers: 5, roles: [{ name: '', requiredSkills: [] }] });

    useEffect(() => { fetchProjects(); fetchInvites(); }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/teams/me`, { headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            setProjects(d.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchInvites = async () => {
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/teams/invites`, { headers: { Authorization: `Bearer ${token}` } });
            const d = await res.json();
            setInvites(d.data || []);
        } catch (err) { console.error(err); }
    };

    const handleCreate = async () => {
        try {
            const res = await fetch(`${PORTFOLIO_API_URL}/api/teams`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const d = await res.json();
            if (d.success) { fetchProjects(); setShowCreate(false); setForm({ title: '', description: '', fieldCategory: '', maxMembers: 5, roles: [{ name: '', requiredSkills: [] }] }); }
        } catch (err) { alert(err.message); }
    };

    const respondInvite = async (inviteId, accept) => {
        try {
            await fetch(`${PORTFOLIO_API_URL}/api/teams/invite/${inviteId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ accept }),
            });
            fetchInvites(); fetchProjects();
        } catch (err) { console.error(err); }
    };

    const addRole = () => setForm(f => ({ ...f, roles: [...f.roles, { name: '', requiredSkills: [] }] }));
    const updateRole = (i, key, val) => setForm(f => ({ ...f, roles: f.roles.map((r, j) => j === i ? { ...r, [key]: val } : r) }));

    const fields = ['Technical', 'Design', 'Business', 'Science', 'Soft Skill'];

    return (
        <div className="tb-page">
            <div className="tb-hero">
                <h1>👥 AI Team Builder</h1>
                <p>Tạo dự án → Định nghĩa role → AI tìm thành viên phù hợp nhất</p>
            </div>

            <div className="tb-tabs">
                <button className={`qtab ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>📁 Dự án ({projects.length})</button>
                <button className={`qtab ${tab === 'invites' ? 'active' : ''}`} onClick={() => { setTab('invites'); fetchInvites(); }}>📨 Lời mời ({invites.length})</button>
                <button onClick={() => setShowCreate(!showCreate)} className="btn-create-project">+ Tạo dự án</button>
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="tb-create">
                    <h3>🚀 Tạo dự án mới</h3>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Tên dự án" className="tb-input" />
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả dự án" className="tb-textarea" rows={3} />
                    <div className="lp-field-chips">
                        {fields.map(f => <button key={f} className={`field-chip ${form.fieldCategory === f ? 'active' : ''}`} onClick={() => setForm(prev => ({ ...prev, fieldCategory: f }))}>{f}</button>)}
                    </div>
                    <h4>Vai trò cần tuyển:</h4>
                    {form.roles.map((role, i) => (
                        <div key={i} className="role-input-row">
                            <input value={role.name} onChange={e => updateRole(i, 'name', e.target.value)} placeholder={`VD: Frontend Developer, UI Designer...`} className="tb-input role-name" />
                            <input value={(role.requiredSkills || []).join(', ')} onChange={e => updateRole(i, 'requiredSkills', e.target.value.split(',').map(s => s.trim()))} placeholder="Skills cần (phân cách bởi dấu phẩy)" className="tb-input role-skills" />
                        </div>
                    ))}
                    <button onClick={addRole} className="btn-add-role">+ Thêm vai trò</button>
                    <button onClick={handleCreate} className="btn-generate-path" style={{ marginTop: 16 }}>✅ Tạo dự án</button>
                </div>
            )}

            {/* Projects */}
            {tab === 'browse' && (
                <div className="tb-content">
                    {loading ? <div className="lp-loading"><div className="loading-spinner"></div></div>
                        : projects.length === 0 ? <div className="lp-empty"><span>📁</span><h3>Chưa có dự án</h3></div>
                            : projects.map(p => (
                                <div key={p.ProjectID} className="project-card">
                                    <div className="project-header">
                                        <h3>{p.Title}</h3>
                                        <span className={`project-status status-${(p.Status || '').toLowerCase()}`}>{p.Status}</span>
                                    </div>
                                    <p className="project-desc">{p.Description}</p>
                                    <div className="project-meta">
                                        <span>{p.FieldCategory}</span>
                                        <span>👥 {p.FilledRoles || 0}/{p.TotalRoles || 0} thành viên</span>
                                        <span>{p.Deadline ? `⏰ ${new Date(p.Deadline).toLocaleDateString('vi-VN')}` : ''}</span>
                                    </div>
                                    <div className="project-progress-bar">
                                        <div className="project-progress-fill" style={{ width: `${p.TotalRoles > 0 ? (p.FilledRoles / p.TotalRoles) * 100 : 0}%` }} />
                                    </div>
                                </div>
                            ))}
                </div>
            )}

            {/* Invites */}
            {tab === 'invites' && (
                <div className="tb-content">
                    {invites.length === 0 ? <div className="lp-empty"><span>📨</span><h3>Không có lời mời</h3></div>
                        : invites.map(inv => (
                            <div key={inv.InviteID} className="invite-card">
                                <div>
                                    <h4>{inv.ProjectTitle}</h4>
                                    <p className="invite-role">Vai trò: {inv.RoleName}</p>
                                    <p className="invite-by">Từ: {inv.InviterName}</p>
                                    {inv.Message && <p className="invite-msg">💬 {inv.Message}</p>}
                                </div>
                                <div className="invite-actions">
                                    <button onClick={() => respondInvite(inv.InviteID, true)} className="btn-accept">✅ Chấp nhận</button>
                                    <button onClick={() => respondInvite(inv.InviteID, false)} className="btn-decline">❌ Từ chối</button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default TeamBuilder;
