const BaseRule = require('../../../core/BaseRule');
const path = require('path');

/**
 * PascalCaseComponentRule: Ép buộc đặt tên Component phải viết hoa chữ cái đầu
 */
class PascalCaseComponentRule extends BaseRule {
    constructor() {
        super('PascalCase Component Naming', 'components', 'error');
    }

    async check(context) {
        const files = context.files || [];
        // Chỉ quét các file trong thư mục components
        const componentFiles = files.filter(f => f.includes('components/') && (f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.tsx')));
        
        for (const file of componentFiles) {
            const fileName = path.basename(file);
            // Kiểm tra chữ cái đầu có viết hoa không
            if (fileName[0] !== fileName[0].toUpperCase()) {
                return {
                    valid: false,
                    error: `Lỗi đặt tên: File component "${fileName}" phải bắt đầu bằng chữ viết hoa (PascalCase).`
                };
            }
        }

        return { valid: true };
    }
}

module.exports = PascalCaseComponentRule;
