import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/config';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Achievements = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [newBadges, setNewBadges] = useState([]);

    useEffect(() => {
        fetchAchievements();
        updateStreak();
    }, []);

    const fetchAchievements = async () => {
        try {
            const res = await axiosClient.get('/achievements/me');
            if (res.data?.data) {
                setData(res.data.data);
            } else {
                toast.error(res.data?.message || 'Lỗi tải thành tựu');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Mất kết nối với máy chủ');
        }
        finally { setLoading(false); }
    };

    const updateStreak = async () => {
        try {
            await axiosClient.post('/achievements/streak');
        } catch (err) { console.error(err); }
    };

    const checkBadges = async () => {
        setChecking(true);
        try {
            const res = await axiosClient.post('/achievements/check');
            const d = res.data;
            if (d?.data?.newBadges?.length > 0) {
                setNewBadges(d.data.newBadges);
                toast.success(`Chúc mừng! Bạn vượt ải và nhận ${d.data.newBadges.length} huy hiệu mới! 🎉`);
                fetchAchievements();
            } else {
                toast.info('Bạn chưa có huy hiệu mới nào để nhận. Hãy cố gắng thêm nhé!');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Lỗi khi kiểm tra huy hiệu');
        }
        finally { setChecking(false); }
    };

    const rarityColors = {
        Common: 'text-slate-400 border-slate-500 bg-slate-500/10 shadow-slate-500/20',
        Uncommon: 'text-emerald-400 border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20',
        Rare: 'text-blue-400 border-blue-500 bg-blue-500/10 shadow-blue-500/20',
        Epic: 'text-purple-400 border-purple-500 bg-purple-500/10 shadow-purple-500/20',
        Legendary: 'text-amber-400 border-amber-500 bg-amber-500/10 shadow-amber-500/20'
    };

    const rarityBadgeColors = {
        Common: 'bg-slate-500/20 text-slate-300',
        Uncommon: 'bg-emerald-500/20 text-emerald-300',
        Rare: 'bg-blue-500/20 text-blue-300',
        Epic: 'bg-purple-500/20 text-purple-300',
        Legendary: 'bg-amber-500/20 text-amber-300'
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-slate-200">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <div className="inline-block p-4 rounded-full bg-amber-500/10 text-amber-400 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400 mb-4 pb-2">
                    Thành tựu & Huy hiệu
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                    Chinh phục thử thách, duy trì chuỗi học tập (streak) và thu thập những huy hiệu danh giá nhất để chứng minh thực lực của bạn.
                </p>

                <button
                    onClick={checkBadges}
                    disabled={checking}
                    className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.3)] disabled:shadow-none transition-all hover:-translate-y-1 flex items-center gap-3 mx-auto text-lg"
                >
                    {checking ? (
                        <><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Đang kiểm tra...</>
                    ) : '🔍 Yêu cầu kiểm tra phần thưởng mới'}
                </button>
            </motion.div>

            {/* Popup New Badges */}
            <AnimatePresence>
                {newBadges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="mb-12 max-w-3xl mx-auto"
                    >
                        <div className="bg-gradient-to-br from-amber-900/60 to-red-900/60 p-1 border border-amber-500/50 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                            <div className="bg-slate-900/80 backdrop-blur-xl rounded-[22px] p-8 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none"></div>
                                <h3 className="text-2xl font-bold text-white mb-6">🎉 Chúc mừng! Bạn vửa nhận {newBadges.length} huy hiệu mới!</h3>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {newBadges.map(b => (
                                        <motion.div
                                            initial={{ rotate: -10, scale: 0 }}
                                            animate={{ rotate: 0, scale: 1 }}
                                            transition={{ type: "spring" }}
                                            key={b.BadgeID}
                                            className={`px-4 py-3 rounded-xl border ${rarityColors[b.Rarity] || rarityColors.Common} flex items-center gap-3 text-lg font-bold shadow-lg`}
                                        >
                                            <span className="text-2xl drop-shadow-md">{b.Icon}</span>
                                            <span>{b.Name}</span>
                                        </motion.div>
                                    ))}
                                </div>
                                <button onClick={() => setNewBadges([])} className="mt-8 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-semibold">Đóng thông báo</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                // Skeleton Stats
                <div className="space-y-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 h-36"></div>
                        ))}
                    </div>
                    <div>
                        <div className="h-8 bg-slate-800/50 rounded max-w-xs mb-6"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse bg-slate-800/40 border border-slate-700/50 rounded-[2rem] h-64"></div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-3xl p-6 text-center hover:bg-slate-800/80 transition-all group">
                            <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">🔥</span>
                            <span className="block text-3xl font-black text-white mb-1">{data?.streak?.CurrentStreak || 0}</span>
                            <span className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Ngày Streak</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-6 text-center hover:bg-slate-800/80 transition-all group">
                            <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</span>
                            <span className="block text-3xl font-black text-white mb-1">{data?.streak?.TotalXp || 0}</span>
                            <span className="block text-sm font-medium text-slate-400 uppercase tracking-wider">XP Tổng</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-6 text-center hover:bg-slate-800/80 transition-all group">
                            <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">🏅</span>
                            <span className="block text-3xl font-black text-white mb-1">{data?.earnedCount || 0}<span className="text-lg text-slate-500">/{data?.totalBadges || 0}</span></span>
                            <span className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Huy Hiệu</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-3xl p-6 text-center hover:bg-slate-800/80 transition-all group">
                            <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">🏆</span>
                            <span className="block text-3xl font-black text-white mb-1">{data?.streak?.LongestStreak || 0}</span>
                            <span className="block text-sm font-medium text-slate-400 uppercase tracking-wider">Kỷ lục Streak</span>
                        </motion.div>
                    </div>

                    {/* Badge Grid Section */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            🏅 Bộ sưu tập huy hiệu <span className="text-sm font-normal text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{data?.totalBadges || 0} tổng cộng</span>
                        </h3>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {(data?.allBadges || []).map(badge => {
                                const earned = data?.earned?.find(e => e.BadgeID === badge.BadgeID);
                                const rarityClass = rarityColors[badge.Rarity] || rarityColors.Common;
                                const badgeTagClass = rarityBadgeColors[badge.Rarity] || rarityBadgeColors.Common;

                                return (
                                    <motion.div
                                        variants={itemVariants}
                                        key={badge.BadgeID}
                                        className={`relative bg-slate-800/30 backdrop-blur-sm border rounded-[2rem] p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl overflow-hidden
                                            ${earned ? `border-${badge.Rarity.toLowerCase()}-500/30 ${rarityClass.split(' ')[2]}` : 'border-slate-700/50 opacity-70 grayscale hover:grayscale-0'}`}
                                    >
                                        {/* Rarity Tag */}
                                        <div className="absolute top-4 right-4">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${badgeTagClass}`}>
                                                {badge.Rarity}
                                            </span>
                                        </div>

                                        {/* Icon Container */}
                                        <div className={`w-24 h-24 mx-auto mt-4 mb-6 rounded-full flex items-center justify-center text-5xl border-4 shadow-inner
                                            ${earned ? rarityClass : 'border-slate-700 bg-slate-800 text-slate-600'}`}>
                                            {earned ? <span className="drop-shadow-lg">{badge.Icon}</span> : '🔒'}
                                        </div>

                                        {/* Details */}
                                        <h4 className={`text-xl font-bold mb-2 ${earned ? 'text-white' : 'text-slate-400'}`}>{badge.Name}</h4>
                                        <p className="text-slate-400 text-sm mb-6 leading-relaxed h-10 overflow-hidden line-clamp-2">{badge.Description}</p>

                                        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
                                            <span className="text-amber-400 font-bold text-sm bg-amber-400/10 px-3 py-1 rounded-full">+{badge.XpReward} XP</span>
                                            {earned ? (
                                                <span className="text-xs font-semibold text-slate-500">✅ {new Date(earned.EarnedAt).toLocaleDateString('vi-VN')}</span>
                                            ) : (
                                                <span className="text-xs font-semibold text-slate-600">Chưa đạt</span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Achievements;
