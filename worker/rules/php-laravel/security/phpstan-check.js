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
                const lines = content.split('\n');
                
                // Danh sách class đã import
                const importedClasses = new Set();
                lines.forEach(line => {
                    const trimLine = line.trim();
                    if (trimLine.startsWith('use ') && !trimLine.includes('(')) {
                        const parts = trimLine.split(' ');
                        if (parts.length >= 2) {
                            const fullClass = parts[1].replace(';', '');
                            const className = fullClass.split('\\').pop();
                            importedClasses.add(className);
                            importedClasses.add(fullClass);
                        }
                    }
                });

                // Quét từng dòng để tìm việc gọi Class::method
                lines.forEach((line, index) => {
                    const match = line.match(/([A-Z][a-zA-Z0-9]+)::/);
                    if (match) {
                        const className = match[1];
                        
                        if (className === 'User') {
                            const isImported = importedClasses.has('User') || importedClasses.has('App\\Models\\User');
                            if (!isImported) {
                                console.log(`   [Debug] Found ${className}:: at line ${index + 1} in ${path.basename(file)} (Not Imported!)`.red);
                                issues.push({
                                    rule: 'Namespace Check',
                                    error: `${path.basename(file)}:${index + 1} - Class "${className}" chưa được import (use).`,
                                    severity: 'error'
                                });
                            }
                        } else {
                            const systemGlobals = ['Route', 'Log', 'Config', 'DB', 'Auth', 'Request', 'Response', 'Str', 'Arr', 'Http'];
                            if (!systemGlobals.includes(className) && !importedClasses.has(className)) {
                                issues.push({
                                    rule: 'Namespace Check',
                                    error: `${path.basename(file)}:${index + 1} - Class "${className}" chưa được import (use).`,
                                    severity: 'error'
                                });
                            }
                        }
                    }
                });
            } catch (err) {}
        });

        return issues.length > 0 ? { valid: false, issues } : { valid: true };
    }
}

module.exports = PHPStanCheckRule;
