const BaseRule = require('../../../core/BaseRule');

/**
 * NoEnvFileRule: Chặn việc commit file .env (Bảo mật)
 */
class NoEnvFileRule extends BaseRule {
    constructor() {
        super('No .env file allowed', 'security', 'error');
    }

    /**
     * @param {object} context - Chứa danh sách files thay đổi
     */
    async check(context) {
        const files = context.files || [];
        
        if (files.some(file => file.includes('.env'))) {
            return {
                valid: false,
                error: 'CẢNH BÁO BẢO MẬT: Không được phép commit file .env lên Git.'
            };
        }

        return { valid: true };
    }
}

module.exports = NoEnvFileRule;
