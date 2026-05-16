# Refactor Plan: Worker Rule Engine (Multi-Language & Grouping)

Bản kế hoạch này tập trung vào việc tái cấu trúc thư mục `worker` để hỗ trợ hàng trăm dự án với nhiều ngôn ngữ khác nhau, đảm bảo tính dễ mở rộng và quản lý rule theo nhóm.

## 1. Cấu trúc thư mục mới (Proposed Structure)

Thư mục `worker/` sẽ được tổ chức lại như sau:

```text
worker/
├── core/
│   ├── engine.js           # Orchestrator (Điều phối chính)
│   ├── project-detector.js # Tự động nhận diện ngôn ngữ (PHP, Node, React)
│   └── rule-loader.js      # Nạp các rule tương ứng từ folder rules/
├── rules/
│   ├── common/             # Luật chung (Commit message, File size, Secrets...)
│   │   └── commit-message.js
│   ├── php-laravel/        # Luật riêng cho PHP Laravel
│   │   ├── security/       # Nhóm Security (Check .env, debug mode...)
│   │   ├── styling/        # Nhóm Styling (PSR-12 compliance)
│   │   └── performance/    # Nhóm Performance (N+1 query detection...)
│   ├── nodejs/             # Luật riêng cho NodeJS
│   │   ├── security/       # Nhóm Security (npm audit, insecure deps)
│   │   └── standard/       # Nhóm Standard (eslint, naming...)
│   └── reactjs/            # Luật riêng cho ReactJS
│       ├── hooks/          # Nhóm Hooks (Rules of hooks)
│       └── components/     # Nhóm Components (Naming, Props...)
└── index.js                # Entry point
```

---

## 2. Các tầng kiểm tra (Execution Layers)

Mỗi khi có một yêu cầu review, hệ thống sẽ chạy qua 3 tầng kiểm tra:

1.  **Layer 1: Common Rules:** Kiểm tra các tiêu chuẩn chung (Commit message phải đúng format, không chứa mật khẩu/secret key).
2.  **Layer 2: Project Detection:** Tự động phát hiện project thuộc loại nào (Laravel, Node hay React).
3.  **Layer 3: Language-Specific Rules:** Chạy các nhóm rule (Security, Styling, Performance) dành riêng cho ngôn ngữ đó.

---

## 3. Danh sách công việc (Task List)

### Giai đoạn 1: Xây dựng Core
- [ ] Thiết kế `BaseRule` class (mọi rule đều phải kế thừa từ đây).
- [ ] Hoàn thiện `ProjectDetector` (Quét `artisan`, `package.json`, `App.js`).
- [ ] Viết `RuleLoader` để tự động nạp file từ các thư mục con.

### Giai đoạn 2: Triển khai Rule cho 3 ngôn ngữ
- [ ] **PHP Laravel:**
    - [ ] Nhóm Security: Chặn commit file `.env`, check `APP_DEBUG=true`.
    - [ ] Nhóm Standard: Tích hợp `phpcs`.
- [ ] **NodeJS:**
    - [ ] Nhóm Standard: Tích hợp `eslint`.
    - [ ] Nhóm Security: Check `insecure packages` trong `package.json`.
- [ ] **ReactJS:**
    - [ ] Nhóm UI: Check cấu trúc component folder.
    - [ ] Nhóm Hooks: Đảm bảo tuân thủ Rules of Hooks.

### Giai đoạn 3: Tích hợp & Báo cáo
- [ ] Cập nhật API để trả về báo cáo phân nhóm (ví dụ: "Pass Security, Fail Styling").
- [ ] Cập nhật CLI `review-check` để hỗ trợ hiển thị lỗi theo nhóm.
