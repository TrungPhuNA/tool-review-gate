const BaseRule = require('../../../core/BaseRule');

/**
 * PSRStandardRule: Kiểm tra sơ bộ tiêu chuẩn PSR (giả lập)
 */
class PSRStandardRule extends BaseRule {
    constructor() {
        super('PSR Standard Check', 'styling', 'warning');
    }

    async check(context) {
        // Trong thực tế sẽ gọi phpcs tại đây
        // Bản test: Chỉ đưa ra cảnh báo nhắc nhở
        return {
            valid: false,
            error: 'Nhắc nhở: Hãy đảm bảo code tuân thủ PSR-12. Chạy "composer lint" trước khi push.'
        };
    }
}

module.exports = PSRStandardRule;
