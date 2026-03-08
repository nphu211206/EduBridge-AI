import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/config';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const TeamBuilder = () => {
    const [tab, setTab] = useState('browse'); // browse | invites | create
    const [projects, setProjects] = useState([]);
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state for creating a new project
    const [form, setForm] = useState({
        title: '',
        description: '',
        fieldCategory: 'Technical',
        maxMembers: 5,
        roles: [{ name: '', requiredSkills: [] }]
    });

    useEffect(() => {
        fetchProjects();
        fetchInvites();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axiosClient.get('/teams/me');
            if (res.data?.data) {
                setProjects(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Không thể tải danh sách dự án');
        }
        finally { setLoading(false); }
    };

    const fetchInvites = async () => {
        try {
            const res = await axiosClient.get('/teams/invites');
            if (res.data?.data) {
                setInvites(res.data.data);
            }
        } catch (err) { console.error(err); }
    };

    const handleCreate = async () => {
        if (!form.title.trim()) return toast.warning('Vui lòng nhập tên dự án');
        if (!form.description.trim()) return toast.warning('Vui lòng nhập mô tả dự án');

        setSubmitting(true);
        try {
            const res = await axiosClient.post('/teams', form);
            if (res.data?.success) {
                toast.success('🎉 Đã tạo dự án thành công! AI đang tìm kiếm thành viên...');
                fetchProjects();
                setTab('browse');
                setForm({ title: '', description: '', fieldCategory: 'Technical', maxMembers: 5, roles: [{ name: '', requiredSkills: [] }] });
            } else {
                toast.error(res.data?.message || 'Lỗi khi tạo dự án');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi kết nối máy chủ');
        } finally {
            setSubmitting(false);
        }
    };

    const respondInvite = async (inviteId, accept) => {
        try {
            const res = await axiosClient.put(`/teams/invite/${inviteId}`, { accept });
            if (res.status === 200 || res.data?.success) {
                toast.success(accept ? 'Đã chấp nhận lời mời tham gia dự án!' : 'Đã từ chối lời mời');
                fetchInvites();
                fetchProjects();
            } else {
                toast.error(res.data?.message || 'Có lỗi xảy ra khi phản hồi lời mời');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Mất kết nối với máy chủ');
        }
    };

    const addRole = () => setForm(f => ({ ...f, roles: [...f.roles, { name: '', requiredSkills: [] }] }));
    const updateRole = (i, key, val) => setForm(f => ({ ...f, roles: f.roles?.map((r, j) => j === i ? { ...r, [key]: val } : r) }));
    const removeRole = (i) => setForm(f => ({ ...f, roles: f.roles?.filter((_, j) => j !== i) }));

    const fields = ['Technical', 'Design', 'Business', 'Science', 'Soft Skill'];
    const fieldIcons = { Technical: '💻', Design: '🎨', Business: '📊', Science: '🔬', 'Soft Skill': '🤝' };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-slate-200">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
            >
                <div className="inline-block p-4 rounded-full bg-blue-500/10 text-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4 pb-2">
                    AI Team Builder
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                    Khởi tạo dự án, định nghĩa các vai trò còn thiếu và để AI tự động ghép nối bạn với những mảnh ghép hoàn hảo nhất.
                </p>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex justify-center mb-10">
                <div className="inline-flex bg-slate-800/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/50 shadow-lg relative">
                    {/* Active Background Pill */}
                    <div
                        className="absolute top-1.5 bottom-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 transition-all duration-300 ease-in-out"
                        style={{
                            width: tab === 'browse' ? '140px' : tab === 'invites' ? '140px' : '150px',
                            transform: `translateX(${tab === 'browse' ? '0' : tab === 'invites' ? '140px' : '280px'})`
                        }}
                    ></div>

                    <button
                        onClick={() => setTab('browse')}
                        className={`relative z-10 w-[140px] py-3 text-sm font-bold rounded-xl transition-colors ${tab === 'browse' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        📁 Dự án của bạn
                    </button>
                    <button
                        onClick={() => { setTab('invites'); fetchInvites(); }}
                        className={`relative z-10 w-[140px] py-3 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${tab === 'invites' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        📨 Lời mời
                        {invites?.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{invites?.length}</span>}
                    </button>
                    <button
                        onClick={() => setTab('create')}
                        className={`relative z-10 w-[150px] py-3 text-sm font-bold rounded-xl transition-colors ${tab === 'create' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        ✨ Tạo dự án mới
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto">
                {/* 1. BROWSE PROJECTS TAB */}
                {tab === 'browse' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3]?.map(i => (
                                    <div key={i} className="animate-pulse bg-slate-800/30 border border-slate-700/50 rounded-[2rem] p-8 h-48"></div>
                                ))}
                            </div>
                        ) : projects?.length === 0 ? (
                            <div className="text-center py-20 bg-slate-800/20 border-2 border-slate-700/50 border-dashed rounded-[2rem]">
                                <span className="text-5xl opacity-50 mb-4 block">📁</span>
                                <h3 className="text-xl font-bold text-white mb-2">Bạn chưa tham gia dự án nào</h3>
                                <p className="text-slate-400 mb-6">Hãy tự tạo dự án của riêng mình để bắt đầu.</p>
                                <button onClick={() => setTab('create')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                                    Tạo dự án ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {projects?.map((p, idx) => {
                                    const progress = p.TotalRoles > 0 ? (p.FilledRoles / p.TotalRoles) * 100 : 0;
                                    const isFull = p.FilledRoles === p.TotalRoles && p.TotalRoles > 0;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                            key={p.ProjectID}
                                            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 hover:border-blue-500/30 rounded-[2rem] p-8 transition-all shadow-lg group relative overflow-hidden"
                                        >
                                            {/* Progress Background */}
                                            <div className="absolute bottom-0 left-0 h-1 bg-slate-700/50 w-full">
                                                <div
                                                    className={`h-full ${isFull ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs font-bold rounded-full border border-slate-600 flex items-center gap-1">
                                                            {fieldIcons[p.FieldCategory] || '📁'} {p.FieldCategory}
                                                        </span>
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${p.Status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                                            p.Status === 'Completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                                                'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                                                            }`}>
                                                            {p.Status || 'Mới'}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{p.Title}</h3>
                                                    <p className="text-slate-400 leading-relaxed text-sm">{p.Description}</p>
                                                </div>

                                                {/* Team Stats */}
                                                <div className="bg-slate-900/50 rounded-2xl p-4 min-w-[140px] text-center shrink-0 border border-slate-700/50">
                                                    <span className="block text-2xl font-black text-white mb-1">
                                                        {p.FilledRoles || 0}<span className="text-slate-500 text-lg">/{p.TotalRoles || 0}</span>
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-400 uppercase">Thành viên</span>
                                                </div>
                                            </div>

                                            {p.Deadline && (
                                                <div className="text-sm text-slate-500 font-medium flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Deadline: {new Date(p.Deadline).toLocaleDateString('vi-VN')}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 2. INVITES TAB */}
                {tab === 'invites' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {invites?.length === 0 ? (
                            <div className="text-center py-20 bg-slate-800/20 border-2 border-slate-700/50 border-dashed rounded-[2rem]">
                                <span className="text-5xl opacity-50 mb-4 block">📨</span>
                                <h3 className="text-xl font-bold text-white mb-2">Không có lời mời nào</h3>
                                <p className="text-slate-400 mb-6">Cập nhật đầy đủ Skill DNA để AI gợi ý bạn cho các dự án tiềm năng nhé.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {invites?.map((inv, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                                        key={inv.InviteID}
                                        className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-indigo-500/30 rounded-[2rem] p-6 shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none"></div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-lg text-white">
                                                {inv.InviterName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-300">{inv.InviterName}</p>
                                                <p className="text-xs text-slate-500">Mời bạn tham gia</p>
                                            </div>
                                        </div>

                                        <h4 className="text-xl font-bold text-white mb-4 line-clamp-2">{inv.ProjectTitle}</h4>

                                        <div className="bg-slate-900/60 rounded-xl p-4 mb-6 border border-slate-700/50">
                                            <p className="text-sm font-bold text-indigo-400 mb-1">Vai trò của bạn:</p>
                                            <p className="text-white font-medium">{inv.RoleName}</p>
                                            {inv.Message && (
                                                <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                    <p className="text-xs text-slate-400 italic">" {inv.Message} "</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 mt-auto">
                                            <button
                                                onClick={() => respondInvite(inv.InviteID, true)}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20"
                                            >
                                                Chấp nhận
                                            </button>
                                            <button
                                                onClick={() => respondInvite(inv.InviteID, false)}
                                                className="flex-1 bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 py-3 rounded-xl font-bold text-sm transition-colors"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 3. CREATE PROJECT TAB */}
                {tab === 'create' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 border border-slate-700/60 shadow-2xl">

                            <div className="mb-8 border-b border-slate-700/50 pb-8">
                                <h3 className="text-xl font-bold text-white mb-4">Thông tin cơ bản</h3>
                                <div className="space-y-5">
                                    <div>
                                        <input
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            placeholder="Tên dự án sáng tạo của bạn..."
                                            className="w-full bg-slate-900/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-5 py-4 text-white text-lg font-medium placeholder-slate-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            value={form.description}
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="Mô tả dự án làm gì, mục tiêu giải quyết vấn đề gì..."
                                            className="w-full bg-slate-900/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-5 py-4 text-white placeholder-slate-500 outline-none transition-all min-h-[120px]"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-400 mb-3 uppercase">Lĩnh vực chính (Lựa chọn hệ AI)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {fields?.map(f => (
                                                <button
                                                    key={f}
                                                    className={`px-4 py-2.5 rounded-xl border text-sm transition-all font-medium flex items-center gap-2 ${form.fieldCategory === f
                                                        ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                                                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                                                        }`}
                                                    onClick={() => setForm(prev => ({ ...prev, fieldCategory: f }))}
                                                >
                                                    {fieldIcons[f]} {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">Xây dựng Đội hình (Roles)</h3>
                                    <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full font-bold">Tối đa {form.maxMembers}</span>
                                </div>
                                <p className="text-sm text-slate-400 mb-6">AI sẽ dựa vào Skills yêu cầu để tự động quét toàn nền tảng và Match với những người phù hợp nhất.</p>

                                <div className="space-y-4 mb-6">
                                    <AnimatePresence>
                                        {form.roles?.map((role, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                key={i}
                                                className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center relative group overflow-hidden"
                                            >
                                                <div className="md:w-1/3 w-full">
                                                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Tên vai trò</label>
                                                    <input
                                                        value={role.name}
                                                        onChange={e => updateRole(i, 'name', e.target.value)}
                                                        placeholder="VD: UI/UX Designer"
                                                        className="w-full bg-transparent border-b border-slate-600 focus:border-blue-500 py-2 text-white outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="flex-1 w-full">
                                                    <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Kỹ năng bắt buộc</label>
                                                    <input
                                                        value={(role.requiredSkills || []).join(', ')}
                                                        onChange={e => updateRole(i, 'requiredSkills', e.target.value.split(',')?.map(s => s.trimStart()))}
                                                        placeholder="Figma, React, Node.js..."
                                                        className="w-full bg-transparent border-b border-slate-600 focus:border-blue-500 py-2 text-white outline-none transition-colors"
                                                    />
                                                </div>

                                                {form.roles?.length > 1 && (
                                                    <button
                                                        onClick={() => removeRole(i)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Xóa vai trò này"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {form.roles?.length < 10 && (
                                    <button
                                        onClick={addRole}
                                        className="w-full py-4 border-2 border-dashed border-slate-600 hover:border-blue-500 text-slate-400 hover:text-blue-400 bg-slate-900/30 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Thêm vị trí mới
                                    </button>
                                )}
                            </div>

                            <div className="mt-10">
                                <button
                                    onClick={handleCreate}
                                    disabled={submitting}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <><svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Đang tải lên và quét AI...</>
                                    ) : '🚀 XÁC NHẬN TẠO DỰ ÁN & TÌM TEAM'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default TeamBuilder;
