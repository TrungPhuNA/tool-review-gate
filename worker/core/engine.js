const ProjectDetector = require('./ProjectDetector');
const RuleLoader = require('./RuleLoader');
const cliProgress = require('cli-progress');
require('colors');

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
        console.log(`\n🔍 [Engine] Detecting project type: ${projectType.toUpperCase().cyan.bold}`);

        // 2. Nạp danh sách Rule phù hợp (bao gồm cả nạp chồng nếu là Hybrid project)
        const rules = RuleLoader.getRules(projectType, projectPath);
        console.log(`📦 [Engine] Loaded ${rules.length.toString().yellow} rules for this session.\n`);

        const finalResult = {
            valid: true,
            projectType: projectType,
            summary: { total: rules.length, passed: 0, failed: 0 },
            groups: {},
            reports: []
        };

        // Khởi tạo Progress Bar
        const isTTY = process.stdout.isTTY;
        const progressBar = isTTY ? new cliProgress.SingleBar({
            format: '🛡️  Reviewing |' + '{bar}'.cyan + '| {percentage}% || {value}/{total} Rules || {ruleName}',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        }) : null;

        if (progressBar) progressBar.start(rules.length, 0, { ruleName: 'Initializing...' });

        // 3. Thực thi từng Rule
        for (const rule of rules) {
            try {
                if (progressBar) progressBar.update({ ruleName: `Checking ${rule.name}...`.italic });

                const result = await rule.check(context);
                
                if (!finalResult.groups[rule.group]) {
                    finalResult.groups[rule.group] = { valid: true, issues: [] };
                }

                const report = { rule: rule.name, severity: rule.severity, ...result };
                finalResult.reports.push(report);

                if (!result.valid) {
                    finalResult.summary.failed++;
                    finalResult.groups[rule.group].issues.push(report);
                    if (rule.severity === 'error') {
                        finalResult.valid = false;
                        finalResult.groups[rule.group].valid = false;
                    }
                } else {
                    finalResult.summary.passed++;
                }

                // Log chi tiết từng rule nếu không phải chế độ TTY hoặc muốn show rõ
                if (!isTTY) {
                    const status = result.valid ? '✅ PASSED'.green : '❌ FAILED'.red;
                    console.log(`   - ${rule.name.padEnd(30)}: ${status}`);
                }

                if (progressBar) progressBar.increment();
            } catch (e) {
                if (progressBar) progressBar.stop();
                console.error(`❌ Lỗi khi chạy rule "${rule.name}":`, e.message);
            }
        }

        if (progressBar) {
            progressBar.update({ ruleName: 'Completed!'.green.bold });
            progressBar.stop();
        }

        return finalResult;
    }
}

module.exports = ReviewEngine;
