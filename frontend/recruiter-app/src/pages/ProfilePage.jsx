// File: /client/src/pages/ProfilePage.jsx
// PHIÊN BẢN TỐI THƯỢNG - AI Giả Lập & Đánh giá NTD Giả Lập v2.1 (Đầy Đủ Hoàn Chỉnh)
// Trang này hiển thị hồ sơ chi tiết của sinh viên, bao gồm thông tin cá nhân,
// kỹ năng AI-verified, dự án GitHub, kinh nghiệm làm việc, và lịch sử học vấn.
// Tích hợp chức năng phân tích repo bằng AI giả lập và đánh giá ứng viên giả lập cho NTD.
// ĐÃ SỬA LỖI ReferenceError: title is not defined

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom'; // Hooks từ React Router
import { Helmet } from 'react-helmet-async'; // Quản lý thẻ <head> cho SEO và tiêu đề trang
import { Radar, RadarChart, PolarRadiusAxis, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'; // Thư viện vẽ biểu đồ
import { motion, AnimatePresence } from 'framer-motion'; // Thư viện animation
import { useAuth } from '../hooks/useAuth'; // Hook lấy thông tin xác thực người dùng
import { // Import các hàm gọi API đã chuẩn hóa
    getUserProfile, analyzeRepo,
    addWorkExperience, updateWorkExperience, deleteWorkExperience,
    addEducationHistory, updateEducationHistory, deleteEducationHistory
} from '../services/api';
import { // Import các component hiển thị trạng thái
    LoadingSpinner, ErrorDisplay, EmptyState
} from '../components/common/FeedbackComponents'; // Import từ file chung
import { // Import icons từ thư viện lucide-react
    Github, Mail, Link as LinkIcon, MapPin, Building, GraduationCap, Briefcase,
    Plus, Edit, Trash2, Loader, AlertCircle, X, Star, ExternalLink, Code, School, Award,
    BrainCircuit, MessageSquareText, ClipboardCheck, ChevronsUpDown, UserCheck, Eye, HelpCircle // Thêm icons
} from 'lucide-react';

// --- Hằng số và Cấu hình ---
const MAX_REPOS_DISPLAY = 12; // Số lượng repo hiển thị mặc định trước khi nhấn "Xem thêm"
const FAKE_EVAL_DELAY_MS = 2500; // Thời gian chờ (ms) mô phỏng đánh giá AI

// --- Hàm Sleep (cho Fake AI) ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================================
// === CÁC COMPONENT CON TÁI SỬ DỤNG CAO CẤP ===
// Component này được thiết kế để tái sử dụng và dễ bảo trì.
// ==========================================================

/**
 * ProfileHeaderCard: Hiển thị thông tin cơ bản của sinh viên ở đầu trang.
 * Bao gồm avatar, tên, username GitHub, bio, và các liên kết (nếu có).
 * Có hiệu ứng nền và hover tinh tế.
 * @param {object} profile - Object chứa thông tin profile lấy từ API.
 */
const ProfileHeaderCard = React.memo(({ profile }) => {
    // Memo Hóa component để tránh re-render không cần thiết khi props không đổi.
    if (!profile) return null; // Trả về null nếu không có profile

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }} // Animation khi xuất hiện
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-700/80 text-center shadow-xl relative overflow-hidden group backdrop-blur-sm bg-opacity-80"
        >
            {/* Decorative background blobs - Hiệu ứng nền mờ ảo */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-blue-600/15 via-transparent to-transparent rounded-full filter blur-3xl opacity-50 -translate-x-1/4 -translate-y-1/4 animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-radial from-purple-600/15 via-transparent to-transparent rounded-full filter blur-3xl opacity-60 translate-x-1/4 translate-y-1/4 animate-pulse-slow animation-delay-3000"></div>

            {/* Nội dung chính của card */}
            <div className="relative z-10">
                {/* Avatar */}
                <motion.img
                    src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.githubUsername)}&background=4C51BF&size=128&font-size=0.35&bold=true&color=ffffff`} // Avatar dự phòng với màu sắc đẹp hơn
                    alt={`${profile.name || profile.githubUsername}'s Avatar`}
                    className="w-32 h-32 lg:w-36 lg:h-36 rounded-full border-4 border-gray-600/70 mx-auto mb-5 shadow-lg object-cover bg-gray-700" // Thêm bg dự phòng
                    whileHover={{ scale: 1.05, rotate: 2, transition: { duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }} // Hiệu ứng springy
                />
                {/* Tên và Username GitHub */}
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1.5">{profile.name || profile.githubUsername}</h1>
                <a
                    href={`https://github.com/${profile.githubUsername}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 inline-flex items-center gap-1.5 group/link text-lg"
                >
                    <Github className="w-5 h-5" />
                    <span>@{profile.githubUsername}</span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 ml-0.5" />
                </a>
                {/* Bio */}
                <p className="mt-6 text-gray-300 max-w-xl mx-auto text-sm leading-relaxed px-2">
                    {profile.bio || <span className="italic opacity-70">Người dùng này chưa cập nhật tiểu sử trên GitHub.</span>}
                </p>
                {/* Các liên kết bổ sung (ví dụ) - Chỉ hiển thị nếu có dữ liệu */}
                {/* <div className="mt-6 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-gray-400 text-xs">
                       {profile.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {profile.location}</span>}
                       {profile.website && <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400"><LinkIcon className="w-4 h-4"/> Portfolio</a>}
                       {profile.email && <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-blue-400"><Mail className="w-4 h-4"/> Liên hệ</a>}
                  </div> */}
            </div>
            {/* CSS nội bộ cho animation (scoped) */}
            <style jsx>{`
                .animate-pulse-slow { animation: pulse-opacity 5s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate; }
                .animation-delay-3000 { animation-delay: 3s; }
                @keyframes pulse-opacity {
                    0% { opacity: 0.3; transform: scale(0.95); }
                    100% { opacity: 0.6; transform: scale(1.05); }
                }
            `}</style>
        </motion.div>
    );
});
ProfileHeaderCard.displayName = 'ProfileHeaderCard'; // Tên hiển thị trong React DevTools


/**
 * SkillsRadarSection: Hiển thị biểu đồ radar kỹ năng AI-Verified.
 * @param {Array<object>} skills - Mảng các skill object [{ skill_name, score }].
 */
const CustomRadarTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-gray-700/80 backdrop-blur-sm border border-gray-600 rounded-md shadow-lg px-3 py-1.5 text-xs">
                <p className="font-semibold text-blue-300">{data.skill_name}</p>
                <p className="text-gray-200">Điểm: <span className="font-bold">{data.score}</span> / 100</p>
            </div>
        );
    }
    return null;
};
const SkillsRadarSection = React.memo(({ skills }) => {
    // Sắp xếp skills theo alphabet để biểu đồ trông ổn định hơn
    const sortedSkills = useMemo(() => skills ? [...skills].sort((a, b) => a.skill_name.localeCompare(b.skill_name)) : [], [skills]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="bg-gray-800 p-6 rounded-2xl border border-gray-700/80 shadow-lg backdrop-blur-sm bg-opacity-80" // Thêm backdrop
        >
            <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2.5">
                <Award className="w-6 h-6 text-yellow-400" /> Hồ sơ năng lực AI-Verified
            </h2>
            {sortedSkills && sortedSkills?.length > 0 ? (
                <div className="h-[300px] w-full"> {/* Đảm bảo width 100% */}
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={sortedSkills} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <PolarGrid stroke="#4B5563" strokeDasharray="3 3" />
                            <PolarAngleAxis
                                dataKey="skill_name"
                                stroke="#9CA3AF"
                                tick={{ fontSize: 11, fill: '#D1D5DB' }}
                                tickLine={false} // Ẩn gạch nối từ tâm ra
                            // Custom tick formatter nếu tên quá dài (tùy chọn)
                            // tickFormatter={(value) => value?.length > 12 ? `${value.substring(0, 10)}...` : value}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} /> {/* Ẩn trục điểm */}
                            <Radar name="Điểm" dataKey="score" stroke="#60A5FA" fill="#3B82F6" fillOpacity={0.7} strokeWidth={1.5} />
                            <RechartsTooltip content={<CustomRadarTooltip />} cursor={{ stroke: '#60A5FA', strokeWidth: 1, strokeDasharray: '3 3', fill: 'rgba(59, 130, 246, 0.1)' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="text-center py-10">
                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 italic text-sm">Chưa có kỹ năng nào được xác thực.</p>
                    {/* Có thể thêm nút gợi ý phân tích repo nếu là owner */}
                    {/* <p className="text-xs text-gray-600 mt-1">(Hãy thử phân tích một dự án GitHub)</p> */}
                </div>
            )}
        </motion.div>
    );
});
SkillsRadarSection.displayName = 'SkillsRadarSection';

/**
 * RepoCard: Hiển thị thông tin cơ bản của một repo GitHub.
 * @param {object} repo - Object repo từ GitHub API.
 * @param {function} onClick - Callback khi click vào card (để phân tích).
 * @param {boolean} isOwnerOrRecruiter - Cho biết người xem có quyền phân tích repo không.
 */
const RepoCard = React.memo(({ repo, onClick, isOwnerOrRecruiter }) => (
    <motion.div
        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
        whileHover={{ scale: 1.02, boxShadow: "0px 8px 20px rgba(59, 130, 246, 0.15)" }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`relative text-left w-full bg-gradient-to-br from-gray-800 to-gray-800/60 p-5 rounded-xl border border-gray-700/80 transition group shadow-md hover:border-blue-600/60 backdrop-blur-sm ${isOwnerOrRecruiter ? 'cursor-pointer' : ''}`}
        onClick={isOwnerOrRecruiter ? onClick : undefined} // Chỉ cho phép click để phân tích nếu có quyền
        role={isOwnerOrRecruiter ? "button" : undefined}
        tabIndex={isOwnerOrRecruiter ? 0 : -1}
        aria-label={isOwnerOrRecruiter ? `Phân tích repository ${repo.name}` : `Xem repository ${repo.name} trên GitHub`}
    >
        <div className="flex justify-between items-start mb-2">
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" title={`Xem ${repo.name} trên GitHub`} onClick={(e) => e.stopPropagation()} className="font-semibold text-lg text-blue-400 hover:text-blue-300 transition line-clamp-1 flex-grow mr-4 group/link inline-flex items-center gap-1.5">
                <Github className="w-4 h-4 flex-shrink-0" /> <span className="truncate">{repo.name}</span> <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
            </a>
            <span className="text-xs text-yellow-400 flex items-center gap-1 flex-shrink-0 pt-1"> <Star className="w-3.5 h-3.5" /> {repo.stargazers_count ?? 0} </span>
        </div>
        <p className="text-gray-400 text-sm h-12 line-clamp-2 mb-4">{repo.description || <span className="italic opacity-70">Không có mô tả.</span>}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-700 pt-3">
            <span>{repo.language || 'N/A'}</span>
            <span>Cập nhật: {new Date(repo.updated_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
        {isOwnerOrRecruiter && (
            <button
                // onClick đã được xử lý ở div cha, button này chỉ để hiển thị
                className="absolute bottom-4 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:opacity-100 flex items-center gap-1.5 transform group-hover:scale-100 scale-95 pointer-events-none" // pointer-events-none để click xuyên qua
                aria-hidden="true" // Ẩn khỏi trình đọc màn hình vì div cha đã xử lý
            >
                <BrainCircuit className="w-3.5 h-3.5" /> Phân tích
            </button>
        )}
    </motion.div>
));
RepoCard.displayName = 'RepoCard';

/**
 * AnalysisResultModal: Hiển thị kết quả phân tích AI (giả lập).
 * @param {object} repo - Repo đang được phân tích.
 * @param {function} onClose - Hàm đóng modal.
 * @param {object|null} analysisResult - Kết quả phân tích từ backend.
 * @param {boolean} isAnalyzing - Cờ báo đang phân tích.
 * @param {string} analysisError - Thông báo lỗi nếu có.
 * @param {function} onRetry - Hàm gọi lại để thử phân tích lại.
 * @param {boolean} isOwner - Người xem có phải chủ hồ sơ không.
 */
const AnalysisResultModal = React.memo(({ repo, onClose, analysisResult, isAnalyzing, analysisError, onRetry, isOwner }) => {
    // State quản lý text và progress bar loading
    const loadingTexts = useMemo(() => [
        "Đang kết nối tới kho lưu trữ...",
        "Phân tích cấu trúc thư mục...",
        "Đọc mã nguồn (điều này có thể mất vài giây)...",
        "Xác định các ngôn ngữ và thư viện chính...",
        "Đánh giá chất lượng mã và các patterns...",
        "Phát hiện các kỹ năng tiềm ẩn...",
        "Tổng hợp kết quả phân tích...",
        "Chuẩn bị báo cáo cuối cùng..."
    ], []);
    const [currentLoadingText, setCurrentLoadingText] = useState(loadingTexts[0]);
    const [progress, setProgress] = useState(0);

    // Effect quản lý animation loading
    useEffect(() => {
        let textIntervalId;
        let progressIntervalId;
        if (isAnalyzing) {
            let textIndex = 0;
            textIntervalId = setInterval(() => {
                textIndex = (textIndex + 1) % loadingTexts?.length;
                setCurrentLoadingText(loadingTexts[textIndex]);
            }, 600); // Đổi text sau mỗi 600ms

            let currentProgress = 0;
            const totalSteps = 20; // Số bước để đạt 100%
            progressIntervalId = setInterval(() => {
                currentProgress += 1;
                const calculatedProgress = Math.min(100, Math.round((currentProgress / totalSteps) * 100));
                setProgress(calculatedProgress);
                if (currentProgress >= totalSteps) {
                    // Giữ ở 99% cho đến khi có kết quả thật
                    setProgress(99);
                    clearInterval(progressIntervalId);
                }
            }, 300); // Tăng progress sau mỗi 300ms
        } else {
            setProgress(100); // Hoàn thành progress khi không còn analyzing
        }
        // Cleanup function
        return () => { clearInterval(textIntervalId); clearInterval(progressIntervalId); setProgress(0); setCurrentLoadingText(loadingTexts[0]); };
    }, [isAnalyzing, loadingTexts]);

    // Format lời khuyên để hiển thị đẹp hơn
    const formattedAdvice = useMemo(() => {
        if (!analysisResult?.career_advice) return null;
        // Tách thành các đoạn dựa trên xuống dòng kép
        return analysisResult.career_advice.split('\n\n')?.map((paragraph, index) => (
            <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
        ));
    }, [analysisResult?.career_advice]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[100] p-4 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div className="p-5 border-b border-gray-700 flex justify-between items-center flex-shrink-0 bg-gray-800/80 backdrop-blur-sm">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"> <BrainCircuit className="w-6 h-6 text-purple-400" /> Phân tích Dự án bằng AI </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"> <X className="w-6 h-6" /> </button>
                </div>

                {/* Content Modal */}
                <div className="p-6 md:p-8 overflow-y-auto flex-grow styled-scrollbar">
                    {/* Repo Name */}
                    <div className="mb-6 pb-4 border-b border-gray-700">
                        <a href={repo?.html_url} target="_blank" rel="noopener noreferrer" className="text-2xl font-semibold text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-2 group">
                            <Github className="w-5 h-5" /> {repo?.full_name || 'Đang tải...'} <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>
                    {/* Loading State */}
                    {isAnalyzing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10">
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3, ease: "linear" }}
                                />
                            </div>
                            {/* Loading Text */}
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentLoadingText}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-gray-400 italic text-sm"
                                >
                                    {currentLoadingText}
                                </motion.p>
                            </AnimatePresence>
                        </motion.div>
                    )}
                    {/* Error State */}
                    {analysisError && !isAnalyzing && <ErrorDisplay message={analysisError} onRetry={isOwner ? onRetry : undefined} />} {/* Chỉ owner mới retry được */}
                    {/* Result State */}
                    {analysisResult && !isAnalyzing && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                            {/* Summary & Score */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                <div className="md:col-span-8">
                                    <h3 className="font-semibold text-white mb-2 text-lg">📝 Tóm tắt Phân tích</h3>
                                    <p className="text-gray-300 text-sm leading-relaxed italic">"{analysisResult.summary}"</p>
                                </div>
                                <div className="md:col-span-4 flex flex-col items-center justify-center bg-gray-700/50 p-6 rounded-lg border border-gray-600/50">
                                    <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{analysisResult.overall_score}</div>
                                    <div className="text-gray-400 text-sm uppercase tracking-wider mt-1">Overall Score</div>
                                </div>
                            </div>
                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-900/40 p-5 rounded-lg border border-gray-700">
                                    <h4 className="font-semibold text-green-400 mb-3 text-md flex items-center gap-2"><ClipboardCheck className="w-5 h-5" /> Điểm mạnh</h4>
                                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1.5 marker:text-green-500">
                                        {analysisResult.strengths?.map((item, i) => <li key={`strength-${i}`}>{item}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-gray-900/40 p-5 rounded-lg border border-gray-700">
                                    <h4 className="font-semibold text-yellow-400 mb-3 text-md flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Cần cải thiện</h4>
                                    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1.5 marker:text-yellow-500">
                                        {analysisResult.weaknesses?.map((item, i) => <li key={`weakness-${i}`}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                            {/* Detected Skills */}
                            <div>
                                <h4 className="font-semibold text-white mb-4 text-lg">🛠️ Kỹ năng được xác thực</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {analysisResult.detected_skills?.map((skill, i) => (
                                        <motion.div
                                            key={`skill-${i}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-blue-900/80 text-blue-300 text-xs font-medium px-3 py-1.5 rounded-full flex items-center shadow-sm border border-blue-700/50"
                                        >
                                            {skill.skill_name}
                                            <span className="ml-2 bg-blue-400 text-gray-900 text-[11px] font-bold rounded-full px-2 py-0.5">{skill.score}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            {/* Lời khuyên Sự nghiệp */}
                            {formattedAdvice && (
                                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 mt-6">
                                    <h4 className="font-semibold text-white mb-4 text-lg flex items-center gap-2">
                                        <MessageSquareText className="w-5 h-5 text-purple-300" /> Lời khuyên Phát triển Sự nghiệp
                                    </h4>
                                    <div className="text-gray-300 text-sm space-y-3 leading-relaxed prose prose-sm prose-invert max-w-none">
                                        {formattedAdvice}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div> {/* End Content */}
            </motion.div>
        </div>
    );
});
AnalysisResultModal.displayName = 'AnalysisResultModal';


/**
 * FakeEvaluationModal: Modal hiển thị đánh giá giả lập của AI cho NTD.
 * @param {object} student - Object profileData của sinh viên đang xem.
 * @param {function} onClose - Hàm đóng modal.
 */
// --- HÀM GIẢ LẬP ĐÁNH GIÁ ---
// Hàm này tạo ra một đánh giá giả lập dựa trên thông tin profile
const generateFakeEvaluation = (profileData) => {
    console.log("[Fake Eval v2.4.2 - Frontend Copy] Generating structured fake evaluation...");
    let score = 60 + Math.floor(Math.random() * 30);
    let evaluation = {
        overall: null,
        sections: [],
        finalVerdict: null,
        disclaimer: "(Lưu ý: Đây là đánh giá nhanh do AI giả lập tạo ra dựa trên thông tin có sẵn. Nhà tuyển dụng cần tự đánh giá chi tiết hơn.)"
    };

    if (!profileData || !profileData.profile) {
        evaluation.overall = "Không đủ thông tin hồ sơ để đánh giá.";
        console.warn("[Fake Eval v2.4.2] Missing profileData or profileData.profile");
        return { score: 50, evaluation };
    }

    // Destructure dữ liệu từ profileData một cách an toàn
    const profile = profileData.profile || {}; // Đảm bảo profile là object
    const skills = profileData.skills || [];
    const repos = profileData.repos || [];
    const experiences = profileData.experiences || [];
    const education = profileData.education || [];

    // Tăng/giảm điểm
    if (skills?.length > 5) score = Math.min(100, score + 6); else if (skills?.length === 0) score -= 5;
    if (repos?.length > 5) score = Math.min(100, score + 4);
    if (experiences?.length > 0) score = Math.min(100, score + 7); else score -= 3;
    if (education?.length > 0) score = Math.min(100, score + 3);

    // Section 1: Đánh giá Tổng quan
    evaluation.overall = `Ứng viên thể hiện tiềm năng ${score > 85 ? 'rất tốt' : (score > 70 ? 'khá tốt' : 'trung bình')}. Cần xem xét thêm các yếu tố chi tiết.`;

    // Section 2: Kỹ năng (AI-Verified)
    let skillSection = { title: "Kỹ năng (AI-Verified)", points: [] };
    if (skills?.length > 0) {
        const avgScore = skills?.length > 0 ? Math.round(skills.reduce((sum, s) => sum + (s.score || 0), 0) / skills?.length) : 0;
        skillSection.points.push(`Có ${skills?.length} kỹ năng được AI xác thực, điểm trung bình ~${avgScore}/100.`);
        const topSkill = [...skills].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
        if (topSkill) skillSection.points.push(`Nổi bật: ${topSkill.skill_name} (${topSkill.score || 'N/A'} điểm).`);
        if (skills?.length < 3) skillSection.points.push("Cần bổ sung thêm kỹ năng được xác thực.");
    } else {
        skillSection.points.push("Chưa có kỹ năng nào được AI xác thực. Đây là điểm cần cải thiện lớn.");
    }
    evaluation.sections.push(skillSection);

    // Section 3: Dự án GitHub
    let repoSection = { title: "Dự án GitHub", points: [] };
    if (repos?.length > 0) {
        repoSection.points.push(`Có ${repos?.length} dự án public.`);
        const recentRepo = [...repos].sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())[0];
        if (recentRepo) repoSection.points.push(`Dự án "${recentRepo.name}" được cập nhật gần đây nhất.`);
        if (repos.some(r => r.stargazers_count > 10)) { score = Math.min(100, score + 2); repoSection.points.push("Có dự án nhận được sự chú ý nhất định (stars > 10)."); }
        if (repos?.length < 3) repoSection.points.push("Số lượng dự án còn khá ít.");
    } else {
        repoSection.points.push("Không có dự án public nào.");
    }
    evaluation.sections.push(repoSection);

    // Section 4: Kinh nghiệm làm việc
    let expSection = { title: "Kinh nghiệm làm việc", points: [] };
    if (experiences?.length > 0) {
        expSection.points.push(`Đã có ${experiences?.length} kinh nghiệm được ghi nhận.`);
        const latestExp = experiences[0]; // Assume sorted
        expSection.points.push(`${latestExp.isCurrent ? 'Hiện tại:' : 'Gần nhất:'} ${latestExp.title || 'N/A'} tại ${latestExp.company || 'N/A'}.`);
        if (experiences.some(exp => exp.description?.length > 100)) expSection.points.push("Mô tả kinh nghiệm khá chi tiết.");
    } else {
        expSection.points.push("Chưa có kinh nghiệm làm việc thực tế được liệt kê.");
    }
    evaluation.sections.push(expSection);

    // Section 5: Học vấn
    let eduSection = { title: "Học vấn", points: [] };
    if (education?.length > 0) {
        const latestEdu = education[0]; // Assume sorted
        eduSection.points.push(`${latestEdu.isCurrent ? 'Đang theo học' : 'Đã tốt nghiệp'} ${latestEdu.degree || 'N/A'} - ${latestEdu.fieldOfStudy || 'N/A'} tại ${latestEdu.school || 'N/A'}.`);
        if (latestEdu.grade) eduSection.points.push(`GPA: ${latestEdu.grade} (tham khảo).`);
    } else {
        eduSection.points.push("Chưa có thông tin học vấn.");
    }
    evaluation.sections.push(eduSection);


    // Section 6: Nhận xét cuối cùng
    if (score >= 85) {
        evaluation.finalVerdict = `Tiềm năng cao. Kỹ năng và kinh nghiệm (nếu có) tốt. Đề xuất: Nên mời phỏng vấn.`;
    } else if (score >= 70) {
        evaluation.finalVerdict = `Khá tiềm năng. Cần xem xét kỹ hơn về chất lượng dự án và chi tiết kinh nghiệm. Đề xuất: Cân nhắc vào vòng tiếp theo.`;
    } else {
        evaluation.finalVerdict = `Hồ sơ cơ bản hoặc thiếu thông tin quan trọng. Cần thêm minh chứng về năng lực (dự án, skills AI). Đề xuất: Xem xét thêm hoặc bỏ qua tùy vị trí.`;
    }

    score = Math.max(40, Math.min(score, 99));
    console.log("[Fake Eval v2.4.2 - Frontend Copy] Generated structured evaluation:", { score, evaluation });
    return { score, evaluation }; // Trả về object có cấu trúc
};


