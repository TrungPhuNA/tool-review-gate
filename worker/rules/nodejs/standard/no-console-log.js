const BaseRule = require('../../../core/BaseRule');

/**
 * NoConsoleLogRule: Chặn việc quên xóa console.log khi đẩy lên production
 */
class NoConsoleLogRule extends BaseRule {
    constructor() {
        super('No console.log in production', 'standard', 'warning');
    }

    async check(context) {
        const codeDiff = context.diff || '';
        
        if (codeDiff.includes('console.log(')) {
            return {
                valid: false,
                error: 'Nhắc nhở: Phát hiện console.log() trong code. Hãy xóa bỏ trước khi merge.'
            };
        }

        return { valid: true };
    }
}

module.exports = NoConsoleLogRule;
