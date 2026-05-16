const path = require('path');
const fs = require('fs');

/**
 * RuleLoader: Tự động nạp các Rule dựa trên loại Project
 */
class RuleLoader {
    /**
     * @param {string} projectType - 'php-laravel', 'nodejs', etc.
     * @returns {BaseRule[]} - Danh sách các instance của Rule
     */
    static getRules(projectType, projectPath) {
        const rules = [];
        const rulesBaseDir = path.join(__dirname, '../rules');

        // 1. Luôn nạp các Rule chung (Common)
        const commonDir = path.join(rulesBaseDir, 'common');
        rules.push(...this.loadRecursively(commonDir));

        // 2. Nạp các Rule riêng cho ngôn ngữ (nếu có)
        if (projectType && projectType !== 'unknown') {
            const langDir = path.join(rulesBaseDir, projectType);
            rules.push(...this.loadRecursively(langDir));
        }

        // 3. ĐẶC BIỆT: Nếu là Laravel mà có ReactJS, nạp thêm bộ rule ReactJS
        if (projectType === 'php-laravel' && projectPath) {
            const hasReact = ['src/App.js', 'src/App.tsx', 'vite.config.js', 'package.json'].some(f => fs.existsSync(path.join(projectPath, f)));
            if (hasReact) {
                const reactDir = path.join(rulesBaseDir, 'reactjs');
                rules.push(...this.loadRecursively(reactDir));
            }
        }

        return rules;
    }

    /**
     * Quét thư mục và nạp tất cả file .js
     */
    static loadRecursively(dir) {
        let results = [];
        if (!fs.existsSync(dir)) return results;

        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat && stat.isDirectory()) {
                results = results.concat(this.loadRecursively(fullPath));
            } else if (file.endsWith('.js')) {
                try {
                    const RuleClass = require(fullPath);
                    // Khởi tạo instance của Rule
                    results.push(new RuleClass());
                } catch (e) {
                    console.error(`❌ Không thể nạp rule tại ${fullPath}:`, e.message);
                }
            }
        });

        return results;
    }
}

module.exports = RuleLoader;
