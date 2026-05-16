/**
 * BaseRule: Lớp cơ sở cho mọi Rule trong hệ thống Review Gate
 */
class BaseRule {
    /**
     * @param {string} name - Tên của rule (ví dụ: Commit Message Format)
     * @param {string} group - Nhóm của rule (ví dụ: security, styling, standard)
     * @param {string} severity - Mức độ (error, warning)
     */
    constructor(name, group, severity = 'error') {
        this.name = name;
        this.group = group;
        this.severity = severity;
    }

    /**
     * Hàm thực thi kiểm tra logic
     * @param {object} context - Chứa dữ liệu cần check (message, files, diff...)
     * @returns {Promise<{valid: boolean, error?: string}>}
     */
    async check(context) {
        throw new Error('Hàm check() phải được triển khai trong lớp con');
    }
}

module.exports = BaseRule;
