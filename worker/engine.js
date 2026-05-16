/**
 * ReviewEngine: Bộ máy phân tích code và commit
 */
class ReviewEngine {
    /**
     * Kiểm tra định dạng Commit Message
     * Rule mẫu: Message phải có tiền tố là mã JIRA hoặc tag (ví dụ: [FE-123], [FIX], [FEAT])
     */
    static checkCommitMessage(message) {
        console.log(`[Worker] Đang kiểm tra message: "${message}"`);
        
        const regex = /^(\[.*\]|revert:).* /i;
        if (!regex.test(message)) {
            return {
                valid: false,
                error: 'Commit message sai định dạng. Ví dụ đúng: "[FEAT] Thêm chức năng login"'
            };
        }
        
        if (message.length < 10) {
            return {
                valid: false,
                error: 'Commit message quá ngắn.'
            };
        }

        return { valid: true };
    }

    /**
     * Giả lập việc chạy Linter (ESLint/PHPCS)
     */
    static async runLinter(commitHash) {
        console.log(`[Worker] Đang chạy Static Analysis cho commit: ${commitHash}...`);
        
        // Giả lập thời gian quét code
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Trong bản test, chúng ta mặc định là thành công
        return {
            status: 'success',
            errors: []
        };
    }
}

module.exports = ReviewEngine;
