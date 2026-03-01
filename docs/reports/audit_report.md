# MÀN KHÁM TỔNG QUÁT DỰ ÁN (Code Audit) - 01/03/2026

Chào anh! Khang (Chuyên gia bảo mật & Hệ thống) đây. Vừa rồi anh dùng lệnh `/run` và `/audit` cùng lúc, nên em kết hợp cả việc chạy thử dự án trên Github của anh và khám sức khỏe toàn diện cho nó.

Dưới đây là Bệnh Án mà em xuất ra.

---

## 🏥 TÓM TẮT SỨC KHỎE DỰ ÁN

*   🔴 **Lỗi Critical (Phải sửa ngay để chạy được):** 3
*   🟡 **Cảnh báo (Nên sửa để Code xịn hơn):** 2
*   🟢 **Khuyên dùng (Tùy chọn):** 1

---

## 🔴 CÁC LỖI CRITICAL (GÂY SỤP HỆ THỐNG / CHẠY KHÔNG LÊN)

### 1. 🚨 Bệnh: Tim ngừng đập (Lỗi không kết nối được Database)
*   **Triệu chứng:** Khi em chạy `npm run start:all`, một loạt các Service (User, Admin, Teacher) thi nhau báo lỗi: `Database Connection Failed`.
*   **Chẩn đoán:** File `.env` của dự án đang trỏ vào `EduBridgeDB` hoặc tài khoản `sa` với `YourPassword`. Nhưng máy của anh hiện tại **CHƯA ĐƯỢC CÀI ĐẶT Microsoft SQL Server (hoặc chưa bật).**
*   **Hậu quả:** App không thể đọc/ghi dữ liệu, nên nó văng lỗi từ chối chạy. App Front-end load lên sẽ bị "Trắng trang".
*   **Phác đồ:** Anh cần tải và cài đặt Microsoft SQL Server Express 2019/2022 và khởi tạo lại Database với chuỗi kết nối cục bộ. Nếu anh đã cài rồi, hãy kiểm tra lại mật khẩu `sa` trong file `.env` bằng mật khẩu của anh.

### 2. 🚨 Bệnh: Tuột xích (Lỗi không build được Frontend)
*   **Triệu chứng:** Thư mục `frontend/user-app` không chạy được vì báo lỗi: `'vite' is not recognized as an internal or external command`.
*   **Chẩn đoán:** Team phát triển của anh đã đưa lên Github mã nguồn, nhưng anh chưa bao cài đặt các "phụ tùng" đi liền với nó. Gõ `npm install` ở thư mục Frontend bị khựng giữa chừng.
*   **Phác đồ:** Phải chui vào tận từng thư mục (user-app, admin-app) để cài đặt (`npm install`).

### 3. 🚨 Bệnh: Lộ chìa khóa nhà (Bảo Mật JWT Secret)
*   **Triệu chứng:** Trong file `user-service/app.js` dòng 27, em thấy đoạn code này: `process.env.JWT_SECRET = 'secret_key';` (Khi thiếu biến môi trường).
*   **Hậu quả:** Bất kỳ ai biết được chuỗi `secret_key` này đều có thể tự tạo ra một cái "Chìa khóa vạn năng" giả mạo thành Admin và đăng nhập vào hệ thống của anh.
*   **Phác đồ:** Bắt buộc phải mã hóa `JWT_SECRET` trong file `.env` bằng một dải ký tự loạn xạ, và tuyệt đối bỏ ngay dòng fallback trên `app.js`.

---

## 🟡 CẢNH BÁO (NÊN SỬA ĐỂ TỐT HƠN)

### 4. ⚠️ Bệnh: Tha rác về nhà (Không có `node_modules` trong các `.gitignore` con)
*   **Triệu chứng:** Trong các thư mục Service, nhiều chỗ dev sơ suất không khai báo kỹ file nào không đẩy lên Github.
*   **Hậu quả:** Mã nguồn bị "mập" ảo lên hàng trăm MB (Thậm chí là vài GB) vì đẩy luôn cái thư mục `.node_modules`. Rất nặng máy lúc clone về.

### 5. ⚠️ Bệnh: Gọi nhau ì ạch (Thiếu Port Mapping cho Docker)
*   Mặc dù có sẵn các luồng chạy cho PM2 và Node.js cục bộ. Tuy nhiên lại chưa có cơ chế Docker-Compose tự động liên kết các Container lại với nhau. Giả sử đưa lên môi trường thật là các máy tính (Microservices) sẽ không nhìn thấy nhau. 

---

## 📋 HƯỚNG GIẢI QUYẾT (NEXT STEPS)

Em đã lưu lại báo cáo này trong máy. Việc hiện tại là **Máy anh chưa cài hoặc chưa cấu hình SQL Server Database**.

Gõ số để chọn bước tiếp:
1️⃣ **Hướng dẫn em cài đặt và config SQL Server** (Để sửa Lỗi 1)
2️⃣ **Giúp em Fix lỗi 'vite' không chạy được** (Sửa lỗi 2)
3️⃣ **🔧 FIX ALL - Khang tự động Fix các lỗi bảo mật Code (Lỗi 3 ở trên)**
4️⃣ **Tạm thời lưu lại và dùng tính năng khác.**
