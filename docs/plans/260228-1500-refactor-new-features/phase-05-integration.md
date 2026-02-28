# Phase 05: Integration & Error Handling
Status: ✅ Complete
Dependencies: Phase 04

## Objective
Tích hợp sâu 5 tính năng cốt lõi (Learning Path, Skill DNA, Achievements, Team Builder, Insights) vào kiến trúc Backend và API có sẵn của dự án. Loại bỏ các lệnh `fetch()` cơ bản và tự thủ công nối Token, thay vào đó sử dụng `axiosClient` đã được xây dựng sẵn trong `src/api/config.js` nhằm tận dụng hệ thống Interceptors (tự động gắn token, tự động refresh token khi hết hạn, tự động đá về trang đăng nhập nếu lỗi 401).

## Meticulous Requirements
### 1. API Standardization (Chuẩn hóa API)
- [x] Chuyển đổi toàn bộ `fetch()` sang `axiosClient` (ví dụ: `axiosClient.get('/insights/trending')`).
- [x] Xóa bỏ đoạn code thủ công `const token = localStorage.getItem('token');` trong các Component vì `axiosClient` đã tự động làm việc này ở Request Interceptor.
- [x] Xóa cấu hình `{ headers: { Authorization: ... } }` thủ công đi kèm các API request.

### 2. Global Error Handling (Bắt lỗi toàn cục)
- [x] Xử lý lại các khối `try...catch`. Vì `axios` ném lỗi khác kiểu với `fetch()`, cần trích xuất thông báo lỗi chính xác từ `error.response?.data?.message || error.message` trước khi hiển thị Toast cho người dùng.
- [x] Tận dụng luồng xử lý lỗi tự động (như mạng chậm `timeout`) đã được thiết lập sẵn trong `config.js` của dự án.

## Files to Modify
- `frontend/user-app/src/pages/LearningPath/index.jsx`
- `frontend/user-app/src/pages/SkillDNA/index.jsx`
- `frontend/user-app/src/pages/Achievements/index.jsx`
- `frontend/user-app/src/pages/TeamBuilder/index.jsx`
- `frontend/user-app/src/pages/Insights/index.jsx`

## Implementation Steps
1. [x] Thay thế lệnh import ở đầu file: Xóa `PORTFOLIO_API_URL` và import `axiosClient`.
2. [x] Sửa các hàm gọi API sang chuẩn cấu trúc Axios (chọn đúng `.get()`, `.post()`).
3. [x] Cập nhật lại logic parse JSON (`await res.json()` không còn cần thiết vì Axios tự động parse `res.data`).
4. [x] Viết lại hàm bắt lỗi để lấy chính xác thông báo từ API trả về.

## Verification
- [x] Build thành công không có Warning về import chưa dùng.
- [x] Request gọi đi xem thẻ Network (F12) có tự động gắn trường Authorization Bearer hay không.

---
Next Phase: `/code phase-06`