/** Modal Đánh giá (Đã sửa lại cách gọi generateFakeEvaluation) */
const FakeEvaluationModal = React.memo(({ student, onClose }) => { // Prop 'student' ở đây chính là profileData
    const [isLoading, setIsLoading] = useState(true);
    const [evaluationResult, setEvaluationResult] = useState(null); // { score: number, evaluation: object }
    useEffect(() => {
        const performFakeEvaluation = async () => {
            setIsLoading(true);
            setEvaluationResult(null);
            const delayMs = Math.floor(Math.random() * (FAKE_EVAL_DELAY_MS - 1000 + 1)) + 1000;
            await sleep(delayMs);

            try {
                const result = generateFakeEvaluation(student); // Truyền toàn bộ profileData
                setEvaluationResult(result);
            } catch (error) {
                console.error("Error generating fake evaluation:", error);
                // Cập nhật để hiển thị lỗi rõ hơn trong modal
                setEvaluationResult({ score: 0, evaluation: { overall: "Lỗi tạo đánh giá", sections: [{ title: "Chi tiết lỗi", points: [error.message || "Lỗi không xác định"] }], finalVerdict: "Vui lòng thử lại.", disclaimer: "" } });
            } finally {
                setIsLoading(false);
            }
        };
        // *** SỬA ĐIỀU KIỆN KIỂM TRA ***
        // Cũ: if (student?.profile) {
        // Mới: Kiểm tra cả student và student.profile
        if (student && student.profile) {
            performFakeEvaluation();
        } else {
            console.error("FakeEvaluationModal: student or student.profile is missing!");
            setIsLoading(false);
            setEvaluationResult({ score: 0, evaluation: { overall: "Thiếu thông tin hồ sơ để đánh giá.", sections: [], finalVerdict: "", disclaimer: "" } });
        }
    }, [student]);

    const getSectionIcon = (title) => { /* ... (giữ nguyên) ... */
        if (title.includes("Kỹ năng")) return <Award className="w-5 h-5 text-yellow-400 mr-2 shrink-0" />;
        if (title.includes("GitHub")) return <Github className="w-5 h-5 text-blue-400 mr-2 shrink-0" />;
        if (title.includes("Kinh nghiệm")) return <Briefcase className="w-5 h-5 text-purple-400 mr-2 shrink-0" />;
        if (title.includes("Học vấn")) return <GraduationCap className="w-5 h-5 text-green-400 mr-2 shrink-0" />;
        return <Info className="w-5 h-5 text-gray-400 mr-2 shrink-0" />;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[110] p-4 backdrop-blur-md" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gradient-to-b from-gray-800 to-gray-800/90 rounded-xl border border-gray-700 w-full max-w-3xl flex flex-col overflow-hidden shadow-2xl max-h-[90vh]"
                onClick={e => e.stopPropagation()}>
                {/* Header Modal */}
                <div className="p-5 border-b border-gray-700/80 flex justify-between items-center flex-shrink-0 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2.5"> <ClipboardCheck className="w-6 h-6 text-green-400" /> Đánh giá Nhanh (AI Giả Lập) </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition rounded-full p-1.5 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-700"> <X className="w-5 h-5" /> </button>
                </div>
                {/* Content Modal */}
                <div className="p-6 md:p-8 overflow-y-auto flex-grow styled-scrollbar">
                    {/* Thông tin Sinh viên */}
                    <div className="mb-6 pb-5 border-b border-gray-700/80 flex items-center gap-4">
                        <img src={student?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.profile?.githubUsername || '?')}&background=random`} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-gray-600 shadow-md" />
                        <div>
                            <p className="text-xl font-semibold text-blue-300">{student?.profile?.name || student?.profile?.githubUsername}</p>
                            <a href={`https://github.com/${student?.profile?.githubUsername}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-blue-400 transition inline-flex items-center gap-1"> @{student?.profile?.githubUsername} <ExternalLink size={14} /> </a>
                        </div>
                    </div>
                    {/* Loading hoặc Kết quả */}
                    {isLoading ? (<div className="py-20"> <LoadingSpinner text="AI đang phân tích hồ sơ và đưa ra đánh giá..." size="md" /> </div>)
                        : evaluationResult ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {/* Điểm số & Đánh giá tổng quan */}
                                <div className="text-center bg-gradient-to-br from-gray-700/60 to-gray-700/30 p-6 rounded-lg border border-gray-600/60 shadow-inner backdrop-blur-sm">
                                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-widest font-medium">Điểm Đánh giá Tổng quan</p>
                                    <p className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 mb-3">{evaluationResult.score}<span className="text-3xl text-gray-500 font-normal">/100</span></p>
                                    <p className="text-sm text-gray-300 italic max-w-md mx-auto">{evaluationResult.evaluation?.overall || "Không có đánh giá tổng quan."}</p>
                                </div>
                                {/* Nhận xét Chi tiết theo Sections */}
                                <div className="space-y-5">
                                    <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2 mb-4 flex items-center gap-2"><MessageSquareText className="w-5 h-5" /> Nhận xét Chi tiết:</h3>
                                    {evaluationResult.evaluation?.sections?.map((section, index) => (
                                        section.points && section.points?.length > 0 && (
                                            <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }} className="bg-gray-900/40 p-4 rounded-lg border border-gray-700/80">
                                                <h4 className="font-semibold text-blue-300 mb-2.5 text-md flex items-center"> {getSectionIcon(section.title)} {section.title} </h4>
                                                <ul className="list-disc list-outside text-gray-400 text-sm space-y-1.5 pl-5 marker:text-gray-600"> {section.points?.map((point, pIndex) => (<li key={pIndex}>{point}</li>))} </ul>
                                            </motion.div>
                                        )
                                    ))}
                                    {/* Hiển thị nếu không có section nào có nội dung */}
                                    {(!evaluationResult.evaluation?.sections || evaluationResult.evaluation.sections.every(s => !s.points || s.points?.length === 0)) && (
                                        <p className="text-gray-500 italic text-center text-sm py-4">Không có nhận xét chi tiết nào.</p>
                                    )}
                                </div>
                                {/* Nhận xét Cuối cùng */}
                                {evaluationResult.evaluation?.finalVerdict && (
                                    <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-5 rounded-lg border border-purple-700/50 mt-8 shadow-lg">
                                        <h4 className="font-semibold text-purple-300 mb-2 text-md flex items-center gap-2"><UserCheck className="w-5 h-5" /> Đề xuất:</h4>
                                        <p className="text-gray-300 text-sm font-medium">{evaluationResult.evaluation.finalVerdict}</p>
                                    </div>
                                )}
                                {/* Disclaimer */}
                                {evaluationResult.evaluation?.disclaimer && (<p className="text-xs text-gray-500 italic text-center pt-4 border-t border-gray-700/50 mt-8">{evaluationResult.evaluation.disclaimer}</p>)}
                            </motion.div>
                        ) : (<ErrorDisplay message="Không thể tạo đánh giá." />)}
                </div>
                {/* Footer Modal */}
                <div className="p-4 border-t border-gray-700/80 flex justify-end bg-gray-800/70 backdrop-blur-sm flex-shrink-0 sticky bottom-0 z-10">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="py-2 px-6 bg-gray-600 rounded-md hover:bg-gray-500 transition text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"> Đóng </motion.button>
                </div>
            </motion.div>
            <style jsx>{/* CSS for pulse */}</style>
        </div>
    );
});
FakeEvaluationModal.displayName = 'FakeEvaluationModal';


