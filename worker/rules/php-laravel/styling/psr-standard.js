const BaseRule = require('../../../core/BaseRule');

/**
 * PSRStandardRule: Kiểm tra sơ bộ tiêu chuẩn PSR (giả lập)
 */
class PSRStandardRule extends BaseRule {
    constructor() {
        super('PSR Standard Check', 'styling', 'warning');
    }

    async check(context) {
        const { files } = context;
        const phpFiles = files.filter(f => f.endsWith('.php'));
        
        if (phpFiles.length === 0) return { valid: true };

        const { execSync } = require('child_process');
        const issues = [];

        for (const file of phpFiles) {
            try {
                // Kiểm tra lỗi cú pháp cơ bản
                execSync(`php -l ${file}`, { stdio: 'ignore' });
            } catch (e) {
                issues.push({
                    rule: 'PHP Syntax',
                    error: `Lỗi cú pháp tại file ${file}. Hãy kiểm tra lại code.`,
                    severity: 'error'
                });
            }
        }

        if (issues.length > 0) {
            return { valid: false, issues };
        }

        return { valid: true };
    }
}

module.exports = PSRStandardRule;
