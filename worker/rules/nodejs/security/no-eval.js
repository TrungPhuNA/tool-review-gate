const BaseRule = require('../../../core/BaseRule');

/**
 * NoEvalRule: Chặn việc sử dụng hàm eval() cực kỳ nguy hiểm
 */
class NoEvalRule extends BaseRule {
    constructor() {
        super('No eval() usage', 'security', 'error');
    }

    async check(context) {
        // Trong thực tế, context.diff sẽ chứa nội dung code thay đổi
        const codeDiff = context.diff || '';
        
        if (codeDiff.includes('eval(')) {
            return {
                valid: false,
                error: 'CẢNH BÁO BẢO MẬT: Phát hiện sử dụng hàm eval(). Vui lòng tìm giải pháp thay thế an toàn hơn.'
            };
        }

        return { valid: true };
    }
}

module.exports = NoEvalRule;
