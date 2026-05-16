const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Secret key dùng để verify webhook từ GitHub (Cần cấu hình trong .env)
const GITHUB_SECRET = process.env.GITHUB_SECRET || 'review_gate_secret';

app.use(bodyParser.json());

/**
 * Middleware xác thực chữ ký từ GitHub để đảm bảo bảo mật
 */
function verifySignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        return res.status(401).send('No signature found');
    }

    const hmac = crypto.createHmac('sha256', GITHUB_SECRET);
    // Lưu ý: Phải dùng raw body để hash chính xác nhất
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
        console.error('❌ Signature mismatch!');
        return res.status(401).send('Invalid signature');
    }
    next();
}

const ReviewEngine = require('../worker/engine');

/**
 * Endpoint tiếp nhận Webhook từ GitHub
 */
app.post('/webhook/github', async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    console.log(`\n🚀 Received GitHub event: ${event}`);

    // Xử lý sự kiện Push hoặc Pull Request
    if (event === 'push' || event === 'pull_request') {
        const repo = payload.repository?.full_name;
        const commitHash = event === 'push' ? payload.after : payload.pull_request?.head?.sha;
        const author = event === 'push' ? payload.pusher?.name : payload.pull_request?.user?.login;
        const commitMessage = payload.commits?.[0]?.message || 'No message';

        if (commitHash === '0000000000000000000000000000000000000000') {
            return res.status(200).send('Branch deletion ignored');
        }

        console.log(`-------------------------------------------`);
        console.log(`📦 Repo: ${repo}`);
        console.log(`🔑 Commit: ${commitHash}`);
        console.log(`👤 Author: ${author}`);
        console.log(`📝 Message: ${commitMessage}`);
        console.log(`-------------------------------------------`);

        // 1. Kiểm tra Commit Message
        const messageCheck = ReviewEngine.checkCommitMessage(commitMessage);
        
        if (!messageCheck.valid) {
            console.error(`❌ Review Failed: ${messageCheck.error}`);
            // Ở đây sau này sẽ gọi GitHub API để báo đỏ (Reject)
            return res.json({
                status: 'rejected',
                reason: messageCheck.error
            });
        }

        // 2. Chạy Linter (Quét code)
        const linterResult = await ReviewEngine.runLinter(commitHash);

        console.log(`✅ Review Passed! All checks completed.`);
        
        return res.json({
            status: 'accepted',
            details: { repo, commitHash, author, linter: linterResult }
        });
    }

    res.status(200).send('Event not handled');
});

// Trang chủ kiểm tra server
app.get('/', (req, res) => {
    res.send('ReviewGate API is up and running! 🚀');
});

app.listen(PORT, () => {
    console.log(`\n✅ ReviewGate API is running on http://localhost:${PORT}`);
    console.log(`🔗 Webhook URL: http://your-domain/webhook/github`);
});
