# 🚀 Tool Review Gate - Hướng dẫn sử dụng

Hệ thống kiểm soát chất lượng commit tập trung cho nhiều dự án (PHP Laravel, NodeJS, ReactJS).

## 1. Kiểm tra mã nguồn (CLI)

Bạn có thể chạy lệnh này bất kỳ lúc nào để kiểm tra code ngay lập tức (kể cả khi chưa `git add`):

```bash
review-check
```
*Hệ thống sẽ quét toàn bộ các file bạn đang sửa dở và báo lỗi nếu có.*

---

## 2. Cách kích hoạt "Trạm gác" tự động (Git Hooks)

Để hệ thống tự động chặn các commit lỗi, hãy di chuyển vào thư mục dự án và chạy:

```bash
review-check init
```

**Kết quả:** Mỗi khi bạn gõ `git commit`, hệ thống sẽ tự động chạy review. Nếu code vi phạm quy tắc, lệnh commit sẽ bị chặn đứng (Rejected).

---

### Cách B: Kích hoạt toàn cầu (Cho tất cả dự án trên máy)
```bash
git config --global core.hooksPath ~/.git-global-hooks/hooks
```
*(Xem chi tiết cấu hình tại mục 2 của bản cũ nếu cần dùng cách này)*

---

## 3. Giao diện quản lý (Dashboard)

Hệ thống cung cấp giao diện Web Premium để theo dõi lịch sử review và lỗi chi tiết.

### Bước 1: Khởi động API & Database
```bash
cd api
# Cấu hình .env (DB_NAME, DB_USER, DB_PASS...)
node index.js
```

### Bước 2: Khởi động giao diện
```bash
cd ui
npm run dev
```
Truy cập: `http://localhost:5173` để xem Dashboard.

---

## 4. Cách bổ sung Luật (Rules) mới

Hệ thống được thiết kế dạng Modular. Để thêm rule mới, bạn chỉ cần tạo file `.js` vào đúng thư mục ngôn ngữ:

📍 Path: `worker/rules/[ngôn-ngữ]/[nhóm-rule]/tên-rule.js`

**Ví dụ:** Muốn thêm rule kiểm tra bảo mật cho PHP, hãy tạo file trong `worker/rules/php-laravel/security/`. Hệ thống sẽ tự động nạp mà không cần khởi động lại.

---

## 5. Cấu trúc thư mục

- `/worker`: Chứa bộ máy quét (Engine) và các Rules (NodeJS, PHP, React).
- `/api`: Backend (NodeJS + MySQL) lưu trữ lịch sử review.
- `/ui`: Dashboard (ReactJS + Tailwind CSS) hiển thị thống kê và lỗi chi tiết.
- `local-check.js`: CLI entry point cho lệnh `review-check`.

---

## 6. Gỡ bỏ bảo vệ

Nếu bạn muốn tắt tính năng tự động cho một dự án, hãy xóa file hook:
```bash
rm .git/hooks/pre-commit
```
Hoặc tắt toàn cầu:
```bash
git config --global --unset core.hooksPath
```