/** Modal Thêm/Sửa Item (ProfileItemModal) (Hoàn Chỉnh) */
/**
 * ProfileItemModal: Modal đa năng dùng để Thêm hoặc Sửa thông tin
 * Kinh nghiệm làm việc (Work Experience) hoặc Học vấn (Education).
 * Component này bao gồm form nhập liệu, validation, và xử lý submit.
 * @param {object|null} item - Dữ liệu của item đang được sửa (null nếu là thêm mới).
 * @param {function} onSave - Callback function được gọi khi nhấn nút Lưu (truyền dữ liệu form đã validate).
 * @param {function} onClose - Callback function được gọi khi nhấn nút Hủy hoặc click ra ngoài modal.
 * @param {'experience'|'education'} type - Loại thông tin đang được xử lý.
 * @param {boolean} isLoading - Cờ báo trạng thái đang lưu dữ liệu (để disable nút Lưu).
 */
const ProfileItemModal = React.memo(({ item, onSave, onClose, type, isLoading }) => {
    // Xác định xem modal đang dùng cho Experience hay Education
    const isExperience = useMemo(() => type === 'experience', [type]);

    // Khởi tạo state ban đầu cho form, dựa vào `item` (nếu đang sửa) hoặc giá trị rỗng (nếu thêm mới)
    const initialState = useMemo(() => {
        // Định dạng ngày tháng về YYYY-MM-DD cho input type="date"
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            try {
                return new Date(dateString).toISOString().split('T')[0];
            } catch (e) {
                return ''; // Trả về rỗng nếu ngày không hợp lệ
            }
        };

        if (isExperience) {
            return {
                title: item?.title || '',
                company: item?.company || '',
                location: item?.location || '',
                startDate: formatDateForInput(item?.startDate),
                endDate: formatDateForInput(item?.endDate), // Sẽ là '' nếu endDate là null
                description: item?.description || ''
            };
        } else { // Education
            return {
                school: item?.school || '',
                degree: item?.degree || '',
                fieldOfStudy: item?.fieldOfStudy || '',
                startDate: formatDateForInput(item?.startDate),
                endDate: formatDateForInput(item?.endDate),
                grade: item?.grade || '',
                description: item?.description || ''
            };
        }
    }, [item, isExperience]); // Recalculate only when item or type changes

    // State lưu trữ dữ liệu người dùng nhập vào form
    const [formData, setFormData] = useState(initialState);
    // State lưu trữ các lỗi validation của form
    const [errors, setErrors] = useState({});

    /**
     * Xử lý khi giá trị của một input/textarea trong form thay đổi.
     * Cập nhật state `formData` và xóa lỗi validation của trường đó (nếu có).
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - Sự kiện change.
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Xóa lỗi của trường đang được sửa
        if (errors[name]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]); // Dependency là errors để có thể xóa lỗi

    /**
     * Thực hiện validation cho toàn bộ form data.
     * @returns {boolean} True nếu form hợp lệ, False nếu có lỗi.
     */
    const validateForm = useCallback(() => {
        const newErrors = {};
        const requiredFieldMessage = "Trường này là bắt buộc.";

        // --- Validation cho Experience ---
        if (isExperience) {
            if (!formData.title?.trim()) newErrors.title = requiredFieldMessage;
            if (!formData.company?.trim()) newErrors.company = requiredFieldMessage;
        }
        // --- Validation cho Education ---
        else {
            if (!formData.school?.trim()) newErrors.school = requiredFieldMessage;
            if (!formData.degree?.trim()) newErrors.degree = requiredFieldMessage;
            if (!formData.fieldOfStudy?.trim()) newErrors.fieldOfStudy = requiredFieldMessage;
        }

        // --- Validation chung cho Ngày tháng ---
        if (!formData.startDate) {
            newErrors.startDate = "Ngày bắt đầu là bắt buộc.";
        } else {
            // Kiểm tra endDate phải sau startDate (nếu endDate có giá trị)
            if (formData.endDate && formData.startDate > formData.endDate) {
                newErrors.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.";
            }
            // Kiểm tra ngày bắt đầu không được ở tương lai (tùy chọn)
            // const today = new Date().toISOString().split('T')[0];
            // if (formData.startDate > today) {
            //     newErrors.startDate = "Ngày bắt đầu không được ở tương lai.";
            // }
        }

        // --- (Tùy chọn) Validation khác ---
        // Ví dụ: Kiểm tra định dạng GPA cho Education
        // if (!isExperience && formData.grade && !/^\d+(\.\d{1,2})?$/.test(formData.grade)) {
        //     newErrors.grade = "Điểm GPA không hợp lệ (VD: 3.5, 3.75).";
        // }

        setErrors(newErrors); // Cập nhật state errors
        return Object.keys(newErrors)?.length === 0; // Trả về true nếu không có lỗi
    }, [formData, isExperience]); // Dependency là formData và isExperience

    /**
     * Xử lý khi form được submit (nhấn nút Lưu).
     * Ngăn chặn hành vi mặc định, thực hiện validation, và gọi callback `onSave` nếu hợp lệ.
     * @param {React.FormEvent<HTMLFormElement>} e - Sự kiện submit form.
     */
    const handleSubmit = useCallback((e) => {
        e.preventDefault(); // Ngăn trang reload
        console.log("[ProfileItemModal] Form submitted. Validating...");
        if (validateForm()) { // Thực hiện validation
            console.log("[ProfileItemModal] Validation passed. Calling onSave with data:", formData);
            // Chuẩn bị dữ liệu gửi đi (ví dụ: chuyển endDate rỗng thành null)
            const dataToSend = {
                ...formData,
                endDate: formData.endDate || null, // Chuyển chuỗi rỗng thành null cho CSDL
            };
            onSave(dataToSend); // Gọi callback onSave từ component cha
        } else {
            console.log("[ProfileItemModal] Validation failed. Errors:", errors);
            // Lỗi sẽ tự động hiển thị dưới các input
        }
    }, [formData, validateForm, onSave, errors]); // Dependencies

    // --- JSX Render ---
    return (
        // Backdrop mờ bao phủ toàn màn hình
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[90] p-4 backdrop-blur-sm"
            onClick={onClose} // Đóng modal khi click ra ngoài
            role="dialog" // Accessibility
            aria-modal="true" // Accessibility
            aria-labelledby="profile-item-modal-title" // Accessibility
        >
            {/* Container của Modal với animation */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: -20 }} // Animation vào
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }} // Animation ra
                transition={{ type: "spring", stiffness: 400, damping: 35 }} // Hiệu ứng springy
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-xl flex flex-col overflow-hidden max-h-[90vh]" // Giới hạn chiều cao tối đa
                onClick={e => e.stopPropagation()} // Ngăn click bên trong modal đóng modal
            >
                {/* Header Modal */}
                <div className="p-5 border-b border-gray-700 flex justify-between items-center flex-shrink-0 bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                    <h2 id="profile-item-modal-title" className="text-xl font-bold text-white">
                        {item ? `Chỉnh sửa ${isExperience ? 'Kinh nghiệm Làm việc' : 'Quá trình Học vấn'}` : `Thêm ${isExperience ? 'Kinh nghiệm mới' : 'Học vấn mới'}`}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        aria-label="Đóng modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content (có thể cuộn nếu nội dung dài) */}
                <form onSubmit={handleSubmit} noValidate> {/* noValidate để tắt validation mặc định của trình duyệt */}
                    <div className="p-6 space-y-5 overflow-y-auto styled-scrollbar"> {/* Thêm padding và scroll */}
                        {/* Render các trường input dựa trên loại modal (Experience/Education) */}
                        {isExperience ? (
                            <>
                                <FormInput id="exp-title" name="title" label="Chức danh *" value={formData.title} onChange={handleChange} error={errors.title} placeholder="VD: Lập trình viên Frontend" required />
                                <FormInput id="exp-company" name="company" label="Công ty *" value={formData.company} onChange={handleChange} error={errors.company} placeholder="VD: FPT Software" required />
                                <FormInput id="exp-location" name="location" label="Địa điểm" value={formData.location} onChange={handleChange} error={errors.location} placeholder="VD: Hà Nội, Việt Nam" />
                            </>
                        ) : (
                            <>
                                <FormInput id="edu-school" name="school" label="Tên trường / Tổ chức *" value={formData.school} onChange={handleChange} error={errors.school} placeholder="VD: Đại học Bách Khoa Hà Nội" required />
                                <FormInput id="edu-degree" name="degree" label="Bằng cấp *" value={formData.degree} onChange={handleChange} error={errors.degree} placeholder="VD: Kỹ sư Công nghệ Thông tin" required />
                                <FormInput id="edu-fieldOfStudy" name="fieldOfStudy" label="Chuyên ngành *" value={formData.fieldOfStudy} onChange={handleChange} error={errors.fieldOfStudy} placeholder="VD: Khoa học Máy tính" required />
                                <FormInput id="edu-grade" name="grade" label="Điểm GPA (tùy chọn)" value={formData.grade} onChange={handleChange} error={errors.grade} placeholder="VD: 3.6/4.0" />
                            </>
                        )}

                        {/* Input Ngày Bắt đầu và Kết thúc (chung cho cả 2 loại) */}
                        <div className="flex flex-col sm:flex-row gap-5">
                            {/* Start Date */}
                            <div className="flex-1">
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1.5">Ngày bắt đầu *</label>
                                <input id="startDate" type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={`w-full p-3 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 transition duration-200 text-white ${errors.startDate ? 'border-red-500 ring-red-500/50' : 'border-gray-600 hover:border-gray-500 focus:ring-blue-500 focus:border-transparent'}`} required aria-invalid={!!errors.startDate} aria-describedby={errors.startDate ? "startDate-error" : undefined} />
                                {errors.startDate && <p id="startDate-error" className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.startDate}</p>}
                            </div>
                            {/* End Date */}
                            <div className="flex-1">
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1.5">Ngày kết thúc</label>
                                <input id="endDate" type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={`w-full p-3 bg-gray-700 border rounded-md focus:outline-none focus:ring-2 transition duration-200 text-white ${errors.endDate ? 'border-red-500 ring-red-500/50' : 'border-gray-600 hover:border-gray-500 focus:ring-blue-500 focus:border-transparent'}`} aria-invalid={!!errors.endDate} aria-describedby={errors.endDate ? "endDate-error" : "endDate-helper"} />
                                <p id="endDate-helper" className="text-xs text-gray-500 mt-1.5">Để trống nếu đang tiếp tục</p>
                                {errors.endDate && <p id="endDate-error" className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.endDate}</p>}
                            </div>
                        </div>

                        {/* Input Mô tả Chi tiết (chung) */}
                        <FormTextarea
                            id="description"
                            name="description"
                            label="Mô tả chi tiết (tùy chọn)"
                            value={formData.description}
                            onChange={handleChange}
                            error={errors.description}
                            rows={5} // Tăng số dòng
                            placeholder={isExperience
                                ? "Mô tả trách nhiệm chính, các dự án đã tham gia, công nghệ sử dụng, và thành tựu nổi bật bạn đạt được trong quá trình làm việc..."
                                : "Mô tả các hoạt động ngoại khóa, đề tài nghiên cứu, giải thưởng, hoặc thông tin khác liên quan đến quá trình học tập..."
                            }
                            helperText="Sử dụng xuống dòng để trình bày rõ ràng hơn."
                        />
                    </div>

                    {/* Footer Modal - Nút Bấm */}
                    <div className="p-5 border-t border-gray-700 flex justify-end gap-3 bg-gray-800/50 rounded-b-xl flex-shrink-0 sticky bottom-0 z-10">
                        {/* Nút Hủy */}
                        <motion.button
                            type="button"
                            onClick={onClose}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="py-2 px-5 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors duration-200 text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800"
                        >
                            Hủy
                        </motion.button>
                        {/* Nút Lưu */}
                        <motion.button
                            type="submit"
                            disabled={isLoading} // Disable khi đang lưu
                            whileHover={{ scale: isLoading ? 1 : 1.03 }} // Không scale khi disable
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            className="py-2 px-5 bg-blue-600 rounded-md hover:bg-blue-500 transition-colors duration-200 text-white font-bold text-sm flex items-center justify-center min-w-[90px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {/* Hiển thị spinner hoặc text */}
                            {isLoading ? <LoadingSpinner size="sm" text="" /> : 'Lưu'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
});
ProfileItemModal.displayName = 'ProfileItemModal'; // Tên component trong DevTools

