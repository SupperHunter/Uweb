const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const Product = require('./product');

// Tạo model Image
const Image = sequelize.define('Image', {
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
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
