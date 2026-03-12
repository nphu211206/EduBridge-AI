import React from 'react';
import { motion } from 'framer-motion';
import AlertBanner from './components/AlertBanner';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LogoCloud from './components/LogoCloud';
import RoleCards from './components/RoleCards';
import PlatformShowcase from './components/PlatformShowcase';
import Features from './components/Features';
import Pathway from './components/Pathway';
import SocialProof from './components/SocialProof';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import PreFooterCTA from './components/PreFooterCTA';
import Footer from './components/Footer';

const LandingHub = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-[#f8fafc] overflow-x-hidden relative selection:bg-[#6366f1] selection:text-white font-sans">
            {/* 1. Global Alert Banner */}
            <AlertBanner />

            {/* Background Aurora / Glow Effects for Top Section */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#6366f1] opacity-10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
            <div className="absolute top-96 right-0 w-[800px] h-[500px] bg-[#06b6d4] opacity-[0.05] blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

            {/* Cinematic Grid Pattern Overlay */}
            <div
                className="absolute inset-x-0 top-0 h-screen pointer-events-none opacity-[0.02] mix-blend-overlay border-none"
                style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '60px 60px', backgroundPosition: 'center center' }}
            />

            {/* 1. Floating Navbar */}
            <Navbar />

            {/* 2. Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 flex flex-col items-center min-h-[85vh] justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full text-center"
                >
                    <HeroSection />
                </motion.div>
            </div>

            {/* 3. Trusted By Logo Cloud */}
            <div className="relative z-10 w-full mb-24">
                <LogoCloud />
            </div>

            {/* Ecosystem Navigation / Entry Points (RoleCards) */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center mb-0">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full"
                >
                    <RoleCards />
                </motion.div>
            </div>

            {/* 4. Platform Showcase (Mockup 3D) */}
            <div className="relative z-10 w-full mt-32 border-t border-white/5">
                <PlatformShowcase />
            </div>

            {/* 5. The Ecosystem (Features Bento Grid) */}
            <div className="relative z-10 w-full bg-[#050505] border-y border-white/5">
                <Features />
            </div>

            {/* 7. The Pathway (How It Works) */}
            <div className="relative z-10 w-full">
                <Pathway />
            </div>

            {/* 6. Impact Metrics / Social Proof */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="w-full"
                >
                    <SocialProof />
                </motion.div>
            </div>

            {/* 8. Infinite Testimonials */}
            <div className="relative z-10 w-full bg-[#030303]">
                <Testimonials />
            </div>

            {/* 9. Enterprise Pricing */}
            <div className="relative z-10 w-full">
                <Pricing />
            </div>

            {/* 10. Final Push CTA */}
            <PreFooterCTA />

            {/* Premium Footer */}
            <Footer />
        </div>
    );
};

export default LandingHub;
