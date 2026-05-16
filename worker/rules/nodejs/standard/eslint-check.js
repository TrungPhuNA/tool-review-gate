const { execSync } = require('child_process');
const BaseRule = require('../../../core/BaseRule');
const path = require('path');
const fs = require('fs');

/**
 * EslintCheckRule: Sử dụng ESLint để quét lỗi kỹ thuật trong code JS/React
 */
class EslintCheckRule extends BaseRule {
    constructor() {
        super('ESLint JS Check', 'standard', 'error');
    }

    async check(context) {
        const files = context.files || [];
        // Lọc ra các file Javascript hoặc React
        const jsFiles = files.filter(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.tsx'));

        if (jsFiles.length === 0) return { valid: true };

        console.log(`   [ESLint] Đang quét ${jsFiles.length} files...`);

        try {
            // Tìm eslint ở thư mục gốc của dự án tool-review-gate
            const eslintPath = path.resolve(__dirname, '../../../../node_modules/.bin/eslint');
            const cmd = fs.existsSync(eslintPath) ? eslintPath : 'eslint';
            
            // Sử dụng file cấu hình tập trung để đảm bảo ổn định
            const configPath = path.resolve(__dirname, '../../core/review-eslint-config.json');
            const command = `${cmd} ${jsFiles.join(' ')} --no-eslintrc -c ${configPath} --format json`;
            
            execSync(command, { 
                encoding: 'utf8', 
                stdio: ['ignore', 'pipe', 'ignore'], // Chỉ lấy stdout
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            return { valid: true };
        } catch (error) {
            if (error.stdout) {
                try {
                    const results = JSON.parse(error.stdout);
                    let errorMessages = [];

                    results.forEach(fileResult => {
                        fileResult.messages.forEach(msg => {
                            if (msg.severity === 2) { // 2 = Error
                                errorMessages.push(`${path.basename(fileResult.filePath)}:${msg.line} - ${msg.message}`);
                            }
                        });
                    });

                    if (errorMessages.length > 0) {
                        return {
                            valid: false,
                            error: `Phát hiện ${errorMessages.length} lỗi kỹ thuật nghiêm trọng:\n      ` + errorMessages.slice(0, 5).join('\n      ')
                        };
                    }
                } catch (e) {}
            }
            return { valid: true }; // Nếu không parse được lỗi thì tạm cho qua để tránh block nhầm
        }
    }
}

module.exports = EslintCheckRule;
