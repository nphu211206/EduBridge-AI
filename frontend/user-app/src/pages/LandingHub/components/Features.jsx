import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Zap, Microscope, LayoutTemplate, Link as LinkIcon } from 'lucide-react';

const Features = () => {
    const features = [
        {
            title: "Thi Trực Tuyến Anti-Cheat",
            description: "Hệ thống giám sát vĩ mô ngăn chặn gian lận tự động bằng cơ chế khóa màn hình.",
            icon: ShieldCheck,
            colSpan: "col-span-1 md:col-span-2 lg:col-span-8",
            bgGradient: "from-[#8b5cf6]/10 to-[#38bdf8]/10",
            iconColor: "text-[#8b5cf6]"
        },
        {
            title: "Chấm Điểm Trí Tuệ Nhân Tạo",
            description: "AI phân tích và chấm điểm bài tập tự luận trong tích tắc.",
            icon: Zap,
            colSpan: "col-span-1 md:col-span-1 lg:col-span-4",
            bgGradient: "from-[#f59e0b]/10 to-[#fbbf24]/10",
            iconColor: "text-[#fbbf24]"
        },
        {
            title: "Creator Studio Đẳng Cấp",
            description: "Kéo thả tạo đề thi và khóa học một cách mượt mà.",
            icon: LayoutTemplate,
            colSpan: "col-span-1 md:col-span-1 lg:col-span-4",
            bgGradient: "from-[#10b981]/10 to-[#34d399]/10",
            iconColor: "text-[#34d399]"
        },
        {
            title: "Matching Ứng Viên - Doanh Nghiệp",
            description: "Thuật toán tinh vi kết nối năng lực học viên với yêu cầu nhà tuyển dụng.",
            icon: Target,
            colSpan: "col-span-1 md:col-span-2 lg:col-span-8",
            bgGradient: "from-[#ec4899]/10 to-[#f43f5e]/10",
            iconColor: "text-[#ec4899]"
        }
    ];

    return (
        <div id="features" className="w-full max-w-7xl mx-auto px-4 py-24 md:py-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Mảnh Ghép Hoàn Hảo</h2>
                <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
                    EduBridge-AI cung cấp bộ công cụ toàn diện từ lúc tạo khóa học, tổ chức thi cho đến việc kết hợp nhân sự.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`${feature.colSpan} relative rounded-3xl overflow-hidden group cursor-pointer`}
                        >
                            <div className="absolute inset-0 bg-[#0a0a0a] z-0" />
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-50 z-10 transition-opacity duration-500 group-hover:opacity-100`} />
                            <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 z-20 rounded-3xl transition-colors duration-500" />

                            <div className="relative z-30 p-8 md:p-12 h-full flex flex-col justify-end min-h-[250px] md:min-h-[300px]">
                                <div className="mb-auto">
                                    <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 ${feature.iconColor}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                                    <p className="text-[#94a3b8]">{feature.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Features;
