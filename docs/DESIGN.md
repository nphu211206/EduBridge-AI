# 🎨 DESIGN KHỦNG LÕI: EduBridge-AI "Enterprise Edition"
*Ngày tạo: 08/03/2026*
*Dựa trên yêu cầu: Landing Hub đẳng cấp thế giới tương đương MasterClass, Apple, Vercel.*

---

## 🏗️ 1. KIẾN TRÚC MỞ RỘNG (Enterprise Architecture)

Để đạt đẳng cấp của các "ông lớn", hệ thống phải được cấu trúc để tải nhanh, mượt mà và cực kỳ an toàn.

### 📊 Sơ đồ Kiến trúc Tổng thể (High-level Architecture)

```mermaid
graph TD
    Client[Người dùng (Trình duyệt)] --> CDN[Cloudflare CDN]
    CDN --> Frontend[React SPA / Vite]
    
    Frontend <-->|REST API / WebSocket| APIGW[API Gateway]
    
    APIGW --> Auth[Auth Service (JWT)]
    APIGW --> Exam[Exam Service]
    APIGW --> User[User Management Service]
    APIGW --> Analytics[Analytics Engine]
    
    Auth --> DB[(SQL Server)]
    Exam --> DB
    User --> DB
    Analytics --> Redis[(Redis Cache)]
```

### 💾 Thiết kế Dữ liệu Cốt lõi (Core Schema)

Dưới đây là cách chúng ta thiết kế Database để quản lý quyền và người dùng một cách chặt chẽ:

┌─────────────────────────────────────────────────────────────┐
│  👤 USERS (Người dùng)                                      │
│  ├── UserID (UUID)                                          │
│  ├── FullName                                               │
│  ├── Email (Unique)                                         │
│  ├── HashedPassword                                         │
│  ├── Role (Student, Teacher, Recruiter, Admin)              │
│  └── Status (Active/Suspended)                              │
└───────────────────────────┬─────────────────────────────────┘
                            │ 1 user có nhiều bài thi (nếu là Học sinh)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  📝 EXAMS (Kỳ thi)                                          │
│  ├── ExamID                                                 │
│  ├── Title & Description                                    │
│  ├── CreatorID (Tham chiếu UserID của Teacher)              │
│  ├── Config (Cấu hình bảo mật, thời gian)                   │
│  └── Status (Draft, Published, Archived)                    │
└────────────────────────────────────┼────────────────────────┘
                                     │ 1 kỳ thi có nhiều kết quả
                                     ▼
┌─────────────────────────────────────────────────────────────┐
│  🏆 EXAM_RESULTS (Kết quả)                                  │
│  ├── ParticipantID (Tham chiếu UserID)                      │
│  ├── ExamID                                                 │
│  ├── Score                                                  │
│  ├── AntiCheatLogs (Ghi nhận thoát màn hình, v.v.)          │
│  └── CompletedAt                                            │
└─────────────────────────────────────────────────────────────┘

---

## 📱 2. HỆ THỐNG MÀN HÌNH "VŨ TRỤ" (Ecosystem Screens)

Hệ sinh thái EduBridge không chỉ có 1 trang. Dưới đây là bức tranh toàn cảnh:

| # | Khối (Module) | Tên Màn Hình | Mục đích cốt lõi | Hiệu ứng UI/UX chính |
|---|--------------|--------------|------------------|----------------------|
| 1 | **GATEWAY** | `Landing Hub` | Thu hút, phân luồng người dùng | Dark Mode, Particles 3D, Glassmorphism, Marquee Scroll |
| 2 | **STUDENT** | `Student Dashboard` | Xem tiến độ học, kỳ thi sắp tới | Biểu đồ Radar kỹ năng, Card 3D tilt |
| 3 | **STUDENT** | `Exam Arena` | Màn hình thi trực tuyến bảo mật | Kéo thả, Cảnh báo gian lận viền đỏ glowing, Fullscreen Mode |
| 4 | **TEACHER** | `Creator Studio` | Tạo đề, quản lý ngân hàng câu hỏi | Drag & drop builder, Live preview |
| 5 | **TEACHER** | `Scoring Center` | Chấm thi tự luận, AI hỗ trợ | Split screen (Trái: Bài làm, Phải: AI Gợi ý) |
| 6 | **RECRUITER** | `Talent Pool` | Tìm kiếm ứng viên xuất sắc | Bộ lọc Real-time, Profile Card với hiệu ứng lật |
| 7 | **ADMIN** | `Command Center` | Giám sát toàn hệ thống | Dashboard thời gian thực, Bản đồ nhiệt truy cập |

---

## 🎬 3. TRẢI NGHIỆM NGƯỜI DÙNG ĐỈNH CAO (Cinematic User Journey)

