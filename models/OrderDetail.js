const { DataTypes } = require('sequelize');
const sequelize = require('../Connect/dbConnect');
const Product = require('./product');
const Order = require('./Order');

// Define the OrderDetail model
const OrderDetail = sequelize.define('OrderDetail', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    priceAtPurchase: {
        type: DataTypes.FLOAT,
        allowNull: false, // Store the product price at the time of purchase
    },
}, {
    timestamps: true,
});
OrderDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
module.exports = OrderDetail;
