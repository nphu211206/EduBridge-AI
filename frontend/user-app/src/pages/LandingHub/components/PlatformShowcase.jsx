import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PlatformShowcase = () => {
    const { scrollYProgress } = useScroll();

    // Scale and rotate the "browser" window as the user scrolls
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const rotateX = useTransform(scrollYProgress, [0, 0.5], [20, 0]);

    return (
        <div className="w-full relative bg-[#050505] py-32 overflow-hidden flex flex-col items-center justify-center perspective-[2000px]">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8] opacity-20 blur-[150px] rounded-full pointer-events-none" />

            <div className="text-center mb-16 relative z-10">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                    Nền Tảng Của Tương Lai
                </h2>
                <p className="text-[#94a3b8] text-lg md:text-xl max-w-2xl mx-auto font-light">
                    Mọi thứ bạn cần để dạy, học và tuyển dụng, gói gọn trong một giao diện tối giản vượt thời gian.
                </p>
            </div>

            {/* 3D Browser Mockup */}
            <motion.div
                style={{ scale, rotateX }}
                className="relative z-10 w-full max-w-6xl mx-auto px-4 perspective-[1000px]"
            >
                <div className="w-full aspect-[16/9] bg-[#0a0a0a] rounded-xl border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">

                    {/* Fake Browser Header */}
                    <div className="h-10 w-full bg-[#111] border-b border-white/5 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                        <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                        <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                        <div className="mx-auto bg-[#222] h-6 w-64 rounded-md border border-white/5 flex items-center justify-center">
                            <span className="text-xs text-white/30">edubridge.ai/dashboard</span>
                        </div>
                    </div>

                    {/* Fake App Content / Dashboard */}
                    <div className="flex-1 w-full bg-[#0a0a0a] p-8 grid grid-cols-12 gap-6 relative overflow-hidden">
                        {/* Fake Sidebar */}
                        <div className="col-span-3 bg-[#111] rounded-lg border border-white/5 p-4 flex flex-col gap-4">
                            <div className="w-full h-8 bg-white/5 rounded-md" />
                            <div className="w-3/4 h-4 bg-white/5 rounded-md mt-4" />
                            <div className="w-1/2 h-4 bg-white/5 rounded-md" />
                            <div className="w-2/3 h-4 bg-white/5 rounded-md" />
                        </div>

                        {/* Fake Main Content */}
                        <div className="col-span-9 flex flex-col gap-6">
                            {/* Top Stats */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="h-24 bg-gradient-to-br from-[#8b5cf6]/20 to-[#38bdf8]/20 rounded-lg border border-[#8b5cf6]/30 p-4">
                                    <div className="w-8 h-8 rounded-full bg-[#8b5cf6]/30 mb-2" />
                                    <div className="w-1/2 h-4 bg-white/20 rounded-md" />
                                </div>
                                <div className="h-24 bg-white/5 rounded-lg border border-white/5 p-4" />
                                <div className="h-24 bg-white/5 rounded-lg border border-white/5 p-4" />
                            </div>

                            {/* Chart Area */}
                            <div className="flex-1 bg-white/5 rounded-lg border border-white/5 p-6 relative overflow-hidden">
                                <div className="w-1/4 h-6 bg-white/10 rounded-md mb-8" />
                                {/* Fake Chart Bars */}
                                <div className="absolute bottom-6 left-6 right-6 h-32 flex items-end justify-between gap-2">
                                    {[40, 70, 45, 90, 65, 80, 50, 100, 75, 60, 40, 85].map((height, i) => (
                                        <div key={i} className="w-full bg-gradient-to-t from-[#8b5cf6] to-[#38bdf8] rounded-t-sm opacity-50" style={{ height: `${height}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default PlatformShowcase;
