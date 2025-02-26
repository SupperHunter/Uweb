
const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const ProductVariants = sequelize.define('ProductVariants', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
        primaryKey: true
      },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true, // Variant-specific price
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: true, // Variant-specific stock
    }
}, {
    timestamps: false,
});

module.exports = ProductVariants;
