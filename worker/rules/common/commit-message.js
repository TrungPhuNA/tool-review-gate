const BaseRule = require('../../core/BaseRule');

/**
 * CommitMessageRule: Kiểm tra định dạng message của commit
 */
class CommitMessageRule extends BaseRule {
    constructor() {
        super('Commit Message Format', 'common', 'error');
    }

    /**
     * @param {object} context - Chứa thuộc tính message
     */
    async check(context) {
        const message = context.message;
        
        if (!message) {
            return { valid: false, error: 'Không tìm thấy nội dung commit message.' };
        }

        // Regex mới: Chấp nhận [TAG], tag: hoặc revert:
        const regex = /^(\[.*\]|(feat|fix|chore|docs|style|refactor|perf|test|revert):).* /i;
        
        if (!regex.test(message)) {
            return {
                valid: false,
                error: 'Commit message sai định dạng. Ví dụ: "[FEAT] ..." hoặc "feat: ..."'
            };
        }

        if (message.length < 10) {
            return {
                valid: false,
                error: 'Commit message quá ngắn (tối thiểu 10 ký tự).'
            };
        }

        return { valid: true };
    }
}

module.exports = CommitMessageRule;
