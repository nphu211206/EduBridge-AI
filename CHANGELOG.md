# Changelog - EduBridge AI

## [2026-03-01]
### Fixed
- **Database Connection**: Sửa lỗi timeout và từ chối kết nối bằng cách chuyển port sang 61654 (SQLEXPRESS) và tắt mã hóa SSL (`encrypt: false`).
- **User Authentication**:
  - Sửa lỗi schema bảng `Users`: Thêm các cột `TwoFAEnabled`, `TwoFASecret`, `AccountStatus`, `Status` bị thiếu.
  - Sửa lỗi `Invalid column name 'Password'`: Rename cột `PasswordHash` thành `Password` để khớp với Sequelize Model.
  - FIX: Cập nhật mật khẩu dummy thành mã hash BCrypt thật của '123456' để có thể đăng nhập.
- **Microservices Config**: Tự động vá (patch) file `db.js` và `database.js` trong toàn bộ project để hỗ trợ port 61654.
- **Security Tables**: Tạo bổ sung bảng `LoginAttempts` và `RegistrationAttempts` bị thiếu trong bản master SQL.

### Added
- Thêm script `patch_users.sql` để bảo trì nhanh schema người dùng.
- Thêm hệ thống `.brain/` (brain.json & session.json) để AI không bao giờ quên cấu hình dự án.

## [2026-02-28]
### Added
- Tích hợp 5 tính năng AI (portfolio-service & career-service) vào `user-app`.
- Cấu hình Proxy Gateway tại `user-service` (Port 5001) để điều hướng các route `/api/skill-dna`, `/api/learning-path`...
