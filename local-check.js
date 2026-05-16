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
            // Khi chạy CLI thủ công, chúng ta bỏ qua kiểm tra message
            message = 'SKIP_CHECK';
            console.log(`🔍 [ReviewGate] Đang quét các file bạn đang sửa...`.bold.cyan);
        } catch (e) {
            message = 'SKIP_CHECK';
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

    // Kiểm tra xem có bất kỳ lỗi hoặc cảnh báo nào không
    const hasIssues = Object.values(result.groups).some(g => g.issues.length > 0);

    if (hasIssues) {
        console.log(`\n-------------------------------------------------------`);
        const statusText = result.valid ? '✅ COMMIT ALLOWED (WITH WARNINGS)'.yellow.bold : '❌ COMMIT REJECTED'.red.bold;
        console.log(statusText + ` - [${result.projectType.toUpperCase()}]`);
        
        Object.keys(result.groups).forEach(groupName => {
            const group = result.groups[groupName];
            if (group.issues.length > 0) {
                const groupLabel = group.valid ? groupName.toUpperCase().yellow : groupName.toUpperCase().red;
                console.log(`\n📌  Phát hiện vấn đề tại nhóm: ${groupLabel}`);
                group.issues.forEach(report => {
                    const icon = report.severity === 'error' ? '✘'.red : '⚠'.yellow;
                    
                    if (report.issues && report.issues.length > 0) {
                        // Trường hợp Rule trả về danh sách nhiều lỗi
                        report.issues.forEach(subIssue => {
                            const subIcon = subIssue.severity === 'error' ? '✘'.red : '⚠'.yellow;
                            console.log(`   ${subIcon} ${report.rule.bold}: ${subIssue.error}`);
                        });
                    } else if (report.error) {
                        // Trường hợp Rule trả về 1 lỗi duy nhất
                        console.log(`   ${icon} ${report.rule.bold}: ${report.error}`);
                    }
                });
            }
        });
        
        console.log(`\n-------------------------------------------------------`);
        if (!result.valid) {
            console.log(`💡  Gợi ý: Hãy sửa các lỗi [ERROR] trên trước khi commit lại.\n`);
            process.exit(1);
        } else {
            console.log(`💡  Gợi ý: Bạn nên sửa các cảnh báo [WARN] trên để code sạch hơn.\n`);
        }
    }

    console.log(`\n✅  Review hoàn tất! (${result.summary.passed}/${result.summary.total} rules passed).`.green.bold);
    console.log(`🚀  Đang tạo commit...\n`);
    process.exit(0);
}

main();
