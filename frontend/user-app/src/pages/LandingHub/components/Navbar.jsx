import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Về chúng tôi', href: '#about' },
        { name: 'Giải pháp', href: '#features' },
        { name: 'Khách hàng', href: '#testimonials' },
        { name: 'Bảng giá', href: '#pricing' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`relative flex items-center justify-between rounded-2xl transition-all duration-500 ${scrolled ? 'bg-[#050505]/70 backdrop-blur-xl border border-white/10 px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'px-2'}`}>

                    {/* Logo */}
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#38bdf8] flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
                            EduBridge-AI
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-center">
                        <div className="flex space-x-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-[#94a3b8] hover:text-white transition-colors duration-300"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="text-sm font-medium text-white hover:text-white/80 transition-colors bg-transparent border-none cursor-pointer">
                            Đăng nhập
                        </button>
                        <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer">
                            Bắt đầu ngay
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
                        >
                            <div className="px-4 py-6 flex flex-col space-y-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="text-base font-medium text-[#94a3b8] hover:text-white"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div className="h-px bg-white/10 my-2" />
                                <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="text-base font-medium text-white text-center bg-transparent border-none cursor-pointer">
                                    Đăng nhập
                                </button>
                                <button onClick={() => { setMobileMenuOpen(false); navigate('/register'); }} className="w-full px-4 py-2 mt-2 rounded-xl bg-white text-black text-sm font-semibold cursor-pointer">
                                    Bắt đầu ngay
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};

export default Navbar;
