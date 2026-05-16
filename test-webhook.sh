#!/bin/bash

# Cấu hình
URL="http://localhost:3000/webhook/github"
SECRET="review_gate_secret"

# 1. Giả lập dữ liệu từ GitHub (Event: Push)
PAYLOAD='{
  "repository": {
    "full_name": "phuphan/tool-review-gate"
  },
  "after": "7c92f1a3b5c4d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
  "pusher": {
    "name": "phuphan"
  },
  "commits": [
    {
      "message": "[FEAT] Setup review gate engine"
    }
  ]
}'

# 2. Tính toán Signature (HMAC SHA256) để vượt qua lớp bảo mật
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

echo "-------------------------------------------------------"
echo "🚀 Đang gửi Mock Webhook tới: $URL"
echo "🔑 Signature: sha256=$SIGNATURE"
echo "-------------------------------------------------------"

# 3. Gửi Request bằng CURL
curl -i -X POST "$URL" \
     -H "Content-Type: application/json" \
     -H "X-GitHub-Event: push" \
     -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
     -d "$PAYLOAD"

echo -e "\n\n✅ Đã gửi xong. Hãy kiểm tra Terminal đang chạy Node API."