/** TimelineSection (Hoàn Chỉnh) */
const TimelineSection = React.memo(({ isOwner, items = [], itemType, onAdd, onEdit, onDelete, isLoading }) => {
    const isExperience = itemType === 'experience';
    const ItemIcon = isExperience ? Briefcase : School; // Đây là component type
    const title = isExperience ? 'Kinh nghiệm Làm việc' : 'Quá trình Học vấn';
    const emptyTitle = isExperience ? 'Chưa có kinh nghiệm' : 'Chưa có thông tin học vấn';
    const emptyMessage = isOwner
        ? (isExperience ? 'Hãy thêm các kinh nghiệm làm việc, dự án thực tế hoặc công việc freelancer bạn đã làm.' : 'Hãy thêm thông tin về các trường học, khóa học, hoặc chứng chỉ bạn đã đạt được.')
        : 'Người dùng này chưa cập nhật thông tin.';
    const addText = isExperience ? 'Thêm Kinh nghiệm' : 'Thêm Học vấn';

    // Hàm format ngày tháng (giữ nguyên)
    const formatDateRange = (start, end) => {
        const startDate = new Date(start);
        const endDate = end ? new Date(end) : null;
        const startMonthYear = `${startDate.getMonth() + 1}/${startDate.getFullYear()}`;
        const endMonthYear = endDate ? `${endDate.getMonth() + 1}/${endDate.getFullYear()}` : 'Hiện tại';

        if (!endDate) return `${startMonthYear} - Hiện tại`;

        let years = endDate.getFullYear() - startDate.getFullYear();
        let months = endDate.getMonth() - startDate.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        months += 1; // Bao gồm cả tháng bắt đầu

        let duration = '';
        if (years > 0) duration += `${years} năm `;
        if (months > 0) duration += `${months} tháng`;
        if (duration === '') duration = '1 tháng'; // Ít nhất là 1 tháng

        return `${startMonthYear} - ${endMonthYear} • ${duration.trim()}`;
    };

    return (
        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            {/* Header Section (giữ nguyên) */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ItemIcon className={`w-6 h-6 ${isExperience ? 'text-purple-400' : 'text-green-400'}`} /> {title}
                </h2>
                {isOwner && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 py-1 px-3 rounded-md hover:bg-gray-700/50 border border-transparent hover:border-blue-500/30"
                    >
                        <Plus className="w-4 h-4" /> {addText}
                    </button>
                )}
            </div>
            {/* Content Section */}
            {isLoading ? (
                <div className="flex justify-center py-10"><LoadingSpinner size="md" /></div>
            ) : items?.length === 0 ? (
                // SỬA LỖI Ở ĐÂY: Truyền thẳng ItemIcon vào prop icon
                <EmptyState
                    icon={ItemIcon} // Truyền component type
                    title={emptyTitle}
                    message={emptyMessage}
                    actionButton={isOwner ?
                        <button onClick={onAdd} className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
                            <Plus className="w-5 h-5" /> {addText}
                        </button>
                        : null}
                />
            ) : (
                // Phần hiển thị danh sách (giữ nguyên)
                <div className="space-y-8 relative border-l-2 border-gray-700 ml-4 pl-8 pt-2">
                    <AnimatePresence>
                        {items?.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout // Cho phép animation mượt khi item bị xóa/thêm
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="relative"
                            >
                                {/* Timeline Dot */}
                                <div className="absolute -left-[38px] top-1 flex items-center justify-center">
                                    <div className={`w-4 h-4 rounded-full border-2 border-gray-900 ${isExperience ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                                </div>
                                {/* Timeline Card */}
                                <div className="bg-gray-800 p-5 rounded-xl border border-gray-700/70 shadow-md hover:shadow-lg transition-shadow group relative backdrop-blur-sm bg-opacity-70 hover:border-gray-600/90">
                                    {isOwner && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => onEdit(item)}
                                                title="Chỉnh sửa"
                                                className="p-1.5 text-gray-400 hover:text-yellow-400 bg-gray-700/50 hover:bg-gray-600/70 rounded-md transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item.id, itemType)}
                                                title="Xóa"
                                                className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-700/50 hover:bg-gray-600/70 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-lg text-white mb-0.5 pr-16">{isExperience ? item.title : item.degree}</h3>
                                    <p className="text-sm text-blue-300 font-medium mb-2">
                                        {isExperience ? item.company : `${item.school} • ${item.fieldOfStudy}`}
                                    </p>
                                    <p className="text-xs text-gray-400 mb-3 flex items-center flex-wrap gap-x-3 gap-y-1">
                                        <span>{formatDateRange(item.startDate, item.endDate)}</span>
                                        {isExperience && item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>}
                                        {!isExperience && item.grade && <span className="font-medium text-gray-300">GPA: {item.grade}</span>}
                                    </p>
                                    {item.description && <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{item.description}</p>}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
});
TimelineSection.displayName = 'TimelineSection';

// FormInput, FormTextarea (Đầy đủ)
const FormInput = React.memo(({ id, label, error, helperText, ...props }) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <input
            id={id}
            className={`w-full px-4 py-2.5 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 ${error ? 'border-red-500 ring-red-500/50' : 'border-gray-600 hover:border-gray-500 focus:ring-blue-500 focus:border-transparent'}`}
            {...props}
        />
        {helperText && !error && <p className="text-xs text-gray-500 mt-1.5">{helperText}</p>}
        {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
    </div>
));
FormInput.displayName = 'FormInput';

const FormTextarea = React.memo(({ id, label, error, helperText, ...props }) => (
    <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
        <textarea
            id={id}
            className={`w-full px-4 py-2.5 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition duration-200 min-h-[100px] resize-y ${error ? 'border-red-500 ring-red-500/50' : 'border-gray-600 hover:border-gray-500 focus:ring-blue-500 focus:border-transparent'}`}
            {...props}
        ></textarea>
        {helperText && !error && <p className="text-xs text-gray-500 mt-1.5">{helperText}</p>}
        {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
    </div>
));
FormTextarea.displayName = 'FormTextarea';


// ==========================================================
// === COMPONENT CHÍNH CỦA TRANG PROFILE (MASTER v2.1) ===
// ==========================================================
export default function ProfilePage() {
    // --- State & Hooks ---
    const { username } = useParams(); // Lấy username từ URL
    const { user: currentUser, isLoading: isAuthLoading } = useAuth(); // Lấy thông tin người dùng đang đăng nhập
    // State lưu trữ dữ liệu profile fetch về
    const [profileData, setProfileData] = useState(null); // Bao gồm { profile, skills, repos, experiences, education }
    const [isLoading, setIsLoading] = useState(true); // Cờ báo trạng thái loading ban đầu của trang
    const [error, setError] = useState(''); // Chuỗi thông báo lỗi chung của trang
    const [activeTab, setActiveTab] = useState('github'); // Tab đang được chọn ('github', 'experience', 'education')

    // State cho Modal Phân tích Repo
    const [selectedRepo, setSelectedRepo] = useState(null); // Repo object đang được chọn để phân tích
    const [isAnalyzing, setIsAnalyzing] = useState(false); // Cờ báo đang gọi API phân tích
    const [analysisResult, setAnalysisResult] = useState(null); // Kết quả phân tích trả về
    const [analysisError, setAnalysisError] = useState(''); // Lỗi xảy ra khi phân tích

    // State cho Modal Thêm/Sửa Kinh nghiệm/Học vấn
    const [modalOpen, setModalOpen] = useState(false); // Cờ báo modal đang mở hay đóng
    const [editingItem, setEditingItem] = useState(null); // Dữ liệu của item đang được sửa (null nếu là thêm mới)
    const [modalType, setModalType] = useState(''); // Loại modal ('experience' hoặc 'education')
    const [isSaving, setIsSaving] = useState(false); // Cờ báo đang gọi API lưu item

    // State cho Modal Đánh giá Giả lập (của Recruiter)
    const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

    // State cho việc hiển thị repo (Xem thêm/Thu gọn)
    const [showAllRepos, setShowAllRepos] = useState(false);

    // --- Derived State (State được tính toán từ state khác) ---
    // Xác định người xem có phải là chủ nhân của hồ sơ này không
    const isOwner = useMemo(() => !isAuthLoading && currentUser?.githubUsername === username, [currentUser, username, isAuthLoading]);
    // Xác định người xem có phải là Nhà tuyển dụng (và không phải chủ hồ sơ) không
    const isRecruiterViewing = useMemo(() => !isAuthLoading && currentUser?.role === 'recruiter' && !isOwner, [currentUser, isOwner, isAuthLoading]);
    // Xác định người xem có quyền phân tích repo không (chủ hồ sơ hoặc NTD)
    const canAnalyzeRepo = useMemo(() => isOwner || isRecruiterViewing, [isOwner, isRecruiterViewing]);

    // --- Data Fetching (Lấy dữ liệu hồ sơ) ---
    // Sử dụng useCallback để tối ưu, tránh tạo lại hàm fetch mỗi lần render
    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true); // Bật loading nếu cần
        setError(''); // Reset lỗi
        try {
            console.log(`[ProfilePage] Fetching profile data for username: ${username}`);
            const data = await getUserProfile(username); // Gọi API service
            // Sắp xếp lại experiences và education: ưu tiên đang làm/học, sau đó theo ngày bắt đầu mới nhất
            data.experiences?.sort((a, b) => (a.isCurrent === b.isCurrent ? 0 : a.isCurrent ? -1 : 1) || new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            data.education?.sort((a, b) => (a.isCurrent === b.isCurrent ? 0 : a.isCurrent ? -1 : 1) || new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            setProfileData(data); // Lưu dữ liệu vào state
            console.log(`[ProfilePage] Profile data received and processed:`, data);
        } catch (err) {
            console.error("[ProfilePage] Fetch data error:", err);
            setError(err.message || 'Không thể tải dữ liệu hồ sơ. Vui lòng thử lại.'); // Set lỗi nếu fetch thất bại
            setProfileData(null); // Reset data khi lỗi
        } finally {
            if (showLoading) setIsLoading(false); // Tắt loading
        }
    }, [username]); // Dependency: Hàm fetch này phụ thuộc vào `username`

    // useEffect hook để gọi fetchData khi component mount hoặc username thay đổi
    useEffect(() => {
        if (username) { // Chỉ fetch nếu có username hợp lệ
            fetchData();
        } else {
            setError("Username không hợp lệ trong URL."); // Xử lý trường hợp URL thiếu username
            setIsLoading(false);
        }
    }, [username, fetchData]); // Chạy lại effect khi username hoặc hàm fetchData thay đổi

    // --- Event Handlers (Xử lý sự kiện người dùng) ---

    /** Mở Modal Phân tích Repo và trigger quá trình phân tích */
    const handleRepoCardClick = useCallback((repo) => {
        if (canAnalyzeRepo) { // Chỉ mở modal nếu có quyền
            console.log(`[ProfilePage] Repo card clicked, opening analysis modal for: ${repo.full_name}`);
            setSelectedRepo(repo); // Set repo đang được chọn
            setAnalysisResult(null); // Xóa kết quả cũ
            setAnalysisError(''); // Xóa lỗi cũ
            triggerAnalysis(repo); // Bắt đầu phân tích ngay khi modal mở
        } else {
            // Nếu không có quyền, mở link GitHub thay vì modal
            window.open(repo.html_url, '_blank', 'noopener,noreferrer');
        }
    }, [canAnalyzeRepo]); // Dependency: Quyền phân tích

    /** Gọi API phân tích repo (GIẢ LẬP) và xử lý kết quả */
    const triggerAnalysis = useCallback(async (repoToAnalyze) => {
        if (!repoToAnalyze) return; // Không làm gì nếu không có repo
        setIsAnalyzing(true); // Bật trạng thái đang phân tích
        setAnalysisResult(null); // Reset kết quả
        setAnalysisError(''); // Reset lỗi
        console.log(`[ProfilePage] Triggering FAKE analysis API call for: ${repoToAnalyze.full_name}`);
        try {
            const result = await analyzeRepo(repoToAnalyze.full_name); // Gọi API giả lập
            setAnalysisResult(result); // Lưu kết quả thành công
            console.log(`[ProfilePage] FAKE Analysis successful, result received:`, result);
            // Tự động cập nhật lại danh sách skills trên UI nếu là chủ hồ sơ
            if (isOwner) {
                console.log("[ProfilePage] Owner detected, refreshing skills after analysis...");
                try {
                    // Chỉ fetch lại skills để cập nhật biểu đồ
                    const updatedSkills = await getUserProfile(username).then(data => data.skills);
                    setProfileData(prevData => prevData ? { ...prevData, skills: updatedSkills || [] } : null); // Cập nhật state
                    console.log("[ProfilePage] Skills display updated after fake analysis.");
                } catch (skillFetchError) {
                    console.error("[ProfilePage] Failed to refresh skills after analysis:", skillFetchError);
                    // Không cần báo lỗi nghiêm trọng, chỉ là cập nhật UI phụ
                }
            }
        } catch (err) {
            console.error("[ProfilePage] FAKE Analysis API error:", err);
            setAnalysisError(err.message || 'Phân tích repo thất bại. Vui lòng thử lại.'); // Lưu lỗi để hiển thị
        } finally {
            setIsAnalyzing(false); // Tắt trạng thái đang phân tích
        }
    }, [isOwner, username]); // Dependency: Quyền chủ sở hữu và username (nếu cần fetch lại skills)

    /** Đóng Modal Phân tích Repo */
    const closeAnalysisModal = useCallback(() => {
        console.log("[ProfilePage] Closing analysis modal.");
        setSelectedRepo(null); // Bỏ chọn repo
        // Không cần reset analysisResult/Error ở đây, chúng sẽ tự reset khi mở lại modal
    }, []);

    /** Mở Modal Thêm/Sửa Kinh nghiệm/Học vấn */
    const openItemModal = useCallback((type, item = null) => {
        console.log(`[ProfilePage] Opening item modal - Type: ${type}, Item:`, item);
        setModalType(type); // Set loại modal ('experience' hoặc 'education')
        setEditingItem(item); // Set item đang sửa (null nếu thêm mới)
        setModalOpen(true); // Mở modal
    }, []);

    /** Đóng Modal Thêm/Sửa Item */
    const closeItemModal = useCallback(() => {
        console.log("[ProfilePage] Closing item modal.");
        setModalOpen(false);
        setEditingItem(null); // Reset item đang sửa
        setModalType(''); // Reset loại modal
        setIsSaving(false); // Reset trạng thái đang lưu
        // Reset errors trong form nếu cần (tùy thuộc component Modal)
    }, []);

    /** Xử lý Lưu Item (Kinh nghiệm/Học vấn) */
    const handleSaveItem = useCallback(async (formData) => {
        setIsSaving(true); // Bật trạng thái đang lưu
        const isEditing = !!editingItem; // Kiểm tra xem là sửa hay thêm mới
        const action = isEditing
            ? (modalType === 'experience' ? updateWorkExperience : updateEducationHistory)
            : (modalType === 'experience' ? addWorkExperience : addEducationHistory);
        const itemId = editingItem?.id; // Lấy ID nếu đang sửa

        console.log(`[ProfilePage] Attempting to save ${modalType} - ${isEditing ? `Update ID ${itemId}` : 'Add New'}`, formData);
        try {
            const savedItem = itemId ? await action(itemId, formData) : await action(formData); // Gọi API tương ứng
            console.log(`[ProfilePage] ${modalType} saved successfully:`, savedItem);

            // Cập nhật state profileData ngay lập tức để UI phản hồi nhanh
            setProfileData(prevData => {
                if (!prevData) return null; // Trường hợp data chưa load
                const key = modalType === 'experience' ? 'experiences' : 'education'; // Xác định key trong state
                const items = prevData[key] || []; // Lấy mảng items hiện tại hoặc mảng rỗng
                let newItems;
                if (isEditing) {
                    // Thay thế item cũ bằng item mới đã lưu
                    newItems = items?.map(it => it.id === savedItem.id ? savedItem : it);
                } else {
                    // Thêm item mới vào đầu mảng
                    newItems = [savedItem, ...items];
                }
                // Sắp xếp lại mảng theo isCurrent và startDate mới nhất
                newItems.sort((a, b) => (a.isCurrent === b.isCurrent ? 0 : a.isCurrent ? -1 : 1) || new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                // Trả về state mới
                return { ...prevData, [key]: newItems };
            });
            closeItemModal(); // Đóng modal sau khi lưu thành công
            // TODO: Hiển thị thông báo Toast thành công ("Đã lưu kinh nghiệm/học vấn!")
        } catch (err) {
            console.error(`[ProfilePage] Error saving ${modalType}:`, err);
            // Hiển thị lỗi ngay trên modal (hoặc bằng Toast) thay vì đóng modal
            alert(`Lưu ${modalType === 'experience' ? 'kinh nghiệm' : 'học vấn'} thất bại: ${err.message || 'Lỗi không xác định'}`);
            setIsSaving(false); // Cho phép người dùng thử lại
        }
        // finally { setIsSaving(false); } // Đã chuyển vào catch để không đóng modal khi lỗi
    }, [editingItem, modalType, closeItemModal]); // Dependencies

    /** Xử lý Xóa Item (Kinh nghiệm/Học vấn) */
    const handleDeleteItem = useCallback(async (id, type) => {
        const itemName = type === 'experience' ? 'kinh nghiệm làm việc' : 'quá trình học vấn';
        // Hiển thị hộp thoại xác nhận trước khi xóa
        if (window.confirm(`Bạn có chắc chắn muốn xóa mục ${itemName} này không?\nHành động này không thể hoàn tác.`)) {
            console.log(`[ProfilePage] Attempting to delete ${type} with ID: ${id}`);
            // Có thể hiển thị overlay loading ở đây
            const action = type === 'experience' ? deleteWorkExperience : deleteEducationHistory;
            try {
                await action(id); // Gọi API xóa
                console.log(`[ProfilePage] ${type} with ID: ${id} deleted successfully.`);
                // Cập nhật state profileData để xóa item khỏi UI
                setProfileData(prevData => {
                    if (!prevData) return null;
                    const key = type === 'experience' ? 'experiences' : 'education';
                    // Trả về state mới với item đã bị lọc ra
                    return { ...prevData, [key]: prevData[key]?.filter(it => it.id !== id) || [] };
                });
                // TODO: Hiển thị thông báo Toast thành công ("Đã xóa!")
            } catch (err) {
                console.error(`[ProfilePage] Error deleting ${type} with ID ${id}:`, err);
                alert(`Xóa ${itemName} thất bại: ${err.message || 'Lỗi không xác định'}`); // Hiển thị lỗi
            } finally {
                // Tắt overlay loading nếu có
            }
        } else {
            console.log(`[ProfilePage] Deletion cancelled for ${type} ID: ${id}`);
        }
    }, []); // Dependencies

    /** Mở Modal Đánh giá Giả lập */
    const handleOpenFakeEvaluationModal = useCallback(() => {
        console.log("[ProfilePage] Opening fake evaluation modal.");
        setIsEvaluationModalOpen(true);
    }, []);

    /** Đóng Modal Đánh giá Giả lập */
    const handleCloseFakeEvaluationModal = useCallback(() => {
        console.log("[ProfilePage] Closing fake evaluation modal.");
        setIsEvaluationModalOpen(false);
    }, []);

    /** Chuyển đổi trạng thái hiển thị tất cả Repos */
    const toggleShowAllRepos = useCallback(() => {
        setShowAllRepos(prev => !prev);
    }, []);

    /** Lấy danh sách Repos cần hiển thị (dựa trên state showAllRepos) */
    const displayedRepos = useMemo(() => {
        const allRepos = profileData?.repos || [];
        return showAllRepos ? allRepos : allRepos.slice(0, MAX_REPOS_DISPLAY);
    }, [profileData?.repos, showAllRepos]);


    // --- Render Logic ---
    // 1. Xử lý trạng thái Loading ban đầu (chờ cả auth và profile)
    if (isLoading || isAuthLoading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><LoadingSpinner text="Đang tải hồ sơ năng lực..." size="lg" /></div>;
    }

    // 2. Xử lý trạng thái Lỗi nghiêm trọng (không load được profile ban đầu)
    if (error && !profileData) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6"><ErrorDisplay message={error} onRetry={() => fetchData(true)} /></div>;
    }

    // 3. Xử lý trạng thái Không tìm thấy hồ sơ
    if (!profileData?.profile) {
        // Có thể lỗi `getUserProfile` trả về data rỗng nhưng không lỗi, cần check `profile`
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6"><ErrorDisplay message="Không tìm thấy hồ sơ sinh viên này hoặc tài khoản không hoạt động." /></div>;
    }

    // 4. Dữ liệu đã sẵn sàng, tiến hành render giao diện chính
    const { profile, skills = [], repos = [], experiences = [], education = [] } = profileData; // Destructure và đặt giá trị mặc định là mảng rỗng
    const tabs = [ // Cấu hình các tab
        { id: 'github', label: `Dự án GitHub (${repos?.length})`, icon: Github },
        { id: 'experience', label: `Kinh nghiệm (${experiences?.length})`, icon: Briefcase },
        { id: 'education', label: `Học vấn (${education?.length})`, icon: GraduationCap }
    ];

    /** Render nội dung tương ứng cho tab đang được chọn */
    const renderTabContent = () => {
        switch (activeTab) {
            case 'github': // Tab Dự án GitHub
                return (
                    <motion.div variants={{ visible: { transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="visible">
                        {/* Header của Tab */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3 shrink-0"> <Github className="w-6 h-6 text-blue-400" /> Dự án Public trên GitHub </h2>
                            {/* Nút Xem thêm/Thu gọn chỉ hiển thị nếu repo > MAX_REPOS_DISPLAY */}
                            {repos?.length > MAX_REPOS_DISPLAY && (
                                <button
                                    onClick={toggleShowAllRepos}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors duration-200 self-end sm:self-center"
                                >
                                    {showAllRepos ? 'Thu gọn bớt' : `Xem tất cả (${repos?.length})`}
                                    <ChevronsUpDown className={`w-4 h-4 transition-transform duration-300 ${showAllRepos ? 'rotate-180' : ''}`} />
                                </button>
                            )}
                        </div>
                        {/* Danh sách Repo hoặc Empty State */}
                        {displayedRepos?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                                {/* Dùng AnimatePresence để xử lý animation khi item bị thêm/xóa (ở đây là khi thu gọn/mở rộng) */}
                                <AnimatePresence initial={false}>
                                    {displayedRepos?.map(repo => (
                                        <RepoCard key={repo.id} repo={repo} onClick={() => handleRepoCardClick(repo)} isOwnerOrRecruiter={canAnalyzeRepo} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            // Hiển thị EmptyState nếu không có repo nào
                            <EmptyState
                                icon={<Github className="w-16 h-16 text-gray-600" />}
                                title="Không có dự án Public"
                                message={isOwner ? "Hãy chia sẻ các dự án tuyệt vời của bạn lên GitHub và đặt chế độ public để nhà tuyển dụng có thể thấy!" : "Người dùng này chưa có repository public nào trên GitHub."}
                            />
                        )}
                        {/* Nút Xem thêm/Thu gọn ở cuối (chỉ hiển thị nếu danh sách bị cắt ngắn) */}
                        {repos?.length > MAX_REPOS_DISPLAY && !showAllRepos && (
                            <div className="mt-8 text-center">
                                <button
                                    onClick={toggleShowAllRepos}
                                    className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mx-auto transition-colors duration-200 py-2 px-4 rounded-md hover:bg-gray-700/50"
                                >
                                    Xem thêm {repos?.length - MAX_REPOS_DISPLAY} dự án khác <ChevronsUpDown className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                );
            case 'experience': // Tab Kinh nghiệm
                return (
                    <TimelineSection
                        isOwner={isOwner} // Cho phép chỉnh sửa nếu là chủ hồ sơ
                        items={experiences} // Dữ liệu kinh nghiệm
                        itemType="experience" // Loại item
                        onAdd={() => openItemModal('experience')} // Mở modal thêm mới
                        onEdit={(item) => openItemModal('experience', item)} // Mở modal sửa
                        onDelete={handleDeleteItem} // Hàm xóa item
                        isLoading={isLoading && !experiences} // Chỉ loading nếu đang fetch và chưa có data
                    />
                );
            case 'education': // Tab Học vấn
                return (
                    <TimelineSection
                        isOwner={isOwner}
                        items={education}
                        itemType="education"
                        onAdd={() => openItemModal('education')}
                        onEdit={(item) => openItemModal('education', item)}
                        onDelete={handleDeleteItem}
                        isLoading={isLoading && !education}
                    />
                );
            default: // Trường hợp không khớp tab nào (nên không xảy ra)
                return null;
        }
    };

    // --- JSX Cấu trúc Chính của Trang ---
    return (
        <>
            {/* Cấu hình thẻ <head> */}
            <Helmet>
                <title>{`Hồ sơ ${profile.name || profile.githubUsername} | EduBridge AI`}</title>
                <meta name="description" content={`Khám phá hồ sơ năng lực 360°, kỹ năng AI-Verified, dự án GitHub, kinh nghiệm làm việc và quá trình học vấn của ${profile.name || profile.githubUsername} trên nền tảng EduBridge AI.`} />
                {/* Thêm các thẻ meta khác nếu cần cho SEO */}
            </Helmet>

            {/* Container chính của trang với nền gradient tinh tế */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-900/10 text-white min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                    {/* Layout Grid chính: Sidebar Trái | Content Phải */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} // Fade-in toàn bộ grid
                        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start" // `items-start` để sidebar không bị kéo dài theo content
                    >
                        {/* --- Sidebar Trái (Aside) --- */}
                        <aside className="lg:col-span-4 xl:col-span-3 space-y-8 lg:sticky lg:top-24 self-start"> {/* `sticky top-24` để sidebar cố định khi cuộn */}
                            {/* Card thông tin profile */}
                            <ProfileHeaderCard profile={profile} />
                            {/* Biểu đồ skills */}
                            <SkillsRadarSection skills={skills} />
                            {/* Nút Đánh giá Giả lập (chỉ hiển thị cho NTD) */}
                            {isRecruiterViewing && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                    <button
                                        onClick={handleOpenFakeEvaluationModal} // Mở modal đánh giá
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-5 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transform hover:-translate-y-0.5" // Hiệu ứng hover nhẹ
                                    >
                                        <ClipboardCheck className="w-5 h-5" /> Đánh giá Nhanh (AI Giả Lập)
                                    </button>
                                </motion.div>
                            )}
                        </aside>

                        {/* --- Nội dung Chính (Main Content) --- */}
                        <main className="lg:col-span-8 xl:col-span-9">
                            {/* Thanh Tabs Navigation (sticky) */}
                            <div className="border-b border-gray-700/80 mb-8 sticky top-[calc(theme(spacing.16)-1px)] sm:top-[calc(theme(spacing.18)-1px)] bg-gray-900/80 backdrop-blur-md z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-px shadow-sm"> {/* Sticky với background mờ */}
                                <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-hide" aria-label="Profile Tabs">
                                    {tabs?.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)} // Chuyển tab khi click
                                            className={`whitespace-nowrap pt-4 pb-3 px-1 border-b-2 font-semibold text-sm transition-all duration-200 focus:outline-none flex items-center gap-2 group relative ${activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-400' // Style khi active
                                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500/50' // Style khi inactive/hover
                                                }`}
                                            aria-current={activeTab === tab.id ? 'page' : undefined} // Accessibility
                                        >
                                            <tab.icon className={`w-4 h-4 transition-colors ${activeTab === tab.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                            {tab.label}
                                            {/* Hiệu ứng gạch chân chạy theo tab active */}
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-500 rounded-t-full"
                                                    layoutId="profileTabUnderline" // ID để framer-motion biết cần animate giữa các tab
                                                    transition={{ type: 'spring', stiffness: 350, damping: 30 }} // Animation mượt
                                                />
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Khu vực hiển thị nội dung của Tab */}
                            <AnimatePresence mode="wait"> {/* `mode="wait"` để animation exit hoàn thành trước khi animation enter bắt đầu */}
                                <motion.div
                                    key={activeTab} // Key thay đổi theo tab để trigger animation
                                    initial={{ y: 15, opacity: 0 }} // Bắt đầu từ dưới lên và mờ
                                    animate={{ y: 0, opacity: 1 }} // Di chuyển lên và hiện rõ
                                    exit={{ y: -15, opacity: 0 }} // Biến mất lên trên và mờ đi
                                    transition={{ duration: 0.25, ease: 'easeInOut' }} // Thời gian và kiểu animation
                                >
                                    {renderTabContent()} {/* Gọi hàm render nội dung tab */}
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </motion.div>
                </div>
            </div>

            {/* Khu vực hiển thị các Modals (sử dụng AnimatePresence để có animation) */}
            <AnimatePresence>
                {/* Modal Phân tích Repo */}
                {selectedRepo && (
                    <AnalysisResultModal
                        repo={selectedRepo}
                        onClose={closeAnalysisModal}
                        analysisResult={analysisResult}
                        isAnalyzing={isAnalyzing}
                        analysisError={analysisError}
                        onRetry={() => triggerAnalysis(selectedRepo)} // Cho phép thử lại
                        isOwner={isOwner} // Truyền isOwner để biết có hiển thị nút Retry không
                    />
                )}
                {/* Modal Thêm/Sửa Item (Kinh nghiệm/Học vấn) */}
                {modalOpen && (
                    <ProfileItemModal
                        item={editingItem}
                        onSave={handleSaveItem}
                        onClose={closeItemModal}
                        type={modalType}
                        isLoading={isSaving} // Truyền trạng thái loading vào modal
                    />
                )}
                {/* Modal Đánh giá Giả lập (của Recruiter) */}
                {isEvaluationModalOpen && profileData && ( // Chỉ hiển thị nếu modal flag là true và có profileData
                    <FakeEvaluationModal
                        student={profileData} // Truyền toàn bộ profileData (bao gồm profile, skills, repos...)
                        onClose={handleCloseFakeEvaluationModal}
                    />
                )}
            </AnimatePresence>
            {/* CSS cho scrollbar (tùy chọn, đặt ở cuối hoặc trong index.css) */}
            <style jsx global>{`
                 .styled-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                 .styled-scrollbar::-webkit-scrollbar-track { background: transparent; }
                 .styled-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(107, 114, 128, 0.5); border-radius: 20px; border: transparent; }
                 .styled-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(156, 163, 175, 0.6); }
                 .scrollbar-hide::-webkit-scrollbar { display: none; } /* Chrome, Safari, Opera */
                 .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } /* IE, Edge, Firefox */
            `}</style>
        </>
    );
}

// Thêm displayName cho các component con để dễ debug trong React DevTools
ProfileHeaderCard.displayName = 'ProfileHeaderCard';
SkillsRadarSection.displayName = 'SkillsRadarSection';
RepoCard.displayName = 'RepoCard';
AnalysisResultModal.displayName = 'AnalysisResultModal';
FakeEvaluationModal.displayName = 'FakeEvaluationModal'; // Đã cập nhật
ProfileItemModal.displayName = 'ProfileItemModal';
TimelineSection.displayName = 'TimelineSection';
FormInput.displayName = 'FormInput';
FormTextarea.displayName = 'FormTextarea';
// FormInput.displayName = 'FormInput'; // Bỏ nếu đã tách file
// FormTextarea.displayName = 'FormTextarea'; // Bỏ nếu đã tách file