import React from 'react';
import { motion } from 'framer-motion';

const steps = [
    {
        id: "01",
        title: "Khám phá & Định vị",
        description: "Hệ thống AI phân tích năng lực hiện tại của bạn và đề xuất lộ trình kỹ năng tối ưu nhằm đạt được mục tiêu mong muốn.",
        color: "from-[#38bdf8] to-[#818cf8]"
    },
    {
        id: "02",
        title: "Rèn luyện & Vượt qua VCNV",
        description: "Tham gia các khóa học chất lượng cao, thực hiện bài kiểm tra theo tiêu chuẩn Anti-Cheat bảo mật tuyệt đối.",
        color: "from-[#c084fc] to-[#f472b6]"
    },
    {
        id: "03",
        title: "Match & Nhận Offer",
        description: "Hồ sơ năng lực thực tế của bạn được đẩy thẳng đến phòng nhân sự (HR) của các doanh nghiệp đang đói khát nhân tài.",
        color: "from-[#34d399] to-[#10b981]"
    }
];

const Pathway = () => {
    return (
        <div className="w-full py-32 bg-[#030303] relative border-y border-white/5">
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Kiến Tạo Con Đường Của Bạn
                    </h2>
                    <p className="text-[#94a3b8] text-lg">
                        Ba bước thay đổi sự nghiệp với sức mạnh công nghệ từ EduBridge-AI.
                    </p>
                </div>

                <div className="relative border-l-2 border-white/10 ml-6 md:ml-1/2 md:translate-x-[calc(50%-1px)]">
                    {steps.map((step, index) => (
                        <div key={index} className="mb-20 last:mb-0 relative">
                            {/* Node Dot */}
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-gradient-to-r ${step.color} shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center border-4 border-[#030303] z-10`}
                            >
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </motion.div>

                            {/* Content Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className="pl-12 md:pl-16 relative"
                            >
                                <h3 className="text-6xl font-black text-white/5 absolute -top-10 left-8 pointer-events-none select-none">
                                    {step.id}
                                </h3>
                                <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-[#1a1a1a] transition-colors">
                                    <h4 className="text-2xl font-bold text-white mb-4">{step.title}</h4>
                                    <p className="text-[#94a3b8] leading-relaxed">{step.description}</p>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Pathway;
