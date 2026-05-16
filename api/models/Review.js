const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Khởi tạo kết nối: Ưu tiên MySQL nếu có cấu hình trong .env, nếu không dùng SQLite
const sequelize = process.env.DB_NAME
  ? new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      host: process.env.DB_HOST || '127.0.0.1',
      dialect: 'mysql',
      logging: false,
      port: process.env.DB_PORT || 3306
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../data/database.sqlite'),
      logging: false
    });

/**
 * Review Model: Lưu trữ kết quả kiểm tra của từng commit
 */
const Review = sequelize.define('Review', {
  repo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commitHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING, // 'accepted', 'rejected', 'pending'
    defaultValue: 'pending'
  },
  projectType: {
    type: DataTypes.STRING
  },
  details: {
    type: DataTypes.JSON // Lưu trữ chi tiết các lỗi (JSON)
  }
});

// Tự động tạo bảng nếu chưa có
sequelize.sync();

module.exports = Review;
