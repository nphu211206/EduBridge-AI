import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
    {
        quote: "Nền tảng thi trực tuyến mượt mà nhất tôi từng trải nghiệm. Không còn lo lắng giật lag hay gian lận.",
        author: "Nguyễn Văn A",
        role: "Học sinh THPT",
        avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
        quote: "Công cụ AI chấm bài tự luận là một phép màu. Nó tiết kiệm cho tôi hàng chục giờ đồng hồ mỗi tuần.",
        author: "Trần Thị B",
        role: "Giảng viên Đại học",
        avatar: "https://i.pravatar.cc/150?img=32"
    },
    {
        quote: "Chúng tôi đã tìm được 5 Developer chất lượng cao trong thời gian kỷ lục nhờ vào hệ thống matching của EduBridge.",
        author: "Lê Văn C",
        role: "Giám đốc Tuyển dụng IT",
        avatar: "https://i.pravatar.cc/150?img=15"
    }
];

const Testimonials = () => {
    return (
        <div id="testimonials" className="w-full max-w-7xl mx-auto px-4 py-24 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-96 bg-[#8b5cf6] opacity-[0.05] blur-[100px] pointer-events-none" />

            <div className="text-center mb-16 relative z-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold text-white mb-6"
                >
                    Được Tin Tưởng Bởi Cộng Đồng
                </motion.h2>
                <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
                    Hàng nghìn cá nhân & tổ chức đã và đang đạt được thành tựu vượt bậc cùng cường độ cao của nền tảng.
                </p>
            </div>

            <div className="relative w-full overflow-hidden pb-10">
                {/* Fade edges */}
                <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-[#030303] to-transparent z-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-[#030303] to-transparent z-20 pointer-events-none" />

                <div className="flex w-[200%] md:w-[150%] gap-6 animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] px-4">
                    {[...testimonials, ...testimonials, ...testimonials].map((testimonial, index) => (
                        <div
                            key={index}
                            className="flex-none w-[350px] md:w-[400px] bg-[#0a0a0a]/50 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:bg-[#111] hover:border-white/10 transition-all duration-300 group cursor-grab active:cursor-grabbing"
                        >
                            <div className="text-[#8b5cf6] text-4xl mb-4 leading-none opacity-50 group-hover:opacity-100 transition-opacity">"</div>
                            <p className="text-[#e2e8f0] text-lg mb-8 font-light leading-relaxed">
                                {testimonial.quote}
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full border border-white/10" />
                                <div>
                                    <h4 className="text-white font-medium">{testimonial.author}</h4>
                                    <p className="text-[#64748b] text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
            `}} />
        </div>
    );
};

export default Testimonials;
