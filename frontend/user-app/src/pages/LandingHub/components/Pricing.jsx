import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: "Học Sinh Khám Phá",
            price: "Miễn phí",
            period: "mãi mãi",
            description: "Dành cho sinh viên/học sinh bắt đầu tìm hiểu.",
            features: ["Truy cập khóa học cơ bản", "Làm bài tập trắc nghiệm", "Hồ sơ năng lực Public", "Tham gia cộng đồng"],
            buttonText: "Bắt đầu miễn phí",
            highlight: false,
            color: "text-white"
        },
        {
            name: "Tuyển Dụng Chuyên Nghiệp",
            price: "2.499.000",
            period: "/tháng",
            description: "Dành cho HR, doanh nghiệp cần tìm ứng viên IT chất lượng.",
            features: ["Tìm kiếm nâng cao không giới hạn", "Matching AI Top 5% CV", "Tuyển 5 vị trí/tháng", "Truy cập báo cáo gian lận bài thi"],
            buttonText: "Trải nghiệm ngay",
            highlight: true,
            color: "text-[#8b5cf6]"
        },
        {
            name: "Giảng Viên Độc Lập",
            price: "999.000",
            period: "/tháng",
            description: "Dành cho thầy/cô muốn xây dựng đế chế khóa học riêng.",
            features: ["Tạo & bán khóa học", "Giới hạn 100 học viên", "Hệ thống Anti-Cheat cơ bản", "Thống kê doanh thu cơ bản"],
            buttonText: "Trở thành đối tác",
            highlight: false,
            color: "text-white"
        }
    ];

    return (
        <div className="w-full py-32 bg-[#050505]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Minh Bạch. Đơn Giản. Chuyên Nghiệp.</h2>
                    <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
                        Chọn gói giải pháp phù hợp với định hướng của bạn. Luôn có lựa chọn hoàn hảo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`relative rounded-3xl p-8 ${plan.highlight
                                    ? 'bg-[#111] border-2 border-[#8b5cf6] shadow-[0_0_50px_rgba(139,92,246,0.15)] z-10 py-12'
                                    : 'bg-[#0a0a0a] border border-white/10'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8b5cf6] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Phổ biến nhất
                                </div>
                            )}
                            <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                            <p className="text-[#94a3b8] text-sm mb-6 h-10">{plan.description}</p>
                            <div className="mb-8 border-b border-white/10 pb-8">
                                <span className={`text-4xl font-bold ${plan.color}`}>{plan.price}</span>
                                <span className="text-[#64748b] ml-2 text-sm">{plan.period}</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-[#e2e8f0]">
                                        <Check size={18} className={plan.highlight ? 'text-[#8b5cf6]' : 'text-[#10b981]'} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => navigate('/register')} className={`w-full py-4 rounded-xl font-semibold transition-all cursor-pointer ${plan.highlight
                                    ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-[0_4px_20px_rgba(139,92,246,0.4)]'
                                    : 'bg-white/5 text-white hover:bg-white/15 border border-white/10'
                                }`}>
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pricing;
