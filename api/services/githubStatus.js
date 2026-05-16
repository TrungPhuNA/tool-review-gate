const axios = require('axios');

/**
 * GithubStatusService: Tích hợp với GitHub Status API
 * Giúp hiển thị dấu tích xanh/đỏ trên GitHub dựa trên kết quả review
 */
class GithubStatusService {
    /**
     * @param {string} repo - Định dạng "owner/repo" (ví dụ TrungPhuNA/tool-review-gate)
     * @param {string} sha - Hash của commit
     * @param {string} state - 'pending', 'success', 'error', 'failure'
     * @param {string} targetUrl - Link tới dashboard để xem chi tiết lỗi
     * @param {string} description - Mô tả ngắn (ví dụ "3 linter errors found")
     */
    static async updateStatus(repo, sha, state, targetUrl, description) {
        const token = process.env.GITHUB_TOKEN;
        
        if (!token) {
            console.warn('⚠️ [GitHub] GITHUB_TOKEN không tồn tại trong .env. Bỏ qua việc cập nhật trạng thái GitHub.');
            return;
        }

        const url = `https://api.github.com/repos/${repo}/statuses/${sha}`;

        try {
            await axios.post(url, {
                state,
                target_url: targetUrl,
                description: description.substring(0, 140), // Giới hạn ký tự của GitHub
                context: 'ReviewGate'
            }, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            console.log(`✅ [GitHub] Đã cập nhật trạng thái "${state}" cho commit ${sha.substring(0, 7)}`);
        } catch (error) {
            console.error(`❌ [GitHub] Lỗi khi cập nhật trạng thái:`, error.response?.data || error.message);
        }
    }
}

module.exports = GithubStatusService;
