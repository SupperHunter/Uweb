const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');

// Định nghĩa mô hình Payment
const PaymentInfor = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
    primaryKey: true
  },
  cardholderName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  zipCode: {
    type: DataTypes.STRING,
  },
  cardNumber: {
    type: DataTypes.STRING,
  },
  expiry: {
    type: DataTypes.STRING,
  },
  cvv: {
    type: DataTypes.STRING,
  },
  options: {
    type: DataTypes.STRING,
  }
}, {
  timestamps: true, // Tạo các trường createdAt và updatedAt
  tableName: 'payments' // Tên bảng trong cơ sở dữ liệu
});

module.exports = PaymentInfor;
