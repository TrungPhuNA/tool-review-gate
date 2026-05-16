const ProjectDetector = require('./ProjectDetector');
const RuleLoader = require('./RuleLoader');

/**
 * ReviewEngine: Bộ máy điều phối kiểm tra code chính
 */
class ReviewEngine {
    /**
     * Chạy toàn bộ quy trình review
     * @param {string} projectPath - Đường dẫn project
     * @param {object} context - Dữ liệu đầu vào (message, files, author...)
     */
    static async runReview(projectPath, context) {
        // 1. Nhận diện loại Project
        const projectType = ProjectDetector.detect(projectPath);
        console.log(`\n🔍 [Engine] Detecting project type: ${projectType.toUpperCase()}`);

        // 2. Nạp danh sách Rule phù hợp
        const rules = RuleLoader.getRules(projectType);
        console.log(`📦 [Engine] Loaded ${rules.length} rules for this session.`);

        const finalResult = {
            valid: true,
            projectType: projectType,
            summary: {
                total: rules.length,
                passed: 0,
                failed: 0
            },
            groups: {}, // Phân nhóm kết quả (security, styling, etc.)
            reports: []
        };

        // 3. Thực thi từng Rule
        for (const rule of rules) {
            try {
                const result = await rule.check(context);
                
                // Khởi tạo nhóm nếu chưa có
                if (!finalResult.groups[rule.group]) {
                    finalResult.groups[rule.group] = { valid: true, issues: [] };
                }

                const report = {
                    rule: rule.name,
                    severity: rule.severity,
                    ...result
                };

                finalResult.reports.push(report);

                if (!result.valid) {
                    finalResult.summary.failed++;
                    finalResult.groups[rule.group].issues.push(report);
                    
                    // Nếu có lỗi nghiêm trọng (error), đánh dấu tổng thể là thất bại
                    if (rule.severity === 'error') {
                        finalResult.valid = false;
                        finalResult.groups[rule.group].valid = false;
                    }
                } else {
                    finalResult.summary.passed++;
                }
            } catch (e) {
                console.error(`❌ Lỗi khi chạy rule "${rule.name}":`, e.message);
            }
        }

        return finalResult;
    }
}

module.exports = ReviewEngine;
