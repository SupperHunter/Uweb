const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../Connect/dbConnect');
const OrderDetail = require('./OrderDetail');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Tạo UUID tự động
        primaryKey: true
      },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    StackingID: {
        type: DataTypes.STRING
    },
    TrackLinkItem: {
        type: DataTypes.STRING
    },
    Name: {
        type: DataTypes.STRING,
    },
    Email: {
        type: DataTypes.STRING
    },
    AddressOrderShip: {
        type: DataTypes.STRING,
        defaultValue: '567 Cherry Lane Apt B12,Harrisburg'
    },
    totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    cardNumberpurchase: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Placed', 'Preparing', 'On the way', 'Delivered', 'Cancel'),
        allowNull: false,
        defaultValue: 'Placed', // Example: pending, completed, cancelled
    },
    userId: {
        type: DataTypes.INTEGER, // Assuming you have a User table
        allowNull: false,
    },
}, {
    timestamps: true,
});
Order.hasMany(OrderDetail, { foreignKey: 'orderId', as: 'orderDetails' });
module.exports = Order;
