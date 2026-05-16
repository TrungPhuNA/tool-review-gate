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
                
                // 1. Danh sách class đã import và trạng thái sử dụng
                const imports = []; // [{ className, fullClass, line, used: false }]
                lines.forEach((line, index) => {
                    const trimLine = line.trim();
                    if (trimLine.startsWith('use ') && !trimLine.includes('(')) {
                        const parts = trimLine.split(' ');
                        if (parts.length >= 2) {
                            const fullClass = parts[1].replace(';', '');
                            const className = fullClass.split('\\').pop();
                            imports.push({ className, fullClass, line: index + 1, used: false });
                        }
                    }
                });

                // 2. Tìm các biến được khai báo (VD: $phone = ...)
                const variables = []; // [{ name, line, used: false }]
                lines.forEach((line, index) => {
                    const varMatch = line.match(/\$([a-zA-Z0-9_]+)\s*=/);
                    if (varMatch && !line.includes('public') && !line.includes('protected') && !line.includes('private')) {
                        variables.push({ name: varMatch[1], line: index + 1, used: false });
                    }
                });

                // 3. Quét toàn bộ nội dung để check xem Class/Biến có được dùng không
                const fullContent = content;
                
                // Check Class usage
                imports.forEach(imp => {
                    // Tìm className trong code (loại trừ chính dòng khai báo 'use')
                    const regex = new RegExp(`\\b${imp.className}\\b`, 'g');
                    const matches = fullContent.match(regex);
                    if (matches && matches.length > 1) { // Lớn hơn 1 vì có 1 lần ở dòng 'use'
                        imp.used = true;
                    }
                });

                // Check Variable usage
                variables.forEach(v => {
                    // 1. Tìm kiểu biến thông thường: $logs
                    const varRegex = new RegExp(`\\$${v.name}\\b`, 'g');
                    // 2. Tìm kiểu trong hàm compact: compact('logs') hoặc compact("logs")
                    const compactRegex = new RegExp(`compact\\s*\\(.*?['"]${v.name}['"].*?\\)`, 'g');
                    
                    const hasVarMatch = (fullContent.match(varRegex) || []).length > 1;
                    const hasCompactMatch = compactRegex.test(fullContent);
                    
                    if (hasVarMatch || hasCompactMatch) {
                        v.used = true;
                    }
                });

                // 4. Tổng hợp lỗi
                imports.forEach(imp => {
                    if (!imp.used) {
                        issues.push({
                            rule: 'Unused Import',
                            error: `${path.basename(file)}:${imp.line} - Namespace "${imp.fullClass}" được khai báo nhưng không sử dụng.`,
                            severity: 'warning'
                        });
                    }
                });

                variables.forEach(v => {
                    if (!v.used) {
                        issues.push({
                            rule: 'Unused Variable',
                            error: `${path.basename(file)}:${v.line} - Biến "$${v.name}" được khai báo nhưng không sử dụng.`,
                            severity: 'warning'
                        });
                    }
                });

                // 5. Quét lỗi Namespace Check (Class chưa import)
                lines.forEach((line, index) => {
                    const match = line.match(/([A-Z][a-zA-Z0-9]+)::/);
                    if (match) {
                        const className = match[1];
                        const systemGlobals = ['Route', 'Log', 'Config', 'DB', 'Auth', 'Request', 'Response', 'Str', 'Arr', 'Http'];
                        const isImported = imports.some(imp => imp.className === className);
                        const isSameDir = fs.existsSync(path.join(path.dirname(absolutePath), `${className}.php`));

                        if (!systemGlobals.includes(className) && !isImported && !isSameDir) {
                            issues.push({
                                rule: 'Namespace Check',
                                error: `${path.basename(file)}:${index + 1} - Class "${className}" chưa được import (use).`,
                                severity: 'error'
                            });
                        }
                    }
                });
            } catch (err) {}
        });

        return issues.length > 0 ? { valid: false, issues } : { valid: true };
    }
}

module.exports = PHPStanCheckRule;
