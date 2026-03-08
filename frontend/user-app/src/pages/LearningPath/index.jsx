import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/config';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const LearningPath = () => {
    const navigate = useNavigate();
    const [paths, setPaths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [careerGoal, setCareerGoal] = useState('');
    const [field, setField] = useState('');
    const [generating, setGenerating] = useState(false);
    const [expandedPath, setExpandedPath] = useState(null);

    useEffect(() => { fetchPaths(); }, []);

    const fetchPaths = async () => {
        try {
            const res = await axiosClient.get('/learning-path/me');
            setPaths(res.data?.data || []);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Không thể tải lộ trình học');
        }
        finally { setLoading(false); }
    };

    const handleGenerate = async () => {
        if (!careerGoal.trim()) {
            toast.warning('Vui lòng nhập mục tiêu nghề nghiệp');
            return;
        }
        setGenerating(true);
        try {
            const res = await axiosClient.post('/learning-path/generate', { careerGoal, fieldCategory: field });
            if (res.data?.success) {
                fetchPaths();
                setShowCreate(false);
                setCareerGoal('');
                toast.success('Đã tạo lộ trình thành công!');
            }
            else toast.error(res.data?.message || 'Lỗi khi tạo lộ trình');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
        finally { setGenerating(false); }
    };

    const completeMilestone = async (milestoneId) => {
        try {
            const res = await axiosClient.put(`/learning-path/milestone/${milestoneId}/complete`);
            if (res.status === 200 || res.data?.success) {
                toast.success('Chúc mừng! Bạn đã hoàn thành cột mốc 🎉');
                fetchPaths();
            } else {
                toast.error('Lỗi khi cập nhật tiến độ');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật tiến độ');
        }
    };

    const fields = ['Technical', 'Design', 'Business', 'Science', 'Soft Skill'];
    const typeIcons = { course: '📚', project: '🛠️', quiz: '📝', certificate: '🏅', reading: '📖' };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-slate-200">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-10 text-center"
            >
                <div className="inline-block p-4 rounded-full bg-blue-500/10 text-blue-400 mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 pb-2">
                    Lộ trình Học Cá nhân hóa
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                    Trí tuệ nhân tạo phân tích kỹ năng hiện tại và đích đến nghề nghiệp của bạn để vẽ ra con đường học tập tối ưu nhất.
                </p>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
                >
                    {showCreate ? '✕ Hủy tạo lộ trình' : '✨ Tạo lộ trình mới bằng AI'}
                </button>
            </motion.div>

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/60 p-8 rounded-3xl shadow-xl max-w-3xl mx-auto">
                            <h3 className="text-xl font-bold mb-4 text-white">Mục tiêu nghề nghiệp của bạn là gì?</h3>
                            <input
                                type="text"
                                value={careerGoal}
                                onChange={e => setCareerGoal(e.target.value)}
                                placeholder='VD: "Trở thành Senior UX Designer", "Fullstack Node.js Developer"...'
                                className="w-full bg-slate-900/50 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-6 py-4 text-white placeholder-slate-500 mb-6 outline-none transition-all"
                            />

                            <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Chọn lĩnh vực chính</h4>
                            <div className="flex flex-wrap gap-3 mb-8">
                                {fields?.map(f => (
                                    <button
                                        key={f}
                                        className={`px-5 py-3 rounded-xl border transition-all font-medium ${field === f
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-inner'
                                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                        onClick={() => setField(f)}
                                    >
                                        {f === 'Technical' ? '💻' : f === 'Design' ? '🎨' : f === 'Business' ? '📊' : f === 'Science' ? '🔬' : '🤝'} {f}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating || !careerGoal.trim()}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700/50 disabled:border-slate-700 disabled:text-slate-500 border disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                {generating ? (
                                    <><svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> AI đang phân tích dữ liệu...</>
                                ) : '🚀 Phân tích & Tạo Roadmap ngay'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Container */}
            <div className="space-y-6">
                {loading ? (
                    // Skeleton Loading
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {[1, 2]?.map(i => (
                            <div key={i} className="animate-pulse bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50">
                                <div className="h-8 bg-slate-700/50 rounded-lg w-1/3 mb-4"></div>
                                <div className="h-4 bg-slate-700/50 rounded-md w-1/4 mb-8"></div>
                                <div className="space-y-4">
                                    <div className="h-20 bg-slate-700/30 rounded-2xl"></div>
                                    <div className="h-20 bg-slate-700/30 rounded-2xl"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : paths?.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-24 bg-slate-800/20 rounded-[2rem] border-2 border-slate-700/50 max-w-3xl mx-auto border-dashed"
                    >
                        <div className="text-6xl mb-6 opacity-80">🗺️</div>
                        <h3 className="text-2xl font-bold text-white mb-3">Chưa có lộ trình nào</h3>
                        <p className="text-slate-400 max-w-md mx-auto">Hãy đưa ra mục tiêu của bạn để AI thiết kế một kế hoạch hành động hoàn hảo từng bước một.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                        {paths?.map((path, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                key={path.PathID}
                                className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/60 rounded-[2rem] overflow-hidden hover:border-slate-500 transition-colors shadow-xl"
                            >
                                {/* Card Header */}
                                <div className="p-8 cursor-pointer flex items-center justify-between" onClick={() => setExpandedPath(expandedPath === path.PathID ? null : path.PathID)}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                                                {path.FieldCategory}
                                            </span>
                                            {path.progress === 100 && <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">HOÀN THÀNH</span>}
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-2">{path.Title}</h3>
                                        <p className="text-blue-400/80 text-sm font-medium flex items-center gap-2">
                                            🎯 Mục tiêu: {path.CareerGoal}
                                        </p>
                                    </div>

                                    {/* Progress Ring */}
                                    <div className="relative w-24 h-24 ml-6 flex-shrink-0">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-slate-700/50" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            <path className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                                                strokeDasharray={`${path.progress || 0}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-xl font-bold text-white leading-none">{path.progress || 0}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Analysis Highlight */}
                                {path.AiAnalysis && (
                                    <div className="px-8 pb-4">
                                        <div className="p-5 bg-indigo-900/20 rounded-2xl border border-indigo-500/20 flex gap-4 items-start">
                                            <span className="text-2xl mt-1">🤖</span>
                                            <p className="text-indigo-200 text-sm leading-relaxed">{path.AiAnalysis}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Milestones Timeline */}
                                <AnimatePresence>
                                    {expandedPath === path.PathID && path.milestones && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                            className="px-8 pb-8 overflow-hidden"
                                        >
                                            <div className="pt-8 border-t border-slate-700/50">
                                                <h4 className="text-xl font-bold text-white mb-8">Nhiệm vụ & Cột mốc</h4>
                                                <div className="pl-5 space-y-10 border-l-[3px] border-slate-700 relative">
                                                    {path.milestones?.map((m, i) => (
                                                        <div key={m.MilestoneID} className="relative pl-8">
                                                            {/* Dot */}
                                                            <div className={`absolute -left-[23px] top-1 w-11 h-11 rounded-full flex items-center justify-center border-4 border-slate-800 ${m.IsCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'} shadow-lg text-lg`}>
                                                                {m.IsCompleted ? '✓' : (typeIcons[m.MilestoneType] || '📌')}
                                                            </div>

                                                            {/* Content */}
                                                            <div className={`bg-slate-900/40 p-6 rounded-2xl border ${m.IsCompleted ? 'border-emerald-500/30' : 'border-slate-700/50'} transition-all hover:bg-slate-800/60 shadow-md`}>
                                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-800 text-slate-400 rounded-md">PHASE {m.Phase}</span>
                                                                        <h5 className={`text-xl font-bold ${m.IsCompleted ? 'text-emerald-400' : 'text-white'}`}>{m.Title}</h5>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-slate-400 flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full">⏱️ {m.DurationWeeks} tuần</span>
                                                                </div>
                                                                <p className="text-slate-400 text-base leading-relaxed mb-6">{m.Description}</p>

                                                                {/* Action Button */}
                                                                <div className="flex justify-end pt-4 border-t border-slate-700/50">
                                                                    {m.IsCompleted ? (
                                                                        <span className="text-emerald-500 font-bold flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl">
                                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Đã hoàn thành
                                                                        </span>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => completeMilestone(m.MilestoneID)}
                                                                            className="px-6 py-2.5 bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50 border border-slate-600 rounded-xl text-sm font-bold transition-all"
                                                                        >
                                                                            Đánh dấu hoàn thành
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPath;