Đây là hành trình "giữ chân" người dùng từ giây đầu tiên:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 THE HOOK (Cú hích 5 giây đầu)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ User gõ URL → Giao diện load siêu tốc (< 1s nhờ Vite & Lazy Loading).
2️⃣ Một màn đen tuyền sâu thẳm mở ra. Background có dạng lưới (grid) mờ ảo chuyển động chậm.
3️⃣ Headline "Vượt Mọi Giới Hạn" từ từ sáng lên (Glow fade-in).
4️⃣ Sub-headline hiện ra với hiệu ứng "Typewriter" mượt mà.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 THE DISCOVERY (Khám phá quyền năng)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ User cuộn chuột (Scroll) xuống một chút.
2️⃣ 4 chiếc thẻ (Role Cards) hiện ra từ bóng tối (Staggered fade-up).
3️⃣ Khi rê chuột (Hover) vào thẻ "Học Sinh":
   - Thẻ nổi bốc lên 15px (Elevate).
   - Viền thẻ phát sáng màu Xanh Lam (Blue Neon).
   - Hình ảnh bên trong thẻ có hiệu ứng thị sai (Parallax mini).
4️⃣ Khi rê chuột vào thẻ "Nhà Tuyển Dụng": Thẻ sáng viền màu Tím (Purple Neon).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 THE ACTION (Chốt Sale / Đăng nhập)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ User bấm vào thẻ định danh của mình.
2️⃣ Một âm thanh cực nhỏ (Subtle click - tùy chọn) phát ra.
3️⃣ Toàn màn hình chuyển đổi mượt mà (Page Transition) sang trang Đăng Nhập.
4️⃣ Hiệu ứng Loading "bụi sao" (Stardust spinner) trong lúc chờ xác thực.

---

## 📐 4. TRIẾT LÝ THIẾT KẾ & TÀI NGUYÊN (Design System)

### 🎨 Màu sắc (MasterClass / Apple Inspired)
- **Nền chính:** `#000000` (Pure Black) & `#0a0a0a` (Vantablack)
- **Màu nhấn (Accent):**
  - Trí tuệ (AI): `#8b5cf6` (Neon Purple)
  - Thành công: `#10b981` (Emerald Green)
  - Cảnh báo/Khẩn cấp: `#ef4444` (Crimson Red)
- **Text:** `#ffffff` (Chính), `#94a3b8` (Phụ - Slate 400)

### 🖋️ Typography (Sang trọng & Hiện đại)
- **Headline:** `Space Grotesk` hoặc `Outfit` (Đậm, Rõ nét, Hơi góc cạnh).
- **Body Text:** `Inter` (Dễ đọc nhất trên màn hình kỹ thuật số).

### ✨ Micro-interactions (Hiệu ứng nhỏ tạo đẳng cấp lớn)
- **Từ tính (Magnetic Buttons):** Nút bấm sẽ hơi bị "hút" về phía con trỏ chuột khi đến gần.
- **Ánh phản chiếu (Glare):** Khi nghiêng thẻ, có một vệt sáng chạy dọc qua như ánh kính.
- **Tiếng vọng (Echo Loading):** Skeleton loading không trượt nhàm chán mà nhịp nhàng như nhịp tim.

---

## ✅ 5. BỘ TIÊU CHUẨN XUẤT XƯỞNG (Acceptance Criteria & Test Cases)

Để code được phần này, chúng ta phải qua bài test sát hạch cực kỳ nghiêm ngặt.

### 📋 Checklist Chuẩn "Triple A" (AAA Standard)

✅ **Hiệu năng (Performance - Điểm Lighthouse > 95)**
  - [ ] Ảnh phải được nén WebP/AVIF.
  - [ ] Animations chạy trên GPU (`transform`, `opacity`), 60FPS không giật lag.
  - [ ] Lazy load các component không nằm trong màn hình đầu tiên.

✅ **Trải nghiệm Thị giác (Visual Impact)**
  - [ ] Dark Mode không được dùng màu đen 100% tẻ nhạt, phải có noise hoặc gradient tinh tế.
  - [ ] Khoảng trắng (White space) phải lớn, tạo cảm giác sang trọng, không nhồi nhét.
  - [ ] Mọi hiệu ứng hover phải có transition-duration rõ ràng (VD: `300ms cubic-bezier(0.4, 0, 0.2, 1)`).

✅ **Bảo mật & Luồng (Security & Flows)**
  - [ ] Thẻ Học sinh -> Route nội bộ (`/login`).
  - [ ] Thẻ Nền tảng khác (Giáo viên, Tuyển dụng) -> Trỏ ra link ngoài (`external domain/login`).
  - [ ] Chống Click-jacking trên các nút CTA.

