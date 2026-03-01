━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 HANDOVER DOCUMENT - EduBridge AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Đang làm: Hệ thống Đăng nhập & Kết nối Cơ sở dữ liệu (MSSQL)
🔢 Đến bước: Đã sửa được User App (Student Login) ✓

✅ ĐÃ XONG:
   - Database Connection: Chuyển sang Port 61654, SQLEXPRESS, Disable SSL.
   - User Schema: Vá lỗi cột `Password`, `Status`, `AccountStatus`, `TwoFA`.
   - Dummy Data: Hash lại mật khẩu `123456` chuẩn BCrypt.
   - Login flow: Đã test bằng Browser (Student bypass 500 error).

⏳ CÒN LẠI:
   - **BLOCKER**: Bảng `UserEmails` (về email phụ) đang thiếu trong DB. Cần tạo bảng này hoặc xóa JOIN logic trong `authController.js` (line 189).
   - Test Roles: Verify Admin, Teacher, Recruiter apps.
   - UI Review: Kiểm tra toàn bộ nút bấm sau khi Login thành công.

🔧 QUYẾT ĐỊNH QUAN TRỌNG:
   - Dùng port explicit 61654 thay vì dynamic port của SQL Server để tránh lỗi connection.
   - Không dùng `PasswordHash` (mặc định của master SQL) mà đổi thành `Password` để khới với Sequelize Models.

⚠️ LƯU Ý CHO SESSION SAU:
   - File `services/user-service/controllers/authController.js` cần được refactor để xử lý lỗi JOIN `UserEmails`.
   - Script vá nhanh: `patch_users.sql`.

📁 FILES QUAN TRỌNG:
   - `.brain/brain.json` (Cấu hình project)
   - `.brain/session.json` (Tiến độ hiện tại)
   - `CHANGELOG.md` (Lịch sử thay đổi)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Đã lưu! Để tiếp tục: Gõ /recap
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
