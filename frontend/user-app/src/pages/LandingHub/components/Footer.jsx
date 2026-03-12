import React from 'react';
import { Sparkles, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/5 bg-[#050505] pt-20 pb-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#8b5cf6]/5 opacity-50 blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">

                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center">
                                <Sparkles size={16} className="text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                EduBridge-AI
                            </span>
                        </div>
                        <p className="text-[#94a3b8] text-sm leading-relaxed max-w-sm mb-8">
                            Nắm Bộ Nhận Diện Tương Lai. Cầu Nối Sinh Viên Vượt Giới Hạn và Các Nhà Tuyển Dụng Xứng Tầm.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8] hover:bg-white/10 hover:text-white transition-colors border border-white/5">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8] hover:bg-white/10 hover:text-white transition-colors border border-white/5">
                                <Linkedin size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#94a3b8] hover:bg-white/10 hover:text-white transition-colors border border-white/5">
                                <Github size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Sản phẩm</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Thi Trực Tuyến</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">AI Chấm Điểm</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Tuyển Dụng IT</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Báo Cáo Phân Tích</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Công ty</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Về Chúng Tôi</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Blog Cập Nhật</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Nguồn Việc Làm</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Liên Hệ Kỹ Thuật</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Pháp lý</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Quyền riêng tư</a></li>
                            <li><a href="#" className="text-[#94a3b8] text-sm hover:text-white transition-colors">Chính sách bảo mật</a></li>
                        </ul>
                    </div>

                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[#64748b] text-sm">
                        © 2026 EduBridge-AI "Enterprise Edition". Được xây dựng bằng khát vọng dẫn đầu.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[#64748b]">
                        <Mail size={14} />
                        <span>contact@edubridge.ai</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
