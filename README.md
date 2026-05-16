# 🚀 Tool Review Gate - Hướng dẫn sử dụng

Hệ thống kiểm soát chất lượng commit tập trung cho nhiều dự án.

## 1. Cài đặt lệnh kiểm tra toàn cục (CLI)

Để có thể đứng ở bất kỳ project nào và gõ lệnh kiểm tra, hãy thực hiện:

```bash
cd /Users/phuphan/Documents/work/tool/tool-review-gate
npm link
```

Bây giờ bạn có thể dùng lệnh: `review-check` để kiểm tra commit cuối cùng của project hiện tại.

---

## 2. Tự động hóa cho 100+ Project (Global Hooks)

Đây là cách tốt nhất để ép buộc mọi project trên máy phải tuân thủ quy tắc commit mà không cần cài đặt từng cái.

### Bước 1: Tạo thư mục hook dùng chung
```bash
mkdir -p ~/.git-global-hooks/hooks
```

### Bước 2: Tạo file điều hướng hook
```bash
echo "#!/bin/bash
review-check \$1" > ~/.git-global-hooks/hooks/commit-msg

chmod +x ~/.git-global-hooks/hooks/commit-msg
```

### Bước 3: Kích hoạt toàn cầu
```bash
git config --global core.hooksPath ~/.git-global-hooks/hooks
```

**Kể từ giờ:** Mỗi khi bạn gõ `git commit` ở bất kỳ đâu, hệ thống sẽ tự động chạy review.

---

## 3. Cách tùy chỉnh Luật (Rules)

Để thay đổi các quy tắc (ví dụ: đổi prefix message, thêm linter), bạn chỉ cần sửa file sau:

📍 Path: `/Users/phuphan/Documents/work/tool/tool-review-gate/worker/engine.js`

Mọi thay đổi trong file này sẽ có hiệu lực ngay lập tức cho tất cả các project trên máy bạn.

---

## 4. Cấu trúc thư mục dự án

- `/api`: Backend xử lý Webhook từ GitHub/GitLab (Dùng cho CI/CD sau này).
- `/worker`: Chứa "Bộ não" `engine.js` xử lý logic review code.
- `/ui`: (Sắp tới) Giao diện quản lý lịch sử review.
- `local-check.js`: File cầu nối giữa Git và Review Engine.

---

## 5. Gỡ bỏ (Nếu cần)

Nếu bạn muốn tắt tính năng tự động cho mọi project:
```bash
git config --global --unset core.hooksPath
```
