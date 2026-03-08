/*-----------------------------------------------------------------
* File: config.js
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is a component/module for the student application.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
// API configuration
export const API_URL = 'http://127.0.0.1:5001';
export const CAREER_API_URL = 'http://127.0.0.1:3800';
export const PORTFOLIO_API_URL = 'http://127.0.0.1:3900';

// Socket.IO configuration
export const SOCKET_URL = 'http://127.0.0.1:5001';

// Other app configuration
export const APP_CONFIG = {
  defaultAvatar: '/assets/default-avatar.png',
  maxFileUploadSize: 50 * 1024 * 1024, // 50MB (for portfolio uploads)
  supportedFileTypes: {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/webm', 'video/mov'],
    audio: ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  fieldCategories: [
    { value: 'IT', label: '💻 Công nghệ thông tin', icon: '💻' },
    { value: 'Business', label: '📊 Kinh tế / Kinh doanh', icon: '📊' },
    { value: 'Design', label: '🎨 Thiết kế / Mỹ thuật', icon: '🎨' },
    { value: 'Science', label: '🔬 Khoa học / Kỹ thuật', icon: '🔬' },
    { value: 'Humanities', label: '📝 Xã hội / Nhân văn', icon: '📝' },
    { value: 'Arts', label: '🎵 Nghệ thuật biểu diễn', icon: '🎵' },
    { value: 'Health', label: '🏥 Y tế / Sức khỏe', icon: '🏥' },
    { value: 'Architecture', label: '📐 Kiến trúc / Xây dựng', icon: '📐' },
    { value: 'Other', label: '🌍 Đa ngành / Khác', icon: '🌍' },
  ],
  portfolioItemTypes: [
    { value: 'code_project', label: '💻 Code Project', fields: ['IT'] },
    { value: 'design_work', label: '🎨 Design Work', fields: ['Design', 'Architecture'] },
    { value: 'business_report', label: '📊 Business Report', fields: ['Business'] },
    { value: 'research_paper', label: '🔬 Research Paper', fields: ['Science', 'Health'] },
    { value: 'writing_sample', label: '📝 Writing Sample', fields: ['Humanities'] },
    { value: 'video_project', label: '🎥 Video Project', fields: ['Arts', 'Design'] },
    { value: 'presentation', label: '📋 Presentation', fields: ['Business', 'Science'] },
    { value: 'music_audio', label: '🎵 Music / Audio', fields: ['Arts'] },
    { value: '3d_model', label: '🧊 3D Model', fields: ['Architecture', 'Design'] },
    { value: 'certificate', label: '📜 Certificate', fields: [] },
    { value: 'other', label: '📎 Other', fields: [] },
  ],
}; 
