import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PreFooterCTA = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full relative bg-[#000000] py-40 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
            {/* Massive Glow Effect */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[500px] bg-gradient-to-t from-[#8b5cf6]/40 via-[#38bdf8]/10 to-transparent blur-[100px] pointer-events-none rounded-full translate-y-1/2" />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-screen"
                style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px', backgroundPosition: 'center center' }}
            />

            <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 tracking-tighter mb-8 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        Sẵn Sàng Chưa?
                    </h2>
                    <p className="text-[#94a3b8] text-xl md:text-3xl font-light mb-16 max-w-3xl mx-auto tracking-wide">
                        Tham gia cùng hàng nghìn học viên và tổ chức đang kiến thiết lại tương lai của nền giáo dục Việt Nam.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button onClick={() => navigate('/register')} className="px-8 py-5 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform duration-300 flex items-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.3)] cursor-pointer border-none">
                            Bắt đầu hành trình <ArrowRight size={20} />
                        </button>
                        <button onClick={() => window.location.href = 'mailto:contact@edubridge.ai'} className="px-8 py-5 rounded-full bg-white/5 text-white font-semibold text-lg hover:bg-white/10 border border-white/10 transition-colors duration-300 cursor-pointer">
                            Liên hệ Doanh nghiệp
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PreFooterCTA;
