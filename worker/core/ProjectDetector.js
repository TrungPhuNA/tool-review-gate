const fs = require('fs');
const path = require('path');

/**
 * ProjectDetector: Tự động nhận diện loại dự án dựa trên các file đặc trưng
 */
class ProjectDetector {
    /**
     * @param {string} projectPath - Đường dẫn gốc của project cần check
     * @returns {string} - 'php-laravel', 'nodejs', 'reactjs' hoặc 'unknown'
     */
    static detect(projectPath) {
        const indicators = {
            'php-laravel': ['artisan', 'composer.json'],
            'reactjs': ['src/App.js', 'src/App.tsx', 'vite.config.js', 'create-react-app'],
            'nodejs': ['package.json']
        };

        // Ưu tiên check Laravel trước tiên
        if (indicators['php-laravel'].some(file => fs.existsSync(path.join(projectPath, file)))) {
            return 'php-laravel';
        }

        // Check React tiếp theo
        if (indicators['reactjs'].some(file => fs.existsSync(path.join(projectPath, file)))) {
            return 'reactjs';
        }

        // Cuối cùng mới là Node
        if (indicators['nodejs'].some(file => fs.existsSync(path.join(projectPath, file)))) {
            return 'nodejs';
        }

        return 'unknown';
    }
}

module.exports = ProjectDetector;
