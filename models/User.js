  const { DataTypes } = require('sequelize');
  const sequelize = require('../Connect/dbConnect');
  const Role = require('./Role'); // Import the Role model
  const Address = require('./Address');
  const PaymentInfor = require('./PaymentInfor');
  const BannerTille = require('./BannerTille');
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetCode: { type: DataTypes.STRING },
    resetCodeExpires: { type: DataTypes.DATE },
    blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: true // Mặc định không bị chặn 
    },
  }, {
    tableName: 'users',
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt'
  });
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
  User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
  User.hasMany(PaymentInfor, { foreignKey: 'userId', as: 'payments' });
  module.exports = User;
