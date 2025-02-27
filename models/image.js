const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const Product = require('./product');

// Tạo model Image
const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
    primaryKey: true
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  productId: {
    type: DataTypes.UUID,
    references: {
      model: Product,
      key: 'id',
    },
  },
}, {
  timestamps: true,
});

// Khóa ngoại để liên kết với Product
Product.hasMany(Image, { foreignKey: 'productId', as: 'images' });
Image.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Image;
