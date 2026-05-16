const BaseRule = require('../../core/BaseRule');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * AIReviewRule: Sử dụng Gemini AI để phân tích sâu logic code
 */
class AIReviewRule extends BaseRule {
    constructor() {
        super('AI Intelligence Review', 'intelligence', 'warning');
        this.apiKey = process.env.GEMINI_API_KEY;
    }

    async check(context) {
        if (!this.apiKey) {
            return { 
                valid: true, 
                error: 'Bỏ qua AI Review vì chưa cấu hình GEMINI_API_KEY trong file .env' 
            };
        }

        const { files } = context;
        if (files.length === 0) return { valid: true };

        try {
            // 1. Lấy nội dung diff thực tế của các file đang sửa
            const diff = execSync('git diff HEAD -- .', { encoding: 'utf8' });
            if (!diff || diff.length < 10) return { valid: true };

            // 2. Khởi tạo Gemini
            const genAI = new GoogleGenerativeAI(this.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are a Senior Fullstack Developer and Security Expert.
                Review the following git diff and identify:
                1. Critical logic errors or potential bugs.
                2. Security vulnerabilities (SQL Injection, XSS, Hardcoded Secrets).
                3. Performance bottlenecks.
                
                Keep your response extremely concise (max 3-5 bullet points).
                If everything looks good, just respond with "PASSED".
                Use Vietnamese for the review comments.
                
                GIT DIFF:
                ${diff.substring(0, 15000)} // Giới hạn 15k ký tự để tránh quá tải
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text.includes('PASSED') && text.length < 20) {
                return { valid: true };
            }

            return {
                valid: false,
                error: `AI Nhận xét:\n      ${text.trim().replace(/\n/g, '\n      ')}`
            };

        } catch (error) {
            return { 
                valid: true, 
                error: `AI Review tạm thời không khả dụng: ${error.message}` 
            };
        }
    }
}

module.exports = AIReviewRule;
