import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/config';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const SkillDNA = () => {
    const canvasRef = useRef(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDNA(); }, []);
    useEffect(() => {
        // Small delay to ensure canvas is rendered before drawing
        if (data) setTimeout(drawRadar, 100);
    }, [data]);

    const fetchDNA = async () => {
        try {
            const res = await axiosClient.get('/skill-dna/me');
            if (res.data?.data) {
                setData(res.data.data);
            } else {
                toast.error(res.data?.message || 'Lỗi khi tải dữ liệu cấu trúc kỹ năng');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Không thể tải dữ liệu Skill DNA.');
        }
        finally { setLoading(false); }
    };

    const drawRadar = () => {
        const canvas = canvasRef.current;
        if (!canvas || !data || !data.dimensions) return;
        const ctx = canvas.getContext('2d');

        // High DPI Canvas Scaling for sharpness
        const scale = window.devicePixelRatio || 1;
        const targetW = 600;
        const targetH = 600;

        // Only set width/height attributes once to avoid infinite resizing
        if (canvas.width !== targetW * scale) {
            canvas.width = targetW * scale;
            canvas.height = targetH * scale;
            ctx.scale(scale, scale);
        }

        const W = targetW, H = targetH;
        const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.35;

        ctx.clearRect(0, 0, W, H);

        const dims = Object.keys(data.dimensions);
        const N = dims.length;
        if (N === 0) return;

        const angleStep = (2 * Math.PI) / N;

        // Draw grid rings
        for (let ring = 1; ring <= 5; ring++) {
            ctx.beginPath();
            for (let i = 0; i <= N; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const r = (ring / 5) * R;
                const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(148,163,184,0.15)'; // Slate 400 with opacity
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw axes + labels
        dims.forEach((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;

            // Axis line
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
            ctx.strokeStyle = 'rgba(148,163,184,0.2)';
            ctx.stroke();

            // Label
            const lx = cx + (R + 40) * Math.cos(angle), ly = cy + (R + 40) * Math.sin(angle);
            ctx.fillStyle = '#a5b4fc'; // Indigo 300
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add subtle glow to text
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(dim, lx, ly);
            ctx.shadowBlur = 0; // reset
        });

        // Ensure platformAvg exists to prevent errors
        const platformAvg = data.platformAvg || {};

        // Draw data polygon — platform avg (dashed)
        drawPolygon(ctx, cx, cy, R, dims, platformAvg, 'rgba(148,163,184,0.5)', 'rgba(148,163,184,0.05)', true);

        // Draw data polygon — user (solid glow)
        drawPolygon(ctx, cx, cy, R, dims, data.dimensions, 'rgba(99,102,241,0.9)', 'rgba(99,102,241,0.2)', false, true);
    };

    const drawPolygon = (ctx, cx, cy, R, dims, values, strokeColor, fillColor, dashed, glow = false) => {
        const N = dims.length;
        const angleStep = (2 * Math.PI) / N;

        ctx.beginPath();
        if (dashed) ctx.setLineDash([6, 6]);
        else ctx.setLineDash([]);

        dims.forEach((dim, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const val = Math.min(100, values[dim] || 0);
            const r = (val / 100) * R;
            const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();

        // Fill
        ctx.fillStyle = fillColor;
        ctx.fill();

        // Stroke with optional glow
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = dashed ? 2 : 3;

        if (glow) {
            ctx.shadowColor = strokeColor;
            ctx.shadowBlur = 15;
        }

        ctx.stroke();

        // Reset effects
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);

        // Draw points if it's the main user polygon
        if (!dashed) {
            dims.forEach((dim, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const val = Math.min(100, values[dim] || 0);
                const r = (val / 100) * R;
                const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-slate-200">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <div className="inline-block p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.963 11.963 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 pb-2">
                    Skill DNA — Bản đồ Năng lực
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-8">
                    Khám phá tố chất cá nhân thông qua biểu đồ Radar 6 chiều, đo lường sự phát triển chuyên môn so với mặt bằng chung.
                </p>
            </motion.div>

            {/* Main Content */}
            {loading ? (
                // Skeleton UI
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <div className="animate-pulse bg-slate-800/30 rounded-3xl p-8 h-[500px] border border-slate-700/50 flex items-center justify-center">
                        <div className="w-[300px] h-[300px] rounded-full border-4 border-slate-700/50 border-dashed"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="animate-pulse bg-slate-800/30 rounded-3xl p-8 border border-slate-700/50 h-[500px]">
                            <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-10"></div>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
                                        <div className="h-4 bg-slate-700/50 rounded w-12"></div>
                                    </div>
                                    <div className="h-3 bg-slate-700/30 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : data && data.dimensions ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">

                    {/* Radar Chart Container */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 bg-slate-800/40 backdrop-blur-md rounded-[2rem] p-6 border border-slate-700/60 shadow-2xl flex flex-col items-center relative overflow-hidden"
                    >
                        {/* Decorative Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="w-full flex-1 flex items-center justify-center min-h-[400px]">
                            <canvas
                                ref={canvasRef}
                                className="w-full max-w-[500px] aspect-square drop-shadow-lg z-10"
                                style={{ imageRendering: 'high-quality' }}
                            />
                        </div>

                        {/* Chart Legend */}
                        <div className="mt-8 flex items-center justify-center gap-8 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700/50 z-10">
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                                <span className="text-sm font-semibold text-white tracking-wide">Bạn</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400"></span>
                                <span className="text-sm font-medium text-slate-400 tracking-wide">Trung bình Platform</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats & Details Container */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Top Stats Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 text-center shadow-lg">
                                <span className="block text-3xl mb-2 drop-shadow-md">🎯</span>
                                <span className="block text-2xl font-black text-white mb-1">{data?.totalSkills || 0}</span>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Kỹ năng cốt lõi</span>
                            </div>
                            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50 text-center shadow-lg">
                                <span className="block text-3xl mb-2 drop-shadow-md">📈</span>
                                <span className="block text-2xl font-black text-emerald-400 mb-1">{data?.growth?.length || 0}</span>
                                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Ngày rèn luyện</span>
                            </div>
                        </div>

                        {/* Detailed Bars */}
                        <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/60 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                📊 Phân bổ Chỉ số
                            </h3>

                            <div className="space-y-6">
                                {Object.entries(data.dimensions).map(([dim, score]) => {
                                    const avg = data.platformAvg ? data.platformAvg[dim] || 0 : 0;
                                    const isAboveAvg = score >= avg;

                                    return (
                                        <div key={dim} className="group">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                                    {dim}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${isAboveAvg ? 'text-indigo-400' : 'text-slate-400'}`}>
                                                        {score}
                                                    </span>
                                                    <span className="text-xs text-slate-500">/100</span>
                                                </div>
                                            </div>

                                            {/* Bar Background */}
                                            <div className="h-3 bg-slate-900/80 rounded-full overflow-hidden relative border border-slate-700/30">
                                                {/* User Score Fill */}
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${score}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`absolute top-0 left-0 h-full rounded-full ${isAboveAvg ? 'bg-gradient-to-r from-indigo-600 to-indigo-400' : 'bg-slate-600'}`}
                                                />

                                                {/* Average Marker */}
                                                <div
                                                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_4px_rgba(255,255,255,0.8)] z-10"
                                                    style={{ left: `${avg}%`, marginLeft: '-2px' }}
                                                    title={`Mặt bằng chung: ${avg}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <h3 className="text-xl text-slate-400">Không có dữ liệu Skill DNA</h3>
                </div>
            )}
        </div>
    );
};

export default SkillDNA;
