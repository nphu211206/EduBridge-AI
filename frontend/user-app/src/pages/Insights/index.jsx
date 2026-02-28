import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Insights = () => {
    const [trending, setTrending] = useState([]);
    const [gap, setGap] = useState([]);
    const [fields, setFields] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            const [tRes, gRes, fRes, sRes] = await Promise.all([
                axiosClient.get('/insights/trending-skills'),
                axiosClient.get('/insights/skill-gap'),
                axiosClient.get('/insights/field-stats'),
                axiosClient.get('/insights/platform-summary'),
            ]);

            setTrending(tRes.data?.data || []);
            setGap(gRes.data?.data || []);
            setFields(fRes.data?.data || []);
            setSummary(sRes.data?.data || null);

        } catch (err) {
            console.error('Insights fetch error:', err);
            toast.error(err.response?.data?.message || 'Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const fieldIcons = { Technical: '💻', Design: '🎨', Business: '📊', Science: '🔬', 'Soft Skill': '🤝' };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-slate-200">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <div className="inline-block p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 pb-2">
                    Industry Insights
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                    Phân tích xu hướng ngành nghề, kỹ năng nổi bật và điểm mù năng lực dựa trên dữ liệu toàn nền tảng.
                </p>
            </motion.div>

            {loading ? (
                // Skeleton Screen
                <div className="space-y-8">
                    {/* Summary Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-2xl h-28"></div>)}
                    </div>
                    {/* Main Content Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-[2rem] h-[400px]"></div>
                            <div className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-[2rem] h-[300px]"></div>
                        </div>
                        <div className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-[2rem] h-[500px]"></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* 1. Platform Summary */}
                    {summary ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                        >
                            {[
                                { icon: '👥', value: summary.totalUsers, label: 'Người dùng', color: 'text-blue-400' },
                                { icon: '⚡', value: summary.activeSkills, label: 'Kỹ năng active', color: 'text-amber-400' },
                                { icon: '📝', value: summary.totalQuizzes, label: 'Bài thi', color: 'text-emerald-400' },
                                { icon: '✅', value: `${summary.quizPassRate}%`, label: 'Tỷ lệ pass', color: 'text-emerald-500' },
                                { icon: '📁', value: summary.totalPortfolios, label: 'Portfolios', color: 'text-indigo-400' },
                                { icon: '🏆', value: summary.avgPortfolioScore, label: 'Điểm TB CV', color: 'text-purple-400' },
                            ].map((s, i) => (
                                <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-4 text-center hover:bg-slate-800 transition-colors shadow-lg">
                                    <div className="text-2xl mb-2 drop-shadow-md">{s.icon}</div>
                                    <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value || 0}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="text-center p-6 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed text-slate-500">Chưa có dữ liệu tổng quan nền tảng</div>
                    )}

                    {/* Main Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN (Trending & Performance) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Trending Skills Container */}
                            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md rounded-[2rem] p-8 border border-slate-700/60 shadow-xl">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="text-3xl">🔥</span> Top Skills Đang Hot
                                </h3>

                                {trending?.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-700/50 border-dashed">
                                        Chuẩn bị cập nhật xu hướng mới nhất...
                                    </div>
                                ) : (
                                    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                                        {trending.map((s, i) => (
                                            <motion.div variants={itemVariants} key={s.SkillID || i} className="bg-slate-800/60 hover:bg-slate-700/80 transition-colors rounded-2xl p-5 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner
                                                        ${i === 0 ? 'bg-amber-500 text-amber-900' : i === 1 ? 'bg-slate-400 text-slate-900' : i === 2 ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                                        #{i + 1}
                                                    </div>
                                                    <div className="text-3xl bg-slate-900 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                                        {s.Icon || fieldIcons[s.Category] || '🎯'}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{s.Name}</h4>
                                                        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg uppercase tracking-wider">{s.Category}</span>
                                                    </div>
                                                </div>

                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center px-4 sm:px-0 py-3 sm:py-0 bg-slate-900/50 sm:bg-transparent rounded-xl border border-slate-700/50 sm:border-none">
                                                    <div className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
                                                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                        {s.UserCount || 0} Learners
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-medium">Bản đồ điểm TB: <span className="text-blue-400 font-bold ml-1">{Math.round(s.AvgScore || 0)}/100</span></div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            {/* Field Performance Container */}
                            <div className="bg-slate-800/40 backdrop-blur-md rounded-[2rem] p-8 border border-slate-700/60 shadow-xl">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <span className="text-3xl">📊</span> Hiệu suất theo Lĩnh vực
                                </h3>

                                {fields?.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-700/50 border-dashed">
                                        Đang tổng hợp dữ liệu lĩnh vực...
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {fields.map((f, i) => {
                                            const passRate = f.TotalQuizzes > 0 ? Math.round(((f.PassedQuizzes || 0) / f.TotalQuizzes) * 100) : 0;
                                            return (
                                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} key={f.Field || i} className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 hover:border-indigo-500/50 transition-colors">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="text-3xl bg-slate-900 p-2 rounded-xl">{fieldIcons[f.Field] || '📌'}</span>
                                                        <h4 className="font-bold text-white leading-tight">{f.Field}</h4>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-400">Người học:</span>
                                                            <span className="font-bold text-white">{f.ActiveUsers || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-400">Bài thi:</span>
                                                            <span className="font-bold text-white">{f.TotalQuizzes || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-slate-400">Tỷ lệ qua:</span>
                                                            <span className={`font-bold ${passRate > 70 ? 'text-emerald-400' : passRate > 40 ? 'text-amber-400' : 'text-red-400'}`}>{passRate}%</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* RIGHT COLUMN (Skill Gap Analysis) */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#1e293b] backdrop-blur-md rounded-[2rem] p-8 border border-rose-500/20 shadow-xl h-full sticky top-4">
                                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                                    <span className="text-3xl">🎯</span> Skill Gap Analysis
                                </h3>
                                <p className="text-sm text-slate-400 mb-8 pb-4 border-b border-slate-700/50">
                                    Phân tích những lĩnh vực đang thiếu vắng nhân lực giỏi nhất hệ thống. Đây chính là đại dương xanh cho bạn!
                                </p>

                                {gap?.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-700/50 border-dashed">
                                        Thị trường hiện đang bão hòa
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {gap.map((g, i) => {
                                            const maxPool = Math.max(...gap.map(x => x.TalentPool || 1), 1);
                                            const percentage = Math.min(100, (g.TalentPool / maxPool) * 100);
                                            // Ít người học -> Cơ hội cao (Màu đỏ/cam cảnh báo thiếu người)
                                            const colorClass = percentage < 30 ? 'bg-rose-500' : percentage < 70 ? 'bg-amber-500' : 'bg-emerald-500';

                                            return (
                                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={g.Category || i} className="group">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{fieldIcons[g.Category] || '📌'}</span>
                                                            <span className="font-bold text-white">{g.Category}</span>
                                                        </div>
                                                        <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-1 rounded hidden lg:block">Pool: {g.TalentPool || 0}</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 relative">
                                                        <motion.div
                                                            initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, ease: "easeOut" }}
                                                            className={`absolute top-0 left-0 h-full rounded-full ${colorClass}`}
                                                        />
                                                    </div>
                                                    <div className="mt-2 text-[11px] text-slate-500 text-right">
                                                        {percentage < 30 ? '🔥 Cơ hội vàng (Thiếu nhân lực)' : percentage < 70 ? 'Khá cạnh tranh' : 'Cạnh tranh rất cao'}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        <div className="mt-8 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 text-sm text-rose-200">
                                            <svg className="w-5 h-5 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p>Biểu đồ càng ngắn biểu thị nguồn cung nhân sự càng khan hiếm. Hãy chọn học các kỹ năng thuộc nhóm này để tăng lợi thế cạnh tranh.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Insights;
