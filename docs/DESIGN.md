# 🎨 DESIGN: Premium Landing Hub EduBridge-AI

Ngày tạo: 2026-03-08
Dựa trên: [BRIEF.md](./BRIEF.md)

---

## 1. Kiến Trúc & Lưu Trữ (Architecture & Storage)

Vì Landing Hub chủ yếu đóng vai trò "Trạm trung chuyển" (Router) điều hướng người dùng thay vì xử lý logic nghiệp vụ phức tạp, chúng ta sẽ **KHÔNG CẦN CHỈNH SỬA DATABASE SCHEMA**. Mọi dữ liệu hiển thị trên Landing Hub (như đếm số user, số doanh nghiệp) tạm thời có thể dùng số liệu giả lập (mock data) hoặc gọi API public đếm tổng quan từ backend (để làm sau).

**Mô hình hoạt động:**
Trang chủ (`/`) của `user-app` hiện tại đang tự động *redirect* sang `/login` hoặc `/home`. Ta sẽ sửa luồng này:
- `/` -> Sẽ trỏ về 컴 `LandingHub` (Trạm trung chuyển).
- Sub-domain dự kiến khi deploy: 
  - `user-app`: port `5173` (chứa Landing Hub và Portal Học viên)
  - `teacher-app`: port `5006` (Portal Giảng viên)
  - `admin-app`: port `5005` (Portal Admin)
  - `recruiter-app`: port `...` (Portal Tuyển dụng)

## 2. Danh Sách Màn Hình (Screens)

| # | Tên Component | Nơi đặt | Mục đích |
|---|-----|----------|-------------|
| 1 | `LandingHub.jsx` | `user-app/src/pages/LandingHub/` | Trang chủ đón lõng mọi truy cập, thiết kế Premium UI |
| 2 | `HeroSection.jsx` | `user-app/src/pages/LandingHub/components/` | Tiêu đề lớn, bắt mắt, hiệu ứng hạt/gradient |
| 3 | `RoleCards.jsx` | `user-app/src/pages/LandingHub/components/` | 4 thẻ chọn Role tương tác cao (Hover 3D, Glow effects) |
| 4 | `SocialProof.jsx` | `user-app/src/pages/LandingHub/components/` | Băng chuyền đối tác, con số ấn tượng |

## 3. Luồng Hoạt Động (User Journey)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 HÀNH TRÌNH: Khách lạ vừa biết đến cổng EduBridge-AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ Gõ địa chỉ trang web (hoặc localhost:5173) -> Hiện lên `LandingHub` rực rỡ.
2️⃣ Bị thu hút bởi thông điệp "Học Tập Không Giới Hạn - Nắm Bắt Cơ Hội Việc Làm".
3️⃣ Kéo xuống (Scroll) mượt mà thấy 4 thẻ lựa chọn Role:
   - **Thẻ 1: Học viên** -> Bấm vào -> Chuyển hướng sang `/home` (nếu có token) hoặc `/login` (của user-app).
   - **Thẻ 2: Giảng viên** -> Bấm vào -> Chuyển hướng sang `http://localhost:5006` (hoặc domain của teacher).
   - **Thẻ 3: Nhà tuyển dụng** -> Bấm vào -> Chuyển hướng sang domain/port của recruiter.
   - **Thẻ 4: Quản trị viên** -> Bấm vào -> Chuyển hướng sang `http://localhost:5005`.

## 4. Checklist Kiểm Tra (Acceptance Criteria & Test Cases)

### Tính năng: Giao diện Landing Hub Premium
SPECS Reference: BRIEF.md -> Thêm Menu Landing Hub

📝 TEST CASES:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-01: Truy cập Landing Hub thành công
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: User mở trình duyệt
When:  Truy cập vào `/` (root URL)
Then:  ✓ Giao diện LandingHub load lên nhanh chóng.
       ✓ Hiệu ứng hover/gradient không bị giật lag khung hình (60fps).
       ✓ Đầy đủ 4 Roles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TC-02: Điều hướng đúng Role
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Given: User đang ở màn hình Landing Hub
When:  Bấm vào nút "Tiếp tục với tư cách Học viên"
Then:  ✓ Hệ thống kiểm tra: Nếu đã login, vào `/home`. Ngược lại sang `/login`.

When:  Bấm vào nút "Tiếp tục với tư cách Giảng viên"
Then:  ✓ Trình duyệt mở sang cổng `5006` (Teacher Portal).

✅ Trải nghiệm:
  - Có hiệu ứng Glassmorphism.
  - Responsive: Trên điện thoại di động, 4 thẻ Role phải đóng thành cột dọc (Column) gọn gàng thay vì hàng ngang (Row).

---
*Tạo bởi AWF 2.1 - Design Phase*
