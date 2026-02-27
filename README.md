# EduBridge AI 🌉

> **Nền tảng học tập & kết nối việc làm ĐA NGÀNH, tích hợp trí tuệ nhân tạo**

Kết hợp sức mạnh của [Campus-Learning](https://github.com/DucQuyen199/Campus-Learning) (hệ sinh thái học tập) + [EduLedger AI](https://github.com/nphu211206/edu-ledger-ai) (AI phỏng vấn & job matching) thành một nền tảng duy nhất.

---

## ✨ Tính năng nổi bật

### 📚 Hệ sinh thái Học tập (từ Campus-Learning)
- Khóa học trực tuyến (modules, lessons, progress tracking)
- AI Tutor (Google Gemini)
- Monaco Code Editor + Docker Sandbox (JS, Python, C++, Java, C#)
- Cuộc thi lập trình (competitions, real-time scoring)
- Hệ thống thi (exams, monitoring)
- Chat real-time + Voice/Video call
- Mạng xã hội học tập (posts, stories, friends, ranking)
- Cross-platform: Web + Desktop (Electron) + Mobile (Capacitor)

### 💼 Kết nối Việc làm Đa Ngành (từ EduLedger AI + mới)
- Đăng tuyển & tìm việc đa ngành (IT, Kinh tế, Thiết kế, Khoa học...)
- AI phỏng vấn tự động (tạo câu hỏi, chấm điểm, nhận xét)
- Job matching thông minh dựa trên kỹ năng đã đánh giá

### 📁 Portfolio Đa Ngành (★ MỚI)
- Upload tác phẩm đa dạng: code, thiết kế, báo cáo, nghiên cứu, video, bài thuyết trình
- AI đánh giá từng loại tác phẩm với tiêu chí chuyên ngành
- Kết nối 8+ nền tảng: GitHub, Behance, Dribbble, LinkedIn, Kaggle, DeviantArt, ArtStation, Medium
- Tự động phát hiện & chấm điểm kỹ năng
- Tổng hợp điểm năng lực + gợi ý nghề nghiệp

---

## 🏗️ Kiến trúc

```
EduBridge-AI/
├── frontend/
│   ├── user-app/          # Student app (React + Vite + TailwindCSS)
│   ├── teacher-app/       # Teacher portal
│   ├── admin-app/         # Admin panel
│   └── recruiter-app/     # Recruiter portal
│
├── services/
│   ├── user-service/      # Core: Auth, courses, chat, code execution (Port 5001)
│   ├── teacher-service/   # Course management, grading (Port 5003)
│   ├── admin-service/     # System management (Port 5002)
│   ├── career-service/    # Jobs, AI interviews, companies (Port 3800)
│   ├── portfolio-service/ # Portfolio, skills, external profiles (Port 3900)
│   └── code-server/       # IDE & code execution
│
├── dbo/                   # Database schema (119 SQL tables)
└── .env.example           # Environment configuration
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TailwindCSS, Material-UI |
| Backend | Node.js, Express.js |
| Database | Microsoft SQL Server |
| AI | OpenAI GPT-3.5/4 + Google Gemini |
| Real-time | Socket.IO |
| Code Exec | Docker + Judge0 |
| Desktop | Electron |
| Mobile | Capacitor |
| Payment | VNPAY, PayPal, VietQR, Momo |

## 🚀 Quickstart

```bash
# 1. Clone
git clone https://github.com/your-repo/EduBridge-AI.git
cd EduBridge-AI

# 2. Config
cp .env.example .env
# Edit .env with your API keys and DB connection

# 3. Database
# Run dbo/migrate-career.sql on your MSSQL instance

# 4. Install & Start services
cd services/user-service && npm install && npm start
cd services/career-service && npm install && npm start
cd services/portfolio-service && npm install && npm start

# 5. Start frontend
cd frontend/user-app && npm install && npm run dev
```

## 📊 Ngành được hỗ trợ

| Ngành | Đánh giá qua | AI Focus |
|-------|-------------|----------|
| 💻 CNTT | GitHub, code submissions | Code quality, architecture |
| 🎨 Thiết kế | Behance, Dribbble, portfolio | Composition, color, creativity |
| 📊 Kinh tế | Reports, Excel, PPT | Logic, data analysis |
| 🔬 Khoa học | Papers, lab reports | Methodology, originality |
| 📝 Xã hội | Essays, articles | Writing quality, argument |
| 🎵 Nghệ thuật | Video, audio | Technique, storytelling |

## 📄 License

Apache 2.0 — Copyright 2025
