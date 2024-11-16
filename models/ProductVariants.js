
const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const ProductVariants = sequelize.define('ProductVariants', {
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
