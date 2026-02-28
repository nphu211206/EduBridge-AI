# Phase 04: Refactor Industry Insights
Status: ✅ Complete
Dependencies: Phase 03

## Objective
Đại tu màn hình **Phân tích Ngành nghề (Industry Insights)** lên chuẩn PRODUCTION. Màn hình này chứa rất nhiều dữ liệu (Trending Skills, Skill Gaps, Job Recommendations), vì vậy ưu tiên cao nhất là tính ổn định, xử lý lỗi mượt mà khi thiếu dữ liệu (Resiliency) và giao diện trực quan, rõ ràng trên mọi kích thước màn hình.

## Requirements & Meticulous Planning
### 1. Functional & UI (Giao diện)
- [x] Xóa bỏ toàn bộ CSS thuần (`Insights.css`), sử dụng hệ thống Tailwind Grid/Flex.
- [x] **Hero Section:** Đưa thiết kế Glassmorphism vào header, sử dụng icon svg thay thế emoji đơn điệu.
- [x] **Trending Skills:** Hiển thị dạng thẻ (badge) nổi bật, có icon chỉ báo tăng trưởng (mũi tên xanh/đỏ).
- [x] **Skill Gaps:** Hiển thị dưới dạng thẻ cảnh báo (Warning card) để người dùng chú ý những kỹ năng hệ thống đang thiếu hụt.
- [x] **Job Recommendations:** Hiển thị dưới dạng Grid Card `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Phải có đầy đủ thông tin: Chức danh, Công ty, Lương (nếu có), Skill match tỷ lệ %.
- [x] **Filter Lĩnh vực (Fields):** Đảm bảo các nút chọn lĩnh vực (Technical, Design, ...) hoạt động hoàn hảo, có trạng thái `active` sáng bừng để nhận diện.

### 2. UX & Animations (Trải nghiệm)
- [x] **Framer Motion:** Áp dụng hiệu ứng `stagger` (lần lượt xuất hiện) cho các thẻ Nghề nghiệp và Kỹ năng, tránh việc giật cục khi data vừa tải xong.
- [x] **Skeleton UI:** Xây dựng khung xương chờ tải chi tiết cho TỪNG thành phần (Trending load riêng, Job load riêng hình dáng thẻ). Không dùng text "Loading...".

### 3. Bulletproof Error Handling (Chống lỗi tuyệt đối)
- [x] **Data Fallbacks:** Mọi mảng dữ liệu (trending, gaps, jobs) phải có giá trị khởi tạo `[]` và luôn dùng optional chaining `?.`.
- [x] **Empty States:** Nếu API trả về mảng rỗng, hiển thị một Empty State đẹp mắt (icon + thông báo "Hiện chưa có dữ liệu cho lĩnh vực này"), **không được để trống trang**.
- [x] **API Failures:** Tích hợp `react-toastify`. Nếu API sập, UI không được crash mà phải hiện Toast báo lỗi và giữ lại giao diện khung rỗng tinh tế.
- [x] **Button States:** Không có nút nào bấm vào mà "không có phản hồi". Trong lúc đang tính toán/gọi API, các nút phải mờ đi (disabled) để tránh click đúp (Double-click prevention).

## Implementation Steps
1. [x] Mở file `Insights/index.jsx`.
2. [x] Viết lại toàn bộ cấu trúc Component với Tailwind CSS classes.
3. [x] Bọc các phần tử bằng `motion.div` từ `framer-motion`.
4. [x] Viết Skeleton Component giả lập giao diện 3 khối dữ liệu chính.
5. [x] Thay thế `console.error` gắt gao bằng `toast.error()`.

## Auto Test / Verification
- [x] Click thử tất cả các tab lĩnh vực xem dữ liệu có render không lỗi.
- [x] (Giả lập) Nếu dữ liệu Job rỗng dải ra Empty state thay vì bể layout.

---
Next Phase: `/code phase-05`
