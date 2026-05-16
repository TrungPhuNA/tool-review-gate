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
        const path = require('path');
        const fs = require('fs');
        const projectPath = process.cwd();
        const issues = [];

        for (const file of phpFiles) {
            try {
                const absolutePath = path.resolve(projectPath, file);
                if (!fs.existsSync(absolutePath)) continue;

                // Kiểm tra lỗi cú pháp cơ bản và lấy output chi tiết
                execSync(`php -l ${absolutePath}`, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
            } catch (e) {
                const detailedError = e.stdout ? e.stdout.trim().split('\n')[0] : 'Lỗi cú pháp không xác định';
                issues.push({
                    rule: 'PHP Syntax',
                    error: `${path.basename(file)} - ${detailedError}`,
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
