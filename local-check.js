#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ReviewEngine = require(path.join(__dirname, 'worker/core/engine'));

const { execSync } = require('child_process');

require('colors');

/**
 * Script này hỗ trợ 3 chế độ:
 * 1. Chạy qua Git Hook: node local-check.js .git/COMMIT_EDITMSG
 * 2. Chạy trực tiếp (CLI): node local-check.js
 * 3. Cài đặt Hook cho project mới: review-check init
 */
async function main() {
    const args = process.argv.slice(2);
    
    // Tính năng cài đặt Hook tự động
    if (args[0] === 'init') {
        console.log(`\n🛠️  Đang thiết lập ReviewGate Hook cho dự án này...`.bold.cyan);
        
        let gitRoot;
        try {
            gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
        } catch (e) {
            console.error('❌ Lỗi: Thư mục này không nằm trong một Git repository.'.red);
            process.exit(1);
        }

        const hooksDir = path.join(gitRoot, '.git', 'hooks');
        const preCommitPath = path.join(hooksDir, 'pre-commit');
        // Script hook sẽ gọi lệnh review-check toàn cục
        const hookContent = `#!/bin/sh\nreview-check\n`;
        
        fs.writeFileSync(preCommitPath, hookContent, { mode: 0o755 });
        console.log(`✅ Đã cài đặt pre-commit hook thành công!`.green);
        console.log(`🚀 Từ giờ, mỗi khi bạn 'git commit', hệ thống sẽ tự động quét code.\n`.italic);
        process.exit(0);
    }

    let message = '';
    const commitMsgFile = args[0];

    if (commitMsgFile) {
        message = fs.readFileSync(commitMsgFile, 'utf8').trim();
    } else {
        try {
            // Khi chạy CLI thủ công, chúng ta lấy message của commit cuối để tham khảo 
            // hoặc bỏ qua rule message nếu chưa có commit.
            message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
            console.log(`🔍 [ReviewGate] Đang quét các file bạn đã 'git add'...`.bold.cyan);
        } catch (e) {
            message = 'Manual Review';
        }
    }

    // Lấy danh sách các file đã thay đổi (bao gồm cả đã add và chưa add)
    let files = [];
    try {
        // Quét tất cả các file có thay đổi so với commit gần nhất
        const diffCommand = 'git diff HEAD --name-only';
        const filesOutput = execSync(diffCommand, { encoding: 'utf8' }).trim();
        files = filesOutput ? filesOutput.split('\n') : [];

        if (files.length === 0) {
            console.log(`ℹ️  Không tìm thấy thay đổi nào so với commit cuối.`.italic.muted);
        } else {
            console.log(`📝 Phát hiện ${files.length} file có thay đổi...`.italic);
        }
    } catch (e) {
        console.warn('⚠️ Cảnh báo: Không thể lấy danh sách file thay đổi.');
    }

    console.log(`\n🔍 [ReviewGate Local] Đang chạy kiểm tra toàn diện (${files.length} files)...`);

    // Thực hiện review với context đầy đủ
    const result = await ReviewEngine.runReview(process.cwd(), { 
        message,
        files 
    });

    // Hiển thị bảng tổng hợp kết quả (Show cho hết)
    console.log(`\n📊  REVIEW SUMMARY:`.bold);
    result.reports.forEach(report => {
        const status = report.valid ? '✅ PASSED'.green : '❌ FAILED'.red;
        const severity = report.severity === 'error' ? '[ERROR]'.red : '[WARN] '.yellow;
        console.log(`   ${severity} ${report.rule.padEnd(35)} : ${status}`);
    });

    // Gửi kết quả lên Dashboard API để lưu lịch sử
    try {
        const axios = require('axios');
        await axios.post('http://localhost:3000/api/reviews/local', {
            repo: path.basename(process.cwd()),
            commitHash: execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim(),
            author: execSync('git config user.name', { encoding: 'utf8' }).trim(),
            message,
            status: result.valid ? 'accepted' : 'rejected',
            projectType: result.projectType,
            details: result
        });
    } catch (e) {
        console.warn('⚠️  Cảnh báo: Không thể kết nối tới Dashboard API. Dữ liệu sẽ không được lưu vào lịch sử.'.yellow);
    }

    if (!result.valid) {
        console.log(`\n-------------------------------------------------------`);
        console.log(`❌  COMMIT REJECTED - [${result.projectType.toUpperCase()}]`.red.bold);
        
        Object.keys(result.groups).forEach(groupName => {
            const group = result.groups[groupName];
            if (!group.valid) {
                console.log(`\n📌  Phát hiện lỗi tại nhóm: ${groupName.toUpperCase().red}`);
                group.issues.forEach(issue => {
                    console.log(`   - ${issue.rule.bold}: ${issue.error}`);
                });
            }
        });
        
        console.log(`\n-------------------------------------------------------`);
        console.log(`💡  Gợi ý: Hãy sửa các lỗi trên trước khi commit lại.\n`);
        
        process.exit(1);
    }

    console.log(`\n✅  Review hoàn tất! (${result.summary.passed}/${result.summary.total} rules passed).`.green.bold);
    console.log(`🚀  Đang tạo commit...\n`);
    process.exit(0);
}

main();
