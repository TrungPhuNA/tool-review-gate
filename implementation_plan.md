# Implementation Plan: Tool Review Gate (MVP)

Dự án này xây dựng một hệ thống trung gian (Gatekeeper) để kiểm tra chất lượng code và commit message trước khi cho phép merge vào branch chính.

## 1. Kiến trúc hệ thống (Architecture)

Hệ thống được chia thành 3 phần chính nằm trong thư mục gốc `tool-review-gate/`:

*   **`/api` (NodeJS/Express):** Trung tâm điều phối. Tiếp nhận Webhook, quản lý cấu hình Rule và lưu trữ kết quả.
*   **`/worker` (NodeJS):** Thực thi các tác vụ nặng như clone code, chạy Linter (ESLint, PHPCS), và phân tích tĩnh.
*   **`/ui` (ReactJS):** Giao diện quản trị để xem lịch sử review, chi tiết lỗi và quản lý các rule.

---

## 2. Danh sách công việc (Task List)

### Giai đoạn 1: Khởi tạo & Nhận diện (Setup & Webhook)
- [ ] Khởi tạo cấu hình thư mục gốc (`api`, `worker`, `ui`).
- [ ] **API (NodeJS):** Xây dựng Endpoint nhận Webhook từ GitHub.
    - [ ] Xử lý Payload (lấy thông tin repo, commit hash, author).
    - [ ] Kiểm tra Signature để bảo mật (X-Hub-Signature).
- [ ] **Database:** Sử dụng MongoDB hoặc PostgreSQL (Sequelize/Prisma).

### Giai đoạn 2: Bộ máy kiểm tra (Core Engine - Worker)
- [ ] **Worker (NodeJS):** Xây dựng logic chạy kiểm tra.
    - [ ] **Message Check:** Dùng Regex kiểm tra format commit message (ví dụ: `[JIRA-123] description`).
    - [ ] **Linter Runner:** Tích hợp `eslint` (cho JS) và `php_codesniffer` (cho PHP).

### Giai đoạn 3: Phản hồi & Chặn commit (Gatekeeping)
- [ ] **API (NodeJS):** Tích hợp GitHub Status API.
    - [ ] Gửi trạng thái `pending` khi bắt đầu check.
    - [ ] Gửi trạng thái `success` hoặc `failure` kèm link chi tiết lỗi.
- [ ] Cấu hình **Branch Protection** trên GitHub.

### Giai đoạn 4: Dashboard (UI)
- [ ] **ReactJS:** Xây dựng màn hình danh sách các Commit gần đây.
- [ ] **Màn hình chi tiết:** Hiển thị chi tiết các dòng code bị lỗi.
