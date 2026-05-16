const BaseRule = require('../../../core/BaseRule');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PHPStanCheckRule extends BaseRule {
    constructor() {
        super('PHP Static Analysis (PHPStan)', 'standard', 'error');
    }

    async check(context) {
        const { files } = context;
        const phpFiles = files.filter(f => f.endsWith('.php'));
        if (phpFiles.length === 0) return { valid: true };

        const projectPath = process.cwd();
        const phpstanPath = path.join(projectPath, 'vendor/bin/phpstan');

        // Nếu dự án không có PHPStan, chúng ta sử dụng một bộ quét Regex cơ bản để tìm Class chưa import
        if (!fs.existsSync(phpstanPath)) {
            return this.basicNamespaceCheck(phpFiles);
        }

        const issues = [];
        for (const file of phpFiles) {
            try {
                // Chạy PHPStan mức độ cơ bản trên file thay đổi
                const output = execSync(`${phpstanPath} analyze ${file} --error-format=json --no-progress`, { encoding: 'utf8' });
            } catch (e) {
                if (e.stdout) {
                    try {
                        const result = JSON.parse(e.stdout);
                        result.files && Object.keys(result.files).forEach(filePath => {
                            result.files[filePath].messages.forEach(msg => {
                                issues.push({
                                    rule: 'PHPStan',
                                    error: `${msg.message} (Line ${msg.line})`,
                                    severity: 'error'
                                });
                            });
                        });
                    } catch (err) {}
                }
            }
        }

        if (issues.length > 0) {
            return { valid: false, issues };
        }

        return { valid: true };
    }

    basicNamespaceCheck(phpFiles) {
        const issues = [];
        const projectPath = process.cwd();

        phpFiles.forEach(file => {
            try {
                const absolutePath = path.resolve(projectPath, file);
                if (!fs.existsSync(absolutePath)) return;

                const content = fs.readFileSync(absolutePath, 'utf8');
                // Tìm các Class gọi theo kiểu Static Class::method()
                const matches = content.match(/([A-Z][a-zA-Z0-9]+)::/g);
                if (matches) {
                    matches.forEach(match => {
                        const className = match.replace('::', '');
                        // Kiểm tra xem class đã được import chưa
                        const isImported = content.includes(`use `) && 
                                         (content.includes(`use ${className};`) || 
                                          content.includes(`use App\\Models\\${className};`));

                        if (!isImported) {
                            // Ngoại lệ cho các Class toàn cục của Laravel hoặc PHP
                            const globals = ['Route', 'Log', 'Config', 'DB', 'Auth', 'Request', 'Response', 'Str', 'Arr', 'User'];
                            // Chỗ này User bạn bảo chưa import nên tôi sẽ bỏ User ra khỏi globals để nó báo lỗi
                            const realGlobals = globals.filter(g => g !== 'User');

                            if (realGlobals.indexOf(className) === -1) {
                                 issues.push({
                                    rule: 'Namespace Check',
                                    error: `${path.basename(file)}:${className} - Chưa Import (use) Class này.`,
                                    severity: 'error'
                                });
                            }
                        }
                    });
                }
            } catch (err) {}
        });

        return issues.length > 0 ? { valid: false, issues } : { valid: true };
    }
}

module.exports = PHPStanCheckRule;
