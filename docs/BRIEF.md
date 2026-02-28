# 💡 BRIEF: Nền Tảng EduBridge-AI Toàn Diện

**Ngày tạo:** 28/02/2026
**Brainstorm cùng:** Vibe Coder (Bạn)

---

## 1. VẤN ĐỀ CẦN GIẢI QUYẾT
1. **Truy cập khó khăn:** Hiện tại hệ thống có 3 ứng dụng tách rời (Học viên, Admin, Giảng viên) chạy ở 3 cổng (`5173`, `5005`, `5006`). Người dùng gặp khó khăn không biết phải gõ địa chỉ nào để vào đúng nơi mình cần. "Chả lẽ học sinh lại bắt tự gõ localhost?"
2. **Thiếu tổng quan bên trong:** Cần một bản giải trình rõ ràng bên trong từng trang web này "làm được cái gì" trước khi tung ra thị trường.

## 2. GIẢI PHÁP ĐỀ XUẤT
1. **Về tên miền & truy cập:** Xây dựng một **Thanh điều hướng (Hub) chung** tại trang chủ (User App). Từ trang chủ này, Giáo viên hoặc Admin sẽ có nút bấm để chuyển hướng tức thì sang trang của họ. Khi tung lên mạng thực tế (Deploy), ta sẽ dùng "Tên miền phụ" (sub-domain). Ví dụ: `edubridge.com` (Học viên), `admin.edubridge.com`, `teacher.edubridge.com`.
2. **Về chức năng cốt lõi (Bên trong ứng dụng làm gì):**
   - **User App (Học viên):** Vào xem khóa học, xem Vượt chướng ngại vật/Roadmap, thanh toán tự động qua VNPAY/VietQR, thực hành code trực tiếp trên web bằng Docker ảo hóa hoặc Console, và nhắn tin (Realtime Chat) với người hướng dẫn.
   - **Admin App (Quản lý):** Bảng tổng quan doanh thu (Dashboard), Quản trị Nạp/Rút tiền, Cấp quyền giảng viên, Duyệt khóa học trước khi hiển thị ra ngoài trang chủ.
   - **Teacher App (Giảng viên):** Mở lớp, Upload video bài giảng định dạng Course/Modules/Lessons, theo dõi ai đã mua khóa học của mình, Quản trị học sinh (StudentsPage).

## 3. ĐỐI TƯỢNG SỬ DỤNG
- **Primary:** Học viên, Sinh viên, Sinh viên tìm lộ trình học Lập trình.
- **Secondary:** Giảng viên đăng bán khóa học (Instructor).
- **Tertiary:** Ban quản trị sàn giao dịch giáo dục (Admin).

## 4. TÌNH TRẠNG HIỆN TẠI & TÍNH NĂNG CÒN THIẾU

### 🚀 MVP (Đã hoàn thành được bao nhiêu phần trăm?):
Hệ thống **ĐÃ CÓ** khung sườn Backend và Frontend vững chắc.
- [x] Đăng nhập & Xác thực (JWT, Email OTP).
- [x] Lõi hiển thị khóa học & Cấu trúc DB.
- [x] Tích hợp thanh toán VNPAY an toàn.

### 🎯 THEO KẾ HOẠCH CẦN BỔ SUNG NGAY (Phase 1):
- [ ] Gắn nút/Menu chung ở Trang Chủ (User App) để dẫn link trực tiếp sang Admin & Teacher Portal.
- [ ] Logic phân luồng học viên (Student) không được mò sang Teacher/Admin Portal.
- [ ] Hoàn thiện Code Editor ảo (nếu user muốn thực hành bài tập code).

### 💭 Phase 2 (Khi mang lên Internet thật):
- [ ] Cài đặt Gateway (Nginx/Traefik) bọc 3 cái localhost lại thành 1 Tên Miền ảo trên máy anh. Hoặc tiến hành Deploy thẳng lên Server.

## 6. ƯỚC TÍNH SƠ BỘ
- **Độ phức tạp:** Trung bình (Hệ thống lớn nhưng đã dựng xong khung, chỉ cần hàn gắn lại).
- **BƯỚC TIẾP THEO:** Em đã tạo file `/plan` dưới đây để chuẩn bị vào việc code!
