# Phase 02: Refactor Learning Path & Skill DNA
Status: ✅ Complete
Dependencies: Phase 01

## Objective
Nâng cấp hai tính năng cốt lõi là Learning Path (Lộ trình học) và Skill DNA (Bản đồ năng lực) lên chuẩn PRODUCTION. Tập trung vào việc thay thế CSS thuần bằng Tailwind CSS, thêm các trạng thái tải mượt mà (Loading Skeletons) và cải thiện cơ chế thông báo lỗi.

## Requirements
### Functional
- [x] **Learning Path:** Tái cấu trúc giao diện danh sách lộ trình và chi tiết các milestone sử dụng Tailwind grid & flexbox.
- [x] **Learning Path:** Thay thế `alert()` bằng các thông báo UI tích hợp (hoặc React Toastify nếu có).
- [x] **Skill DNA:** Chuyển đổi layout hiển thị thông tin chi tiết và biểu đồ Canvas sang Tailwind responsive.
- [x] **Cả hai:** Thêm Loading Spinner hoặc Skeleton bóng bẩy thay vì thẻ text "Loading..." đơn điệu.

### Non-Functional
- [x] Đảm bảo tính khả dụng trên Mobile (Responsive).
- [x] Dùng style Glassmorphism nhẹ (bg-white/10, backdrop-blur) cho các thẻ (Cards) nếu phù hợp với theme hiện tại.

## Implementation Steps
1. [x] Cập nhật `LearningPath/index.jsx`: Chuyển đổi các class `lp-hero`, `lp-create`, `path-card` sang utility classes.
2. [x] Cập nhật `SkillDNA/index.jsx`: Chuyển đổi `dna-hero`, `dna-content`, `dna-bar-item` sang utility classes.
3. [x] Chạy và trực quan hóa kết quả (nếu Backend SQL có thể connect, ngược lại đảm bảo code syntax & logic đúng).

---
Next Phase: `/code phase-03`
