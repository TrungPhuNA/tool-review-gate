#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ReviewEngine = require(path.join(__dirname, 'worker/core/engine'));

const { execSync } = require('child_process');

/**
 * Script này hỗ trợ 2 chế độ:
 * 1. Chạy qua Git Hook: node local-check.js .git/COMMIT_EDITMSG
 * 2. Chạy trực tiếp (CLI): node local-check.js
 */
async function main() {
    let message = '';
    const commitMsgFile = process.argv[2];

    if (commitMsgFile) {
        message = fs.readFileSync(commitMsgFile, 'utf8').trim();
    } else {
        try {
            message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
            console.log(`📦 Đang kiểm tra commit cuối cùng...`);
        } catch (e) {
            console.error('❌ Lỗi: Thư mục này không phải là một Git repository.');
            process.exit(1);
        }
    }

    console.log(`\n🔍 [ReviewGate Local] Đang chạy kiểm tra toàn diện...`);

    // Thực hiện review với context mở rộng (sau này có thể thêm danh sách files)
    const result = await ReviewEngine.runReview(process.cwd(), { 
        message,
        files: [] // Tạm thời để trống, có thể lấy bằng lệnh git diff
    });

    if (!result.valid) {
        console.log(`\n-------------------------------------------------------`);
        console.log(`❌ COMMIT BỊ CHẶN (REJECTED) - [${result.projectType.toUpperCase()}]`);
        
        // Hiển thị lỗi theo từng nhóm
        Object.keys(result.groups).forEach(groupName => {
            const group = result.groups[groupName];
            if (!group.valid) {
                console.log(`\n📌 Nhóm: ${groupName.toUpperCase()}`);
                group.issues.forEach(issue => {
                    console.log(`   - ${issue.rule}: ${issue.error}`);
                });
            }
        });
        
        console.log(`\n-------------------------------------------------------`);
        console.log(`💡 Gợi ý: Hãy sửa các lỗi trên trước khi commit lại.\n`);
        
        process.exit(1);
    }

    console.log(`\n✅ Review thành công (${result.summary.passed}/${result.summary.total} rules). Đang tạo commit...\n`);
    process.exit(0);
}

main();
