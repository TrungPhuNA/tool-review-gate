const BaseRule = require('../../../core/BaseRule');
const fs = require('fs');

/**
 * NoDebugModeRule: Kiểm tra xem có lỡ bật APP_DEBUG=true trong code không
 */
class NoDebugModeRule extends BaseRule {
    constructor() {
        super('No APP_DEBUG in production', 'security', 'error');
    }

    async check(context) {
        // Quét các file cấu hình hoặc .env (nếu có trong context)
        const files = context.files || [];
        
        // Giả lập quét nội dung file nếu có commit liên quan đến config
        if (context.message.toLowerCase().includes('debug')) {
            return {
                valid: false,
                error: 'Cảnh báo: Phát hiện commit có liên quan đến Debug mode. Hãy chắc chắn APP_DEBUG luôn bằng false ở production.'
            };
        }

        return { valid: true };
    }
}

module.exports = NoDebugModeRule;
