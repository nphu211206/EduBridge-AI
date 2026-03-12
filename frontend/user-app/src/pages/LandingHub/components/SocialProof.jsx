import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building, ShieldCheck, Globe } from 'lucide-react';

const stats = [
    { id: 1, label: 'Học Viên Tiềm Năng', value: '10K+', icon: Users, color: 'text-blue-400' },
    { id: 2, label: 'Doanh Nghiệp Đối Tác', value: '500+', icon: Building, color: 'text-emerald-400' },
    { id: 3, label: 'Khóa Học Độc Quyền', value: '1,200+', icon: ShieldCheck, color: 'text-purple-400' },
    { id: 4, label: 'Mạng Lưới Toàn Cầu', value: '15+', icon: Globe, color: 'text-amber-400' },
];

const SocialProof = () => {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

            <p className="text-[#94a3b8] text-sm uppercase tracking-widest font-semibold mb-10 text-center">
                Tin tưởng bởi cộng đồng công nghệ Việt Nam
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 max-w-5xl w-full px-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 + (index * 0.1) }}
                            className="flex flex-col items-center justify-center text-center space-y-3"
                        >
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm ${stat.color} mb-2 shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                                <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <h4 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                {stat.value}
                            </h4>
                            <p className="text-[#94a3b8] text-sm font-medium">
                                {stat.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

        </div>
    );
};

export default SocialProof;