### 🧪 TEST CASES CHUYÊN SÂU

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-01: First Cick - The Magic Hover (Hiệu ứng kính ma thuật)**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** Cài đặt màn hình Laptop 1080p, truy cập `/`
- **When:** Rê chuột vào thẻ "Học Sinh" nhanh rồi kéo ra ngay.
- **Then:**
  - ✓ Thẻ sáng lên ngay lập tức mà không bị "khựng".
  - ✓ Khi kéo chuột ra, thẻ từ từ hạ xuống (không rơi tự do bùm bụp).
  - ✓ Ánh sáng Glow quanh thẻ mờ dần 0.3 giây.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-02: Device Agnostic - Vẻ đẹp trên nếp gấp**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** Mở app trên điện thoại (iPhone 14 Pro Max - Safari).
- **When:** Cuộn trang Landing Hub.
- **Then:**
  - ✓ Các thẻ Role Card xếp dọc tự động (1 cột), thay vì Grid 2x2.
  - ✓ Font size Headline tự thu nhỏ cực chuẩn, không bị rớt chữ vô duyên.
  - ✓ Hiệu ứng Parallax (nền) bị vô hiệu hóa để tiết kiệm Pin điện thoại.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**TC-03: The "No-AI" Feel - Loại bỏ cảm giác rẻ tiền**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- **Given:** Reviewer từ team Design kiểm tra màn hình.
- **When:** Nhìn tổng thể toàn trang.
- **Then:**
  - ✓ Không có các câu copy văn mẫu kiểu "Welcome to the best education platform". Thay bằng "Kiến tạo di sản tương lai."
  - ✓ Không có ảnh Stock AI vector rẻ tiền. Ưu tiên Typographic layout và khối 3D trừu tượng.
  - ✓ Drop shadow phải là shadow phân tầng (layered shadow), không phải box-shadow mặc định rập khuôn.

---

## 🚀 6. KIẾN TRÚC LANDING HUB ĐỊNH CHUẨN (The Ultimate Landing Page Anatomy)

Để thực sự lột xác và loại bỏ hoàn toàn cảm giác "Web AI làm", trang Landing Hub của EduBridge-AI phải tuân thủ nghiêm ngặt **Cấu trúc 10 lớp (10-Layer Structure)** của các kỳ lân công nghệ (Unicorns) như Vercel, Stripe hay Apple.

### Sơ đồ 10 Lớp Giao Diện Đoạn Kể (Storytelling Flow)

1. **1️⃣ Global Alert / Floating Navbar**: Giữ chân ở mọi vị trí cuộn. Thanh thông báo sự kiện (Alert Banner) nhỏ gọn trên cùng.
2. **2️⃣ The Hero "Hook"**: Tiêu đề bùng nổ, rỗng chữ (Stroke text) + Background Mesh Gradient di chuyển siêu thực.
3. **3️⃣ Trusted By (Client Logos)**: *Social Proof cấp độ 1.* Dải băng (Marquee) logo các trường đua công nghệ (Google, FPT, CMC) chạy vô tận, tô xám mờ (Grayscale) nhưng highlight khi hover.
4. **4️⃣ Platform Showcase (Window/Device Mockup)**: Ảnh chụp giao diện thực tế (Mock UI) đặt bên trong viền Browser/Macbook mô phỏng với hiệu ứng chìm nổi Perspective 3D khi cuộn.
5. **5️⃣ The Ecosystem (Bento Grid 2.0)**: Trình bày tính năng dưới dạng Themed Bento Box (có Lottie animation hoặc video loop siêu nhỏ thay vì icon nhàm chán).
6. **6️⃣ Impact Metrics (Số liệu thực tế)**: "Những con số biết nói" dạng Counter, số chạy cực mạnh (VD: Thời gian chấm bài giảm 90%, 5M+ Kỳ thi đã tạo).
7. **7️⃣ The Pathway (How It Works)**: Hành trình từ Điểm Học mờ mịt đến Ánh Sáng Việc làm dạng Timeline dọc (Vertical Scroll Connect). Ánh sáng chớp tắt dẫn lối.
8. **8️⃣ Infinite Testimonials**: *Social Proof cấp độ 2.* Trượt ngang các thẻ đánh giá của những chuyên gia 5 sao. Không phải thẻ cố định.
9. **9️⃣ Enterprise API / Pricing**: Sự minh bạch của các khối Subscription, so sánh bảng tính năng (Feature Table).
10. **🔟 Final Push (Pre-footer CTA)**: Lời kêu gọi chiếm toàn vẹn 100vh màn hình trước vòng cung chân trang. Header to như hố đen vũ trụ hút nút bẩm.
