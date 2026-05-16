require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const ReviewEngine = require('../worker/core/engine');
const Review = require('./models/Review');
const GithubStatusService = require('./services/githubStatus');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // Cho phép React Frontend gọi API

/**
 * Middleware kiểm tra Signature từ GitHub (Bảo mật)
 */
function verifySignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return res.status(401).send('Missing signature');

    const hmac = crypto.createHmac('sha256', process.env.GITHUB_SECRET || 'test_secret');
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) return res.status(401).send('Invalid signature');
    next();
}

/**
 * Webhook nhận commit từ GitHub
 */
app.post('/webhook/github', async (req, res) => {
    const payload = req.body;
    const repo = payload.repository?.full_name;
    const commitHash = payload.after;
    const author = payload.pusher?.name;
    const commitMessage = payload.commits?.[0]?.message || 'No message';

    if (!repo || !commitHash) return res.status(400).send('Invalid payload');

    console.log(`\n🚀 [Webhook] Nhận commit mới: ${commitHash.substring(0, 7)} từ ${repo}`);

    // 1. Gửi trạng thái PENDING lên GitHub
    await GithubStatusService.updateStatus(repo, commitHash, 'pending', 'http://localhost:5173', 'ReviewGate đang kiểm tra code...');

    // 2. Chạy bộ máy Review
    // Trong môi trường Webhook, chúng ta giả định context là project được gửi tới
    // (Thực tế cần clone repo về một thư mục tạm, ở đây demo dùng process.cwd)
    const result = await ReviewEngine.runReview(process.cwd(), {
        message: commitMessage,
        files: payload.commits?.[0]?.modified || []
    });

    // 3. Lưu kết quả vào Database
    const reviewRecord = await Review.create({
        repo,
        commitHash,
        author,
        message: commitMessage,
        status: result.valid ? 'accepted' : 'rejected',
        projectType: result.projectType,
        details: result
    });

    // 4. Cập nhật kết quả cuối cùng lên GitHub
    const state = result.valid ? 'success' : 'failure';
    const description = result.valid ? 'Tuyệt vời! Code của bạn đã vượt qua tất cả các kiểm tra.' : `Phát hiện lỗi vi phạm. Vui lòng kiểm tra lại.`;
    
    // Link tới chi tiết bản review trên Dashboard
    const detailUrl = `http://localhost:5173/review/${reviewRecord.id}`;
    await GithubStatusService.updateStatus(repo, commitHash, state, detailUrl, description);

    res.json({ status: 'ok', reviewId: reviewRecord.id });
});

/**
 * API Lấy danh sách reviews cho Dashboard
 */
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.findAll({
            order: [['createdAt', 'DESC']],
            limit: 20
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API Lấy chi tiết một bản review
 */
app.get('/api/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ error: 'Not found' });
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API Nhận kết quả review từ lệnh local (review-check)
 */
app.post('/api/reviews/local', async (req, res) => {
    try {
        const review = await Review.create(req.body);
        res.json({ status: 'ok', id: review.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n✅ Review Gate API is running on http://localhost:${PORT}`);
});
