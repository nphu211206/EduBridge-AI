import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

const AlertBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full bg-gradient-to-r from-[#8b5cf6]/20 via-[#c084fc]/20 to-[#38bdf8]/20 border-b border-white/5 backdrop-blur-md relative z-50 flex items-center justify-center py-2 px-4"
            >
                <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                    <span className="px-2 py-0.5 rounded-md bg-[#8b5cf6] text-white text-xs font-bold uppercase tracking-wider">New</span>
                    <span>Hệ thống giám sát Anti-Cheat v2.0 đã chính thức ra mắt.</span>
                    <a href="#" className="flex items-center gap-1 text-[#38bdf8] hover:text-white transition-colors group">
                        Khám phá ngay <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 text-white/50 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};

export default AlertBanner;
