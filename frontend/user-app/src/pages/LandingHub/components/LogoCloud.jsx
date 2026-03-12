import React from 'react';
import { motion } from 'framer-motion';

const LogoCloud = () => {
    const logos = [
        "Google", "FPT Software", "VNG", "VinAI", "Tiki", "Shopee", "Momo", "KMS Technology", "Viettel", "VNPAY"
    ];

    return (
        <div className="w-full py-12 border-y border-white/5 bg-[#050505] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#050505] to-transparent z-10" />
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#050505] to-transparent z-10" />

            <p className="text-center text-[#64748b] text-sm font-medium tracking-widest uppercase mb-8">
                Được tin dùng bởi các tập đoàn công nghệ hàng đầu
            </p>

            <div className="flex w-[200%] gap-8 animate-[marquee_20s_linear_infinite]">
                {/* Double the array for seamless infinite scroll */}
                {[...logos, ...logos].map((logo, idx) => (
                    <div
                        key={idx}
                        className="flex-1 min-w-[150px] flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer"
                    >
                        <span className="text-2xl font-bold text-white tracking-widest uppercase">{logo}</span>
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}} />
        </div>
    );
};

export default LogoCloud;
