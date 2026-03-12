import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();

    const scrollToRoles = () => {
        const rolesSection = document.getElementById('role-cards');
        if (rolesSection) rolesSection.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8">

            {/* Top Badge */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl text-sm font-medium text-[#c4b5fd] cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-colors hover:bg-white/[0.05]"
            >
                <Sparkles size={16} className="text-[#8b5cf6]" />
                <span className="tracking-wide">Hệ sinh thái EduBridge-AI thế hệ mới 2026</span>
                <div className="w-5 h-5 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center ml-2">
                    <ArrowRight size={10} className="text-[#c4b5fd]" />
                </div>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-white max-w-5xl mx-auto leading-[1.1]">
                Học Tập Không Giới Hạn <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] via-[#c084fc] to-[#38bdf8] pb-2 inline-block">
                    Kiến Tạo Tương Lai Khác Biệt
                </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-[#94a3b8] text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed mt-8 font-light tracking-wide">
                Một trạm trung chuyển duy nhất kết nối những bộ óc vĩ đại. Trải nghiệm hệ sinh thái giáo dục và tuyển dụng đẳng cấp quốc tế.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-12">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/register')}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white font-bold text-lg flex items-center gap-3 shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] transition-shadow cursor-pointer border-none"
                >
                    Bắt đầu miễn phí <ArrowRight size={20} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={scrollToRoles}
                    className="px-8 py-4 rounded-full bg-white/5 text-white font-semibold text-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                >
                    <Play size={18} className="text-[#38bdf8]" /> Khám phá nền tảng
                </motion.button>
            </div>

        </div>
    );
};

export default HeroSection;

