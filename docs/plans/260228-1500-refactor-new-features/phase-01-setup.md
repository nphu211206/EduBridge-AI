# Phase 01: Setup & Clean CSS
Status: ✅ Complete
Dependencies: None

## Objective
Dọn dẹp các file CSS thuần (LearningPath.css, SkillDNA.css, Achievements.css, TeamBuilder.css, Insights.css) vì chúng không đồng bộ với hệ thống Tailwind hiện tại của EduBridge. Chuyển đổi toàn bộ layout cơ bản sang utility classes.

## Requirements
### Functional
- [x] Xóa `import './*.css'` trong 5 màn hình.
- [x] Chuyển Grid/Flexbox từ CSS thuần sang các lớp Tailwind (`grid-cols-*`, `flex`, v.v.).

### Non-Functional
- [ ] Performance: Giảm kích thước file CSS.
- [ ] UI Consistency: Tuân thủ spacing và color themes của hệ thống EduBridge-AI.

## Implementation Steps
1. [x] Xóa/đổi tên các file `.css` cũ trong các thư mục features để ngừng áp dụng.
2. [x] Thiết lập Container nền tảng cho 5 màn hình sử dụng `max-w-7xl mx-auto px-4`.
3. [x] Chuyển các màu hardcode (`#3b82f6`, v.v.) sang cấu hình màu của theme (VD: `text-theme-primary`, `bg-blue-600`).

## Notes
Đây là bước đệm cần thiết trước khi đi sâu vào logic và Visual Polish ở các phase tiếp theo.

---
Next Phase: `/code phase-02`
