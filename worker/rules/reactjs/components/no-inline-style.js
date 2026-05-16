const BaseRule = require('../../../core/BaseRule');

/**
 * NoInlineStyleRule: Khuyến khích không dùng inline style (style={{...}})
 */
class NoInlineStyleRule extends BaseRule {
    constructor() {
        super('No Inline Styles', 'components', 'warning');
    }

    async check(context) {
        const diff = context.diff || '';
        
        if (diff.includes('style={{')) {
            return {
                valid: false,
                error: 'Khuyên dùng: Hạn chế sử dụng inline style. Hãy sử dụng CSS Modules hoặc Styled Components để tối ưu hiệu năng.'
            };
        }

        return { valid: true };
    }
}

module.exports = NoInlineStyleRule;
