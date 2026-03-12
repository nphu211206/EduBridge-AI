import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Presentation, Briefcase, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roles = [
    {
        id: 'student',
        title: 'Học Viên',
        description: 'Khám phá khóa học chất lượng cao, lộ trình rõ ràng và thử thách Vượt Chướng Ngại Vật.',
        icon: GraduationCap,
        gradient: 'from-[#38bdf8]/30 to-[#818cf8]/30',
        iconColor: 'text-[#38bdf8]',
        action: 'Học ngay',
        link: '/home', // Goes to user-app home
        type: 'internal'
    },
    {
        id: 'teacher',
        title: 'Giảng Viên',
        description: 'Chia sẻ kiến thức, tạo lớp học và quản lý doanh thu dễ dàng chuyên nghiệp.',
        icon: Presentation,
        gradient: 'from-[#c084fc]/30 to-[#fb7185]/30',
        iconColor: 'text-[#c084fc]',
        action: 'Dạy ngay',
        link: 'http://localhost:5006', // Goes to teacher portal
        type: 'external'
    },
    {
        id: 'recruiter',
        title: 'Nhà Tuyển Dụng',
        description: 'Tìm kiếm nhân tài IT hàng đầu, quản lý phỏng vấn và đánh giá năng lực ứng viên.',
        icon: Briefcase,
        gradient: 'from-[#10b981]/30 to-[#34d399]/30',
        iconColor: 'text-[#34d399]',
        action: 'Tuyển ngay',
        link: 'http://localhost:5174', // Replace with recruiter port later, assuming 5174
        type: 'external'
    },
    {
        id: 'admin',
        title: 'Quản Trị Viên',
        description: 'Bảng điều khiển toàn diện quản lý người dùng, giao dịch và hệ thống cốt lõi.',
        icon: LayoutDashboard,
        gradient: 'from-[#f59e0b]/30 to-[#fbbf24]/30',
        iconColor: 'text-[#fbbf24]',
        action: 'Quản trị',
        link: 'http://localhost:5005', // Goes to admin portal
        type: 'external'
    }
];

const RoleCards = () => {
    const navigate = useNavigate();

    const handleNavigation = (role) => {
        if (role.type === 'internal') {
            navigate(role.link);
        } else {
            window.location.href = role.link;
        }
    };

    return (
        <div id="role-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4">
            {roles.map((role, index) => {
                const Icon = role.icon;
                return (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => handleNavigation(role)}
                        className="group relative cursor-pointer"
                    >
                        {/* Glow effect behind card on hover */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-br ${role.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700`} />

                        {/* Card Content */}
                        <div className="relative h-full flex flex-col bg-[#050505]/80 backdrop-blur-2xl border border-white/[0.05] group-hover:border-white/[0.15] rounded-2xl p-8 transition duration-500 overflow-hidden">
                            {/* Inner subtle glow */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${role.gradient} opacity-20 blur-3xl rounded-full pointer-events-none transform translate-x-10 -translate-y-10 group-hover:opacity-40 transition duration-500`} />

                            <div className={`relative z-10 w-14 h-14 rounded-xl flex items-center justify-center bg-white/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-8 border border-white/[0.05] group-hover:scale-110 transition-transform duration-500`}>
                                <Icon size={28} className={role.iconColor} strokeWidth={1.5} />
                            </div>

                            <h3 className="relative z-10 text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
                                {role.title}
                            </h3>

                            <p className="relative z-10 text-[#94a3b8] text-sm leading-relaxed flex-grow font-light">
                                {role.description}
                            </p>

                            <div className="relative z-10 mt-8 flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors duration-300">
                                <span>{role.action}</span>
                                <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                            </div>

                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default RoleCards;
